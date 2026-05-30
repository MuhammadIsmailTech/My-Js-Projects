/* ──────────────────────────────────────
   State
────────────────────────────────────── */
let apiKey = localStorage.getItem('gemini_api_key') || '';
let conversations = JSON.parse(localStorage.getItem('gemini_conversations') || '[]');
let activeConvIdx = conversations.length > 0 ? 0 : -1;
let isGenerating = false;
const MODEL = 'gemini-2.0-flash';
const SYSTEM_PROMPT = 'You are a helpful, knowledgeable AI assistant. Use markdown formatting in your responses. When showing code, always specify the programming language in the code block (e.g., ```python). Be concise, accurate, and well-organized. Use headers, lists, and code blocks to structure your answers.';

/* ──────────────────────────────────────
   DOM References
────────────────────────────────────── */
const $ = id => document.getElementById(id);
const sidebar = $('sidebar');
const sidebarOverlay = $('sidebarOverlay');
const chatList = $('chatList');
const messagesWrap = $('messagesWrap');
const welcomeScreen = $('welcomeScreen');
const messageInput = $('messageInput');
const sendBtn = $('sendBtn');
const emojiBtn = $('emojiBtn');
const emojiPicker = $('emojiPicker');
const emojiTabs = $('emojiTabs');
const emojiGrid = $('emojiGrid');
const apiKeyInput = $('apiKeyInput');
const apiKeyToggle = $('apiKeyToggle');
const apiStatus = $('apiStatus');
const headerSub = $('headerSub');
const themeGrid = $('themeGrid');
const suggestions = $('suggestions');

/* ──────────────────────────────────────
   Marked Configuration
────────────────────────────────────── */
const renderer = new marked.Renderer();
renderer.code = function(code, language) {
  const lang = (language || '').trim();
  let highlighted;
  try {
    if (lang && hljs.getLanguage(lang)) {
      highlighted = hljs.highlight(code, { language: lang }).value;
    } else {
      highlighted = hljs.highlightAuto(code).value;
    }
  } catch (e) {
    highlighted = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  const id = 'cb-' + Math.random().toString(36).substr(2, 9);
  return `<div class="code-block" id="${id}">
    <div class="code-header">
      <span class="code-lang">${lang || 'code'}</span>
      <button class="copy-btn" onclick="copyCodeBlock('${id}')">
        <i class="fas fa-copy"></i> Copy
      </button>
    </div>
    <pre><code class="hljs language-${lang}">${highlighted}</code></pre>
  </div>`;
};
renderer.codespan = function(code) {
  return `<code class="inline-code">${code}</code>`;
};
marked.setOptions({ renderer, breaks: true, gfm: true });

function renderMarkdown(text) {
  try { return marked.parse(text); }
  catch { return text.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>'); }
}

/* ──────────────────────────────────────
   Theme Management
────────────────────────────────────── */
function setTheme(name) {
  document.documentElement.setAttribute('data-theme', name);
  localStorage.setItem('gemini_theme', name);
  themeGrid.querySelectorAll('.theme-dot').forEach(d => {
    d.classList.toggle('active', d.dataset.t === name);
  });
}
themeGrid.addEventListener('click', e => {
  const dot = e.target.closest('.theme-dot');
  if (dot) setTheme(dot.dataset.t);
});

/* ──────────────────────────────────────
   API Key Management
────────────────────────────────────── */
function updateApiStatus() {
  if (apiKey) {
    apiStatus.className = 'api-status connected';
    apiStatus.innerHTML = '<i class="fas fa-circle"></i> <span>Key saved</span>';
    apiKeyToggle.textContent = 'Clear';
  } else {
    apiStatus.className = 'api-status';
    apiStatus.innerHTML = '<i class="fas fa-circle"></i> <span>No key configured</span>';
    apiKeyToggle.textContent = 'Save';
  }
  updateSendButton();
}
apiKeyToggle.addEventListener('click', () => {
  if (apiKey) {
    apiKey = '';
    apiKeyInput.value = '';
    localStorage.removeItem('gemini_api_key');
    showToast('API key cleared', 'info');
  } else {
    const key = apiKeyInput.value.trim();
    if (!key) { showToast('Please enter an API key', 'error'); return; }
    apiKey = key;
    localStorage.setItem('gemini_api_key', key);
    showToast('API key saved successfully', 'success');
  }
  updateApiStatus();
});
apiKeyInput.addEventListener('input', () => {
  if (!apiKeyInput.value.trim() && !apiKey) {
    apiKeyToggle.textContent = 'Save';
  }
});

/* ──────────────────────────────────────
   Sidebar & Conversations
────────────────────────────────────── */
function toggleSidebar(open) {
  const isOpen = open !== undefined ? open : !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', isOpen);
  sidebarOverlay.classList.toggle('show', isOpen);
}
 $('menuToggle').addEventListener('click', () => toggleSidebar(true));
sidebarOverlay.addEventListener('click', () => toggleSidebar(false));

function renderChatList() {
  chatList.innerHTML = '';
  conversations.forEach((conv, i) => {
    const el = document.createElement('div');
    el.className = 'chat-item' + (i === activeConvIdx ? ' active' : '');
    el.innerHTML = `
      <i class="fas fa-message" style="font-size:.75rem;color:var(--text-muted);flex-shrink:0"></i>
      <span class="chat-item-text">${escapeHtml(conv.title)}</span>
      <button class="chat-item-delete" aria-label="Delete conversation"><i class="fas fa-xmark"></i></button>
    `;
    el.querySelector('.chat-item-text').addEventListener('click', () => switchConversation(i));
    el.querySelector('i.fa-message').addEventListener('click', () => switchConversation(i));
    el.querySelector('.chat-item-delete').addEventListener('click', e => {
      e.stopPropagation();
      deleteConversation(i);
    });
    chatList.appendChild(el);
  });
}

function switchConversation(idx) {
  activeConvIdx = idx;
  renderChatList();
  renderMessages();
  toggleSidebar(false);
}

function deleteConversation(idx) {
  conversations.splice(idx, 1);
  if (conversations.length === 0) activeConvIdx = -1;
  else if (activeConvIdx >= conversations.length) activeConvIdx = conversations.length - 1;
  saveConversations();
  renderChatList();
  renderMessages();
}

function createNewChat() {
  conversations.unshift({ id: Date.now(), title: 'New Chat', messages: [] });
  activeConvIdx = 0;
  saveConversations();
  renderChatList();
  renderMessages();
  toggleSidebar(false);
  messageInput.focus();
}
 $('newChatBtn').addEventListener('click', createNewChat);

function saveConversations() {
  localStorage.setItem('gemini_conversations', JSON.stringify(conversations));
}

function getActiveConversation() {
  if (activeConvIdx < 0 || activeConvIdx >= conversations.length) return null;
  return conversations[activeConvIdx];
}

/* ──────────────────────────────────────
   Message Rendering
────────────────────────────────────── */
function renderMessages() {
  const conv = getActiveConversation();
  if (!conv || conv.messages.length === 0) {
    welcomeScreen.style.display = 'flex';
    /* Remove all message elements but keep welcome screen */
    messagesWrap.querySelectorAll('.message').forEach(m => m.remove());
    headerSub.textContent = '';
    return;
  }
  welcomeScreen.style.display = 'none';
  messagesWrap.querySelectorAll('.message').forEach(m => m.remove());

  conv.messages.forEach(msg => {
    appendMessageDOM(msg.role, msg.content, false);
  });
  scrollToBottom();
  headerSub.textContent = `${conv.messages.length} messages`;
}

function appendMessageDOM(role, content, animate = true) {
  const div = document.createElement('div');
  div.className = `message ${role}`;
  if (!animate) div.style.animation = 'none';

  const avatarSvg = role === 'bot'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="var(--accent)"/></svg>`
    : `<i class="fas fa-user"></i>`;

  const name = role === 'user' ? 'You' : 'Gemini';

  let contentHtml;
  if (role === 'user') {
    contentHtml = escapeHtml(content).replace(/\n/g, '<br>');
  } else {
    contentHtml = renderMarkdown(content);
  }

  div.innerHTML = `
    <div class="msg-avatar">${avatarSvg}</div>
    <div class="msg-body">
      <div class="msg-name">${name}</div>
      <div class="msg-bubble"><div class="message-content">${contentHtml}</div></div>
    </div>
  `;
  messagesWrap.appendChild(div);
  return div;
}

function createStreamingMessage() {
  const div = document.createElement('div');
  div.className = 'message bot';
  div.innerHTML = `
    <div class="msg-avatar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="var(--accent)"/></svg>
    </div>
    <div class="msg-body">
      <div class="msg-name">Gemini</div>
      <div class="msg-bubble">
        <div class="typing-indicator"><span></span><span></span><span></span></div>
        <div class="raw-text" style="display:none"></div>
        <div class="message-content" style="display:none"></div>
      </div>
    </div>
  `;
  messagesWrap.appendChild(div);
  return div;
}

/* ──────────────────────────────────────
   Send Message & Streaming
────────────────────────────────────── */
async function sendMessage(overrideText) {
  const text = (overrideText || messageInput.value).trim();
  if (!text || isGenerating) return;
  if (!apiKey) {
    showToast('Please set your Gemini API key in the sidebar first', 'error');
    return;
  }

  /* Ensure we have an active conversation */
  if (activeConvIdx < 0) createNewChat();
  const conv = getActiveConversation();

  /* Add user message */
  conv.messages.push({ role: 'user', content: text });
  if (conv.title === 'New Chat') {
    conv.title = text.substring(0, 50) + (text.length > 50 ? '...' : '');
  }
  saveConversations();
  renderChatList();

  messageInput.value = '';
  autoResize();
  closeEmojiPicker();
  updateSendButton();

  /* Show user message in DOM */
  welcomeScreen.style.display = 'none';
  appendMessageDOM('user', text);
  scrollToBottom();

  /* Create streaming bot message */
  isGenerating = true;
  updateSendButton();
  const botEl = createStreamingMessage();
  const typingEl = botEl.querySelector('.typing-indicator');
  const rawEl = botEl.querySelector('.raw-text');
  const contentEl = botEl.querySelector('.message-content');
  scrollToBottom();

  /* Build API contents */
  const apiContents = conv.messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse&key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: apiContents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 8192 }
      })
    });

    if (!res.ok) {
      let errMsg = `Request failed (${res.status})`;
      try {
        const errData = await res.json();
        errMsg = errData.error?.message || errMsg;
      } catch {}
      throw new Error(errMsg);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';
    let firstChunk = true;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === '[DONE]') continue;

        try {
          const json = JSON.parse(data);
          const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (chunk) {
            if (firstChunk) {
              typingEl.style.display = 'none';
              rawEl.style.display = 'block';
              firstChunk = false;
            }
            fullText += chunk;
            rawEl.textContent = fullText;
            scrollToBottom();
          }
        } catch {}
      }
    }

    /* Final render */
    rawEl.style.display = 'none';
    contentEl.innerHTML = renderMarkdown(fullText);
    contentEl.style.display = 'block';

    /* Save bot message */
    conv.messages.push({ role: 'assistant', content: fullText });
    saveConversations();
    headerSub.textContent = `${conv.messages.length} messages`;

  } catch (err) {
    typingEl.style.display = 'none';
    contentEl.innerHTML = `<div class="error-msg"><i class="fas fa-circle-exclamation"></i> ${escapeHtml(err.message)}</div>`;
    contentEl.style.display = 'block';
    showToast(err.message, 'error');
  }

  isGenerating = false;
  updateSendButton();
  scrollToBottom();
}

/* ──────────────────────────────────────
   Input Handling
────────────────────────────────────── */
function autoResize() {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 160) + 'px';
}

function updateSendButton() {
  const hasText = messageInput.value.trim().length > 0;
  if (isGenerating) {
    sendBtn.className = 'send-btn loading';
    sendBtn.innerHTML = '<i class="fas fa-spinner"></i>';
  } else if (hasText && apiKey) {
    sendBtn.className = 'send-btn ready';
    sendBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  } else {
    sendBtn.className = 'send-btn disabled';
    sendBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  }
}

messageInput.addEventListener('input', () => { autoResize(); updateSendButton(); });
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});
sendBtn.addEventListener('click', () => { if (!isGenerating) sendMessage(); });

/* ──────────────────────────────────────
   Suggestion Cards
────────────────────────────────────── */
suggestions.addEventListener('click', e => {
  const card = e.target.closest('.suggestion-card');
  if (card) sendMessage(card.dataset.prompt);
});

/* ──────────────────────────────────────
   Emoji Picker
────────────────────────────────────── */
const emojiData = {
  'Smileys': ['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😋','😛','😜','🤪','🤗','🤭','🤫','🤔','😐','😏','😒','🙄','😌','🥺','😎','🤓','🧐','😕','😟','😮','😲','😳','😢','😭','😱','🤯','🥳','😤','😡','🤬','🥶','🥵','😵','🤮','🤢','🤕','🤒','😴','🥱','😪'],
  'Gestures': ['👋','🤚','🖐️','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️','💪','🦾','🦵','🦶','👂','👁️','👅','👄','🧠','👀'],
  'Hearts': ['❤️','🧡','💛','💚','💙','💜','🤎','🖤','🤍','💔','❤️‍🔥','❣️','💕','💞','💓','💗','💖','💘','💝','💟','♥️','💘','💔','💗'],
  'Nature': ['🐶','🐱','🐭','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐧','🦆','🦅','🦉','🦇','🐺','🐴','🦄','🐝','🦋','🐌','🐞','🐢','🐍','🦎','🐙','🦑','🦐','🐠','🐟','🐬','🐳','🦈','🐊','🦓','🦍','🐘','🌻','🌹','🌸','🌺','🍀','🌿','🍁','🍂'],
  'Food': ['🍎','🍊','🍋','🍌','🍉','🍇','🍓','🍒','🍑','🍍','🥝','🍅','🥑','🥦','🌶️','🥕','🍞','🧀','🥚','🍳','🥞','🥩','🍗','🌭','🍔','🍟','🍕','🥪','🌮','🍣','🍜','🍲','🍛','🍱','🍡','🍨','🍦','🧁','🍰','🎂','🍭','🍬','🍫','🍩','🍪','☕','🍵','🧃','🍺','🍷','🍸'],
  'Objects': ['💡','📱','💻','⌨️','🖥️','🖨️','📷','🎥','📞','📺','🎙️','⏱️','⏰','⌛','📡','🔋','💰','💳','💎','🔧','🔨','⚙️','🧲','💣','🔪','🛡️','🔮','🔭','💊','💉','🧬','🦠','🧪','🌡️','🔑','🚪','🪑','🛋️','🧸','🎁','🎈','🎀','✉️','📦','📌','📎','✂️','📝','✏️','🔍','🔐','🔒']
};

let activeEmojiTab = 'Smileys';

function renderEmojiTabs() {
  emojiTabs.innerHTML = '';
  Object.keys(emojiData).forEach(cat => {
    const tab = document.createElement('button');
    tab.className = 'emoji-tab' + (cat === activeEmojiTab ? ' active' : '');
    tab.textContent = cat;
    tab.addEventListener('click', () => {
      activeEmojiTab = cat;
      renderEmojiTabs();
      renderEmojiGrid();
    });
    emojiTabs.appendChild(tab);
  });
}

function renderEmojiGrid() {
  emojiGrid.innerHTML = '';
  (emojiData[activeEmojiTab] || []).forEach(emoji => {
    const item = document.createElement('button');
    item.className = 'emoji-item';
    item.textContent = emoji;
    item.setAttribute('aria-label', emoji);
    item.addEventListener('click', () => insertEmoji(emoji));
    emojiGrid.appendChild(item);
  });
}

function insertEmoji(emoji) {
  const start = messageInput.selectionStart;
  const end = messageInput.selectionEnd;
  const val = messageInput.value;
  messageInput.value = val.slice(0, start) + emoji + val.slice(end);
  messageInput.selectionStart = messageInput.selectionEnd = start + emoji.length;
  messageInput.focus();
  autoResize();
  updateSendButton();
}

function toggleEmojiPicker() {
  const showing = emojiPicker.classList.contains('show');
  if (showing) closeEmojiPicker();
  else {
    emojiPicker.classList.add('show');
    emojiBtn.classList.add('active');
  }
}
function closeEmojiPicker() {
  emojiPicker.classList.remove('show');
  emojiBtn.classList.remove('active');
}

emojiBtn.addEventListener('click', e => { e.stopPropagation(); toggleEmojiPicker(); });
document.addEventListener('click', e => {
  if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) closeEmojiPicker();
});

/* ──────────────────────────────────────
   Utility Functions
────────────────────────────────────── */
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    messagesWrap.scrollTop = messagesWrap.scrollHeight;
  });
}

function copyCodeBlock(id) {
  const block = document.getElementById(id);
  if (!block) return;
  const code = block.querySelector('code');
  if (!code) return;
  navigator.clipboard.writeText(code.textContent).then(() => {
    const btn = block.querySelector('.copy-btn');
    btn.classList.add('copied');
    btn.innerHTML = '<i class="fas fa-check"></i> Copied';
    setTimeout(() => {
      btn.classList.remove('copied');
      btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
    }, 2000);
  });
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const iconMap = { error: 'circle-exclamation', success: 'circle-check', info: 'circle-info' };
  toast.innerHTML = `<i class="fas fa-${iconMap[type] || 'circle-info'}"></i> <span>${escapeHtml(message)}</span>`;
  $('toastContainer').appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ──────────────────────────────────────
   Keyboard Shortcuts
────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeEmojiPicker();
    if (sidebar.classList.contains('open')) toggleSidebar(false);
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
    e.preventDefault();
    createNewChat();
  }
});

/* ──────────────────────────────────────
   Initialization
────────────────────────────────────── */
(function init() {
  /* Restore theme */
  const savedTheme = localStorage.getItem('gemini_theme') || 'obsidian';
  setTheme(savedTheme);

  /* Restore API key */
  if (apiKey) {
    apiKeyInput.value = apiKey;
    updateApiStatus();
  }

  /* Render emoji picker */
  renderEmojiTabs();
  renderEmojiGrid();

  /* Render conversations */
  if (conversations.length === 0) {
    /* Start fresh — no conversations yet */
  } else {
    renderChatList();
    renderMessages();
  }

  /* Focus input */
  messageInput.focus();
})();
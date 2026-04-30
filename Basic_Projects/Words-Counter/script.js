/* ===================================================
   WordCraft — Advanced Word Counter
   All logic in one file, no dependencies beyond browser APIs
   =================================================== */

// ─────────────────────────────────────────────────────
// 1. DOM REFERENCES
// ─────────────────────────────────────────────────────
const textInput = document.getElementById('textInput');
const searchInput = document.getElementById('searchInput');
const searchCount = document.getElementById('searchCount');
const searchClearBtn = document.getElementById('searchClearBtn');
const searchPreview = document.getElementById('searchPreview');
const keywordsList = document.getElementById('keywordsList');
const saveStatus = document.getElementById('saveStatus');
const charFooter = document.getElementById('charFooter');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const speedBadge = document.getElementById('speedBadge');
const wpmDisplay = document.getElementById('wpmDisplay');
const toastEl = document.getElementById('toast');

// Stat value elements
const statEls = {
  words: document.getElementById('statWords'),
  chars: document.getElementById('statChars'),
  charsNoSpace: document.getElementById('statCharsNoSpace'),
  sentences: document.getElementById('statSentences'),
  paragraphs: document.getElementById('statParagraphs'),
  readTime: document.getElementById('statReadTime'),
  speakTime: document.getElementById('statSpeakTime'),
  avgLen: document.getElementById('statAvgLen'),
};

// Tool buttons
const btnUppercase = document.getElementById('btnUppercase');
const btnLowercase = document.getElementById('btnLowercase');
const btnCapitalize = document.getElementById('btnCapitalize');
const btnRemoveSpaces = document.getElementById('btnRemoveSpaces');
const btnCopy = document.getElementById('btnCopy');
const btnDownload = document.getElementById('btnDownload');
const btnClear = document.getElementById('btnClear');

// ─────────────────────────────────────────────────────
// 2. STATE
// ─────────────────────────────────────────────────────
let previousStats = { words: 0, chars: 0, charsNoSpace: 0, sentences: 0, paragraphs: 0, avgLen: 0 };
let saveTimeout = null;       // Debounce timer for auto-save
let saveFadeTimeout = null;   // Timer to fade out save indicator
let searchDebounce = null;    // Debounce timer for search
let keywordDebounce = null;   // Debounce timer for keyword analysis

// Typing speed tracking
let typingStartTime = null;
let totalKeystrokes = 0;
let lastActivityTime = null;
let wpmInterval = null;

// ─────────────────────────────────────────────────────
// 3. STOP WORDS (common English words to exclude from density)
// ─────────────────────────────────────────────────────
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
  'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
  'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
  'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and',
  'or', 'if', 'while', 'about', 'up', 'it', 'its', 'this', 'that',
  'these', 'those', 'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he',
  'him', 'his', 'she', 'her', 'they', 'them', 'their', 'what', 'which',
  'who', 'whom', 'an', 'am', 'also', 'any', 'many', 'much', 'now',
  'like', 'well', 'back', 'even', 'get', 'got', 'go', 'going', 'gone',
  'said', 'say', 'one', 'two', 'new', 'first', 'last', 'long', 'great',
  'little', 'just', 'know', 'take', 'people', 'come', 'way', 'use',
  'make', 'like', 'time', 'see', 'look', 'think', 'want', 'give', 'day',
]);

// ─────────────────────────────────────────────────────
// 4. UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────

/** Escape HTML entities to safely insert text into the DOM */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** Show a toast message at the bottom of the screen */
function showToast(message, icon = 'fa-circle-check') {
  toastEl.innerHTML = `<i class="fas ${icon}"></i> ${escapeHtml(message)}`;
  toastEl.classList.add('show');
  // Auto-hide after 2.5 seconds
  clearTimeout(toastEl._hideTimeout);
  toastEl._hideTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 2500);
}

/** Format seconds into a human-readable time string */
function formatTime(seconds) {
  if (seconds < 1) return '< 1 min';
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins} min`;
  return `${mins}m ${secs}s`;
}

// ─────────────────────────────────────────────────────
// 5. ANIMATED COUNTER
// Smoothly transitions a number from old → new value
// ─────────────────────────────────────────────────────
const activeAnimations = new Map();

function animateCounter(element, newValue, duration = 280) {
  const key = element.id;
  // Cancel any running animation for this element
  if (activeAnimations.has(key)) {
    cancelAnimationFrame(activeAnimations.get(key));
  }

  const startValue = previousStats[key] || 0;
  const diff = newValue - startValue;

  // Skip animation if value hasn't changed
  if (diff === 0) return;

  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease-out cubic for a satisfying deceleration
    const eased = 1 - Math.pow(1 - progress, 3);

    const current = Math.round(startValue + diff * eased);
    element.textContent = current;

    if (progress < 1) {
      activeAnimations.set(key, requestAnimationFrame(step));
    } else {
      activeAnimations.delete(key);
    }
  }

  activeAnimations.set(key, requestAnimationFrame(step));
}

// ─────────────────────────────────────────────────────
// 6. TEXT STATISTICS FUNCTIONS
// ─────────────────────────────────────────────────────

/** Count words — splits on whitespace, filters empty strings */
function countWords(text) {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/** Count total characters */
function countChars(text) {
  return text.length;
}

/** Count characters without spaces */
function countCharsNoSpace(text) {
  return text.replace(/\s/g, '').length;
}

/** Count sentences — split on . ! ? and filter empties */
function countSentences(text) {
  if (!text.trim()) return 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  return sentences.length;
}

/** Count paragraphs — split on blank lines, filter empties */
function countParagraphs(text) {
  if (!text.trim()) return 0;
  return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
}

/** Calculate reading time (200 words per minute) */
function calcReadingTime(wordCount) {
  return (wordCount / 200) * 60; // in seconds
}

/** Calculate speaking time (150 words per minute) */
function calcSpeakingTime(wordCount) {
  return (wordCount / 150) * 60; // in seconds
}

/** Calculate average word length */
function calcAvgWordLength(text) {
  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return 0;
  const totalLen = words.reduce((sum, w) => sum + w.length, 0);
  return Math.round((totalLen / words.length) * 10) / 10; // 1 decimal
}

// ─────────────────────────────────────────────────────
// 7. MAIN UPDATE FUNCTION
// Called on every input event — recalculates all stats
// ─────────────────────────────────────────────────────
function updateStats() {
  const text = textInput.value;

  // Calculate all statistics
  const words = countWords(text);
  const chars = countChars(text);
  const charsNoSpace = countCharsNoSpace(text);
  const sentences = countSentences(text);
  const paragraphs = countParagraphs(text);
  const readSeconds = calcReadingTime(words);
  const speakSeconds = calcSpeakingTime(words);
  const avgLen = calcAvgWordLength(text);

  // Animate numeric stats
  animateCounter(statEls.words, words);
  animateCounter(statEls.chars, chars);
  animateCounter(statEls.charsNoSpace, charsNoSpace);
  animateCounter(statEls.sentences, sentences);
  animateCounter(statEls.paragraphs, paragraphs);
  animateCounter(statEls.avgLen, avgLen);

  // Time-based stats: set directly (no number animation needed)
  statEls.readTime.textContent = formatTime(readSeconds);
  statEls.speakTime.textContent = formatTime(speakSeconds);

  // Update footer character count
  charFooter.textContent = `${chars.toLocaleString()} characters`;

  // Store current values for next animation
  previousStats = { words, chars, charsNoSpace, sentences, paragraphs, avgLen };

  // Debounced: keyword density analysis (heavier computation)
  clearTimeout(keywordDebounce);
  keywordDebounce = setTimeout(() => updateKeywords(text), 300);

  // Debounced: auto-save to localStorage
  clearTimeout(saveTimeout);
  showSavingStatus();
  saveTimeout = setTimeout(() => saveToStorage(), 600);

  // Update search preview if there's an active search
  if (searchInput.value.trim()) {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => performSearch(), 200);
  }
}

// ─────────────────────────────────────────────────────
// 8. KEYWORD DENSITY ANALYSIS
// Shows top 5 words excluding stop words
// ─────────────────────────────────────────────────────
function updateKeywords(text) {
  if (!text.trim()) {
    keywordsList.innerHTML = '<p class="keywords-empty">Start typing to see keyword analysis</p>';
    return;
  }

  // Extract words, normalize to lowercase, remove non-alphabetic chars
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 1 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));

  if (words.length === 0) {
    keywordsList.innerHTML = '<p class="keywords-empty">Not enough meaningful words for analysis</p>';
    return;
  }

  // Count frequency of each word
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Sort by frequency descending, take top 5
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalWords = words.length;
  const maxCount = sorted[0][1]; // For relative bar width

  // Build the HTML for keyword items
  const html = sorted.map(([word, count], index) => {
    const percent = ((count / totalWords) * 100).toFixed(1);
    const barWidth = (count / maxCount) * 100;
    return `
      <div class="keyword-item" data-word="${escapeHtml(word)}" title="Click to search this word">
        <div>
          <div class="keyword-word">${escapeHtml(word)}</div>
          <div class="keyword-bar">
            <div class="keyword-bar-fill" data-width="${barWidth}%"></div>
          </div>
        </div>
        <div class="keyword-meta">
          <span class="keyword-count">${count}x</span>
          <span class="keyword-percent">${percent}%</span>
        </div>
      </div>
    `;
  }).join('');

  keywordsList.innerHTML = html;

  // Animate the bars in on the next frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      keywordsList.querySelectorAll('.keyword-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
      });
    });
  });

  // Add click listeners to keyword items — click to search
  keywordsList.querySelectorAll('.keyword-item').forEach(item => {
    item.addEventListener('click', () => {
      searchInput.value = item.dataset.word;
      performSearch();
      searchInput.focus();
    });
  });
}

// ─────────────────────────────────────────────────────
// 9. SEARCH & HIGHLIGHT
// ─────────────────────────────────────────────────────
function performSearch() {
  const query = searchInput.value.trim();
  const text = textInput.value;

  if (!query) {
    clearSearch();
    return;
  }

  // Escape the query for safe regex use (after HTML-escaping)
  const safeQuery = escapeHtml(query);
  const regexEscaped = safeQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${regexEscaped})`, 'gi');

  // Build highlighted preview
  const safeText = escapeHtml(text);
  const highlighted = safeText.replace(regex, '<mark>$1</mark>');
  const matches = (safeText.match(regex) || []).length;

  // Update UI
  searchPreview.innerHTML = highlighted || '<em style="color:var(--text-muted)">No text to search</em>';
  searchPreview.classList.add('visible');

  searchCount.textContent = `${matches} found`;
  searchCount.classList.add('visible');
}

function clearSearch() {
  searchInput.value = '';
  searchCount.textContent = '';
  searchCount.classList.remove('visible');
  searchPreview.classList.remove('visible');
  searchPreview.innerHTML = '';
}

// ─────────────────────────────────────────────────────
// 10. TOOL FUNCTIONS
// ─────────────────────────────────────────────────────

/** Convert all text to uppercase */
function toUpperCase() {
  if (!textInput.value) return;
  textInput.value = textInput.value.toUpperCase();
  updateStats();
  showToast('Converted to uppercase');
}

/** Convert all text to lowercase */
function toLowerCase() {
  if (!textInput.value) return;
  textInput.value = textInput.value.toLowerCase();
  updateStats();
  showToast('Converted to lowercase');
}

/** Capitalize the first letter of each word */
function toCapitalize() {
  if (!textInput.value) return;
  textInput.value = textInput.value.replace(/\b\w/g, char => char.toUpperCase());
  updateStats();
  showToast('Capitalized each word');
}

/** Remove extra spaces — collapse multiple spaces into one, trim edges */
function removeExtraSpaces() {
  if (!textInput.value) return;
  textInput.value = textInput.value.replace(/[^\S\n]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
  updateStats();
  showToast('Removed extra spaces');
}

/** Copy text to clipboard using the Clipboard API */
function copyToClipboard() {
  const text = textInput.value;
  if (!text) {
    showToast('Nothing to copy', 'fa-circle-exclamation');
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard');
  }).catch(() => {
    // Fallback for older browsers
    textInput.select();
    document.execCommand('copy');
    showToast('Copied to clipboard');
  });
}

/** Download text as a .txt file */
function downloadAsTxt() {
  const text = textInput.value;
  if (!text) {
    showToast('Nothing to download', 'fa-circle-exclamation');
    return;
  }
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wordcraft-text.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Downloaded as .txt file');
}

/** Clear all text and reset stats */
function clearText() {
  if (!textInput.value) return;
  textInput.value = '';
  clearSearch();
  updateStats();
  resetTypingSpeed();
  showToast('Text cleared');
  textInput.focus();
}

// ─────────────────────────────────────────────────────
// 11. TYPING SPEED TRACKER
// Calculates WPM based on session keystrokes over time
// ─────────────────────────────────────────────────────
function recordKeystroke() {
  const now = Date.now();

  // Reset session if user was idle for more than 5 seconds
  if (lastActivityTime && (now - lastActivityTime > 5000)) {
    typingStartTime = now;
    totalKeystrokes = 0;
  }

  if (!typingStartTime) {
    typingStartTime = now;
  }

  totalKeystrokes++;
  lastActivityTime = now;

  speedBadge.classList.add('active');
}

function calculateWPM() {
  if (!typingStartTime || totalKeystrokes < 5) {
    wpmDisplay.textContent = '0 WPM';
    speedBadge.classList.remove('active');
    return;
  }

  const now = Date.now();
  const elapsedMinutes = (now - typingStartTime) / 60000;

  // Standard: 5 characters = 1 word
  const wpm = Math.round((totalKeystrokes / 5) / elapsedMinutes);
  wpmDisplay.textContent = `${wpm} WPM`;

  // If idle for more than 5 seconds, gradually fade out
  if (lastActivityTime && (now - lastActivityTime > 5000)) {
    speedBadge.classList.remove('active');
  }
}

function resetTypingSpeed() {
  typingStartTime = null;
  totalKeystrokes = 0;
  lastActivityTime = null;
  wpmDisplay.textContent = '0 WPM';
  speedBadge.classList.remove('active');
}

// Update WPM display every second
setInterval(calculateWPM, 1000);

// ─────────────────────────────────────────────────────
// 12. THEME TOGGLE (Dark / Light)
// Persists preference in localStorage
// ─────────────────────────────────────────────────────
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('wordcraft-theme', theme);

  // Update icon: show moon in light mode (to switch to dark), sun in dark mode
  if (theme === 'dark') {
    themeIcon.className = 'fas fa-moon';
  } else {
    themeIcon.className = 'fas fa-sun';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
}

function loadTheme() {
  const saved = localStorage.getItem('wordcraft-theme');
  if (saved) {
    setTheme(saved);
  } else {
    // Respect system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

// ─────────────────────────────────────────────────────
// 13. LOCAL STORAGE — Auto-save & Load
// ─────────────────────────────────────────────────────
const STORAGE_KEY = 'wordcraft-text';

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, textInput.value);
    showSavedStatus();
  } catch (e) {
    // Storage full or unavailable — fail silently
  }
}

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      textInput.value = saved;
    }
  } catch (e) {
    // Fail silently
  }
}

/** Show "Saving..." status */
function showSavingStatus() {
  clearTimeout(saveFadeTimeout);
  saveStatus.innerHTML = '<i class="fas fa-spinner"></i> Saving...';
  saveStatus.className = 'save-status visible saving';
}

/** Show "Saved" status, then fade out */
function showSavedStatus() {
  saveStatus.innerHTML = '<i class="fas fa-circle-check"></i> Saved';
  saveStatus.className = 'save-status visible';

  // Fade out after 2 seconds
  clearTimeout(saveFadeTimeout);
  saveFadeTimeout = setTimeout(() => {
    saveStatus.classList.remove('visible');
  }, 2000);
}

// ─────────────────────────────────────────────────────
// 14. EVENT LISTENERS
// ─────────────────────────────────────────────────────

// Main text input — triggers real-time stat updates
textInput.addEventListener('input', () => {
  updateStats();
  recordKeystroke();
});

// Handle paste separately (don't count as typing speed)
textInput.addEventListener('paste', () => {
  // Use a tiny timeout so pasted content is available
  setTimeout(() => {
    updateStats();
  }, 0);
});

// Search input
searchInput.addEventListener('input', () => {
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(performSearch, 200);
});

searchClearBtn.addEventListener('click', clearSearch);

// Tool buttons
btnUppercase.addEventListener('click', toUpperCase);
btnLowercase.addEventListener('click', toLowerCase);
btnCapitalize.addEventListener('click', toCapitalize);
btnRemoveSpaces.addEventListener('click', removeExtraSpaces);
btnCopy.addEventListener('click', copyToClipboard);
btnDownload.addEventListener('click', downloadAsTxt);
btnClear.addEventListener('click', clearText);

// Theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Keyboard shortcut: Escape clears search
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && document.activeElement === searchInput) {
    clearSearch();
    searchInput.blur();
  }
});

// ─────────────────────────────────────────────────────
// 15. INITIALIZATION
// ─────────────────────────────────────────────────────
(function init() {
  loadTheme();       // Restore theme preference
  loadFromStorage(); // Restore saved text
  updateStats();     // Calculate initial stats
})();
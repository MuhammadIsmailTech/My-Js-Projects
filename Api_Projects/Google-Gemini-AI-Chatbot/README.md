```markdown
# Gemini AI Chat

A fully-featured, single-file AI chatbot powered by **Google Gemini API** with streaming responses, 5 custom themes, an emoji picker, and full markdown/code syntax highlighting.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Gemini](https://img.shields.io/badge/Google%20Gemini-4285F4?style=flat&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

### Core
- **Streaming responses** — watch the AI generate text token-by-token in real-time via Server-Sent Events
- **Multi-conversation** — create, switch between, and delete separate chat sessions
- **Persistent storage** — conversations, API key, theme, and model preference saved in `localStorage`
- **Model switching** — toggle between `gemini-2.0-flash`, `gemini-1.5-flash`, and `gemini-1.5-pro`

### UI/UX
- **5 handcrafted dark themes** — Obsidian (teal), Ember (orange), Moss (green), Blush (coral), Aurum (gold)
- **Markdown rendering** — full support for headers, lists, tables, blockquotes, links, bold/italic, horizontal rules
- **Syntax-highlighted code blocks** — 180+ languages via Highlight.js, each with a one-click **Copy** button
- **Emoji picker** — 6 categorized tabs with ~300 emojis, inserts at cursor position
- **Responsive design** — collapsible sidebar on mobile with overlay navigation
- **Keyboard shortcuts** — `Enter` to send, `Shift+Enter` for newline, `Ctrl+N` for new chat, `Escape` to close panels

### Error Handling
- **Quota-exceeded detection** — friendly warning with actionable steps (wait, switch model, or upgrade)
- **One-click retry** — retry button on quota errors that re-sends the last message
- **Toast notifications** — non-intrusive alerts for successes, errors, and warnings

---

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Edge, Safari)
- A **free** Google Gemini API key

### Get an API Key (Free)

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the key

### Run the App

1. Save the `index.html` file to your computer
2. Open it directly in your browser — **no server required**
3. Paste your API key into the sidebar input and click **Save**
4. Start chatting

That's it. No build tools, no `npm install`, no dependencies to manage.

---

## Usage

### Sending Messages
- Type in the input box and press **Enter**
- Press **Shift+Enter** to add a new line
- Click the **arrow button** to send

### Emoji Picker
- Click the **smiley face** button next to the input box
- Browse categories with the tab bar
- Click any emoji to insert it at your cursor position

### Managing Conversations
- Click **New Chat** in the sidebar to start fresh
- Click any conversation in the list to switch to it
- Hover over a conversation and click the **X** to delete it

### Switching Themes
- Click any color dot in the **Theme** section of the sidebar
- Your choice is saved automatically

### Switching Models
- Use the **Model** dropdown in the sidebar
- Each model has different rate limits and capabilities:
  - `gemini-2.0-flash` — fastest, 15 RPM free tier
  - `gemini-1.5-flash` — fast, 15 RPM free tier (separate quota pool)
  - `gemini-1.5-pro` — most capable, 2 RPM free tier

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Enter` | Send message |
| `Shift + Enter` | New line |
| `Ctrl + N` | New chat |
| `Escape` | Close emoji picker / sidebar |

---

## Free Tier Rate Limits

The Gemini free tier has per-minute and daily quotas. If you hit a limit, the app shows a clear error with options to resolve it.

| Model | Requests/Minute | Tokens/Day |
|-------|----------------|------------|
| gemini-2.0-flash | 15 | 1,000,000 |
| gemini-1.5-flash | 15 | 1,000,000 |
| gemini-1.5-pro | 2 | 50,000 |

> **Tip:** If you get a quota error, switch to a different model — they often have **separate** rate limit pools. Or wait ~60 seconds for the window to reset.

---

## Project Structure

```
gemini-chat/
└── index.html    ← Everything in a single file
```

The entire application — HTML structure, CSS styling, and JavaScript logic — lives in one self-contained HTML file. External resources are loaded from CDNs:

| Library | Purpose | CDN |
|---------|---------|-----|
| Google Fonts | Space Grotesk + JetBrains Mono | fonts.googleapis.com |
| Highlight.js | Code syntax highlighting (180+ languages) | cdnjs.cloudflare.com |
| Marked.js | Markdown to HTML parsing | cdnjs.cloudflare.com |
| Font Awesome | Icons | cdnjs.cloudflare.com |

---

## Technical Details

### Streaming Architecture

The app uses the Gemini `streamGenerateContent` endpoint with `alt=sse` to receive Server-Sent Events. During streaming:

1. A typing indicator is shown initially
2. Raw text accumulates in a monospace `<pre>` block for instant display
3. Once streaming completes, the full text is re-parsed through `marked.parse()` and rendered as formatted markdown with syntax-highlighted code blocks

This two-phase approach gives the perception of instant responsiveness while delivering rich formatting.

### Markdown Pipeline

```
Raw AI text → marked.parse() → custom renderer → HTML
                                    ↓
                            code blocks → highlight.js
                            inline code → styled <code>
```

The custom `marked.Renderer` intercepts `code` and `codespan` tokens to apply syntax highlighting and consistent styling.

### Data Persistence

All data is stored in `localStorage` under four keys:

| Key | Content |
|-----|---------|
| `gemini_api_key` | Encrypted API key string |
| `gemini_conversations` | JSON array of conversation objects |
| `gemini_theme` | Active theme name |
| `gemini_model` | Selected model identifier |

Each conversation object contains:
```json
{
  "id": 1700000000000,
  "title": "First 50 chars of first message",
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

### Theme System

Themes use CSS custom properties on `[data-theme]` selectors. Every color in the UI references a `var(--token)` rather than a hardcoded value, making theme switching instant with zero JavaScript color manipulation.

---

## Browser Support

| Browser | Supported |
|---------|-----------|
| Chrome 90+ | Yes |
| Firefox 90+ | Yes |
| Safari 15+ | Yes |
| Edge 90+ | Yes |
| Mobile Chrome/Safari | Yes |

---

## Security Notes

- Your API key is stored in `localStorage` — never share this file or your key publicly
- All API calls are made directly from the browser to Google's servers (no proxy)
- No data is sent to any third-party server
- The `systemInstruction` is sent with every request to guide AI behavior

---

## Troubleshooting

### "Quota exceeded" error
- Wait 60 seconds and click **Retry**, or switch to a different model in the sidebar
- Free tier limits reset every minute and every day

### "API key not valid" error
- Make sure you copied the **full** key without extra spaces
- The app automatically strips whitespace, but double-check the key at [AI Studio](https://aistudio.google.com/apikey)
- Ensure the key has the Generative Language API enabled

### Messages not appearing
- Check browser console (F12) for errors
- Try clearing `localStorage` and refreshing
- Ensure you're using a supported browser

### Code blocks not highlighted
- Check your internet connection — Highlight.js language definitions load from CDN
- Some obscure languages may fall back to auto-detection

---

## License

This project is open source under the [MIT License](https://opensource.org/licenses/MIT).

---

## Credits

- [Google Gemini API](https://ai.google.dev/) — AI model
- [Marked.js](https://marked.js.org/) — Markdown parser
- [Highlight.js](https://highlightjs.org/) — Syntax highlighting
- [Font Awesome](https://fontawesome.com/) — Icon library
- [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) — UI font
- [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) — Code font
```

Save this as `README.md` in the same folder as your `index.html` file. It covers setup, features, technical architecture, troubleshooting, and all the details someone would need to understand, use, or contribute to the project.
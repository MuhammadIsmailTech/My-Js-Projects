### Word Scramble — Unscramble & Conquer
A premium, feature-rich Word Scramble web game with glassmorphism UI, smooth animations, sound effects, difficulty levels, categories, hints, leaderboard, and more — all in a single self-contained HTML file.

LicenseNo DependenciesBrowser Only

### Preview
Dark forest-green theme with emerald accents, glassmorphism cards, animated gradient blobs, confetti particles, and smooth micro-interactions across every screen.

### Features
### Core Gameplay
*Scrambled letter tiles*  with staggered entrance animations
*Fisher-Yates shuffle algorithm* — guarantees the scrambled word always differs from the original
*Case-insensitive answer checking*
*3 attempts per word* with animated heart-break feedback
*Countdown timer* — circular SVG with color transitions (green → amber → red) and pulse warning under 5 seconds
*Score tracking* with floating "+points" animation on correct answers
*Auto-advance* after correct/wrong/timeout with manual "Next Word" option

### Difficulty Levels
Level	Timer	Hints	Base Score	Word Length
Easy	30s	3	10 pts	3–4 letters
Medium	22s	2	20 pts	5–6 letters
Hard	15s	1	30 pts	7–11 letters
### Categories (5)
🐾 Animals
🍎 Fruits
💻 Tech
🌍 Countries
⚽ Sports
Each category contains 12–15 words per difficulty (180+ total words).

### Advanced Features
Hint System — Reveals one letter at its correct position in the scramble (costs 5 pts)
Shuffle Button — Re-scrambles letters with flip animation, preserves revealed hints
Leaderboard — Top 10 scores stored in localStorage with name, score, difficulty, and date
Dark / Light Mode — Toggle via icon button, persists during session
Sound On/Off Toggle — All sounds synthesized via Web Audio API (no external files)
Progress Bar — Tracks words completed out of 10 per round
Keyboard Support — Enter to submit answer or advance to next word
### Animations & Effects
Confetti — Canvas-based particle system with gravity, rotation, air resistance, and color variety
Shake — Input field shakes on wrong answer
Correct Pulse — Tiles glow green with expanding ring
Heart Break — Animated heart shrink/rotate on lost life
Timer Pulse — Pulsing scale when time is critical
Floating Score — "+N" text floats upward and fades on point gain
Tile Flip — 3D Y-axis rotation on shuffle
Background Blobs — Three colored blobs drifting with different speeds/paths
Loading Screen — Text-scramble decryption effect (random chars → "WORD SCRAMBLE")
Screens
Loading — Animated text reveal + progress bar
Menu — Difficulty chips, category grid, start/leaderboard/toggles
Game — Full HUD (score, timer, lives, progress, tiles, input, actions)
Game Over — Dynamic title based on accuracy, 4-stat grid, save-to-leaderboard
Leaderboard — Ranked table with score, name, difficulty badge, clear option
### Technical Details
### Architecture
Single HTML file — All CSS in <style>, all JS in <script>
ES6+ JavaScript — No build tools, no frameworks, no polyfills needed
CSS Custom Properties — Full theming via data-theme attribute on <html>
Glassmorphism — backdrop-filter: blur(24px) with semi-transparent backgrounds
Responsive — clamp() for typography/tiles, flexible grids, mobile-first considerations
Accessibility — aria-label, aria-live, role="radiogroup", :focus-visible, prefers-reduced-motion

### Sound Engine
All sounds are synthesized in real-time using the Web Audio API:

OscillatorNode for tonal sounds (click, correct chord, wrong buzz, hint chime, tick)
AudioBufferSourceNode with noise buffer for shuffle sound
No external audio files — works offline

### Confetti Engine
Dedicated <canvas> overlay with pointer-events: none
100 particles per launch with random size, color, velocity, rotation, and decay
Physics: gravity (vy += 0.12), air resistance (vx *= 0.99), opacity fade
Auto-cleans when all particles expire

### Word Scramble Algorithm
Split word into character array
Fisher-Yates shuffle
If result === original, reshuffle (up to 100 attempts)
For hints: place revealed letters at correct indices,
shuffle remaining letters into unfilled positions
text


### Data Storage
- `localStorage` key: `wordscramble_lb`
- Format: JSON array of `{ name, score, difficulty, category, date }`
- Capped at 10 entries, sorted by score descending

## How to Run

1. **Download** `index.html`
2. **Open** it in any modern browser (Chrome, Firefox, Safari, Edge)
3. That's it — no server, no install, no build step

> **Note:** Sound requires a user interaction first (click any button) to unlock the AudioContext, per browser autoplay policy.


## Browser Compatibility

| Browser         | Supported |
|-----------------|-----------|
| Chrome 80+      | ✅        |
| Firefox 78+     | ✅        |
| Safari 14+      | ✅        |
| Edge 80+        | ✅        |
| Mobile Chrome   | ✅        |
| Mobile Safari   | ✅        |

`backdrop-filter` is required for the glassmorphism effect. It is unsupported on Firefox for Android (graceful fallback to semi-transparent background).


## Project Structure

word-scramble/
└── index.html ← Everything lives here
├── <style> ← 400+ lines of CSS
├── <body> ← Semantic HTML with ARIA attributes
└── <script> ← 500+ lines of ES6+ JavaScript

text
 

## Customization

### Adding Words
Edit the `WORDS` object in the `<script>` section:

```javascript
WORDS.yourCategory = {
    easy: ['word1', 'word2'],
    medium: ['longer1', 'longer2'],
    hard: ['muchlonger1', 'muchlonger2']
};
Then add a category card in the HTML:

Changing Colors
Edit the CSS custom properties in :root (dark) and [data-theme="light"]:

css

--accent: #22c55e;       /* Main accent color */
--secondary: #f59e0b;    /* Secondary/highlight color */
--danger: #ef4444;       /* Error/danger color */
Adjusting Difficulty
Modify the settings objects:

javascript

timerSettings: { easy: 30, medium: 22, hard: 15 },
hintSettings:  { easy: 3,  medium: 2,  hard: 1  },
scoreSettings: { easy: 10, medium: 20, hard: 30 },
Changing Words Per Round
javascript

wordsPerRound: 10 
QR Forge — Advanced QR Code Generator
A professional, feature-rich QR code generator built as a single self-contained HTML file. No build tools, no dependencies to install, no server required — just open in a browser and go.

Features
Content Types
Encode six different data formats with dedicated form fields and proper standard encoding:

Type	Standard	Fields
Text / URL	Raw UTF-8	Free text input
WiFi	WIFI:T:...;S:...;P:...;H:...;;	SSID, Password, Encryption (WPA/WEP/None), Hidden toggle
Email	mailto: URI	Recipient, Subject, Body
Phone	tel: URI	Phone number
SMS	smsto: format	Phone number, Message
vCard	vCard 3.0	First/Last name, Phone, Email, Organization, Website, Address
WiFi fields automatically escape special characters (\, ;, ,, ", :) per the ZXing barcode spec. vCard output includes BEGIN:VCARD, VERSION:3.0, and END:VCARD bookends with all populated fields.

Module Styles
Three rendering styles for QR modules, each drawn directly on Canvas:

Square — Classic pixel-perfect rectangles
Rounded — Rounded rectangles with 38% corner radius and 6% inset padding
Dots — Circles at 44% module radius for a softer look
Color System
Solid mode — Foreground and background color pickers
Gradient mode — Toggle to a diagonal linear gradient with start/end color pickers
10 color presets — One-click swatches (Classic, Inverted, Ember, Ocean, Forest, Berry, Slate, Gold, Indigo, Teal) shown as split-half circles
Dimensions
Size slider — 120px to 800px output resolution in 10px steps
Margin slider — 0 to 6 module-wide quiet zone modules
Error Correction
Four levels presented as visual buttons with fill bars showing recovery capacity:

Level	Recovery	Use case
L	7%	Maximum data density
M	15%	Balanced (default)
Q	25%	Decorative styles
H	30%	Logo overlays, damaged environments
Logo Overlay
Upload via click or drag-and-drop
Renders with a rounded white backing, accent-colored border ring, and clipped corners
Dedicated size slider (10%–35% of QR dimensions)
Auto-upgrades error correction to H when a logo is detected, with a toast notification
Export
PNG — Full-resolution download from Canvas via toDataURL
SVG — Programmatic vector markup with gradient <defs> support, downloaded as .svg
Copy — Clipboard API integration (ClipboardItem) for instant pasting
History
Slide-in drawer from the right edge
Stores up to 12 recent generations in localStorage
Each entry includes: 96×96 thumbnail, truncated data preview, type icon, relative timestamp
Click to restore settings, hover to reveal per-item delete, footer button to clear all
Thumbnail generation uses a simplified Canvas render (solid color, no gradient/logo) for storage efficiency
Theme
Light and dark mode via data-theme attribute on <html>
All colors driven by CSS custom properties for instant switching
Persisted across sessions in localStorage
Icon toggles between moon and sun
Persistence
Every control value and all form field contents are saved to localStorage under the key qrForgeSettings. On page load, the full state is restored and the UI is synced before the first generation.

Technical Architecture
Single-File Design
Everything lives in one HTML file — styles in <style>, logic in <script>. Zero build steps. Zero npm. Open index.html directly.

External CDN Dependencies
Library	Version	Purpose
qrcode-generator	1.4.4	QR data encoding and module matrix generation
Font Awesome	6.5.0	UI icons
Google Fonts	—	Space Grotesk (headings) + DM Sans (body)
No frameworks. No bundlers. No package.json.

Rendering Pipeline
User input → encodeData() → qrcode(type, ecLevel) → qr.make()
→ renderCanvas(qr) → Canvas 2D context drawing
→ generateSVG(qr) → String-based SVG markup

text

The `qrcode-generator` library produces a module matrix (`isDark(row, col)`). All visual rendering — styles, colors, gradients, logos — is handled by custom Canvas 2D drawing code, giving full control over every pixel.

### Canvas Rendering Details
- Background: full-canvas `fillRect`
- Foreground fill: either solid `fillStyle` or a `createLinearGradient` diagonal
- Modules: drawn individually via `drawModule()` with style branching
- Logo: layered approach — white `roundRect` backing → stroke border → `clip()` + `drawImage()`
- All radius values clamped with `Math.max(0.01, ...)` to prevent zero-radius errors

### SVG Export
Generated as a string with:
- `<defs>` block for gradient when active
- Individual `<rect>` / `<circle>` / rounded `<rect>` elements per module
- `<image>` element for logo with `preserveAspectRatio="xMidYMid slice"`
- Proper `xmlns`, `viewBox`, `width`, `height` attributes

### Browser Compatibility
- **`roundRect` polyfill** — Custom implementation using `arcTo` for browsers without native `CanvasRenderingContext2D.prototype.roundRect`
- **`var` instead of `let`/`const`** — Avoids edge-case scoping issues in older engines
- **No arrow functions** — Standard `function()` syntax throughout
- **`ClipboardItem` fallback** — Graceful error toast when clipboard API is unavailable

### Responsive Behavior
- **Desktop (>860px)** — Side-by-side layout: scrollable controls panel (400px) + sticky preview panel
- **Tablet (481–860px)** — Stacked vertically, controls first, preview below
- **Mobile (≤480px)** — Compact padding, smaller type tabs, wrapped action buttons

### Accessibility
- `role="form"` and `aria-label` on the controls panel
- `role="tablist"` / `role="tab"` / `aria-selected` on content type tabs
- `aria-label` on all icon-only buttons
- Escape key closes the history drawer
- `prefers-reduced-motion` media query disables all animations and transitions


The `qrcode-generator` library produces a module matrix (`isDark(row, col)`). All visual rendering — styles, colors, gradients, logos — is handled by custom Canvas 2D drawing code, giving full control over every pixel.

That's it. One file.

## Usage

### Quick Start
1. Download or clone this repository
2. Open `index.html` in any modern browser
3. Type content, adjust settings, export

### No Server Needed
The file works with `file://` protocol. No localhost, no Python server, no Node required.

### If You Want a Server Anyway
```bash
# Python
python3 -m http.server 8000

# Node (npx, no install)
npx serve .

# PHP
php -S localhost:8000

### Canvas Rendering Details
- Background: full-canvas `fillRect`
- Foreground fill: either solid `fillStyle` or a `createLinearGradient` diagonal
- Modules: drawn individually via `drawModule()` with style branching
- Logo: layered approach — white `roundRect` backing → stroke border → `clip()` + `drawImage()`
- All radius values clamped with `Math.max(0.01, ...)` to prevent zero-radius errors

### SVG Export
Generated as a string with:
- `<defs>` block for gradient when active
- Individual `<rect>` / `<circle>` / rounded `<rect>` elements per module
- `<image>` element for logo with `preserveAspectRatio="xMidYMid slice"`
- Proper `xmlns`, `viewBox`, `width`, `height` attributes

### Browser Compatibility
- **`roundRect` polyfill** — Custom implementation using `arcTo` for browsers without native `CanvasRenderingContext2D.prototype.roundRect`
- **`var` instead of `let`/`const`** — Avoids edge-case scoping issues in older engines
- **No arrow functions** — Standard `function()` syntax throughout
- **`ClipboardItem` fallback** — Graceful error toast when clipboard API is unavailable

### Responsive Behavior
- **Desktop (>860px)** — Side-by-side layout: scrollable controls panel (400px) + sticky preview panel
- **Tablet (481–860px)** — Stacked vertically, controls first, preview below
- **Mobile (≤480px)** — Compact padding, smaller type tabs, wrapped action buttons

### Accessibility
- `role="form"` and `aria-label` on the controls panel
- `role="tablist"` / `role="tab"` / `aria-selected` on content type tabs
- `aria-label` on all icon-only buttons
- Escape key closes the history drawer
- `prefers-reduced-motion` media query disables all animations and transitions

---

## File Structure

qr-forge/
└── index.html ← Everything: HTML structure, CSS styles, JavaScript logic

text


That's it. One file.

---

## Usage

### Quick Start
1. Download or clone this repository
2. Open `index.html` in any modern browser
3. Type content, adjust settings, export

### No Server Needed
The file works with `file://` protocol. No localhost, no Python server, no Node required.

### If You Want a Server Anyway
```bash
# Python
python3 -m http.server 8000

# Node (npx, no install)
npx serve .

# PHP
php -S localhost:8000
localStorage Keys
Key
Content
qrForgeSettings	JSON object with all control values and form field contents
qrForgeHistory	JSON array of up to 12 history entries, each with thumbnail (base64 PNG), encoded data string, type, timestamp, and settings snapshot

Clear both to reset to defaults:

javascript

localStorage.removeItem('qrForgeSettings');
localStorage.removeItem('qrForgeHistory');
Design Decisions
Why qrcode-generator instead of qrcodejs?
The original code used qrcodejs, which renders by creating DOM <img> or <canvas> elements internally — making it impossible to control drawing style, apply gradients, or add logo overlays. qrcode-generator exposes the raw module matrix via isDark(), giving full rendering control.

Why Canvas instead of DOM/SVG for the preview?
Canvas allows pixel-level control for gradient fills, clipped logo images, and consistent rendering across export formats. The preview Canvas is the export source — no re-rendering or format mismatch.

Why no framework?
A QR generator with this feature set doesn't need reactive state management, virtual DOM diffing, or component architecture. Vanilla JS with a central state object is simpler, faster to load, and has zero dependency risk.

Why warm terracotta accent instead of blue?
The brief explicitly prohibits default blue/purple schemes. Terracotta (#C94A2E) provides high contrast on both light and dark backgrounds, feels distinctive, and pairs naturally with the warm neutral palette.

Limitations
No batch generation — One QR at a time
No vCard restore from history — Only Text type restores the actual data string; other types restore settings but not parsed form fields (the encoded strings like WIFI:T:... aren't reversibly parsed back into individual form inputs)
Logo not embedded in SVG — SVG export references the logo as a base64 href on an <image> tag, which works but isn't truly inline vector
No print stylesheet — Not optimized for paper output
History thumbnails are simplified — No gradient or logo in thumbnails to keep localStorage usage reasonable
License
This project is provided as-is for personal and commercial use. The external libraries (qrcode-generator, Font Awesome, Google Fonts) are subject to their respective licenses
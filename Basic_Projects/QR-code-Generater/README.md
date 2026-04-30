# QR Forge — Advanced QR Code Generator

A professional, feature-rich QR code generator built as a **single self-contained HTML file**.

No build tools. No installation. No server required.  
Just open `index.html` in your browser and start generating.


##  Features

###  Supported Content Types

Encode multiple data formats with proper standards:

| Type        | Standard Format            | Fields |
|------------|---------------------------|--------|
| Text / URL | Raw UTF-8                 | Free text |
| WiFi       | `WIFI:T:...;S:...;P:...;H:...;;` | SSID, Password, Encryption, Hidden |
| Email      | `mailto:` URI             | Recipient, Subject, Body |
| Phone      | `tel:` URI                | Phone number |
| SMS        | `smsto:` format           | Phone number, Message |
| vCard      | vCard 3.0                 | Name, Phone, Email, Org, Website, Address |

✔ WiFi fields auto-escape special characters  
✔ vCard includes full standard structure (BEGIN / VERSION / END)


###  QR Module Styles

Three visual styles rendered via Canvas:

- **Square** — Classic sharp modules  
- **Rounded** — Soft corners (38% radius)  
- **Dots** — Circular modules (modern look)


### Color System

- Solid colors (foreground + background)
- Gradient mode (diagonal linear gradient)
- 10 built-in presets:
  - Classic, Inverted, Ember, Ocean, Forest, Berry, Slate, Gold, Indigo, Teal


###  Dimensions

- Size: **120px → 800px**
- Margin (quiet zone): **0 → 6 modules**

### 🛡 Error Correction Levels

| Level | Recovery | Use Case |
|------|--------|---------|
| L | 7%  | Maximum data density |
| M | 15% | Balanced (default) |
| Q | 25% | Decorative QR |
| H | 30% | Logos / damage resistance |


###  Logo Overlay

- Drag & drop or upload
- Auto styling:
  - White rounded background
  - Accent border ring
  - Clipped edges
- Size control: **10% → 35%**
- Automatically upgrades error correction to **H**


###  Export Options

- PNG (Canvas export)
- SVG (vector with gradient support)
- Copy to clipboard (Clipboard API)


###  History System

- Stores up to **12 recent QR codes**
- Includes:
  - Thumbnail preview
  - Data preview
  - Type icon
  - Timestamp
- Features:
  - Click to restore
  - Delete individual items
  - Clear all history


###  Theme Support

- Light / Dark mode
- Uses CSS variables
- Saved in `localStorage`
- Toggle icon (sun/moon)


###  Persistence

All settings auto-save in `localStorage`:

| Key | Description |
|-----|------------|
| `qrForgeSettings` | UI state + form data |
| `qrForgeHistory`  | History entries |

Reset manually:

```javascript
localStorage.removeItem('qrForgeSettings');
localStorage.removeItem('qrForgeHistory');
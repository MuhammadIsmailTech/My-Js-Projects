VaultKey
A premium, modern, and visually stunning random password generator built with vanilla HTML, CSS, and JavaScript. Featuring a glassmorphism UI, real-time entropy calculation, and crack-time estimation.

HTML5CSS3JavaScriptLicense

✨ Features
Cryptographically Secure: Uses crypto.getRandomValues() instead of Math.random() for true unpredictability.
Real-Time Generation: Password updates instantly as you adjust the slider or toggle options.
Customizable Length: Adjustable length slider ranging from 4 to 64 characters.
Character Toggles: Option to include Uppercase, Lowercase, Numbers, and Symbols (with guaranteed inclusion).
Strength Analysis: Animated progress bar showing Weak, Fair, Medium, Strong, or Excellent.
Entropy Calculation: Displays password entropy in bits (length × log₂(pool size)).
Crack Time Estimation: Shows estimated brute-force crack time based on 10 billion guesses/second.
Color-Coded Characters: Syntax-highlighted password display (Gold for uppercase, Blue for numbers, Pink for symbols).
Show/Hide Toggle: Mask your password with bullet points when shoulder-surfing.
Clipboard Integration: One-click copy with visual success animation and toast notification.
Dark/Light Mode: Sleek theme toggle with smooth CSS variable transitions.
Persistent State: Remembers your last generated password and selected theme via localStorage.
Premium UI: Glassmorphism design, animated background orbs, smooth micro-interactions, and responsive layout.
🚀 Quick Start
No build tools, bundlers, or frameworks required. Just download and open!

Clone or download the repository:
git clone https://github.com/MuhammadIsmailTech/Random-Password-Generater
Navigate to the project folder:
bash

cd vaultkey
Open index.html in your preferred browser:
bash

# On macOS
open index.html

# On Windows
start index.html

# On Linux
xdg-open index.html
🛠️ Tech Stack
Structure: Semantic HTML5
Styling: CSS3 (Custom Properties, Glassmorphism, Keyframe Animations, Flexbox, Grid)
Logic: Vanilla JavaScript (ES5/ES6 compatible, modular function-based architecture)
Fonts: Poppins (UI) & JetBrains Mono (Passwords)
Icons: Font Awesome 6
📁 Project Structure
text

vaultkey/
│
├── index.html      # Main markup, structure, and Font Awesome/Google Fonts CDN links
├── style.css       # Complete styling, themes, animations, and responsive breakpoints
├── script.js       # Application logic, password generation, entropy math, and events
└── README.md       # You are here!
📖 Usage Guide
Adjust Length: Drag the slider to set your desired password length (4–64).
Select Characters: Check/uncheck the boxes for Uppercase, Lowercase, Numbers, and Symbols. At least one must remain checked.
View Password: The generated password appears in the display box. Click the 👁️ icon to toggle visibility.
Analyze Strength: Look at the colored bar below the password to gauge strength, entropy (bits), and estimated crack time.
Copy: Click the 📋 icon to copy the password to your clipboard. A toast notification will confirm the action.
Regenerate: Click the 🔄 icon or the main "Generate Password" button to create a new one.
Toggle Theme: Click the sun/moon icon in the top right corner to switch between Dark and Light modes.
🔒 Security Note
VaultKey runs 100% client-side.

No passwords are ever transmitted over the internet.
No cookies or tracking scripts are used.
localStorage is only used to save your theme preference and the last generated password for convenience.
Best Practice: For highly sensitive accounts, generate passwords on a trusted, offline device and clear them from localStorage if sharing the device.

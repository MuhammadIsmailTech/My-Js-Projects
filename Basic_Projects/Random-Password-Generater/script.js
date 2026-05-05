/**
 * VaultKey — Advanced Password Generator
 * Modular, well-commented JavaScript with real-time entropy,
 * crack-time estimation, localStorage persistence, and theming.
 */

// =============================================
// 1. Application State
// =============================================
const state = {
  password: '',
  lastPassword: '',
  length: 16,
  options: {
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  },
  showPassword: true,
  darkMode: true
};

// =============================================
// 2. Character Sets
// =============================================
const CHARSETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// =============================================
// 3. DOM Element References
// =============================================
const DOM = {};

function cacheDOMElements() {
  DOM.passwordText        = document.getElementById('passwordText');
  DOM.toggleVisibility    = document.getElementById('toggleVisibility');
  DOM.copyBtn             = document.getElementById('copyBtn');
  DOM.regenerateBtn       = document.getElementById('regenerateBtn');
  DOM.strengthLabel       = document.getElementById('strengthLabel');
  DOM.strengthValue       = document.getElementById('strengthValue');
  DOM.strengthBar         = document.getElementById('strengthBar');
  DOM.entropyValue        = document.getElementById('entropyValue');
  DOM.crackTime           = document.getElementById('crackTime');
  DOM.lengthSlider        = document.getElementById('lengthSlider');
  DOM.lengthBadge         = document.getElementById('lengthBadge');
  DOM.optionInputs        = document.querySelectorAll('.option-input');
  DOM.optionsWarning      = document.getElementById('optionsWarning');
  DOM.generateBtn         = document.getElementById('generateBtn');
  DOM.themeToggle         = document.getElementById('themeToggle');
  DOM.lastPasswordSection = document.getElementById('lastPasswordSection');
  DOM.lastPasswordValue   = document.getElementById('lastPasswordValue');
  DOM.toastContainer      = document.getElementById('toastContainer');
}

// =============================================
// 4. Cryptographically Secure Random
// =============================================
function getSecureRandom(max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

// =============================================
// 5. Password Generation
// =============================================

/**
 * Generates a random password ensuring at least one character
 * from each selected character type is included.
 */
function generatePassword() {
  var pool = '';
  var guaranteedChars = [];

  var types = Object.keys(CHARSETS);
  for (var t = 0; t < types.length; t++) {
    var type = types[t];
    if (state.options[type]) {
      pool += CHARSETS[type];
      guaranteedChars.push(CHARSETS[type][getSecureRandom(CHARSETS[type].length)]);
    }
  }

  if (pool.length === 0) return '';

  var remaining = Math.max(0, state.length - guaranteedChars.length);
  var chars = guaranteedChars.slice();

  for (var i = 0; i < remaining; i++) {
    chars.push(pool[getSecureRandom(pool.length)]);
  }

  // Fisher-Yates shuffle for uniform randomness
  for (var j = chars.length - 1; j > 0; j--) {
    var k = getSecureRandom(j + 1);
    var temp = chars[j];
    chars[j] = chars[k];
    chars[k] = temp;
  }

  return chars.join('');
}

// =============================================
// 6. Entropy Calculation
// =============================================

/**
 * Calculates password entropy in bits.
 * Entropy = length × log₂(pool_size)
 */
function calculateEntropy() {
  var poolSize = 0;
  var types = Object.keys(CHARSETS);
  for (var i = 0; i < types.length; i++) {
    if (state.options[types[i]]) {
      poolSize += CHARSETS[types[i]].length;
    }
  }
  if (poolSize === 0 || state.password.length === 0) return 0;
  return state.password.length * Math.log2(poolSize);
}

// =============================================
// 7. Crack Time Estimation
// =============================================

/**
 * Estimates time to crack using brute force.
 * Assumes 10 billion guesses/second (modern GPU cluster).
 */
function estimateCrackTime(entropy) {
  if (entropy <= 0) return '--';

  var guessesPerSecond = 10e9;
  var totalCombinations = Math.pow(2, entropy);
  var seconds = totalCombinations / guessesPerSecond / 2;

  return formatTime(seconds);
}

/**
 * Formats seconds into a human-readable time string.
 */
function formatTime(seconds) {
  if (seconds < 0.001) return 'Instantly';
  if (seconds < 1) return 'Less than a second';
  if (seconds < 60) return Math.round(seconds) + ' seconds';
  if (seconds < 3600) return Math.round(seconds / 60) + ' minutes';
  if (seconds < 86400) return Math.round(seconds / 3600) + ' hours';
  if (seconds < 2592000) return Math.round(seconds / 86400) + ' days';
  if (seconds < 31536000) return Math.round(seconds / 2592000) + ' months';

  var years = seconds / 31536000;
  if (years < 1000) return Math.round(years) + ' years';
  if (years < 1e6) return (years / 1e3).toFixed(1) + ' thousand years';
  if (years < 1e9) return (years / 1e6).toFixed(1) + ' million years';
  if (years < 1e12) return (years / 1e9).toFixed(1) + ' billion years';

  return 'Trillions of years+';
}

// =============================================
// 8. Strength Level
// =============================================

/**
 * Returns strength level based on entropy.
 * Returns { label, color, percentage }
 */
function getStrengthLevel(entropy) {
  if (entropy <= 0)  return { label: '--',        color: 'var(--text-muted)',        pct: 0 };
  if (entropy < 30)  return { label: 'Weak',      color: 'var(--strength-weak)',     pct: 15 };
  if (entropy < 50)  return { label: 'Fair',      color: 'var(--strength-fair)',     pct: 35 };
  if (entropy < 70)  return { label: 'Medium',    color: 'var(--strength-medium)',   pct: 55 };
  if (entropy < 100) return { label: 'Strong',    color: 'var(--strength-strong)',   pct: 78 };
  return              { label: 'Excellent', color: 'var(--strength-excellent)', pct: 100 };
}

// =============================================
// 9. UI Update Functions
// =============================================

/**
 * Renders the password into the display with per-character
 * color coding and staggered reveal animation.
 */
function updatePasswordDisplay() {
  DOM.passwordText.innerHTML = '';

  if (!state.password) {
    DOM.passwordText.innerHTML =
      '<span style="color:var(--text-muted);font-size:0.85rem;">Select options to generate</span>';
    return;
  }

  var chars = state.password.split('');

  for (var i = 0; i < chars.length; i++) {
    var span = document.createElement('span');
    span.classList.add('char-span');

    if (state.showPassword) {
      span.textContent = chars[i];
      if (CHARSETS.uppercase.indexOf(chars[i]) !== -1) {
        span.classList.add('char-upper');
      } else if (CHARSETS.lowercase.indexOf(chars[i]) !== -1) {
        span.classList.add('char-lower');
      } else if (CHARSETS.numbers.indexOf(chars[i]) !== -1) {
        span.classList.add('char-number');
      } else {
        span.classList.add('char-symbol');
      }
    } else {
      span.textContent = '\u2022';
      span.classList.add('char-hidden');
    }

    span.style.animationDelay = (i * 20) + 'ms';
    DOM.passwordText.appendChild(span);
  }
}

/**
 * Updates the strength bar, label, entropy, and crack time.
 */
function updateStrengthDisplay() {
  var entropy = calculateEntropy();
  var strength = getStrengthLevel(entropy);

  DOM.strengthBar.style.width = strength.pct + '%';
  DOM.strengthBar.style.background = strength.color;
  DOM.strengthBar.style.boxShadow = strength.pct > 0
    ? '0 0 12px ' + strength.color
    : 'none';

  DOM.strengthValue.textContent = strength.label;
  DOM.strengthValue.style.color = strength.color;

  DOM.entropyValue.textContent = entropy > 0
    ? Math.round(entropy) + ' bits'
    : '0 bits';

  DOM.crackTime.textContent = estimateCrackTime(entropy);
}

/**
 * Updates the slider fill gradient to show progress.
 */
function updateSliderFill() {
  var min = parseInt(DOM.lengthSlider.min, 10);
  var max = parseInt(DOM.lengthSlider.max, 10);
  var val = parseInt(DOM.lengthSlider.value, 10);
  var pct = ((val - min) / (max - min)) * 100;

  DOM.lengthSlider.style.background =
    'linear-gradient(to right, var(--accent) ' + pct + '%, var(--input-bg) ' + pct + '%)';
  DOM.lengthBadge.textContent = val;
}

/**
 * Validates that at least one option is checked.
 * Enables/disables the generate button and shows/hides warning.
 */
function validateOptions() {
  var anyChecked = false;
  var keys = Object.keys(state.options);
  for (var i = 0; i < keys.length; i++) {
    if (state.options[keys[i]]) {
      anyChecked = true;
      break;
    }
  }

  DOM.generateBtn.disabled = !anyChecked;

  if (anyChecked) {
    DOM.optionsWarning.classList.remove('visible');
  } else {
    DOM.optionsWarning.classList.add('visible');
  }

  return anyChecked;
}

// =============================================
// 10. Core Generation Pipeline
// =============================================

/**
 * Main function: generates a new password and updates all UI.
 */
function performGeneration() {
  if (!validateOptions()) {
    state.password = '';
    updatePasswordDisplay();
    updateStrengthDisplay();
    return;
  }

  // Save current password as "last" before generating new one
  if (state.password) {
    state.lastPassword = state.password;
    saveLastPassword();
    showLastPassword();
  }

  state.password = generatePassword();
  updatePasswordDisplay();
  updateStrengthDisplay();
}

// =============================================
// 11. Clipboard — Copy to Clipboard
// =============================================
function copyToClipboard() {
  if (!state.password) return;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(state.password).then(onCopySuccess).catch(fallbackCopy);
  } else {
    fallbackCopy();
  }

  function fallbackCopy() {
    try {
      var textarea = document.createElement('textarea');
      textarea.value = state.password;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      onCopySuccess();
    } catch (e) {
      showToast('Copy failed — please copy manually', 'error');
    }
  }
}

function onCopySuccess() {
  DOM.copyBtn.classList.add('copied');
  var icon = DOM.copyBtn.querySelector('i');
  icon.className = 'fa-solid fa-check';

  showToast('Password copied to clipboard', 'success');

  setTimeout(function () {
    DOM.copyBtn.classList.remove('copied');
    icon.className = 'fa-solid fa-copy';
  }, 2000);
}

// =============================================
// 12. Toggle Password Visibility
// =============================================
function togglePasswordVisibility() {
  state.showPassword = !state.showPassword;

  var icon = DOM.toggleVisibility.querySelector('i');
  icon.className = state.showPassword
    ? 'fa-solid fa-eye'
    : 'fa-solid fa-eye-slash';

  DOM.toggleVisibility.setAttribute(
    'data-tooltip',
    state.showPassword ? 'Hide password' : 'Show password'
  );

  updatePasswordDisplay();
}

// =============================================
// 13. Theme Toggle
// =============================================
function toggleTheme() {
  state.darkMode = !state.darkMode;
  document.documentElement.setAttribute(
    'data-theme',
    state.darkMode ? 'dark' : 'light'
  );
  localStorage.setItem('vaultkey-theme', state.darkMode ? 'dark' : 'light');
}

function loadTheme() {
  var saved = localStorage.getItem('vaultkey-theme');
  if (saved === 'light') {
    state.darkMode = false;
    document.documentElement.setAttribute('data-theme', 'light');
  }
}

// =============================================
// 14. Toast Notifications
// =============================================
function showToast(message, type) {
  type = type || 'info';
  var toast = document.createElement('div');
  toast.classList.add('toast', type);

  var iconMap = {
    success: 'fa-solid fa-circle-check',
    error: 'fa-solid fa-circle-xmark',
    info: 'fa-solid fa-circle-info'
  };

  var iconClass = iconMap[type] || iconMap.info;
  toast.innerHTML = '<i class="' + iconClass + '"></i><span>' + message + '</span>';
  DOM.toastContainer.appendChild(toast);

  setTimeout(function () {
    toast.classList.add('leaving');
    toast.addEventListener('animationend', function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    });
  }, 2500);
}

// =============================================
// 15. localStorage — Last Password
// =============================================
function saveLastPassword() {
  localStorage.setItem('vaultkey-last-password', state.lastPassword);
}

function loadLastPassword() {
  var saved = localStorage.getItem('vaultkey-last-password');
  if (saved) {
    state.lastPassword = saved;
    showLastPassword();
  }
}

function showLastPassword() {
  if (!state.lastPassword) return;
  DOM.lastPasswordSection.style.display = 'block';
  DOM.lastPasswordValue.textContent = state.lastPassword;
}

// =============================================
// 16. Event Listeners
// =============================================
function initEventListeners() {
  DOM.toggleVisibility.addEventListener('click', togglePasswordVisibility);

  DOM.copyBtn.addEventListener('click', copyToClipboard);

  DOM.regenerateBtn.addEventListener('click', function () {
    DOM.regenerateBtn.classList.add('regenerating');
    setTimeout(function () {
      DOM.regenerateBtn.classList.remove('regenerating');
    }, 500);
    performGeneration();
  });

  DOM.generateBtn.addEventListener('click', performGeneration);

  DOM.lengthSlider.addEventListener('input', function () {
    state.length = parseInt(DOM.lengthSlider.value, 10);
    updateSliderFill();
    performGeneration();
  });

  var inputs = DOM.optionInputs;
  for (var i = 0; i < inputs.length; i++) {
    inputs[i].addEventListener('change', function () {
      var type = this.getAttribute('data-type');
      state.options[type] = this.checked;
      validateOptions();
      performGeneration();
    });
  }

  DOM.themeToggle.addEventListener('click', toggleTheme);
}

// =============================================
// 17. Initialization
// =============================================
function init() {
  cacheDOMElements();
  loadTheme();
  loadLastPassword();
  updateSliderFill();
  initEventListeners();
  performGeneration();
}

document.addEventListener('DOMContentLoaded', init);
// ==============================
// QuoteVerse - Premium Quote Generator
// ==============================

// Quotes Database
const quotes = {
  en: [
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "Motivation"
    },
    {
      text: "The future depends on what you do today.",
      author: "Mahatma Gandhi",
      category: "Life"
    },
    {
      text: "Dream big and dare to fail.",
      author: "Norman Vaughan",
      category: "Dream"
    },
    {
      text: "Your limitation—it's only your imagination.",
      author: "Unknown",
      category: "Mindset"
    },
    {
      text: "Push yourself because no one else is going to do it for you.",
      author: "Unknown",
      category: "Motivation"
    },
    {
      text: "Small steps every day lead to big results.",
      author: "Unknown",
      category: "Growth"
    }
  ],

  ur: [
    {
      text: "کامیابی آخری منزل نہیں، ناکامی موت نہیں، اصل ہمت آگے بڑھتے رہنے میں ہے۔",
      author: "ونسٹن چرچل",
      category: "حوصلہ"
    },
    {
      text: "آپ کا مستقبل آج کے فیصلوں پر منحصر ہے۔",
      author: "مہاتما گاندھی",
      category: "زندگی"
    },
    {
      text: "بڑے خواب دیکھو اور کوشش سے مت ڈرو۔",
      author: "نامعلوم",
      category: "خواب"
    },
    {
      text: "محنت انسان کو وہاں پہنچا دیتی ہے جہاں قسمت بھی ساتھ دیتی ہے۔",
      author: "نامعلوم",
      category: "کامیابی"
    },
    {
      text: "ہر دن ایک نئی شروعات ہے۔",
      author: "نامعلوم",
      category: "زندگی"
    }
  ]
};

// ==============================
// Variables
// ==============================

let currentLanguage = "en";
let currentQuoteIndex = 0;
let currentCategory = "All";
let autoGenerate = false;
let autoInterval;
let favorites = JSON.parse(localStorage.getItem("quoteverse-favorites")) || [];

// ==============================
// Elements
// ==============================

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const quoteCategory = document.getElementById("quoteCategory");
const quoteCounter = document.getElementById("quoteCounter");

const saveIcon = document.getElementById("saveIcon");
const favCount = document.getElementById("favCount");

const favPanel = document.getElementById("favPanel");
const favOverlay = document.getElementById("favOverlay");
const favList = document.getElementById("favList");
const favEmpty = document.getElementById("favEmpty");

const searchResults = document.getElementById("searchResults");
const mobileSearchResults = document.getElementById("mobileSearchResults");

// ==============================
// Init
// ==============================

window.onload = () => {
  generateQuote();
  updateFavoriteCount();
  renderFavorites();
  createCategories();
  createParticles();
};

// ==============================
// Generate Quote
// ==============================

function generateQuote() {

  const allQuotes = quotes[currentLanguage];

  let filteredQuotes = allQuotes;

  if (currentCategory !== "All") {
    filteredQuotes = allQuotes.filter(
      q => q.category === currentCategory
    );
  }

  currentQuoteIndex = Math.floor(Math.random() * filteredQuotes.length);

  const quote = filteredQuotes[currentQuoteIndex];

  quoteText.innerText = quote.text;
  quoteAuthor.innerText = `— ${quote.author}`;
  quoteCategory.innerText = quote.category;

  if (currentLanguage === "ur") {
    document.getElementById("quoteContent").dir = "rtl";
    quoteText.classList.add("font-urdu");
  } else {
    document.getElementById("quoteContent").dir = "ltr";
    quoteText.classList.remove("font-urdu");
  }

  quoteCounter.innerText =
    `${filteredQuotes.indexOf(quote) + 1} / ${filteredQuotes.length}`;

  updateSaveButton();
}

// ==============================
// Theme Toggle
// ==============================

function toggleTheme() {

  document.documentElement.classList.toggle("dark");

  const icon = document.getElementById("themeIcon");

  if (document.documentElement.classList.contains("dark")) {
    icon.className = "fa-solid fa-moon text-sm";
    localStorage.setItem("theme", "dark");
  } else {
    icon.className = "fa-solid fa-sun text-sm";
    localStorage.setItem("theme", "light");
  }
}

// Load theme
if (localStorage.getItem("theme") === "light") {
  document.documentElement.classList.remove("dark");
}

// ==============================
// Language Switch
// ==============================

function setLanguage(lang) {

  currentLanguage = lang;

  document.getElementById("langLabel").innerText =
    lang === "en" ? "EN" : "اردو";

  generateQuote();
  createCategories();
  closeLangMenu();
}

function toggleLangMenu() {
  document.getElementById("langMenu").classList.toggle("show");
}

function closeLangMenu() {
  document.getElementById("langMenu").classList.remove("show");
}

// ==============================
// Copy Quote
// ==============================

function copyQuote() {

  const text =
    `${quoteText.innerText}\n${quoteAuthor.innerText}`;

  navigator.clipboard.writeText(text);

  showToast("Quote copied!");
}

// ==============================
// Share Quote
// ==============================

function toggleShare() {
  document.getElementById("shareDropdown").classList.toggle("show");
}

function shareQuote(platform) {

  const text =
    `${quoteText.innerText} ${quoteAuthor.innerText}`;

  let url = "";

  if (platform === "whatsapp") {
    url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  if (platform === "facebook") {
    url = `https://www.facebook.com/sharer/sharer.php?u=&quote=${encodeURIComponent(text)}`;
  }

  if (platform === "twitter") {
    url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  }

  window.open(url, "_blank");
}

// ==============================
// Text To Speech
// ==============================

let speech;

function speakQuote() {

  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    return;
  }

  speech = new SpeechSynthesisUtterance(
    `${quoteText.innerText} by ${quoteAuthor.innerText}`
  );

  speech.lang = currentLanguage === "ur" ? "ur-PK" : "en-US";

  speechSynthesis.speak(speech);
}

// ==============================
// Favorites
// ==============================

function toggleFavorite() {

  const quote = {
    text: quoteText.innerText,
    author: quoteAuthor.innerText,
    category: quoteCategory.innerText,
    language: currentLanguage
  };

  const exists = favorites.find(
    q => q.text === quote.text
  );

  if (exists) {
    favorites = favorites.filter(q => q.text !== quote.text);
    showToast("Removed from favorites");
  } else {
    favorites.push(quote);
    showToast("Saved to favorites");
  }

  localStorage.setItem(
    "quoteverse-favorites",
    JSON.stringify(favorites)
  );

  updateFavoriteCount();
  renderFavorites();
  updateSaveButton();
}

function updateSaveButton() {

  const exists = favorites.find(
    q => q.text === quoteText.innerText
  );

  if (exists) {
    saveIcon.className = "fa-solid fa-heart";
  } else {
    saveIcon.className = "fa-regular fa-heart";
  }
}

function updateFavoriteCount() {

  if (favorites.length > 0) {
    favCount.classList.remove("hidden");
    favCount.innerText = favorites.length;
  } else {
    favCount.classList.add("hidden");
  }
}

function renderFavorites() {

  favList.innerHTML = "";

  if (favorites.length === 0) {
    favList.appendChild(favEmpty);
    return;
  }

  favorites.forEach((quote, index) => {

    const div = document.createElement("div");

    div.className =
      "glass rounded-2xl p-4";

    div.innerHTML = `
      <p class="text-sm mb-3">${quote.text}</p>
      <div class="flex justify-between items-center">
        <span class="text-xs opacity-70">${quote.author}</span>
        <button onclick="removeFavorite(${index})"
        class="text-red-500">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;

    favList.appendChild(div);
  });
}

function removeFavorite(index) {

  favorites.splice(index, 1);

  localStorage.setItem(
    "quoteverse-favorites",
    JSON.stringify(favorites)
  );

  renderFavorites();
  updateFavoriteCount();
  updateSaveButton();
}

function clearAllFavorites() {

  favorites = [];

  localStorage.removeItem("quoteverse-favorites");

  renderFavorites();
  updateFavoriteCount();
}

function toggleFavPanel() {

  favPanel.classList.toggle("open");
  favOverlay.classList.toggle("show");
}

// ==============================
// Auto Generate
// ==============================

function toggleAutoGenerate() {

  autoGenerate = !autoGenerate;

  const toggle = document.getElementById("autoToggle");

  if (autoGenerate) {

    toggle.classList.add("active");

    autoInterval = setInterval(() => {
      generateQuote();
    }, 8000);

  } else {

    toggle.classList.remove("active");

    clearInterval(autoInterval);
  }
}

// ==============================
// Search
// ==============================

function toggleSearch() {

  document
    .getElementById("searchWrap")
    .classList.toggle("collapsed");
}

function toggleMobileSearch() {

  document
    .getElementById("mobileSearch")
    .classList.toggle("hidden");
}

function handleSearch(value) {

  const results = quotes[currentLanguage].filter(q =>
    q.text.toLowerCase().includes(value.toLowerCase())
  );

  displaySearchResults(results);
}

function displaySearchResults(results) {

  searchResults.innerHTML = "";
  mobileSearchResults.innerHTML = "";

  if (results.length === 0) {
    return;
  }

  searchResults.classList.remove("hidden");
  mobileSearchResults.classList.remove("hidden");

  results.forEach(q => {

    const item = document.createElement("div");

    item.className =
      "p-3 rounded-xl cursor-pointer dark:hover:bg-white/10 hover:bg-black/5";

    item.innerHTML = `
      <p class="text-sm">${q.text}</p>
      <span class="text-xs opacity-70">${q.author}</span>
    `;

    item.onclick = () => {
      quoteText.innerText = q.text;
      quoteAuthor.innerText = `— ${q.author}`;
      quoteCategory.innerText = q.category;
      closeSearchResults();
    };

    searchResults.appendChild(item.cloneNode(true));
    mobileSearchResults.appendChild(item);
  });
}

function closeSearchResults() {
  searchResults.classList.add("hidden");
  mobileSearchResults.classList.add("hidden");
}

// ==============================
// Categories
// ==============================

function createCategories() {

  const container =
    document.getElementById("categoryFilters");

  container.innerHTML = "";

  const allCategories = [
    "All",
    ...new Set(
      quotes[currentLanguage].map(q => q.category)
    )
  ];

  allCategories.forEach(category => {

    const btn = document.createElement("button");

    btn.className =
      "px-4 py-2 rounded-2xl text-sm glass";

    btn.innerText = category;

    btn.onclick = () => {
      currentCategory = category;
      generateQuote();
    };

    container.appendChild(btn);
  });
}

// ==============================
// Toast
// ==============================

function showToast(message) {

  const container =
    document.getElementById("toastContainer");

  const toast = document.createElement("div");

  toast.className =
    "glass px-4 py-3 rounded-2xl mb-2 text-sm";

  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ==============================
// Download Quote as Image
// ==============================

function downloadQuote() {

  const canvas =
    document.getElementById("dlCanvas");

  const ctx = canvas.getContext("2d");

  canvas.width = 1080;
  canvas.height = 1080;

  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 50px serif";

  wrapText(
    ctx,
    quoteText.innerText,
    100,
    300,
    880,
    70
  );

  ctx.font = "30px sans-serif";

  ctx.fillText(
    quoteAuthor.innerText,
    100,
    700
  );

  const link = document.createElement("a");

  link.download = "quoteverse.png";
  link.href = canvas.toDataURL();

  link.click();

  showToast("Quote downloaded!");
}

function wrapText(
  context,
  text,
  x,
  y,
  maxWidth,
  lineHeight
) {

  const words = text.split(" ");

  let line = "";

  for (let n = 0; n < words.length; n++) {

    const testLine =
      line + words[n] + " ";

    const metrics =
      context.measureText(testLine);

    const testWidth = metrics.width;

    if (testWidth > maxWidth && n > 0) {

      context.fillText(line, x, y);

      line = words[n] + " ";

      y += lineHeight;

    } else {

      line = testLine;
    }
  }

  context.fillText(line, x, y);
}

// ==============================
// Background Particles
// ==============================

function createParticles() {

  const particles =
    document.getElementById("particles");

  for (let i = 0; i < 30; i++) {

    const particle =
      document.createElement("div");

    particle.className = "particle";

    particle.style.left =
      Math.random() * 100 + "%";

    particle.style.top =
      Math.random() * 100 + "%";

    particle.style.animationDuration =
      5 + Math.random() * 10 + "s";

    particles.appendChild(particle);
  }
}

// ==============================
// Close dropdowns outside click
// ==============================

document.addEventListener("click", (e) => {

  if (!document.getElementById("shareWrap").contains(e.target)) {
    document.getElementById("shareDropdown").classList.remove("show");
  }

  if (!document.getElementById("langDropdown").contains(e.target)) {
    closeLangMenu();
  }
});
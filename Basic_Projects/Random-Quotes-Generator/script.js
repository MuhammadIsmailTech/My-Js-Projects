// ============================================
// QuoteVerse - Premium Quote Generator
// Complete script.js
// ============================================

// ============================================
// QUOTES DATABASE
// ============================================

const quotes = {
  en: [
    {
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      category: "Motivation"
    },
    {
      text: "Dream big and dare to fail.",
      author: "Norman Vaughan",
      category: "Dream"
    },
    {
      text: "The future depends on what you do today.",
      author: "Mahatma Gandhi",
      category: "Life"
    },
    {
      text: "Push yourself because no one else is going to do it for you.",
      author: "Unknown",
      category: "Motivation"
    },
    {
      text: "Every moment is a fresh beginning.",
      author: "T. S. Eliot",
      category: "Life"
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
      category: "Mindset"
    }
  ],

  ur: [
    {
      text: "کامیابی آخری منزل نہیں، ناکامی موت نہیں، اصل ہمت آگے بڑھنے میں ہے۔",
      author: "ونسٹن چرچل",
      category: "حوصلہ"
    },
    {
      text: "بڑے خواب دیکھو اور ناکامی سے مت ڈرو۔",
      author: "نامعلوم",
      category: "خواب"
    },
    {
      text: "آپ کا مستقبل آج کے فیصلوں پر منحصر ہے۔",
      author: "مہاتما گاندھی",
      category: "زندگی"
    },
    {
      text: "محنت وہ چابی ہے جو کامیابی کا دروازہ کھولتی ہے۔",
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

// ============================================
// VARIABLES
// ============================================

let currentLanguage = "en";
let currentCategory = "All";
let currentQuote = null;

let autoGenerate = false;
let autoInterval = null;

let favorites =
  JSON.parse(localStorage.getItem("quoteverse-favorites")) || [];

// ============================================
// ELEMENTS
// ============================================

const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const quoteCategory = document.getElementById("quoteCategory");

const searchResults = document.getElementById("searchResults");
const mobileSearchResults =
  document.getElementById("mobileSearchResults");

// ============================================
// PAGE LOAD
// ============================================

window.addEventListener("DOMContentLoaded", () => {

  loadTheme();

  createCategories();

  generateQuote();

  renderFavorites();

  updateFavoriteCount();

  createParticles();
});

// ============================================
// GENERATE RANDOM QUOTE
// ============================================

function generateQuote() {

  let filteredQuotes = quotes[currentLanguage];

  if (currentCategory !== "All") {

    filteredQuotes = filteredQuotes.filter(
      quote => quote.category === currentCategory
    );
  }

  const randomIndex =
    Math.floor(Math.random() * filteredQuotes.length);

  currentQuote = filteredQuotes[randomIndex];

  quoteText.style.opacity = "0";

  setTimeout(() => {

    quoteText.innerText = currentQuote.text;

    quoteAuthor.innerText =
      "— " + currentQuote.author;

    quoteCategory.innerText =
      currentQuote.category;

    if (currentLanguage === "ur") {

      document
        .getElementById("quoteContent")
        .setAttribute("dir", "rtl");

    } else {

      document
        .getElementById("quoteContent")
        .setAttribute("dir", "ltr");
    }

    quoteText.style.opacity = "1";

    updateSaveButton();

  }, 200);
}

// ============================================
// THEME TOGGLE
// ============================================

function toggleTheme() {

  const html = document.documentElement;

  const icon = document.getElementById("themeIcon");

  html.classList.toggle("dark");

  if (html.classList.contains("dark")) {

    localStorage.setItem("theme", "dark");

    icon.className =
      "fa-solid fa-moon text-sm";

  } else {

    localStorage.setItem("theme", "light");

    icon.className =
      "fa-solid fa-sun text-sm";
  }
}

function loadTheme() {

  const savedTheme =
    localStorage.getItem("theme");

  const icon = document.getElementById("themeIcon");

  if (savedTheme === "light") {

    document.documentElement
      .classList.remove("dark");

    icon.className =
      "fa-solid fa-sun text-sm";

  } else {

    document.documentElement
      .classList.add("dark");

    icon.className =
      "fa-solid fa-moon text-sm";
  }
}

// ============================================
// LANGUAGE FUNCTIONS
// ============================================

function toggleLangMenu(event) {

  if (event) event.stopPropagation();

  const menu = document.getElementById("langMenu");

  if (menu.style.display === "block") {

    menu.style.display = "none";

  } else {

    menu.style.display = "block";
  }
}

function closeLangMenu() {

  document.getElementById("langMenu").style.display = "none";
}

function setLanguage(lang) {

  currentLanguage = lang;

  const label = document.getElementById("langLabel");

  label.innerText =
    lang === "en" ? "EN" : "اردو";

  createCategories();

  generateQuote();

  closeLangMenu();

  showToast(
    lang === "en"
      ? "Language changed to English"
      : "زبان اردو میں تبدیل ہوگئی"
  );
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

function toggleSearch() {

  const wrap =
    document.getElementById("searchWrap");

  const input =
    document.getElementById("searchInput");

  wrap.classList.toggle("collapsed");

  if (!wrap.classList.contains("collapsed")) {

    input.style.width = "220px";

    input.focus();

  } else {

    input.style.width = "0px";
  }
}

function toggleMobileSearch() {

  document
    .getElementById("mobileSearch")
    .classList.toggle("hidden");
}

function handleSearch(value) {

  if (value.trim() === "") {

    closeSearchResults();

    return;
  }

  const results =
    quotes[currentLanguage].filter(quote =>
      quote.text
        .toLowerCase()
        .includes(value.toLowerCase())
    );

  displaySearchResults(results);
}

function displaySearchResults(results) {

  searchResults.innerHTML = "";
  mobileSearchResults.innerHTML = "";

  if (results.length === 0) {

    closeSearchResults();

    return;
  }

  searchResults.classList.remove("hidden");

  mobileSearchResults.classList.remove("hidden");

  results.forEach(quote => {

    const createItem = () => {

      const item = document.createElement("div");

      item.className =
        "p-3 rounded-xl cursor-pointer dark:hover:bg-white/10 hover:bg-black/5 transition";

      item.innerHTML = `
        <p class="text-sm mb-1">${quote.text}</p>
        <span class="text-xs opacity-70">${quote.author}</span>
      `;

      item.onclick = () => {

        currentQuote = quote;

        quoteText.innerText = quote.text;

        quoteAuthor.innerText =
          "— " + quote.author;

        quoteCategory.innerText =
          quote.category;

        closeSearchResults();
      };

      return item;
    };

    searchResults.appendChild(createItem());

    mobileSearchResults.appendChild(createItem());
  });
}

function closeSearchResults() {

  searchResults.classList.add("hidden");

  mobileSearchResults.classList.add("hidden");
}

// ============================================
// CATEGORY FILTERS
// ============================================

function createCategories() {

  const container =
    document.getElementById("categoryFilters");

  container.innerHTML = "";

  const categories = [
    "All",
    ...new Set(
      quotes[currentLanguage].map(
        quote => quote.category
      )
    )
  ];

  categories.forEach(category => {

    const btn = document.createElement("button");

    btn.className =
      "px-4 py-2 rounded-2xl glass text-sm transition hover:scale-105";

    btn.innerText = category;

    btn.onclick = () => {

      currentCategory = category;

      generateQuote();
    };

    container.appendChild(btn);
  });
}

// ============================================
// COPY QUOTE
// ============================================

function copyQuote() {

  const text =
    `${quoteText.innerText}\n${quoteAuthor.innerText}`;

  navigator.clipboard.writeText(text);

  showToast("Quote copied!");
}

// ============================================
// SHARE
// ============================================

function toggleShare() {

  document
    .getElementById("shareDropdown")
    .classList.toggle("show");
}

function shareQuote(platform) {

  const text =
    `${quoteText.innerText} ${quoteAuthor.innerText}`;

  let url = "";

  if (platform === "whatsapp") {

    url =
      `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  if (platform === "facebook") {

    url =
      `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(text)}`;
  }

  if (platform === "twitter") {

    url =
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  }

  window.open(url, "_blank");
}

// ============================================
// TEXT TO SPEECH
// ============================================

function speakQuote() {

  speechSynthesis.cancel();

  const speech =
    new SpeechSynthesisUtterance(
      quoteText.innerText
    );

  speech.lang =
    currentLanguage === "ur"
      ? "ur-PK"
      : "en-US";

  speech.rate = 0.9;

  speechSynthesis.speak(speech);
}

// ============================================
// FAVORITES
// ============================================

function toggleFavorite() {

  const exists = favorites.find(
    item => item.text === currentQuote.text
  );

  if (exists) {

    favorites = favorites.filter(
      item => item.text !== currentQuote.text
    );

    showToast("Removed from favorites");

  } else {

    favorites.push(currentQuote);

    showToast("Saved to favorites");
  }

  localStorage.setItem(
    "quoteverse-favorites",
    JSON.stringify(favorites)
  );

  renderFavorites();

  updateFavoriteCount();

  updateSaveButton();
}

function updateSaveButton() {

  const saveIcon =
    document.getElementById("saveIcon");

  const exists = favorites.find(
    item => item.text === currentQuote.text
  );

  if (exists) {

    saveIcon.className =
      "fa-solid fa-heart";

  } else {

    saveIcon.className =
      "fa-regular fa-heart";
  }
}

function renderFavorites() {

  const favList =
    document.getElementById("favList");

  favList.innerHTML = "";

  if (favorites.length === 0) {

    favList.innerHTML = `
      <div class="text-center opacity-60 mt-10">
        No saved quotes yet
      </div>
    `;

    return;
  }

  favorites.forEach((quote, index) => {

    const card = document.createElement("div");

    card.className =
      "glass rounded-2xl p-4 mb-3";

    card.innerHTML = `
      <p class="text-sm mb-2">${quote.text}</p>
      <div class="flex justify-between items-center">
        <span class="text-xs opacity-70">${quote.author}</span>
        <button onclick="removeFavorite(${index})">
          <i class="fa-solid fa-trash text-red-500"></i>
        </button>
      </div>
    `;

    favList.appendChild(card);
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

function updateFavoriteCount() {

  const favCount =
    document.getElementById("favCount");

  if (favorites.length > 0) {

    favCount.classList.remove("hidden");

    favCount.innerText = favorites.length;

  } else {

    favCount.classList.add("hidden");
  }
}

function toggleFavPanel() {

  document
    .getElementById("favPanel")
    .classList.toggle("open");

  document
    .getElementById("favOverlay")
    .classList.toggle("show");
}

// ============================================
// AUTO GENERATE
// ============================================

function toggleAutoGenerate() {

  autoGenerate = !autoGenerate;

  const toggle =
    document.getElementById("autoToggle");

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

// ============================================
// DOWNLOAD IMAGE
// ============================================

function downloadQuote() {

  const canvas =
    document.getElementById("dlCanvas");

  const ctx =
    canvas.getContext("2d");

  canvas.width = 1080;
  canvas.height = 1080;

  ctx.fillStyle = "#111827";
  ctx.fillRect(0, 0, 1080, 1080);

  ctx.fillStyle = "#ffffff";

  ctx.font = "bold 52px serif";

  wrapText(
    ctx,
    quoteText.innerText,
    100,
    350,
    850,
    70
  );

  ctx.font = "32px sans-serif";

  ctx.fillText(
    quoteAuthor.innerText,
    100,
    750
  );

  const link =
    document.createElement("a");

  link.download = "quoteverse.png";

  link.href = canvas.toDataURL();

  link.click();

  showToast("Quote downloaded!");
}

function wrapText(
  ctx,
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
      ctx.measureText(testLine);

    const testWidth = metrics.width;

    if (
      testWidth > maxWidth &&
      n > 0
    ) {

      ctx.fillText(line, x, y);

      line = words[n] + " ";

      y += lineHeight;

    } else {

      line = testLine;
    }
  }

  ctx.fillText(line, x, y);
}

// ============================================
// TOAST
// ============================================

function showToast(message) {

  const container =
    document.getElementById("toastContainer");

  const toast =
    document.createElement("div");

  toast.className =
    "glass px-4 py-3 rounded-2xl text-sm mb-2";

  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => {

    toast.remove();

  }, 3000);
}

// ============================================
// PARTICLES
// ============================================

function createParticles() {

  const container =
    document.getElementById("particles");

  for (let i = 0; i < 25; i++) {

    const particle =
      document.createElement("div");

    particle.className = "particle";

    particle.style.left =
      Math.random() * 100 + "%";

    particle.style.top =
      Math.random() * 100 + "%";

    particle.style.animationDuration =
      5 + Math.random() * 10 + "s";

    container.appendChild(particle);
  }
}

// ============================================
// OUTSIDE CLICK
// ============================================

document.addEventListener("click", e => {

  const langDropdown =
    document.getElementById("langDropdown");

  if (
    !langDropdown.contains(e.target)
  ) {

    closeLangMenu();
  }

  const shareWrap =
    document.getElementById("shareWrap");

  if (
    !shareWrap.contains(e.target)
  ) {

    document
      .getElementById("shareDropdown")
      .classList.remove("show");
  }
});
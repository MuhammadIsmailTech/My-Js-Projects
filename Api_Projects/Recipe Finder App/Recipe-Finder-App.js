/* ============================================
   FLAVORVAULT — RECIPE FINDER APP
   Pure Vanilla JS, no frameworks
   ============================================ */

// ============================================
// API CONFIGURATION
// ============================================
const API_BASE = 'https://www.themealdb.com/api/json/v1/1';
const ENDPOINTS = {
    search: (q) => `${API_BASE}/search.php?s=${encodeURIComponent(q)}`,
    filterByIngredient: (i) => `${API_BASE}/filter.php?i=${encodeURIComponent(i)}`,
    filterByCategory: (c) => `${API_BASE}/filter.php?c=${encodeURIComponent(c)}`,
    lookup: (id) => `${API_BASE}/lookup.php?i=${id}`,
    categories: () => `${API_BASE}/categories.php`,
    random: () => `${API_BASE}/random.php`,
};

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    currentRecipes: [],
    currentPage: 1,
    perPage: 12,
    currentFilter: 'all',
    currentSearch: '',
    favorites: JSON.parse(localStorage.getItem('fv_favorites') || '[]'),
    searchHistory: JSON.parse(localStorage.getItem('fv_history') || '[]'),
    recentlyViewed: JSON.parse(localStorage.getItem('fv_recent') || '[]'),
    theme: localStorage.getItem('fv_theme') || 'light',
    lang: localStorage.getItem('fv_lang') || 'en',
    timerInterval: null,
    timerSeconds: 0,
    timerRunning: false,
    nutritionChart: null,
    suggestionIndex: -1,
};

// ============================================
// TRANSLATIONS (English / Urdu)
// ============================================
const translations = {
    en: {
        'nav.trending': 'Trending',
        'nav.recipes': 'Recipes',
        'nav.favorites': 'Favorites',
        'hero.title1': 'Discover Culinary',
        'hero.title2': 'Masterpieces',
        'hero.sub': 'Explore thousands of recipes from around the world. Search by name, ingredient, or category.',
        'hero.surprise': 'Surprise Me',
        'search.placeholder': 'Search recipes, ingredients...',
        'search.recent': 'Recent:',
        'filter.all': 'All',
        'filter.vegetarian': 'Vegetarian',
        'filter.vegan': 'Vegan',
        'filter.dessert': 'Dessert',
        'filter.seafood': 'Seafood',
        'filter.chicken': 'Chicken',
        'filter.quick': 'Quick Meals',
        'trending.title': 'Trending Now',
        'recent.title': 'Recently Viewed',
        'recipes.all': 'All Recipes',
        'recipes.results': 'Results for',
        'empty.title': 'No recipes found',
        'empty.sub': 'Try a different search term or filter.',
        'favorites.title': 'Your Favorites',
        'favorites.empty': 'No favorites yet. Start adding recipes!',
        'modal.ingredients': 'Ingredients',
        'modal.instructions': 'Instructions',
        'modal.nutrition': 'Nutrition Info',
        'modal.timer': 'Cooking Timer',
        'modal.video': 'Watch Tutorial',
        'modal.share': 'Share',
        'modal.download': 'Download PDF',
        'modal.addFav': 'Add to Favorites',
        'modal.removeFav': 'Remove from Favorites',
        'toast.added': 'Added to favorites!',
        'toast.removed': 'Removed from favorites!',
        'toast.copied': 'Link copied to clipboard!',
        'toast.pdf': 'PDF downloaded!',
        'toast.voice': 'Listening...',
        'toast.voiceError': 'Voice search not supported.',
        'footer.desc': 'Discover, cook, and share amazing recipes from around the world.',
        'footer.explore': 'Explore',
        'footer.follow': 'Follow Us',
        'footer.rights': 'All rights reserved.',
        'footer.api': 'Powered by TheMealDB API',
        'timer.start': 'Start',
        'timer.pause': 'Pause',
        'timer.reset': 'Reset',
        'timer.done': 'Timer complete!',
    },
    ur: {
        'nav.trending': 'رجحان',
        'nav.recipes': 'تراکیب',
        'nav.favorites': 'پسندیدہ',
        'hero.title1': 'کولنری',
        'hero.title2': 'شاہکار تلاش کریں',
        'hero.sub': 'دنیا بھر سے ہزاروں تراکیب تلاش کریں۔ نام، اجزاء، یا زمرے کے مطابق تلاش کریں۔',
        'hero.surprise': 'مجھے حیران کریں',
        'search.placeholder': 'تراکیب، اجزاء تلاش کریں...',
        'search.recent': 'حالیہ:',
        'filter.all': 'سب',
        'filter.vegetarian': 'سبزی خور',
        'filter.vegan': 'وگان',
        'filter.dessert': 'مٹھائیاں',
        'filter.seafood': 'سمندری غذا',
        'filter.chicken': 'چکن',
        'filter.quick': 'فوری کھانا',
        'trending.title': 'ابھی رجحان میں',
        'recent.title': 'حالیہ دیکھے گئے',
        'recipes.all': 'تمام تراکیب',
        'recipes.results': 'نتائج',
        'empty.title': 'کوئی ترکیب نہیں ملی',
        'empty.sub': 'مختلف تلاش یا فلٹر آزمائیں۔',
        'favorites.title': 'آپ کے پسندیدہ',
        'favorites.empty': 'ابھی کوئی پسندیدہ نہیں۔ تراکیب شامل کریں!',
        'modal.ingredients': 'اجزاء',
        'modal.instructions': 'ہدایات',
        'modal.nutrition': 'غذائی معلومات',
        'modal.timer': 'کوکنگ ٹائمر',
        'modal.video': 'ٹیوٹوریل دیکھیں',
        'modal.share': 'شیئر',
        'modal.download': 'PDF ڈاؤنلوڈ',
        'modal.addFav': 'پسندیدہ میں شامل کریں',
        'modal.removeFav': 'پسندیدہ سے ہٹائیں',
        'toast.added': 'پسندیدہ میں شامل!',
        'toast.removed': 'پسندیدہ سے ہٹا دیا!',
        'toast.copied': 'لنک کاپی ہو گیا!',
        'toast.pdf': 'PDF ڈاؤنلوڈ ہو گئی!',
        'toast.voice': 'سن رہا ہے...',
        'toast.voiceError': 'وائس سرچ سپورٹ نہیں۔',
        'footer.desc': 'دنیا بھر سے شاندار تراکیب تلاش کریں، پکائیں، اور شیئر کریں۔',
        'footer.explore': 'دریافت کریں',
        'footer.follow': 'ہمیں فالو کریں',
        'footer.rights': 'جملہ حقوق محفوظ ہیں۔',
        'footer.api': 'TheMealDB API کی مدد سے',
        'timer.start': 'شروع',
        'timer.pause': 'روکیں',
        'timer.reset': 'ری سیٹ',
        'timer.done': 'ٹائمر مکمل!',
    },
};

// ============================================
// DOM REFERENCES
// ============================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const DOM = {
    splash: $('#splash'),
    navbar: $('#navbar'),
    searchInput: $('#search-input'),
    searchSubmit: $('#search-submit'),
    voiceBtn: $('#voice-btn'),
    suggestionsDropdown: $('#suggestions-dropdown'),
    searchHistory: $('#search-history'),
    historyTags: $('#history-tags'),
    clearHistory: $('#clear-history'),
    surpriseBtn: $('#surprise-btn'),
    filterBtns: $$('.filter-btn'),
    trendingScroll: $('#trending-scroll'),
    recentSection: $('#recently-viewed-section'),
    recentScroll: $('#recent-scroll'),
    recipeGrid: $('#recipe-grid'),
    resultsTitle: $('#results-title'),
    emptyState: $('#empty-state'),
    pagination: $('#pagination'),
    modalOverlay: $('#modal-overlay'),
    modalBody: $('#modal-body'),
    modalClose: $('#modal-close'),
    favOverlay: $('#fav-overlay'),
    favModalBody: $('#fav-modal-body'),
    favGrid: $('#fav-grid'),
    favEmpty: $('#fav-empty'),
    favCount: $('#fav-count'),
    openFavBtn: $('#open-favorites-btn'),
    favModalClose: $('#fav-modal-close'),
    themeToggle: $('#theme-toggle'),
    themeIcon: $('#theme-icon'),
    langToggle: $('#lang-toggle'),
    langLabel: $('#lang-label'),
    toastContainer: $('#toast-container'),
    mobileMenuBtn: $('#mobile-menu-btn'),
    navLinks: $('#nav-links'),
    footerFavLink: $('#footer-fav-link'),
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/** Simple hash from string for deterministic random values */
function hashStr(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}

/** Deterministic "rating" from meal ID (3.5 – 5.0) */
function getRating(id) {
    return (3.5 + (hashStr(id) % 15) / 10).toFixed(1);
}

/** Deterministic cooking time from meal ID and category */
function getCookTime(id, category) {
    const base = {
        Dessert: 45, Chicken: 50, Beef: 60, Seafood: 35,
        Vegetarian: 30, Vegan: 25, Pasta: 25, Pork: 55,
        Lamb: 65, Goat: 70, Side: 20, Starter: 15, Miscellaneous: 40,
    };
    const b = base[category] || 40;
    return Math.max(10, b + (hashStr(id) % 20) - 10);
}

/** Generate plausible nutrition data based on category */
function generateNutrition(category) {
    const profiles = {
        Dessert:    { cal: 420, protein: 5,  carbs: 62, fat: 18, fiber: 2, sugar: 42 },
        Chicken:    { cal: 380, protein: 38, carbs: 18, fat: 16, fiber: 3, sugar: 4  },
        Beef:       { cal: 450, protein: 32, carbs: 20, fat: 28, fiber: 2, sugar: 5  },
        Seafood:    { cal: 280, protein: 30, carbs: 12, fat: 12, fiber: 1, sugar: 3  },
        Vegetarian: { cal: 320, protein: 14, carbs: 42, fat: 10, fiber: 8, sugar: 8  },
        Vegan:      { cal: 290, protein: 12, carbs: 40, fat: 9,  fiber: 10, sugar: 6 },
        Pasta:      { cal: 400, protein: 16, carbs: 55, fat: 12, fiber: 4, sugar: 5  },
        Pork:       { cal: 420, protein: 28, carbs: 15, fat: 28, fiber: 1, sugar: 3  },
        Lamb:       { cal: 480, protein: 30, carbs: 10, fat: 35, fiber: 1, sugar: 2  },
        Side:       { cal: 200, protein: 6,  carbs: 28, fat: 8,  fiber: 5, sugar: 6  },
        Starter:    { cal: 220, protein: 10, carbs: 22, fat: 10, fiber: 3, sugar: 4  },
        Goat:       { cal: 460, protein: 28, carbs: 8,  fat: 34, fiber: 1, sugar: 2  },
        Miscellaneous:{ cal: 350, protein: 18, carbs: 35, fat: 14, fiber: 4, sugar: 7 },
    };
    return profiles[category] || profiles.Miscellaneous;
}

/** Parse ingredients from TheMealDB meal object */
function parseIngredients(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ing && ing.trim()) {
            ingredients.push(`${measure ? measure.trim() + ' ' : ''}${ing.trim()}`);
        }
    }
    return ingredients;
}

/** Parse instructions into steps */
function parseInstructions(instructions) {
    if (!instructions) return [];
    return instructions
        .split(/\r?\n/)
        .map(s => s.replace(/^\d+\.\s*/, '').trim())
        .filter(s => s.length > 0);
}

/** Debounce helper */
function debounce(fn, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/** Format seconds to MM:SS */
function formatTime(totalSeconds) {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

/** Get translation */
function t(key) {
    return translations[state.lang]?.[key] || translations.en[key] || key;
}

// ============================================
// API FUNCTIONS (async/await)
// ============================================

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

async function searchRecipes(query) {
    const data = await fetchJSON(ENDPOINTS.search(query));
    return data.meals || [];
}

async function filterByCategory(category) {
    const data = await fetchJSON(ENDPOINTS.filterByCategory(category));
    return data.meals || [];
}

async function filterByIngredient(ingredient) {
    const data = await fetchJSON(ENDPOINTS.filterByIngredient(ingredient));
    return data.meals || [];
}

async function getRecipeById(id) {
    const data = await fetchJSON(ENDPOINTS.lookup(id));
    return data.meals ? data.meals[0] : null;
}

async function getRandomRecipe() {
    const data = await fetchJSON(ENDPOINTS.random());
    return data.meals ? data.meals[0] : null;
}

async function getCategories() {
    const data = await fetchJSON(ENDPOINTS.categories());
    return data.categories || [];
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

// ============================================
// SPLASH SCREEN
// ============================================
function initSplash() {
    setTimeout(() => {
        DOM.splash.classList.add('hidden');
        document.body.style.overflow = '';
    }, 2000);
    document.body.style.overflow = 'hidden';
}

// ============================================
// THEME TOGGLE
// ============================================
function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    DOM.themeIcon.className = state.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    localStorage.setItem('fv_theme', state.theme);
}

function toggleTheme() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    applyTheme();
}

// ============================================
// LANGUAGE TOGGLE
// ============================================
function applyLanguage() {
    DOM.langLabel.textContent = state.lang === 'en' ? 'UR' : 'EN';
    // Update all data-i18n elements
    $$('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    $$('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    localStorage.setItem('fv_lang', state.lang);
}

function toggleLanguage() {
    state.lang = state.lang === 'en' ? 'ur' : 'en';
    applyLanguage();
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
function handleScroll() {
    DOM.navbar.classList.toggle('scrolled', window.scrollY > 40);
}

// ============================================
// MOBILE MENU
// ============================================
function toggleMobileMenu() {
    const isOpen = DOM.navLinks.classList.toggle('open');
    DOM.mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    DOM.mobileMenuBtn.querySelector('i').className = isOpen ? 'fas fa-times' : 'fas fa-bars';
}

// ============================================
// SEARCH HISTORY
// ============================================
function addToHistory(query) {
    const q = query.trim().toLowerCase();
    if (!q || q.length < 2) return;
    state.searchHistory = [q, ...state.searchHistory.filter(h => h !== q)].slice(0, 8);
    localStorage.setItem('fv_history', JSON.stringify(state.searchHistory));
    renderHistory();
}

function clearHistory() {
    state.searchHistory = [];
    localStorage.setItem('fv_history', '[]');
    renderHistory();
}

function renderHistory() {
    if (state.searchHistory.length === 0) {
        DOM.searchHistory.hidden = true;
        return;
    }
    DOM.searchHistory.hidden = false;
    DOM.historyTags.innerHTML = state.searchHistory
        .map(h => `<span class="history-tag" data-query="${h}"><i class="fas fa-clock"></i> ${h}</span>`)
        .join('');
}

// ============================================
// SEARCH SUGGESTIONS (Real-time)
// ============================================
let suggestAbort = null;

async function fetchSuggestions(query) {
    if (!query || query.length < 2) {
        hideSuggestions();
        return;
    }
    try {
        // Abort previous request
        if (suggestAbort) suggestAbort.abort();
        suggestAbort = new AbortController();

        const res = await fetch(ENDPOINTS.search(query), { signal: suggestAbort.signal });
        const data = await res.json();
        const meals = data.meals || [];

        if (meals.length === 0) {
            hideSuggestions();
            return;
        }

        state.suggestionIndex = -1;
        DOM.suggestionsDropdown.innerHTML = meals.slice(0, 8).map((m, i) => `
            <div class="suggestion-item" role="option" data-id="${m.idMeal}" data-name="${m.strMeal}" data-index="${i}">
                <img src="${m.strMealThumb}/preview" alt="" loading="lazy" width="40" height="40">
                <span class="sug-text">${highlightMatch(m.strMeal, query)}</span>
            </div>
        `).join('');
        DOM.suggestionsDropdown.hidden = false;

        // Click handlers for suggestions
        DOM.suggestionsDropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                DOM.searchInput.value = item.dataset.name;
                hideSuggestions();
                performSearch(item.dataset.name);
            });
        });
    } catch (e) {
        if (e.name !== 'AbortError') hideSuggestions();
    }
}

function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) +
        `<strong style="color:var(--primary)">${text.slice(idx, idx + query.length)}</strong>` +
        text.slice(idx + query.length);
}

function hideSuggestions() {
    DOM.suggestionsDropdown.hidden = true;
    state.suggestionIndex = -1;
}

function navigateSuggestions(direction) {
    const items = DOM.suggestionsDropdown.querySelectorAll('.suggestion-item');
    if (items.length === 0) return;

    items.forEach(i => i.classList.remove('active'));
    state.suggestionIndex += direction;
    if (state.suggestionIndex < 0) state.suggestionIndex = items.length - 1;
    if (state.suggestionIndex >= items.length) state.suggestionIndex = 0;

    items[state.suggestionIndex].classList.add('active');
    DOM.searchInput.value = items[state.suggestionIndex].dataset.name;
}

const debouncedSuggest = debounce(fetchSuggestions, 300);

// ============================================
// VOICE SEARCH
// ============================================
function initVoiceSearch() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        DOM.voiceBtn.style.display = 'none';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = state.lang === 'ur' ? 'ur-PK' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    DOM.voiceBtn.addEventListener('click', () => {
        if (DOM.voiceBtn.classList.contains('listening')) {
            recognition.stop();
            return;
        }
        recognition.start();
        DOM.voiceBtn.classList.add('listening');
        showToast(t('toast.voice'), 'info');
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        DOM.searchInput.value = transcript;
        DOM.voiceBtn.classList.remove('listening');
        performSearch(transcript);
    };

    recognition.onerror = () => {
        DOM.voiceBtn.classList.remove('listening');
    };

    recognition.onend = () => {
        DOM.voiceBtn.classList.remove('listening');
    };
}

// ============================================
// MAIN SEARCH LOGIC
// ============================================
async function performSearch(query) {
    query = query.trim();
    if (!query) return;

    state.currentSearch = query;
    state.currentFilter = 'all';
    state.currentPage = 1;
    updateFilterUI();
    addToHistory(query);

    // Update title
    DOM.resultsTitle.textContent = `${t('recipes.results')} "${query}"`;

    showSkeleton();
    hideEmpty();

    try {
        let meals;
        // Try name search first, then ingredient search
        meals = await searchRecipes(query);
        if (meals.length === 0) {
            meals = await filterByIngredient(query);
        }

        state.currentRecipes = meals.map(m => ({
            id: m.idMeal,
            title: m.strMeal,
            thumb: m.strMealThumb,
            category: m.strCategory || 'Miscellaneous',
        }));

        renderRecipes();
    } catch (err) {
        showToast('Failed to fetch recipes. Please try again.', 'error');
        DOM.recipeGrid.innerHTML = '';
        showEmpty();
    }
}

// ============================================
// FILTER LOGIC
// ============================================
async function applyFilter(filter) {
    state.currentFilter = filter;
    state.currentSearch = '';
    state.currentPage = 1;
    DOM.searchInput.value = '';
    hideSuggestions();
    updateFilterUI();

    if (filter === 'all') {
        DOM.resultsTitle.textContent = t('recipes.all');
        // Load some default recipes
        showSkeleton();
        try {
            const meals = await searchRecipes('a'); // Returns a broad set
            state.currentRecipes = meals.map(m => ({
                id: m.idMeal,
                title: m.strMeal,
                thumb: m.strMealThumb,
                category: m.strCategory || 'Miscellaneous',
            }));
            renderRecipes();
        } catch {
            showEmpty();
        }
        return;
    }

    if (filter === 'quick') {
        // Combine Side + Starter for "quick meals"
        DOM.resultsTitle.textContent = t('filter.quick');
        showSkeleton();
        try {
            const [sides, starters] = await Promise.all([
                filterByCategory('Side'),
                filterByCategory('Starter'),
            ]);
            const all = [...(sides || []), ...(starters || [])];
            // Remove duplicates
            const seen = new Set();
            state.currentRecipes = all
                .filter(m => { if (seen.has(m.idMeal)) return false; seen.add(m.idMeal); return true; })
                .map(m => ({
                    id: m.idMeal,
                    title: m.strMeal,
                    thumb: m.strMealThumb,
                    category: filter,
                }));
            renderRecipes();
        } catch {
            showEmpty();
        }
        return;
    }

    DOM.resultsTitle.textContent = t(`filter.${filter.toLowerCase()}`) || filter;
    showSkeleton();

    try {
        const meals = await filterByCategory(filter);
        state.currentRecipes = meals.map(m => ({
            id: m.idMeal,
            title: m.strMeal,
            thumb: m.strMealThumb,
            category: filter,
        }));
        renderRecipes();
    } catch {
        showToast('Failed to load filter results.', 'error');
        showEmpty();
    }
}

function updateFilterUI() {
    DOM.filterBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === state.currentFilter);
    });
}

// ============================================
// RENDERING — SKELETON
// ============================================
function showSkeleton() {
    let html = '';
    for (let i = 0; i < state.perPage; i++) {
        html += `
        <div class="skeleton-card" style="animation-delay:${i * 0.05}s">
            <div class="skeleton-img"></div>
            <div class="skeleton-body">
                <div class="skeleton-line w-80"></div>
                <div class="skeleton-line w-60"></div>
                <div class="skeleton-line w-40"></div>
            </div>
        </div>`;
    }
    DOM.recipeGrid.innerHTML = html;
    DOM.pagination.hidden = true;
    DOM.emptyState.hidden = true;
}

function showEmpty() {
    DOM.emptyState.hidden = false;
    DOM.pagination.hidden = true;
}

function hideEmpty() {
    DOM.emptyState.hidden = true;
}

// ============================================
// RENDERING — RECIPE CARDS
// ============================================
function renderRecipes() {
    const { currentRecipes, currentPage, perPage } = state;
    const start = (currentPage - 1) * perPage;
    const pageRecipes = currentRecipes.slice(start, start + perPage);

    if (pageRecipes.length === 0) {
        DOM.recipeGrid.innerHTML = '';
        showEmpty();
        DOM.pagination.hidden = true;
        return;
    }

    hideEmpty();
    DOM.recipeGrid.innerHTML = pageRecipes.map((r, i) => {
        const isFav = state.favorites.includes(r.id);
        const rating = getRating(r.id);
        const time = getCookTime(r.id, r.category);
        return `
        <article class="recipe-card" data-id="${r.id}" style="animation-delay:${i * 0.06}s" tabindex="0" aria-label="${r.title}">
            <div class="card-img-wrap">
                <img src="${r.thumb}" alt="${r.title}" loading="lazy" width="400" height="200">
                <span class="card-category-badge">${r.category}</span>
                <button class="card-fav-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${r.id}" aria-label="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="${isFav ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
            <div class="card-body">
                <h3 class="card-title">${r.title}</h3>
                <p class="card-desc">${r.category} recipe — a delightful dish ready in about ${time} minutes.</p>
                <div class="card-footer">
                    <div class="card-meta">
                        <span><i class="far fa-clock"></i> ${time}m</span>
                        <span><i class="fas fa-tag"></i> ${r.category}</span>
                    </div>
                    <div class="card-rating"><i class="fas fa-star"></i> ${rating}</div>
                </div>
            </div>
        </article>`;
    }).join('');

    renderPagination();
    initLazyLoading();
    bindCardEvents();
}

// ============================================
// RENDERING — PAGINATION
// ============================================
function renderPagination() {
    const totalPages = Math.ceil(state.currentRecipes.length / state.perPage);
    if (totalPages <= 1) {
        DOM.pagination.hidden = true;
        return;
    }

    DOM.pagination.hidden = false;
    let html = `<button class="page-btn" data-page="prev" ${state.currentPage === 1 ? 'disabled' : ''} aria-label="Previous page"><i class="fas fa-chevron-left"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        if (totalPages > 7) {
            // Show first, last, current, and neighbors
            if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
                html += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
            } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
                html += `<span class="page-btn" style="cursor:default;border:none;">...</span>`;
            }
        } else {
            html += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
    }

    html += `<button class="page-btn" data-page="next" ${state.currentPage === totalPages ? 'disabled' : ''} aria-label="Next page"><i class="fas fa-chevron-right"></i></button>`;
    DOM.pagination.innerHTML = html;

    // Bind pagination clicks
    DOM.pagination.querySelectorAll('.page-btn[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const p = btn.dataset.page;
            if (p === 'prev') state.currentPage = Math.max(1, state.currentPage - 1);
            else if (p === 'next') state.currentPage = Math.min(totalPages, state.currentPage + 1);
            else state.currentPage = parseInt(p);
            renderRecipes();
            // Scroll to grid
            DOM.recipeGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

// ============================================
// RENDERING — TRENDING SECTION
// ============================================
async function loadTrending() {
    try {
        const promises = Array.from({ length: 10 }, () => getRandomRecipe());
        const meals = (await Promise.all(promises)).filter(Boolean);
        // Remove duplicates
        const seen = new Set();
        const unique = meals.filter(m => {
            if (seen.has(m.idMeal)) return false;
            seen.add(m.idMeal);
            return true;
        });

        DOM.trendingScroll.innerHTML = unique.slice(0, 8).map(m => {
            const rating = getRating(m.idMeal);
            const time = getCookTime(m.idMeal, m.strCategory || 'Miscellaneous');
            return `
            <div class="trending-card" data-id="${m.idMeal}" tabindex="0" aria-label="${m.strMeal}">
                <div class="trending-img-wrap">
                    <img src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy" width="280" height="180">
                    <span class="trending-badge"><i class="fas fa-fire"></i> Hot</span>
                </div>
                <div class="trending-info">
                    <h3>${m.strMeal}</h3>
                    <div class="trending-meta">
                        <span><i class="far fa-clock"></i> ${time}m</span>
                        <span><i class="fas fa-star" style="color:var(--accent)"></i> ${rating}</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        // Bind clicks
        DOM.trendingScroll.querySelectorAll('.trending-card').forEach(card => {
            card.addEventListener('click', () => openRecipeModal(card.dataset.id));
            card.addEventListener('keydown', e => { if (e.key === 'Enter') openRecipeModal(card.dataset.id); });
        });
    } catch {
        // Silently fail — trending is optional
    }
}

// ============================================
// RECENTLY VIEWED
// ============================================
function addToRecent(id) {
    state.recentlyViewed = [id, ...state.recentlyViewed.filter(r => r !== id)].slice(0, 6);
    localStorage.setItem('fv_recent', JSON.stringify(state.recentlyViewed));
    renderRecentlyViewed();
}

async function renderRecentlyViewed() {
    if (state.recentlyViewed.length === 0) {
        DOM.recentSection.hidden = true;
        return;
    }
    DOM.recentSection.hidden = false;

    try {
        const promises = state.recentlyViewed.map(id => getRecipeById(id));
        const meals = (await Promise.all(promises)).filter(Boolean);

        DOM.recentScroll.innerHTML = meals.map(m => {
            const rating = getRating(m.idMeal);
            const time = getCookTime(m.idMeal, m.strCategory || 'Miscellaneous');
            return `
            <div class="trending-card" data-id="${m.idMeal}" tabindex="0" aria-label="${m.strMeal}">
                <div class="trending-img-wrap">
                    <img src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy" width="280" height="180">
                </div>
                <div class="trending-info">
                    <h3>${m.strMeal}</h3>
                    <div class="trending-meta">
                        <span><i class="far fa-clock"></i> ${time}m</span>
                        <span><i class="fas fa-star" style="color:var(--accent)"></i> ${rating}</span>
                    </div>
                </div>
            </div>`;
        }).join('');

        DOM.recentScroll.querySelectorAll('.trending-card').forEach(card => {
            card.addEventListener('click', () => openRecipeModal(card.dataset.id));
            card.addEventListener('keydown', e => { if (e.key === 'Enter') openRecipeModal(card.dataset.id); });
        });
    } catch {
        DOM.recentSection.hidden = true;
    }
}

// ============================================
// FAVORITES
// ============================================
function toggleFavorite(id) {
    const idx = state.favorites.indexOf(id);
    if (idx === -1) {
        state.favorites.push(id);
        showToast(t('toast.added'), 'success');
    } else {
        state.favorites.splice(idx, 1);
        showToast(t('toast.removed'), 'info');
    }
    localStorage.setItem('fv_favorites', JSON.stringify(state.favorites));
    updateFavCount();
    updateFavButtons(id);
}

function isFav(id) {
    return state.favorites.includes(id);
}

function updateFavCount() {
    DOM.favCount.textContent = state.favorites.length;
    DOM.favCount.setAttribute('data-count', state.favorites.length);
}

function updateFavButtons(id) {
    $$('.card-fav-btn').forEach(btn => {
        if (btn.dataset.favId === id) {
            const fav = isFav(id);
            btn.classList.toggle('is-fav', fav);
            btn.querySelector('i').className = fav ? 'fas fa-heart' : 'far fa-heart';
            btn.setAttribute('aria-label', fav ? 'Remove from favorites' : 'Add to favorites');
        }
    });
    // Also update modal button if open
    const modalFavBtn = $('#modal-fav-btn');
    if (modalFavBtn && modalFavBtn.dataset.id === id) {
        const fav = isFav(id);
        modalFavBtn.classList.toggle('fav-active', fav);
        modalFavBtn.innerHTML = `<i class="${fav ? 'fas' : 'far'} fa-heart"></i> ${fav ? t('modal.removeFav') : t('modal.addFav')}`;
    }
}

function openFavoritesModal() {
    DOM.favOverlay.hidden = false;
    requestAnimationFrame(() => DOM.favOverlay.classList.add('active'));
    document.body.style.overflow = 'hidden';
    renderFavoritesGrid();
}

function closeFavoritesModal() {
    DOM.favOverlay.classList.remove('active');
    setTimeout(() => {
        DOM.favOverlay.hidden = true;
        document.body.style.overflow = '';
    }, 350);
}

async function renderFavoritesGrid() {
    if (state.favorites.length === 0) {
        DOM.favEmpty.style.display = '';
        DOM.favGrid.innerHTML = '';
        return;
    }
    DOM.favEmpty.style.display = 'none';

    try {
        const promises = state.favorites.map(id => getRecipeById(id));
        const meals = (await Promise.all(promises)).filter(Boolean);

        DOM.favGrid.innerHTML = meals.map((m, i) => {
            const rating = getRating(m.idMeal);
            const time = getCookTime(m.idMeal, m.strCategory || 'Miscellaneous');
            return `
            <article class="recipe-card" data-id="${m.idMeal}" style="animation-delay:${i * 0.06}s" tabindex="0">
                <div class="card-img-wrap">
                    <img src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy" width="400" height="200">
                    <span class="card-category-badge">${m.strCategory || 'Miscellaneous'}</span>
                    <button class="card-fav-btn is-fav" data-fav-id="${m.idMeal}" aria-label="Remove from favorites">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card-body">
                    <h3 class="card-title">${m.strMeal}</h3>
                    <p class="card-desc">${m.strCategory || 'Miscellaneous'} recipe</p>
                    <div class="card-footer">
                        <div class="card-meta">
                            <span><i class="far fa-clock"></i> ${time}m</span>
                        </div>
                        <div class="card-rating"><i class="fas fa-star"></i> ${rating}</div>
                    </div>
                </div>
            </article>`;
        }).join('');

        // Bind events
        DOM.favGrid.querySelectorAll('.recipe-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.card-fav-btn')) return;
                closeFavoritesModal();
                setTimeout(() => openRecipeModal(card.dataset.id), 400);
            });
        });
        DOM.favGrid.querySelectorAll('.card-fav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleFavorite(btn.dataset.favId);
                renderFavoritesGrid();
            });
        });
    } catch {
        DOM.favGrid.innerHTML = '<p style="color:var(--fg-muted);padding:20px;">Failed to load favorites.</p>';
    }
}

// ============================================
// RECIPE DETAIL MODAL
// ============================================
async function openRecipeModal(id) {
    DOM.modalOverlay.hidden = false;
    document.body.style.overflow = 'hidden';
    DOM.modalBody.innerHTML = '<div style="padding:60px;text-align:center;color:var(--fg-muted)"><i class="fas fa-spinner fa-spin" style="font-size:2rem;margin-bottom:12px;display:block"></i>Loading recipe...</div>';

    requestAnimationFrame(() => DOM.modalOverlay.classList.add('active'));

    try {
        const meal = await getRecipeById(id);
        if (!meal) {
            DOM.modalBody.innerHTML = '<p style="padding:40px;text-align:center;">Recipe not found.</p>';
            return;
        }

        addToRecent(id);
        const ingredients = parseIngredients(meal);
        const instructions = parseInstructions(meal.strInstructions);
        const category = meal.strCategory || 'Miscellaneous';
        const rating = getRating(meal.idMeal);
        const cookTime = getCookTime(meal.idMeal, category);
        const area = meal.strArea || 'Unknown';
        const fav = isFav(id);
        const youtubeId = meal.strYoutube ? new URL(meal.strYoutube).searchParams.get('v') : null;

        DOM.modalBody.innerHTML = `
            <div class="modal-hero">
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <div class="modal-hero-overlay"></div>
            </div>
            <div class="modal-content-grid">
                <div class="modal-left">
                    <h2 class="modal-title">${meal.strMeal}</h2>
                    <div class="modal-meta-row">
                        <span class="meta-chip"><i class="fas fa-tag"></i> ${category}</span>
                        <span class="meta-chip"><i class="fas fa-globe"></i> ${area}</span>
                        <span class="meta-chip"><i class="far fa-clock"></i> ${cookTime} min</span>
                        <span class="meta-chip"><i class="fas fa-star" style="color:var(--accent)"></i> ${rating}</span>
                    </div>
                    <div class="modal-actions-row">
                        <button class="modal-action-btn ${fav ? 'fav-active' : ''}" id="modal-fav-btn" data-id="${id}">
                            <i class="${fav ? 'fas' : 'far'} fa-heart"></i> ${fav ? t('modal.removeFav') : t('modal.addFav')}
                        </button>
                        <button class="modal-action-btn" id="modal-share-btn" data-url="${meal.strYoutube || window.location.href}">
                            <i class="fas fa-share-alt"></i> ${t('modal.share')}
                        </button>
                        <button class="modal-action-btn" id="modal-pdf-btn" data-id="${id}">
                            <i class="fas fa-file-pdf"></i> ${t('modal.download')}
                        </button>
                    </div>

                    ${youtubeId ? `
                    <div class="modal-section-title"><i class="fab fa-youtube"></i> ${t('modal.video')}</div>
                    <div class="video-embed">
                        <iframe src="https://www.youtube.com/embed/${youtubeId}" allowfullscreen loading="lazy" title="${meal.strMeal} video tutorial"></iframe>
                    </div>` : ''}

                    <div class="modal-section-title"><i class="fas fa-list-ol"></i> ${t('modal.instructions')}</div>
                    <div class="instructions-list">
                        ${instructions.map((step, i) => `
                            <div class="instruction-step">
                                <span class="step-num">${i + 1}</span>
                                <p class="step-text">${step}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-right">
                    <div class="modal-section-title"><i class="fas fa-carrot"></i> ${t('modal.ingredients')} <span style="font-weight:400;font-size:0.8rem;color:var(--fg-muted)">(${ingredients.length})</span></div>
                    <div class="ingredient-list" id="ingredient-list">
                        ${ingredients.map(ing => `
                            <div class="ingredient-item" tabindex="0" role="checkbox" aria-checked="false">
                                <span class="ingredient-check"><i class="fas fa-check"></i></span>
                                <span class="ingredient-text">${ing}</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="modal-section-title" style="margin-top:24px"><i class="fas fa-chart-pie"></i> ${t('modal.nutrition')}</div>
                    <div class="nutrition-chart-wrap">
                        <canvas id="nutrition-chart"></canvas>
                    </div>

                    <div class="modal-section-title" style="margin-top:24px"><i class="fas fa-stopwatch"></i> ${t('modal.timer')}</div>
                    <div class="timer-section">
                        <div class="timer-display" id="timer-display">${formatTime(cookTime * 60)}</div>
                        <div class="timer-controls">
                            <button class="timer-btn start" id="timer-start">${t('timer.start')}</button>
                            <button class="timer-btn pause" id="timer-pause" style="display:none">${t('timer.pause')}</button>
                            <button class="timer-btn reset" id="timer-reset">${t('timer.reset')}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Bind modal events
        bindModalEvents(id, meal, cookTime, category);

    } catch (err) {
        DOM.modalBody.innerHTML = `<p style="padding:40px;text-align:center;color:var(--secondary);">Failed to load recipe. Please try again.</p>`;
    }
}

function closeRecipeModal() {
    DOM.modalOverlay.classList.remove('active');
    clearTimer();
    if (state.nutritionChart) {
        state.nutritionChart.destroy();
        state.nutritionChart = null;
    }
    setTimeout(() => {
        DOM.modalOverlay.hidden = true;
        document.body.style.overflow = '';
    }, 350);
}

function bindModalEvents(id, meal, cookTime, category) {
    // Favorite button
    const favBtn = $('#modal-fav-btn');
    if (favBtn) {
        favBtn.addEventListener('click', () => toggleFavorite(id));
    }

    // Share button
    const shareBtn = $('#modal-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => shareRecipe(shareBtn.dataset.url, meal.strMeal));
    }

    // PDF button
    const pdfBtn = $('#modal-pdf-btn');
    if (pdfBtn) {
        pdfBtn.addEventListener('click', () => downloadPDF(meal));
    }

    // Ingredient checklist
    $$('#ingredient-list .ingredient-item').forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('checked');
            item.setAttribute('aria-checked', item.classList.contains('checked'));
        });
        item.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                item.click();
            }
        });
    });

    // Nutrition chart
    renderNutritionChart(category);

    // Timer
    initTimer(cookTime);
}

// ============================================
// NUTRITION CHART (Chart.js)
// ============================================
function renderNutritionChart(category) {
    const canvas = $('#nutrition-chart');
    if (!canvas) return;

    if (state.nutritionChart) {
        state.nutritionChart.destroy();
    }

    const nutrition = generateNutrition(category);
    const isDark = state.theme === 'dark';
    const textColor = isDark ? '#ccc' : '#333';

    state.nutritionChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: ['Protein', 'Carbs', 'Fat', 'Fiber', 'Sugar'],
            datasets: [{
                data: [nutrition.protein, nutrition.carbs, nutrition.fat, nutrition.fiber, nutrition.sugar],
                backgroundColor: [
                    '#FF6B35',
                    '#FFB800',
                    '#E84545',
                    '#2ECC71',
                    '#9B59B6',
                ],
                borderWidth: 0,
                hoverOffset: 8,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: { family: 'DM Sans', size: 12 },
                        padding: 14,
                        usePointStyle: true,
                        pointStyleWidth: 10,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${ctx.raw}g`
                    }
                }
            },
        },
    });
}

// ============================================
// COOKING TIMER
// ============================================
function initTimer(minutes) {
    clearTimer();
    state.timerSeconds = minutes * 60;
    state.timerRunning = false;
    updateTimerDisplay();

    const startBtn = $('#timer-start');
    const pauseBtn = $('#timer-pause');
    const resetBtn = $('#timer-reset');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            state.timerRunning = true;
            startBtn.style.display = 'none';
            if (pauseBtn) pauseBtn.style.display = '';
            state.timerInterval = setInterval(() => {
                state.timerSeconds--;
                updateTimerDisplay();
                if (state.timerSeconds <= 0) {
                    clearTimer();
                    showToast(t('timer.done'), 'success');
                    if (startBtn) startBtn.style.display = '';
                    if (pauseBtn) pauseBtn.style.display = 'none';
                }
            }, 1000);
        });
    }
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            state.timerRunning = false;
            clearInterval(state.timerInterval);
            pauseBtn.style.display = 'none';
            if (startBtn) startBtn.style.display = '';
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            clearTimer();
            state.timerSeconds = minutes * 60;
            updateTimerDisplay();
            if (startBtn) startBtn.style.display = '';
            if (pauseBtn) pauseBtn.style.display = 'none';
        });
    }
}

function clearTimer() {
    clearInterval(state.timerInterval);
    state.timerRunning = false;
}

function updateTimerDisplay() {
    const display = $('#timer-display');
    if (display) display.textContent = formatTime(Math.max(0, state.timerSeconds));
}

// ============================================
// SHARE RECIPE
// ============================================
function shareRecipe(url, title) {
    if (navigator.share) {
        navigator.share({ title, url }).catch(() => {});
    } else {
        navigator.clipboard.writeText(url).then(() => {
            showToast(t('toast.copied'), 'success');
        }).catch(() => {
            showToast('Failed to copy link.', 'error');
        });
    }
}

// ============================================
// DOWNLOAD RECIPE AS PDF
// ============================================
function downloadPDF(meal) {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const ingredients = parseIngredients(meal);
        const instructions = parseInstructions(meal.strInstructions);

        // Title
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(meal.strMeal, 20, 25);

        // Meta
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Category: ${meal.strCategory || 'N/A'}  |  Area: ${meal.strArea || 'N/A'}`, 20, 35);
        doc.text(`Source: ${meal.strSource || 'TheMealDB'}`, 20, 42);

        // Ingredients
        doc.setTextColor(0);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Ingredients', 20, 56);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        ingredients.forEach((ing, i) => {
            doc.text(`  ${i + 1}. ${ing}`, 22, 64 + i * 7);
        });

        // Instructions
        let yPos = 64 + ingredients.length * 7 + 14;
        if (yPos > 260) { doc.addPage(); yPos = 20; }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Instructions', 20, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        instructions.forEach((step, i) => {
            const lines = doc.splitTextToSize(`${i + 1}. ${step}`, 170);
            doc.text(lines, 22, yPos);
            yPos += lines.length * 5 + 3;
            if (yPos > 270) { doc.addPage(); yPos = 20; }
        });

        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text('Generated by FlavorVault — Recipe Finder App', 20, 285);

        doc.save(`${meal.strMeal.replace(/[^a-zA-Z0-9 ]/g, '')}.pdf`);
        showToast(t('toast.pdf'), 'success');
    } catch {
        showToast('PDF generation failed.', 'error');
    }
}

// ============================================
// LAZY LOADING (IntersectionObserver)
// ============================================
function initLazyLoading() {
    const images = DOM.recipeGrid.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src; // Trigger load
                    observer.unobserve(img);
                }
            });
        }, { rootMargin: '100px' });
        images.forEach(img => observer.observe(img));
    }
}

// ============================================
// CARD EVENT BINDING
// ============================================
function bindCardEvents() {
    DOM.recipeGrid.querySelectorAll('.recipe-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-fav-btn')) return;
            openRecipeModal(card.dataset.id);
        });
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') openRecipeModal(card.dataset.id);
        });
    });

    DOM.recipeGrid.querySelectorAll('.card-fav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(btn.dataset.favId);
        });
    });
}

// ============================================
// SURPRISE ME (Random Recipe)
// ============================================
async function surpriseMe() {
    showSkeleton();
    hideEmpty();
    DOM.resultsTitle.textContent = t('hero.surprise');
    state.currentSearch = '';
    state.currentFilter = 'all';
    updateFilterUI();

    try {
        const meal = await getRandomRecipe();
        if (meal) {
            state.currentRecipes = [{
                id: meal.idMeal,
                title: meal.strMeal,
                thumb: meal.strMealThumb,
                category: meal.strCategory || 'Miscellaneous',
            }];
            renderRecipes();
            // Also open the modal
            openRecipeModal(meal.idMeal);
        }
    } catch {
        showToast('Failed to fetch random recipe.', 'error');
        showEmpty();
    }
}

// ============================================
// SCROLL REVEAL (IntersectionObserver)
// ============================================
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    $$('.fade-up').forEach(el => observer.observe(el));
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Search input
    DOM.searchInput.addEventListener('input', () => {
        debouncedSuggest(DOM.searchInput.value.trim());
    });
    DOM.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            hideSuggestions();
            performSearch(DOM.searchInput.value);
        }
        if (e.key === 'ArrowDown') { e.preventDefault(); navigateSuggestions(1); }
        if (e.key === 'ArrowUp') { e.preventDefault(); navigateSuggestions(-1); }
        if (e.key === 'Escape') hideSuggestions();
    });

    // Search submit button
    DOM.searchSubmit.addEventListener('click', () => {
        hideSuggestions();
        performSearch(DOM.searchInput.value);
    });

    // Close suggestions on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-wrapper')) hideSuggestions();
    });

    // Surprise button
    DOM.surpriseBtn.addEventListener('click', surpriseMe);

    // Filter buttons
    DOM.filterBtns.forEach(btn => {
        btn.addEventListener('click', () => applyFilter(btn.dataset.filter));
    });

    // Search history
    DOM.historyTags.addEventListener('click', (e) => {
        const tag = e.target.closest('.history-tag');
        if (tag) {
            DOM.searchInput.value = tag.dataset.query;
            performSearch(tag.dataset.query);
        }
    });
    DOM.clearHistory.addEventListener('click', clearHistory);

    // Modal close
    DOM.modalClose.addEventListener('click', closeRecipeModal);
    DOM.modalOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.modalOverlay) closeRecipeModal();
    });

    // Favorites modal
    DOM.openFavBtn.addEventListener('click', openFavoritesModal);
    DOM.footerFavLink.addEventListener('click', (e) => { e.preventDefault(); openFavoritesModal(); });
    DOM.favModalClose.addEventListener('click', closeFavoritesModal);
    DOM.favOverlay.addEventListener('click', (e) => {
        if (e.target === DOM.favOverlay) closeFavoritesModal();
    });

    // Theme toggle
    DOM.themeToggle.addEventListener('click', toggleTheme);

    // Language toggle
    DOM.langToggle.addEventListener('click', toggleLanguage);

    // Mobile menu
    DOM.mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Close mobile menu on link click
    DOM.navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            DOM.navLinks.classList.remove('open');
            DOM.mobileMenuBtn.querySelector('i').className = 'fas fa-bars';
            DOM.mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });

    // Scroll
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Escape key closes modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (!DOM.modalOverlay.hidden) closeRecipeModal();
            if (!DOM.favOverlay.hidden) closeFavoritesModal();
        }
    });
}

// ============================================
// INITIALIZATION
// ============================================
async function init() {
    // Apply saved settings
    applyTheme();
    applyLanguage();
    updateFavCount();
    renderHistory();

    // Show splash
    initSplash();

    // Init event listeners
    initEventListeners();

    // Init voice search
    initVoiceSearch();

    // Init scroll reveal
    initScrollReveal();

    // Load trending recipes
    loadTrending();

    // Load recently viewed
    renderRecentlyViewed();

    // Load default recipes (search "a" for broad results)
    showSkeleton();
    try {
        const meals = await searchRecipes('a');
        state.currentRecipes = meals.map(m => ({
            id: m.idMeal,
            title: m.strMeal,
            thumb: m.strMealThumb,
            category: m.strCategory || 'Miscellaneous',
        }));
        renderRecipes();
    } catch {
        showEmpty();
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
(function() {
  'use strict';

  const STATE_KEY = 'precision_stopwatch_v2';

  let state = {
    elapsed: 0,
    running: false,
    laps: [],
    startTimestamp: 0,
    pausedAt: 0
  };

  let rafId = null;

  /* === DOM refs === */
  const timeDisplay     = document.getElementById('timeDisplay');
  const ringProgress    = document.getElementById('ringProgress');
  const btnStartPause   = document.getElementById('btnStartPause');
  const btnLap          = document.getElementById('btnLap');
  const btnReset        = document.getElementById('btnReset');
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText      = document.getElementById('statusText');
  const lapsList        = document.getElementById('lapsList');
  const lapsCount       = document.getElementById('lapsCount');
  const lapEmpty        = document.getElementById('lapEmpty');
  const toastContainer  = document.getElementById('toastContainer');

  const RING_CIRCUMFERENCE = 2 * Math.PI * 90; // ~565.49

  /* === Format === */
  function formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const hours    = Math.floor(totalSec / 3600);
    const minutes  = Math.floor((totalSec % 3600) / 60);
    const seconds  = totalSec % 60;
    const centisec = Math.floor((ms % 1000) / 10);
    return {
      hh: String(hours).padStart(2, '0'),
      mm: String(minutes).padStart(2, '0'),
      ss: String(seconds).padStart(2, '0'),
      ms: String(centisec).padStart(2, '0')
    };
  }

  function renderTime(ms) {
    const t = formatTime(ms);
    timeDisplay.innerHTML =
      `${t.hh}<span class="time-separator">:</span>${t.mm}<span class="time-separator">:</span>${t.ss}<span class="ms-part">.${t.ms}</span>`;

    // Ring progress: one full loop per 60 seconds
    const secFraction = (ms % 60000) / 60000;
    const offset = RING_CIRCUMFERENCE * (1 - secFraction);
    ringProgress.style.strokeDashoffset = offset;
  }

  function formatTimeStr(ms) {
    const t = formatTime(ms);
    return `${t.hh}:${t.mm}:${t.ss}.${t.ms}`;
  }

  /* === Animation loop === */
  function tick() {
    if (!state.running) return;
    state.elapsed = state.pausedAt + (performance.now() - state.startTimestamp);
    renderTime(state.elapsed);
    // Save every ~500ms to avoid excessive writes
    if (Math.floor(state.elapsed / 500) !== Math.floor((state.elapsed - 16) / 500)) {
      saveState();
    }
    rafId = requestAnimationFrame(tick);
  }

  /* === Controls === */
  function start() {
    state.running = true;
    state.startTimestamp = performance.now();
    updateUI();
    rafId = requestAnimationFrame(tick);
  }

  function pause() {
    state.running = false;
    state.pausedAt = state.elapsed;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    updateUI();
    saveState();
  }

  function toggleStartPause() {
    state.running ? pause() : start();
  }

  function recordLap() {
    if (!state.running) return;
    const total = state.elapsed;
    const prevTotal = state.laps.length > 0 ? state.laps[state.laps.length - 1].total : 0;
    state.laps.push({ total, delta: total - prevTotal });
    renderLaps();
    saveState();

    // Physical press feedback
    btnLap.style.transform = 'scale(0.9)';
    setTimeout(() => { btnLap.style.transform = ''; }, 130);
  }

  function resetTimer() {
    if (state.running) return;
    state.elapsed = 0;
    state.pausedAt = 0;
    state.startTimestamp = 0;
    state.laps = [];
    renderTime(0);
    renderLaps();
    updateUI();
    saveState();
    showToast('Stopwatch reset');
  }

  /* === UI sync === */
  function updateUI() {
    const icon = btnStartPause.querySelector('i');
    const text = btnStartPause.querySelector('span');
    btnStartPause.classList.remove('is-running', 'is-paused');
    timeDisplay.classList.remove('running');
    statusIndicator.classList.remove('running', 'paused');

    if (state.running) {
      icon.className = 'fa-solid fa-stop';
      text.textContent = 'Stop';
      btnStartPause.classList.add('is-running');
      timeDisplay.classList.add('running');
      statusIndicator.classList.add('running');
      statusText.textContent = 'Running';
      btnLap.disabled = false;
      btnReset.disabled = true;
    } else if (state.elapsed > 0) {
      icon.className = 'fa-solid fa-play';
      text.textContent = 'Resume';
      btnStartPause.classList.add('is-paused');
      statusIndicator.classList.add('paused');
      statusText.textContent = 'Paused';
      btnLap.disabled = true;
      btnReset.disabled = false;
    } else {
      icon.className = 'fa-solid fa-play';
      text.textContent = 'Start';
      statusText.textContent = 'Ready';
      btnLap.disabled = true;
      btnReset.disabled = true;
    }

    btnStartPause.setAttribute('aria-label',
      state.running ? 'Stop stopwatch' : (state.elapsed > 0 ? 'Resume stopwatch' : 'Start stopwatch'));
  }

  /* === Render laps === */
  function renderLaps() {
    const count = state.laps.length;
    lapsCount.textContent = `${count} lap${count !== 1 ? 's' : ''}`;

    if (count === 0) {
      lapEmpty.style.display = '';
      lapsList.querySelectorAll('.lap-item').forEach(el => el.remove());
      return;
    }

    lapEmpty.style.display = 'none';

    let bestIdx = -1, worstIdx = -1;
    if (count >= 2) {
      let minD = Infinity, maxD = -1;
      state.laps.forEach((l, i) => {
        if (l.delta < minD) { minD = l.delta; bestIdx = i; }
        if (l.delta > maxD) { maxD = l.delta; worstIdx = i; }
      });
    }

    let html = '';
    for (let i = count - 1; i >= 0; i--) {
      const lap = state.laps[i];
      let cls = '';
      if (i === bestIdx) cls = ' best';
      if (i === worstIdx) cls = ' worst';
      html += `<div class="lap-item${cls}" style="animation-delay:${(count - 1 - i) * 0.04}s">
        <span class="lap-number">#${i + 1}</span>
        <span class="lap-delta">${formatTimeStr(lap.delta)}</span>
        <span class="lap-total">${formatTimeStr(lap.total)}</span>
      </div>`;
    }
    lapsList.innerHTML = html;

    // Auto-scroll to top (newest)
    lapsList.scrollTop = 0;
  }

  /* === Persistence === */
  function saveState() {
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify({
        elapsed: state.elapsed,
        pausedAt: state.elapsed,
        laps: state.laps
      }));
    } catch (e) {}
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STATE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (d && typeof d.elapsed === 'number') {
        state.elapsed = d.elapsed || 0;
        state.pausedAt = d.elapsed || 0;
        state.running = false;
        state.laps = Array.isArray(d.laps) ? d.laps : [];
        return true;
      }
    } catch (e) {}
    return false;
  }

  /* === Toast === */
  function showToast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add('fade-out');
      el.addEventListener('animationend', () => el.remove());
    }, 2000);
  }

  /* === Button ripple effect === */
  function createRipple(e, btn) {
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  /* === Radial hover light === */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--x', ((e.clientX - rect.left) / rect.width * 100) + '%');
      btn.style.setProperty('--y', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
    btn.addEventListener('click', (e) => createRipple(e, btn));
  });

  /* === Events === */
  btnStartPause.addEventListener('click', toggleStartPause);
  btnLap.addEventListener('click', recordLap);
  btnReset.addEventListener('click', resetTimer);

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space') { e.preventDefault(); toggleStartPause(); }
    else if (e.key === 'l' || e.key === 'L') { if (!btnLap.disabled) recordLap(); }
    else if (e.key === 'r' || e.key === 'R') { if (!btnReset.disabled) resetTimer(); }
  });

  /* === Particle Canvas === */
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 50;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 100;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.2;
      this.opacity = Math.random() * 0.3 + 0.05;
      this.life = 0;
      this.maxLife = Math.random() * 600 + 400;
      // Warm color: gold to amber
      const hue = 30 + Math.random() * 20;
      this.color = `hsla(${hue}, 80%, 60%,`;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life++;
      if (this.life > this.maxLife || this.y < -20) this.reset();
    }
    draw() {
      const progress = this.life / this.maxLife;
      const fade = progress < 0.1 ? progress / 0.1 : progress > 0.8 ? (1 - progress) / 0.2 : 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.1, this.size), 0, Math.PI * 2);
      ctx.fillStyle = this.color + (this.opacity * fade) + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife; // Stagger
    p.y = Math.random() * canvas.height;
    particles.push(p);
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* === CSS floating dots (decorative) === */
  const dotsContainer = document.getElementById('floatingDots');
  for (let i = 0; i < 12; i++) {
    const dot = document.createElement('div');
    dot.className = 'float-dot';
    dot.style.left = (Math.random() * 100) + '%';
    dot.style.animationDuration = (Math.random() * 12 + 10) + 's';
    dot.style.animationDelay = (Math.random() * 15) + 's';
    dot.style.width = dot.style.height = (Math.random() * 3 + 1.5) + 'px';
    dot.style.background = `rgba(232, 168, 56, ${Math.random() * 0.15 + 0.08})`;
    dotsContainer.appendChild(dot);
  }

  /* === Init === */
  function init() {
    ringProgress.style.strokeDasharray = RING_CIRCUMFERENCE;
    ringProgress.style.strokeDashoffset = RING_CIRCUMFERENCE;

    const restored = loadState();
    renderTime(state.elapsed);
    renderLaps();
    updateUI();

    if (restored && state.elapsed > 0) {
      showToast('Session restored');
    }
  }

  init();
})();
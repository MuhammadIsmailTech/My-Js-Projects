 // ========== State ==========
  const state = {
    isOn: false,
    brightness: 100,
    temperature: 2700,
    flicker: false,
    autoOff: false,
    pulse: false,
    autoOffSeconds: 60,
    uptime: 0,
    uptimeInterval: null,
    autoOffInterval: null,
  };

  // ========== DOM References ==========
  const $ = (sel) => document.querySelector(sel);
  const bulbScene = $('#bulbScene');
  const bulbGlass = $('#bulbGlass');
  const bulbOuterGlow = $('#bulbOuterGlow');
  const filamentPath = $('#filamentPath');
  const ambientGlow = $('#ambientGlow');
  const lightRays = $('#lightRays');
  const statusLabel = $('#statusLabel');
  const powerDot = $('#powerDot');
  const powerText = $('#powerText');
  const brightnessSlider = $('#brightnessSlider');
  const brightnessValue = $('#brightnessValue');
  const tempValue = $('#tempValue');
  const tempButtons = $('#tempButtons');
  const flickerToggle = $('#flickerToggle');
  const autoOffToggle = $('#autoOffToggle');
  const pulseToggle = $('#pulseToggle');
  const timerDisplay = $('#timerDisplay');
  const wattDisplay = $('#wattDisplay');
  const lumenDisplay = $('#lumenDisplay');
  const tempDisplay = $('#tempDisplay');
  const uptimeDisplay = $('#uptimeDisplay');
  const toast = $('#toast');
  const ambientParticles = $('#ambientParticles');

  // ========== Color temperature presets ==========
  const tempPresets = {
    2700: {
      bulb: 'rgba(255,204,100,0.35)',
      filament: '#ff9933',
      accent: '#ffb347',
      glow: 'rgba(255,160,40,0.6)',
      outerGlow: 'rgba(255,180,60,0.3), rgba(255,160,40,0.2), rgba(255,140,20,0.1)',
      ambientGlow: 'rgba(255,160,40,0.6)',
      ray: 'rgba(255,200,100,0.15)',
      particle: '#ffb347',
    },
    3500: {
      bulb: 'rgba(255,225,170,0.3)',
      filament: '#ffbb66',
      accent: '#ffd080',
      glow: 'rgba(255,200,100,0.5)',
      outerGlow: 'rgba(255,210,130,0.25), rgba(255,190,100,0.15), rgba(255,170,80,0.08)',
      ambientGlow: 'rgba(255,200,100,0.5)',
      ray: 'rgba(255,220,150,0.12)',
      particle: '#ffd080',
    },
    5000: {
      bulb: 'rgba(220,235,255,0.25)',
      filament: '#ccddef',
      accent: '#b8d4ff',
      glow: 'rgba(180,210,255,0.4)',
      outerGlow: 'rgba(180,210,255,0.2), rgba(160,200,255,0.12), rgba(140,190,255,0.06)',
      ambientGlow: 'rgba(180,210,255,0.4)',
      ray: 'rgba(200,220,255,0.1)',
      particle: '#b8d4ff',
    },
    6500: {
      bulb: 'rgba(240,245,255,0.22)',
      filament: '#dde6f0',
      accent: '#e0eaff',
      glow: 'rgba(220,235,255,0.35)',
      outerGlow: 'rgba(220,235,255,0.18), rgba(210,230,255,0.1), rgba(200,225,255,0.05)',
      ambientGlow: 'rgba(220,235,255,0.35)',
      ray: 'rgba(230,240,255,0.08)',
      particle: '#e0eaff',
    },
  };

  // ========== Initialize light rays ==========
  function createRays() {
    const rayCount = 24;
    for (let i = 0; i < rayCount; i++) {
      const ray = document.createElement('div');
      ray.className = 'ray';
      ray.style.transform = `rotate(${(360 / rayCount) * i}deg)`;
      lightRays.appendChild(ray);
    }
  }
  createRays();

  // ========== Initialize particles ==========
  function createParticles() {
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${20 + Math.random() * 50}%`;
      p.style.animationDelay = `${Math.random() * 6}s`;
      p.style.animationDuration = `${4 + Math.random() * 4}s`;
      p.style.width = `${2 + Math.random() * 3}px`;
      p.style.height = p.style.width;
      ambientParticles.appendChild(p);
    }
  }
  createParticles();

  // ========== Toast ==========
  let toastTimeout;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // ========== Apply visual state ==========
  function applyVisuals() {
    const preset = tempPresets[state.temperature];
    const b = state.isOn ? state.brightness / 100 : 0;

    // CSS custom property for brightness multiplier
    document.documentElement.style.setProperty('--current-brightness', b);

    // Bulb glass
    if (state.isOn) {
      bulbGlass.classList.add('on');
      bulbGlass.style.background = `radial-gradient(ellipse at 50% 40%, ${preset.bulb} 0%, transparent 100%)`;
      bulbGlass.style.opacity = 0.4 + b * 0.6;
    } else {
      bulbGlass.classList.remove('on');
      bulbGlass.style.background = 'rgba(255,255,255,0.03)';
      bulbGlass.style.opacity = 1;
    }

    // Filament
    if (state.isOn) {
      filamentPath.classList.add('on');
      filamentPath.style.stroke = preset.filament;
      filamentPath.style.opacity = 0.5 + b * 0.5;
    } else {
      filamentPath.classList.remove('on');
      filamentPath.style.stroke = 'rgba(80,75,65,0.6)';
      filamentPath.style.opacity = 1;
    }

    // Flicker
    if (state.flicker && state.isOn) {
      filamentPath.classList.add('flicker');
    } else {
      filamentPath.classList.remove('flicker');
    }

    // Pulse
    if (state.pulse && state.isOn) {
      bulbGlass.style.animation = `pulse-glow 2s ease-in-out infinite`;
    } else {
      bulbGlass.style.animation = 'none';
    }

    // Outer glow
    if (state.isOn) {
      bulbOuterGlow.classList.add('on');
      const glowParts = preset.outerGlow.split(', ').map(g => {
        const match = g.match(/rgba?\(([^)]+)\)/);
        if (!match) return g;
        const nums = match[1].split(',').map(n => parseFloat(n.trim()));
        return `rgba(${nums[0]},${nums[1]},${nums[2]},${nums[3] * b})`;
      });
      bulbOuterGlow.style.boxShadow = glowParts.join(', ');
    } else {
      bulbOuterGlow.classList.remove('on');
      bulbOuterGlow.style.boxShadow = 'none';
    }

    // Ambient glow
    if (state.isOn) {
      ambientGlow.classList.add('on');
      ambientGlow.style.opacity = b * 0.8;
      ambientGlow.style.background = `radial-gradient(circle, ${preset.ambientGlow} 0%, transparent 70%)`;
    } else {
      ambientGlow.classList.remove('on');
    }

    // Light rays
    if (state.isOn) {
      lightRays.classList.add('on');
      lightRays.style.opacity = b * 0.6;
      lightRays.querySelectorAll('.ray').forEach(ray => {
        ray.style.background = `linear-gradient(to bottom, ${preset.ray}, transparent)`;
      });
    } else {
      lightRays.classList.remove('on');
    }

    // Particles
    ambientParticles.querySelectorAll('.particle').forEach(p => {
      if (state.isOn) {
        p.classList.add('on');
        p.style.background = preset.particle;
        p.style.opacity = b * 0.5;
      } else {
        p.classList.remove('on');
      }
    });

    // Status
    statusLabel.textContent = state.isOn ? 'ON' : 'OFF';
    statusLabel.classList.toggle('on', state.isOn);

    // Power indicator
    powerDot.classList.toggle('on', state.isOn);
    powerText.textContent = state.isOn ? 'Active' : 'Standby';

    // Stats
    const watts = state.isOn ? Math.round((state.brightness / 100) * 10) : 0;
    const lumens = state.isOn ? Math.round((state.brightness / 100) * 800) : 0;
    wattDisplay.textContent = `${watts}W`;
    lumenDisplay.textContent = `${lumens} lm`;
    tempDisplay.textContent = state.isOn ? `${state.temperature}K` : '--';

    // Slider track fill
    const pct = state.brightness;
    brightnessSlider.style.background = `linear-gradient(to right, ${preset.accent} 0%, ${preset.accent} ${pct}%, rgba(255,255,255,0.06) ${pct}%, rgba(255,255,255,0.06) 100%)`;
  }

  // ========== Toggle bulb ==========
  function toggleBulb() {
    state.isOn = !state.isOn;
    if (state.isOn) {
      startUptime();
    } else {
      stopUptime();
      stopAutoOff();
    }
    applyVisuals();
    showToast(state.isOn ? 'Light turned on' : 'Light turned off');
  }

  // ========== Uptime ==========
  function startUptime() {
    state.uptime = 0;
    clearInterval(state.uptimeInterval);
    state.uptimeInterval = setInterval(() => {
      state.uptime++;
      const m = Math.floor(state.uptime / 60);
      const s = state.uptime % 60;
      uptimeDisplay.textContent = m > 0 ? `${m}m ${s}s` : `${s}s`;
    }, 1000);
  }

  function stopUptime() {
    clearInterval(state.uptimeInterval);
    state.uptime = 0;
    uptimeDisplay.textContent = '0s';
  }

  // ========== Auto-off timer ==========
  function startAutoOff() {
    let remaining = state.autoOffSeconds;
    timerDisplay.classList.add('active');
    timerDisplay.textContent = `Auto off in ${remaining}s`;

    clearInterval(state.autoOffInterval);
    state.autoOffInterval = setInterval(() => {
      remaining--;
      timerDisplay.textContent = `Auto off in ${remaining}s`;
      if (remaining <= 0) {
        stopAutoOff();
        if (state.isOn) {
          state.isOn = false;
          stopUptime();
          applyVisuals();
          showToast('Auto off — light turned off');
        }
      }
    }, 1000);
  }

  function stopAutoOff() {
    clearInterval(state.autoOffInterval);
    timerDisplay.classList.remove('active');
    timerDisplay.textContent = '';
  }

  // ========== Event Listeners ==========

  // Click/tap on bulb
  bulbScene.addEventListener('click', toggleBulb);
  bulbScene.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleBulb();
    }
  });

  // Brightness slider
  brightnessSlider.addEventListener('input', (e) => {
    state.brightness = parseInt(e.target.value);
    brightnessValue.textContent = `${state.brightness}%`;
    applyVisuals();
  });

  // Color temperature
  tempButtons.addEventListener('click', (e) => {
    const btn = e.target.closest('.temp-btn');
    if (!btn) return;
    tempButtons.querySelectorAll('.temp-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.temperature = parseInt(btn.dataset.temp);
    tempValue.textContent = btn.dataset.label;

    // Update accent color in CSS vars
    const preset = tempPresets[state.temperature];
    document.documentElement.style.setProperty('--accent', preset.accent);
    document.documentElement.style.setProperty('--border', preset.accent.replace(')', ',0.12)').replace('rgb(', 'rgba('));

    applyVisuals();
    showToast(`Color temperature: ${btn.dataset.label}`);
  });

  // Flicker toggle
  flickerToggle.addEventListener('click', () => {
    state.flicker = !state.flicker;
    flickerToggle.classList.toggle('on', state.flicker);
    flickerToggle.setAttribute('aria-checked', state.flicker);
    applyVisuals();
    showToast(state.flicker ? 'Flicker effect enabled' : 'Flicker effect disabled');
  });

  // Auto-off toggle
  autoOffToggle.addEventListener('click', () => {
    state.autoOff = !state.autoOff;
    autoOffToggle.classList.toggle('on', state.autoOff);
    autoOffToggle.setAttribute('aria-checked', state.autoOff);
    if (state.autoOff && state.isOn) {
      startAutoOff();
      showToast(`Auto off in ${state.autoOffSeconds}s`);
    } else {
      stopAutoOff();
      showToast('Auto off disabled');
    }
  });

  // Pulse toggle
  pulseToggle.addEventListener('click', () => {
    state.pulse = !state.pulse;
    pulseToggle.classList.toggle('on', state.pulse);
    pulseToggle.setAttribute('aria-checked', state.pulse);
    applyVisuals();
    showToast(state.pulse ? 'Pulse effect enabled' : 'Pulse effect disabled');
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Don't trigger if user is interacting with an input
    if (e.target.tagName === 'INPUT') return;

    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      toggleBulb();
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      state.brightness = Math.min(100, state.brightness + 10);
      brightnessSlider.value = state.brightness;
      brightnessValue.textContent = `${state.brightness}%`;
      applyVisuals();
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      state.brightness = Math.max(5, state.brightness - 10);
      brightnessSlider.value = state.brightness;
      brightnessValue.textContent = `${state.brightness}%`;
      applyVisuals();
    }
  });

  // Add pulse keyframe dynamically
  const pulseStyle = document.createElement('style');
  pulseStyle.textContent = `
    @keyframes pulse-glow {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.55; }
    }
  `;
  document.head.appendChild(pulseStyle);

  // ========== Initial render ==========
  applyVisuals();
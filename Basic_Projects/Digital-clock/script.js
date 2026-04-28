/**
 * Digital Clock — Main Script
 * Handles time display, format toggling, theme switching, and animations.
 */

(function () {
    'use strict';

    // ==========================================
    // DOM Element References
    // ==========================================
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const secondsPulse = document.getElementById('secondsPulse');
    const ampmBadge = document.getElementById('ampmBadge');
    const dateDisplay = document.getElementById('dateDisplay');
    const timezoneLabel = document.getElementById('timezoneLabel');
    const formatLabel = document.getElementById('formatLabel');
    const themeToggle = document.getElementById('themeToggle');
    const formatToggle = document.getElementById('formatToggle');

    // ==========================================
    // State
    // ==========================================
    let is24Hour = false;          // Start in 12-hour mode
    let previousValues = {         // Track previous digits for tick animation
        hours: '',
        minutes: '',
        seconds: ''
    };

    // ==========================================
    // Utility: Pad a number to 2 digits
    // ==========================================
    function pad(n) {
        return String(n).padStart(2, '0');
    }

    // ==========================================
    // Trigger the tick animation on a digit element
    // ==========================================
    function triggerTick(el) {
        el.classList.remove('tick');
        // Force reflow to restart animation
        void el.offsetWidth;
        el.classList.add('tick');
    }

    // ==========================================
    // Trigger the pulse glow behind seconds
    // ==========================================
    function triggerPulse() {
        secondsPulse.classList.remove('pulse');
        void secondsPulse.offsetWidth;
        secondsPulse.classList.add('pulse');
    }

    // ==========================================
    // Format the current date into a readable string
    // e.g. "Wednesday, January 15, 2025"
    // ==========================================
    function formatDate(date) {
        const days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday',
            'Thursday', 'Friday', 'Saturday'
        ];
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const dayName = days[date.getDay()];
        const monthName = months[date.getMonth()];
        const dayNum = date.getDate();
        const year = date.getFullYear();

        return `${dayName}, ${monthName} ${dayNum}, ${year}`;
    }

    // ==========================================
    // Get a human-readable timezone string
    // e.g. "UTC+5:30 — India Standard Time"
    // ==========================================
    function getTimezoneString() {
        try {
            const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const offset = new Date().getTimezoneOffset();
            const sign = offset <= 0 ? '+' : '-';
            const absOffset = Math.abs(offset);
            const hours = Math.floor(absOffset / 60);
            const mins = absOffset % 60;
            const offsetStr = `UTC${sign}${hours}${mins > 0 ? ':' + pad(mins) : ''}`;
            return `${offsetStr} — ${tzName.replace('_', ' ')}`;
        } catch {
            return '';
        }
    }

    // ==========================================
    // Main update function — called every second
    // ==========================================
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        let ampm = '';

        // 12-hour conversion
        if (!is24Hour) {
            ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            if (hours === 0) hours = 12;
        }

        const hoursStr = pad(hours);
        const minutesStr = pad(minutes);
        const secondsStr = pad(seconds);

        // Update hours digit (with animation if changed)
        if (hoursStr !== previousValues.hours) {
            hoursEl.textContent = hoursStr;
            triggerTick(hoursEl);
            previousValues.hours = hoursStr;
        }

        // Update minutes digit
        if (minutesStr !== previousValues.minutes) {
            minutesEl.textContent = minutesStr;
            triggerTick(minutesEl);
            previousValues.minutes = minutesStr;
        }

        // Update seconds digit + pulse
        secondsEl.textContent = secondsStr;
        if (secondsStr !== previousValues.seconds) {
            triggerTick(secondsEl);
            triggerPulse();
            previousValues.seconds = secondsStr;
        }

        // AM/PM badge
        if (!is24Hour) {
            ampmBadge.textContent = ampm;
            ampmBadge.classList.remove('hidden');
        } else {
            ampmBadge.classList.add('hidden');
        }

        // Date
        dateDisplay.textContent = formatDate(now);

        // Timezone (only update once on first call — it rarely changes)
        if (!timezoneLabel.textContent) {
            timezoneLabel.textContent = getTimezoneString();
        }
    }

    // ==========================================
    // Theme Toggle (Dark ↔ Light)
    // ==========================================
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('clock-theme', theme);
    }

    // Load saved theme or default to dark
    function initTheme() {
        const saved = localStorage.getItem('clock-theme');
        if (saved === 'light' || saved === 'dark') {
            setTheme(saved);
        } else {
            // Respect system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(prefersDark ? 'dark' : 'light');
        }
    }

    themeToggle.addEventListener('click', function () {
        const current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
    });

    // ==========================================
    // Format Toggle (12H ↔ 24H)
    // ==========================================
    formatToggle.addEventListener('click', function () {
        is24Hour = !is24Hour;
        formatLabel.textContent = is24Hour ? '24H' : '12H';

        // Force a full refresh so hours digit recalculates
        previousValues.hours = '';
        previousValues.minutes = '';
        previousValues.seconds = '';
        updateClock();
    });

    // ==========================================
    // Initialize
    // ==========================================
    initTheme();
    updateClock();

    // Update every second, aligned to the clock second
    // (small offset to sync with system clock)
    setInterval(updateClock, 1000);

})();
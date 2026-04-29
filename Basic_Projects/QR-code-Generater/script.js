if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        var r = typeof radii === 'number' ? radii : (Array.isArray(radii) ? radii[0] : 0);
        r = Math.min(r, w / 2, h / 2);
        r = Math.max(0, r);
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.arcTo(x + w, y, x + w, y + r, r);
        this.lineTo(x + w, y + h - r);
        this.arcTo(x + w, y + h, x + w - r, y + h, r);
        this.lineTo(x + r, y + h);
        this.arcTo(x, y + h, x, y + h - r, r);
        this.lineTo(x, y + r);
        this.arcTo(x, y, x + r, y, r);
        this.closePath();
        return this;
    };
}

/* Central state for all settings */
var state = {
    type: 'text',
    dotStyle: 'square',
    fgColor: '#000000',
    bgColor: '#ffffff',
    useGradient: false,
    gradientStart: '#C94A2E',
    gradientEnd: '#F0A030',
    size: 300,
    margin: 2,
    errorCorrection: 'M',
    logo: null,
    logoImg: null,
    logoSize: 20,
    theme: 'light',
    lastQr: null,
    lastData: ''
};

/* Color presets for quick apply */
var presets = [
    { name: 'Classic', fg: '#000000', bg: '#FFFFFF' },
    { name: 'Inverted', fg: '#FFFFFF', bg: '#1A1A1E' },
    { name: 'Ember', fg: '#B8312F', bg: '#FFF5F0' },
    { name: 'Ocean', fg: '#0D5C63', bg: '#E8F6F3' },
    { name: 'Forest', fg: '#2D5016', bg: '#F0F5EC' },
    { name: 'Berry', fg: '#7B1E5F', bg: '#FDF0F8' },
    { name: 'Slate', fg: '#334155', bg: '#F1F5F9' },
    { name: 'Gold', fg: '#92400E', bg: '#FFFBEB' },
    { name: 'Indigo', fg: '#3730A3', bg: '#EEF2FF' },
    { name: 'Teal', fg: '#115E59', bg: '#F0FDFA' }
];

/* Shorthand DOM getter */
function $(id) { return document.getElementById(id); }

var canvas = $('qrCanvas');
var ctx = canvas.getContext('2d');

/* Toast notification system */
function toast(msg, type) {
    type = type || 'info';
    var icons = { success: 'check-circle', error: 'circle-exclamation', info: 'circle-info' };
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.innerHTML = '<i class="fas fa-' + icons[type] + '"></i><span>' + msg + '</span>';
    $('toastContainer').appendChild(el);
    requestAnimationFrame(function() { el.classList.add('show'); });
    setTimeout(function() {
        el.classList.remove('show');
        setTimeout(function() { el.remove(); }, 300);
    }, 3000);
}

/* Escape special chars for WiFi QR string */
function escWifi(s) {
    return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/"/g, '\\"').replace(/:/g, '\\:');
}

/* Encode form data into a QR-compatible string */
function encodeData() {
    switch (state.type) {
        case 'text':
            return $('txtInput').value.trim();
        case 'wifi':
            var ssid = escWifi($('wifiSsid').value);
            var pass = escWifi($('wifiPass').value);
            var enc = $('wifiEnc').value;
            var hid = $('wifiHidden').checked ? 'true' : 'false';
            return 'WIFI:T:' + enc + ';S:' + ssid + ';P:' + pass + ';H:' + hid + ';;';
        case 'email':
            var to = $('emailTo').value.trim();
            if (!to) return '';
            var uri = 'mailto:' + to;
            var params = [];
            if ($('emailSubj').value.trim()) params.push('subject=' + encodeURIComponent($('emailSubj').value.trim()));
            if ($('emailBody').value.trim()) params.push('body=' + encodeURIComponent($('emailBody').value.trim()));
            if (params.length) uri += '?' + params.join('&');
            return uri;
        case 'phone':
            return $('phoneNum').value.trim() ? 'tel:' + $('phoneNum').value.trim() : '';
        case 'sms':
            var num = $('smsNum').value.trim();
            if (!num) return '';
            return 'smsto:' + num + ':' + $('smsMsg').value.trim();
        case 'vcard':
            var parts = ['BEGIN:VCARD', 'VERSION:3.0'];
            var fn = [$('vcFirst').value.trim(), $('vcLast').value.trim()].filter(Boolean).join(' ');
            if (fn) parts.push('FN:' + fn);
            if ($('vcLast').value.trim() || $('vcFirst').value.trim())
                parts.push('N:' + $('vcLast').value.trim() + ';' + $('vcFirst').value.trim() + ';;;');
            if ($('vcOrg').value.trim()) parts.push('ORG:' + $('vcOrg').value.trim());
            if ($('vcPhone').value.trim()) parts.push('TEL:' + $('vcPhone').value.trim());
            if ($('vcEmail').value.trim()) parts.push('EMAIL:' + $('vcEmail').value.trim());
            if ($('vcUrl').value.trim()) parts.push('URL:' + $('vcUrl').value.trim());
            if ($('vcAddr').value.trim()) parts.push('ADR:;;' + $('vcAddr').value.trim() + ';;;;');
            parts.push('END:VCARD');
            return parts.join('\n');
        default:
            return '';
    }
}

/* Draw a single QR module with the chosen style */
function drawModule(cx, x, y, s, style) {
    switch (style) {
        case 'square':
            cx.fillRect(x, y, s, s);
            break;
        case 'rounded':
            var r = Math.max(0.01, s * 0.38);
            var m = s * 0.06;
            var rs = s - m * 2;
            cx.beginPath();
            cx.roundRect(x + m, y + m, rs, rs, r);
            cx.fill();
            break;
        case 'dots':
            var rad = Math.max(0.01, s * 0.44);
            cx.beginPath();
            cx.arc(x + s / 2, y + s / 2, rad, 0, Math.PI * 2);
            cx.fill();
            break;
    }
}

/* Render QR code onto the canvas */
function renderCanvas(qr) {
    var mc = qr.getModuleCount();
    var margin = state.margin;
    var total = mc + margin * 2;
    var moduleSize = state.size / total;
    var size = state.size;

    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    /* Background fill */
    ctx.fillStyle = state.bgColor;
    ctx.fillRect(0, 0, size, size);

    /* Set foreground fill - solid or gradient */
    if (state.useGradient) {
        var grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, state.gradientStart);
        grad.addColorStop(1, state.gradientEnd);
        ctx.fillStyle = grad;
    } else {
        ctx.fillStyle = state.fgColor;
    }

    /* Draw every dark module */
    for (var r = 0; r < mc; r++) {
        for (var c = 0; c < mc; c++) {
            if (qr.isDark(r, c)) {
                var x = (c + margin) * moduleSize;
                var y = (r + margin) * moduleSize;
                drawModule(ctx, x, y, moduleSize, state.dotStyle);
            }
        }
    }

    /* Draw logo overlay if one is loaded */
    if (state.logoImg) {
        var logoPx = size * (state.logoSize / 100);
        var pad = moduleSize * 2.5;
        var totalLogo = logoPx + pad * 2;
        var lx = (size - totalLogo) / 2;
        var ly = (size - totalLogo) / 2;

        /* White rounded background */
        ctx.fillStyle = state.bgColor;
        ctx.beginPath();
        ctx.roundRect(lx, ly, totalLogo, totalLogo, pad * 0.6);
        ctx.fill();

        /* Accent border ring */
        ctx.strokeStyle = state.useGradient ? state.gradientStart : state.fgColor;
        ctx.lineWidth = Math.max(1, moduleSize * 0.3);
        ctx.beginPath();
        ctx.roundRect(lx, ly, totalLogo, totalLogo, pad * 0.6);
        ctx.stroke();

        /* Clip and draw the actual logo image */
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(lx + pad, ly + pad, logoPx, logoPx, 4);
        ctx.clip();
        ctx.drawImage(state.logoImg, lx + pad, ly + pad, logoPx, logoPx);
        ctx.restore();
    }
}

/* Generate SVG markup from QR data */
function generateSVG(qr) {
    var mc = qr.getModuleCount();
    var margin = state.margin;
    var total = mc + margin * 2;
    var ms = 10;
    var size = total * ms;
    var fill = state.useGradient ? 'url(#qrGrad)' : state.fgColor;

    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + size + ' ' + size + '" width="' + state.size + '" height="' + state.size + '">';

    if (state.useGradient) {
        svg += '<defs><linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="100%">';
        svg += '<stop offset="0%" stop-color="' + state.gradientStart + '"/>';
        svg += '<stop offset="100%" stop-color="' + state.gradientEnd + '"/>';
        svg += '</linearGradient></defs>';
    }

    svg += '<rect width="' + size + '" height="' + size + '" fill="' + state.bgColor + '"/>';

    for (var r = 0; r < mc; r++) {
        for (var c = 0; c < mc; c++) {
            if (qr.isDark(r, c)) {
                var x = (c + margin) * ms;
                var y = (r + margin) * ms;
                if (state.dotStyle === 'dots') {
                    svg += '<circle cx="' + (x + ms/2) + '" cy="' + (y + ms/2) + '" r="' + (ms * 0.44) + '" fill="' + fill + '"/>';
                } else if (state.dotStyle === 'rounded') {
                    var m = ms * 0.06;
                    var rs = ms - m * 2;
                    svg += '<rect x="' + (x+m) + '" y="' + (y+m) + '" width="' + rs + '" height="' + rs + '" rx="' + (rs*0.38) + '" fill="' + fill + '"/>';
                } else {
                    svg += '<rect x="' + x + '" y="' + y + '" width="' + ms + '" height="' + ms + '" fill="' + fill + '"/>';
                }
            }
        }
    }

    if (state.logo) {
        var logoPx = size * (state.logoSize / 100);
        var pad = ms * 2.5;
        var totalLogo = logoPx + pad * 2;
        var lx = (size - totalLogo) / 2;
        var ly = (size - totalLogo) / 2;
        svg += '<rect x="' + lx + '" y="' + ly + '" width="' + totalLogo + '" height="' + totalLogo + '" rx="' + (pad*0.6) + '" fill="' + state.bgColor + '"/>';
        svg += '<image href="' + state.logo + '" x="' + (lx+pad) + '" y="' + (ly+pad) + '" width="' + logoPx + '" height="' + logoPx + '" preserveAspectRatio="xMidYMid slice"/>';
    }

    svg += '</svg>';
    return svg;
}

/* History save timer */
var historySaveTimer = null;

/* Main generate function - creates QR and renders to canvas */
function generate() {
    var data = encodeData();
    state.lastData = data;

    if (!data) {
        canvas.classList.add('hidden');
        $('emptyState').classList.remove('hidden');
        $('qrInfo').classList.add('hidden');
        state.lastQr = null;
        return;
    }

    try {
        var qr = qrcode(0, state.errorCorrection);
        qr.addData(data);
        qr.make();
        state.lastQr = qr;

        renderCanvas(qr);

        canvas.classList.remove('hidden');
        $('emptyState').classList.add('hidden');
        $('qrInfo').classList.remove('hidden');

        /* Play appear animation */
        canvas.classList.remove('qr-appear');
        void canvas.offsetWidth;
        canvas.classList.add('qr-appear');

        /* Show QR metadata */
        var mc = qr.getModuleCount();
        $('infoVer').textContent = Math.ceil((mc - 17) / 4);
        $('infoMod').textContent = mc + ' x ' + mc;
        $('infoLen').textContent = data.length + ' chars';

        saveSettings();

        /* Debounced history save so rapid slider changes don't spam it */
        clearTimeout(historySaveTimer);
        historySaveTimer = setTimeout(function() {
            var thumb = createThumbnail();
            if (thumb) saveHistoryItem(thumb);
        }, 2000);

    } catch (e) {
        if (state.errorCorrection !== 'L') {
            toast('Data too long for this error correction level. Try lowering it.', 'error');
        } else {
            toast('Data exceeds maximum QR code capacity.', 'error');
        }
    }
}

/* Download QR as PNG */
function downloadPNG() {
    if (!state.lastQr) { toast('Generate a QR code first', 'info'); return; }
    var link = document.createElement('a');
    link.download = 'qr-forge-' + Date.now() + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast('PNG downloaded', 'success');
}

/* Download QR as SVG */
function downloadSVG() {
    if (!state.lastQr) { toast('Generate a QR code first', 'info'); return; }
    var svgStr = generateSVG(state.lastQr);
    var blob = new Blob([svgStr], { type: 'image/svg+xml' });
    var link = document.createElement('a');
    link.download = 'qr-forge-' + Date.now() + '.svg';
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
    toast('SVG downloaded', 'success');
}

/* Copy QR image to clipboard */
function copyQR() {
    if (!state.lastQr) { toast('Generate a QR code first', 'info'); return; }
    canvas.toBlob(function(blob) {
        if (!blob) { toast('Could not create image', 'error'); return; }
        try {
            var item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(function() {
                toast('Copied to clipboard', 'success');
            }).catch(function() {
                toast('Copy not supported in this browser', 'error');
            });
        } catch (e) {
            toast('Copy not supported in this browser', 'error');
        }
    }, 'image/png');
}

/* Save all settings and form values to localStorage */
function saveSettings() {
    var s = {
        type: state.type,
        dotStyle: state.dotStyle,
        fgColor: state.fgColor,
        bgColor: state.bgColor,
        useGradient: state.useGradient,
        gradientStart: state.gradientStart,
        gradientEnd: state.gradientEnd,
        size: state.size,
        margin: state.margin,
        errorCorrection: state.errorCorrection,
        logoSize: state.logoSize,
        theme: state.theme,
        txtInput: $('txtInput').value,
        wifiSsid: $('wifiSsid').value,
        wifiPass: $('wifiPass').value,
        wifiEnc: $('wifiEnc').value,
        wifiHidden: $('wifiHidden').checked,
        emailTo: $('emailTo').value,
        emailSubj: $('emailSubj').value,
        emailBody: $('emailBody').value,
        phoneNum: $('phoneNum').value,
        smsNum: $('smsNum').value,
        smsMsg: $('smsMsg').value,
        vcFirst: $('vcFirst').value,
        vcLast: $('vcLast').value,
        vcPhone: $('vcPhone').value,
        vcEmail: $('vcEmail').value,
        vcOrg: $('vcOrg').value,
        vcUrl: $('vcUrl').value,
        vcAddr: $('vcAddr').value
    };
    localStorage.setItem('qrForgeSettings', JSON.stringify(s));
}

/* Restore settings from localStorage on page load */
function loadSettings() {
    try {
        var raw = localStorage.getItem('qrForgeSettings');
        if (!raw) return;
        var s = JSON.parse(raw);
        if (s.type) state.type = s.type;
        if (s.dotStyle) state.dotStyle = s.dotStyle;
        if (s.fgColor) state.fgColor = s.fgColor;
        if (s.bgColor) state.bgColor = s.bgColor;
        if (s.useGradient !== undefined) state.useGradient = s.useGradient;
        if (s.gradientStart) state.gradientStart = s.gradientStart;
        if (s.gradientEnd) state.gradientEnd = s.gradientEnd;
        if (s.size) state.size = s.size;
        if (s.margin !== undefined) state.margin = s.margin;
        if (s.errorCorrection) state.errorCorrection = s.errorCorrection;
        if (s.logoSize) state.logoSize = s.logoSize;
        if (s.theme) state.theme = s.theme;

        if (s.txtInput !== undefined) $('txtInput').value = s.txtInput;
        if (s.wifiSsid !== undefined) $('wifiSsid').value = s.wifiSsid;
        if (s.wifiPass !== undefined) $('wifiPass').value = s.wifiPass;
        if (s.wifiEnc !== undefined) $('wifiEnc').value = s.wifiEnc;
        if (s.wifiHidden !== undefined) $('wifiHidden').checked = s.wifiHidden;
        if (s.emailTo !== undefined) $('emailTo').value = s.emailTo;
        if (s.emailSubj !== undefined) $('emailSubj').value = s.emailSubj;
        if (s.emailBody !== undefined) $('emailBody').value = s.emailBody;
        if (s.phoneNum !== undefined) $('phoneNum').value = s.phoneNum;
        if (s.smsNum !== undefined) $('smsNum').value = s.smsNum;
        if (s.smsMsg !== undefined) $('smsMsg').value = s.smsMsg;
        if (s.vcFirst !== undefined) $('vcFirst').value = s.vcFirst;
        if (s.vcLast !== undefined) $('vcLast').value = s.vcLast;
        if (s.vcPhone !== undefined) $('vcPhone').value = s.vcPhone;
        if (s.vcEmail !== undefined) $('vcEmail').value = s.vcEmail;
        if (s.vcOrg !== undefined) $('vcOrg').value = s.vcOrg;
        if (s.vcUrl !== undefined) $('vcUrl').value = s.vcUrl;
        if (s.vcAddr !== undefined) $('vcAddr').value = s.vcAddr;

        syncUIFromState();
    } catch (e) {
        /* Ignore corrupt saved data */
    }
}

/* Push state values into every UI control */
function syncUIFromState() {
    document.querySelectorAll('.type-tab').forEach(function(t) {
        var active = t.dataset.type === state.type;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', active);
    });
    document.querySelectorAll('.type-form').forEach(function(f) {
        f.classList.toggle('active', f.id === 'form-' + state.type);
    });
    document.querySelectorAll('.style-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.style === state.dotStyle);
    });
    $('fgColor').value = state.fgColor;
    $('bgColor').value = state.bgColor;
    $('gradientToggle').checked = state.useGradient;
    $('gradStart').value = state.gradientStart;
    $('gradEnd').value = state.gradientEnd;
    toggleGradientUI();
    $('sizeSlider').value = state.size;
    $('sizeVal').textContent = state.size + 'px';
    $('marginSlider').value = state.margin;
    $('marginVal').textContent = state.margin;
    document.querySelectorAll('.ec-btn').forEach(function(b) {
        b.classList.toggle('active', b.dataset.level === state.errorCorrection);
    });
    $('logoSizeSlider').value = state.logoSize;
    $('logoSizeVal').textContent = state.logoSize + '%';
    applyTheme(state.theme);
}

/* Show or hide gradient color pickers */
function toggleGradientUI() {
    $('fgField').classList.toggle('hidden-field', state.useGradient);
    $('gradStartField').classList.toggle('visible', state.useGradient);
    $('gradEndField').classList.toggle('visible', state.useGradient);
}

/* Apply light or dark theme */
function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    $('themeBtn').querySelector('i').className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

/* Read history array from localStorage */
function getHistory() {
    try { return JSON.parse(localStorage.getItem('qrForgeHistory')) || []; }
    catch (e) { return []; }
}

/* Append one entry to history, capped at 12 */
function saveHistoryItem(thumbData) {
    var list = getHistory();
    list.unshift({
        id: Date.now(),
        type: state.type,
        data: state.lastData,
        thumb: thumbData,
        time: Date.now(),
        settings: {
            dotStyle: state.dotStyle,
            fgColor: state.fgColor,
            bgColor: state.bgColor,
            useGradient: state.useGradient,
            gradientStart: state.gradientStart,
            gradientEnd: state.gradientEnd,
            errorCorrection: state.errorCorrection,
            margin: state.margin,
            logoSize: state.logoSize
        }
    });
    if (list.length > 12) list.length = 12;
    localStorage.setItem('qrForgeHistory', JSON.stringify(list));
}

/* Build a tiny thumbnail canvas for history storage */
function createThumbnail() {
    var tc = document.createElement('canvas');
    var tCtx = tc.getContext('2d');
    var tSize = 96;
    tc.width = tSize;
    tc.height = tSize;
    if (!state.lastQr) return '';

    var qr = state.lastQr;
    var mc = qr.getModuleCount();
    var margin = state.margin;
    var total = mc + margin * 2;
    var ms = tSize / total;

    tCtx.fillStyle = state.bgColor;
    tCtx.fillRect(0, 0, tSize, tSize);
    tCtx.fillStyle = state.useGradient ? state.gradientStart : state.fgColor;

    for (var r = 0; r < mc; r++) {
        for (var c = 0; c < mc; c++) {
            if (qr.isDark(r, c)) {
                var x = (c + margin) * ms;
                var y = (r + margin) * ms;
                if (state.dotStyle === 'dots') {
                    tCtx.beginPath();
                    tCtx.arc(x + ms / 2, y + ms / 2, Math.max(0.01, ms * 0.44), 0, Math.PI * 2);
                    tCtx.fill();
                } else {
                    tCtx.fillRect(x, y, ms, ms);
                }
            }
        }
    }
    return tc.toDataURL('image/png', 0.6);
}

/* Render the history drawer list */
function renderHistory() {
    var list = getHistory();
    var container = $('historyList');
    if (!list.length) {
        container.innerHTML = '<div class="history-empty"><i class="fas fa-clock-rotate-left"></i><p>No history yet</p></div>';
        return;
    }
    var typeIcons = { text: 'link', wifi: 'wifi', email: 'envelope', phone: 'phone', sms: 'comment-dots', vcard: 'address-card' };
    container.innerHTML = list.map(function(item) {
        var timeAgo = getTimeAgo(item.time);
        var label = item.data.length > 35 ? item.data.slice(0, 35) + '...' : item.data;
        var icon = typeIcons[item.type] || 'link';
        return '<div class="history-item" data-id="' + item.id + '">' +
            '<img src="' + item.thumb + '" alt="QR thumbnail" loading="lazy">' +
            '<div class="history-item-info">' +
            '<p><i class="fas fa-' + icon + '" style="margin-right:4px;font-size:0.7rem;opacity:0.5"></i>' + escapeHtml(label) + '</p>' +
            '<span>' + item.type.toUpperCase() + ' &middot; ' + timeAgo + '</span>' +
            '</div>' +
            '<button class="history-item-del" data-del="' + item.id + '" aria-label="Delete"><i class="fas fa-trash"></i></button>' +
            '</div>';
    }).join('');

    container.querySelectorAll('.history-item').forEach(function(el) {
        el.addEventListener('click', function(e) {
            if (e.target.closest('.history-item-del')) return;
            restoreHistoryItem(Number(el.dataset.id));
        });
    });
    container.querySelectorAll('.history-item-del').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteHistoryItem(Number(btn.dataset.del));
        });
    });
}

/* Restore a history entry's settings */
function restoreHistoryItem(id) {
    var list = getHistory();
    var item = list.find(function(i) { return i.id === id; });
    if (!item) return;

    Object.assign(state, item.settings);
    state.type = item.type;
    if (item.type === 'text') $('txtInput').value = item.data;

    syncUIFromState();
    generate();
    closeHistory();
    toast('Restored from history', 'success');
}

/* Delete a single history entry */
function deleteHistoryItem(id) {
    var list = getHistory().filter(function(i) { return i.id !== id; });
    localStorage.setItem('qrForgeHistory', JSON.stringify(list));
    renderHistory();
}

/* Wipe all history */
function clearHistoryAll() {
    localStorage.removeItem('qrForgeHistory');
    renderHistory();
    toast('History cleared', 'info');
}

/* Human-readable relative time */
function getTimeAgo(ts) {
    var diff = Date.now() - ts;
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + 'h ago';
    var days = Math.floor(hrs / 24);
    return days + 'd ago';
}

/* Escape HTML entities to prevent XSS in history display */
function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

/* Open / close the history drawer */
function openHistory() {
    renderHistory();
    $('historyOverlay').classList.add('open');
}
function closeHistory() {
    $('historyOverlay').classList.remove('open');
}

/* Build the color preset swatch buttons */
function buildPresets() {
    var grid = $('presetGrid');
    grid.innerHTML = presets.map(function(p) {
        return '<div class="preset-swatch" data-fg="' + p.fg + '" data-bg="' + p.bg + '" title="' + p.name + '" style="background: linear-gradient(135deg, ' + p.fg + ' 50%, ' + p.bg + ' 50%);"></div>';
    }).join('');
    grid.querySelectorAll('.preset-swatch').forEach(function(sw) {
        sw.addEventListener('click', function() {
            state.fgColor = sw.dataset.fg;
            state.bgColor = sw.dataset.bg;
            state.useGradient = false;
            $('fgColor').value = state.fgColor;
            $('bgColor').value = state.bgColor;
            $('gradientToggle').checked = false;
            toggleGradientUI();
            generate();
        });
    });
}

/* Handle logo file selection or drop */
function handleLogo(file) {
    if (!file || !file.type.startsWith('image/')) {
        toast('Please select a valid image file', 'error');
        return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
        state.logo = e.target.result;
        var img = new Image();
        img.onload = function() {
            state.logoImg = img;
            $('logoThumb').src = state.logo;
            $('logoName').textContent = file.name;
            $('logoSizeInfo').textContent = (file.size / 1024).toFixed(1) + ' KB';
            $('logoPreview').classList.add('visible');
            $('logoSizeGroup').style.display = 'block';

            /* Auto-upgrade error correction so the logo doesn't break scanning */
            if (state.errorCorrection === 'L' || state.errorCorrection === 'M') {
                state.errorCorrection = 'H';
                document.querySelectorAll('.ec-btn').forEach(function(b) {
                    b.classList.toggle('active', b.dataset.level === 'H');
                });
                toast('Error correction set to High for logo support', 'info');
            }
            generate();
        };
        img.src = state.logo;
    };
    reader.readAsDataURL(file);
}

/* Remove the uploaded logo */
function removeLogo() {
    state.logo = null;
    state.logoImg = null;
    $('logoPreview').classList.remove('visible');
    $('logoSizeGroup').style.display = 'none';
    $('logoInput').value = '';
    generate();
}

/* Debounce timer for text input */
var debounceTimer = null;
function debouncedGenerate() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generate, 400);
}

/* Wire up all event listeners */
function initEvents() {
    /* Content type tabs */
    document.querySelectorAll('.type-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            state.type = tab.dataset.type;
            document.querySelectorAll('.type-tab').forEach(function(t) {
                var active = t === tab;
                t.classList.toggle('active', active);
                t.setAttribute('aria-selected', active);
            });
            document.querySelectorAll('.type-form').forEach(function(f) {
                f.classList.toggle('active', f.id === 'form-' + state.type);
            });
            generate();
        });
    });

    /* Module style buttons */
    document.querySelectorAll('.style-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            state.dotStyle = btn.dataset.style;
            document.querySelectorAll('.style-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
            generate();
        });
    });

    /* Color pickers */
    $('fgColor').addEventListener('input', function(e) { state.fgColor = e.target.value; generate(); });
    $('bgColor').addEventListener('input', function(e) { state.bgColor = e.target.value; generate(); });
    $('gradStart').addEventListener('input', function(e) { state.gradientStart = e.target.value; generate(); });
    $('gradEnd').addEventListener('input', function(e) { state.gradientEnd = e.target.value; generate(); });

    /* Gradient toggle */
    $('gradientToggle').addEventListener('change', function(e) {
        state.useGradient = e.target.checked;
        toggleGradientUI();
        generate();
    });

    /* Size and margin sliders */
    $('sizeSlider').addEventListener('input', function(e) {
        state.size = Number(e.target.value);
        $('sizeVal').textContent = state.size + 'px';
        generate();
    });
    $('marginSlider').addEventListener('input', function(e) {
        state.margin = Number(e.target.value);
        $('marginVal').textContent = state.margin;
        generate();
    });

    /* Error correction buttons */
    document.querySelectorAll('.ec-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            state.errorCorrection = btn.dataset.level;
            document.querySelectorAll('.ec-btn').forEach(function(b) { b.classList.toggle('active', b === btn); });
            generate();
        });
    });

    /* Logo file input */
    $('logoInput').addEventListener('change', function(e) {
        if (e.target.files[0]) handleLogo(e.target.files[0]);
    });

    /* Logo drag and drop */
    var logoArea = $('logoArea');
    logoArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        logoArea.style.borderColor = 'var(--accent)';
        logoArea.style.background = 'var(--accent-light)';
    });
    logoArea.addEventListener('dragleave', function() {
        logoArea.style.borderColor = '';
        logoArea.style.background = '';
    });
    logoArea.addEventListener('drop', function(e) {
        e.preventDefault();
        logoArea.style.borderColor = '';
        logoArea.style.background = '';
        if (e.dataTransfer.files[0]) handleLogo(e.dataTransfer.files[0]);
    });

    $('logoRemove').addEventListener('click', removeLogo);
    $('logoSizeSlider').addEventListener('input', function(e) {
        state.logoSize = Number(e.target.value);
        $('logoSizeVal').textContent = state.logoSize + '%';
        generate();
    });

    /* Export buttons */
    $('dlPng').addEventListener('click', downloadPNG);
    $('dlSvg').addEventListener('click', downloadSVG);
    $('copyBtn').addEventListener('click', copyQR);

    /* Theme toggle */
    $('themeBtn').addEventListener('click', function() {
        applyTheme(state.theme === 'light' ? 'dark' : 'light');
        saveSettings();
    });

    /* History drawer */
    $('historyBtn').addEventListener('click', openHistory);
    $('closeHist').addEventListener('click', closeHistory);
    $('historyOverlay').addEventListener('click', function(e) {
        if (e.target === $('historyOverlay')) closeHistory();
    });
    $('clearHist').addEventListener('click', clearHistoryAll);

    /* Live input on all form fields */
    var inputs = document.querySelectorAll('.controls-panel input[type="text"], .controls-panel input[type="email"], .controls-panel input[type="tel"], .controls-panel input[type="url"], .controls-panel textarea, .controls-panel select');
    inputs.forEach(function(el) {
        el.addEventListener('input', debouncedGenerate);
        el.addEventListener('change', generate);
    });

    /* WiFi hidden checkbox */
    $('wifiHidden').addEventListener('change', generate);

    /* Keyboard: Escape closes history */
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeHistory();
    });
}

/* Boot everything up */
buildPresets();
loadSettings();
generate();
initEvents();
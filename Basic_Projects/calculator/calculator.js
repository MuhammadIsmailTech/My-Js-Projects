(function () {
        /* ---- DOM references ---- */
        const valLine    = document.getElementById('valLine');
        const exprLine   = document.getElementById('exprLine');
        const displayEl  = document.getElementById('display');
        const histToggle = document.getElementById('histToggle');
        const histPanel  = document.getElementById('histPanel');
        const histList   = document.getElementById('histList');
        const histClear  = document.getElementById('histClear');
        const allBtns    = document.querySelectorAll('.btn');

        /* ---- Calculator state ---- */
        let cur       = '0';       // current display value (string)
        let prev      = null;      // first operand (string) when an operator is pending
        let op        = null;      // pending operator: '+' | '−' | '×' | '÷'
        let waiting   = false;     // true = next digit replaces cur
        let evaluated = false;     // true = just pressed '='
        let history   = [];        // array of { expr, result }

        /*  
           Display helpers
             */

        /** Format a numeric string for the display with thousand separators */
        function fmt(str) {
            if (str === 'Error') return 'Error';
            // Preserve a trailing decimal while typing (e.g. "12.")
            if (str.endsWith('.')) {
                var intPart = parseInt(str, 10) || 0;
                return intPart.toLocaleString('en-US') + '.';
            }
            var n = parseFloat(str);
            if (isNaN(n) || !isFinite(n)) return 'Error';
            // Preserve original decimal precision
            if (str.includes('.')) {
                var parts = str.split('.');
                return parseInt(parts[0], 10).toLocaleString('en-US') + '.' + parts[1];
            }
            return n.toLocaleString('en-US');
        }

        /** Push current state to the screen */
        function render(animate) {
            var formatted = fmt(cur);
            valLine.textContent = formatted;

            // Pop animation on request
            if (animate) {
                valLine.classList.remove('pop');
                void valLine.offsetWidth;          // force reflow
                valLine.classList.add('pop');
            }

            // Shrink font for long values
            if (formatted.length > 13)      valLine.style.fontSize = '26px';
            else if (formatted.length > 10) valLine.style.fontSize = '32px';
            else                            valLine.style.fontSize = '';

            // Highlight active operator button
            allBtns.forEach(function (b) { b.classList.remove('active-op'); });
            if (op && waiting) {
                var ob = document.querySelector('.btn-op[data-val="' + op + '"]');
                if (ob) ob.classList.add('active-op');
            }

            // Error styling
            valLine.classList.toggle('error-text', cur === 'Error');
        }

        /*  
           Core arithmetic
             */

        function compute(a, operator, b) {
            var x = parseFloat(a), y = parseFloat(b);
            if (isNaN(x) || isNaN(y)) return 'Error';
            var r;
            switch (operator) {
                case '+': r = x + y; break;
                case '−': r = x - y; break;
                case '×': r = x * y; break;
                case '÷':
                    if (y === 0) return 'Error';
                    r = x / y;
                    break;
                default: return 'Error';
            }
            if (!isFinite(r)) return 'Error';
            // Clean up floating-point artefacts (e.g. 0.1+0.2)
            return String(parseFloat(r.toPrecision(12)));
        }

        /*  
           Input handlers
             */

        function inputNumber(d) {
            if (cur === 'Error')  { cur = d; evaluated = false; render(true); return; }
            if (evaluated)        { cur = d; prev = null; op = null; exprLine.textContent = ''; evaluated = false; render(true); return; }
            if (waiting)          { cur = d; waiting = false; render(true); return; }

            // Limit raw digit count
            if (cur.replace(/[^0-9]/g, '').length >= 15) return;

            if (cur === '0' && d !== '0')     cur = d;
            else if (cur === '0' && d === '0') { /* stay */ }
            else                               cur += d;

            render();
        }

        function inputOperator(newOp) {
            if (cur === 'Error') return;
            evaluated = false;

            // Chain: if there's a pending operation, evaluate it first
            if (prev !== null && !waiting) {
                var r = compute(prev, op, cur);
                if (r === 'Error') { showError(); return; }
                cur = r;
                render(true);
            }

            prev    = cur;
            op      = newOp;
            waiting = true;
            exprLine.textContent = fmt(prev) + ' ' + newOp;
            render();
        }

        function inputEquals() {
            if (cur === 'Error' || op === null || prev === null) return;

            var exprStr = fmt(prev) + ' ' + op + ' ' + fmt(cur);
            var r = compute(prev, op, cur);
            if (r === 'Error') { showError(); return; }

            exprLine.textContent = exprStr + ' =';
            cur       = r;
            prev      = null;
            op        = null;
            waiting   = false;
            evaluated = true;

            addHistory(exprStr, fmt(r));
            render(true);
        }

        function inputDot() {
            if (cur === 'Error')  { cur = '0.'; evaluated = false; render(true); return; }
            if (evaluated)        { cur = '0.'; prev = null; op = null; exprLine.textContent = ''; evaluated = false; render(true); return; }
            if (waiting)          { cur = '0.'; waiting = false; render(true); return; }
            if (!cur.includes('.')) cur += '.';
            render();
        }

        function inputPercent() {
            if (cur === 'Error') return;
            var n = parseFloat(cur);
            if (isNaN(n)) return;
            // If chaining, treat as percentage of previous value
            if (prev !== null && op) {
                var base = parseFloat(prev);
                cur = String(parseFloat((base * n / 100).toPrecision(12)));
            } else {
                cur = String(parseFloat((n / 100).toPrecision(12)));
            }
            evaluated = false;
            render(true);
        }

        function inputClear() {
            cur = '0'; prev = null; op = null;
            waiting = false; evaluated = false;
            exprLine.textContent = '';
            render();
        }

        function inputDelete() {
            if (cur === 'Error' || evaluated) { inputClear(); return; }
            if (waiting) return;
            if (cur.length === 1 || (cur.length === 2 && cur[0] === '-')) cur = '0';
            else cur = cur.slice(0, -1);
            render();
        }

        function showError() {
            cur = 'Error'; prev = null; op = null;
            waiting = false; evaluated = false;
            exprLine.textContent = '';
            render(true);
            displayEl.classList.add('shake');
            setTimeout(function () { displayEl.classList.remove('shake'); }, 400);
        }

        /*  
           History
             */

        function addHistory(expr, result) {
            history.unshift({ expr: expr, result: result });
            if (history.length > 50) history.pop();
            renderHistory();
        }

        function renderHistory() {
            if (history.length === 0) {
                histList.innerHTML = '<div class="history-empty">No calculations yet</div>';
                return;
            }
            histList.innerHTML = history.map(function (h, i) {
                return '<div class="history-item" data-idx="' + i + '">'
                     + '<div class="history-expr">' + h.expr + '</div>'
                     + '<div class="history-res">' + h.result + '</div>'
                     + '</div>';
            }).join('');

            // Click a history item to reuse its result
            histList.querySelectorAll('.history-item').forEach(function (el) {
                el.addEventListener('click', function () {
                    var idx  = parseInt(el.dataset.idx, 10);
                    var raw  = history[idx].result.replace(/,/g, '');
                    cur      = raw;
                    prev     = null;
                    op       = null;
                    waiting  = false;
                    evaluated = true;
                    exprLine.textContent = history[idx].expr + ' =';
                    render(true);
                });
            });
        }

        var histOpen = false;
        histToggle.addEventListener('click', function () {
            histOpen = !histOpen;
            histPanel.classList.toggle('open', histOpen);
        });
        histClear.addEventListener('click', function () {
            history = [];
            renderHistory();
        });

        /*  
           Ripple effect
             */

        function ripple(btn, cx, cy) {
            var span = document.createElement('span');
            span.classList.add('ripple');
            var rect = btn.getBoundingClientRect();
            var size = Math.max(rect.width, rect.height);
            span.style.width  = size + 'px';
            span.style.height = size + 'px';
            span.style.left   = (cx - rect.left - size / 2) + 'px';
            span.style.top    = (cy - rect.top  - size / 2) + 'px';
            btn.appendChild(span);
            setTimeout(function () { span.remove(); }, 560);
        }

        /*  
           Button clicks
             */

        function dispatch(act, val) {
            switch (act) {
                case 'num':     inputNumber(val);   break;
                case 'op':      inputOperator(val); break;
                case 'dot':     inputDot();         break;
                case 'equal':   inputEquals();      break;
                case 'clear':   inputClear();       break;
                case 'delete':  inputDelete();      break;
                case 'percent': inputPercent();     break;
            }
        }

        allBtns.forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                ripple(btn, e.clientX, e.clientY);
                dispatch(btn.dataset.act, btn.dataset.val);
            });
        });

        /*  
           Keyboard support
             */

        var keyMap = {
            '0':'num','1':'num','2':'num','3':'num','4':'num',
            '5':'num','6':'num','7':'num','8':'num','9':'num',
            '+':'op', '-':'op', '*':'op', '/':'op',
            '.':'dot', 'Enter':'equal', '=':'equal',
            'Backspace':'delete', 'Escape':'clear', 'Delete':'clear',
            '%':'percent'
        };
        var opTranslate = { '+':'+', '-':'−', '*':'×', '/':'÷' };

        document.addEventListener('keydown', function (e) {
            var act = keyMap[e.key];
            if (!act) return;
            e.preventDefault();

            var val = e.key;
            if (opTranslate[val]) val = opTranslate[val];

            dispatch(act, val);

            // Visual feedback on the matching button
            var selector;
            if (act === 'num' || act === 'op') selector = '.btn[data-val="' + val + '"]';
            else                                selector = '.btn[data-act="' + act + '"]';
            var target = document.querySelector(selector);
            if (target) {
                var r = target.getBoundingClientRect();
                ripple(target, r.left + r.width / 2, r.top + r.height / 2);
                target.classList.add('pressed');
                setTimeout(function () { target.classList.remove('pressed'); }, 140);
            }
        });

        /* ---- Initialise ---- */
        render();
        renderHistory();
    })();
/* ============================= WORD DATABASE ============================= */
    const WORDS = {
        animals: {
            easy: ['cat','dog','fish','bird','frog','bear','deer','wolf','duck','crow','ant','bee','owl','fox','hen'],
            medium: ['tiger','eagle','whale','snake','horse','zebra','panda','koala','otter','crane','shark','moose','goose','raven','bison'],
            hard: ['elephant','giraffe','penguin','dolphin','cheetah','gorilla','panther','gazelle','flamingo','chameleon','kangaroo','alligator','porcupine','salamander','grasshopper']
        },
        fruits: {
            easy: ['fig','plum','pear','lime','date','kiwi','guava','prune'],
            medium: ['apple','grape','mango','peach','lemon','melon','berry','olive','cherry','papaya','coconut','apricot'],
            hard: ['pineapple','strawberry','watermelon','blueberry','pomegranate','raspberry','tangerine','cranberry','gooseberry','dragonfruit']
        },
        tech: {
            easy: ['web','app','bug','ram','usb','api','dns','gui','hex','log','bit','dos'],
            medium: ['python','react','server','router','cloud','pixel','cache','debug','stack','query','linux','docker','token','array'],
            hard: ['algorithm','database','framework','interface','compiler','protocol','encryption','bandwidth','blockchain','container','microservice','refactoring','middleware','virtualization']
        },
        countries: {
            easy: ['cuba','peru','chad','fiji','iran','iraq','laos','mali','oman','togo','naur','benin'],
            medium: ['brazil','france','india','italy','spain','japan','chile','nepal','qatar','sweden','poland','greece','norway','kenya'],
            hard: ['australia','argentina','thailand','portugal','indonesia','colombia','ethiopia','malaysia','venezuela','cambodia','singapore','mozambique','philippines','azerbaijan']
        },
        sports: {
            easy: ['golf','judo','swim','dive','surf','polo','yoga','ski','row','box'],
            medium: ['tennis','soccer','hockey','boxing','skiing','racing','bowling','fencing','archery','rowing','marathon','cricket','rugby'],
            hard: ['badminton','gymnastics','volleyball','wrestling','snowboard','basketball','handball','lacrosse','triathlon','skateboard','windsurfing','bobsleigh','waterpolo','decathlon']
        }
    };

    /* ============================= SOUND ENGINE ============================= */
    const SoundEngine = {
        ctx: null,
        enabled: true,

        init() {
            if (!this.ctx) {
                const AC = window.AudioContext || window.webkitAudioContext;
                if (AC) this.ctx = new AC();
            }
            if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
        },

        /* Generate a short tone */
        tone(freq, duration, type = 'sine', vol = 0.12, delay = 0) {
            if (!this.enabled || !this.ctx) return;
            const t = this.ctx.currentTime + delay;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, t);
            gain.gain.setValueAtTime(vol, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
            osc.connect(gain).connect(this.ctx.destination);
            osc.start(t);
            osc.stop(t + duration);
        },

        /* Noise burst for shuffle sound */
        noise(duration = 0.08, vol = 0.06) {
            if (!this.enabled || !this.ctx) return;
            const sr = this.ctx.sampleRate;
            const len = Math.floor(sr * duration);
            const buf = this.ctx.createBuffer(1, len, sr);
            const data = buf.getChannelData(0);
            for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * vol;
            const src = this.ctx.createBufferSource();
            const gain = this.ctx.createGain();
            src.buffer = buf;
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            src.connect(gain).connect(this.ctx.destination);
            src.start();
        },

        click() { this.tone(800, 0.06, 'sine', 0.08); },

        correct() {
            this.tone(523, 0.12, 'sine', 0.1, 0);
            this.tone(659, 0.12, 'sine', 0.1, 0.1);
            this.tone(784, 0.2, 'sine', 0.12, 0.2);
        },

        wrong() {
            this.tone(300, 0.15, 'sawtooth', 0.08, 0);
            this.tone(200, 0.25, 'sawtooth', 0.06, 0.1);
        },

        hint() { this.tone(600, 0.1, 'sine', 0.07); this.tone(800, 0.15, 'sine', 0.07, 0.08); },

        shuffle() { this.noise(0.1, 0.05); },

        tick() { this.tone(1000, 0.02, 'sine', 0.03); },

        gameover() {
            this.tone(392, 0.2, 'sine', 0.1, 0);
            this.tone(311, 0.2, 'sine', 0.1, 0.2);
            this.tone(262, 0.4, 'sine', 0.12, 0.4);
        }
    };

    /* ============================= CONFETTI ENGINE ============================= */
    const ConfettiEngine = {
        canvas: null, ctx: null, particles: [], running: false,

        init() {
            this.canvas = document.getElementById('confetti-canvas');
            this.ctx = this.canvas.getContext('2d');
            this.resize();
            window.addEventListener('resize', () => this.resize());
        },

        resize() {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        },

        launch(count = 100) {
            const colors = ['#22c55e','#4ade80','#f59e0b','#fbbf24','#06b6d4','#a78bfa','#f472b6','#ffffff'];
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.canvas.width,
                    y: -10 - Math.random() * 300,
                    w: 5 + Math.random() * 7,
                    h: 3 + Math.random() * 9,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: (Math.random() - 0.5) * 10,
                    vy: 2 + Math.random() * 5,
                    rot: Math.random() * 360,
                    rotSpeed: (Math.random() - 0.5) * 18,
                    opacity: 1,
                    decay: 0.003 + Math.random() * 0.005
                });
            }
            if (!this.running) { this.running = true; this.animate(); }
        },

        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            for (const p of this.particles) {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.12;
                p.vx *= 0.99;
                p.rot += p.rotSpeed;
                p.opacity -= p.decay;
                this.ctx.save();
                this.ctx.translate(p.x, p.y);
                this.ctx.rotate(p.rot * Math.PI / 180);
                this.ctx.globalAlpha = Math.max(0, p.opacity);
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                this.ctx.restore();
            }
            this.particles = this.particles.filter(p => p.opacity > 0 && p.y < this.canvas.height + 60);
            if (this.particles.length > 0) {
                requestAnimationFrame(() => this.animate());
            } else {
                this.running = false;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    };

    /* ============================= GAME LOGIC ============================= */
    const Game = {
        /* ----- State ----- */
        difficulty: 'easy',
        category: 'animals',
        score: 0,
        currentWord: '',
        scrambledWord: '',
        wordIndex: 0,
        wordsPerRound: 10,
        lives: 3,
        maxLives: 3,
        timeLeft: 30,
        maxTime: 30,
        timerInterval: null,
        hintsLeft: 0,
        revealedPositions: new Set(),
        wordPool: [],
        answered: false,
        wordsCorrect: 0,
        bestStreak: 0,
        currentStreak: 0,
        totalTimeBonus: 0,

        /* ----- Timer settings per difficulty ----- */
        timerSettings: { easy: 30, medium: 22, hard: 15 },
        hintSettings: { easy: 3, medium: 2, hard: 1 },
        scoreSettings: { easy: 10, medium: 20, hard: 30 },

        /* ----- DOM References ----- */
        els: {},

        /* ----- Initialize ----- */
        init() {
            /* Cache DOM elements */
            const ids = [
                'loading-screen','menu-screen','game-screen','gameover-screen','leaderboard-screen',
                'loader-text','difficulty-chips','category-grid','btn-start','btn-leaderboard',
                'btn-theme-menu','btn-sound-menu','btn-theme-game','btn-sound-game',
                'score-display','score-box','timer-wrap','timer-fill','timer-text',
                'lives-display','progress-label','category-label','progress-fill',
                'tiles-container','feedback','answer-input','input-hint',
                'btn-check','btn-hint','btn-shuffle','btn-next','hint-count',
                'go-title','go-subtitle','go-stats','go-name-input','btn-save-score',
                'go-save-row','go-saved-msg','btn-play-again','btn-go-menu',
                'lb-body','lb-empty','btn-lb-back','btn-lb-clear','confetti-canvas'
            ];
            ids.forEach(id => this.els[id] = document.getElementById(id));

            ConfettiEngine.init();
            this.bindEvents();
            this.runLoadingScreen();
        },

        /* ----- Loading screen text scramble effect ----- */
        runLoadingScreen() {
            const el = this.els['loader-text'];
            const finalText = 'WORD SCRAMBLE';
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const totalSteps = 22;
            const stepDuration = 2200 / totalSteps;
            let step = 0;

            const timer = setInterval(() => {
                let result = '';
                const revealThreshold = (step / totalSteps) * finalText.length;
                for (let i = 0; i < finalText.length; i++) {
                    if (finalText[i] === ' ') { result += ' '; }
                    else if (i < revealThreshold) { result += finalText[i]; }
                    else { result += chars[Math.floor(Math.random() * chars.length)]; }
                }
                el.textContent = result;
                step++;
                if (step > totalSteps) {
                    clearInterval(timer);
                    el.textContent = finalText;
                    setTimeout(() => this.showScreen('menu-screen'), 400);
                }
            }, stepDuration);
        },

        /* ----- Screen Management ----- */
        showScreen(id) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            this.els[id].classList.add('active');
        },

        /* ----- Event Bindings ----- */
        bindEvents() {
            /* Difficulty chips */
            this.els['difficulty-chips'].addEventListener('click', e => {
                const chip = e.target.closest('.chip');
                if (!chip) return;
                SoundEngine.init(); SoundEngine.click();
                this.difficulty = chip.dataset.diff;
                this.els['difficulty-chips'].querySelectorAll('.chip').forEach(c => {
                    c.className = 'chip';
                    c.setAttribute('aria-checked', 'false');
                });
                chip.classList.add('active-' + this.difficulty);
                chip.setAttribute('aria-checked', 'true');
            });

            /* Category cards */
            this.els['category-grid'].addEventListener('click', e => {
                const card = e.target.closest('.cat-card');
                if (!card) return;
                SoundEngine.init(); SoundEngine.click();
                this.category = card.dataset.cat;
                this.els['category-grid'].querySelectorAll('.cat-card').forEach(c => {
                    c.classList.remove('selected');
                    c.setAttribute('aria-checked', 'false');
                });
                card.classList.add('selected');
                card.setAttribute('aria-checked', 'true');
            });

            /* Keyboard support for category cards */
            this.els['category-grid'].addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.target.click();
                }
            });

            /* Start game */
            this.els['btn-start'].addEventListener('click', () => {
                SoundEngine.init(); SoundEngine.click();
                this.startGame();
            });

            /* Check answer */
            this.els['btn-check'].addEventListener('click', () => this.checkAnswer());

            /* Hint */
            this.els['btn-hint'].addEventListener('click', () => this.useHint());

            /* Shuffle */
            this.els['btn-shuffle'].addEventListener('click', () => this.shuffleWord());

            /* Next word */
            this.els['btn-next'].addEventListener('click', () => this.nextWord());

            /* Enter key on input */
            this.els['answer-input'].addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (this.answered) this.nextWord();
                    else this.checkAnswer();
                }
            });

            /* Live character count */
            this.els['answer-input'].addEventListener('input', () => this.updateInputHint());

            /* Theme toggles */
            const toggleTheme = () => {
                const html = document.documentElement;
                const isDark = html.dataset.theme === 'dark';
                html.dataset.theme = isDark ? 'light' : 'dark';
                const icon = isDark ? 'fa-sun' : 'fa-moon';
                document.querySelectorAll('#btn-theme-menu i, #btn-theme-game i').forEach(i => i.className = 'fas ' + icon);
                SoundEngine.init(); SoundEngine.click();
            };
            this.els['btn-theme-menu'].addEventListener('click', toggleTheme);
            this.els['btn-theme-game'].addEventListener('click', toggleTheme);

            /* Sound toggles */
            const toggleSound = () => {
                SoundEngine.enabled = !SoundEngine.enabled;
                const icon = SoundEngine.enabled ? 'fa-volume-high' : 'fa-volume-xmark';
                document.querySelectorAll('#btn-sound-menu i, #btn-sound-game i').forEach(i => i.className = 'fas ' + icon);
                if (SoundEngine.enabled) { SoundEngine.init(); SoundEngine.click(); }
            };
            this.els['btn-sound-menu'].addEventListener('click', toggleSound);
            this.els['btn-sound-game'].addEventListener('click', toggleSound);

            /* Leaderboard */
            this.els['btn-leaderboard'].addEventListener('click', () => { SoundEngine.click(); this.renderLeaderboard(); this.showScreen('leaderboard-screen'); });
            this.els['btn-lb-back'].addEventListener('click', () => { SoundEngine.click(); this.showScreen('menu-screen'); });
            this.els['btn-lb-clear'].addEventListener('click', () => {
                SoundEngine.click();
                localStorage.removeItem('wordscramble_lb');
                this.renderLeaderboard();
            });

            /* Game Over */
            this.els['btn-save-score'].addEventListener('click', () => this.saveScore());
            this.els['btn-play-again'].addEventListener('click', () => { SoundEngine.click(); this.startGame(); });
            this.els['btn-go-menu'].addEventListener('click', () => { SoundEngine.click(); this.showScreen('menu-screen'); });
        },

        /* ----- Start Game ----- */
        startGame() {
            this.score = 0;
            this.wordIndex = 0;
            this.wordsCorrect = 0;
            this.bestStreak = 0;
            this.currentStreak = 0;
            this.totalTimeBonus = 0;
            this.maxTime = this.timerSettings[this.difficulty];
            this.hintsLeft = this.hintSettings[this.difficulty];

            /* Build shuffled word pool */
            this.wordPool = [...WORDS[this.category][this.difficulty]];
            this.shuffleArray(this.wordPool);

            this.updateScoreDisplay();
            this.showScreen('game-screen');
            this.els['category-label'].textContent = this.capitalize(this.category);
            this.loadWord();
        },

        /* ----- Load a New Word ----- */
        loadWord() {
            this.answered = false;
            this.lives = this.maxLives;
            this.timeLeft = this.maxTime;
            this.revealedPositions.clear();

            /* Pick next word from pool */
            if (this.wordPool.length === 0) {
                this.wordPool = [...WORDS[this.category][this.difficulty]];
                this.shuffleArray(this.wordPool);
            }
            this.currentWord = this.wordPool.pop();
            this.scrambledWord = this.scrambleString(this.currentWord);

            /* Update UI */
            this.wordIndex++;
            this.els['progress-label'].textContent = `Word ${this.wordIndex} / ${this.wordsPerRound}`;
            this.els['progress-fill'].style.width = ((this.wordIndex - 1) / this.wordsPerRound * 100) + '%';
            this.els['hint-count'].textContent = this.hintsLeft > 0 ? `(${this.hintsLeft})` : '';
            this.els['btn-hint'].disabled = this.hintsLeft <= 0;
            this.els['btn-hint'].style.opacity = this.hintsLeft > 0 ? '1' : '0.4';

            this.renderTiles();
            this.renderLives();
            this.updateTimerDisplay();
            this.clearFeedback();
            this.els['answer-input'].value = '';
            this.els['answer-input'].disabled = false;
            this.updateInputHint();

            /* Show/hide buttons */
            this.els['btn-check'].style.display = '';
            this.els['btn-hint'].style.display = '';
            this.els['btn-shuffle'].style.display = '';
            this.els['btn-next'].style.display = 'none';

            /* Remove timer warning */
            this.els['timer-wrap'].classList.remove('timer-warning');

            /* Start timer */
            this.clearTimer();
            this.timerInterval = setInterval(() => this.tick(), 1000);

            /* Focus input */
            setTimeout(() => this.els['answer-input'].focus(), 300);
        },

        /* ----- Scramble Algorithm (Fisher-Yates) ----- */
        scrambleString(word) {
            const arr = word.split('');
            let attempts = 0;
            do {
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                attempts++;
            } while (arr.join('') === word && attempts < 100);
            return arr.join('');
        },

        /* ----- Shuffle array ----- */
        shuffleArray(arr) {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
        },

        /* ----- Render Letter Tiles ----- */
        renderTiles(animate = true) {
            const container = this.els['tiles-container'];
            container.innerHTML = '';
            const letters = this.scrambledWord.split('');
            letters.forEach((letter, i) => {
                const tile = document.createElement('div');
                tile.className = 'letter-tile';
                if (this.revealedPositions.has(i)) tile.classList.add('revealed');
                tile.textContent = letter;
                if (animate) tile.style.animationDelay = (i * 0.06) + 's';
                else tile.style.animation = 'none';
                container.appendChild(tile);
            });
        },

        /* ----- Render Lives ----- */
        renderLives() {
            const container = this.els['lives-display'];
            container.innerHTML = '';
            for (let i = 0; i < this.maxLives; i++) {
                const heart = document.createElement('i');
                heart.className = 'fas fa-heart heart' + (i >= this.lives ? ' lost' : '');
                container.appendChild(heart);
            }
        },

        /* ----- Timer Logic ----- */
        tick() {
            this.timeLeft--;
            this.updateTimerDisplay();

            /* Warning pulse when low */
            if (this.timeLeft <= 5 && this.timeLeft > 0) {
                this.els['timer-wrap'].classList.add('timer-warning');
                SoundEngine.tick();
            }

            if (this.timeLeft <= 0) {
                this.clearTimer();
                this.handleTimeUp();
            }
        },

        updateTimerDisplay() {
            const fraction = Math.max(0, this.timeLeft / this.maxTime);
            const circumference = 263.89;
            const offset = circumference * (1 - fraction);
            const fill = this.els['timer-fill'];
            fill.style.strokeDashoffset = offset;

            /* Color transitions */
            if (fraction > 0.5) fill.style.stroke = 'var(--accent)';
            else if (fraction > 0.25) fill.style.stroke = 'var(--secondary)';
            else fill.style.stroke = 'var(--danger)';

            this.els['timer-text'].textContent = Math.max(0, this.timeLeft);
        },

        clearTimer() {
            if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
        },

        /* ----- Check Answer ----- */
        checkAnswer() {
            if (this.answered) return;
            const answer = this.els['answer-input'].value.trim();
            if (!answer) {
                this.els['answer-input'].focus();
                return;
            }

            if (answer.toLowerCase() === this.currentWord.toLowerCase()) {
                this.handleCorrect();
            } else {
                this.handleWrong();
            }
        },

        /* ----- Correct Answer ----- */
        handleCorrect() {
            this.answered = true;
            this.clearTimer();
            SoundEngine.correct();

            /* Calculate score */
            const baseScore = this.scoreSettings[this.difficulty];
            const timeBonus = this.timeLeft * 2;
            const totalPts = baseScore + timeBonus;
            this.score += totalPts;
            this.totalTimeBonus += timeBonus;
            this.wordsCorrect++;
            this.currentStreak++;
            if (this.currentStreak > this.bestStreak) this.bestStreak = this.currentStreak;

            /* Update UI */
            this.updateScoreDisplay(totalPts);
            this.showFeedback('correct', 'Correct! +' + totalPts + ' points');
            ConfettiEngine.launch(90);

            /* Green pulse on tiles */
            this.els['tiles-container'].querySelectorAll('.letter-tile').forEach(t => {
                t.style.background = 'var(--accent-glow)';
                t.style.borderColor = 'var(--accent)';
                t.style.color = 'var(--accent-light)';
                t.classList.add('correct-pulse');
            });

            this.els['answer-input'].disabled = true;
            this.els['btn-check'].style.display = 'none';
            this.els['btn-hint'].style.display = 'none';
            this.els['btn-shuffle'].style.display = 'none';
            this.els['btn-next'].style.display = '';
            this.els['btn-next'].focus();

            /* Auto advance after delay */
            setTimeout(() => {
                if (this.answered) this.advanceOrEnd();
            }, 2500);
        },

        /* ----- Wrong Answer ----- */
        handleWrong() {
            SoundEngine.wrong();
            this.lives--;
            this.currentStreak = 0;

            /* Shake animation */
            this.els['answer-input'].classList.add('shake');
            setTimeout(() => this.els['answer-input'].classList.remove('shake'), 500);

            /* Heart break animation */
            const hearts = this.els['lives-display'].querySelectorAll('.heart');
            const lostHeart = hearts[this.lives];
            if (lostHeart) {
                lostHeart.classList.add('heart-break');
                setTimeout(() => { lostHeart.classList.add('lost'); lostHeart.classList.remove('heart-break'); }, 500);
            }

            if (this.lives <= 0) {
                /* Out of lives */
                this.answered = true;
                this.clearTimer();
                this.els['answer-input'].disabled = true;
                this.showFeedback('wrong', `The word was: <span class="reveal-word">${this.currentWord.toUpperCase()}</span>`);
                this.els['btn-check'].style.display = 'none';
                this.els['btn-hint'].style.display = 'none';
                this.els['btn-shuffle'].style.display = 'none';
                this.els['btn-next'].style.display = '';
                setTimeout(() => { if (this.answered) this.advanceOrEnd(); }, 2200);
            } else {
                this.showFeedback('wrong', `Wrong! ${this.lives} ${this.lives === 1 ? 'attempt' : 'attempts'} remaining`);
                this.els['answer-input'].value = '';
                this.els['answer-input'].focus();
            }
        },

        /* ----- Time Up ----- */
        handleTimeUp() {
            this.answered = true;
            this.currentStreak = 0;
            SoundEngine.wrong();
            this.els['answer-input'].disabled = true;
            this.showFeedback('wrong', `Time's up! The word was: <span class="reveal-word">${this.currentWord.toUpperCase()}</span>`);
            this.els['btn-check'].style.display = 'none';
            this.els['btn-hint'].style.display = 'none';
            this.els['btn-shuffle'].style.display = 'none';
            this.els['btn-next'].style.display = '';
            setTimeout(() => { if (this.answered) this.advanceOrEnd(); }, 2200);
        },

        /* ----- Next Word / End Game ----- */
        nextWord() {
            this.answered = false;
            this.advanceOrEnd();
        },

        advanceOrEnd() {
            if (this.wordIndex >= this.wordsPerRound) {
                this.endGame();
            } else {
                this.loadWord();
            }
        },

        /* ----- Hint System ----- */
        useHint() {
            if (this.hintsLeft <= 0 || this.answered) return;
            SoundEngine.hint();

            /* Find unrevealed positions */
            const unrevealed = [];
            for (let i = 0; i < this.currentWord.length; i++) {
                if (!this.revealedPositions.has(i)) unrevealed.push(i);
            }
            if (unrevealed.length === 0) return;

            /* Pick a random unrevealed position */
            const pos = unrevealed[Math.floor(Math.random() * unrevealed.length)];
            this.revealedPositions.add(pos);

            /* Re-scramble with revealed letter in place */
            this.rebuildScrambledWithReveals();

            this.hintsLeft--;
            this.score = Math.max(0, this.score - 5);
            this.updateScoreDisplay();

            this.els['hint-count'].textContent = this.hintsLeft > 0 ? `(${this.hintsLeft})` : '';
            if (this.hintsLeft <= 0) {
                this.els['btn-hint'].disabled = true;
                this.els['btn-hint'].style.opacity = '0.4';
            }

            this.showFeedback('info', `Letter revealed: "${this.currentWord[pos].toUpperCase()}" at position ${pos + 1}. (-5 pts)`);
            this.renderTiles(true);
        },

        /* Rebuild scrambled string keeping revealed letters in their correct positions */
        rebuildScrambledWithReveals() {
            const result = new Array(this.currentWord.length);
            /* Place revealed letters at correct positions */
            for (const pos of this.revealedPositions) {
                result[pos] = this.currentWord[pos];
            }
            /* Fill remaining with shuffled unrevealed letters */
            const remaining = [];
            for (let i = 0; i < this.currentWord.length; i++) {
                if (!this.revealedPositions.has(i)) remaining.push(this.currentWord[i]);
            }
            this.shuffleArray(remaining);
            let ri = 0;
            for (let i = 0; i < result.length; i++) {
                if (!result[i]) result[i] = remaining[ri++];
            }
            this.scrambledWord = result.join('');
        },

        /* ----- Shuffle Button ----- */
        shuffleWord() {
            if (this.answered) return;
            SoundEngine.shuffle();
            this.scrambledWord = this.scrambleString(this.scrambledWord);
            /* Re-apply revealed positions */
            if (this.revealedPositions.size > 0) {
                this.rebuildScrambledWithReveals();
            }
            /* Animate tiles with shuffle effect */
            this.els['tiles-container'].querySelectorAll('.letter-tile').forEach(t => {
                t.classList.add('tile-shuffle');
                setTimeout(() => t.classList.remove('tile-shuffle'), 350);
            });
            setTimeout(() => this.renderTiles(false), 180);
            /* Re-add revealed styling after re-render */
            setTimeout(() => {
                this.els['tiles-container'].querySelectorAll('.letter-tile').forEach((t, i) => {
                    if (this.revealedPositions.has(i)) t.classList.add('revealed');
                    t.classList.add('tile-shuffle');
                    setTimeout(() => t.classList.remove('tile-shuffle'), 350);
                });
            }, 200);
        },

        /* ----- End Game ----- */
        endGame() {
            this.clearTimer();
            this.els['progress-fill'].style.width = '100%';

            const accuracy = this.wordsPerRound > 0 ? Math.round((this.wordsCorrect / this.wordsPerRound) * 100) : 0;

            /* Dynamic title/message */
            let title, subtitle, iconClass;
            if (accuracy >= 90) { title = 'Outstanding'; subtitle = 'You crushed it!'; iconClass = 'fa-crown'; }
            else if (accuracy >= 70) { title = 'Well Done'; subtitle = 'Great performance!'; iconClass = 'fa-medal'; }
            else if (accuracy >= 50) { title = 'Not Bad'; subtitle = 'Room for improvement.'; iconClass = 'fa-thumbs-up'; }
            else { title = 'Keep Trying'; subtitle = 'Practice makes perfect.'; iconClass = 'fa-dumbbell'; }

            this.els['go-title'].textContent = title;
            this.els['go-subtitle'].textContent = subtitle;
            this.els['go-icon'].innerHTML = `<i class="fas ${iconClass}"></i>`;

            /* Stats */
            this.els['go-stats'].innerHTML = `
                <div class="stat-card fade-in-up" style="animation-delay:0.1s"><div class="stat-value">${this.score}</div><div class="stat-label">Total Score</div></div>
                <div class="stat-card fade-in-up" style="animation-delay:0.2s"><div class="stat-value">${this.wordsCorrect}/${this.wordsPerRound}</div><div class="stat-label">Words Correct</div></div>
                <div class="stat-card fade-in-up" style="animation-delay:0.3s"><div class="stat-value">${accuracy}%</div><div class="stat-label">Accuracy</div></div>
                <div class="stat-card fade-in-up" style="animation-delay:0.4s"><div class="stat-value">${this.bestStreak}</div><div class="stat-label">Best Streak</div></div>
            `;

            /* Reset save UI */
            this.els['go-name-input'].value = '';
            this.els['go-saved-msg'].style.display = 'none';
            this.els['go-save-row'].style.display = 'flex';
            this.els['btn-save-score'].disabled = false;

            if (accuracy >= 70) {
                SoundEngine.correct();
                ConfettiEngine.launch(60);
            } else {
                SoundEngine.gameover();
            }

            this.showScreen('gameover-screen');
            setTimeout(() => this.els['go-name-input'].focus(), 400);
        },

        /* ----- Save Score to Leaderboard ----- */
        saveScore() {
            const name = this.els['go-name-input'].value.trim();
            if (!name) { this.els['go-name-input'].focus(); return; }

            SoundEngine.click();

            const entry = {
                name,
                score: this.score,
                difficulty: this.difficulty,
                category: this.category,
                date: new Date().toLocaleDateString()
            };

            let lb = JSON.parse(localStorage.getItem('wordscramble_lb') || '[]');
            lb.push(entry);
            lb.sort((a, b) => b.score - a.score);
            lb = lb.slice(0, 10);
            localStorage.setItem('wordscramble_lb', JSON.stringify(lb));

            this.els['go-saved-msg'].style.display = 'block';
            this.els['go-save-row'].style.display = 'none';
            this.els['btn-save-score'].disabled = true;
        },

        /* ----- Render Leaderboard ----- */
        renderLeaderboard() {
            const lb = JSON.parse(localStorage.getItem('wordscramble_lb') || '[]');
            const body = this.els['lb-body'];
            const empty = this.els['lb-empty'];

            if (lb.length === 0) {
                body.innerHTML = '';
                empty.style.display = 'block';
                return;
            }
            empty.style.display = 'none';

            body.innerHTML = lb.map((entry, i) => `
                <div class="lb-row fade-in-up" style="animation-delay:${i * 0.05}s">
                    <span class="lb-rank ${i < 3 ? 'top' : ''}">${i + 1}</span>
                    <span class="lb-name">${this.escapeHTML(entry.name)}</span>
                    <span class="lb-score">${entry.score}</span>
                    <span class="lb-diff ${entry.difficulty}">${entry.difficulty}</span>
                </div>
            `).join('');
        },

        /* ----- UI Helpers ----- */
        updateScoreDisplay(floatPts) {
            this.els['score-display'].textContent = this.score;
            /* Floating score animation */
            if (floatPts) {
                const el = document.createElement('span');
                el.className = 'float-score';
                el.textContent = '+' + floatPts;
                const box = this.els['score-box'];
                box.appendChild(el);
                setTimeout(() => el.remove(), 1100);
            }
        },

        showFeedback(type, html) {
            const fb = this.els['feedback'];
            fb.className = 'feedback ' + type;
            fb.innerHTML = html;
        },

        clearFeedback() {
            const fb = this.els['feedback'];
            fb.className = 'feedback';
            fb.innerHTML = '';
        },

        updateInputHint() {
            const val = this.els['answer-input'].value.length;
            const total = this.currentWord.length;
            this.els['input-hint'].textContent = `${val} / ${total} characters`;
        },

        capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); },

        escapeHTML(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    };

    /* ============================= BOOT ============================= */
    document.addEventListener('DOMContentLoaded', () => Game.init());
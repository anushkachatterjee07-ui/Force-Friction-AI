// content.js — Focus Friction AI
// Polls the local FastAPI backend every 2 seconds.
// LOCKED  → heavyForceBlock() keeps the barrier active
// UNLOCKED → barrier is removed so the user can browse

(function () {
    'use strict';

    const BARRIER_ID  = 'ff-barrier';
    const STYLE_ID    = 'ff-barrier-style';
    const API_STATUS  = 'http://127.0.0.1:8000/api/status';
    const API_INTENT  = 'http://127.0.0.1:8000/log-intent';
    const API_UNLOCK  = 'http://127.0.0.1:8000/api/unlock';
    const POLL_MS     = 2000;

    let isProcessing = false;

    /* ─────────────────────────────────────────────
       heavyForceBlock()
       Injects the mindful barrier with intent check.
    ───────────────────────────────────────────── */
    function heavyForceBlock(message = null, showButtons = true) {
        injectStyle();

        let barrier = document.getElementById(BARRIER_ID);
        if (!barrier) {
            barrier = document.createElement('div');
            barrier.id = BARRIER_ID;
            (document.body || document.documentElement).appendChild(barrier);
        }

        const siteName = window.location.hostname.replace('www.', '').split('.')[0];
        const capitalizedSite = siteName.charAt(0).toUpperCase() + siteName.slice(1);

        // Clear existing content to redraw
        barrier.innerHTML = '';

        const card = document.createElement('div');
        card.className = 'ff-card';

        const icon = document.createElement('div');
        icon.className = 'ff-icon';
        icon.textContent = message ? '🧠' : '🔒';

        const title = document.createElement('div');
        title.className = 'ff-title';
        title.textContent = message ? 'Mindful Check-in' : `Why are you opening ${capitalizedSite}?`;

        const sub = document.createElement('div');
        sub.className = 'ff-sub';
        sub.textContent = message || 'Select your intent to continue.';

        card.appendChild(icon);
        card.appendChild(title);
        card.appendChild(sub);

        if (showButtons) {
            const btnContainer = document.createElement('div');
            btnContainer.className = 'ff-btn-container';

            const intents = [
                { label: 'Study/Tutorial', value: 'study' },
                { label: 'Work', value: 'work' },
                { label: 'Relaxation', value: 'relaxation' },
                { label: 'Habit / Boredom', value: 'boredom' },
                { label: 'Emotional escape', value: 'escape' }
            ];

            intents.forEach(intent => {
                const btn = document.createElement('button');
                btn.className = 'ff-btn';
                btn.textContent = intent.label;
                btn.onclick = () => submitIntent(intent.label);
                btnContainer.appendChild(btn);
            });

            card.appendChild(btnContainer);
        } else if (message) {
            // Show a "Continue" button for friction/nudge
            const continueBtn = document.createElement('button');
            continueBtn.className = 'ff-btn ff-btn-primary';
            continueBtn.textContent = 'Continue to Site';
            continueBtn.onclick = () => finalUnlock();
            card.appendChild(continueBtn);
        }

        barrier.appendChild(card);

        // Lock scrolling
        const root = document.documentElement;
        if (root) root.style.setProperty('overflow', 'hidden', 'important');
        if (document.body) document.body.style.setProperty('overflow', 'hidden', 'important');
    }

    async function submitIntent(reason) {
        if (isProcessing) return;
        isProcessing = true;

        try {
            const site = window.location.hostname;
            const response = await fetch(API_INTENT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    site: site,
                    reason: reason,
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();
            
            if (data.action === 'allow') {
                removeBarrier();
            } else {
                // Show friction or nudge message
                heavyForceBlock(data.message, false);
            }
        } catch (err) {
            console.error('Focus Friction: Error submitting intent', err);
        } finally {
            isProcessing = false;
        }
    }

    async function finalUnlock() {
        try {
            await fetch(API_UNLOCK, { method: 'POST' });
            removeBarrier();
        } catch (err) {
            console.error('Focus Friction: Error unlocking', err);
        }
    }

    function removeBarrier() {
        const barrier = document.getElementById(BARRIER_ID);
        if (barrier) barrier.remove();

        const style = document.getElementById(STYLE_ID);
        if (style) style.remove();

        // Restore scrolling
        if (document.documentElement) document.documentElement.style.overflow = '';
        if (document.body) document.body.style.overflow = '';
    }

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;

        const s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = `
            #${BARRIER_ID} {
                position: fixed !important;
                inset: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: #121214 !important;
                z-index: 2147483647 !important;
                pointer-events: all !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                font-family: 'Inter', -apple-system, sans-serif !important;
            }
            #${BARRIER_ID} .ff-card {
                background: #1c1c21 !important;
                border: 1px solid rgba(255,255,255,0.1) !important;
                border-radius: 24px !important;
                padding: 3rem !important;
                text-align: center !important;
                max-width: 500px !important;
                width: 90% !important;
                box-shadow: 0 40px 100px rgba(0,0,0,0.8) !important;
            }
            #${BARRIER_ID} .ff-icon {
                font-size: 3.5rem !important;
                margin-bottom: 1.5rem !important;
            }
            #${BARRIER_ID} .ff-title {
                font-size: 1.8rem !important;
                font-weight: 800 !important;
                color: #fff !important;
                margin-bottom: 0.8rem !important;
                letter-spacing: -0.03em !important;
            }
            #${BARRIER_ID} .ff-sub {
                font-size: 1.05rem !important;
                line-height: 1.6 !important;
                color: #a0a0ab !important;
                margin-bottom: 2.5rem !important;
            }
            #${BARRIER_ID} .ff-btn-container {
                display: flex !important;
                flex-direction: column !important;
                gap: 12px !important;
            }
            #${BARRIER_ID} .ff-btn {
                background: #2a2a32 !important;
                border: 1px solid rgba(255,255,255,0.05) !important;
                color: #efeff1 !important;
                padding: 14px !important;
                border-radius: 12px !important;
                font-size: 1rem !important;
                font-weight: 600 !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
                text-align: center !important;
            }
            #${BARRIER_ID} .ff-btn:hover {
                background: #3a3a45 !important;
                transform: translateY(-2px) !important;
                border-color: rgba(255,255,255,0.2) !important;
            }
            #${BARRIER_ID} .ff-btn-primary {
                background: #6366f1 !important;
                color: white !important;
                margin-top: 10px !important;
            }
            #${BARRIER_ID} .ff-btn-primary:hover {
                background: #4f46e5 !important;
            }
        `;

        (document.head || document.documentElement).appendChild(s);
    }

    async function pollStatus() {
        if (isProcessing) return;
        try {
            const response = await fetch(API_STATUS);
            const data = await response.json();

            if (data.status === 'UNLOCKED') {
                removeBarrier();
            } else {
                // Only show initial barrier if not already showing a message
                const barrier = document.getElementById(BARRIER_ID);
                if (!barrier || barrier.innerHTML === '') {
                    heavyForceBlock();
                }
            }
        } catch (err) {
            heavyForceBlock();
        }
    }

    heavyForceBlock();
    setInterval(pollStatus, POLL_MS);

})();

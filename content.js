// content.js — Focus Friction AI
// Polls the local FastAPI backend every 2 seconds.
// LOCKED  → heavyForceBlock() keeps the barrier active
// UNLOCKED → barrier is removed so the user can browse
// Fetch error → default to LOCKED (fail-safe, un-bypassable)

(function () {
    'use strict';

    const BARRIER_ID  = 'ff-barrier';
    const STYLE_ID    = 'ff-barrier-style';
    const API_STATUS  = 'http://127.0.0.1:8000/api/status';
    const POLL_MS     = 2000;

    /* ─────────────────────────────────────────────
       heavyForceBlock()
       Injects a solid dark-gray full-screen curtain
       that cannot be scrolled past or clicked through.
    ───────────────────────────────────────────── */
    function heavyForceBlock() {
        injectStyle();

        // Re-attach if removed by the page's own JS
        if (!document.getElementById(BARRIER_ID)) {
            const barrier = document.createElement('div');
            barrier.id = BARRIER_ID;

            const card = document.createElement('div');
            card.className = 'ff-card';

            const icon = document.createElement('div');
            icon.className = 'ff-icon';
            icon.textContent = '🔒';

            const title = document.createElement('div');
            title.className = 'ff-title';
            title.textContent = 'Focus-Friction Active.';

            const sub = document.createElement('div');
            sub.className = 'ff-sub';
            sub.textContent = 'This site is locked. Stay focused.';

            const dot = document.createElement('div');
            dot.className = 'ff-dot-wrap';

            for (let i = 0; i < 3; i++) {
                const d = document.createElement('span');
                d.className = 'ff-dot';
                dot.appendChild(d);
            }

            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(sub);
            card.appendChild(dot);
            barrier.appendChild(card);

            // Use documentElement so it works even before <body> exists
            (document.body || document.documentElement).appendChild(barrier);
        }

        // Lock scrolling
        const root = document.documentElement;
        if (root) root.style.setProperty('overflow', 'hidden', 'important');
        if (document.body) document.body.style.setProperty('overflow', 'hidden', 'important');
    }

    /* ─────────────────────────────────────────────
       removeBarrier()
       Completely removes the overlay and restores scroll.
    ───────────────────────────────────────────── */
    function removeBarrier() {
        const barrier = document.getElementById(BARRIER_ID);
        if (barrier) barrier.remove();

        const style = document.getElementById(STYLE_ID);
        if (style) style.remove();

        // Restore scrolling
        if (document.documentElement) document.documentElement.style.overflow = '';
        if (document.body) document.body.style.overflow = '';
    }

    /* ─────────────────────────────────────────────
       injectStyle()
       Injects CSS once — safe to call repeatedly.
    ───────────────────────────────────────────── */
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
                background: #1a1a1f !important;
                z-index: 2147483647 !important;
                pointer-events: all !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            #${BARRIER_ID} .ff-card {
                background: #25252d !important;
                border: 1px solid rgba(255,255,255,0.08) !important;
                border-radius: 20px !important;
                padding: 3rem 4rem !important;
                text-align: center !important;
                max-width: 480px !important;
                width: 90% !important;
                box-shadow: 0 32px 80px rgba(0,0,0,0.6) !important;
                user-select: none !important;
            }
            #${BARRIER_ID} .ff-icon {
                font-size: 3rem !important;
                margin-bottom: 1rem !important;
                display: block !important;
            }
            #${BARRIER_ID} .ff-title {
                display: block !important;
                font-size: 1.8rem !important;
                font-weight: 700 !important;
                color: #f1f1f1 !important;
                margin: 0 0 0.5rem !important;
                letter-spacing: -0.02em !important;
            }
            #${BARRIER_ID} .ff-sub {
                display: block !important;
                font-size: 0.95rem !important;
                color: #888 !important;
                margin: 0 0 1.6rem !important;
            }
            #${BARRIER_ID} .ff-dot-wrap {
                display: flex !important;
                justify-content: center !important;
                gap: 8px !important;
            }
            #${BARRIER_ID} .ff-dot {
                display: inline-block !important;
                width: 8px !important;
                height: 8px !important;
                border-radius: 50% !important;
                background: #444 !important;
                animation: ff-pulse 1.4s ease-in-out infinite !important;
            }
            #${BARRIER_ID} .ff-dot:nth-child(2) { animation-delay: 0.2s !important; }
            #${BARRIER_ID} .ff-dot:nth-child(3) { animation-delay: 0.4s !important; }
            @keyframes ff-pulse {
                0%, 80%, 100% { background: #444 !important; transform: scale(1) !important; }
                40%            { background: #6366f1 !important; transform: scale(1.4) !important; }
            }
        `;

        (document.head || document.documentElement).appendChild(s);
    }

    /* ─────────────────────────────────────────────
       pollStatus()
       Hits /api/status and applies LOCKED / UNLOCKED logic.
       On any network failure → stays LOCKED (fail-safe).
    ───────────────────────────────────────────── */
    async function pollStatus() {
        try {
            const response = await fetch(API_STATUS, {
                method: 'GET',
                cache: 'no-store',
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                // Non-2xx from our own server → treat as LOCKED
                console.warn(`Focus Friction: /api/status returned ${response.status}. Defaulting to LOCKED.`);
                heavyForceBlock();
                return;
            }

            const data = await response.json();

            if (data.status === 'UNLOCKED') {
                removeBarrier();
            } else {
                // "LOCKED" or any unexpected value → block
                heavyForceBlock();
            }

        } catch (err) {
            // Network error / server down → fail-safe: keep LOCKED
            console.warn('Focus Friction: Could not reach backend. Defaulting to LOCKED.', err.message);
            heavyForceBlock();
        }
    }

    /* ─────────────────────────────────────────────
       Bootstrap
       • Immediately block on first run
       • Then poll every 2 s
    ───────────────────────────────────────────── */
    heavyForceBlock();          // instant block before first poll completes
    pollStatus();               // first async check right away
    setInterval(pollStatus, POLL_MS);   // continuous 2-second loop

})();

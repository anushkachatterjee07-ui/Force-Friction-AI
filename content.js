// content.js — Focus Friction AI (Minimal Bulletproof Version)
// Runs in ISOLATED world after document_end (body is guaranteed to exist)

(function run() {
    const CONTAINER_ID = 'ff-barrier';
    const STYLE_ID     = 'ff-style';
    let isLocked       = true; // Default to locked state for safety

    // ── 1. Inject CSS via <style> tag ─────────────────────────────────────────
    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var s = document.createElement('style');
        s.id = STYLE_ID;
        s.textContent = [
            '#' + CONTAINER_ID + '{',
            '  position:fixed!important;',
            '  top:0!important;left:0!important;',
            '  width:100vw!important;height:100vh!important;',
            '  background:rgba(255,255,255,0.65)!important;',
            '  backdrop-filter:blur(30px)!important;',
            '  -webkit-backdrop-filter:blur(30px)!important;',
            '  z-index:2147483647!important;',
            '  pointer-events:all!important;',
            '  display:flex!important;',
            '  align-items:center!important;',
            '  justify-content:center!important;',
            '}',
            '#' + CONTAINER_ID + ' h1{',
            '  font-family:system-ui,-apple-system,sans-serif!important;',
            '  font-size:2.8rem!important;',
            '  font-weight:800!important;',
            '  color:#111!important;',
            '  background:rgba(255,255,255,0.92)!important;',
            '  padding:2rem 3.5rem!important;',
            '  border-radius:16px!important;',
            '  box-shadow:0 20px 60px rgba(0,0,0,0.25)!important;',
            '  margin:0!important;',
            '  user-select:none!important;',
            '  text-align:center!important;',
            '}'
        ].join('');

        // Append to <head> if available, else <html>
        (document.head || document.documentElement).appendChild(s);
    }

    // ── 2. Inject DIV overlay using pure DOM API (no innerHTML / no raw strings)
    function injectOverlay() {
        if (document.getElementById(CONTAINER_ID)) return;

        var div = document.createElement('div');
        div.id = CONTAINER_ID;

        var h1 = document.createElement('h1');
        h1.textContent = 'Focus-Friction Active.';

        div.appendChild(h1);

        // Append to <body> — guaranteed to exist because run_at: document_end
        document.body.appendChild(div);
    }

    // ── 3. Overlay Toggling Logic ─────────────────────────────────────────────
    function heavyForceBlock() {
        injectStyle();
        injectOverlay();
    }
    
    function removeBlock() {
        const barrier = document.getElementById(CONTAINER_ID);
        if (barrier) {
            barrier.remove();
        }
    }

    // ── 4. Server Polling Logic ───────────────────────────────────────────────
    function checkServerStatus() {
        fetch('http://127.0.0.1:8000/api/status')
            .then(response => response.json())
            .then(data => {
                if (data.status === "UNLOCKED") {
                    isLocked = false;
                    removeBlock();
                } else {
                    // Default to LOCKED
                    isLocked = true;
                    heavyForceBlock();
                }
            })
            .catch(err => {
                // If backend is down or loading, default to keeping page locked
                isLocked = true;
                heavyForceBlock();
            });
    }

    // Poll every 2 seconds
    setInterval(checkServerStatus, 2000);
    // Initial check
    checkServerStatus();

    // ── 5. MutationObserver — reacts instantly if YouTube removes our nodes ──
    var observer = new MutationObserver(() => {
        if (isLocked) heavyForceBlock();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // ── 6. Interval safety net — 300 ms polling keeps it alive across SPA navs
    setInterval(() => {
        if (isLocked) heavyForceBlock();
    }, 300);

}());

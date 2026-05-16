// content.js — Focus Friction AI
// Uses a dark, high-contrast overlay that is impossible to miss.

(function run() {
    var OVERLAY_ID = 'ff-overlay';
    var STYLE_ID   = 'ff-style';

    function injectStyle() {
        if (document.getElementById(STYLE_ID)) return;

        var s = document.createElement('style');
        s.id = STYLE_ID;

        // DARK overlay — impossible to miss visually.
        // backdrop-filter blurs what's behind. We also add background so it
        // renders even when backdrop-filter is unsupported.
        s.textContent =
            '#' + OVERLAY_ID + '{' +
                'position:fixed!important;' +
                'top:0!important;' +
                'left:0!important;' +
                'width:100vw!important;' +
                'height:100vh!important;' +
                'background:rgba(15,15,20,0.82)!important;' +
                'backdrop-filter:blur(18px) saturate(180%)!important;' +
                '-webkit-backdrop-filter:blur(18px) saturate(180%)!important;' +
                'z-index:2147483647!important;' +
                'pointer-events:all!important;' +
                'display:flex!important;' +
                'align-items:center!important;' +
                'justify-content:center!important;' +
                'margin:0!important;' +
                'padding:0!important;' +
                'box-sizing:border-box!important;' +
            '}' +
            '#' + OVERLAY_ID + ' .ff-card{' +
                'background:rgba(255,255,255,0.97)!important;' +
                'border-radius:20px!important;' +
                'padding:3rem 5rem!important;' +
                'box-shadow:0 30px 80px rgba(0,0,0,0.6)!important;' +
                'text-align:center!important;' +
                'max-width:600px!important;' +
            '}' +
            '#' + OVERLAY_ID + ' .ff-title{' +
                'display:block!important;' +
                'font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif!important;' +
                'font-size:2.6rem!important;' +
                'font-weight:800!important;' +
                'color:#0f0f14!important;' +
                'margin:0 0 0.5rem 0!important;' +
                'line-height:1.2!important;' +
                'user-select:none!important;' +
            '}' +
            '#' + OVERLAY_ID + ' .ff-sub{' +
                'display:block!important;' +
                'font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif!important;' +
                'font-size:1rem!important;' +
                'color:#555!important;' +
                'margin:0!important;' +
                'user-select:none!important;' +
            '}';

        (document.head || document.documentElement).appendChild(s);
    }

    function injectOverlay() {
        if (document.getElementById(OVERLAY_ID)) return;
        if (!document.body) return;

        var wrapper = document.createElement('div');
        wrapper.id = OVERLAY_ID;

        var card = document.createElement('div');
        card.className = 'ff-card';

        var title = document.createElement('span');
        title.className = 'ff-title';
        title.textContent = 'Focus-Friction Active.';

        var sub = document.createElement('span');
        sub.className = 'ff-sub';
        sub.textContent = 'This site is blocked to keep you focused.';

        card.appendChild(title);
        card.appendChild(sub);
        wrapper.appendChild(card);

        // Append to BODY as last child — makes it sit on top of everything
        document.body.appendChild(wrapper);
    }

    function enforce() {
        injectStyle();
        injectOverlay();

        // Also lock scrolling so nothing underneath can shift
        if (document.documentElement) {
            document.documentElement.style.setProperty('overflow', 'hidden', 'important');
        }
        if (document.body) {
            document.body.style.setProperty('overflow', 'hidden', 'important');
        }
    }

    // Immediate attempt
    enforce();

    // DOMContentLoaded safety net
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enforce);
    }

    // Rapid-fire interval to win against YouTube's SPA re-renders
    setInterval(enforce, 250);

    // MutationObserver to react the instant our node disappears
    var observer = new MutationObserver(function() {
        if (!document.getElementById(OVERLAY_ID) || !document.getElementById(STYLE_ID)) {
            enforce();
        }
    });

    observer.observe(document.documentElement, { childList: true, subtree: true });

}());

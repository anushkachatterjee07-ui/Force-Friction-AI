// content.js - Intentionality Barrier
(async function run() {
    const TARGET_SITES = ['youtube.com', 'instagram.com', 'tiktok.com'];
    const hostname = window.location.hostname;
    
    // 1. Detect navigation to target sites
    const isTarget = TARGET_SITES.some(site => hostname.includes(site));
    if (!isTarget) return;

    const CONTAINER_ID = 'ff-intentional-barrier';
    const siteName = hostname.replace('www.', '');

    // 2. Inject a full-screen overlay BEFORE page loads 
    // (We use document.documentElement since body might not exist yet if run_at is document_start)
    if (document.getElementById(CONTAINER_ID)) return;

    const overlay = document.createElement('div');
    overlay.id = CONTAINER_ID;
    
    // Reflective, non-shaming tone CSS
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100vw; height: 100vh;
        background: rgba(18, 20, 24, 0.96);
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
        z-index: 2147483647;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #E2E8F0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;

    const card = document.createElement('div');
    card.style.cssText = `
        background: rgba(255, 255, 255, 0.05);
        padding: 40px;
        border-radius: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        text-align: center;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `;

    const title = document.createElement('h1');
    title.textContent = "Take a breath.";
    title.style.cssText = "font-size: 26px; font-weight: 600; margin-bottom: 8px; color: #F8FAFC; margin-top: 0;";

    const subtitle = document.createElement('p');
    subtitle.innerHTML = `You're about to open <strong>${siteName}</strong>.<br>Fetching today's visits...`;
    subtitle.style.cssText = "font-size: 16px; color: #94A3B8; margin-bottom: 24px; line-height: 1.5;";

    const promptText = document.createElement('div');
    promptText.textContent = "Why are you opening this site right now?";
    promptText.style.cssText = "font-size: 15px; font-weight: 500; color: #CBD5E1; margin-bottom: 12px; text-align: left;";

    const textarea = document.createElement('textarea');
    textarea.placeholder = "e.g., I need to watch a tutorial on...";
    textarea.style.cssText = `
        width: 100%;
        height: 100px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 14px;
        color: #F8FAFC;
        font-family: inherit;
        font-size: 15px;
        resize: none;
        outline: none;
        box-sizing: border-box;
        margin-bottom: 24px;
        transition: border-color 0.2s;
    `;

    const button = document.createElement('button');
    button.textContent = "Continue";
    button.disabled = true;
    button.style.cssText = `
        width: 100%;
        padding: 14px;
        background: #3B82F6;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: not-allowed;
        opacity: 0.5;
        transition: all 0.2s;
    `;

    // 4. User must type 10+ characters to enable "Continue" button
    textarea.addEventListener('input', () => {
        if (textarea.value.trim().length >= 10) {
            button.disabled = false;
            button.style.cursor = 'pointer';
            button.style.opacity = '1';
            textarea.style.borderColor = '#3B82F6';
        } else {
            button.disabled = true;
            button.style.cursor = 'not-allowed';
            button.style.opacity = '0.5';
            textarea.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }
    });

    // 5. On click, POST {site, reason, timestamp} to http://127.0.0.1:8000/log-intent
    button.addEventListener('click', async () => {
        const reason = textarea.value.trim();
        const payload = {
            site: siteName,
            reason: reason,
            timestamp: new Date().toISOString()
        };

        button.textContent = "Logging...";
        button.style.opacity = '0.7';

        try {
            await fetch('http://127.0.0.1:8000/log-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        } catch (e) {
            // 7. If API fails, still allow access but log error to console - no punitive blocking
            console.error("Focus Friction: Failed to log intent to backend. Allowing access.", e);
        }

        // 6. After successful API call (or fail), remove overlay and allow normal browsing
        overlay.remove();
        
        // Restore scrolling if it was disabled
        document.body.style.overflow = '';
    });

    card.appendChild(title);
    card.appendChild(subtitle);
    card.appendChild(promptText);
    card.appendChild(textarea);
    card.appendChild(button);
    overlay.appendChild(card);

    // Append immediately
    document.documentElement.appendChild(overlay);

    // Disable scrolling while overlay is active
    if (document.body) document.body.style.overflow = 'hidden';

    // Focus the textarea
    setTimeout(() => textarea.focus(), 100);

    // Fetch stats in the background to update the subtitle
    try {
        const statsRes = await fetch(`http://127.0.0.1:8000/stats?site=${siteName}`);
        if (statsRes.ok) {
            const stats = await statsRes.json();
            const visitCount = stats.visits_today || 0;
            subtitle.innerHTML = `You're about to open <strong>${siteName}</strong>.<br>You've visited ${visitCount} time${visitCount === 1 ? '' : 's'} today.`;
        }
    } catch (e) {
        console.warn("Focus Friction: Could not fetch stats.", e);
        subtitle.innerHTML = `You're about to open <strong>${siteName}</strong>.<br>Be mindful of your time.`;
    }

})();

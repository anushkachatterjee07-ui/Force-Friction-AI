// background.js — Focus Friction AI
// Service Worker: re-injects content.js on SPA navigations (URL changes
// that don't trigger a full page reload, e.g. YouTube's router).

const TARGET_SITES = ['youtube.com', 'instagram.com', 'tiktok.com'];
const FOCUS_STATE_API = 'http://127.0.0.1:8000/api/focus-state';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message?.type === 'request-focus-state') {
        fetch(FOCUS_STATE_API)
            .then(response => response.json())
            .then(data => sendResponse({ 
                success: true, 
                focus_state: data.focus_state,
                engine_alive: data.engine_alive 
            }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Fire on URL change (SPA soft-nav) OR when tab finishes loading
    if (changeInfo.url || changeInfo.status === 'complete') {

        const url = tab.url || changeInfo.url || '';
        const isTarget = TARGET_SITES.some(site => url.includes(site));

        if (isTarget) {
            chrome.scripting.executeScript({
                target: { tabId },
                files: ['content.js']
            }).catch(err => {
                // Silently ignore injections into chrome:// or protected pages
                console.debug('Focus Friction: injection skipped.', err.message);
            });
        }
    }
});

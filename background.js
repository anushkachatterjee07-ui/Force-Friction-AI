// background.js — Focus Friction AI
// Service Worker: re-injects content.js on SPA navigations (URL changes
// that don't trigger a full page reload, e.g. YouTube's router).

const TARGET_SITES = ['youtube.com', 'instagram.com', 'tiktok.com'];

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

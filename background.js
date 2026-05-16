// background.js

/**
 * Service Worker to listen for tab updates.
 * This is crucial for Single Page Applications (SPAs) like YouTube and Instagram.
 * When a user clicks a video on YouTube, the page doesn't fully reload; it just pushes a new URL state.
 * By listening to `chrome.tabs.onUpdated`, we can catch these soft navigations and re-trigger our overlay.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // Trigger if the URL was updated (SPA navigation) OR if the tab status fully completed loading
    if (changeInfo.url || changeInfo.status === 'complete') {
        
        // Check if the current URL belongs to our targeted distracting sites
        if (tab.url && (tab.url.includes("youtube.com") || tab.url.includes("instagram.com"))) {
            
            // Dynamically inject the content script to ensure the overlay applies
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ["content.js"]
            }).catch(err => {
                // Silently drop errors if we try to inject into protected pages (like chrome:// URLs)
                console.debug("Focus Friction: Injection skipped/failed for this tab.", err);
            });
        }
    }
});

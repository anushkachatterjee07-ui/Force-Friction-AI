// Show immediately on page load, don't wait for backend
function showIntentPrompt() {
    if (document.getElementById("binary-souls-barrier")) return;

    // Inject premium styles if they don't already exist
    if (!document.getElementById("ff-styles")) {
        const style = document.createElement("style");
        style.id = "ff-styles";
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
            
            #binary-souls-barrier * {
                box-sizing: border-box;
                font-family: 'Outfit', 'Segoe UI', system-ui, sans-serif;
            }
            
            .ff-overlay-card {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto auto auto;
                gap: 18px;
                color: white;
                padding: 36px 32px;
                background: rgba(23, 25, 35, 0.65) !important;
                backdrop-filter: blur(14px) !important;
                -webkit-backdrop-filter: blur(14px) !important;
                border: 1px solid rgba(255, 255, 255, 0.08) !important;
                border-radius: 28px;
                box-shadow: 
                    0 30px 60px rgba(0, 0, 0, 0.6), 
                    inset 0 1px 0 rgba(255, 255, 255, 0.15),
                    0 0 120px rgba(0, 0, 0, 0.3);
                max-width: 490px;
                width: 90%;
                animation: ff-fade-scale-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                position: relative;
                overflow: hidden;
            }

            .ff-overlay-card::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%);
                pointer-events: none;
            }
            
            .ff-header-bento {
                grid-column: span 2;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                padding: 26px 20px;
                text-align: center;
                backdrop-filter: blur(5px);
            }
            
            .ff-header-bento h1 {
                font-size: 32px;
                margin: 0 0 6px 0;
                color: #fff;
                font-weight: 700;
                letter-spacing: -0.5px;
                background: linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .ff-header-bento p {
                font-size: 15px;
                color: #94A3BB;
                margin: 0;
                font-weight: 400;
            }
            
            .ff-btn {
                border: 1px solid transparent;
                padding: 24px 20px;
                border-radius: 20px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                position: relative;
                overflow: hidden;
                outline: none;
            }
            
            .ff-btn::after {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 100%);
                opacity: 0;
                transition: opacity 0.3s ease;
                pointer-events: none;
            }

            .ff-btn:hover::after {
                opacity: 1;
            }
            
            /* Study: Emerald Neon Glow */
            .ff-btn-study {
                background: rgba(16, 185, 129, 0.04);
                border-color: rgba(16, 185, 129, 0.25);
                color: #10B981;
                box-shadow: 
                    0 4px 12px rgba(16, 185, 129, 0.03),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
            }
            
            .ff-btn-study:hover {
                background: rgba(16, 185, 129, 0.12);
                border-color: rgba(16, 185, 129, 0.6);
                transform: translateY(-5px) scale(1.03);
                box-shadow: 
                    0 0 24px rgba(16, 185, 129, 0.35),
                    0 8px 24px rgba(16, 185, 129, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                text-shadow: 0 0 8px rgba(16, 185, 129, 0.3);
            }

            .ff-btn-study:active {
                transform: translateY(-2px) scale(1.01);
            }
            
            /* Break: Indigo/Purple Neon Glow */
            .ff-btn-break {
                background: rgba(129, 140, 248, 0.04);
                border-color: rgba(129, 140, 248, 0.25);
                color: #a5b4fc;
                box-shadow: 
                    0 4px 12px rgba(129, 140, 248, 0.03),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
            }
            
            .ff-btn-break:hover {
                background: rgba(129, 140, 248, 0.12);
                border-color: rgba(129, 140, 248, 0.6);
                transform: translateY(-5px) scale(1.03);
                box-shadow: 
                    0 0 24px rgba(129, 140, 248, 0.35),
                    0 8px 24px rgba(129, 140, 248, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.1);
                text-shadow: 0 0 8px rgba(129, 140, 248, 0.3);
            }

            .ff-btn-break:active {
                transform: translateY(-2px) scale(1.01);
            }
            
            /* Habit/Boredom: Crimson Glow (Grid Span 2) */
            .ff-btn-habit {
                grid-column: span 2;
                padding: 20px;
                background: rgba(239, 68, 68, 0.03);
                border-color: rgba(239, 68, 68, 0.25);
                color: #f87171;
                display: flex;
                flex-direction: row;
                justify-content: center;
                align-items: center;
                gap: 12px;
                box-shadow: 
                    0 4px 12px rgba(239, 68, 68, 0.02),
                    inset 0 1px 0 rgba(255, 255, 255, 0.05);
            }
            
            .ff-btn-habit:hover {
                background: rgba(239, 68, 68, 0.09);
                border-color: rgba(239, 68, 68, 0.5);
                transform: translateY(-3px) scale(1.01);
                box-shadow: 
                    0 0 24px rgba(239, 68, 68, 0.25),
                    0 6px 20px rgba(239, 68, 68, 0.1),
                    inset 0 1px 0 rgba(255, 255, 255, 0.15);
                text-shadow: 0 0 6px rgba(239, 68, 68, 0.2);
            }

            .ff-btn-habit:active {
                transform: translateY(-1px) scale(1.0);
            }

            .ff-emoji {
                font-size: 28px;
                pointer-events: none;
                transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }

            .ff-btn:hover .ff-emoji {
                transform: scale(1.22) rotate(8deg);
            }
            
            .ff-footer {
                grid-column: span 2;
                display: flex;
                justify-content: center;
                margin-top: 4px;
            }
            
            .ff-badge {
                padding: 8px 16px;
                background: rgba(0, 0, 0, 0.25);
                border: 1px solid rgba(255, 255, 255, 0.06);
                border-radius: 20px;
                font-size: 13px;
                color: #94A3BB;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
            }
            
            .ff-dot {
                display: inline-block;
                width: 8px;
                height: 8px;
                background: #10B981;
                border-radius: 50%;
                box-shadow: 0 0 10px #10B981;
                animation: ff-pulse-green 2s infinite;
            }
            
            /* Friction Countdown Styles */
            .ff-friction-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
                padding: 10px;
                animation: ff-fade-scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            
            .ff-stop-icon-wrapper {
                width: 72px;
                height: 72px;
                background: rgba(239, 68, 68, 0.08);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 24px;
                box-shadow: 0 0 24px rgba(239, 68, 68, 0.15);
                animation: ff-pulse-red-glow 2s infinite;
            }
            
            .ff-stop-emoji {
                font-size: 34px;
            }
            
            .ff-friction-title {
                font-size: 30px;
                margin: 0 0 12px 0;
                color: #ef4444;
                font-weight: 700;
                letter-spacing: -0.5px;
                text-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
            }
            
            .ff-friction-desc {
                font-size: 16px;
                color: #94A3BB;
                margin: 0 0 26px 0;
                line-height: 1.6;
            }
            
            .ff-timer-card {
                background: rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.05);
                padding: 24px;
                border-radius: 20px;
                width: 100%;
                box-sizing: border-box;
                backdrop-filter: blur(5px);
                box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
            }
            
            #friction-timer {
                font-size: 21px;
                color: #10B981;
                font-weight: 700;
                font-variant-numeric: tabular-nums;
                margin-bottom: 14px;
                text-shadow: 0 0 8px rgba(16, 185, 129, 0.2);
            }
            
            .ff-progress-bg {
                width: 100%;
                height: 10px;
                background: rgba(255, 255, 255, 0.08);
                border-radius: 6px;
                overflow: hidden;
                box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
            }
            
            #friction-progress {
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, #10B981, #34d399);
                border-radius: 6px;
                transition: width 5s linear;
                box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
            }
            
            /* Keyframe Animations */
            @keyframes ff-fade-scale-in {
                0% {
                    opacity: 0;
                    transform: scale(0.94);
                }
                100% {
                    opacity: 1;
                    transform: scale(1.0);
                }
            }
            
            @keyframes ff-pulse-green {
                0% {
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
                }
                70% {
                    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
                }
                100% {
                    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
                }
            }
            
            @keyframes ff-pulse-red-glow {
                0% {
                    box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.3);
                }
                50% {
                    box-shadow: 0 0 24px rgba(239, 68, 68, 0.4);
                    border-color: rgba(239, 68, 68, 0.6);
                }
                100% {
                    box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.3);
                }
            }
        `;
        document.head.appendChild(style);
    }

    const barrier = document.createElement("div");
    barrier.id = "binary-souls-barrier";
    barrier.innerHTML = `
        <div class="ff-overlay-card">
            <!-- Header Bento (spans 2 columns) -->
            <div class="ff-header-bento">
                <h1>Focus Check</h1>
                <p>What brings you here? Be honest.</p>
            </div>

            <!-- Option 1: Study -->
            <button class="ff-btn ff-btn-study" data-reason="Study">
                <span class="ff-emoji">📚</span>
                <span>Study / Work</span>
            </button>

            <!-- Option 2: Break -->
            <button class="ff-btn ff-btn-break" data-reason="Break">
                <span class="ff-emoji">☕</span>
                <span>Intentional Break</span>
            </button>

            <!-- Option 3: Boredom (Spans 2 columns but shorter) -->
            <button class="ff-btn ff-btn-habit" data-reason="Boredom">
                <span class="ff-emoji">🌀</span>
                <span>Boredom / Habit</span>
            </button>

            <!-- Footer -->
            <div class="ff-footer">
                <div class="ff-badge">
                    <span class="ff-dot"></span>
                    Focus Friction AI Active
                </div>
            </div>
        </div>
    `;

    Object.assign(barrier.style, {
        position:"fixed", top:"0", left:"0", width:"100vw", height:"100vh",
        backgroundColor:"rgba(8, 10, 16, 0.78)", zIndex:"2147483647", display:"flex",
        justifyContent:"center", alignItems:"center",
        backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
        transition:"opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity:"1"
    });

    document.body.appendChild(barrier);

    barrier.onclick = async (e) => {
        // Support clicks on standard button elements or items inside them
        const btn = e.target.closest("button");
        if (!btn || !btn.dataset.reason) return;
        const reason = btn.dataset.reason;

        if (reason === "Study") {
            // Capture the current video ID as the allowed whitelist
            captureAllowedVideoId();
            
            setStudyVerificationLoading();
            startVerifyFocusPolling();
            
            // Start monitoring for whitelist breaches during active study session
            startStudyModeUrlMonitoring();
            
            try {
                await fetch("http://127.0.0.1:8000/log-intent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        site: location.hostname,
                        reason: reason,
                        timestamp: new Date().toISOString()
                    })
                });
            } catch (err) {
                console.log("Study verification request failed", err);
            }
            return;
        }

        try {
            const res = await fetch("http://127.0.0.1:8000/log-intent", {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify({
                    site: location.hostname,
                    reason: reason,
                    timestamp: new Date().toISOString()
                })
            });
            const data = await res.json();
            
            if (data.action === "friction") {
                startFrictionTimer(); // Show 5sec countdown
            } else if (data.action === "allow") {
                removeBarrier();
            } else if (data.action === "nudge") {
                removeBarrier();
                showToast(data.message);
            }
        } catch (err) {
            console.log("Backend down, allowing through", err);
            removeBarrier(); // Fail open for demo
        }
    };
}

function startFrictionTimer() {
    const content = document.querySelector("#binary-souls-barrier > div");
    if (!content) return;
    
    content.innerHTML = `
        <div class="ff-friction-container">
            <div class="ff-stop-icon-wrapper">
                <span class="ff-stop-emoji">🛑</span>
            </div>
            <h1 class="ff-friction-title">Loop Detected</h1>
            <p class="ff-friction-desc">You've been here often recently.<br>Take a mindful pause.</p>
            <div class="ff-timer-card">
                <div id="friction-timer">Unlocking in 5s...</div>
                <div class="ff-progress-bg">
                    <div id="friction-progress"></div>
                </div>
            </div>
        </div>
    `;
    
    // Clear any existing friction timer
    if (window.focusFrictionCleanupHandles.frictionTimer) {
        clearInterval(window.focusFrictionCleanupHandles.frictionTimer);
    }
    
    setTimeout(() => {
        const prog = document.getElementById("friction-progress");
        if(prog) prog.style.width = "0%";
    }, 50);

    let seconds = 5;
    const timer = setInterval(() => {
        seconds--;
        const timerEl = document.getElementById("friction-timer");
        if(timerEl) timerEl.innerText = `Unlocking in ${seconds}s...`;
        if (seconds <= 0) {
            clearInterval(timer);
            window.focusFrictionCleanupHandles.frictionTimer = null;
            fetch("http://127.0.0.1:8000/api/unlock", {method:"POST"})
                .finally(() => removeBarrier());
        }
    }, 1000);
    
    window.focusFrictionCleanupHandles.frictionTimer = timer;
}

function ensureFocusWarningStyles() {
    if (document.getElementById('ff-focus-warning-styles')) return;

    const style = document.createElement('style');
    style.id = 'ff-focus-warning-styles';
    style.textContent = `
        #ff-focus-warning-overlay {
            position: fixed;
            inset: 0;
            pointer-events: none;
            z-index: 2147483646;
            opacity: 0;
            transition: opacity 0.35s ease, box-shadow 0.35s ease;
            box-shadow: inset 0 0 0 0 rgba(239, 68, 68, 0);
        }

        #ff-focus-warning-overlay.active {
            opacity: 1;
            box-shadow: inset 0 0 0 24px rgba(239, 68, 68, 0.28);
            animation: ff-focus-warning-pulse 1.8s ease-in-out infinite;
        }

        @keyframes ff-focus-warning-pulse {
            0%, 100% {
                box-shadow: inset 0 0 0 18px rgba(239, 68, 68, 0.22);
            }
            50% {
                box-shadow: inset 0 0 0 24px rgba(239, 68, 68, 0.35);
            }
        }
    `;

    document.head.appendChild(style);
}

function showFocusWarningUI() {
    ensureFocusWarningStyles();
    let overlay = document.getElementById('ff-focus-warning-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'ff-focus-warning-overlay';
        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('active'));
    } else {
        overlay.classList.add('active');
    }
}

function clearFocusWarningUI() {
    const overlay = document.getElementById('ff-focus-warning-overlay');
    if (!overlay) return;
    overlay.classList.remove('active');
    setTimeout(() => {
        const existing = document.getElementById('ff-focus-warning-overlay');
        if (existing && !existing.classList.contains('active')) existing.remove();
    }, 400);
}

function showEngineOfflineWarning() {
    const overlay = document.getElementById('ff-engine-offline-overlay');
    if (overlay) return; // Already showing
    
    const div = document.createElement('div');
    div.id = 'ff-engine-offline-overlay';
    Object.assign(div.style, {
        position: 'fixed',
        top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(23, 25, 35, 0.88)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: '2147483645',
        fontFamily: "'Outfit', sans-serif",
    });
    
    div.innerHTML = `
        <div style="
            text-align: center;
            color: #fff;
            padding: 40px;
            max-width: 400px;
            border: 2px solid rgba(239, 68, 68, 0.5);
            border-radius: 24px;
            background: rgba(239, 68, 68, 0.05);
        ">
            <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
            <h2 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700;">Vision Engine Offline</h2>
            <p style="margin: 0; color: #cbd5e1; font-size: 15px;">
                Your attention engine has disconnected. System locked for safety. Please restart the vision engine.
            </p>
        </div>
    `;
    
    document.body.appendChild(div);
}

function requestFocusState() {
    chrome.runtime.sendMessage({ type: 'request-focus-state' }, (response) => {
        if (!response || !response.success) return;
        
        // If engine is offline, show critical warning and maintain lock
        if (!response.engine_alive) {
            showEngineOfflineWarning();
            return;
        }
        
        if (response.focus_state === 'warning') {
            showFocusWarningUI();
        } else {
            clearFocusWarningUI();
        }
    });
}

// Global tracking for all polling intervals and timers
window.focusFrictionCleanupHandles = {
    focusStateInterval: null,
    verifyFocusInterval: null,
    frictionTimer: null,
    barrierCleanupTimer: null,
    urlMonitorInterval: null,
    lastCheckedUrl: null
};

// Single-Video Whitelist Lock Functions
function extractVideoId(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v') || null;
    } catch (e) {
        return null;
    }
}

function captureAllowedVideoId() {
    const videoId = extractVideoId(window.location.href);
    if (videoId) {
        chrome.storage.local.set({ allowedVideoId: videoId }, () => {
            console.log('[Focus Friction] Captured allowed video ID for Study mode:', videoId);
        });
    }
}

function getAllowedVideoId(callback) {
    chrome.storage.local.get(['allowedVideoId'], (result) => {
        callback(result.allowedVideoId || null);
    });
}

function clearAllowedVideoId(callback) {
    chrome.storage.local.remove(['allowedVideoId'], () => {
        console.log('[Focus Friction] Cleared allowed video ID');
        if (callback) callback();
    });
}

function isVideoWhitelistBreach(callback) {
    // Check 1: Are we on /shorts/?
    if (window.location.pathname.includes('/shorts/')) {
        callback({ breach: true, reason: 'shorts', detail: 'YouTube Shorts detected' });
        return;
    }
    
    // Check 2: Has the video ID changed?
    getAllowedVideoId((allowedId) => {
        if (!allowedId) {
            callback({ breach: false });
            return;
        }
        
        const currentId = extractVideoId(window.location.href);
        if (currentId && currentId !== allowedId) {
            callback({ breach: true, reason: 'video_change', detail: `Switched from ${allowedId} to ${currentId}` });
        } else if (!currentId && !window.location.pathname.includes('/watch')) {
            callback({ breach: true, reason: 'navigation', detail: 'Left study video page' });
        } else {
            callback({ breach: false });
        }
    });
}

function showStudyModeLockedWarning(breachReason) {
    if (document.getElementById("binary-souls-barrier")) return;

    const barrier = document.createElement("div");
    barrier.id = "binary-souls-barrier";
    
    let warningTitle = "Study Mode Lock Active";
    let warningMessage = "Focus Friction Alert: You are in active Study Mode. Please stick to your declared learning resource. Other videos and Shorts are locked to prevent doomscrolling.";
    let warningEmoji = "🔐";
    
    if (breachReason === 'shorts') {
        warningTitle = "Shorts Not Allowed";
        warningMessage = "Focus Friction Alert: You are in active Study Mode. YouTube Shorts are blocked to prevent doomscrolling. Please return to your study video.";
        warningEmoji = "🚫";
    } else if (breachReason === 'video_change') {
        warningTitle = "Video Switch Blocked";
        warningMessage = "Focus Friction Alert: You are in active Study Mode. Please stick to your declared learning resource. Switching to different videos is locked to prevent doomscrolling.";
        warningEmoji = "⚠️";
    } else if (breachReason === 'navigation') {
        warningTitle = "Navigation Blocked";
        warningMessage = "Focus Friction Alert: You are in active Study Mode. Navigating away from your study video is blocked. Return to your learning resource.";
        warningEmoji = "🔒";
    }
    
    barrier.innerHTML = `
        <div class="ff-overlay-card">
            <div class="ff-header-bento" style="text-align: center;">
                <div style="font-size: 48px; margin-bottom: 16px;">${warningEmoji}</div>
                <h1 style="color: #ef4444; margin: 0;">${warningTitle}</h1>
            </div>
            <div style="grid-column: span 2; padding: 24px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 16px; text-align: center;">
                <p style="margin: 0; color: #94A3BB; font-size: 15px; line-height: 1.6;">
                    ${warningMessage}
                </p>
            </div>
            <button id="study-mode-return-btn" class="ff-btn" style="grid-column: span 2; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); cursor: pointer;">
                <span style="font-size: 24px;">← Return to Study</span>
            </button>
            <div class="ff-footer">
                <div class="ff-badge">
                    <span class="ff-dot"></span>
                    Study Mode Active
                </div>
            </div>
        </div>
    `;
    
    Object.assign(barrier.style, {
        position:"fixed", top:"0", left:"0", width:"100vw", height:"100vh",
        backgroundColor:"rgba(8, 10, 16, 0.88)", zIndex:"2147483647", display:"flex",
        justifyContent:"center", alignItems:"center",
        backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
        transition:"opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        opacity:"1"
    });
    
    document.body.appendChild(barrier);
    
    // Add return button handler
    const returnBtn = document.getElementById('study-mode-return-btn');
    if (returnBtn) {
        returnBtn.onclick = () => {
            barrier.style.opacity = "0";
            setTimeout(() => {
                const b = document.getElementById("binary-souls-barrier");
                if (b) b.remove();
                window.history.back();
            }, 400);
        };
    }
}

function startFocusStatePolling() {
    requestFocusState();
    // Clear any existing interval before creating a new one
    if (window.focusFrictionCleanupHandles.focusStateInterval) {
        clearInterval(window.focusFrictionCleanupHandles.focusStateInterval);
    }
    window.focusFrictionCleanupHandles.focusStateInterval = setInterval(requestFocusState, 2000);
}

function stopFocusStatePolling() {
    if (window.focusFrictionCleanupHandles.focusStateInterval) {
        clearInterval(window.focusFrictionCleanupHandles.focusStateInterval);
        window.focusFrictionCleanupHandles.focusStateInterval = null;
    }
}

function showToast(msg) {
    const toast = document.createElement("div");
    toast.innerText = msg;
    Object.assign(toast.style, {
        position:"fixed", bottom:"30px", right:"30px", 
        background:"rgba(16, 185, 129, 0.9)", backdropFilter:"blur(8px)",
        color:"white", padding:"16px 24px", borderRadius:"16px", zIndex:"2147483647",
        fontFamily:"'Outfit', sans-serif", fontWeight:"600",
        border:"1px solid rgba(16, 185, 129, 0.4)",
        boxShadow:"0 10px 30px rgba(16, 185, 129, 0.2)",
        animation:"ff-fade-scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function setStudyVerificationLoading() {
    const content = document.querySelector("#binary-souls-barrier > div");
    if (!content) return;
    content.innerHTML = `
        <div class="ff-friction-container">
            <div class="ff-stop-icon-wrapper">
                <span class="ff-stop-emoji">🔎</span>
            </div>
            <h1 class="ff-friction-title">Verifying focus via attention engine...</h1>
            <p class="ff-friction-desc">Please keep your eyes on the screen while we confirm attention.</p>
        </div>
    `;
}

function clearYouTubeBlurStyles() {
    document.querySelectorAll('[style*="blur("], [style*="backdrop-filter"]')?.forEach(el => {
        if (el.style) {
            el.style.filter = el.style.filter.replace(/blur\([^)]*\)/g, '').trim();
            el.style.backdropFilter = '';
            el.style.WebkitBackdropFilter = '';
            if (!el.style.cssText.trim()) el.removeAttribute('style');
        }
    });
}

function startVerifyFocusPolling() {
    const barrier = document.getElementById("binary-souls-barrier");
    if (!barrier) return;

    // Clean up any previous verify-focus interval
    if (window.focusFrictionCleanupHandles.verifyFocusInterval) {
        clearInterval(window.focusFrictionCleanupHandles.verifyFocusInterval);
        window.focusFrictionCleanupHandles.verifyFocusInterval = null;
    }

    const intervalId = window.setInterval(async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/api/verify-focus", { cache: 'no-store' });
            const data = await res.json();
            
            // Check if vision engine is alive before allowing unlock
            if (!data.engine_alive) {
                console.warn("Vision engine offline - blocking unlock");
                // Keep barrier and show offline warning
                const content = document.querySelector("#binary-souls-barrier > div");
                if (content) {
                    content.innerHTML = `
                        <div class="ff-friction-container">
                            <div class="ff-stop-icon-wrapper">
                                <span class="ff-stop-emoji">⚠️</span>
                            </div>
                            <h1 class="ff-friction-title">Attention Engine Offline</h1>
                            <p class="ff-friction-desc">Vision engine lost connection. System remains locked for safety.</p>
                        </div>
                    `;
                }
                return;
            }
            
            if (data.verified) {
                window.clearInterval(intervalId);
                window.focusFrictionCleanupHandles.verifyFocusInterval = null;
                clearYouTubeBlurStyles();
                barrier.style.transition = "opacity 0.35s ease";
                barrier.style.opacity = "0";
                
                // Clear any pending timers
                if (window.focusFrictionCleanupHandles.barrierCleanupTimer) {
                    clearTimeout(window.focusFrictionCleanupHandles.barrierCleanupTimer);
                }
                window.focusFrictionCleanupHandles.barrierCleanupTimer = setTimeout(() => {
                    const b = document.getElementById("binary-souls-barrier");
                    if (b) b.remove();
                }, 420);
            }
        } catch (err) {
            console.debug("Verify-focus polling failed:", err);
        }
    }, 1000);

    window.focusFrictionCleanupHandles.verifyFocusInterval = intervalId;
}

function stopVerifyFocusPolling() {
    if (window.focusFrictionCleanupHandles.verifyFocusInterval) {
        clearInterval(window.focusFrictionCleanupHandles.verifyFocusInterval);
        window.focusFrictionCleanupHandles.verifyFocusInterval = null;
    }
}

function startStudyModeUrlMonitoring() {
    // Clear any existing monitoring interval
    if (window.focusFrictionCleanupHandles.urlMonitorInterval) {
        clearInterval(window.focusFrictionCleanupHandles.urlMonitorInterval);
    }
    
    window.focusFrictionCleanupHandles.lastCheckedUrl = window.location.href;
    
    window.focusFrictionCleanupHandles.urlMonitorInterval = setInterval(() => {
        // Check if URL has changed
        if (window.location.href !== window.focusFrictionCleanupHandles.lastCheckedUrl) {
            window.focusFrictionCleanupHandles.lastCheckedUrl = window.location.href;
            
            // Check for whitelist breach
            isVideoWhitelistBreach((result) => {
                if (result.breach) {
                    console.log('[Focus Friction] Whitelist breach detected:', result.detail);
                    showStudyModeLockedWarning(result.reason);
                }
            });
        }
    }, 1000);
    
    console.log('[Focus Friction] Study mode URL monitoring started');
}

function stopStudyModeUrlMonitoring() {
    if (window.focusFrictionCleanupHandles.urlMonitorInterval) {
        clearInterval(window.focusFrictionCleanupHandles.urlMonitorInterval);
        window.focusFrictionCleanupHandles.urlMonitorInterval = null;
    }
    clearAllowedVideoId();
    console.log('[Focus Friction] Study mode URL monitoring stopped');
}

function removeBarrier() {
    const barrier = document.getElementById("binary-souls-barrier");
    if (barrier) { 
        // Stop verify-focus polling before removing barrier
        stopVerifyFocusPolling();
        
        // Stop study mode URL monitoring
        stopStudyModeUrlMonitoring();
        
        barrier.style.opacity = "0";
        
        // Clear any pending timers
        if (window.focusFrictionCleanupHandles.barrierCleanupTimer) {
            clearTimeout(window.focusFrictionCleanupHandles.barrierCleanupTimer);
        }
        window.focusFrictionCleanupHandles.barrierCleanupTimer = setTimeout(() => {
            const b = document.getElementById("binary-souls-barrier");
            if (b) b.remove();
        }, 500); 
    }
}

// KEY CHANGE: Show immediately. Don't poll first.
showIntentPrompt();
startFocusStatePolling();

// Also handle YouTube SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        
        // Clean up all timers before re-injecting barrier on SPA navigation
        if (window.focusFrictionCleanupHandles.verifyFocusInterval) {
            clearInterval(window.focusFrictionCleanupHandles.verifyFocusInterval);
            window.focusFrictionCleanupHandles.verifyFocusInterval = null;
        }
        if (window.focusFrictionCleanupHandles.frictionTimer) {
            clearInterval(window.focusFrictionCleanupHandles.frictionTimer);
            window.focusFrictionCleanupHandles.frictionTimer = null;
        }
        if (window.focusFrictionCleanupHandles.barrierCleanupTimer) {
            clearTimeout(window.focusFrictionCleanupHandles.barrierCleanupTimer);
            window.focusFrictionCleanupHandles.barrierCleanupTimer = null;
        }
        
        // Check for whitelist breach if study mode is active
        getAllowedVideoId((allowedId) => {
            if (allowedId) {
                // Study mode is active, check for breaches
                isVideoWhitelistBreach((result) => {
                    if (result.breach) {
                        console.log('[Focus Friction] Study mode whitelist breach on SPA nav:', result.detail);
                        const oldBarrier = document.getElementById("binary-souls-barrier");
                        if (oldBarrier) oldBarrier.remove();
                        showStudyModeLockedWarning(result.reason);
                        return;
                    }
                    
                    // No breach, proceed with normal re-injection
                    const oldBarrier = document.getElementById("binary-souls-barrier");
                    if (oldBarrier) oldBarrier.remove();
                    setTimeout(() => showIntentPrompt(), 1000);
                });
            } else {
                // No study mode, proceed normally
                const oldBarrier = document.getElementById("binary-souls-barrier");
                if (oldBarrier) oldBarrier.remove();
                setTimeout(() => showIntentPrompt(), 1000);
            }
        });
    }
}).observe(document, {subtree: true, childList: true});
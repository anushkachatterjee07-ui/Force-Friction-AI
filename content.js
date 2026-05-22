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
            fetch("http://127.0.0.1:8000/api/unlock", {method:"POST"})
                .finally(() => removeBarrier());
        }
    }, 1000);
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

function removeBarrier() {
    const barrier = document.getElementById("binary-souls-barrier");
    if (barrier) { 
        barrier.style.opacity = "0"; 
        setTimeout(() => barrier.remove(), 500); 
    }
}

// KEY CHANGE: Show immediately. Don't poll first.
showIntentPrompt();

// Also handle YouTube SPA navigation
let lastUrl = location.href;
new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => showIntentPrompt(), 1000);
    }
}).observe(document, {subtree: true, childList: true});
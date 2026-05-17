// Show immediately on page load, don't wait for backend
function showIntentPrompt() {
    if (document.getElementById("binary-souls-barrier")) return;

    const barrier = document.createElement("div");
    barrier.id = "binary-souls-barrier";
    barrier.innerHTML = `
        <div style="
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: auto auto auto;
            gap: 16px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            color: white;
            padding: 32px;
            background: rgba(18, 23, 35, 0.7);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 28px;
            box-shadow: 0 24px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
            max-width: 480px;
            width: 90%;
            box-sizing: border-box;
        ">
            <!-- Header Bento (spans 2 columns) -->
            <div style="grid-column: span 2; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 24px; text-align: center;">
                <h1 style="font-size:30px; margin:0 0 8px 0; color:#fff; font-weight:700; letter-spacing: -0.5px;">Focus Check</h1>
                <p style="font-size:15px; color:#94A3BB; margin:0;">What brings you here? Be honest.</p>
            </div>

            <!-- Option 1: Study -->
            <button data-reason="Study" style="
                background: linear-gradient(145deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05));
                border: 1px solid rgba(16, 185, 129, 0.2);
                color: #10B981;
                padding: 24px 20px;
                border-radius: 20px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(16, 185, 129, 0.25)'" onmouseout="this.style.background='linear-gradient(145deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05))'">
                <span style="font-size: 28px; pointer-events:none;">📚</span>
                <span style="pointer-events:none;">Study / Work</span>
            </button>

            <!-- Option 2: Break -->
            <button data-reason="Break" style="
                background: linear-gradient(145deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05));
                border: 1px solid rgba(99, 102, 241, 0.2);
                color: #818cf8;
                padding: 24px 20px;
                border-radius: 20px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(99, 102, 241, 0.25)'" onmouseout="this.style.background='linear-gradient(145deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))'">
                <span style="font-size: 28px; pointer-events:none;">☕</span>
                <span style="pointer-events:none;">Intentional Break</span>
            </button>

            <!-- Option 3: Boredom (Spans 2 columns but shorter) -->
            <button data-reason="Boredom" style="
                grid-column: span 2;
                background: linear-gradient(145deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
                border: 1px solid rgba(239, 68, 68, 0.2);
                color: #EF4444;
                padding: 20px;
                border-radius: 20px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 12px;
                transition: all 0.2s ease;
            " onmouseover="this.style.background='rgba(239, 68, 68, 0.25)'" onmouseout="this.style.background='linear-gradient(145deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05))'">
                <span style="font-size: 24px; pointer-events:none;">🌀</span>
                <span style="pointer-events:none;">Boredom / Habit</span>
            </button>

            <!-- Footer -->
            <div style="grid-column: span 2; display:flex; justify-content:center; margin-top: 4px;">
                <div style="padding: 8px 16px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; font-size: 12px; color: #94A3BB; font-weight: 500; display:flex; align-items:center; gap: 8px;">
                    <span style="display:inline-block; width:8px; height:8px; background:#10B981; border-radius:50%; box-shadow:0 0 8px #10B981;"></span>
                    Focus Friction AI Active
                </div>
            </div>
        </div>
    `;

    Object.assign(barrier.style, {
        position:"fixed", top:"0", left:"0", width:"100vw", height:"100vh",
        backgroundColor:"rgba(10, 13, 20, 0.85)", zIndex:"2147483647", display:"flex",
        justifyContent:"center", alignItems:"center",
        backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)"
    });

    document.body.appendChild(barrier);

    barrier.onclick = async (e) => {
        if (!e.target.dataset.reason) return;
        const reason = e.target.dataset.reason;
        
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
    content.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; padding: 10px;">
            <div style="width:64px; height:64px; background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.3); border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:20px;">
                <span style="font-size:32px;">🛑</span>
            </div>
            <h1 style="font-size:28px; margin:0 0 12px 0; color:#EF4444; font-weight:700; letter-spacing:-0.5px;">Loop Detected</h1>
            <p style="font-size:16px; color:#94A3BB; margin:0 0 24px 0; line-height:1.6;">You've been here often recently.<br>Take a mindful pause.</p>
            <div style="background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.05); padding:16px 32px; border-radius:16px; width:100%; box-sizing:border-box;">
                <div id="friction-timer" style="font-size:24px; color:#10B981; font-weight:700; font-variant-numeric:tabular-nums;">Unlocking in 5s...</div>
            </div>
        </div>
    `;
    
    let seconds = 5;
    const timer = setInterval(() => {
        seconds--;
        document.getElementById("friction-timer").innerText = `Unlocking in ${seconds}s...`;
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
        position:"fixed", bottom:"20px", right:"20px", background:"#22c55e",
        color:"white", padding:"12px 20px", borderRadius:"8px", zIndex:"2147483647",
        fontFamily:"Segoe UI", fontWeight:"500"
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function removeBarrier() {
    const barrier = document.getElementById("binary-souls-barrier");
    if (barrier) { barrier.style.opacity = "0"; setTimeout(() => barrier.remove(), 500); }
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
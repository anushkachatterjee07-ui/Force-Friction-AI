// Show immediately on page load, don't wait for backend
function showIntentPrompt() {
    if (document.getElementById("binary-souls-barrier")) return;

    const barrier = document.createElement("div");
    barrier.id = "binary-souls-barrier";
    barrier.innerHTML = `
        <div style="text-align:center; font-family:Segoe UI; color:white; padding:30px; background:#18181b; border:1px solid #27272a; border-radius:12px; box-shadow:0 10px 25px rgba(0,0,0,0.5); max-width:450px;">
            <h1 style="font-size:28px; margin-bottom:10px; color:#ef4444; font-weight:700;">Why now?</h1>
            <p style="font-size:16px; color:#a1a1aa; margin-bottom:20px;">Be honest. No judgment.</p>
            <button data-reason="Study" style="background:#22c55e; color:white; border:none; padding:12px; border-radius:8px; font-size:14px; font-weight:bold; cursor:pointer; width:100%; margin-bottom:8px;">Study / Work</button>
            <button data-reason="Boredom" style="background:#ef4444; color:white; border:none; padding:12px; border-radius:8px; font-size:14px; font-weight:bold; cursor:pointer; width:100%; margin-bottom:8px;">Boredom / Habit</button>
            <button data-reason="Break" style="background:#3b82f6; color:white; border:none; padding:12px; border-radius:8px; font-size:14px; font-weight:bold; cursor:pointer; width:100%; margin-bottom:15px;">Intentional Break</button>
            <div style="display:inline-block; padding:8px 16px; background:#27272a; border-radius:20px; font-size:13px; color:#e4e4e7; font-weight:500;">🛡️ Binary Souls Safety Layer</div>
        </div>
    `;

    Object.assign(barrier.style, {
        position:"fixed", top:"0", left:"0", width:"100vw", height:"100vh",
        backgroundColor:"#09090b", zIndex:"2147483647", display:"flex",
        justifyContent:"center", alignItems:"center"
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
        <h1 style="font-size:28px; margin-bottom:10px; color:#ef4444; font-weight:700;">Loop Detected</h1>
        <p style="font-size:16px; color:#a1a1aa; margin-bottom:25px; line-height:1.5;">5+ visits in 2h. Take a pause.</p>
        <div id="friction-timer" style="font-size:20px; color:#facc15; font-weight:600;">Unlocking in 5s...</div>
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
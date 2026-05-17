// Function to inject the dark cognitive barrier screen
function heavyForceBlock() {
    if (document.getElementById("binary-souls-barrier")) return;

    const barrier = document.createElement("div");
    barrier.id = "binary-souls-barrier";
    barrier.innerHTML = `
        <div style="text-align: center; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: white; padding: 30px; background: #18181b; border: 1px solid #27272a; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); max-width: 450px;">
            <h1 style="font-size: 28px; margin-bottom: 10px; color: #ef4444; font-weight: 700;">Intent Check</h1>
            <p style="font-size: 16px; color: #a1a1aa; margin-bottom: 20px; line-height: 1.5;">Why do you want to visit this site?</p>
            <input type="text" id="intent-input" placeholder="I am here because..." style="width: 100%; padding: 12px; margin-bottom: 20px; background: #27272a; border: 1px solid #3f3f46; border-radius: 8px; color: white; box-sizing: border-box; font-size: 14px;" />
            <button id="unlock-btn" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 15px; transition: background 0.2s;">
                Unlock for 5 Minutes
            </button>
            <div style="display: inline-block; padding: 8px 16px; background: #27272a; border-radius: 20px; font-size: 13px; color: #e4e4e7; font-weight: 500; margin-bottom: 15px;">
                🛡️ Binary Souls Safety Layer Engaged
            </div>
            <div style="background: #27272a; border: 1px solid #3f3f46; border-radius: 8px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; font-size: 13px;">
                <span style="font-weight: 600; color: #e4e4e7;">Binary Souls Partner</span>
                <span id="partner-status" style="font-weight: bold; color: #a1a1aa;">Loading...</span>
            </div>
        </div>
    `;

    // Apply full screen overlay styles
    Object.assign(barrier.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100vw",
        height: "100vh",
        backgroundColor: "#09090b",
        zIndex: "2147483647", // Max z-index to stay on top
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "opacity 0.5s ease"
    });

    document.body.appendChild(barrier);

    // Add event listener for the intent unlock button
    const unlockBtn = document.getElementById("unlock-btn");
    if (unlockBtn) {
        unlockBtn.addEventListener("click", async () => {
            const reason = document.getElementById("intent-input").value;
            if (!reason.trim()) {
                alert("Please enter a reason.");
                return;
            }
            
            try {
                // Log the intent to the backend
                await fetch("http://127.0.0.1:8000/log-intent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        site: window.location.hostname,
                        reason: reason,
                        timestamp: new Date().toISOString()
                    })
                });
                
                // Trigger the 5 minute unlock explicitly
                await fetch("http://127.0.0.1:8000/api/unlock?minutes=5", {
                    method: "POST"
                });
                
                removeBarrier();
            } catch (err) {
                console.error("Failed to process intent unlock", err);
            }
        });
    }

    // Fetch team stats
    fetch("http://127.0.0.1:8000/api/team/stats")
        .then(res => res.json())
        .then(data => {
            const statusEl = document.getElementById("partner-status");
            if (statusEl && data.partner_status) {
                if (data.partner_status === "FOCUSED") {
                    statusEl.innerText = "🟢 FOCUSED";
                    statusEl.style.color = "#4ade80"; // green-400
                } else if (data.partner_status === "IN A LOOP") {
                    statusEl.innerText = "⚠️ IN A LOOP";
                    statusEl.style.color = "#facc15"; // yellow-400
                } else {
                    statusEl.innerText = data.partner_status;
                }
            }
        })
        .catch(err => console.log("Binary Souls: Stats fetch failed", err));
}

// Function to remove the barrier screen smoothly
function removeBarrier() {
    const barrier = document.getElementById("binary-souls-barrier");
    if (barrier) {
        barrier.style.opacity = "0";
        setTimeout(() => barrier.remove(), 500);
    }
}

// Main background checker loop
async function checkServerStatus() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/status");
        const data = await response.json();

        if (data.status === "LOCKED") {
            heavyForceBlock();
        } else if (data.status === "UNLOCKED") {
            removeBarrier();
        }
    } catch (err) {
        console.log("Focus Friction AI: Waiting for FastAPI server backend...", err);
        // Soft fallback: don't lock the user out if they are just coding with the server off
    }
}

// Poll the backend status api endpoint every 2 seconds
setInterval(checkServerStatus, 2000);
checkServerStatus();
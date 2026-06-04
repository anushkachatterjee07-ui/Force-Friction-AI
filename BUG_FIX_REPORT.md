# Force Friction AI: 4-Opening Lock Bypass Bug Fix Report

## Problem Statement
After opening YouTube exactly 4 times, the DOM overlay fails to lock the page, allowing the user to bypass the intentional friction loop completely.

---

## Root Causes & Fixes

### 🔴 Bug #1: State Leak - Off-by-One Error in Intent Evaluation  
**File:** `main.py` (Line 253-256)  
**Severity:** CRITICAL

#### The Issue
```python
# BEFORE (BUGGY):
if is_doomscrolling:
    if visits_2h >= 5: return "friction"
    if 2 <= visits_2h <= 4: return "nudge"
    return "friction" if visits_2h > 4 else "allow"
```

When `visits_2h = 4` (exactly 4 visits), the condition `2 <= visits_2h <= 4` evaluates to **True**, returning **"nudge"** instead of **"friction"**.

In `content.js`, the "nudge" action removes the barrier:
```javascript
if (data.action === "nudge") {
    removeBarrier();  // ← BUG: Unlocks instead of showing friction
    showToast(data.message);
}
```

#### The Fix
```python
# AFTER (FIXED):
if is_doomscrolling:
    # Doomscrolling detection: >=4 visits trigger friction (not 5+)
    if visits_2h >= 4: return "friction"
    if visits_2h == 2 or visits_2h == 3: return "nudge"
    return "allow"
```

Now on the 4th visit, the backend returns **"friction"** instead of **"nudge"**, triggering the 5-second friction timer instead of immediately unlocking.

---

### 🟠 Bug #2: Grace Period Cleanup - Stale Focus State Interval  
**File:** `content.js` (Line 611-613)  
**Severity:** HIGH

#### The Issue
```javascript
// BEFORE (BUGGY):
function startFocusStatePolling() {
    requestFocusState();
    setInterval(requestFocusState, 2000);  // ← Interval ID never stored or cleared!
}
```

This creates an interval that:
- Never gets stored, so it **cannot be cleared later**
- Continues running through multiple SPA navigations
- Accumulates multiple intervals over time
- Can cause stale timers to fire unpredictably, especially after 4+ visits

#### The Fix
```javascript
// AFTER (FIXED):
window.focusFrictionCleanupHandles = {
    focusStateInterval: null,
    verifyFocusInterval: null,
    frictionTimer: null,
    barrierCleanupTimer: null
};

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
```

Now all intervals are stored centrally and can be explicitly cleared when needed.

---

### 🟡 Bug #3: DOM Injection Integrity - Stale Timers on SPA Navigation  
**File:** `content.js` (Line 715-721)  
**Severity:** HIGH

#### The Issue
```javascript
// BEFORE (BUGGY):
new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        setTimeout(() => showIntentPrompt(), 1000);  // ← Re-injects barrier without cleanup!
    }
}).observe(document, {subtree: true, childList: true});
```

When YouTube's SPA router navigates:
- Old barriers are re-injected without cleaning up old timers
- Stale `verifyFocusInterval`, `frictionTimer`, and other intervals keep running
- After 4+ navigations, the accumulation of timers can interfere with new overlay injection
- Old timers may fire late and prematurely unlock the barrier

#### The Fix
```javascript
// AFTER (FIXED):
new MutationObserver(() => {
    if (location.href !== lastUrl) {
        lastUrl = location.href;
        
        // Clean up ALL timers before re-injecting barrier on SPA navigation
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
        
        // Remove any stale barrier before showing new one
        const oldBarrier = document.getElementById("binary-souls-barrier");
        if (oldBarrier) oldBarrier.remove();
        
        setTimeout(() => showIntentPrompt(), 1000);
    }
}).observe(document, {subtree: true, childList: true});
```

Now when navigating:
1. All active timers are explicitly cleared
2. Stale barriers are removed from the DOM
3. New barriers are injected with a clean state

---

### 🟡 Bug #4: Backend Lock Status Validation  
**File:** `content.js` (Line 739 & `startVerifyFocusPolling`)  
**Severity:** MEDIUM

#### The Issue
Previously, `verifyFocusInterval` was stored as a DOM attribute (`barrier.dataset.verifyFocusInterval`), which:
- Is harder to track centrally
- Persists with the DOM element even after removal
- Cannot be cleaned up when the barrier is removed

#### The Fix
Migrated to centralized cleanup handles:
```javascript
// BEFORE (BUGGY):
barrier.dataset.verifyFocusInterval = intervalId;  // ← Scattered storage

// AFTER (FIXED):
window.focusFrictionCleanupHandles.verifyFocusInterval = intervalId;  // ← Centralized
```

Plus explicit cleanup in `removeBarrier()`:
```javascript
function removeBarrier() {
    const barrier = document.getElementById("binary-souls-barrier");
    if (barrier) { 
        // Stop verify-focus polling before removing barrier
        stopVerifyFocusPolling();
        
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
```

---

## Testing Checklist

- [ ] Open YouTube once → Barrier shows with intent prompt
- [ ] Open YouTube a 2nd time → "Nudge" message (gentle warning)
- [ ] Open YouTube a 3rd time → "Nudge" message (gentle warning)
- [ ] **Open YouTube a 4th time → "Friction" timer appears (5-sec countdown lock)** ✅ **BUG FIXED**
- [ ] Navigate through YouTube SPA routes → Old timers don't interfere
- [ ] Rapid consecutive opens (5+) → Friction consistently enforced
- [ ] Switch tabs and return → No stale timers firing
- [ ] Monitor DevTools → No console errors about multiple intervals

---

## Impact Summary

| Component | Issue | Severity | Impact |
|-----------|-------|----------|--------|
| Intent Evaluation | Off-by-one error (4 → "nudge" instead of "friction") | CRITICAL | Barrier immediately removed on 4th visit |
| Focus State Polling | Interval never cleared | HIGH | Accumulates timers, causes unpredictable behavior |
| SPA Navigation | No cleanup on route change | HIGH | Stale timers interfere with new barriers |
| Barrier Cleanup | Scattered timer management | MEDIUM | Hard to track and clear all pending operations |

---

## Files Modified

1. **`main.py`** - Fixed doomscrolling threshold logic (1 change)
2. **`content.js`** - Added centralized cleanup handles and fixed timer leaks (5 changes)


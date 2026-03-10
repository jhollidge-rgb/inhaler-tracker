
// -----------------------------
// Date key (LOCAL date, iPhone-safe)
// -----------------------------
function getLocalDateKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const todayKey = getLocalDateKey();
document.getElementById("today").innerText = todayKey;

// -----------------------------
// Storage helpers
// -----------------------------
function getTodayData() {
  try {
    return JSON.parse(localStorage.getItem(todayKey) || "{}");
  } catch (e) {
    console.warn("Bad JSON in localStorage for", todayKey, e);
    return {};
  }
}

function setTodayData(data) {
  data._updatedAt = Date.now();
  localStorage.setItem(todayKey, JSON.stringify(data));
}

// -----------------------------
// Compute improvement display safely
// -----------------------------
function updateImprovement(slotEl, beforeVal, afterVal) {
  const improveEl = slotEl.querySelector(".improve");
  const before = Number(beforeVal);
  const after = Number(afterVal);

  if (!Number.isFinite(before) || !Number.isFinite(after) || beforeVal === "" || afterVal === "") {
    improveEl.innerText = "";
    return;
  }
  improveEl.innerText = "Improvement: " + (after - before);
}

// -----------------------------
// Save functions (your existing buttons still call these)
// -----------------------------
function saveSlot(btn) {
  const slot = btn.parentElement;
  const time = slot.dataset.time;

  const beforeEl = slot.querySelector(".before");
  const afterEl = slot.querySelector(".after");
  const commentEl = slot.querySelector(".comment");

  const beforeRaw = beforeEl.value;
  const afterRaw = afterEl.value;
  const before = Number(beforeRaw);
  const after = Number(afterRaw);

  const comment = commentEl.value;

  // Only calculate improvement if both numbers are present & valid
  let improvement = null;
  if (beforeRaw !== "" && afterRaw !== "" && Number.isFinite(before) && Number.isFinite(after)) {
    improvement = after - before;
  }

  updateImprovement(slot, beforeRaw, afterRaw);

  const data = getTodayData();
  if (!data[time]) data[time] = {};

  data[time].before = (beforeRaw === "" || !Number.isFinite(before)) ? null : before;
  data[time].after = (afterRaw === "" || !Number.isFinite(after)) ? null : after;
  data[time].improvement = improvement;
  data[time].comment = comment;

  setTodayData(data);
}

function saveDaily() {
  const data = getTodayData();

  data.daily = {
    units: document.getElementById("alcoholUnits").value,
    drink: document.getElementById("drinkType").value,
    impact: document.getElementById("breathingImpact").value,
    exercise: document.getElementById("exercise").value
  };

  setTodayData(data);
}

// -----------------------------
// Load & prepopulate on startup
// -----------------------------
function loadToday() {
  const data = getTodayData();

  document.querySelectorAll(".slot").forEach(slot => {
    const time = slot.dataset.time;
    const saved = data[time];
    if (!saved) return;

    const beforeEl = slot.querySelector(".before");
    const afterEl = slot.querySelector(".after");
    const commentEl = slot.querySelector(".comment");

    beforeEl.value = (saved.before ?? "") === null ? "" : (saved.before ?? "");
    afterEl.value = (saved.after ?? "") === null ? "" : (saved.after ?? "");
    commentEl.value = saved.comment ?? "";

    updateImprovement(slot, beforeEl.value, afterEl.value);
  });

  if (data.daily) {
    document.getElementById("alcoholUnits").value = data.daily.units ?? "";
    document.getElementById("drinkType").value = data.daily.drink ?? "";
    document.getElementById("breathingImpact").value = data.daily.impact ?? "";
    document.getElementById("exercise").value = data.daily.exercise ?? "";
  }
}

// -----------------------------
// Auto-save as user types
// -----------------------------
function wireAutoSave() {
  document.querySelectorAll(".slot").forEach(slot => {
    const beforeEl = slot.querySelector(".before");
    const afterEl = slot.querySelector(".after");
    const commentEl = slot.querySelector(".comment");

    const handler = () => {
      updateImprovement(slot, beforeEl.value, afterEl.value);
      const fakeBtn = { parentElement: slot };
      saveSlot(fakeBtn);
    };

    beforeEl.addEventListener("input", handler, { passive: true });
    afterEl.addEventListener("input", handler, { passive: true });
    commentEl.addEventListener("input", handler, { passive: true });
  });

  ["alcoholUnits", "drinkType", "breathingImpact", "exercise"].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("input", saveDaily, { passive: true });
    el.addEventListener("change", saveDaily, { passive: true });
  });
}

// -----------------------------
// Export
// -----------------------------
function exportData() {
  const all = { ...localStorage };
  const blob = new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inhaler-data.json";
  a.click();
}

// -----------------------------
// Trends
// -----------------------------
function showTrends() {
  const ctx = document.getElementById("trendChart");
  const labels = [];
  const values = [];

  const dateKeyRegex = /^\d{4}-\d{2}-\d{2}$/;

  Object.keys(localStorage).forEach(date => {
    if (!dateKeyRegex.test(date)) return;

    let day;
    try { day = JSON.parse(localStorage.getItem(date)); } catch { return; }

    let total = 0;
    let count = 0;

    Object.keys(day).forEach(t => {
      if (day[t] && typeof day[t].improvement === "number") {
        count++;
        total += day[t].improvement;
      }
    });

    if (count > 0) {
      labels.push(date);
      values.push(Math.round(total / count));
    }
  });

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Average Improvement",
        data: values
      }]
    }
  });
}

function showHome() {
  location.reload();
}

// -----------------------------
// Reminder banner UI
// -----------------------------
function ensureReminderBanner() {
  if (document.getElementById("reminderBanner")) return;

  const div = document.createElement("div");
  div.id = "reminderBanner";
  div.style.cssText = `
    display:none; position:fixed; left:12px; right:12px; bottom:12px;
    background:#111; color:#fff; padding:12px; border-radius:12px;
    box-shadow:0 8px 20px rgba(0,0,0,.25); z-index:9999; font-family:system-ui;
  `;
  div.innerHTML = `
    <div style="font-weight:600; margin-bottom:6px;">Reminder</div>
    <div id="reminderText" style="margin-bottom:10px;">Time to record your breathing for the next inhaler slot.</div>
    <button id="reminderDismiss" style="margin-right:8px;">OK</button>
    <button id="reminderSnooze">Snooze 10 min</button>
  `;
  document.body.appendChild(div);

  document.getElementById("reminderDismiss").addEventListener("click", () => {
    div.style.display = "none";
  });

  document.getElementById("reminderSnooze").addEventListener("click", () => {
    div.style.display = "none";
    snoozedUntil = Date.now() + 10 * 60 * 1000;
  });
}

function showReminder(message) {
  const banner = document.getElementById("reminderBanner");
  const text = document.getElementById("reminderText");
  if (text && message) text.textContent = message;
  if (banner) banner.style.display = "block";
}

// -----------------------------
// Reminder logic
// -----------------------------
let snoozedUntil = 0;

function slotIsMissing(time) {
  const data = getTodayData();
  const s = data[time];
  if (!s) return true;
  return (s.before == null && s.after == null && (!s.comment || s.comment.trim() === ""));
}

function checkReminder() {
  // If user snoozed, respect it
  if (Date.now() < snoozedUntil) return;

  // In iOS, background execution is not guaranteed.
  // We still run checks whenever JS gets CPU time.

  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const current = `${hh}:${mm}`;

  const times = ["08:00", "13:00", "18:00", "22:00"];
  const dueMissing = times.find(t => current >= t && slotIsMissing(t));

  if (dueMissing) {
    showReminder(`Please record breathing for ${dueMissing}.`);
    // Optional in-app Notification while open
    if ("Notification" in window && Notification.permission === "granted") {
      try { new Notification("Inhaler Tracker", { body: `Please record breathing for ${dueMissing}.` }); } catch {}
    }
  }
}

// -----------------------------
// Worker-driven ticking (best-effort background while app stays in memory)
// -----------------------------
let reminderWorker = null;

function startReminderWorker() {
  if (!window.Worker) return;
  try {
    reminderWorker = new Worker("reminder-worker.js");
    reminderWorker.onmessage = (e) => {
      const msg = e.data || {};
      if (msg.type === "tick") {
        // This keeps logic running even if Safari throttles main timers.
        checkReminder();
      }
    };
    reminderWorker.postMessage({ type: "start", intervalMs: 60000 });
  } catch (e) {
    console.warn("Worker failed", e);
  }
}

function stopReminderWorker() {
  if (reminderWorker) {
    reminderWorker.postMessage({ type: "stop" });
    reminderWorker.terminate();
    reminderWorker = null;
  }
}

// -----------------------------
// Startup
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  loadToday();
  wireAutoSave();
  ensureReminderBanner();

  // Start worker tick (helps when tab is backgrounded but still alive)
  startReminderWorker();

  // Also run an immediate check
  checkReminder();

  // When returning to foreground, refresh and check
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      loadToday();
      checkReminder();
    }
  });

  // Service worker registration (optional)
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(console.warn);
  }
});
``

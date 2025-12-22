"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.toast = CommandDashboard.toast ?? {};
console.log("Toast display functionality loaded");

if (!CommandDashboard.dom) {
    throw new Error("toast.js loaded before dom.js (CommandDashboard.dom missing). Check script order.");
}

const toastHost = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("toastHost"), HTMLElement, "#toastHost");

const VALID_TYPES = new Set(["info", "success", "error"]);
const MAX_TOASTS = 3;

function _dismissToast(toastEl) {
  if (!toastEl || toastEl._isRemoving) return;
  toastEl._isRemoving = true;

  if (toastEl._removeTimer) {
    clearTimeout(toastEl._removeTimer);
    toastEl._removeTimer = null;
  }

  toastEl.classList.add("toast-out");
  toastEl.addEventListener("animationend", () => toastEl.remove(), { once: true });
}

CommandDashboard.toast.show = function showToast(message, type = "info", durationMs = 3000) {
    if (!VALID_TYPES.has(type)) type = "info";
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const messageSpan = document.createElement("span");
    messageSpan.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.className = "toast-close";
    closeBtn.type = "button";
    closeBtn.textContent = "×";

    closeBtn.addEventListener("click", (event) => {
        event.preventDefault();
        _dismissToast(toast);
    });

    toast.appendChild(messageSpan);
    toast.appendChild(closeBtn);
    toastHost.appendChild(toast);

    toast._removeTimer = setTimeout(() => _dismissToast(toast), durationMs);

    if (toastHost.childElementCount > MAX_TOASTS) {
        _dismissToast(toastHost.children[0]);
    }

}
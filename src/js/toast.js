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

/**
 * @typedef {Object} ToastActionOptions
 * @property {string} [actionText]
 * @property {() => void} [onAction]
 * @property {boolean} [sticky]
 */

/**
 * Dismisses a toast element with animation.
 * @param {HTMLElement} toastEl
 */
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

/**
 * Displays a toast notification.
 * @param {string} message
 * @param {"info" | "success" | "error"} [type="info"]
 * @param {number} [durationMs=3000]
 * @param {ToastActionOptions | null} [options=null]
 */
CommandDashboard.toast.show = function showToast(
      message,
      type = "info",
      durationMs = 3000,
      options = null
    ) {
    
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

    let actionBtn = null;

    if (options?.actionText && typeof options.onAction === "function") {
        actionBtn = document.createElement("button");
        actionBtn.className = "toast-action";
        actionBtn.type = "button";
        actionBtn.textContent = options.actionText;

        actionBtn.addEventListener("click", (event) => {
            event.preventDefault();
            options.onAction();
            _dismissToast(toast);
        });
    }

    toast.appendChild(messageSpan);
    if (actionBtn) toast.appendChild(actionBtn);
    toast.appendChild(closeBtn);
    toastHost.appendChild(toast);

    const ms = options?.sticky ? 999999 : durationMs;
    toast._removeTimer = setTimeout(() => _dismissToast(toast), ms);

    if (toastHost.childElementCount > MAX_TOASTS) {
        _dismissToast(toastHost.children[0]);
    }

}

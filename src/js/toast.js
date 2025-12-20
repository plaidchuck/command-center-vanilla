CommandDashboard.toast = CommandDashboard.toast ?? {};

if (!CommandDashboard.dom) {
    throw new Error("toast.js loaded before dom.js (CommandDashboard.dom missing). Check script order.");
}

const { mustGetElementById: getElById, mustBe: mustBeInstanceOf } = CommandDashboard.dom;
const toastHost = mustBeInstanceOf(getElById("toastHost"), HTMLElement, "#toastHost");

CommandDashboard.toast.show = function showToast(message, type = "info", durationMs = 3000) {
    const MAX_TOASTS = 3;

    if (!["info","success","error"].includes(type)) type = "info";

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    const messageSpan = document.createElement("span");
    messageSpan.textContent = message;

    const closeBtn = document.createElement("button");
    closeBtn.className = "toast-close";
    closeBtn.type = "button";
    closeBtn.textContent = "×";

    toast.appendChild(messageSpan);
    toast.appendChild(closeBtn);

    toastHost.appendChild(toast);

    let isRemoving = false;

    function removeToast() {
        if (isRemoving) return;
        isRemoving = true;

        toast.classList.add("toast-out");

        toast.addEventListener(
            "animationend",
            () => {
                toast.remove();
            },
              { once: true });
      }

    const removeTimer = setTimeout(removeToast, durationMs);
    toast._removeTimer = removeTimer;

    closeBtn.addEventListener("click", (event) => {
        event.preventDefault();
        clearTimeout(removeTimer);
        removeToast();
    });

    if (toastHost.childElementCount > MAX_TOASTS) {
        const oldestToast = toastHost.children[0];
        dismissOldestToast(oldestToast);
    }


    function dismissOldestToast(oldestToast) {
        if (oldestToast.classList.contains("toast-out")) return;
        if (oldestToast._removeTimer) clearTimeout(oldestToast._removeTimer);

        oldestToast.classList.add("toast-out");
        oldestToast.addEventListener(
            "animationend",
            () => {
              oldestToast.remove();
            },
            { once: true });
    }
}
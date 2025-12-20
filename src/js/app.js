// app.js
console.log("Command Dashboard booting…");

if (!window.CommandDashboard?.dom) {
  throw new Error("CommandDashboard.dom not loaded. Check script order / namespace name.");
}

const { mustGetElementById, mustBe } = CommandDashboard.dom;

// Helpers

function isValidAppState(state) {
    return (
        state &&
        typeof state === "object" &&
        typeof state.schemaVersion === "number" &&
        Array.isArray(state.widgets)
  );
}

function autosizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
}

function createTimestamp() {
    const currentDateTime = new Date();
    return currentDateTime.getFullYear() + "-" +
          String(currentDateTime.getMonth() + 1).padStart(2, "0") + "-" +
          String(currentDateTime.getDate()).padStart(2, "0") + "_" +
          String(currentDateTime.getHours()).padStart(2, "0") + "-" +
          String(currentDateTime.getMinutes()).padStart(2, "0") + "-" +
          String(currentDateTime.getSeconds()).padStart(2, "0");
}

function showToast(message, type = "info", durationMs = 3000) {
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

    closeBtn.addEventListener("click", () => {
        clearTimeout(removeTimer);
        removeToast();
    });

    if (toastHost.children.length > MAX_TOASTS) {
        // oldest is first node, like stack
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

const dashboard = mustBe(mustGetElementById("dashboard"), HTMLElement, "#dashboard");
const addNoteBtn = mustBe(mustGetElementById("addNoteBtn"), HTMLButtonElement, "#addNoteBtn");
const headerTitle = mustBe(mustGetElementById("headerTitle"), HTMLElement, "#headerTitle");
const clearNotesBtn = mustBe(mustGetElementById("clearNotesBtn"), HTMLButtonElement, "#clearNotesBtn");
const exportBtn = mustBe(mustGetElementById("exportBtn"), HTMLButtonElement, "#exportBtn");
const importBtn = mustBe(mustGetElementById("importBtn"), HTMLButtonElement, "#importBtn");
const toastHost = mustBe(mustGetElementById("toastHost"), HTMLElement, "#toastHost");

//import file input must be set up globally to persist throughout for async reasons
const importFileInput = document.createElement("input");
importFileInput.type = "file";
importFileInput.accept = ".json,application/json";
importFileInput.style.display = "none";
document.body.appendChild(importFileInput);

let saveTimerId = null;

const sessionState = loadState();
if (sessionState && typeof sessionState === "object" && Array.isArray(sessionState.widgets)) {
  window.appState = sessionState;
}

// render it all
function render() {
  headerTitle.textContent = window.appState.title;
  dashboard.innerHTML = "";

  const hasNotes = window.appState.widgets.some(w => w.type === "note");
  clearNotesBtn.disabled = !hasNotes;

  if (window.appState.widgets.length === 0) {
    const msg = document.createElement("div");
    msg.textContent = "No widgets yet — click + Note to add one.";
    msg.style.opacity = "0.6";
    dashboard.appendChild(msg);
  } else {
    for (const widget of window.appState.widgets) {
        if (widget.type === "note") {
            const noteCard = document.createElement("div");
            noteCard.className = "note-card";

            const textarea = document.createElement("textarea");
            textarea.className = "note-text";

            textarea.value = widget.data?.text ?? "";
            textarea.placeholder = "Write something ...";
            textarea.dataset.widgetId = widget.id;
            
            const header = document.createElement("div");
            header.className = "note-card-header";

            const delBtn = document.createElement("button");
            delBtn.className = "note-delete";
            delBtn.type = "button";
            delBtn.textContent = "✕";
            delBtn.dataset.widgetId = widget.id;

            header.appendChild(delBtn);
            noteCard.appendChild(header);

            noteCard.appendChild(textarea);
            dashboard.appendChild(noteCard);

            autosizeTextarea(textarea);
        }
    }
  }
}

// Listeners

// Export to JSON button listener
exportBtn.addEventListener("click", () => {
    try {
        if (!isValidAppState(window.appState)) {
            alert("Cannot export: application state is invalid.");
            return;
        }
  
        if (window.appState.widgets.length === 0) {
            const ok = confirm("There are no notes. Export anyway?");
            if (!ok) return;
        }

        const appstateAsString = JSON.stringify(window.appState, null, 2);
        const appstateAsBlob = new Blob([appstateAsString], {type: "application/json"});
        const appstateURLObject = URL.createObjectURL(appstateAsBlob);
  
        const anchorElement = document.createElement("a");
        anchorElement.href = appstateURLObject;
  
        const timestamp = createTimestamp();
        anchorElement.download = `command-dashboard-${timestamp}.json`;
  
        document.body.appendChild(anchorElement);
        anchorElement.click();
        showToast(`Export: ${anchorElement.download}`, "success");
        anchorElement.remove();
  
        setTimeout(() => URL.revokeObjectURL(appstateURLObject), 0);
    } catch (error) {
          console.error(error);
          showToast("Export failed. See console for details.", "error", 5000);
    }
});

// Import button listener
importBtn.addEventListener("click", (event) => {
    event.preventDefault();
    importFileInput.value = "";
    importFileInput.click();
});

// File input listener
importFileInput.addEventListener("change", async () => {
    const file = importFileInput.files?.[0];
    if (!file) return;

    try {
        const text = await file.text();
        const importedState = JSON.parse(text);

    if (!isValidAppState(importedState)) {
        showToast("Invalid JSON file", "error", 5000);
        return;
    }

    if (importedState.schemaVersion !== window.appState.schemaVersion) {
        showToast(
            `Unsupported file version.\nExpected schema v${window.appState.schemaVersion}, got v${importedState.schemaVersion}.`,
            "error", 5000);
        return;
    }

    const ok = confirm("Import will replace your current notes. Continue?");
    if (!ok) return;

    window.appState = importedState;
    saveState(window.appState);
    render();
    const widgetsSize = window.appState.widgets.length;
    showToast(`Imported ${widgetsSize} ${widgetsSize === 1 ? "note" : "notes"}`, "success");

    } catch (err) {
        console.error(err);
        showToast("Import failed (invalid file).", "error", 5000);
    } finally {
        importFileInput.value = "";
    }
});



// Adds new note widget to dashboard and state
addNoteBtn.addEventListener("click", () => {
    const newWidget = window.createNoteWidget();
    const newWidgetId = newWidget.id;

    window.appState.widgets.push(newWidget);
    saveState(window.appState);
    render();

    const selector = `textarea[data-widget-id="${newWidgetId}"]`;
    const textareaToFocus = document.querySelector(selector);

    if (textareaToFocus) {
          autosizeTextarea(textareaToFocus);
          textareaToFocus.focus();
      }
});

// Deletes widgets
dashboard.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;
    if (!target.classList.contains("note-delete")) return;
    
    event.preventDefault();
    const widgetId = target.dataset.widgetId;
    if (!widgetId) return;
    
    window.appState.widgets = window.appState.widgets
                              .filter(arrayWidget => arrayWidget.id !== widgetId);
    
    saveState(window.appState);
    render();
});

// Deletes all widgets
clearNotesBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const okayToClear = confirm("Clear all notes?");
    if (!okayToClear) return;

    window.appState.widgets = window.appState.widgets.filter(arrayWidget => arrayWidget.type !== "note");

    saveState(window.appState);
    render();

});

// Debounce saving of note widget text
dashboard.addEventListener("input", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement)) return;
    if (!target.classList.contains("note-text")) return;
    
    const widgetId = target.dataset.widgetId;
    if (!widgetId) return;

    const widget = window.appState.widgets
                   .find(arrayWidget => arrayWidget.id === widgetId);

    if (widget === undefined) {
        return;
    }
    widget.data ??= {};
    widget.data.text = target.value;

    autosizeTextarea(target);

    if (saveTimerId !== null) {
        clearTimeout(saveTimerId);
    }

    saveTimerId = setTimeout(() => {
        saveState(window.appState);
        saveTimerId = null;
    }, 250);
});

// Change title or use default
headerTitle.addEventListener("input", () => {
  window.appState.title = headerTitle.textContent.trim() || "Command Dashboard";

  if (saveTimerId !== null) {
    clearTimeout(saveTimerId);
  }

  saveTimerId = setTimeout(() => {
    saveState(window.appState);
    saveTimerId = null;
  }, 250);
});

// prevent new line on title
headerTitle.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    headerTitle.blur();
  }
});

render();
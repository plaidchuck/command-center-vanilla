// app.js
console.log("Command Center booting…");

function isValidAppState(state) {
    return (
        state &&
        typeof state === "object" &&
        typeof state.schemaVersion === "number" &&
        Array.isArray(state.widgets)
  );
}


function mustGetElementById(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing required element: #${id}`);
  return el;
}

function mustBe(el, ctor, name) {
  if (!(el instanceof ctor)) throw new Error(`${name} is not a ${ctor.name}`);
  return el;
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

const dashboard = mustBe(mustGetElementById("dashboard"), HTMLElement, "#dashboard");
const addNoteBtn = mustBe(mustGetElementById("addNoteBtn"), HTMLButtonElement, "#addNoteBtn");
const headerTitle = mustBe(mustGetElementById("headerTitle"), HTMLElement, "#headerTitle");
const clearNotesBtn = mustBe(mustGetElementById("clearNotesBtn"), HTMLButtonElement, "#clearNotesBtn");
const exportBtn = mustBe(mustGetElementById("exportBtn"), HTMLButtonElement, "#exportBtn");
const importBtn = mustBe(mustGetElementById("importBtn"), HTMLButtonElement, "#importBtn");

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
        anchorElement.download = `command-center-${timestamp}.json`;
  
        document.body.appendChild(anchorElement);
        anchorElement.click();
        anchorElement.remove();
  
        setTimeout(() => URL.revokeObjectURL(appstateURLObject), 0);
    } catch (error) {
          console.error(err);
          alert("Export failed. See console for details.");
    }
});

// Import JSON/state button listener
importBtn.addEventListener("click", () => {
  console.log("import");
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
  window.appState.title = headerTitle.textContent.trim() || "Command Center";

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
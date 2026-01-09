"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.controllers = CommandDashboard.controllers ?? {};
console.log("Loaded controllers");


/**
 * Opens the file picker for importing state.
 * @param {MouseEvent} event
 */
CommandDashboard.controllers.onImportClick = function onImportClick(event) {
    event.preventDefault();
    CommandDashboard.io.openImportPicker();
};

/**
 * Handles JSON file selection and imports state.
 * @param {Event} event
 * @returns {Promise<void>}
 */
CommandDashboard.controllers.onImportFileChange = async function onImportFileChange(event) {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;

    const file = input.files?.[0];
    input.value = "";
    if (!file) return;

    try {
        const text = await file.text();
        const importedState = JSON.parse(text);

    if (!CommandDashboard.store.isValidState(importedState)) {
        CommandDashboard.toast.show("Invalid JSON file", "error", 5000);
        return;
    }

    if (importedState.schemaVersion !== window.appState.schemaVersion) {
        CommandDashboard.toast.show(
            `Unsupported file version. Expected v${window.appState.schemaVersion}, got v${importedState.schemaVersion}.`,
            "error",
            5000
        );
        return;
    }

    const ok = confirm("Import will replace your current notes. Continue?");
    if (!ok) return;

    CommandDashboard.store.replace(importedState);

    const n = window.appState.widgets.length;
    CommandDashboard.toast.show(`Imported ${n} ${n === 1 ? "note" : "notes"}`, "success");
    
    } catch (e) {
        console.error(e);
        CommandDashboard.toast.show("Import failed (invalid file).", "error", 5000);
    }
};

/**
 * Exports the current application state to JSON.
 * @param {MouseEvent} event
 */
CommandDashboard.controllers.onExportClick = function onExportClick(event) {
    event.preventDefault();

    const state = window.appState;

    if (!CommandDashboard.store.isValidState(state)) {
        CommandDashboard.toast.show("Cannot export: application state is invalid.", "error");
        return;
    }

    if (state.widgets.length === 0) {
        const ok = confirm("There are no notes. Export anyway?");
        if (!ok) return;
    }

    const filenamePrefix = "command-dashboard";

    try {
        const downloadFilename = CommandDashboard.io.exportStateToJson(window.appState, filenamePrefix);
        CommandDashboard.toast.show(`Export: ${downloadFilename}`, "success");
    } catch (error) {
        console.error(error);
        CommandDashboard.toast.show("Export failed. See console for details.", "error", 5000);
    }
};

// Debounce to save dashboard/widget input
/**
 * Handles input events within the dashboard for notes and titles.
 * @param {Event} event
 */
CommandDashboard.controllers.onDashboardInput = function onDashboardInput(event) {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement && target.classList.contains("note-text")) {
        const widgetId = target.dataset.widgetId;
        if (!widgetId) return;

        const widget = window.appState.widgets.find(w => w.id === widgetId);
        if (!widget) return;

        widget.data ??= {};
        widget.data.text = target.value;

      // immediate UX
        CommandDashboard.widgets.note.autosizeTextarea(target);

      // delayed persistence
        CommandDashboard.store.scheduleSave(250);
        return;
    }

    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains("widget-title")) return;

    const widgetId = target.dataset.widgetId;
    if (!widgetId) return;

    const widget = window.appState.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    CommandDashboard.widgets.meta.setTitle(widget, target.textContent ?? "");
    CommandDashboard.store.scheduleSave(250);
};

/**
 * Updates the dashboard title from the header input.
 * @param {Event} event
 */
CommandDashboard.controllers.onTitleInput = function onTitleInput (event) {
    const headerTitle = event.currentTarget;
    if (!(headerTitle instanceof HTMLElement)) return;
    
    window.appState.title = headerTitle.textContent.trim() || "Command Dashboard";
    CommandDashboard.store.scheduleSave(250);
};

// Keep title a single line
/**
 * Prevents new lines in the header title.
 * @param {KeyboardEvent} event
 */
CommandDashboard.controllers.onTitleKeyDown = function onTitleKeyDown(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        event.currentTarget.blur();
    }
};

/**
 * Prevents new lines in widget titles.
 * @param {KeyboardEvent} event
 */
CommandDashboard.controllers.onWidgetTitleKeyDown = function onWidgetTitleKeyDown(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains("widget-title")) return;

    if (event.key === "Enter") {
        event.preventDefault();
        target.blur();
    }
};

/**
 * Restores the stored widget title on focus out.
 * @param {FocusEvent} event
 */
CommandDashboard.controllers.onWidgetTitleFocusOut = function onWidgetTitleFocusOut(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains("widget-title")) return;

    const widgetId = target.dataset.widgetId;
    if (!widgetId) return;

    const widget = window.appState.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const storedTitle = CommandDashboard.widgets.meta.getTitle(widget);
    if (!storedTitle) {
        target.textContent = "";
        return;
    }

    if (target.textContent !== storedTitle) {
        target.textContent = storedTitle;
    }
};

// Add widget
/**
 * Adds a new note widget.
 */
CommandDashboard.controllers.onAddNote = function onAddNote() {
    const noteApi = CommandDashboard.widgets.get?.("note");
    const newWidget = noteApi.create();

    CommandDashboard.store.apply(state => {
        state.widgets.push(newWidget);
    });

    CommandDashboard.widgets.note.focusNote(newWidget.id);
};

// Widget button action dispatcher
/**
 * Dispatches widget button actions within the dashboard.
 * @param {MouseEvent} event
 */
CommandDashboard.controllers.onDashboardClick = function onDashboardClick(event) {
    const btn = event.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    if (!action) return;
    
    const widgetId = btn.dataset.widgetId;
    event.preventDefault();

    const handler = CommandDashboard.handlers?.[action];
    if (typeof handler !== "function") {
        console.warn("No handler registered for action:", action);
        return;
    }

    handler({ widgetId, event, button: btn});
};

// Clear all widgets
/**
 * Clears all notes with optional undo.
 * @param {MouseEvent} event
 */
CommandDashboard.controllers.onClearNotes = function onClearNotes(event) {
    event.preventDefault();

    const ok = confirm("Clear all notes?");
    if (!ok) return;

    const widgetsBeforeClear = window.appState.widgets.slice();

    CommandDashboard.store.apply(function (state) {
        state.widgets = state.widgets.filter(w => w.type !== "note");
    });

    const undoAction = {
        actionText: "Undo",
        onAction: () => {
            CommandDashboard.store.apply(state => {
                state.widgets = widgetsBeforeClear.slice();
            });
        }
    }
    CommandDashboard.toast.show("All Notes Deleted", "info", 5000, undoAction);
};

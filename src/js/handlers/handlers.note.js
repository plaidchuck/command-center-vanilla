"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.handlers = CommandDashboard.handlers ?? {};
console.log("Note widget handlers loaded");

/**
 * Deletes a widget and shows an undo toast.
 * @param {string} widgetId
 */
function _deleteWidget(widgetId) {
    if (!widgetId) return;

    let deletedWidget = null;
    let deleteIndex = -1;

    CommandDashboard.store.apply(state => {
        deleteIndex = state.widgets.findIndex(w => w.id === widgetId);
        if (deleteIndex === -1) return;

        deletedWidget = structuredClone(state.widgets[deleteIndex]);
        state.widgets.splice(deleteIndex, 1);
    });

    if (deleteIndex === -1 || !deletedWidget) return;

    const undoAction = {
        actionText: "Undo",
        onAction: () => {
            CommandDashboard.store.apply(state => {
                const i = Math.min(deleteIndex, state.widgets.length);
                state.widgets.splice(i, 0, deletedWidget);
            });
            if (deletedWidget.type === "note") {
                CommandDashboard.widgets.note.focusNote(deletedWidget.id);
            }
        }
    };

    CommandDashboard.toast.show("Widget Deleted", "info", 5000, undoAction);
}

/**
 * Pins or unpins a widget and reorders it within the list.
 * @param {string} widgetId
 * @param {boolean} pin
 */
function _pinWidget(widgetId, pin) {
    if (!widgetId) return;

    CommandDashboard.store.apply(state => {
        const fromIndex = state.widgets.findIndex(w => w.id === widgetId);
        if (fromIndex === -1) return;

        const widget = state.widgets[fromIndex];
        const isPinned = CommandDashboard.widgets.meta.getPinned(widget);
        if (pin === isPinned) return;

        state.widgets.splice(fromIndex, 1);

        CommandDashboard.widgets.meta.setPinned(widget, pin);

        if (pin) {
            state.widgets.splice(0, 0, widget);
            return;
        }

        let insertIndex = 0;
        while (insertIndex < state.widgets.length) {
            const current = state.widgets[insertIndex];
            if (!CommandDashboard.widgets.meta.getPinned(current)) break;
            insertIndex++;
        }
        state.widgets.splice(insertIndex, 0, widget);
    });

    CommandDashboard.widgets.note.focusNote(widgetId);
}

/**
 * Handler for deleting a widget from chrome controls.
 * @param {{widgetId: string}} payload
 */
CommandDashboard.handlers["widget-delete"] = function widgetDeleteHandler({ widgetId }) {
    _deleteWidget(widgetId);
};

/**
 * Handler for toggling widget pin state.
 * @param {{widgetId: string}} payload
 */
CommandDashboard.handlers["widget-pin-toggle"] = function widgetPinToggleHandler({ widgetId }) {
    if (!widgetId) return;

    const widget = window.appState.widgets.find(w => w.id === widgetId);
    if (!widget) return;

    const pinned = CommandDashboard.widgets.meta.getPinned(widget);
    _pinWidget(widgetId, !pinned);
};

/**
 * Handler for deleting a note widget.
 * @param {{widgetId: string}} payload
 */
CommandDashboard.handlers["note-delete"] = function noteDeleteHandler({ widgetId }) {
    _deleteWidget(widgetId);
};

/**
 * Handler for pinning a note widget.
 * @param {{widgetId: string}} payload
 */
CommandDashboard.handlers["note-pin"] = function notePinHandler({ widgetId }) {
    _pinWidget(widgetId, true);
};

/**
 * Handler for unpinning a note widget.
 * @param {{widgetId: string}} payload
 */
CommandDashboard.handlers["note-unpin"] = function noteUnpinHandler({ widgetId }) {
    _pinWidget(widgetId, false);
};

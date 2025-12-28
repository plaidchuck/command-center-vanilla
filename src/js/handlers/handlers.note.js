"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.handlers = CommandDashboard.handlers ?? {};
console.log("Note widget handlers loaded");

CommandDashboard.handlers["note-delete"] = function noteDeleteHandler({ widgetId }) {
    if (!widgetId) return;

    let deletedWidget = null;
    let deleteIndex = -1;

    deletedWidget = structuredClone(window.appState.widgets[deleteIndex]);

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
      CommandDashboard.render.focusNote(deletedWidget.id);
    }
  };

  CommandDashboard.toast.show("Note Deleted", "info", 5000, undoAction);
};

CommandDashboard.handlers["note-pin"] = function notePinHandler({ widgetId }) {
    if (!widgetId) return;
    
    CommandDashboard.store.apply(state => {
        const fromIndex = state.widgets.findIndex(w => w.id === widgetId);
        if (fromIndex === -1) return;

        const noteWidget = state.widgets[fromIndex];
        noteWidget.data ??= {};

        if (noteWidget.data.pinned) return;

        state.widgets.splice(fromIndex, 1);

        noteWidget.data.pinned = true;
        state.widgets.splice(0, 0, noteWidget);
    });
    
    CommandDashboard.render.focusNote(widgetId);
};

CommandDashboard.handlers["note-unpin"] = function noteUnpinHandler({ widgetId}) {
    if (!widgetId) return;

    CommandDashboard.store.apply(state => {
        const fromIndex = state.widgets.findIndex(w => w.id === widgetId);
        if (fromIndex === -1) return;

        const noteWidget = state.widgets[fromIndex];
        noteWidget.data ??= {};

        if (!noteWidget.data.pinned) return;

        state.widgets.splice(fromIndex, 1);

        let insertIndex = 0;
        while (insertIndex < state.widgets.length) {
            const widget = state.widgets[insertIndex];
            if (!widget.data?.pinned) break;
            insertIndex++;
        }
        noteWidget.data.pinned = false;

        state.widgets.splice(insertIndex, 0, noteWidget);
    });

    CommandDashboard.render.focusNote(widgetId);
};
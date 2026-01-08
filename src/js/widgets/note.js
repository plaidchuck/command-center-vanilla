"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.widgets = CommandDashboard.widgets ?? {};
CommandDashboard.widgets.note = CommandDashboard.widgets.note ?? {};
console.log("note widget registry loaded");

function _autosizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
}

function _focusNote(widgetId) {
    if (!widgetId) return;
    const note = document.querySelector(`textarea.note-text[data-widget-id="${widgetId}"]`);
    if (note) note.focus();
}

function _createNoteBody(widget) {
    const textarea = document.createElement("textarea");
    textarea.className = "note-text";
    textarea.value = widget.data?.text ?? "";
    textarea.placeholder = "Write something ...";
    textarea.dataset.widgetId = widget.id;
    requestAnimationFrame(() => _autosizeTextarea(textarea));

    return textarea;
}

CommandDashboard.widgets.register("note", {
    create: () => ({
        id: "w_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        type: "note",
        data: { text: "" },
        meta: { pinned: false }
    }),
    render: (widget) => _createNoteBody(widget),
});

CommandDashboard.widgets.note.autosizeTextarea = _autosizeTextarea;
CommandDashboard.widgets.note.focusNote = _focusNote;

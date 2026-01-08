"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.widgets = CommandDashboard.widgets ?? {};
console.log("note widget registry loaded");

function _createNoteBody(widget) {
    const textarea = document.createElement("textarea");
    textarea.className = "note-text";
    textarea.value = widget.data?.text ?? "";
    textarea.placeholder = "Write something ...";
    textarea.dataset.widgetId = widget.id;

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

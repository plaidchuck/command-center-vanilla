"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.widgets = CommandDashboard.widgets ?? {};
console.log("note widget registry loaded");

function _autosizeTextarea(textarea) {
    if (!(textarea instanceof HTMLTextAreaElement)) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
}

function _createNoteCard(widget) {
    const noteCard = document.createElement("div");
    noteCard.className = "note-card";
    
    // Pinned or not, false if null
    const pinned = CommandDashboard.widgets.meta.getPinned(widget);
    if (pinned) noteCard.classList.add("is-pinned");

    const header = document.createElement("div");
    header.className = "note-card-header";

    const pinBtn = document.createElement("button");
    pinBtn.className = "note-pin"
    pinBtn.type = "button";
    pinBtn.textContent = pinned ? "📍" : "📌";
    pinBtn.title = pinned ? "Unpin note" : "Pin note";
    pinBtn.dataset.widgetId = widget.id;
    pinBtn.dataset.action = pinned ? "note-unpin" : "note-pin";

    header.appendChild(pinBtn);

    const delBtn = document.createElement("button");
    delBtn.className = "note-delete";
    delBtn.type = "button";
    delBtn.textContent = "✕";
    delBtn.title = "Delete note";
    delBtn.dataset.widgetId = widget.id;
    delBtn.dataset.action = "note-delete";

    header.appendChild(delBtn);

    const textarea = document.createElement("textarea");
    textarea.className = "note-text";
    textarea.value = widget.data?.text ?? "";
    textarea.placeholder = "Write something ...";
    textarea.dataset.widgetId = widget.id;
    _autosizeTextarea(textarea);

    noteCard.appendChild(header);
    noteCard.appendChild(textarea);

    return noteCard;
}

CommandDashboard.widgets.register("note", {
    create: () => ({
        id: "w_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        type: "note",
        data: { text: "" },
        meta: { pinned: false }
    }),
    render: (widget) => _createNoteCard(widget),
    autosizeTextarea: _autosizeTextarea,
});

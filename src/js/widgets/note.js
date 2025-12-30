CommandDashboard.window = CommandDashboard.window ?? {};
CommandDashboard.widgets = CommandDashboard.widgets ?? {};
console.log("note widget registry loaded");

function _createNoteCard(widget) {
    const noteCard = document.createElement("div");
    noteCard.className = "note-card";
    
    // Pinned or not, false if null
    const pinned = !!widget.data?.pinned;
    if (pinned) noteCard.classList.add("is-pinned");

    const header = document.createElement("div");
    header.className = "note-card-header";

    const pinBtn = document.createElement("button");
    pinBtn.className = "note-pin"
    pinBtn.type = "button";
    pinBtn.textContent = pinned ? "📍" : "📌";
    pinBtn.title = pinned ? "Unpin note" : "Pin note";
    pinBtn.dataset.widgetId = widget.id;
    pinBtn.dataset.action = widget.data?.pinned ? "note-unpin" : "note-pin";

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

    noteCard.appendChild(header);
    noteCard.appendChild(textarea);

    return noteCard;
}

CommandDashboard.widgets.register("note", {
    render: (widget) => _createNoteCard(widget),
});

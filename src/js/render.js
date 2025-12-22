"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.render = CommandDashboard.render ?? {};
console.log("render functionality loaded");

if (!CommandDashboard.dom) {
    throw new Error("render.js loaded before dom.js (CommandDashboard.dom missing). Check script order.");
}

// Internal module state (cached element refs)
let _dashboard = null;
let _headerTitle = null;
let _clearNotesBtn = null;

function _autosizeTextarea(textarea) {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
}

function _createEmptyMessage() {
    const msg = document.createElement("div");
    msg.textContent = "No widgets yet — click + Note to add one.";
    msg.style.opacity = "0.6";
    return msg;
}

function _createNoteCard(widget) {
    const noteCard = document.createElement("div");
    noteCard.className = "note-card";

    const header = document.createElement("div");
    header.className = "note-card-header";

    const delBtn = document.createElement("button");
    delBtn.className = "note-delete";
    delBtn.type = "button";
    delBtn.textContent = "✕";
    delBtn.dataset.widgetId = widget.id;

    header.appendChild(delBtn);

    const textarea = document.createElement("textarea");
    textarea.className = "note-text";
    textarea.value = widget.data?.text ?? "";
    textarea.placeholder = "Write something ...";
    textarea.dataset.widgetId = widget.id;

    noteCard.appendChild(header);
    noteCard.appendChild(textarea);

    _autosizeTextarea(textarea);

    return noteCard;
}

/**
 * Call once from app.js after you have the elements.
 */
CommandDashboard.render.init = function initRender({ dashboard, headerTitle, clearNotesBtn }) {
    _dashboard = dashboard;
    _headerTitle = headerTitle;
    _clearNotesBtn = clearNotesBtn;
};

/**
 * Renders the full UI from state.
 */
CommandDashboard.render.renderApp = function renderApp(state) {
  if (!_dashboard || !_headerTitle || !_clearNotesBtn) {
    throw new Error("CommandDashboard.render.init(...) was not called before renderApp().");
  }

  _headerTitle.textContent = state.title ?? "Command Dashboard";
  _dashboard.innerHTML = "";

  const hasNotes = state.widgets?.some(w => w.type === "note") ?? false;
  _clearNotesBtn.disabled = !hasNotes;

  const widgets = state.widgets ?? [];
  if (widgets.length === 0) {
    _dashboard.appendChild(_createEmptyMessage());
    return;
  }

  for (const widget of widgets) {
    if (widget.type === "note") {
      _dashboard.appendChild(_createNoteCard(widget));
    }
  }
};

CommandDashboard.render.autosizeTextarea = _autosizeTextarea;
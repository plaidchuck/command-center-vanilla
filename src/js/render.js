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

function _focusNote(widgetId) {
    if (!_dashboard) return;
    const note = _dashboard.querySelector(`textarea[data-widget-id="${widgetId}"]`);
    if(note) note.focus();
}

function _wireAutosizeOnInput() {
    if (!_dashboard) return;

    _dashboard.addEventListener("input", (event) => {
        const target = event.target;
        if (!(target instanceof HTMLTextAreaElement)) return;
        if (!target.classList.contains("note-text")) return;
    
      _autosizeTextarea(target);
  });
}

CommandDashboard.render.focusNote = _focusNote;
CommandDashboard.render.wireAutosizeOnInput = _wireAutosizeOnInput;

/**
 * Call once from app.js after you have the elements.
 */
CommandDashboard.render.init = function initRender({ dashboard, headerTitle, clearNotesBtn }) {
    _dashboard = dashboard;
    _headerTitle = headerTitle;
    _clearNotesBtn = clearNotesBtn;

    _wireAutosizeOnInput();
};

/**
 * Renders the full UI from state with any stored widgets
 */
CommandDashboard.render.renderApp = function renderApp(state) {
    if (!_dashboard || !_headerTitle || !_clearNotesBtn) {
        throw new Error("CommandDashboard.render.init(...) was not called before renderApp().");
    }

    _headerTitle.textContent = state.title ?? "Name your Dashboard:";
    _dashboard.innerHTML = "";

    const hasWidgets = state.widgets?.length > 0 ?? false;
    _clearNotesBtn.disabled = !hasWidgets;

    const widgets = state.widgets ?? [];
    if (widgets.length === 0) {
        _dashboard.appendChild(_createEmptyMessage());
        return;
    }

    for (const widget of widgets) {
        const widgetElement = CommandDashboard.widgets.renderWidget(widget);
        if (!widgetElement) continue;
    
        _dashboard.appendChild(widgetElement);
        const textarea = widgetElement.querySelector?.("textarea.note-text");

        if (textarea) _autosizeTextarea(textarea);
    }
};

CommandDashboard.render.autosizeTextarea = _autosizeTextarea;

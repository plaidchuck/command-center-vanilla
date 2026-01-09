"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.widgets = CommandDashboard.widgets ?? {};
CommandDashboard.widgets.chrome = CommandDashboard.widgets.chrome ?? {};
console.log("Widget chrome loaded");

/**
 * Creates the chrome header for a widget.
 * @param {Widget} widget
 * @returns {HTMLDivElement}
 */
function _createHeader(widget) {
    const header = document.createElement("div");
    header.className = "widget-header";

    // Title render only, wiring later with implementation
    const title = document.createElement("div");
    title.className = "widget-title";
    title.contentEditable = "true";
    title.setAttribute("data-placeholder", "Untitled");
    title.setAttribute("spellcheck", "false");
    title.dataset.widgetId = widget.id;
    title.dataset.action = "widget-title";
    title.textContent = CommandDashboard.widgets.meta?.getTitle
        ? CommandDashboard.widgets.meta.getTitle(widget)
        : "";
    
    // pin/un pin rendering and wiring
    const pinned = CommandDashboard.widgets.meta?.getPinned
        ? CommandDashboard.widgets.meta.getPinned(widget)
        : false;
    
    const pinBtn = document.createElement("button");
    pinBtn.className = "widget-pin"
    pinBtn.type = "button";
    pinBtn.textContent = pinned ? "📍" : "📌";
    pinBtn.title = pinned ? "Unpin" : "Pin";
    pinBtn.dataset.widgetId = widget.id;
    pinBtn.dataset.action = "widget-pin-toggle";

    // Delete rendering and wiring
    const delBtn = document.createElement("button");
    delBtn.className = "widget-delete";
    delBtn.type = "button";
    delBtn.textContent = "✕";
    delBtn.title = "Delete";
    delBtn.dataset.widgetId = widget.id;
    delBtn.dataset.action = "widget-delete";

    header.appendChild(title);
    header.appendChild(pinBtn);
    header.appendChild(delBtn);

    return header;
}

/**
 * Creates chrome wrapper elements for a widget.
 * @param {Widget} widget
 * @returns {{outer: HTMLDivElement, body: HTMLDivElement}}
 */
CommandDashboard.widgets.chrome.create = function createWidgetChrome(widget) {
    const outer = document.createElement("div");
    outer.className = "widget";
    outer.dataset.widgetId = widget.id;
    outer.dataset.widgetType = widget.type;

    // Pin css hook
    const pinned = CommandDashboard.widgets.meta?.getPinned
        ? CommandDashboard.widgets.meta.getPinned(widget)
        : false;
    
    if (pinned) outer.classList.add("is-pinned");

    const header = _createHeader(widget);

    const body = document.createElement("div");
    body.className = "widget-body";

    outer.appendChild(header);
    outer.appendChild(body);

    return { outer, body };
};

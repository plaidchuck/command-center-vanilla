"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.widgets = CommandDashboard.widgets ?? {};
console.log("Widget registry loaded");

const _renderersByType = new Map();

/**
 * Register a widget type.
 * type: e.g. "note"
 * api: { render(widget) -> HTMLElement }
 * @type string, function
 */

CommandDashboard.widgets.register = function register(type, api) {
    if (!type || typeof type !== "string") throw new Error("register: type required");
    if (!api || typeof api.render !== "function") throw new Error(`register(${type}): api.render required`);
    _renderersByType.set(type, api);
};

CommandDashboard.widgets.renderWidget = function renderWidget(widget) {
    const type = widget?.type;
    const api = _renderersByType.get(type);
    if (!api) {
        console.warn("No widget registered for type:", type, widget);
        return null;
    }
    const content = api.render(widget);
    if (!content) return null;

    const chrome = CommandDashboard.widgets.chrome?.create;
    if (typeof chrome !== "function") return content;

    const { outer, body } = chrome(widget);
    if (body && content) body.appendChild(content);

    return outer ?? content;
}

CommandDashboard.widgets.get = function get(type) {
    return _renderersByType.get(type) ?? null;
};

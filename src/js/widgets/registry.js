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

    return api.render(widget);
}
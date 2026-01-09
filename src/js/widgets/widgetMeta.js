"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.widgets = CommandDashboard.widgets ?? {};
CommandDashboard.widgets.meta = CommandDashboard.widgets.meta ?? {};
console.log("Widget meta helpers loaded");

/**
 * Ensures the widget has a meta object.
 * @param {Widget} widget
 * @returns {WidgetMeta | null}
 */
function _ensureMeta(widget) {
    if (!widget || typeof widget !== "object") return null;
    if (!widget.meta || typeof widget.meta !== "object") widget.meta = {};
    return widget.meta;
}

/**
 * Gets the pinned state for a widget.
 * @param {Widget} widget
 * @returns {boolean}
 */
CommandDashboard.widgets.meta.getPinned = function getPinned(widget) {
    if (widget?.meta && Object.prototype.hasOwnProperty.call(widget.meta, "pinned")) {
        return !!widget.meta.pinned;
    }
    return !!widget?.data?.pinned;
};

/**
 * Sets the pinned state for a widget.
 * @param {Widget} widget
 * @param {boolean} pinned
 */
CommandDashboard.widgets.meta.setPinned = function setPinned(widget, pinned) {
    const meta = _ensureMeta(widget);
    if (!meta) return;
    meta.pinned = !!pinned;
};

/**
 * Returns the stored widget title.
 * @param {Widget} widget
 * @returns {string}
 */
CommandDashboard.widgets.meta.getTitle = function getTitle(widget) {
    if (widget?.meta && Object.prototype.hasOwnProperty.call(widget.meta, "title")) {
        return String(widget.meta.title ?? "");
    }
    return "";
};

/**
 * Sets the widget title, normalizing whitespace.
 * @param {Widget} widget
 * @param {string} title
 */
CommandDashboard.widgets.meta.setTitle = function setTitle(widget, title) {
    const meta = _ensureMeta(widget);
    if (!meta) return;
    const normalized = String(title ?? "").replace(/\s+/g, " ").trim();
    meta.title = normalized;
};

/**
 * Returns a valid ISO created-at timestamp if present.
 * @param {Widget} widget
 * @returns {string}
 */
CommandDashboard.widgets.meta.getCreatedAt = function getCreatedAt(widget) {
    const rawCreatedAt = widget?.meta?.createdAt;
    if (typeof rawCreatedAt !== "string") return "";

    const time = Date.parse(rawCreatedAt);
    if (Number.isNaN(time)) return "";

    return rawCreatedAt;
};

/**
 * Sets the widget created-at timestamp.
 * @param {Widget} widget
 * @param {string} isoString
 */
CommandDashboard.widgets.meta.setCreatedAt = function setCreatedAt(widget, isoString) {
    const meta = CommandDashboard.widgets.meta.ensureMeta(widget);
    if (!meta) return;

    if (typeof isoString !== "string") return;
    if (Number.isNaN(Date.parse(isoString))) return;

    meta.createdAt = isoString;
};

/**
 * Ensures the widget has a created-at timestamp.
 * @param {Widget} widget
 * @returns {string}
 */
CommandDashboard.widgets.meta.ensureCreatedAt = function ensureCreatedAt(widget) {
    const meta = CommandDashboard.widgets.meta.ensureMeta(widget);
    if (!meta) return "";

    const existing = CommandDashboard.widgets.meta.getCreatedAt(widget).trim();
    if (existing) return existing;

    const now = new Date().toISOString();
    meta.createdAt = now;
    return now;
};

CommandDashboard.widgets.meta.ensureMeta = _ensureMeta;

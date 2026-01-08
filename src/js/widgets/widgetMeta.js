"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.widgets = CommandDashboard.widgets ?? {};
CommandDashboard.widgets.meta = CommandDashboard.widgets.meta ?? {};
console.log("Widget meta helpers loaded");

function _ensureMeta(widget) {
    if (!widget || typeof widget !== "object") return null;
    if (!widget.meta || typeof widget.meta !== "object") widget.meta = {};
    return widget.meta;
}

CommandDashboard.widgets.meta.getPinned = function getPinned(widget) {
    if (widget?.meta && Object.prototype.hasOwnProperty.call(widget.meta, "pinned")) {
        return !!widget.meta.pinned;
    }
    return !!widget?.data?.pinned;
};

CommandDashboard.widgets.meta.setPinned = function setPinned(widget, pinned) {
    const meta = _ensureMeta(widget);
    if (!meta) return;
    meta.pinned = !!pinned;
};

CommandDashboard.widgets.meta.getTitle = function getTitle(widget) {
    if (widget?.meta && Object.prototype.hasOwnProperty.call(widget.meta, "title")) {
        return String(widget.meta.title ?? "");
    }
    return "";
};

CommandDashboard.widgets.meta.setTitle = function setTitle(widget, title) {
    const meta = _ensureMeta(widget);
    if (!meta) return;
    const normalized = String(title ?? "").replace(/\s+/g, " ").trim();
    meta.title = normalized;
};

CommandDashboard.widgets.meta.getCreatedAt = function getCreatedAt(widget) {
    const rawCreatedAt = widget?.meta?.createdAt;
    if (typeof rawCreatedAt !== "string") return "";

    const time = Date.parse(rawCreatedAt);
    if (Number.isNaN(time)) return "";

    return rawCreatedAt;
};

CommandDashboard.widgets.meta.setCreatedAt = function setCreatedAt(widget, isoString) {
    const meta = CommandDashboard.widgets.meta.ensureMeta(widget);
    if (!meta) return;

    if (typeof isoString !== "string") return;
    if (Number.isNaN(Date.parse(isoString))) return;

    meta.createdAt = isoString;
};

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

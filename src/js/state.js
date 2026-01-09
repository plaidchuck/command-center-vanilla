// state.js
/**
 * @typedef {Object} WidgetMeta
 * @property {boolean} [pinned]
 * @property {string} [title]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} Widget
 * @property {string} id
 * @property {string} type
 * @property {Record<string, unknown>} [data]
 * @property {WidgetMeta} [meta]
 */

/**
 * @typedef {Object} AppState
 * @property {string} title
 * @property {number} schemaVersion
 * @property {Widget[]} widgets
 */

/** @type {AppState} */
window.appState = window.appState ?? {
    title: "Name your Dashboard:",
    schemaVersion: 1,
    widgets: []
};

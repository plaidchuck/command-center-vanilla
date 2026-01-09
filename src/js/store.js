"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.store = CommandDashboard.store ?? {};
console.log("controller store functionality loaded");


let _load = null;
let _save = null;
let _render = null;

let _saveTimerId = null;

/**
 * Initializes the store with persistence and render handlers.
 * @param {{load: () => AppState | null, save: (state: AppState) => void, render: (state: AppState) => void}} params
 */
CommandDashboard.store.init = function initStore({load, save, render}) {
    _load = load;
    _save = save;
    _render = render;
};

/**
 * Loads persisted state into memory and normalizes widget metadata.
 * @returns {boolean}
 */
CommandDashboard.store.hydrateFromStorage = function hydrateFromStorage() {
    if (typeof _load !== "function" || typeof _save !== "function" || typeof _render !== "function") {
        throw new Error("store.init(...) not called");
    }

    const loadedStorage = _load();
    if (!CommandDashboard.store.isValidState(loadedStorage)) return false;

    window.appState = loadedStorage;

    let didMutate = false;

    for (const widget of window.appState.widgets) {
        CommandDashboard.widgets.meta.ensureMeta(widget);
        CommandDashboard.widgets.meta.ensureCreatedAt(widget);

        if (widget?.data && Object.prototype.hasOwnProperty.call(widget.data, "pinned")) {
            CommandDashboard.widgets.meta.setPinned(widget, !!widget.data.pinned);
            delete widget.data.pinned;
            didMutate = true;
    }
  }

    if (didMutate) _save(window.appState);

    return true;
};

/**
 * Returns the current app state reference.
 * @returns {AppState}
 */
CommandDashboard.store.getState = function getState() {
    return window.appState;
};

/**
 * Saves the current app state immediately.
 */
CommandDashboard.store.saveNow = function saveNow() {
    _save(window.appState);
};

/**
 * Applies a mutation and persists + re-renders.
 * @param {(state: AppState) => void} mutatorFn
 */
CommandDashboard.store.apply = function apply(mutatorFn) {
    if (typeof mutatorFn !== "function") {
        throw new Error("mutatorFn must be a function");
    }
    
    mutatorFn(window.appState);
    _save(window.appState);
    _render(window.appState);
};

/**
 * Replaces state with a new, validated state.
 * @param {AppState} newState
 */
CommandDashboard.store.replace = function replace(newState) {
    if (!CommandDashboard.store.isValidState(newState)) {
        throw new Error("INVALID_STATE");
    }

    window.appState = newState;
    _save(window.appState);
    _render(window.appState);
};

/**
 * Schedules a debounced save.
 * @param {number} [delayMs=250]
 */
CommandDashboard.store.scheduleSave = function scheduleSave(delayMs = 250) {
    if (typeof _save !== "function") throw new Error("store.init(...) not called");

    if (_saveTimerId !== null) clearTimeout(_saveTimerId);
    _saveTimerId = setTimeout(() => {
        _save(window.appState);
        _saveTimerId = null;
    }, delayMs);
};

/**
 * Validates the state shape.
 * @param {unknown} state
 * @returns {state is AppState}
 */
CommandDashboard.store.isValidState = function isValidState(state) {
    if (!state || typeof state !== "object") return false;
    if (typeof state.schemaVersion !== "number") return false;
    if (typeof state.title !== "string") return false;
    if (!Array.isArray(state.widgets)) return false;
    return true;
};

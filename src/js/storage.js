// storage.js
const STORAGE_KEY = "command-dashboard-state";

function loadState() {
    const serializedSavedState = localStorage.getItem(STORAGE_KEY);
    if (serializedSavedState === null) {
        return null;
    }

    try {
        const savedState = JSON.parse(serializedSavedState);
        return savedState;

    } catch (e) {
        console.warn(e);
        console.warn("Saved state not serialized to valid JSON object");
        return null;
    }
}

function saveState(state) {
    const savedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, savedState);
}

// state.js
window.appState = {
    title: "Command Dashboard",
    schemaVersion: 1,
    widgets: []
};

window.createNoteWidget = function () {
    const newId = "w_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6);
    const newType = "note";
    const newText= "";
    return {
        id: newId,
        type: newType,
        data: {
            text: newText
        }
    }
}
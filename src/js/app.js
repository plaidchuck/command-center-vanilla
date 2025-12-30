// app.js
window.CommandDashboard = window.CommandDashboard ?? {};
console.log("app.js booting…");

if (!CommandDashboard.dom) throw new Error("CommandDashboard.dom not loaded. Check script order / namespace name.");
if (!CommandDashboard.storage) throw new Error("Persistence storage not loaded");
if (!CommandDashboard.controllers) throw new Error("controllers not loaded");
if (!CommandDashboard.handlers) throw new Error("handlers not loaded");
if (!CommandDashboard.render) throw new Error("render not loaded");
if (!CommandDashboard.io) throw new Error("i/o not loaded");
if (!CommandDashboard.toast) throw new Error("toast not loaded");
if (!CommandDashboard.store) throw new Error("store not loaded");

const ui = {
    dashboard: CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("dashboard"), HTMLElement, "#dashboard"),
    addNoteBtn: CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("addNoteBtn"), HTMLButtonElement, "#addNoteBtn"),
    headerTitle: CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("headerTitle"), HTMLElement, "#headerTitle"),
    clearNotesBtn: CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("clearNotesBtn"), HTMLButtonElement, "#clearNotesBtn"),
    exportBtn: CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("exportBtn"), HTMLButtonElement, "#exportBtn"),
    importBtn: CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("importBtn"), HTMLButtonElement, "#importBtn"),
    importFileInput: CommandDashboard.io.getImportInput()
}

// Load render.js with main non widget elements

CommandDashboard.render.init({
    dashboard,
    headerTitle,
    clearNotesBtn
});

// Inject store with persistence load, save and render functionality

CommandDashboard.store.init({
    load: CommandDashboard.storage.loadState,
    save: CommandDashboard.storage.saveState,
    render: CommandDashboard.render.renderApp
});

CommandDashboard.store.hydrateFromStorage();

// Listeners
CommandDashboard.events.bind(ui);

CommandDashboard.render.renderApp(window.appState);
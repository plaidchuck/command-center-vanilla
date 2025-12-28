// app.js
window.CommandDashboard = window.CommandDashboard ?? {};
console.log("app.js booting…");

if (!CommandDashboard.dom) throw new Error("CommandDashboard.dom not loaded. Check script order / namespace name.");
if (!CommandDashboard.storage) throw new Error("Persistence storage not loaded");
if (!CommandDashboard.controllers) throw new Error("controllers not loaded");
if (!CommandDashboard.handlers) throw new ("handlers not loaded");
if (!CommandDashboard.render) throw new Error("render not loaded");
if (!CommandDashboard.io) throw new Error("i/o not loaded");
if (!CommandDashboard.toast) throw new Error("toast not loaded");
if (!CommandDashboard.store) throw new Error("store not loaded");

const dashboard = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("dashboard"), HTMLElement, "#dashboard");
const addNoteBtn = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("addNoteBtn"), HTMLButtonElement, "#addNoteBtn");
const headerTitle = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("headerTitle"), HTMLElement, "#headerTitle");
const clearNotesBtn = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("clearNotesBtn"), HTMLButtonElement, "#clearNotesBtn");
const exportBtn = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("exportBtn"), HTMLButtonElement, "#exportBtn");
const importBtn = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("importBtn"), HTMLButtonElement, "#importBtn");
const importFileInput = CommandDashboard.io.getImportInput();

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
// Export to JSON button listener
exportBtn.addEventListener("click", CommandDashboard.controllers.onExportClick);

// Import button listener
importBtn.addEventListener("click", CommandDashboard.controllers.onImportClick);

// File input listener
importFileInput.addEventListener("change", CommandDashboard.controllers.onImportFileChange);

// Adds new note widget to dashboard and state
addNoteBtn.addEventListener("click", CommandDashboard.controllers.onAddNote);

// Dispatch for any click button actions within dashboard(currently delete widget/pin widget)
dashboard.addEventListener("click", CommandDashboard.controllers.onDashboardClick);

// Deletes all widgets
clearNotesBtn.addEventListener("click", CommandDashboard.controllers.onClearNotes);

// Debounce saving of note widget text
dashboard.addEventListener("input", CommandDashboard.controllers.onDashboardInput);

// Change title or use default
headerTitle.addEventListener("input", CommandDashboard.controllers.onTitleInput);

// Prevent new line on title
headerTitle.addEventListener("keydown", CommandDashboard.controllers.onTitleKeyDown);

CommandDashboard.render.renderApp(window.appState);
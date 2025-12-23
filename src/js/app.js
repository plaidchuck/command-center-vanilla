// app.js
window.CommandDashboard = window.CommandDashboard ?? {};
console.log("app.js booting…");

if (!window.CommandDashboard?.dom) {
  throw new Error("CommandDashboard.dom not loaded. Check script order / namespace name.");
}

// Load static elements for the page(and also import file input to persist through for async reasons)
const dashboard = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("dashboard"), HTMLElement, "#dashboard");
const addNoteBtn = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("addNoteBtn"), HTMLButtonElement, "#addNoteBtn");
const headerTitle = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("headerTitle"), HTMLElement, "#headerTitle");
const clearNotesBtn = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("clearNotesBtn"), HTMLButtonElement, "#clearNotesBtn");
const exportBtn = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("exportBtn"), HTMLButtonElement, "#exportBtn");
const importBtn = CommandDashboard.dom.mustBe(CommandDashboard.dom.mustGetElementById("importBtn"), HTMLButtonElement, "#importBtn");
const importFileInput = CommandDashboard.io.getImportInput();

const sessionState = loadState();
if (sessionState && typeof sessionState === "object" && Array.isArray(sessionState.widgets)) {
    window.appState = sessionState;
    console.log("Initial state loaded successfully");
}

// Load render.js with main non widget elements

CommandDashboard.render.init({
    dashboard,
    headerTitle,
    clearNotesBtn
})

// Listeners
// Export to JSON button listener
exportBtn.addEventListener("click", CommandDashboard.controllers.onExportClick);

// Import button listener
importBtn.addEventListener("click", CommandDashboard.controllers.onImportClick);

// File input listener
importFileInput.addEventListener("change", CommandDashboard.controllers.onImportFileChange);

// Adds new note widget to dashboard and state
addNoteBtn.addEventListener("click", CommandDashboard.controllers.onAddNote);

// Deletes widgets
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
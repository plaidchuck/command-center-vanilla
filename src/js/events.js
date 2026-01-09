"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.events = CommandDashboard.events ?? {};
console.log("Loaded event listeners");

/**
 * Binds DOM event handlers for the dashboard UI.
 * @param {{dashboard: HTMLElement, addNoteBtn: HTMLButtonElement, headerTitle: HTMLElement, clearNotesBtn: HTMLButtonElement, exportBtn: HTMLButtonElement, importBtn: HTMLButtonElement, importFileInput: HTMLInputElement}} ui
 */
CommandDashboard.events.bind = function bindEvents(ui) {
    const controllers = CommandDashboard.controllers;

    ui.exportBtn.addEventListener("click", controllers.onExportClick);
    ui.importBtn.addEventListener("click", controllers.onImportClick);
    ui.importFileInput.addEventListener("change", controllers.onImportFileChange);

    ui.addNoteBtn.addEventListener("click", controllers.onAddNote);

    ui.dashboard.addEventListener("click", controllers.onDashboardClick);
    ui.dashboard.addEventListener("input", controllers.onDashboardInput);
    ui.dashboard.addEventListener("keydown", controllers.onWidgetTitleKeyDown);
    ui.dashboard.addEventListener("focusout", controllers.onWidgetTitleFocusOut);

    ui.clearNotesBtn.addEventListener("click", controllers.onClearNotes);

    ui.headerTitle.addEventListener("input", controllers.onTitleInput);
    ui.headerTitle.addEventListener("keydown", controllers.onTitleKeyDown);
};

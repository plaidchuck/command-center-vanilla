"use strict";
window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.io = CommandDashboard.io ?? {};
console.log("Widget I/O loaded");

// Helpers

CommandDashboard.io._createTimestamp = function createTimestamp() {
    const currentDateTime = new Date();
    return ( currentDateTime.getFullYear() + "-" +
        String(currentDateTime.getMonth() + 1).padStart(2, "0") + "-" +
        String(currentDateTime.getDate()).padStart(2, "0") + "_" +
        String(currentDateTime.getHours()).padStart(2, "0") + "-" +
        String(currentDateTime.getMinutes()).padStart(2, "0") + "-" +
        String(currentDateTime.getSeconds()).padStart(2, "0")
    );
}

CommandDashboard.io.exportStateToJson = function exportStateToJson(state, filenamePrefix = "command-dashboard") {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    
    const anchorElement = document.createElement("a");
    anchorElement.href = url;
    
    const timestamp = CommandDashboard.io._createTimestamp();
    anchorElement.download = `${filenamePrefix}-${timestamp}.json`;
    
    document.body.appendChild(anchorElement);
    anchorElement.click();
    anchorElement.remove();
    
    setTimeout(() => URL.revokeObjectURL(url), 0);
    
    return anchorElement.download;
};

CommandDashboard.io.getImportInput = function getImportInput() {
    if (CommandDashboard.io._importFileInput) return CommandDashboard.io._importFileInput;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.style.display = "none";
    document.body.appendChild(input);

    CommandDashboard.io._importFileInput = input;
    return input;
};

CommandDashboard.io.openImportPicker = function openImportPicker() {
    const importFileInput = CommandDashboard.io.getImportInput();
    importFileInput.value = "";
    importFileInput.click();
}
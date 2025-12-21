window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.io = CommandDashboard.io ?? {};

CommandDashboard.io.createTimestamp = function createTimestamp() {
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
    try {
            const json = JSON.stringify(state, null, 2);
            const blob = new Blob([json], {type: "application/json"});
            const url = URL.createObjectURL(blob);
    
            const anchorElement = document.createElement("a");
            anchorElement.href = url;
    
            const timestamp = CommandDashboard.io.createTimestamp();
            anchorElement.download = `${filenamePrefix}-${timestamp}.json`;
    
            document.body.appendChild(anchorElement);
            anchorElement.click();
            anchorElement.remove();
    
            setTimeout(() => URL.revokeObjectURL(url), 0);
    
            return anchorElement.download;
    
    } catch (error) {
        console.log(error);
        throw new Error("EXPORT_FAILED");
}};
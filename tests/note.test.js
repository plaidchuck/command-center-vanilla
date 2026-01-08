"use strict";

const assert = require("assert");

global.window = globalThis;
global.window.CommandDashboard = global.window.CommandDashboard ?? {};
global.window.CommandDashboard.widgets = global.window.CommandDashboard.widgets ?? {};
global.window.CommandDashboard.widgets.chrome = null;

global.requestAnimationFrame = (callback) => callback();

let focusedElement = null;
global.document = {
    createElement: (tag) => {
        if (tag !== "textarea") {
            throw new Error(`Unsupported element: ${tag}`);
        }
        return {
            className: "",
            value: "",
            placeholder: "",
            dataset: {},
            scrollHeight: 120,
            style: {},
            focus: () => {
                focusedElement = tag;
            }
        };
    },
    querySelector: (selector) => {
        if (selector === 'textarea.note-text[data-widget-id="w1"]') {
            return {
                focus: () => {
                    focusedElement = "found";
                }
            };
        }
        return null;
    }
};

require("../src/js/widgets/registry.js");
require("../src/js/widgets/note.js");

function testAutosizeHelper() {
    const textarea = {
        style: {},
        scrollHeight: 240
    };
    CommandDashboard.widgets.note.autosizeTextarea(textarea);
    assert.strictEqual(textarea.style.height, "240px");
}

function testFocusHelper() {
    focusedElement = null;
    CommandDashboard.widgets.note.focusNote("w1");
    assert.strictEqual(focusedElement, "found");
}

function testRenderAutosize() {
    const noteApi = CommandDashboard.widgets.get("note");
    const widget = { id: "w2", data: { text: "Hello" } };
    const textarea = noteApi.render(widget);
    assert.strictEqual(textarea.style.height, "120px");
    assert.strictEqual(textarea.value, "Hello");
    assert.strictEqual(textarea.dataset.widgetId, "w2");
}

function run() {
    const tests = [
        testAutosizeHelper,
        testFocusHelper,
        testRenderAutosize
    ];

    for (const test of tests) {
        test();
    }

    console.log(`Ran ${tests.length} note widget tests.`);
}

run();

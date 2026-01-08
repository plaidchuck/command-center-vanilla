"use strict";

const assert = require("assert");

global.window = globalThis;

global.window.CommandDashboard = global.window.CommandDashboard ?? {};

global.window.CommandDashboard.widgets = global.window.CommandDashboard.widgets ?? {};

global.window.CommandDashboard.widgets.chrome = null;

require("../src/js/widgets/widgetMeta.js");
require("../src/js/widgets/registry.js");

function testTitleNormalization() {
    const widget = { meta: {} };
    CommandDashboard.widgets.meta.setTitle(widget, "  Hello   world  ");
    assert.strictEqual(widget.meta.title, "Hello world");
}

function testRenderWithoutChrome() {
    const widget = { id: "w1", type: "plain" };
    const content = { nodeType: "content" };
    CommandDashboard.widgets.register("plain", {
        render: () => content
    });

    const rendered = CommandDashboard.widgets.renderWidget(widget);
    assert.strictEqual(rendered, content);
}

function testRenderWithChrome() {
    let appended = null;
    CommandDashboard.widgets.chrome = {
        create: () => ({
            outer: { nodeType: "outer" },
            body: {
                appendChild: (child) => {
                    appended = child;
                }
            }
        })
    };

    const widget = { id: "w2", type: "wrapped" };
    const content = { nodeType: "content" };

    CommandDashboard.widgets.register("wrapped", {
        render: () => content
    });

    const rendered = CommandDashboard.widgets.renderWidget(widget);
    assert.strictEqual(rendered.nodeType, "outer");
    assert.strictEqual(appended, content);
}

function run() {
    const tests = [
        testTitleNormalization,
        testRenderWithoutChrome,
        testRenderWithChrome
    ];

    for (const test of tests) {
        test();
    }

    console.log(`Ran ${tests.length} basic widget tests.`);
}

run();

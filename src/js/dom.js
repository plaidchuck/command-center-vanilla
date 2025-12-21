window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.dom = CommandDashboard.dom ?? {};

CommandDashboard.dom = (function () {
    function mustGetElementById(id) {
        const el = document.getElementById(id);
        if (!el) throw new Error(`Missing required element: #${id}`);
        return el;
    }

    function mustBe(el, ctor, name) {
        if (!(el instanceof ctor)) throw new Error(`${name} is not a ${ctor.name}`);
        return el;
    }

    return {
        mustGetElementById,
        mustBe
    };
})();
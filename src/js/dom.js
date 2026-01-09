window.CommandDashboard = window.CommandDashboard ?? {};
CommandDashboard.dom = CommandDashboard.dom ?? {};
console.log("DOM guards loaded");

CommandDashboard.dom = (function () {
    /**
     * Fetches a required element by ID.
     * @param {string} id
     * @returns {HTMLElement}
     */
    function mustGetElementById(id) {
        const el = document.getElementById(id);
        if (!el) throw new Error(`Missing required element: #${id}`);
        return el;
    }

    /**
     * Ensures a value is an instance of the expected constructor.
     * @template T
     * @param {unknown} el
     * @param {new (...args: any[]) => T} ctor
     * @param {string} name
     * @returns {T}
     */
    function mustBe(el, ctor, name) {
        if (!(el instanceof ctor)) throw new Error(`${name} is not a ${ctor.name}`);
        return el;
    }

    return {
        mustGetElementById,
        mustBe
    };
})();

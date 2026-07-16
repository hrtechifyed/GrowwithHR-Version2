/* GrowWithHR build marker and opt-in diagnostics */
(() => {
    "use strict";

    const BUILD_ID = "responsive-repair-20260716-0000";
    const params = new URLSearchParams(window.location.search);
    const debug = params.get("debug") === "1";

    window.GWHR_BUILD_ID = BUILD_ID;
    window.GWHR_DEBUG = debug;
    window.GWHR_LOG = (prefix, payload) => {
        if (!debug && prefix !== "[GrowWithHR:BUILD]") return;
        console.info(prefix, payload);
    };

    const logBuild = () => window.GWHR_LOG("[GrowWithHR:BUILD]", {
        buildId: BUILD_ID,
        page: window.location.pathname,
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio
        },
        loadedAt: new Date().toISOString()
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", logBuild, { once: true });
    } else {
        logBuild();
    }
})();

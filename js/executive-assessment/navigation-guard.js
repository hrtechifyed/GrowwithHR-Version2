/* ==========================================================
   GrowWithHR
   Executive assessment navigation resilience

   Prevents repeated Continue activation from validating a newly rendered
   scene before the user has interacted with it. Mouse and touch activation are
   blocked at the Continue click boundary, while keyboard and programmatic
   submission are protected at the form boundary.
========================================================== */

(() => {
    "use strict";

    const FALLBACK_UNLOCK_MS = 1000;
    const INSTALL_RETRY_MS = 50;
    const MAX_INSTALL_ATTEMPTS = 100;
    let installed = false;
    let installAttempts = 0;

    function setButtonBusy(button, busy) {
        if (!button) {
            return;
        }

        if (busy) {
            button.setAttribute(
                "aria-busy",
                "true"
            );
            button.dataset.navigationBusy =
                "true";
        } else {
            button.removeAttribute(
                "aria-busy"
            );
            delete button.dataset
                .navigationBusy;
        }
    }

    function install(application) {
        const form =
            application?.elements?.storyForm ||
            document.getElementById(
                "storyForm"
            );

        if (
            installed ||
            !application ||
            !application.__modularFacadeInstalled ||
            !form
        ) {
            return false;
        }

        const shell =
            application?.elements?.shell ||
            document.getElementById(
                "assessmentShell"
            );
        const storyContainer =
            application?.elements?.storyContainer ||
            document.getElementById(
                "storyContainer"
            );
        const backButton =
            application?.elements?.backButton ||
            document.getElementById(
                "backButton"
            );

        let navigationLocked = false;
        let allowSubmitFromCurrentClick = false;
        let releaseTimer = 0;
        let activeButton = null;

        const release = () => {
            window.clearTimeout(
                releaseTimer
            );
            releaseTimer = 0;
            navigationLocked = false;
            allowSubmitFromCurrentClick = false;
            setButtonBusy(
                activeButton ||
                application?.elements?.nextButton ||
                document.getElementById(
                    "nextButton"
                ),
                false
            );
            activeButton = null;
        };

        const lock = (button) => {
            navigationLocked = true;
            activeButton =
                button ||
                application?.elements?.nextButton ||
                document.getElementById(
                    "nextButton"
                );
            setButtonBusy(
                activeButton,
                true
            );

            window.clearTimeout(
                releaseTimer
            );
            releaseTimer =
                window.setTimeout(
                    release,
                    FALLBACK_UNLOCK_MS
                );
        };

        const releaseFromCurrentScene = (event) => {
            const target = event.target;

            if (
                !navigationLocked ||
                !storyContainer ||
                !(target instanceof Node) ||
                !target.isConnected ||
                !storyContainer.contains(target)
            ) {
                return;
            }

            release();
        };

        document.addEventListener(
            "click",
            (event) => {
                const target = event.target;
                const button =
                    target instanceof Element
                        ? target.closest(
                            "#nextButton"
                        )
                        : null;

                if (!button) {
                    return;
                }

                if (navigationLocked) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return;
                }

                allowSubmitFromCurrentClick =
                    true;
                lock(button);
            },
            true
        );

        document.addEventListener(
            "submit",
            (event) => {
                if (event.target !== form) {
                    return;
                }

                if (
                    allowSubmitFromCurrentClick
                ) {
                    allowSubmitFromCurrentClick =
                        false;
                    return;
                }

                if (navigationLocked) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    return;
                }

                lock(
                    event.submitter
                );
            },
            true
        );

        [
            "focusin",
            "input",
            "change",
            "pointerdown"
        ].forEach((eventName) => {
            storyContainer
                ?.addEventListener(
                    eventName,
                    releaseFromCurrentScene,
                    true
                );
        });

        backButton
            ?.addEventListener(
                "click",
                release,
                true
            );

        installed = true;

        if (shell) {
            shell.dataset.navigationGuard =
                "ready";
        }

        return true;
    }

    function installCurrentApplication() {
        if (
            install(
                window.executiveAssessment
            ) ||
            installed
        ) {
            return true;
        }

        installAttempts += 1;

        if (
            installAttempts <
            MAX_INSTALL_ATTEMPTS
        ) {
            window.setTimeout(
                installCurrentApplication,
                INSTALL_RETRY_MS
            );
        }

        return false;
    }

    window.addEventListener(
        "growwithhr:assessment-modules-ready",
        (event) => {
            install(
                event?.detail?.application ||
                window.executiveAssessment
            );
        },
        { once: true }
    );

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            installCurrentApplication,
            { once: true }
        );
    } else {
        installCurrentApplication();
    }
})();
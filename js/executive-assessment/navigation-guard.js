/* ==========================================================
   GrowWithHR
   Executive assessment navigation resilience

   Prevents rapid repeated Continue activation from submitting the newly
   rendered scene before the user has answered it. It also makes unexpected
   navigation exceptions visible and recoverable instead of leaving the
   assessment apparently unresponsive.
========================================================== */

(() => {
    "use strict";

    const LOCK_DURATION_MS = 450;
    let installed = false;

    function setButtonBusy(button, busy) {
        if (!button) {
            return;
        }

        button.disabled = busy;

        if (busy) {
            button.setAttribute(
                "aria-busy",
                "true"
            );
        } else {
            button.removeAttribute(
                "aria-busy"
            );
        }
    }

    function showRecoverableError(application) {
        const message =
            "We couldn’t move to the next scene. Your answers are still here—please try Continue again.";
        const footer =
            application?.elements?.footerMessage ||
            document.getElementById(
                "footerMessage"
            );
        const assertive =
            application?.elements?.assertiveRegion ||
            document.getElementById(
                "assertiveRegion"
            );

        if (footer) {
            footer.textContent = message;
        }

        if (assertive) {
            assertive.textContent = "";

            window.requestAnimationFrame(() => {
                assertive.textContent = message;
            });
        }
    }

    function install(application) {
        if (
            installed ||
            !application ||
            typeof application.continueFromMoment !==
                "function"
        ) {
            return false;
        }

        const originalContinue =
            application
                .continueFromMoment
                .bind(application);
        let navigationLocked = false;
        let releaseTimer = 0;

        application.continueFromMoment =
            function guardedContinueFromMoment(
                ...args
            ) {
                if (navigationLocked) {
                    return false;
                }

                navigationLocked = true;

                const nextButton =
                    this?.elements?.nextButton ||
                    document.getElementById(
                        "nextButton"
                    );

                window.clearTimeout(
                    releaseTimer
                );
                setButtonBusy(
                    nextButton,
                    true
                );

                try {
                    return originalContinue(
                        ...args
                    );
                } catch (error) {
                    console.error(
                        "GrowWithHR: assessment scene navigation failed.",
                        error
                    );
                    showRecoverableError(
                        this
                    );
                    return false;
                } finally {
                    releaseTimer =
                        window.setTimeout(
                            () => {
                                navigationLocked =
                                    false;
                                setButtonBusy(
                                    nextButton,
                                    false
                                );
                            },
                            LOCK_DURATION_MS
                        );
                }
            };

        installed = true;

        const shell =
            application?.elements?.shell ||
            document.getElementById(
                "assessmentShell"
            );

        if (shell) {
            shell.dataset.navigationGuard =
                "ready";
        }

        return true;
    }

    function installCurrentApplication() {
        return install(
            window.executiveAssessment
        );
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

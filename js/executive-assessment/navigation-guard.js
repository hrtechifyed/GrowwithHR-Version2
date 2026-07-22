/* ==========================================================
   GrowWithHR
   Executive assessment navigation resilience

   Prevents repeated Continue activation from validating a newly rendered
   scene before the user has interacted with it. The guard wraps the assessment
   controller method so mouse, touch, keyboard and programmatic submissions all
   follow the same transition lock.
========================================================== */

(() => {
    "use strict";

    const FALLBACK_UNLOCK_MS = 1500;
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
            !application.__modularFacadeInstalled ||
            typeof application.continueFromMoment !==
                "function"
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
        const originalContinue =
            application
                .continueFromMoment
                .bind(application);

        let navigationLocked = false;
        let releaseTimer = 0;
        let activeButton = null;

        const release = () => {
            window.clearTimeout(
                releaseTimer
            );
            releaseTimer = 0;
            navigationLocked = false;
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

        const scheduleFallbackRelease = () => {
            window.clearTimeout(
                releaseTimer
            );
            releaseTimer =
                window.setTimeout(
                    release,
                    FALLBACK_UNLOCK_MS
                );
        };

        application.continueFromMoment =
            function guardedContinueFromMoment(
                ...args
            ) {
                if (navigationLocked) {
                    return false;
                }

                const beforeMoment =
                    this.currentMoment;
                const beforeScreen =
                    shell?.dataset?.screen ||
                    "";

                navigationLocked = true;
                activeButton =
                    this?.elements?.nextButton ||
                    document.getElementById(
                        "nextButton"
                    );
                setButtonBusy(
                    activeButton,
                    true
                );

                try {
                    const result =
                        originalContinue(
                            ...args
                        );
                    const afterMoment =
                        this.currentMoment;
                    const afterScreen =
                        shell?.dataset?.screen ||
                        "";
                    const advanced =
                        afterMoment !==
                            beforeMoment ||
                        afterScreen !==
                            beforeScreen;

                    if (
                        !advanced ||
                        afterScreen !==
                            "workspace"
                    ) {
                        release();
                    } else {
                        scheduleFallbackRelease();
                    }

                    return result;
                } catch (error) {
                    release();
                    console.error(
                        "GrowWithHR: assessment scene navigation failed.",
                        error
                    );
                    showRecoverableError(
                        this
                    );
                    return false;
                }
            };

        [
            "focusin",
            "input",
            "change",
            "pointerdown"
        ].forEach((eventName) => {
            storyContainer
                ?.addEventListener(
                    eventName,
                    release,
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
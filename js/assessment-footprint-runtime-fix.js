/* ==========================================================
   GrowWithHR assessment footprint runtime compatibility
   - Keeps the legacy #primaryState selector while supporting 1-3 states
   - Corrects empty-state defaults before the existing compatibility layer runs
   - Preserves semicolon-separated state coverage and Pan India
========================================================== */
(() => {
    "use strict";

    const MAX_STATES = 3;
    const PAN_INDIA_VALUE = "pan-india";
    const PAN_INDIA_LABEL = "Pan India";
    const MARKER = "footprintRuntimeFix";

    function cleanText(value) {
        return String(value ?? "").trim();
    }

    function uniqueStates(value) {
        const values = Array.isArray(value)
            ? value
            : cleanText(value).split(/[;,|]/);
        const seen = new Set();
        return values
            .map((state) => cleanText(state).replace(/[;,\s]+$/g, ""))
            .filter((state) => state && !/^\d+$/.test(state))
            .filter((state) => {
                const key = state.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    }

    function application() {
        return window.executiveAssessment || null;
    }

    function setAnswer(name, value) {
        const assessment = application();
        if (assessment?.stateModel?.setAnswer) {
            assessment.stateModel.setAnswer(name, value);
            return;
        }
        if (assessment?.answers) assessment.answers[name] = value;
    }

    function answerStates(answers = {}) {
        const explicit = uniqueStates(answers.operatingStates);
        if (explicit.length) return explicit;

        const indexed = uniqueStates([
            answers.operatingState1,
            answers.operatingState2,
            answers.operatingState3
        ]);
        if (indexed.length) return indexed;

        const primary = cleanText(answers.primaryState);
        if (!primary || primary.toLowerCase() === PAN_INDIA_LABEL.toLowerCase()) {
            return [];
        }
        return uniqueStates(primary);
    }

    function ensurePrimaryStateAlias() {
        let visible = document.getElementById("primaryState");
        let mirror = document.getElementById("operatingState1");

        if (!visible && mirror && mirror.type !== "hidden") {
            visible = mirror;
            visible.id = "primaryState";
            visible.name = "operatingState1";

            const wrapper = visible.closest('[data-field-wrapper="operatingState1"]');
            const label = wrapper?.querySelector('label[for="operatingState1"]');
            if (label) label.htmlFor = "primaryState";

            mirror = document.createElement("input");
            mirror.type = "hidden";
            mirror.id = "operatingState1";
            mirror.setAttribute("aria-hidden", "true");
            mirror.tabIndex = -1;
            visible.insertAdjacentElement("afterend", mirror);
        }

        return { visible, mirror };
    }

    function patchPriorityLimit() {
        const fieldset = document.querySelector('[data-field-wrapper="priorities"]');
        if (!fieldset) return;
        fieldset.dataset.maximum = "";
        fieldset.removeAttribute("data-maximum");

        const help = document.getElementById("prioritiesHelp");
        if (help) {
            help.textContent =
                "Choose every priority that applies, or select All of the above.";
        }
    }

    function patchOperatingFootprint() {
        const countWrapper = document.querySelector(
            '[data-field-wrapper="operatingStateCount"]'
        );
        if (!countWrapper) return;

        const assessment = application();
        const answers = assessment?.answers || {};
        const { visible: firstState, mirror } = ensurePrimaryStateAlias();
        if (!firstState) return;

        const stateInputs = [
            firstState,
            document.getElementById("operatingState2"),
            document.getElementById("operatingState3")
        ];
        const storedStates = answerStates(answers);
        const savedCount = cleanText(answers.operatingStateCount);
        const savedPanIndia =
            savedCount === PAN_INDIA_VALUE ||
            cleanText(answers.primaryState).toLowerCase() ===
                PAN_INDIA_LABEL.toLowerCase();

        let count = savedPanIndia
            ? PAN_INDIA_VALUE
            : ["1", "2", "3"].includes(savedCount)
                ? savedCount
                : storedStates.length > MAX_STATES
                    ? PAN_INDIA_VALUE
                    : String(Math.max(1, storedStates.length || 1));

        const currentValues = stateInputs.map((input) => cleanText(input?.value));
        const generatedPlaceholderValues = currentValues
            .filter(Boolean)
            .every((value) => /^\d+$/.test(value));

        if (generatedPlaceholderValues && !storedStates.length) {
            count = "1";
            stateInputs.forEach((input) => {
                if (input && /^\d+$/.test(cleanText(input.value))) input.value = "";
            });
        }

        const radio = countWrapper.querySelector(
            `input[name="operatingStateCount"][value="${count}"]`
        );
        if (radio) radio.checked = true;
        countWrapper
            .querySelectorAll('input[name="operatingStateCount"]')
            .forEach((control) => {
                if (control !== radio) control.checked = false;
            });

        const panIndia = count === PAN_INDIA_VALUE;
        const numericCount = panIndia ? 0 : Number(count);
        const selectedStates = [];

        stateInputs.forEach((input, index) => {
            const slotNumber = index + 1;
            const slot = document.querySelector(
                `[data-operating-state-slot="${slotNumber}"]`
            );
            const separator = document.querySelector(
                `[data-operating-state-separator="${slotNumber}"]`
            );
            const isVisible = !panIndia && slotNumber <= numericCount;

            if (slot) slot.hidden = !isVisible;
            if (separator) separator.hidden = !(isVisible && slotNumber < numericCount);
            if (!input) return;

            input.required = isVisible;
            if (isVisible && storedStates[index] && !cleanText(input.value)) {
                input.value = storedStates[index];
            }
            if (!isVisible) input.value = "";

            const state = isVisible ? cleanText(input.value) : "";
            if (state && !/^\d+$/.test(state)) selectedStates.push(state);
            setAnswer(`operatingState${slotNumber}`, state);
        });

        if (mirror) mirror.value = cleanText(firstState.value);

        const stateField = document.getElementById("operatingStatesField");
        if (stateField) stateField.hidden = panIndia;

        const normalizedStates = uniqueStates(selectedStates).slice(0, MAX_STATES);
        const stateCoverage = panIndia
            ? PAN_INDIA_LABEL
            : normalizedStates.join("; ");

        setAnswer("operatingStateCount", count);
        setAnswer("operatingStates", panIndia ? [] : normalizedStates);
        setAnswer("primaryState", stateCoverage);
        setAnswer("stateCoverage", stateCoverage);
    }

    function patchAssessment() {
        patchPriorityLimit();
        patchOperatingFootprint();
    }

    function install() {
        const story = document.getElementById("storyContainer");
        if (!story || story.dataset[MARKER]) return;
        story.dataset[MARKER] = "true";

        const observer = new MutationObserver(() => {
            patchAssessment();
        });
        observer.observe(story, { childList: true, subtree: true });

        document.addEventListener("input", (event) => {
            const target = event.target;
            if (
                target instanceof HTMLInputElement &&
                (
                    target.id === "primaryState" ||
                    /^operatingState[2-3]$/.test(target.id)
                )
            ) {
                const mirror = document.getElementById("operatingState1");
                if (target.id === "primaryState" && mirror) {
                    mirror.value = target.value;
                }
                queueMicrotask(patchOperatingFootprint);
            }
        }, true);

        document.addEventListener("change", (event) => {
            const target = event.target;
            if (
                target instanceof HTMLInputElement &&
                (
                    target.name === "operatingStateCount" ||
                    target.name === "priorities"
                )
            ) {
                queueMicrotask(patchAssessment);
            }
        }, true);

        patchAssessment();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", install, { once: true });
    } else {
        install();
    }

    window.addEventListener(
        "growwithhr:assessment-modules-ready",
        () => queueMicrotask(install),
        { once: true }
    );

    window.GrowWithHRFootprintRuntimeFix = Object.freeze({
        version: "1.0.0",
        install,
        patchAssessment
    });
})();

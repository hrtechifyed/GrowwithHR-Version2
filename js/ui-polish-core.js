/* ==========================================================
   GrowWithHR UI polish
   Progressive enhancement for shared UX and accessibility.
========================================================== */

const fileName = (window.location.pathname || "").split("/").filter(Boolean).pop() || "index.html";

function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text != null) element.textContent = text;
    return element;
}

function setupHomepage() {
    const heroActions = document.querySelector(".home-page .hero-actions");
    if (heroActions && !heroActions.querySelector('a[href*="intelligence-hub.html"]')) {
        const analyze = createElement("a", "primary-btn", "Analyze My Company");
        analyze.href = "intelligence-hub.html";
        heroActions.prepend(analyze);
    }

    const redirect = document.querySelector(".home-page .analyze-redirect-section .primary-btn");
    if (redirect) redirect.href = "intelligence-hub.html";

    document.querySelectorAll(".home-page .capability-slide h3").forEach((heading) => {
        if (heading.textContent.includes("Organization Intelligence (Planned)")) {
            heading.textContent = "Organization Intelligence (Available)";
        }
    });

    const workspaceHeader = document.querySelector(".home-page .workspace-header");
    if (workspaceHeader && !workspaceHeader.querySelector(".home-preview-label")) {
        workspaceHeader.append(createElement("span", "home-preview-label", "Interactive preview"));
    }

    const workspace = document.querySelector(".home-page .workspace-window");
    if (workspace) workspace.setAttribute("aria-label", "Interactive GrowWithHR advisory preview");

    const groups = [
        [".dna-item", "Company DNA"],
        [".stage-item", "Growth stage"],
        [".recommendation-item", "Recommendation basis"]
    ];

    groups.forEach(([selector, label]) => {
        const buttons = Array.from(document.querySelectorAll(`.home-page ${selector}`));
        if (!buttons.length) return;
        const parent = buttons[0].parentElement;
        parent?.setAttribute("role", "group");
        parent?.setAttribute("aria-label", label);
        buttons.forEach((button) => {
            button.type = "button";
            button.setAttribute("aria-pressed", String(button.classList.contains("active")));
            button.addEventListener("click", () => {
                window.requestAnimationFrame(() => {
                    buttons.forEach((item) => item.setAttribute("aria-pressed", String(item.classList.contains("active"))));
                });
            });
        });
    });

    const technicalIntro = document.querySelector(".compliance-engine-intro");
    if (technicalIntro) {
        technicalIntro.textContent = "GrowWithHR separates the compliance decision from supporting research and explanation, so you can see what was known, why a result appeared and what to review next.";
    }

    const differenceHeading = document.querySelector(".compliance-engine-difference h3");
    if (differenceHeading) differenceHeading.textContent = "Traceable recommendations, not a black-box answer";

    const setupManualCarousel = () => {
        const original = document.querySelector(".home-page .capability-carousel");
        if (!original || original.dataset.manualCarousel === "true") return;

        const carousel = original.cloneNode(true);
        carousel.dataset.manualCarousel = "true";
        original.replaceWith(carousel);

        const track = carousel.querySelector(".carousel-track");
        const slides = Array.from(carousel.querySelectorAll(".capability-slide"));
        const previous = carousel.querySelector(".carousel-arrow.prev");
        const next = carousel.querySelector(".carousel-arrow.next");
        if (!track || !slides.length || !previous || !next) return;

        slides.forEach((slide, index) => {
            slide.setAttribute("role", "group");
            slide.setAttribute("aria-label", `Capability ${index + 1} of ${slides.length}`);
        });

        const progress = createElement("div", "carousel-progress");
        const status = createElement("span", "carousel-progress__status");
        status.setAttribute("aria-live", "polite");
        const dots = createElement("div", "carousel-progress__dots");
        dots.setAttribute("aria-label", "Choose capability");
        progress.append(status, dots);
        carousel.append(progress);

        let currentIndex = 0;

        const slideWidth = () => {
            const first = slides[0];
            const styles = window.getComputedStyle(track);
            const gap = parseFloat(styles.columnGap || styles.gap) || 0;
            return first.getBoundingClientRect().width + gap;
        };

        const update = (index, move = true) => {
            currentIndex = Math.max(0, Math.min(slides.length - 1, index));
            slides.forEach((slide, slideIndex) => slide.classList.toggle("active", slideIndex === currentIndex));
            dots.querySelectorAll("button").forEach((dot, dotIndex) => dot.setAttribute("aria-current", String(dotIndex === currentIndex)));
            status.textContent = `${currentIndex + 1} of ${slides.length}`;
            previous.disabled = currentIndex === 0;
            next.disabled = currentIndex === slides.length - 1;
            if (move) track.scrollTo({ left: currentIndex * slideWidth(), behavior: "smooth" });
        };

        slides.forEach((_slide, index) => {
            const dot = createElement("button", "carousel-progress__dot");
            dot.type = "button";
            dot.setAttribute("aria-label", `Show capability ${index + 1}`);
            dot.addEventListener("click", () => update(index));
            dots.append(dot);
        });

        previous.addEventListener("click", () => update(currentIndex - 1));
        next.addEventListener("click", () => update(currentIndex + 1));

        let scrollFrame = 0;
        track.addEventListener("scroll", () => {
            window.cancelAnimationFrame(scrollFrame);
            scrollFrame = window.requestAnimationFrame(() => {
                const width = slideWidth() || 1;
                update(Math.round(track.scrollLeft / width), false);
            });
        }, { passive: true });

        window.addEventListener("resize", () => update(currentIndex, false), { passive: true });
        update(0, false);
    };

    if (document.readyState === "complete") setupManualCarousel();
    else window.addEventListener("load", setupManualCarousel, { once: true });
}

function setupIntelligenceHub() {
    const description = document.querySelector(".intelligence-hub-hero__content .hero-description");
    if (description) {
        description.textContent = "Choose an analysis to start. If you have used GrowWithHR before, you can recover saved company details after choosing what you want to understand.";
    }

    const heroContent = document.querySelector(".intelligence-hub-hero__content");
    if (heroContent && !heroContent.querySelector(".hub-hero-actions")) {
        const actions = createElement("div", "hub-hero-actions");
        const choose = createElement("a", "primary-btn", "Choose an analysis");
        choose.href = "#engineTitle";
        actions.append(choose);
        heroContent.append(actions);
    }

    const workspaceCopy = document.querySelector(".hub-workspace-copy");
    if (workspaceCopy && !workspaceCopy.querySelector(".hub-recovery-help")) {
        workspaceCopy.append(createElement("p", "hub-recovery-help", "Your Report ID and Recovery Code are provided when a GrowWithHR analysis is completed. You only need these if you want to reuse previously saved company information."));
    }

    const reportId = document.getElementById("workspaceReportId");
    const recoveryCode = document.getElementById("workspaceRecoveryCode");
    if (reportId) reportId.autocomplete = "username";
    if (recoveryCode) recoveryCode.autocomplete = "current-password";

    const status = document.getElementById("workspaceRecoverStatus");
    if (status) {
        const nextStep = createElement("div", "hub-recovered-next");
        nextStep.hidden = true;
        nextStep.textContent = "Workspace recovered. Choose an analysis above to continue with your saved Company DNA.";
        status.insertAdjacentElement("afterend", nextStep);
        new MutationObserver(() => {
            const recovered = /^Recovered\b/i.test(status.textContent.trim());
            nextStep.hidden = !recovered;
        }).observe(status, { childList: true, characterData: true, subtree: true });
    }

    const deleteButton = document.getElementById("workspaceDeleteData");
    if (!deleteButton || document.getElementById("hubDeleteConfirmDialog")) return;

    const dialog = createElement("dialog", "hub-confirm-dialog");
    dialog.id = "hubDeleteConfirmDialog";
    dialog.innerHTML = `
        <div class="hub-confirm-dialog__inner">
            <h2>Delete reusable company data?</h2>
            <p>This permanently deletes the reusable Company Workspace information for this report. Downloaded reports are not affected. This action cannot be undone.</p>
            <div class="hub-confirm-dialog__actions">
                <button class="hub-confirm-dialog__cancel" type="button">Cancel</button>
                <button class="hub-confirm-dialog__delete" type="button">Delete company data</button>
            </div>
        </div>`;
    document.body.append(dialog);

    const cancel = dialog.querySelector(".hub-confirm-dialog__cancel");
    const confirmDelete = dialog.querySelector(".hub-confirm-dialog__delete");

    cancel.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
    });

    deleteButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (typeof dialog.showModal === "function") dialog.showModal();
        else if (window.confirm("Delete reusable company data? This cannot be undone.")) confirmDelete.click();
    }, true);

    confirmDelete.addEventListener("click", async () => {
        let workspace = null;
        try { workspace = JSON.parse(sessionStorage.getItem("growwithhr.workspace") || "null"); } catch (_error) {}
        if (!workspace?.reportId || !workspace?.accessKey) {
            dialog.close();
            return;
        }

        confirmDelete.disabled = true;
        if (status) status.textContent = "Deleting saved company data…";
        try {
            await window.GrowWithHRCompanyWorkspace.erase(workspace.reportId, workspace.accessKey);
            sessionStorage.removeItem("growwithhr.workspace");
            document.getElementById("workspaceActions")?.setAttribute("hidden", "");
            if (status) status.textContent = "Reusable company data deleted. A confirmation email will be sent.";
            dialog.close();
        } catch (error) {
            if (status) status.textContent = error?.message || "We could not delete that workspace just yet.";
        } finally {
            confirmDelete.disabled = false;
        }
    });
}

function setupOrganizationIntelligence() {
    const form = document.getElementById("organizationForm");
    const grid = form?.querySelector(".grid");
    if (!form || !grid || grid.dataset.stepped === "true") return;
    grid.dataset.stepped = "true";

    form.querySelectorAll(".field").forEach((field) => {
        const control = field.querySelector("input[required], select[required], textarea[required]");
        const label = field.querySelector("label");
        if (control && label && !label.querySelector(".org-required")) {
            label.append(createElement("span", "org-required", "Required"));
        }
    });

    const children = Array.from(grid.children);
    const groups = [];
    let current = null;

    children.forEach((child) => {
        if (child.classList.contains("section-title")) {
            current = [];
            groups.push(current);
        }
        if (!current) {
            current = [];
            groups.push(current);
        }
        current.push(child);
    });

    if (groups.length < 2) return;

    const panels = groups.map((group, index) => {
        const panel = createElement("section", `org-step-panel${index === 0 ? " is-active" : ""}`);
        panel.dataset.step = String(index);
        group.forEach((child) => panel.append(child));
        grid.append(panel);
        return panel;
    });

    const heading = form.querySelector("h2");
    const progress = createElement("div", "org-step-progress");
    const progressTitle = createElement("strong", "", "Step 1");
    const progressText = createElement("span");
    progress.append(progressTitle, progressText);
    heading?.insertAdjacentElement("afterend", progress);

    const controls = createElement("div", "org-step-controls");
    const back = createElement("button", "org-step-back", "Back");
    back.type = "button";
    const next = createElement("button", "org-step-next", "Continue");
    next.type = "button";
    controls.append(back, next);

    const actions = form.querySelector(".actions");
    actions?.insertAdjacentElement("beforebegin", controls);

    let active = 0;
    const stepName = (panel, index) => panel.querySelector(".section-title")?.textContent.trim() || `Step ${index + 1}`;

    const show = (index, moveFocus = true) => {
        active = Math.max(0, Math.min(panels.length - 1, index));
        panels.forEach((panel, panelIndex) => panel.classList.toggle("is-active", panelIndex === active));
        progressTitle.textContent = `Step ${active + 1} of ${panels.length}`;
        progressText.textContent = stepName(panels[active], active);
        back.hidden = active === 0;
        next.hidden = active === panels.length - 1;
        if (actions) actions.hidden = active !== panels.length - 1;

        if (moveFocus) {
            panels[active].querySelector("input, select, textarea")?.focus({ preventScroll: true });
            form.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        }
    };

    const validateActive = () => {
        const required = Array.from(panels[active].querySelectorAll("input[required], select[required], textarea[required]"));
        const invalid = required.find((control) => !control.checkValidity());
        if (invalid) {
            invalid.reportValidity();
            invalid.focus();
            return false;
        }
        return true;
    };

    back.addEventListener("click", () => show(active - 1));
    next.addEventListener("click", () => {
        if (validateActive()) show(active + 1);
    });

    show(0, false);
}

function setupComplianceAssessment() {
    const landing = document.getElementById("landingScreen");
    const conversion = landing?.querySelector(".advisory-entry__conversion");
    if (landing && conversion && !landing.querySelector(".advisory-visible-heading")) {
        const heading = createElement("div", "advisory-visible-heading");
        heading.innerHTML = `
            <p class="eyebrow">Compliance Intelligence</p>
            <h2>Executive Compliance Advisory</h2>
            <p>Answer a focused set of company and workforce questions. GrowWithHR will show what may apply, what is still unknown and what to review next.</p>`;
        landing.insertBefore(heading, conversion);
    }

    // Preserve the established Start/Continue action labels because they are
    // already part of the public assessment journey and accessibility contract.
}

async function renderOfficialResources() {
    const container = document.getElementById("officialResourcesContainer");
    if (!container) return;

    container.setAttribute("aria-busy", "true");

    try {
        const response = await fetch("data/official-resources.json", { cache: "no-store" });
        if (!response.ok) throw new Error("Official resources could not be loaded.");
        const data = await response.json();
        const resources = Array.isArray(data.resources) ? data.resources : [];

        container.innerHTML = resources.map((resource) => {
            const name = resource.name || resource.authority || "Official Resource";
            const description = resource.description || "Official government or statutory reference.";
            return `
                <article class="update-card resource-line-card">
                    <div class="resource-line-marker" aria-hidden="true"></div>
                    <div>
                        <div class="update-type">${resource.type || "Official Source"}</div>
                        <h3>${name}</h3>
                        <p class="resource-line-card__description">${description}</p>
                    </div>
                    <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="secondary-btn" aria-label="Visit ${name} official website">Visit official site →</a>
                </article>`;
        }).join("");
        container.setAttribute("aria-busy", "false");

        const heroContent = document.querySelector(".official-resources-page .hero-content");
        let verified = document.querySelector(".official-last-verified");
        if (data.lastVerified && heroContent) {
            if (!verified) {
                verified = createElement("div", "official-last-verified");
                heroContent.append(verified);
            }
            const date = new Date(`${data.lastVerified}T00:00:00`);
            verified.textContent = `Source library last verified ${Number.isNaN(date.getTime()) ? data.lastVerified : date.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}`;
        }
    } catch (_error) {
        container.innerHTML = `
            <article class="update-card">
                <h3>Official resources are temporarily unavailable</h3>
                <p>Please try loading the source library again.</p>
                <button type="button" class="secondary-btn resource-retry">Retry</button>
            </article>`;
        container.setAttribute("aria-busy", "false");
        container.querySelector(".resource-retry")?.addEventListener("click", renderOfficialResources);
    }
}

function setupOfficialResources() {
    document.querySelector('script[src="js/sticky-card-debug.js"]')?.remove();
    const run = () => window.setTimeout(renderOfficialResources, 0);
    if (document.readyState === "complete") run();
    else window.addEventListener("load", run, { once: true });
}

function setupSampleAdvisory() {
    const download = document.getElementById("downloadSampleAdvisoryPdf");
    const icon = download?.querySelector("i.fa-file-pdf");
    if (icon) icon.replaceWith(createElement("span", "sample-pdf-icon", "PDF"));

    document.querySelectorAll('.sample-advisory-page a[href*="analyze-company.html"]').forEach((link) => {
        link.href = "intelligence-hub.html";
    });

    const sections = Array.from(document.querySelectorAll(".sample-advisory-page .section .section-heading h2"));
    if (sections.length && !document.querySelector(".sample-report-nav")) {
        const nav = createElement("nav", "sample-report-nav");
        nav.setAttribute("aria-label", "Sample report sections");
        const links = createElement("div", "sample-report-nav__links");
        sections.forEach((heading, index) => {
            if (!heading.id) heading.id = `sample-section-${index + 1}`;
            const link = createElement("a", "", heading.textContent.trim());
            link.href = `#${heading.id}`;
            links.append(link);
        });
        nav.append(links);
        document.querySelector(".sample-advisory-page .hero")?.insertAdjacentElement("afterend", nav);
    }

    if (!document.querySelector(".sample-back-to-top")) {
        const back = createElement("button", "sample-back-to-top", "↑ Back to top");
        back.type = "button";
        back.addEventListener("click", () => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
        document.body.append(back);
    }
}

function setupMoreInfo() {
    document.querySelector('script[src="js/sticky-card-debug.js"]')?.remove();
}

switch (fileName) {
    case "index.html":
        setupHomepage();
        break;
    case "intelligence-hub.html":
        setupIntelligenceHub();
        break;
    case "organization-intelligence.html":
        setupOrganizationIntelligence();
        break;
    case "analyze-company.html":
        setupComplianceAssessment();
        break;
    case "official-resources.html":
        setupOfficialResources();
        break;
    case "sample-advisory-report.html":
        setupSampleAdvisory();
        break;
    case "more-info.html":
        setupMoreInfo();
        break;
    default:
        break;
}

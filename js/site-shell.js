/**
 * GrowWithHR shared site shell
 * ------------------------------------------------------------
 * Renders one consistent header and footer across every page.
 */
(function siteShellBootstrap(window, document) {
    "use strict";

    const THEME_VERSION = "20260901-layered-dark-global";

    const NAV_ITEMS = Object.freeze([
        { key: "organization", label: "Organization & Growth", href: "organization-intelligence.html" },
        { key: "compliance", label: "HR Compliance Readiness", href: "compliance-intelligence.html" },
        { key: "reports", label: "My Reports", href: "my-reports.html" },
        { key: "resources", label: "Sources & Methodology", href: "official-resources.html" }
    ]);

    const MORE_ITEMS = Object.freeze([
        { label: "Sample Reports", href: "sample-reports.html" },
        { label: "Security & Data", href: "security.html" },
        { label: "Terms", href: "terms.html" },
        { label: "About", href: "more-info.html#about" },
        { label: "Privacy", href: "more-info.html#privacy" },
        { label: "Contact", href: "more-info.html#contact" }
    ]);

    const FOOTER_ITEMS = Object.freeze([
        { label: "About", href: "https://hrtechifyed.github.io/The-Corporatex/index.html#about" },
        { label: "Privacy", href: "https://hrtechifyed.github.io/The-Corporatex/privacy-safety.html" },
        { label: "Contact", href: "mailto:hrtechifyed@gmail.com" }
    ]);

    const FOOTER_RIGHTS = "© 2026 HRTechify. All rights reserved.";

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalizePrefix(prefix) {
        const value = String(prefix || "").trim();
        if (!value || value === "./") return "";
        return value.endsWith("/") ? value : `${value}/`;
    }

    function inferRootPrefix() {
        const bodyPrefix = document.body?.dataset?.siteRoot || "";
        if (bodyPrefix) return normalizePrefix(bodyPrefix);

        const script = document.currentScript || Array.from(document.scripts).find((item) => {
            const source = item.getAttribute("src") || "";
            return /(?:^|\/)js\/site-shell\.js(?:[?#].*)?$/.test(source);
        });
        if (!script) return "";

        const source = (script.getAttribute("src") || "").replace(/[?#].*$/, "");
        const marker = "js/site-shell.js";
        const markerIndex = source.lastIndexOf(marker);
        if (markerIndex === -1) return "";
        return normalizePrefix(source.slice(0, markerIndex));
    }

    function withRoot(prefix, path) {
        if (!path) return prefix;
        if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("#")) return path;
        return `${prefix}${path}`;
    }

    function currentFileName() {
        return (window.location.pathname || "").split("/").filter(Boolean).pop() || "index.html";
    }

    function inferActiveNav() {
        const activeByFile = {
            "organization-intelligence.html": "organization",
            "organization-structure-report.html": "organization",
            "compliance-intelligence.html": "compliance",
            "analyze-company.html": "compliance",
            "my-reports.html": "reports",
            "official-resources.html": "resources",
            "organization-structure-methodology.html": "resources",
            "sample-reports.html": "more",
            "sample-advisory-report.html": "more",
            "executive-advisory-report.html": "more",
            "more-info.html": "more",
            "security.html": "more",
            "terms.html": "more"
        };
        const byFile = activeByFile[currentFileName()];
        if (byFile) return byFile;

        const explicit = (document.body?.dataset?.activeNav || "").trim().toLowerCase();
        const aliases = {
            organization: "organization",
            compliance: "compliance",
            reports: "reports",
            resources: "resources",
            sample: "more",
            more: "more"
        };
        return aliases[explicit] || "";
    }

    function navLinkMarkup(item, prefix, activeKey) {
        const isActive = item.key === activeKey;
        return `<a class="site-nav-link${isActive ? " is-active" : ""}" href="${escapeHtml(withRoot(prefix, item.href))}" data-nav-key="${escapeHtml(item.key)}" ${isActive ? 'aria-current="page"' : ""}>${escapeHtml(item.label)}</a>`;
    }

    function moreItemMarkup(item, prefix) {
        return `<a href="${escapeHtml(withRoot(prefix, item.href))}">${escapeHtml(item.label)}</a>`;
    }

    function footerItemMarkup(item) {
        return `<a href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`;
    }

    function buildHeader(prefix, activeKey) {
        const header = document.createElement("header");
        header.className = "site-header-shell";
        header.dataset.siteShellHeader = "";
        header.innerHTML = `
            <div class="site-header-shell__inner">
                <a class="site-brand-logo" href="${escapeHtml(withRoot(prefix, "index.html#home"))}" aria-label="GrowWithHR home">
                    <img src="${escapeHtml(withRoot(prefix, "assets/hrtechify-logo.png"))}" alt="HRTechify">
                </a>
                <nav class="site-nav-glass" aria-label="Primary navigation">
                    <a class="site-product-name" href="${escapeHtml(withRoot(prefix, "index.html#home"))}">GrowWithHR</a>
                    <button class="site-nav-toggle" type="button" aria-label="Open navigation" aria-controls="siteNavLinks" aria-expanded="false"><span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span></button>
                    <div class="site-nav-links" id="siteNavLinks">
                        ${NAV_ITEMS.map((item) => navLinkMarkup(item, prefix, activeKey)).join("")}
                        <div class="site-nav-more${activeKey === "more" ? " is-active" : ""}">
                            <button class="site-nav-more__toggle" type="button" aria-expanded="false" aria-controls="siteMoreMenu" ${activeKey === "more" ? 'aria-current="page"' : ""}><span>More</span><span class="site-nav-more__chevron" aria-hidden="true">⌄</span></button>
                            <div class="site-nav-more__menu" id="siteMoreMenu" aria-label="More navigation">${MORE_ITEMS.map((item) => moreItemMarkup(item, prefix)).join("")}</div>
                        </div>
                    </div>
                </nav>
            </div>`;
        return header;
    }

    function buildFooter() {
        const footer = document.createElement("footer");
        footer.className = "site-footer";
        footer.dataset.siteShellFooter = "";
        footer.innerHTML = `
            <div class="site-footer__inner">
                <p class="site-footer__brand-line"><strong>GrowWithHR</strong> by HRTechify</p>
                <nav class="site-footer__nav" aria-label="Footer navigation">${FOOTER_ITEMS.map((item) => footerItemMarkup(item)).join("")}</nav>
                <p class="site-footer__rights-line">${escapeHtml(FOOTER_RIGHTS)}</p>
            </div>`;
        return footer;
    }

    function placeHeader(header) {
        const oldHeaders = Array.from(document.body?.querySelectorAll("[data-site-shell-header], nav.navbar, header.site-header-shell") || []);
        const anchor = oldHeaders.find((item) => item.parentNode) || null;
        if (anchor?.parentNode) anchor.parentNode.insertBefore(header, anchor);
        else {
            const skipLink = document.querySelector(".skip-link, [data-skip-link], .advisory-skip-link");
            if (skipLink?.parentNode === document.body) skipLink.insertAdjacentElement("afterend", header);
            else document.body.insertBefore(header, document.body.firstChild);
        }
        oldHeaders.forEach((item) => { if (item !== header && item.parentNode) item.remove(); });
    }

    function placeFooter(footer) {
        const oldFooters = Array.from(document.querySelectorAll("[data-site-shell-footer], footer.footer, footer.site-footer"));
        const lastFooter = oldFooters.at(-1);
        if (lastFooter?.parentNode) lastFooter.parentNode.insertBefore(footer, lastFooter);
        else document.body.appendChild(footer);
        oldFooters.forEach((item) => { if (item !== footer && item.parentNode) item.remove(); });
    }

    function lockBodyScroll(locked) {
        document.documentElement.classList.toggle("site-nav-open", locked);
        document.body.classList.toggle("site-nav-open", locked);
    }

    function setBackgroundInert(locked, header) {
        Array.from(document.body.children).forEach((child) => {
            if (child === header || child.matches(".advisory-skip-link, .skip-link, [data-skip-link]")) return;
            if (locked) {
                child.dataset.siteShellWasInert = child.inert ? "true" : "false";
                child.inert = true;
            } else if (child.dataset.siteShellWasInert !== undefined) {
                child.inert = child.dataset.siteShellWasInert === "true";
                delete child.dataset.siteShellWasInert;
            }
        });
    }

    function bindHeaderInteractions(header) {
        const nav = header.querySelector(".site-nav-glass");
        const toggle = header.querySelector(".site-nav-toggle");
        const links = header.querySelector(".site-nav-links");
        const more = header.querySelector(".site-nav-more");
        const moreToggle = header.querySelector(".site-nav-more__toggle");
        if (!nav || !toggle || !links || !more || !moreToggle) return;

        let previouslyFocused = null;
        const closeMore = () => {
            more.classList.remove("is-open");
            moreToggle.setAttribute("aria-expanded", "false");
        };
        const closeMobileNav = (restoreFocus = false) => {
            const wasOpen = nav.classList.contains("is-open");
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation");
            lockBodyScroll(false);
            setBackgroundInert(false, header);
            closeMore();
            if (restoreFocus && wasOpen && previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
        };
        const openMobileNav = () => {
            previouslyFocused = document.activeElement;
            nav.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
            toggle.setAttribute("aria-label", "Close navigation");
            lockBodyScroll(true);
            setBackgroundInert(true, header);
            window.requestAnimationFrame(() => links.querySelector("a, button")?.focus());
        };

        toggle.addEventListener("click", () => nav.classList.contains("is-open") ? closeMobileNav(true) : openMobileNav());
        moreToggle.addEventListener("click", (event) => {
            event.stopPropagation();
            const willOpen = !more.classList.contains("is-open");
            more.classList.toggle("is-open", willOpen);
            moreToggle.setAttribute("aria-expanded", String(willOpen));
        });
        links.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMobileNav(false)));
        document.addEventListener("click", (event) => { if (!more.contains(event.target)) closeMore(); });
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMobileNav(true);
                return;
            }
            if (event.key !== "Tab" || !nav.classList.contains("is-open") || !window.matchMedia("(max-width: 900px)").matches) return;
            const focusable = Array.from(header.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter((element) => !element.closest("[hidden]") && element.offsetParent !== null);
            if (!focusable.length) return;
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        });
        window.addEventListener("resize", () => {
            if (window.matchMedia("(min-width: 901px)").matches) closeMobileNav(false);
        });
    }

    function updatePageOffsets() {
        const header = document.querySelector("[data-site-shell-header]");
        if (header) document.documentElement.style.setProperty("--site-shell-header-height", `${Math.ceil(header.getBoundingClientRect().height)}px`);
    }

    function ensureLayeredDarkVersion(prefix) {
        const sharedStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find((item) => {
            const source = (item.getAttribute("href") || "").replace(/[?#].*$/, "");
            return /(?:^|\/)styles\.css$/.test(source);
        });
        if (sharedStyles) {
            const source = (sharedStyles.getAttribute("href") || withRoot(prefix, "styles.css")).replace(/[?#].*$/, "");
            sharedStyles.setAttribute("href", `${source}?v=${THEME_VERSION}`);
            sharedStyles.dataset.growwithhrThemeVersion = THEME_VERSION;
            return;
        }

        const directTheme = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find((item) => /(?:^|\/)css\/29-layered-dark\.css(?:[?#].*)?$/.test(item.getAttribute("href") || ""));
        if (directTheme) {
            const source = (directTheme.getAttribute("href") || withRoot(prefix, "css/29-layered-dark.css")).replace(/[?#].*$/, "");
            directTheme.setAttribute("href", `${source}?v=${THEME_VERSION}`);
            directTheme.dataset.growwithhrThemeVersion = THEME_VERSION;
            return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `${withRoot(prefix, "css/29-layered-dark.css")}?v=${THEME_VERSION}`;
        link.dataset.growwithhrThemeVersion = THEME_VERSION;
        document.head.appendChild(link);
    }

    function ensurePolishStyles(prefix) {
        if (document.querySelector("link[data-growwithhr-ui-polish]")) return;
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = withRoot(prefix, "css/25-ui-polish.css");
        link.dataset.growwithhrUiPolish = "";
        document.head.appendChild(link);
    }

    function bootstrapProductPositioning(prefix) {
        if (window.GrowWithHRProductPositioning || document.querySelector("script[data-growwithhr-product-positioning]")) {
            window.GrowWithHRProductPositioning?.apply?.();
            return;
        }
        const script = document.createElement("script");
        script.src = withRoot(prefix, "js/product-positioning.js");
        script.dataset.growwithhrProductPositioning = "";
        script.addEventListener("load", () => window.GrowWithHRProductPositioning?.apply?.(), { once: true });
        document.body.appendChild(script);
    }

    function bootstrapHomepageIntelligenceGraph() {
        if (!document.getElementById("dnaCoreCanvas") || window.GrowWithHRIntelligenceCore?.ready) return;
        import("./intelligence-core.js").catch((error) => console.error("GrowWithHR homepage intelligence graph failed to initialize", error));
    }

    function bootstrapUiPolish() {
        import("./ui-polish.js").catch((error) => console.error("GrowWithHR UI polish failed to initialize", error));
    }

    function bootstrapOrganizationAutosave() {
        if (!document.getElementById("organizationForm")) return;
        import("./organization-autosave.js").catch((error) => console.error("GrowWithHR organization autosave failed to initialize", error));
    }

    function removeHomepageTriggerStrip() {
        document.querySelectorAll(".buyer-value-strip").forEach((item) => item.remove());
    }

    function renderSiteShell() {
        if (!document.body) return;
        const prefix = inferRootPrefix();
        const activeKey = inferActiveNav();
        ensureLayeredDarkVersion(prefix);
        const header = buildHeader(prefix, activeKey);
        const footer = buildFooter();
        removeHomepageTriggerStrip();
        placeHeader(header);
        placeFooter(footer);
        bindHeaderInteractions(header);
        ensurePolishStyles(prefix);
        bootstrapProductPositioning(prefix);
        updatePageOffsets();
        bootstrapHomepageIntelligenceGraph();
        bootstrapUiPolish();
        bootstrapOrganizationAutosave();
        window.addEventListener("resize", updatePageOffsets);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderSiteShell, { once: true });
    } else {
        renderSiteShell();
    }
})(window, document);

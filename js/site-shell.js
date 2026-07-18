/**
 * GrowWithHR shared site shell
 * ------------------------------------------------------------
 * Renders one consistent header and footer across every page.
 *
 * Header layout:
 *   [ LARGE HRTECHIFY LOGO ] [ GLASS NAVIGATION CAPSULE ]
 *
 * Footer copy:
 *  © 2026 HRTechify. People • Technology • Growth \n All Rights Reserved.
 *
 * Usage on root-level pages:
 *   <script src="js/site-shell.js" defer></script>
 *
 * Usage on pages inside /pages:
 *   <script src="../js/site-shell.js" defer></script>
 *
 * Optional body attributes:
 *   data-active-nav="platform|analyze|resources|sample|more"
 *   data-site-root="../"
 */

(function siteShellBootstrap(window, document) {
    "use strict";

    const FOOTER_TEXT =
    "© 2026 HRTechify. People • Technology • Growth \n All Rights Reserved.";

    const NAV_ITEMS = Object.freeze([
        {
            key: "platform",
            label: "Home",
            href: "index.html#platform"
        },
        {
            key: "analyze",
            label: "Analyze My Company",
            href: "analyze-company.html"
        },
        {
            key: "resources",
            label: "Official Sources",
            href: "official-resources.html"
        },
        {
            key: "sample",
            label: "Sample Advisory",
            href: "sample-advisory-report.html"
        }
    ]);

    const MORE_ITEMS = Object.freeze([
        {
            label: "About",
            href: "more-info.html#about"
        },
        {
            label: "Privacy",
            href: "more-info.html#privacy"
        },
        {
            label: "Contact",
            href: "more-info.html#contact"
        }
    ]);

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function normalizePrefix(prefix) {
        const value = String(prefix || "").trim();

        if (!value || value === "./") {
            return "";
        }

        return value.endsWith("/") ? value : `${value}/`;
    }

    function inferRootPrefix() {
        const bodyPrefix = document.body && document.body.dataset
            ? document.body.dataset.siteRoot
            : "";

        if (bodyPrefix) {
            return normalizePrefix(bodyPrefix);
        }

        const script = document.currentScript || Array.from(document.scripts).find((item) => {
            const source = item.getAttribute("src") || "";
            return /(?:^|\/)js\/site-shell\.js(?:[?#].*)?$/.test(source);
        });

        if (!script) {
            return "";
        }

        const source = (script.getAttribute("src") || "")
            .replace(/[?#].*$/, "");

        const marker = "js/site-shell.js";
        const markerIndex = source.lastIndexOf(marker);

        if (markerIndex === -1) {
            return "";
        }

        return normalizePrefix(source.slice(0, markerIndex));
    }

    function withRoot(prefix, path) {
        if (!path) return prefix;
        if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("#")) {
            return path;
        }
        return `${prefix}${path}`;
    }

    function inferActiveNav() {
        const explicit = document.body && document.body.dataset
            ? document.body.dataset.activeNav
            : "";

        if (explicit) {
            return explicit.trim().toLowerCase();
        }

        const pathname = window.location.pathname || "";
        const fileName = pathname.split("/").filter(Boolean).pop() || "index.html";

        const activeByFile = {
            "index.html": "platform",
            "analyze-company.html": "analyze",
            "assessment.html": "analyze",
            "official-resources.html": "resources",
            "sample-advisory-report.html": "sample",
            "executive-advisory-report.html": "sample",
            "more-info.html": "more",
            "advisory-dashboard.html": "platform",
            "growth-roadmap.html": "platform",
            "people-roadmap.html": "platform",
            "compliance-roadmap.html": "platform",
            "company-profile.html": "platform",
            "organization-profile.html": "platform"
        };

        return activeByFile[fileName] || "";
    }

    function navLinkMarkup(item, prefix, activeKey) {
        const isActive = item.key === activeKey;

        return `
            <a
                class="site-nav-link${isActive ? " is-active" : ""}"
                href="${escapeHtml(withRoot(prefix, item.href))}"
                data-nav-key="${escapeHtml(item.key)}"
                ${isActive ? 'aria-current="page"' : ""}>
                ${escapeHtml(item.label)}
            </a>`;
    }

    function moreItemMarkup(item, prefix) {
        return `
            <a href="${escapeHtml(withRoot(prefix, item.href))}">
                ${escapeHtml(item.label)}
            </a>`;
    }

    function buildHeader(prefix, activeKey) {
        const header = document.createElement("header");
        header.className = "site-header-shell";
        header.dataset.siteShellHeader = "";

        const primaryLinks = NAV_ITEMS
            .map((item) => navLinkMarkup(item, prefix, activeKey))
            .join("");

        const moreLinks = MORE_ITEMS
            .map((item) => moreItemMarkup(item, prefix))
            .join("");

        header.innerHTML = `
            <div class="site-header-shell__inner">
                <a
                    class="site-brand-logo"
                    href="${escapeHtml(withRoot(prefix, "index.html#home"))}"
                    aria-label="HRTechify GrowWithHR home">
                    <img
                        src="${escapeHtml(withRoot(prefix, "assets/hrtechify-logo.png"))}"
                        alt="HRTechify">
                </a>

               <nav
    class="site-nav-glass"
    aria-label="Primary navigation">

    <a
        href="${escapeHtml(withRoot(prefix, "index.html#home"))}"
        aria-label="HRTechify home"
        style="
            position: relative;
            z-index: 2;
            flex: 0 0 auto;
            margin-right: auto;
            padding: 0 8px 0 18px;
            color: var(--site-shell-orange-bright);
            font-size: clamp(0.82rem, 3.4vw, 1rem);
            font-weight: 800;
            line-height: 1;
            letter-spacing: 0.04em;
            white-space: nowrap;
            text-decoration: none;
            pointer-events: auto;
        ">
        HRTechify
    </a>

    <button
        class="site-nav-toggle"
        type="button"
        aria-label="Open navigation"
        aria-controls="siteNavLinks"
        aria-expanded="false">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
    </button>

    <div
        class="site-nav-links"
        id="siteNavLinks">

        ${primaryLinks}
                        <div class="site-nav-more${activeKey === "more" ? " is-active" : ""}">
                            <button
                                class="site-nav-more__toggle"
                                type="button"
                                aria-haspopup="true"
                                aria-expanded="false"
                                aria-controls="siteMoreMenu"
                                ${activeKey === "more" ? 'aria-current="page"' : ""}>
                                <span>More</span>
                                <span
                                    class="site-nav-more__chevron"
                                    aria-hidden="true">⌄</span>
                            </button>

                            <div
                                class="site-nav-more__menu"
                                id="siteMoreMenu"
                                role="menu">
                                ${moreLinks}
                            </div>
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
                <p>${escapeHtml(FOOTER_TEXT)}</p>
            </div>`;
        return footer;
    }

    function placeHeader(header) {
        const oldHeaders = Array.from(document.querySelectorAll(
            "[data-site-shell-header], nav.navbar, header.site-header-shell"
        ));

        let anchor = null;

        oldHeaders.forEach((item) => {
            if (!anchor && item.parentNode) {
                anchor = item;
            }
        });

        if (anchor && anchor.parentNode) {
            anchor.parentNode.insertBefore(header, anchor);
        } else {
            const skipLink = document.querySelector(".skip-link, [data-skip-link]");
            if (skipLink && skipLink.parentNode === document.body) {
                skipLink.insertAdjacentElement("afterend", header);
            } else {
                document.body.insertBefore(header, document.body.firstChild);
            }
        }

        oldHeaders.forEach((item) => {
            if (item !== header && item.parentNode) {
                item.remove();
            }
        });
    }

    function placeFooter(footer) {
        const oldFooters = Array.from(document.querySelectorAll(
            "[data-site-shell-footer], footer.footer, footer.site-footer"
        ));

        const lastFooter = oldFooters.length
            ? oldFooters[oldFooters.length - 1]
            : null;

        if (lastFooter && lastFooter.parentNode) {
            lastFooter.parentNode.insertBefore(footer, lastFooter);
        } else {
            document.body.appendChild(footer);
        }

        oldFooters.forEach((item) => {
            if (item !== footer && item.parentNode) {
                item.remove();
            }
        });
    }

    function lockBodyScroll(locked) {
        document.documentElement.classList.toggle("site-nav-open", locked);
        document.body.classList.toggle("site-nav-open", locked);
    }

    function bindHeaderInteractions(header) {
        const nav = header.querySelector(".site-nav-glass");
        const toggle = header.querySelector(".site-nav-toggle");
        const links = header.querySelector(".site-nav-links");
        const more = header.querySelector(".site-nav-more");
        const moreToggle = header.querySelector(".site-nav-more__toggle");

        if (!nav || !toggle || !links || !more || !moreToggle) {
            return;
        }

        const closeMore = () => {
            more.classList.remove("is-open");
            moreToggle.setAttribute("aria-expanded", "false");
        };

        const closeMobileNav = () => {
            nav.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
            toggle.setAttribute("aria-label", "Open navigation");
            lockBodyScroll(false);
            closeMore();
        };

        const openMobileNav = () => {
            nav.classList.add("is-open");
            toggle.setAttribute("aria-expanded", "true");
            toggle.setAttribute("aria-label", "Close navigation");
            lockBodyScroll(true);
        };

        toggle.addEventListener("click", () => {
            if (nav.classList.contains("is-open")) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });

        moreToggle.addEventListener("click", (event) => {
            event.stopPropagation();
            const willOpen = !more.classList.contains("is-open");
            more.classList.toggle("is-open", willOpen);
            moreToggle.setAttribute("aria-expanded", String(willOpen));
        });

        links.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMobileNav);
        });

        document.addEventListener("click", (event) => {
            if (!more.contains(event.target)) {
                closeMore();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                const wasOpen = nav.classList.contains("is-open");
                closeMobileNav();
                if (wasOpen) {
                    toggle.focus();
                }
            }
        });

        window.addEventListener("resize", () => {
            if (window.matchMedia("(min-width: 901px)").matches) {
                closeMobileNav();
            }
        });
    }

    function updatePageOffsets() {
        const header = document.querySelector("[data-site-shell-header]");
        if (!header) return;

        const height = Math.ceil(header.getBoundingClientRect().height);
        document.documentElement.style.setProperty(
            "--site-shell-header-height",
            `${height}px`
        );
    }

    function renderSiteShell() {
        if (!document.body) return;

        const prefix = inferRootPrefix();
        const activeKey = inferActiveNav();
        const header = buildHeader(prefix, activeKey);
        const footer = buildFooter();

        placeHeader(header);
        placeFooter(footer);
        bindHeaderInteractions(header);
        updatePageOffsets();

        document.body.classList.add("has-site-shell");
        document.documentElement.classList.add("site-shell-ready");

        window.requestAnimationFrame(updatePageOffsets);
        window.addEventListener("load", updatePageOffsets, { once: true });
        window.addEventListener("resize", updatePageOffsets);

        window.dispatchEvent(new CustomEvent("growwithhr:site-shell-ready", {
            detail: {
                activeNav: activeKey,
                rootPrefix: prefix
            }
        }));
    }

    window.GrowWithHRSiteShell = Object.freeze({
        render: renderSiteShell,
        footerText: FOOTER_TEXT
    });

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", renderSiteShell, {
            once: true
        });
    } else {
        renderSiteShell();
    }
})(window, document);

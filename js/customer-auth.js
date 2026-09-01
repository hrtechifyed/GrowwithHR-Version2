/* GrowWithHR customer authentication gate.
 * Uses the public Supabase browser client and publishable key only.
 * Service-role credentials must remain server-side.
 */
(() => {
    "use strict";

    const VERSION = "1.0.0";
    const SUPABASE_URL = "https://zyypqpzloeczvkyfdznm.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rvj1ZgS5GNIwXV0C0oRmAg_GhdEjpn2";
    const SUPABASE_CDN = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4";
    const MIN_PASSWORD_LENGTH = 8;
    let client = null;
    let libraryPromise = null;

    const clean = (value) => String(value ?? "").trim();
    const emailKey = (value) => clean(value).toLowerCase();

    function loadLibrary() {
        if (window.supabase?.createClient) return Promise.resolve(window.supabase);
        if (libraryPromise) return libraryPromise;
        libraryPromise = new Promise((resolve, reject) => {
            const existing = document.querySelector("script[data-growwithhr-supabase]");
            if (existing) {
                existing.addEventListener("load", () => resolve(window.supabase), { once: true });
                existing.addEventListener("error", () => reject(new Error("Customer sign-in could not load.")), { once: true });
                return;
            }
            const script = document.createElement("script");
            script.src = SUPABASE_CDN;
            script.async = true;
            script.crossOrigin = "anonymous";
            script.referrerPolicy = "no-referrer";
            script.dataset.growwithhrSupabase = "";
            script.addEventListener("load", () => {
                if (!window.supabase?.createClient) {
                    reject(new Error("Customer sign-in could not initialise."));
                    return;
                }
                resolve(window.supabase);
            }, { once: true });
            script.addEventListener("error", () => reject(new Error("Customer sign-in could not load.")), { once: true });
            document.head.appendChild(script);
        });
        return libraryPromise;
    }

    async function getClient() {
        if (client) return client;
        const library = await loadLibrary();
        client = library.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
                storageKey: "growwithhr.customer.auth"
            }
        });
        return client;
    }

    async function getSession() {
        const supabaseClient = await getClient();
        const { data, error } = await supabaseClient.auth.getSession();
        if (error) throw error;
        return data?.session || null;
    }

    async function signIn(email, password) {
        const userEmail = emailKey(email);
        if (!userEmail || !clean(password)) throw new Error("Enter your work email and password.");
        const supabaseClient = await getClient();
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email: userEmail, password });
        if (error) throw error;
        return data?.session || null;
    }

    async function signUp(email, password) {
        const userEmail = emailKey(email);
        if (!userEmail) throw new Error("Enter your work email.");
        if (clean(password).length < MIN_PASSWORD_LENGTH) throw new Error(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
        const supabaseClient = await getClient();
        const { data, error } = await supabaseClient.auth.signUp({
            email: userEmail,
            password,
            options: { data: { product: "GrowWithHR" } }
        });
        if (error) throw error;
        return { session: data?.session || null, user: data?.user || null };
    }

    async function signOut() {
        const supabaseClient = await getClient();
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;
    }

    function sessionMatchesEmail(session, expectedEmail) {
        const expected = emailKey(expectedEmail);
        const actual = emailKey(session?.user?.email);
        return Boolean(expected && actual && expected === actual);
    }

    async function requireMatchingSession(expectedEmail) {
        const session = await getSession();
        if (!session) throw new Error("Sign in to receive the complete report.");
        if (!sessionMatchesEmail(session, expectedEmail)) {
            throw new Error(`Sign in with ${clean(expectedEmail)} — the work email used for this assessment.`);
        }
        return session;
    }

    async function authorizedFetch(url, options = {}, expectedEmail = "") {
        const session = expectedEmail ? await requireMatchingSession(expectedEmail) : await getSession();
        if (!session?.access_token) throw new Error("Your sign-in session is no longer available. Sign in again.");
        const headers = new Headers(options.headers || {});
        headers.set("Authorization", `Bearer ${session.access_token}`);
        return fetch(url, { ...options, headers });
    }

    function renderGate(container, options = {}) {
        if (!container) return;
        const expectedEmail = emailKey(options.expectedEmail);
        const title = clean(options.title) || "Sign in for the complete report";
        container.innerHTML = `
            <section class="gwh-auth-card" aria-labelledby="gwhAuthTitle">
                <div class="gwh-auth-card__copy">
                    <span class="gwh-auth-eyebrow">SECURE REPORT ACCESS</span>
                    <h3 id="gwhAuthTitle">${title}</h3>
                    <p>Your website result is intentionally a short executive glimpse. Sign in or create an account using the same work email to receive the complete PDF by email.</p>
                </div>
                <div class="gwh-auth-tabs" role="tablist" aria-label="Report access">
                    <button type="button" class="is-active" data-auth-mode="signin" role="tab" aria-selected="true">Sign in</button>
                    <button type="button" data-auth-mode="signup" role="tab" aria-selected="false">Create account</button>
                </div>
                <form class="gwh-auth-form" novalidate>
                    <label>Work email<input name="email" type="email" autocomplete="email" value="${expectedEmail.replace(/"/g, "&quot;")}" ${expectedEmail ? "readonly" : ""} required></label>
                    <label>Password<input name="password" type="password" autocomplete="current-password" minlength="${MIN_PASSWORD_LENGTH}" required></label>
                    <button class="gwh-auth-submit" type="submit">Sign in</button>
                    <p class="gwh-auth-status" role="status" aria-live="polite"></p>
                </form>
                <div class="gwh-auth-session" hidden>
                    <div><span class="gwh-auth-dot" aria-hidden="true"></span><strong data-auth-email></strong></div>
                    <button type="button" data-auth-signout>Sign out</button>
                </div>
            </section>`;

        const form = container.querySelector(".gwh-auth-form");
        const status = container.querySelector(".gwh-auth-status");
        const sessionPanel = container.querySelector(".gwh-auth-session");
        const tabs = Array.from(container.querySelectorAll("[data-auth-mode]"));
        const submit = container.querySelector(".gwh-auth-submit");
        const password = form.querySelector('input[name="password"]');
        let mode = "signin";

        function setStatus(message, isError = false) {
            status.textContent = clean(message);
            status.classList.toggle("is-error", Boolean(isError));
        }

        function setMode(nextMode) {
            mode = nextMode === "signup" ? "signup" : "signin";
            tabs.forEach((tab) => {
                const active = tab.dataset.authMode === mode;
                tab.classList.toggle("is-active", active);
                tab.setAttribute("aria-selected", String(active));
            });
            submit.textContent = mode === "signup" ? "Create account" : "Sign in";
            password.autocomplete = mode === "signup" ? "new-password" : "current-password";
            setStatus(mode === "signup" ? "Use at least 8 characters. You may be asked to confirm your email before signing in." : "");
        }

        async function refresh() {
            try {
                const session = await getSession();
                const matching = sessionMatchesEmail(session, expectedEmail || session?.user?.email);
                if (session && matching) {
                    form.hidden = true;
                    container.querySelector(".gwh-auth-tabs").hidden = true;
                    sessionPanel.hidden = false;
                    sessionPanel.querySelector("[data-auth-email]").textContent = session.user.email || "Signed in";
                    setStatus("");
                    await options.onAuthenticated?.(session);
                    return session;
                }
                form.hidden = false;
                container.querySelector(".gwh-auth-tabs").hidden = false;
                sessionPanel.hidden = true;
                if (session && expectedEmail && !sessionMatchesEmail(session, expectedEmail)) {
                    setStatus(`You are signed in as ${session.user.email}. Sign out and use ${expectedEmail} for this report.`, true);
                }
                await options.onSignedOut?.();
                return null;
            } catch (error) {
                setStatus(error.message || "Customer sign-in is unavailable right now.", true);
                return null;
            }
        }

        tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.authMode)));
        form.addEventListener("submit", async (event) => {
            event.preventDefault();
            const email = emailKey(new FormData(form).get("email"));
            const pass = clean(new FormData(form).get("password"));
            if (expectedEmail && email !== expectedEmail) {
                setStatus(`Use ${expectedEmail} — the work email used for this assessment.`, true);
                return;
            }
            submit.disabled = true;
            setStatus(mode === "signup" ? "Creating your account…" : "Signing you in…");
            try {
                if (mode === "signup") {
                    const result = await signUp(email, pass);
                    if (!result.session) {
                        setStatus("Account created. Check your email to confirm it, then return here and sign in.");
                        setMode("signin");
                        return;
                    }
                } else {
                    await signIn(email, pass);
                }
                await refresh();
            } catch (error) {
                setStatus(error.message || "We could not complete sign-in.", true);
            } finally {
                submit.disabled = false;
            }
        });
        sessionPanel.querySelector("[data-auth-signout]").addEventListener("click", async () => {
            try { await signOut(); } catch (_error) {}
            await refresh();
        });

        void refresh();
    }

    const api = Object.freeze({
        version: VERSION,
        projectUrl: SUPABASE_URL,
        libraryVersion: "2.112.4",
        getClient,
        getSession,
        signIn,
        signUp,
        signOut,
        sessionMatchesEmail,
        requireMatchingSession,
        authorizedFetch,
        mountGate: renderGate
    });

    window.GrowWithHRCustomerAuth = api;
    window.GrowWithHRCustomerAuthReady = getClient().then(() => api).catch((error) => {
        console.error("GrowWithHR customer authentication could not initialise.", error);
        return api;
    });
})();
import {
  getSession,
  ensureProfile,
  normalizedReturnTarget,
  requestPasswordReset,
  signInWithGoogle,
  signInWithPassword,
  signUp
} from "./auth-client.js";

const params = new URLSearchParams(location.search);
const returnTo = normalizedReturnTarget(params.get("return"), "my-growwithhr.html");
const status = document.getElementById("authStatus");
const signInForm = document.getElementById("signInForm");
const signUpForm = document.getElementById("signUpForm");
const forgotForm = document.getElementById("forgotForm");
const googleButton = document.getElementById("googleSignIn");
const tabs = Array.from(document.querySelectorAll("[data-auth-tab]"));
const panels = Array.from(document.querySelectorAll("[data-auth-panel]"));

function showStatus(message, kind = "") {
  status.textContent = message || "";
  status.className = `prototype-status${kind ? ` prototype-${kind}` : ""}`;
}

function setMode(mode) {
  tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.authTab === mode));
  panels.forEach((panel) => { panel.hidden = panel.dataset.authPanel !== mode; });
  showStatus("");
}

tabs.forEach((tab) => tab.addEventListener("click", () => setMode(tab.dataset.authTab)));

document.querySelectorAll("[data-show-auth]").forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.showAuth));
});

async function boot() {
  try {
    const session = await getSession();
    if (session?.user) {
      await ensureProfile(session.user).catch(() => null);
      location.replace(returnTo);
      return;
    }
    setMode(params.get("mode") === "signup" ? "signup" : "signin");
  } catch (error) {
    showStatus(error.message || "Account sign-in is not available yet in this environment.", "error");
    document.querySelectorAll("button[type='submit'], #googleSignIn").forEach((button) => { button.disabled = true; });
  }
}

signInForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = signInForm.querySelector("button[type='submit']");
  button.disabled = true;
  showStatus("Signing you in…");
  try {
    const data = await signInWithPassword({
      email: document.getElementById("signInEmail").value.trim(),
      password: document.getElementById("signInPassword").value
    });
    if (data?.user) await ensureProfile(data.user).catch(() => null);
    showStatus("Signed in. Opening your GrowWithHR workspace…", "success");
    location.replace(returnTo);
  } catch (error) {
    showStatus(error.message || "We could not sign you in.", "error");
  } finally {
    button.disabled = false;
  }
});

signUpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.getElementById("signUpPassword").value;
  const confirmation = document.getElementById("signUpConfirmPassword").value;
  if (password !== confirmation) {
    showStatus("The passwords do not match.", "error");
    return;
  }
  if (!document.getElementById("signUpConsent").checked) {
    showStatus("Please accept the Terms and Privacy notice to create an account.", "error");
    return;
  }
  const button = signUpForm.querySelector("button[type='submit']");
  button.disabled = true;
  showStatus("Creating your account…");
  try {
    const data = await signUp({
      email: document.getElementById("signUpEmail").value.trim(),
      password,
      displayName: document.getElementById("signUpName").value.trim(),
      returnTo
    });
    if (data?.session?.user) {
      await ensureProfile(data.session.user).catch(() => null);
      location.replace(returnTo);
      return;
    }
    showStatus("Account created. Check your email to verify your address, then return here to sign in.", "success");
    setMode("signin");
  } catch (error) {
    showStatus(error.message || "We could not create your account.", "error");
  } finally {
    button.disabled = false;
  }
});

forgotForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = forgotForm.querySelector("button[type='submit']");
  button.disabled = true;
  showStatus("Sending a secure reset link…");
  try {
    await requestPasswordReset(document.getElementById("forgotEmail").value.trim());
    showStatus("If that email is registered, a password reset link has been sent.", "success");
  } catch (error) {
    showStatus(error.message || "We could not send the reset email.", "error");
  } finally {
    button.disabled = false;
  }
});

googleButton.addEventListener("click", async () => {
  googleButton.disabled = true;
  showStatus("Opening Google sign-in…");
  try {
    await signInWithGoogle(returnTo);
  } catch (error) {
    googleButton.disabled = false;
    showStatus(error.message || "Google sign-in could not be started.", "error");
  }
});

boot();

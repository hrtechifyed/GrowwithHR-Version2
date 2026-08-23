import {
  deleteAccountPermanently,
  getUser,
  signOutAll,
  updatePassword
} from "./auth-client.js";

const status = document.getElementById("accountSettingsStatus");
const emailNode = document.getElementById("accountEmail");
const passwordForm = document.getElementById("changePasswordForm");
const signOutAllButton = document.getElementById("signOutAllSessions");
const deleteButton = document.getElementById("deleteAccount");

function show(message, kind = "") {
  status.textContent = message || "";
  status.className = `prototype-status${kind ? ` prototype-${kind}` : ""}`;
}

async function boot() {
  try {
    const user = await getUser();
    if (!user) {
      location.replace(`auth.html?return=${encodeURIComponent("account-settings.html")}`);
      return;
    }
    emailNode.textContent = user.email || "Signed-in account";
  } catch (error) {
    show(error.message || "Account settings could not be loaded.", "error");
  }
}

passwordForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.getElementById("settingsNewPassword").value;
  const confirmation = document.getElementById("settingsConfirmPassword").value;
  if (password !== confirmation) {
    show("The passwords do not match.", "error");
    return;
  }
  const button = passwordForm.querySelector("button[type='submit']");
  button.disabled = true;
  show("Updating your password…");
  try {
    await updatePassword(password);
    passwordForm.reset();
    show("Your password has been updated.", "success");
  } catch (error) {
    show(error.message || "Your password could not be updated.", "error");
  } finally {
    button.disabled = false;
  }
});

signOutAllButton.addEventListener("click", async () => {
  if (!confirm("Sign out of GrowWithHR on all signed-in devices?")) return;
  signOutAllButton.disabled = true;
  show("Signing out all sessions…");
  try {
    await signOutAll();
    location.replace("auth.html");
  } catch (error) {
    show(error.message || "All sessions could not be signed out.", "error");
    signOutAllButton.disabled = false;
  }
});

deleteButton.addEventListener("click", async () => {
  const phrase = prompt('This permanently deletes the prototype GrowWithHR account and account-linked data. Type DELETE MY ACCOUNT to continue.');
  if (phrase !== "DELETE MY ACCOUNT") {
    show("Account deletion was cancelled.");
    return;
  }
  if (!confirm("Permanently delete this GrowWithHR account now? This cannot be undone.")) return;
  deleteButton.disabled = true;
  show("Deleting your account and account-linked data…");
  try {
    await deleteAccountPermanently();
    try {
      Object.keys(localStorage).filter((key) => key.startsWith("growwithhr.") || key.startsWith("growwithhr-")).forEach((key) => localStorage.removeItem(key));
      Object.keys(sessionStorage).filter((key) => key.startsWith("growwithhr.") || key.startsWith("growwithhr-")).forEach((key) => sessionStorage.removeItem(key));
    } catch (_error) {}
    location.replace("index.html");
  } catch (error) {
    show(error.message || "The account could not be deleted.", "error");
    deleteButton.disabled = false;
  }
});

boot();

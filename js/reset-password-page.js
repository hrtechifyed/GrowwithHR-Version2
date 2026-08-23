import { getSession, updatePassword } from "./auth-client.js";

const form = document.getElementById("resetPasswordForm");
const status = document.getElementById("resetStatus");
const button = form.querySelector("button[type='submit']");

function show(message, kind = "") {
  status.textContent = message || "";
  status.className = `prototype-status${kind ? ` prototype-${kind}` : ""}`;
}

async function boot() {
  try {
    const session = await getSession();
    if (!session) {
      show("Open this page from the secure password-reset link sent to your email.", "error");
      button.disabled = true;
    }
  } catch (error) {
    show(error.message || "Password reset is not configured in this environment yet.", "error");
    button.disabled = true;
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = document.getElementById("newPassword").value;
  const confirmation = document.getElementById("confirmNewPassword").value;
  if (password !== confirmation) {
    show("The passwords do not match.", "error");
    return;
  }
  button.disabled = true;
  show("Updating your password…");
  try {
    await updatePassword(password);
    show("Password updated. You can continue to your GrowWithHR workspace.", "success");
    window.setTimeout(() => location.replace("my-growwithhr.html"), 900);
  } catch (error) {
    show(error.message || "We could not update your password.", "error");
    button.disabled = false;
  }
});

boot();

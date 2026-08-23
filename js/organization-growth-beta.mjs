// Zero-cost prototype entrypoint. Account-based code is intentionally dormant.
const signedOut = document.getElementById("introSignedOutActions");
const signedIn = document.getElementById("introSignedInActions");
if (signedOut) signedOut.hidden = true;
if (signedIn) {
  signedIn.hidden = false;
  signedIn.id = "introActions";
  const workspaceLink = signedIn.querySelector('a[href="my-growwithhr.html"]');
  if (workspaceLink) {
    workspaceLink.href = "my-reports.html";
    workspaceLink.textContent = "My Reports / Recover";
  }
}

const intro = document.getElementById("engineIntro");
if (intro) {
  const cards = Array.from(intro.querySelectorAll(".prototype-card"));
  const stopCard = cards.find((card) => /You can stop anytime/i.test(card.textContent || ""));
  if (stopCard) {
    const paragraph = stopCard.querySelector("p");
    if (paragraph) paragraph.textContent = "Your answers auto-save on this browser. You can leave and continue later on the same device.";
  }
  const signInCard = cards.find((card) => /Why sign-in is required/i.test(card.textContent || ""));
  if (signInCard) {
    const heading = signInCard.querySelector("h3");
    const paragraph = signInCard.querySelector("p");
    if (heading) heading.textContent = "How saving and report recovery work";
    if (paragraph) paragraph.innerHTML = "No sign-in is required. Your assessment auto-saves on this device. When you generate a report, GrowWithHR gives you a <strong>Report ID + Recovery Code</strong> so the completed report can be recovered later. <strong>Sample reports remain open.</strong>";
  }
}

import("./organization-growth-zero-cost.mjs");

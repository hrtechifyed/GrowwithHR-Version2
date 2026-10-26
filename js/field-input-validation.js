/* Inline, accessible input feedback across GrowWithHR public forms.
 * UI validation is a convenience; server-side checks remain authoritative. */
(function (window, document) {
  "use strict";
  if (window.GrowWithHRFieldValidation) return;

  const SELECTOR = "input, select, textarea";
  let counter = 0;

  function applicable(field) {
    if (!field?.matches?.(SELECTOR) || !field.form || field.disabled ||
        field.closest('[hidden], [aria-hidden="true"]') ||
        ["hidden", "submit", "button", "reset", "file"].includes(field.type)) return false;
    return field.willValidate !== false;
  }

  function fieldLabel(field) {
    const raw = field.labels?.[0]?.textContent || field.getAttribute("aria-label") ||
      field.getAttribute("placeholder") || field.name || field.id || "this field";
    return String(raw).replace(/\s*(Required|Optional|\*)\s*$/i, "").replace(/\s+/g, " ").trim();
  }

  function emailIsValid(email) {
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
    const [local, domain] = email.split("@");
    return Boolean(local && domain && !local.startsWith(".") && !local.endsWith(".") &&
      !local.includes("..") && domain.split(".").every(
        part => part && !part.startsWith("-") && !part.endsWith("-") && !part.includes("_")
      ));
  }

  function messageFor(field) {
    if (!applicable(field) || ["checkbox", "radio"].includes(field.type)) return "";
    const label = fieldLabel(field);
    const value = String(field.value ?? "").trim();
    const validity = field.validity || {};
    if (!value) {
      if (field.required) return `Please enter ${label.toLowerCase()}.`;
      if (validity.badInput) return `Enter a valid value for ${label.toLowerCase()}.`;
      return "";
    }

    if (field.type === "email") {
      if (!emailIsValid(value) || validity.typeMismatch) {
        return "Enter a valid email address, such as name@company.com.";
      }
    }
    if (field.type === "number") {
      const numeric = Number(value);
      if (!Number.isFinite(numeric) || validity.badInput) {
        return `Enter a valid number for ${label.toLowerCase()}.`;
      }
      const step = field.getAttribute("step");
      const mustBeWhole = step === null || step === "1";
      if (mustBeWhole && (!/^\d+$/.test(value) || !Number.isSafeInteger(numeric) ||
          validity.stepMismatch)) {
        return `Enter a whole number for ${label.toLowerCase()} (no decimals or negative values).`;
      }
      const min = field.getAttribute("min");
      if (min !== null && numeric < Number(min)) {
        return field.id === "employees" || field.id === "betaEmployees"
          ? "Number of employees must be at least 1."
          : `${label} must be at least ${min}.`;
      }
      const max = field.getAttribute("max");
      if (max !== null && numeric > Number(max)) return `${label} cannot exceed ${max}.`;

      if (field.form?.id === "organizationForm" &&
          ["managerCount", "reportingLevels", "founderDirectReports"].includes(field.id)) {
        const employees = Number(field.form.querySelector("#employees")?.value);
        if (Number.isSafeInteger(employees) && employees > 0 && numeric > employees) {
          return `${label} cannot exceed the total number of employees (${employees}).`;
        }
      }
    }
    if (validity.patternMismatch) return `Check the format of ${label.toLowerCase()}.`;
    if (validity.tooShort) return `${label} is too short.`;
    if (validity.tooLong) return `${label} is too long.`;
    if (validity.typeMismatch) return `Enter a valid value for ${label.toLowerCase()}.`;
    if (validity.valueMissing) return `Please enter ${label.toLowerCase()}.`;
    if (validity.rangeUnderflow || validity.rangeOverflow || validity.stepMismatch) {
      return `Check the allowed range for ${label.toLowerCase()}.`;
    }
    return "";
  }

  function wrapperFor(field) {
    return field.closest(".org-field, .beta-field, .advisory-field, [data-field-wrapper]") ||
      field.parentElement;
  }

  function ensureError(field) {
    const wrapper = wrapperFor(field);
    if (!wrapper) return null;
    let id = field.dataset.growwithhrErrorId;
    if (!id) {
      id = `growwithhr-input-error-${++counter}`;
      field.dataset.growwithhrErrorId = id;
    }
    let error = document.getElementById(id);
    if (!error) {
      error = document.createElement("p");
      error.id = id;
      error.className = "growwithhr-validation-message";
      error.setAttribute("role", "alert");
      wrapper.appendChild(error);
    }
    return error;
  }

  function setError(field, message) {
    if (!message) {
      field.classList.remove("growwithhr-invalid");
      wrapperFor(field)?.classList.remove("growwithhr-has-invalid");
      const id = field.dataset.growwithhrErrorId;
      const error = id ? document.getElementById(id) : null;
      if (error) { error.hidden = true; error.textContent = ""; }
      if (id) {
        const describedBy = (field.getAttribute("aria-describedby") || "")
          .split(/\s+/).filter(token => token && token !== id);
        if (describedBy.length) field.setAttribute("aria-describedby", describedBy.join(" "));
        else field.removeAttribute("aria-describedby");
      }
      if (field.classList.contains("growwithhr-invalid") === false &&
          !wrapperFor(field)?.querySelector(".advisory-field-error:not([hidden])")) {
        field.removeAttribute("aria-invalid");
      }
      return;
    }
    const error = ensureError(field);
    if (!error) return;
    field.classList.add("growwithhr-invalid");
    wrapperFor(field)?.classList.add("growwithhr-has-invalid");
    field.setAttribute("aria-invalid", "true");
    const describedBy = new Set((field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean));
    describedBy.add(error.id);
    field.setAttribute("aria-describedby", [...describedBy].join(" "));
    error.textContent = message;
    error.hidden = false;
  }

  function validateField(field) {
    if (!applicable(field)) return true;
    const message = messageFor(field);
    setError(field, message);
    return !message;
  }

  function validateForm(form, focusFirst = true) {
    if (!form) return true;
    let first = null;
    form.querySelectorAll(SELECTOR).forEach(field => {
      if (!applicable(field)) return;
      if (!validateField(field) && !first) first = field;
    });
    if (first && focusFirst) {
      first.focus({ preventScroll: false });
      first.scrollIntoView?.({ block: "center", behavior: "auto" });
    }
    return !first;
  }

  document.addEventListener("invalid", event => {
    const field = event.target;
    if (!applicable(field)) return;
    event.preventDefault();
    setError(field, messageFor(field) || `Check ${fieldLabel(field).toLowerCase()}.`);
  }, true);

  document.addEventListener("focusout", event => {
    if (applicable(event.target)) validateField(event.target);
  }, true);

  document.addEventListener("input", event => {
    const field = event.target;
    if (applicable(field) && field.classList.contains("growwithhr-invalid")) validateField(field);
  }, true);

  document.addEventListener("change", event => {
    const field = event.target;
    if (applicable(field) && field.classList.contains("growwithhr-invalid")) validateField(field);
  }, true);

  document.addEventListener("submit", event => {
    const form = event.target;
    if (!form?.querySelectorAll || validateForm(form)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);

  window.GrowWithHRFieldValidation = Object.freeze({ validateField, validateForm, messageFor });
})(window, document);

/* Optional guidance UI. Uses original form controls and their existing change handlers. */
const api = window.GrowWithHRAssessmentChoiceHelp;
if (api && !document.documentElement.dataset.gwhChoiceExperience) {
  document.documentElement.dataset.gwhChoiceExperience = 'true';
  const { catalog } = api;
  const fieldKey = control => control?.dataset.capabilityField || control?.id || control?.name || '';
  const titleOf = control => {
    const container = control.closest('[data-field-wrapper], .wcp-field, .org-field, .advisory-field, fieldset') || control.parentElement;
    return (container?.querySelector('legend, label[for]') || control.closest('label'))?.textContent.replace(/\s+/g, ' ').replace(/\s*\*\s*$/, '').trim() || fieldKey(control);
  };
  const controls = () => Array.from(document.querySelectorAll('main select, main input[type="radio"], main input[type="checkbox"]')).filter(control => catalog[fieldKey(control)]);
  const group = control => control instanceof HTMLSelectElement ? Array.from(control.options) : Array.from(document.querySelectorAll(`main input[name="${CSS.escape(control.name)}"]`)).filter(input => input.type === control.type);
  let activeControl = null;
  let activeTrigger = null;
  document.addEventListener('click', event => {
    const trigger = event.target.closest?.('.gwh-choice-help-trigger');
    if (!trigger) return;
    const container = trigger.closest('[data-field-wrapper], .wcp-field, .org-field, .advisory-field, fieldset');
    activeControl = container?.querySelector('select, input[type="radio"], input[type="checkbox"]') || null;
    activeTrigger = trigger;
    if (!activeControl) return;
    queueMicrotask(() => {
      const dialog = document.querySelector('.gwh-choice-help-dialog');
      if (!dialog?.open) return;
      const options = group(activeControl);
      const cards = Array.from(dialog.querySelectorAll('.gwh-choice-help-option'));
      const entry = catalog[fieldKey(activeControl)];
      let index = 0;
      options.forEach(option => {
        const description = entry?.options?.[option.value] || option.title || '';
        if (!description) return;
        const card = cards[index++];
        if (!card || card.querySelector('.gwh-choice-help-use')) return;
        const button = document.createElement('button');
        button.type = 'button'; button.className = 'gwh-choice-help-use';
        button.textContent = activeControl.type === 'checkbox' ? 'Toggle this option' : 'Use this answer';
        button.disabled = option.disabled || activeControl.disabled;
        button.addEventListener('click', () => {
          if (option instanceof HTMLOptionElement) {
            activeControl.value = option.value;
            activeControl.dispatchEvent(new Event('input', { bubbles: true }));
            activeControl.dispatchEvent(new Event('change', { bubbles: true }));
          } else {
            option.click();
          }
          dialog.close();
        });
        card.append(button);
      });
    });
  }, true);
  function renderOverview() {
    const form = document.querySelector('#wcpForm, #organizationForm, #advisoryForm, #assessmentForm, .advisory-form');
    if (!form || form.querySelector('.gwh-choice-help-overview')) return;
    const intro = form.querySelector('h2, h3, .advisory-field-group');
    if (!intro) return;
    const details = document.createElement('details');
    details.className = 'gwh-choice-help-overview';
    const summary = document.createElement('summary'); summary.textContent = 'Understanding these questions';
    const copy = document.createElement('div'); copy.className = 'gwh-choice-help-overview-content';
    const seen = new Set();
    controls().forEach(control => {
      const key = fieldKey(control);
      if (seen.has(key)) return;
      seen.add(key);
      const item = document.createElement('p');
      const heading = document.createElement('strong'); heading.textContent = titleOf(control);
      item.append(heading, document.createTextNode(' — ' + catalog[key].description));
      copy.append(item);
    });
    if (!seen.size) return;
    details.append(summary, copy);
    intro.insertAdjacentElement('afterend', details);
  }
  const update = () => { api.scan(); renderOverview(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', update, { once: true }); else update();
  const observer = new MutationObserver(records => {
    if (records.some(record => Array.from(record.addedNodes).some(node => node.nodeType === 1 && node.querySelector?.('select, input[type="radio"], input[type="checkbox"]')))) update();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

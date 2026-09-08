/* GrowWithHR contextual assessment help. Presentation only: never changes rules or saved schemas. */
(() => {
  'use strict';
  if (window.GrowWithHRAssessmentChoiceHelp) return;
  const field = (description, options = {}) => ({ description, options });
  const unknown = 'This information has not yet been confirmed.';
  const yn = { yes: 'This is currently true.', no: 'This is currently not true.', 'not-sure': unknown, unknown, 'dont-know': unknown, 'not-applicable': 'This question does not apply to the organization’s circumstances.' };
  const catalog = {
    importance: field('How essential is this capability to achieving your business strategy?', { critical: 'The strategy cannot be delivered, or a major business risk arises, without this capability.', important: 'The capability materially supports the strategy, but the business has some alternatives or flexibility.', supporting: 'The capability helps the business operate effectively but is not a primary driver of the strategic objective.' }),
    currentCoverage: field('How well does your organization currently possess the skills and expertise needed to deliver this capability?', { none: 'The required capability is not currently available internally.', low: 'Some relevant capability exists, but major gaps remain.', partial: 'Some requirements are covered, but not all of the capability can be delivered reliably.', adequate: 'The required capability is sufficiently available for the current business need.', unknown }),
    capacityStatus: field('Do you have enough available people and time to deliver the required work? This is different from whether the skills exist.', { insufficient: 'Available capacity is not enough to meet the required workload.', constrained: 'Delivery is possible, but capacity is stretched or leaves limited room for additional demand.', adequate: 'Available capacity is sufficient for the current expected workload.', unknown }),
    concentrationRisk: field('How dependent is the capability on a small number of people or a single source of expertise?', { 'single-point': 'One person or one critical source holds the capability, creating a significant continuity risk.', high: 'Expertise is concentrated in very few people, with limited backup.', medium: 'Some backup exists, but the capability would still be vulnerable to the loss of key expertise.', low: 'Expertise is reasonably distributed, with sufficient backup or knowledge transfer.', unknown }),
    internalAdjacency: field('Could people who already have related skills be developed, redeployed, or moved into this capability?', { yes: 'Related skills or experience exist internally and may provide a realistic development or mobility pathway.', no: 'No suitable adjacent capability has been identified so far.', unknown }),
    temporaryNeed: field('Is demand for this capability temporary, project-based, seasonal, or likely to fluctuate?', { yes: 'The need is time-bound or demand is expected to vary materially.', no: 'The capability is expected to be needed on an ongoing basis.', unknown }),
    workRedesignPotential: field('Could the work be simplified, reorganized, supported by technology, or automated before additional capacity is added?', { high: 'A substantial part of the work could potentially be redesigned or automated.', medium: 'Some meaningful activities could be redesigned or automated, while others still require existing ways of working.', low: 'Limited practical opportunity for redesign or automation has been identified.', unknown }),
    wcpBusinessImpact: field('What would happen to the business objective if this capability were not available when needed?', { critical: 'The objective would be blocked or exposed to a major business risk.', material: 'The objective could continue, but delivery, quality, cost, or performance would be materially affected.', moderate: 'The impact could be managed through an alternative approach or a limited delay.', '': unknown }),
    wcpHorizonMonths: field('By when must the capability be ready to deliver the required business outcome?', { '3': 'The capability must be usable within three months.', '6': 'The capability must be usable within six months.', '12': 'The capability must be usable within twelve months.', '18': 'The capability must be usable within eighteen months.', '24': 'The capability must be usable within twenty-four months.', '36': 'The capability must be usable within thirty-six months.', '': 'The required readiness date has not yet been established.' }),
    wcpFramework: field('Choose the planning lenses you want to compare. Each emphasizes a different part of the workforce decision.', { cipd: 'Start with workforce supply, demand, gaps, timing, location, and cost to build a complete workforce plan.', capability: 'Start with the business strategy and identify the capabilities, work, skills, and roles required to deliver it.', scenario: 'Test how different growth assumptions, redesigned work, or automation could change workforce demand.' }),
    growthStage: field('Which description best reflects your organization’s current stage of development? This is about operating maturity, not simply company age.', { Startup: 'The business is establishing its offering, operating model, and initial team.', Growth: 'The business is expanding and beginning to formalize roles, processes, and management responsibilities.', Scaling: 'The business is increasing its size or complexity and needs more repeatable systems and distributed ownership.', Enterprise: 'The business operates at a larger or more established scale with multiple functions, layers, or complex operations.', '': 'No clear stage has been established.' }),
    managerRole: field('Consider the typical manager’s role, not an individual manager’s performance.', { 'manager-only': 'Most time is spent leading people, allocating work, coordinating, and making management decisions.', 'player-coach': 'Managers divide their time between people management and their own specialist or delivery responsibilities.', 'hands-on-specialist': 'Managers primarily perform specialist work while also carrying people-management responsibilities.', 'dont-know': unknown }),
    workComplexity: field('How much judgment, problem-solving, or variation does the work usually require?', { routine: 'Work follows familiar patterns with relatively few exceptions.', mixed: 'Teams handle both repeatable activities and work requiring judgment or problem-solving.', complex: 'Work frequently requires specialist judgment, problem-solving, or adaptation.', 'dont-know': unknown }),
    workStandardization: field('To what extent can work be carried out using established processes, methods, or instructions?', { high: 'Most work follows established and repeatable processes.', mixed: 'Some activities are standardized, while others require adaptation.', low: 'Work frequently requires different approaches or handling of exceptions.', 'dont-know': unknown }),
    teamIndependence: field('How much routine work can teams complete without needing frequent manager intervention?', { high: 'Teams can handle most routine work and decisions within clear boundaries.', mixed: 'Teams work independently in some areas but need manager involvement in others.', low: 'Routine work or decisions often require manager direction or approval.', 'dont-know': unknown }),
    coachingIntensity: field('How much ongoing guidance, coordination, or coaching does the work normally require?', { low: 'Teams generally need limited routine guidance.', medium: 'Regular guidance or coaching is needed, but not continuously.', high: 'Work frequently requires close guidance, coordination, or coaching.', 'dont-know': unknown }),
    roleClarity: field('Do people generally understand what they own and where their responsibilities begin and end?', { clear: 'Responsibilities are understood, with limited recurring overlap.', mixed: 'Some responsibilities are well defined, while others create overlap or ambiguity.', unclear: 'Responsibilities frequently overlap, are duplicated, or lack a clear owner.', 'dont-know': unknown }),
    decisionRights: field('Is it clear who has authority to make recurring business decisions?', { clear: 'Decision ownership is understood and decisions usually move through the expected roles.', mixed: 'Some decisions have clear owners, while others move between people or functions.', unclear: 'Decisions frequently lack a clear owner or depend on founder/CEO intervention.', 'dont-know': unknown }),
    governanceCadence: field('How often do leaders from different functions meet to review business performance, priorities, and dependencies?', { weekly: 'A recurring cross-functional review takes place about once a week.', biweekly: 'A recurring review takes place approximately every two weeks.', monthly: 'A recurring review takes place about once a month.', 'ad-hoc': 'Reviews are arranged mainly when a specific issue requires attention.', none: 'There is no established recurring cross-functional review.', 'dont-know': unknown }),
    coordinationFriction: field('How often do handoffs, dependencies, or decisions between functions slow down work?', { low: 'Cross-functional work generally moves without recurring coordination problems.', some: 'Some handoffs or decisions repeatedly require additional coordination.', high: 'Coordination problems frequently delay work or decisions.', 'dont-know': unknown }),
    entity: field('Choose the organization’s actual registered legal form. If you are unsure, check the registration documents rather than guessing.', { 'Private Limited': 'A company registered as a private limited company.', 'Public Limited': 'A company registered as a public limited company.', LLP: 'A limited liability partnership.', 'One Person Company': 'A company registered under the one-person company structure.', 'DPIIT Recognized Startup': 'A business with the relevant startup recognition. Recognition and legal entity type are not necessarily the same thing.', Partnership: 'A business operated through a partnership structure.', Proprietorship: 'A business operated by a sole proprietor.', 'Trust / Society': 'An organization registered as a trust or society.', 'Government / PSU': 'A government organization or public-sector undertaking.', Other: 'The organization has a different legal structure.', 'Not Sure': 'The registered legal form has not been confirmed.' }),
    fundingStage: field('Which funding description is closest to the organization’s current position?', { Bootstrapped: 'The business is primarily funded by its founders, owners, or internally generated resources.', Seed: 'The business has received early-stage funding to establish or develop its offering.', 'Series A': 'The business has completed a funding round identified as Series A.', 'Series B': 'The business has completed a funding round identified as Series B.', 'Series C+': 'The business has completed Series C or a later funding round.', Public: 'The organization’s shares are publicly listed.', 'Not Applicable': 'These funding-stage descriptions do not apply to the organization.', 'Not Sure': unknown }),
    workModel: field('Choose the arrangement that best describes how people actually work, rather than only the formal policy.', { 'Office Based': 'Most people work from a shared workplace.', Hybrid: 'People divide their time between on-site and remote work.', Remote: 'Most people work away from a permanent workplace.', 'Field Workforce': 'A large part of the workforce works at customer or field locations.', 'Manufacturing / Plant': 'Work is primarily delivered from plants or production sites.', Mixed: 'Different parts of the organization use different working models.' }),
    remoteBand: field('Approximately what share of the workforce works remotely? Choose the closest range or enter an exact percentage if known.', { '0': 'No employees work remotely.', '1-24': 'Between 1% and 24% of the workforce works remotely.', '25-50': 'Between 25% and 50% of the workforce works remotely.', '51-75': 'Between 51% and 75% of the workforce works remotely.', '76-99': 'Between 76% and 99% of the workforce works remotely.', '100': 'All employees work remotely.', 'not-sure': unknown, exact: 'Enter the known remote workforce percentage.' }),
    hiringPlans: field('What best describes the expected change in workforce size over the next 12 months?', { 'Significant Growth': 'A meaningful increase in team size is expected.', 'Moderate Growth': 'The organization expects measured, ongoing growth.', 'Selective Hiring': 'Hiring will focus on a limited number of priority roles.', 'Maintain Current Size': 'Limited net headcount growth is expected.', 'Unsure; Market drives hiring needs': 'Hiring will depend on business or market conditions that are not yet clear.' }),
    expansionPlans: field('Which business changes are most likely over the next 12–18 months? Select all that apply.', { 'new-locations': 'Establish additional offices, plants, branches, or other operating sites.', 'new-markets': 'Expand business activity into new geographic markets.', 'new-products': 'Add new offerings that may require different work or capabilities.', 'scale-operations': 'Increase the volume or scale of existing operations.', restructure: 'Change how work, teams, or processes are organized.', 'no-major-expansion': 'No material expansion is currently expected.', 'still-deciding': 'The organization has not yet confirmed its direction.' }),
    peopleFunction: field('Which description is closest to how People and HR responsibilities are currently supported?', { 'Dedicated HR Team': 'A dedicated team owns the organization’s People or HR work.', 'Single HR/People Professional': 'One dedicated professional leads the function.', 'Founder Led': 'Founders or senior business leaders handle most People decisions.', 'Shared Admin Function': 'People responsibilities are combined with another business function.', 'External Consultant': 'External specialists provide ongoing HR support.', 'No Formal HR/People Function': 'There is no defined People-function owner or structure today.' }),
    priorities: field('Where would practical guidance be most useful right now? Choose the areas that matter most.', { 'hiring-onboarding': 'Attracting, selecting, and integrating people into the organization.', 'policies-compliance': 'Establishing employment policies, records, and compliance practices.', 'performance-rewards': 'Managing expectations, performance, recognition, and reward practices.', 'manager-capability': 'Helping managers lead people and make effective people decisions.', 'culture-engagement': 'Strengthening the employee experience, culture, and connection to the organization.', 'hr-operations-technology': 'Improving People processes, systems, and administrative effectiveness.', 'workforce-planning': 'Connecting business demand to future workforce requirements.', 'organisation-design': 'Clarifying structure, roles, reporting lines, and decision ownership.' }),
    workerCategories: field('Which types of people work with your organization? Select every category that applies. This describes the workforce mix; it does not by itself determine legal obligations.', { 'permanent-employees': 'Employees engaged on an ongoing employment basis.', 'fixed-term-employees': 'Employees engaged for a defined employment period.', 'part-time-employees': 'Employees who work fewer hours than the organization’s standard full-time arrangement.', 'factory-workers': 'People performing production, manufacturing, or other operational work.', 'agency-contract-labour': 'Workers supplied through a third-party agency or contractor.', 'independent-contractors': 'Individuals or service providers engaged to deliver work outside the regular employee arrangement.', 'interns-trainees': 'People engaged primarily for structured learning or practical experience.', apprentices: 'People engaged through an apprenticeship arrangement.', 'client-site-employees': 'Employees who regularly perform their work at customer or client locations.', 'overseas-employees': 'Employees engaged to work in another country.', 'not-sure': unknown }),
    womenEmployees: field('Are women currently employed by the organization?', yn),
    esiWageEligibility: field('Has payroll identified whether any employees may fall within the applicable ESI wage-eligibility limit? No individual salary is needed here.', { yes: 'At least one employee may be eligible under the applicable limit.', no: 'Payroll has confirmed that no employee is likely to be eligible.', 'not-sure': 'Payroll review is needed to confirm eligibility.' }),
    bonusWageEligibility: field('Has payroll identified whether any employees may fall within the applicable statutory bonus eligibility limit? No individual salary is needed here.', { yes: 'At least one employee may be eligible under the applicable limit.', no: 'Payroll has confirmed that no employee is likely to be eligible.', 'not-sure': 'Payroll review is needed to confirm eligibility.' }),
    manufacturingOperations: field('Does the organization perform production or manufacturing activities, rather than only selling or distributing finished products?', yn),
    usesPower: field('Is electrical or other power used to operate the production or manufacturing process?', yn),
    shiftPattern: field('Choose the arrangement that best describes the usual production or team schedule.', { 'day-only': 'Work is scheduled during daytime operating hours.', multiple: 'Work is divided into multiple scheduled shifts.', rotational: 'Employees rotate between different scheduled shifts.', continuous: 'Operations continue across the day and night, including through multiple shifts.', 'not-sure': unknown }),
    nightShifts: field('Does any scheduled work take place during the organization’s night-working period?', yn),
    womenNightShifts: field('Are women currently scheduled to work during night shifts?', yn),
    nightTransport: field('Does the organization arrange transport for employees working night shifts?', yn),
    nightSecurity: field('Are there established and documented arrangements for managing night-shift safety and security?', yn),
    clientSiteWorkers: field('Do employees routinely perform their work at customer or client premises?', yn),
    overseasWorkers: field('Does the organization employ people to work in another country?', yn)
  };
  const aliases = { importance: 'importance', currentCoverage: 'currentCoverage', capacityStatus: 'capacityStatus', concentrationRisk: 'concentrationRisk', internalAdjacency: 'internalAdjacency', temporaryNeed: 'temporaryNeed', workRedesignPotential: 'workRedesignPotential', 'wcpImportance': 'importance' };
  const excluded = new Set(['wcpCurrency', 'industry', 'primaryState', 'wcpCompanyName', 'wcpEmail']);
  const root = document.body;
  const forms = () => Array.from(document.querySelectorAll('form')).filter(form => form.closest('main') && !form.closest('[data-site-shell-header], [data-site-shell-footer]'));
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const labelText = element => (element?.textContent || '').replace(/\s+/g, ' ').replace(/\s*\*\s*$/, '').trim();
  let dialog, current, origin;
  function ensureDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.className = 'gwh-choice-help-dialog';
    dialog.setAttribute('aria-labelledby', 'gwhChoiceHelpTitle');
    dialog.innerHTML = '<div class="gwh-choice-help-head"><div><p class="gwh-choice-help-kicker">GROWWITHHR · FIELD GUIDE</p><h2 id="gwhChoiceHelpTitle"></h2></div><button type="button" class="gwh-choice-help-close" aria-label="Close explanation">×</button></div><p class="gwh-choice-help-description"></p><div class="gwh-choice-help-options"></div><p class="gwh-choice-help-note">These explanations help you choose an answer. They do not change the assessment rules or determine a legal or employment outcome.</p>';
    dialog.querySelector('.gwh-choice-help-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { if (origin?.isConnected) origin.focus({ preventScroll: true }); current = null; });
    document.body.append(dialog);
    return dialog;
  }
  function choicesFor(control) {
    if (control instanceof HTMLSelectElement) return Array.from(control.options).filter(option => option.value !== '' || !option.disabled);
    if (control instanceof HTMLInputElement && /^(radio|checkbox)$/.test(control.type)) return Array.from(document.querySelectorAll(`input[name="${CSS.escape(control.name)}"]`)).filter(input => input.closest('main'));
    return [];
  }
  function isSelected(option) { return option instanceof HTMLOptionElement ? option.selected : option.checked; }
  function optionValue(option) { return option.value; }
  function optionLabel(option) { return option instanceof HTMLOptionElement ? option.textContent.trim() : labelText(option.closest('label') || option.parentElement?.querySelector('label')) || option.value; }
  function entryFor(control, options) {
    const key = control.dataset.capabilityField || control.id || control.name;
    return catalog[aliases[key] || key] || null;
  }
  function openGuide(control, title, entry, trigger) {
    current = control; origin = trigger;
    const panel = ensureDialog();
    panel.querySelector('#gwhChoiceHelpTitle').textContent = title;
    panel.querySelector('.gwh-choice-help-description').textContent = entry.description;
    const list = panel.querySelector('.gwh-choice-help-options');
    list.replaceChildren();
    const options = choicesFor(control);
    options.forEach(option => {
      const value = optionValue(option);
      const description = Object.prototype.hasOwnProperty.call(entry.options, value) ? entry.options[value] : (option.dataset.helpDescription || option.title || '');
      if (!description) return;
      const item = document.createElement('div');
      item.className = 'gwh-choice-help-option';
      const heading = document.createElement('strong'); heading.textContent = optionLabel(option);
      const text = document.createElement('p'); text.textContent = description;
      item.append(heading, text);
      if (isSelected(option)) { item.classList.add('is-selected'); const selected = document.createElement('span'); selected.className = 'gwh-choice-help-selected'; selected.textContent = 'Current selection'; item.prepend(selected); }
      list.append(item);
    });
    if (typeof panel.showModal === 'function') panel.showModal(); else panel.setAttribute('open', '');
    panel.querySelector('.gwh-choice-help-close').focus();
  }
  function enhance(control) {
    if (!(control instanceof HTMLSelectElement || control instanceof HTMLInputElement)) return;
    if (control.closest('.gwh-choice-help-dialog') || control.dataset.gwhHelpReady) return;
    const entry = entryFor(control);
    if (!entry) return;
    const container = control.closest('[data-field-wrapper], .wcp-field, .org-field, .advisory-field, fieldset, .industry-adaptive-field') || control.parentElement;
    if (!container || !container.closest('main')) return;
    const name = control.dataset.capabilityField || control.name || control.id;
    const groupControls = control instanceof HTMLInputElement && /^(radio|checkbox)$/.test(control.type) ? Array.from(container.querySelectorAll(`input[name="${CSS.escape(name)}"]`)) : [control];
    const titleElement = container.querySelector('legend, label[for], .wcp-field > label, .org-field > label') || control.closest('label');
    if (!titleElement) return;
    const title = labelText(titleElement);
    const marker = document.createElement('button');
    marker.type = 'button'; marker.className = 'gwh-choice-help-trigger'; marker.textContent = 'ⓘ'; marker.title = `Explain ${title}`; marker.setAttribute('aria-label', `Explain ${title}`);
    marker.addEventListener('click', () => openGuide(control, title, entry, marker));
    const host = document.createElement('span'); host.className = 'gwh-choice-help-trigger-wrap'; host.append(marker);
    if (titleElement.tagName === 'LEGEND') titleElement.append(host); else titleElement.insertAdjacentElement('afterend', host);
    groupControls.forEach(item => { item.dataset.gwhHelpReady = 'true'; });
    if (control instanceof HTMLSelectElement) Array.from(control.options).forEach(option => { const description = entry.options[option.value]; if (description) option.title = description; });
    if (control instanceof HTMLInputElement && control.type === 'radio') groupControls.forEach(item => { const description = entry.options[item.value]; if (description) item.title = description; });
  }
  function scan() {
    if (!document.body) return;
    document.querySelectorAll('main select, main input[type="radio"], main input[type="checkbox"]').forEach(enhance);
  }
  let scheduled = false;
  function schedule() { if (scheduled) return; scheduled = true; queueMicrotask(() => { scheduled = false; scan(); }); }
  const observer = new MutationObserver(records => { if (records.some(record => Array.from(record.addedNodes).some(node => node.nodeType === 1 && (node.matches?.('select, input, fieldset, .wcp-capability-card, .advisory-field, .advisory-choice-fieldset') || node.querySelector?.('select, input[type="radio"], input[type="checkbox"]'))))) schedule(); });
  function start() { scan(); observer.observe(document.body, { childList: true, subtree: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
  window.GrowWithHRAssessmentChoiceHelp = Object.freeze({ catalog, scan, openGuide });
})();
import './assessment-choice-help.js';
import './assessment-choice-help-experience.mjs';

if (!document.querySelector('link[data-growwithhr-choice-help]')) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('../css/assessment-choice-help.css', import.meta.url).href;
  link.dataset.growwithhrChoiceHelp = '';
  document.head.appendChild(link);
}

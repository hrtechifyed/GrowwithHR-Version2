const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'js/executive-advisory-report.js'), 'utf8');

function createElement() {
  return {
    textContent: '',
    innerHTML: '',
    addEventListener() {}
  };
}

function runScenario(data) {
  const elements = new Map();
  const getElement = (id) => {
    if (!elements.has(id)) elements.set(id, createElement());
    return elements.get(id);
  };

  const context = {
    console,
    localStorage: {
      getItem(key) {
        return key === 'growwithhr-report' ? JSON.stringify(data) : null;
      }
    },
    document: {
      getElementById: getElement,
      querySelector(selector) {
        return getElement(selector.replace(/[^a-zA-Z0-9_-]/g, '') || 'query');
      },
      querySelectorAll() {
        return [];
      }
    },
    window: {
      print() {}
    }
  };

  vm.createContext(context);
  vm.runInContext(`${source}\nthis.ExecutiveAdvisoryReport = ExecutiveAdvisoryReport;`, context);
  new context.ExecutiveAdvisoryReport();

  return {
    companyName: getElement('companyName').textContent,
    organisationStage: getElement('organisationStage').textContent,
    executiveFocus: getElement('executiveFocus').textContent,
    narrative: getElement('executiveNarrative').innerHTML,
    observations: getElement('observationsContainer').innerHTML,
    attention: getElement('attentionContainer').innerHTML,
    compliance: getElement('complianceContainer').innerHTML,
    recommendations: getElement('recommendationsContainer').innerHTML
  };
}

const employeeCounts = [0, 1, 9, 10, 19, 20, 49, 50, 99, 100, 249, 500, 1000];
const peopleFunctions = ['No Formal HR/People Function', 'Founder Led', 'Dedicated HR Team', 'People Operations'];
const industries = ['Technology', 'Manufacturing', 'Healthcare', 'Retail', 'Professional Services'];
const states = ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Gujarat'];

const scenarios = Array.from({ length: 50 }, (_, index) => ({
  companyName: `Scenario Company ${index + 1}`,
  industry: industries[index % industries.length],
  primaryState: states[index % states.length],
  entity: index % 2 ? 'Private Limited Company' : 'LLP',
  employees: employeeCounts[index % employeeCounts.length],
  contractWorkers: index % 3 === 0 ? 5 : 0,
  apprentices: index % 4 === 0 ? 2 : 0,
  peopleFunction: peopleFunctions[index % peopleFunctions.length],
  fundingStage: index % 2 ? 'Scaling' : 'Bootstrapped',
  hiringPlans: index % 3 === 0 ? 'Hiring aggressively' : 'Selective hiring'
}));

const outputs = scenarios.map(runScenario);

assert.strictEqual(outputs.length, 50, 'Expected exactly 50 report scenarios to run.');
outputs.forEach((output, index) => {
  assert.strictEqual(output.companyName, `Scenario Company ${index + 1}`, 'Company name should be scenario-specific.');
  assert(output.narrative.includes(scenarios[index].industry), 'Narrative should include scenario industry.');
  assert(output.recommendations.includes(scenarios[index].hiringPlans), 'Recommendations should include scenario hiring plans.');
});

const stages = new Set(outputs.map((output) => output.organisationStage));
assert(stages.has('Developing Organisation'), 'Expected developing organisation output.');
assert(stages.has('Growth Organisation'), 'Expected growth organisation output.');
assert(stages.has('Scaling Organisation'), 'Expected scaling organisation output.');
assert(stages.has('Enterprise Organisation'), 'Expected enterprise organisation output.');

const complianceOutputs = outputs.map((output) => output.compliance);
assert(complianceOutputs.some((html) => html.includes('Provident Fund review')), 'Expected EPF recommendation for employee threshold scenarios.');
assert(complianceOutputs.some((html) => html.includes('ESI and gratuity applicability')), 'Expected ESI/gratuity recommendation for threshold scenarios.');
assert(complianceOutputs.some((html) => html.includes('Contract workforce governance')), 'Expected contract workforce recommendation.');
assert(complianceOutputs.some((html) => html.includes('Apprenticeship governance')), 'Expected apprenticeship recommendation.');

const uniqueSignatures = new Set(outputs.map((output) => [
  output.organisationStage,
  output.executiveFocus,
  output.compliance,
  output.observations,
  output.recommendations
].join('|')));
assert(uniqueSignatures.size >= 20, `Expected dynamic report variation across scenarios, got ${uniqueSignatures.size}.`);

console.log(`Dynamic advisory report scenarios passed: ${outputs.length} scenarios, ${uniqueSignatures.size} unique output signatures.`);

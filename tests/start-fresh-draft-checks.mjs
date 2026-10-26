import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const script = fs.readFileSync("js/reset-on-refresh.js", "utf8");
const ORGANIZATION = "growwithhr.organization.draft.v1:local";
const COMPLIANCE = "growwithhr-advisory-briefing-v2";
const protectedValues = {
    "growwithhr-report": '{"completed":true}',
    "growwithhr-lead": '{"email":"founder@example.org"}',
    "growwithhr-advisory-delivery-v1": '{"sent":true}',
    "growwithhr.auth": "token",
    "growwithhr.reminder.preferences": '{"enabled":true}'
};

function storage(initial) {
    const map = new Map(Object.entries(initial));
    return {
        getItem: key => map.has(key) ? map.get(key) : null,
        setItem: (key, value) => map.set(key, String(value)),
        removeItem: key => map.delete(key),
        snapshot: () => Object.fromEntries(map)
    };
}

function simulate(scope, seed, answer) {
    const localStorage = storage(seed);
    const sessionStorage = storage({
        "growwithhr.workspace": '{"reportId":"RPT-42","recoveryCode":"test"}',
        "growwithhr.organization.report": '{"completed":true}'
    });
    let prompts = 0;
    const context = {
        document: { body: { dataset: { refreshResetScope: scope } } },
        window: {
            localStorage, sessionStorage,
            confirm: () => { prompts++; return answer; }
        }
    };
    vm.runInNewContext(script, context, { filename: "reset-on-refresh.js" });
    return { localStorage, sessionStorage, prompts };
}

const orgDraftKey = "growwithhr.organization.draft.v1:RPT-42";
const orgDraft = JSON.stringify({ version: 1, values: { employeeCount: "42" } });
for (const answer of [true, false]) {
    const result = simulate("organization", { ...protectedValues, [orgDraftKey]: orgDraft, [ORGANIZATION]: orgDraft }, answer);
    assert.equal(result.prompts, 1);
    assert.equal(result.localStorage.getItem(orgDraftKey), answer ? null : orgDraft);
    assert.equal(result.localStorage.getItem(ORGANIZATION), orgDraft, "other draft remains intact");
    assert.deepEqual(result.sessionStorage.snapshot(), {
        "growwithhr.workspace": '{"reportId":"RPT-42","recoveryCode":"test"}',
        "growwithhr.organization.report": '{"completed":true}'
    });
    for (const [key, value] of Object.entries(protectedValues)) assert.equal(result.localStorage.getItem(key), value);
}

const incomplete = JSON.stringify({ started: true, completed: false, answers: { company: "Example" }, lead: { marketingConsent: true } });
const declined = simulate("compliance", { ...protectedValues, [COMPLIANCE]: incomplete }, false);
assert.equal(declined.prompts, 1);
assert.equal(declined.localStorage.getItem(COMPLIANCE), incomplete);
const accepted = simulate("compliance", { ...protectedValues, [COMPLIANCE]: incomplete }, true);
assert.equal(accepted.prompts, 1);
assert.equal(JSON.parse(accepted.localStorage.getItem(COMPLIANCE)).lead.marketingConsent, true);
assert.equal(JSON.parse(accepted.localStorage.getItem(COMPLIANCE)).started, false);
for (const [key,value] of Object.entries(protectedValues)) assert.equal(accepted.localStorage.getItem(key), value);

assert.equal(simulate("compliance", { [COMPLIANCE]: JSON.stringify({ started: true, completed: true }) }, true).prompts, 0);
assert.equal(simulate("organization", protectedValues, true).prompts, 0);
assert.equal(simulate("compliance", { ...protectedValues, [COMPLIANCE]: JSON.stringify({ started: false, completed: false, lead: { marketingConsent: true } }) }, true).prompts, 0);
console.log("Start Fresh draft preservation and consent checks passed.");

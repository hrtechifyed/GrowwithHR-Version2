> **Testing reference:** use with `docs/TESTING_CHECKLIST.md`.

# GrowWithHR Responsive Manual Test Matrix

Version: 0.15.0-beta  
Build marker: `responsive-repair-20260716-0000`

## Environment limitation
Browser automation could not be executed in this container because Playwright is not declared in `package.json` and `npx playwright --version` attempted to fetch the package from npm but received `403 Forbidden`. Per project instruction, dependencies were not installed.

## Viewports requiring reviewer browser verification
Status key: not verified = requires manual/browser review.

| Viewport | Status | Expected behaviour |
|---|---:|---|
| 320×568 | not verified | No horizontal overflow; advisory stage keeps one active state; Executive Intelligence stacks/tabs; footer centered. |
| 360×640 | not verified | Same as above. |
| 360×800 | not verified | Same as above. |
| 375×667 | not verified | Same as above. |
| 390×844 | not verified | Executive Intelligence graph centered; coach and Question 1 use same top anchor. |
| 412×915 | not verified | Same as above. |
| 430×932 | not verified | Same as above. |
| 640×360 | not verified | Landscape has no clipped controls; natural page scroll works. |
| 667×375 | not verified | Same as above. |
| 844×390 | not verified | Same as above. |
| 932×430 | not verified | Same as above. |
| 768×1024 | not verified | Tablet layout has usable nav/graph distribution and centered cards. |
| 820×1180 | not verified | Same as above. |
| 1024×768 | not verified | Navigation column and graph share shell width. |
| 1180×820 | not verified | Same as above. |
| 1280×720 | not verified | Laptop layout has no unused right column. |
| 1366×768 | not verified | Same as above. |
| 1440×900 | not verified | Large layout centered; graph scales with shell. |
| 1536×864 | not verified | Same as above. |
| 1920×1080 | not verified | Same as above. |
| 345px width | not verified | Between-breakpoint overflow check passes. |
| 385px width | not verified | Between-breakpoint overflow check passes. |
| 405px width | not verified | Between-breakpoint overflow check passes. |
| 600px width | not verified | Between-breakpoint overflow check passes. |
| 900px width | not verified | Between-breakpoint overflow check passes. |
| 1100px width | not verified | Between-breakpoint overflow check passes. |
| 1500px width | not verified | Between-breakpoint overflow check passes. |

## Manual console checks
```js
window.GWHR_BUILD_ID
window.innerWidth
window.innerHeight
document.documentElement.scrollWidth <= document.documentElement.clientWidth
window.introSequence?.getState?.()
window.executiveAssessment
Array.from(document.querySelectorAll('[id]')).map(element => element.id).filter((id, index, ids) => ids.indexOf(id) !== index)
```

Shared stage:
```js
const stage = document.querySelector('.advisory-experience-stage');
console.table({ top: stage?.getBoundingClientRect().top, width: stage?.getBoundingClientRect().width, height: stage?.getBoundingClientRect().height, state: stage?.dataset?.state });
```

Overflow:
```js
console.table({ viewport: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth });
```

Coach and assessment alignment:
```js
const coach = document.querySelector('#coachIntroduction');
const question = document.querySelector('[data-testid="assessment-question"], .exec-question-card');
console.table({ coachTop: coach?.getBoundingClientRect().top, questionTop: question?.getBoundingClientRect().top, difference: coach && question ? Math.abs(coach.getBoundingClientRect().top - question.getBoundingClientRect().top) : null });
```

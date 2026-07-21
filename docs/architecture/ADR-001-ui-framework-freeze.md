> **Decision remains active:** production stays framework-free through the current roadmap unless superseded by a new ADR.

# ADR-001: Freeze the Production UI Framework

## Status

Accepted

## Decision

During the current product-logic redesign program, the production UI will remain
implemented with static HTML, CSS and browser JavaScript.

The existing React and TypeScript layer remains experimental and is not part of
the production migration or redesign scope.

## Rules

- Do not migrate production pages to React.
- Do not introduce React as a dependency of the production experience.
- Do not create duplicate production implementations in static JavaScript and React.
- Keep product-logic changes in the existing framework-neutral browser modules where practical.
- React experiments must not be required to build, test or deploy production.
- Any future framework migration requires a separate architecture decision and migration program.

## Source of Truth

- Production UI: static HTML, CSS and browser JavaScript
- Experimental UI: React and TypeScript
- Production product behaviour: static production experience

## Consequences

The current program can focus on product logic, reliability, accessibility and
maintainability without introducing framework-migration risk.

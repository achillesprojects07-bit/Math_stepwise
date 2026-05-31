# Math_stepwise

## Phase 2 — App Skeleton / Engine

This phase builds the first working app skeleton after the Phase 1 rules were locked.

## What is included

- `index.html` — opens the app directly in a browser
- `src/app.js` — student view, parent view, level dropdown, lesson map, and lesson runner
- `src/styles.css` — app styling
- `src/engine/masteryEngine.js` — mastery and promotion logic
- `src/engine/questionGenerator.js` — starter question generator
- `src/engine/progressStore.js` — local progress storage helper
- `src/data/level6A.js` — generated 6A lesson IDs and starter lesson data
- `src/config/masteryRules.json` — locked Phase 1 mastery rules
- `src/config/levels.json` — locked level list and SCT flags
- `src/utils/ruleValidator.js` — Phase 1 rule validator
- `docs/PHASE2_APP_ENGINE.md` — Phase 2 notes
- `audit/PHASE2_AUDIT.md` — audit report
- `audit/phase2Audit.js` — audit script

## How to open

Open `index.html` in a browser.

## How to audit

Run:

```bash
npm run audit
```

This checks required files, validates JSON, tests mastery logic, confirms Level 6A has 200 generated lessons, and checks that child-facing app copy avoids backend-rule wording.

## Locked principle

The rules work behind the scenes. The student-facing app remains simple, encouraging, and uncluttered. Parent/admin view may show more detail, but should still be clean.

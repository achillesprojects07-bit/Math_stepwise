# Phase 1 — Rules & Curriculum Logic

This phase locks the app rules before coding the full learning engine.

## Phase 1 Deliverables

- `docs/PHASE1_RULES.md` — human-readable rulebook
- `docs/CURRICULUM_SCOPE.md` — curriculum and level handling plan
- `src/config/masteryRules.json` — machine-readable mastery, repeat, review, and promotion rules
- `src/config/levels.json` — level list, status, SCT availability, and level categories
- `src/utils/ruleValidator.js` — simple validator for the rules/config files
- `audit/PHASE1_AUDIT.md` — audit report for bugs, errors, broken logic, and missing files

## Locked Principle

The rules work behind the scenes. The student-facing app remains simple, encouraging, and uncluttered. Parent/admin view may show more detail, but should still be clean.

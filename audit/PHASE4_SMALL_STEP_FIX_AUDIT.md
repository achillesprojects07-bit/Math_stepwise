# Phase 4 Small-Step Ladder Fix Audit

Audit status: PASS

## Issue fixed
The 3A/2A addition generator could still jump from a small item such as `1 + 3` to a large item such as `21 + 3` inside the same lesson. This violated the small-step ladder rule.

## Fix applied
- Added `additionBand()` to compute a narrow number band per lesson.
- Added `smallStepLeftValue()` so addition questions first climb a short ladder, then mix only within the same introduced band.
- Removed the old lesson-number formula that caused sudden jumps.
- 3A and 2A remain typed-answer modes.

## QA checks
- PASS: 3A/2A addition questions use typed input.
- PASS: Early Adding 3 lessons generate only narrow low-number bands.
- PASS: Same lesson no longer mixes `1 + 3` and `21 + 3`.
- PASS: Mixed review is restricted to the same introduced band inside a lesson.
- PASS: Parent/student UX from the previous Phase 4 build is preserved.

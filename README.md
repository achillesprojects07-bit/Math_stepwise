# StepWise Math — Phase 2 No-Freeze Final Workflow Build

This upload-ready build completes the Phase 2 app skeleton workflow fixes before Level 6A full content expansion.

## Included

- Student Home with visible date and clean Today's Plan.
- Start Today's Work button that opens the current work.
- Lesson map moved to a separate Progress Map screen.
- Progress Map uses status colors and locks future lessons.
- Parent View is protected by a parent code gate.
- Parent-only Reset Student Progress in Parent Settings.
- Practice Again continues until all practice items are correct.
- Continue to Next Lesson unlocks only after mastery.
- Daily Work Record with date filters, level filter, progress graph, repetition graph, and recommendations.
- Quick Warm-Up from app recommendation or parent assignment.
- Future levels locked for assignment, current and lower/completed levels available.

## Upload instructions

Extract the ZIP. Open the extracted folder and upload these six items to GitHub:

```txt
audit
docs
src
index.html
package.json
README.md
```

Do not upload the outer folder.

## Parent code

Demo parent code: `1234`


## Latest fix

This version fixes the freeze caused by edge-case multiple-choice generation when the child makes several mistakes or enters Practice Again. The audit includes a 4+ mistake stress check.


## Reset fix

This build fixes the parent reset behavior so resetting returns the app to **6A-1** and clears all old Math Stepwise progress keys from previous builds.

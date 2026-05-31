# StepWise Math — Phase 2 Improved App Skeleton

This package contains the improved Phase 2 app skeleton and engine.

## What changed in this improved Phase 2

- Added **Student View** and **Parent View** navigation.
- Added **Student Information** page for enrollment details.
- Added **Daily Work Record** so parents can see completed work.
- Kept levels in a **dropdown** to avoid page clutter.
- Kept mastery rules hidden from the child-facing app.
- Preserved the same upload structure so future GitHub uploads can replace files without deleting.

## Upload structure

Upload these items at the GitHub repo root:

```txt
audit/
docs/
src/
index.html
package.json
README.md
```

Do not drag the outer folder. Drag only the contents listed above.

## Audit

Run:

```bash
npm run audit
```

The audit checks required files, JSON validity, Level 6A structure, student profile storage, daily work record support, and hidden backend mastery language on the child-facing screen.

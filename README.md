# Math Stepwise — Phase 2 Latest Corrected Build

This is the audited Phase 2 app skeleton with the corrected mastery workflow, retention practice, parent reset, Quick Warm-Up assignment, Daily Work Record filters, and progress/repetition graphs.

## Upload structure

Upload these items at the repository root:

```txt
audit/
docs/
src/
index.html
package.json
README.md
```

Do not drag the outer folder. Drag the contents inside the extracted folder.

## Included in this build

- Student View with visible date and clean lesson labels like `6A-13`
- Quick Warm-Up before the lesson when app or parent assigns practice
- Practice Again before ending a session
- Practice Again continues until all practice items are correct
- End Today’s Session and Continue to Next Lesson
- Continue to Next Lesson unlocks only after mastery
- Parent View with Student Information, Daily Work Record, Warm-Up assignment, and Parent Settings
- Parent-only Reset Student Progress with confirmation
- Daily Work Record with date range and level filters
- Separate Progress Graph and Practice & Repetition Graph
- Parent can assign Quick Warm-Up by current/lower level and lesson range
- Future levels are locked in parent assignment
- App recommendation is used by default when parent does nothing
- Parent assignment overrides app recommendation

## Audit

Run:

```bash
npm run audit
```

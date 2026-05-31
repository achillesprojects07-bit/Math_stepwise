# Math Stepwise — Phase 2 Rebuilt

This is the upload-ready Phase 2 app skeleton with retention workflow and parent controls.

## Upload structure

Upload these items together to GitHub:

```txt
audit/
docs/
src/
index.html
package.json
README.md
```

Do not drag the outer extracted folder. Drag the six items above.

## Included

- Student View and Parent View
- Level dropdown, using clean visible lesson labels like `6A-1`, `6A-13`, `6A-200`
- Level 6A preview curriculum with 200 generated lesson IDs
- Practice Again workflow after each lesson/block
- Practice Again continues until all retention items are correct
- Practice Again is based on wrong-first-try items, slow correct items, and similar generated items
- End Today’s Session and Continue to Next Lesson buttons
- Parent-only Reset Student Progress button
- Student Information page
- Daily Work Record with recommendations
- Parent’s Choice assignment for the next session only
- No child-facing reset/demo button

## Local audit

```bash
npm run audit
```

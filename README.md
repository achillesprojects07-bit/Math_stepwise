# Math Stepwise — Phase 4 Early Levels Expansion

This upload-ready build expands the app from Level 6A into the early math ladder:

**6A → 5A → 4A → 3A → 2A**

## What changed

- Added Level 5A, 4A, 3A, and 2A as available built levels.
- Starting point can now be chosen from all built levels.
- Starting lesson updates according to the selected starting level.
- Current level and lesson remain app-controlled by mastery progress.
- Reset returns to the chosen starting point, not always 6A-1.
- Parent Quick Warm-Up can be assigned from the current level or lower/completed levels.
- Future/unbuilt levels remain locked.
- Added typed-answer mode for number writing, sequences, and addition.
- Daily record filters and line graphs remain included.
- Practice Again continues until all practice items are correct.

## Upload structure

Upload these six items to GitHub:

```txt
audit
docs
src
index.html
package.json
README.md
```


## Phase 4 Content Fix

This corrected build exposes 6A, 5A, 4A, 3A, and 2A as built/available levels. Each level has an explicit 200-lesson curriculum file in `src/curriculum/`, and the Starting Level dropdown shows only built levels, not locked future placeholders.


## Student Info Editing and Learning Materials

This build adds repeat editing for Student Information, confirmation when changing the starting point, and a Parent View Table of Learning Materials for 6A through 2A.

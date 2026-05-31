# Phase 2 Rebuilt Notes

## Child workflow

1. Child opens Student View.
2. If a parent assigned practice from a previous review, it appears as `Quick Practice` at the start of the next session.
3. Child completes the main lesson/block.
4. The app runs Practice Again based on:
   - items answered wrong on the first try,
   - items answered correctly but slowly,
   - similar generated items from the same skill.
5. Practice Again continues until every practice item is answered correctly.
6. Child chooses either:
   - End Today’s Session
   - Continue to Next Lesson

## Parent workflow

1. Parent reviews Daily Work Record.
2. App shows recommendations based on first-try mistakes, slow items, and repeated review needs.
3. Parent may assign Parent’s Choice Practice for the next session.
4. Parent may reset student progress from Parent View only.

## Lesson label UX

Visible labels use `6A-1`, `6A-2`, `6A-13`, etc. Backend IDs can remain `6A001`, `6A002`, `6A013`.

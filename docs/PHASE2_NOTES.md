# Phase 2 Improved Notes

Phase 2 builds the reusable app skeleton/engine. It does not yet fully build every Level 6A question or lesson. That belongs to Phase 3.

## Locked UI direction

- Student View must remain simple and encouraging.
- Parent View may show progress, student information, daily records, review queue, and readiness signals.
- Level selection must use a dropdown to avoid clutter.
- Backend rules must not overwhelm the child-facing screen.

## Data recorded by the app

The app stores demo data in browser `localStorage`:

- Student profile
- Current selected level
- Daily work records
- Review queue
- Lesson progress summary

## Mastery rule carried forward

Mastery is based on:

1. Final corrected accuracy reaching 100%.
2. Timed levels satisfying the SCT-based target.
3. All review items being cleared before promotion.
4. 6A/5A tracking time softly because SCT is not used for these levels.

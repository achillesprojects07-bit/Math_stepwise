# Phase 1 Rulebook — Mastery-Based Math App

## 1. Core Learning Principle

The app is mastery-based. A child does not move forward just because a lesson was opened or completed. Advancement requires mastery.

Mastery is based on two parameters:

1. Correctness after correction
2. Time standard, when a time standard exists

The app should allow the child to finish a learning block even if the target time has been exceeded. The total time is recorded and used to classify mastery.

## 2. Student View vs Parent View

### Student View

The student view must remain simple, warm, and uncluttered.

Student-facing language should be encouraging:

- Correct!
- Great work!
- Try one more like this.
- Practice again.
- Next lesson unlocked.

Student-facing language must not expose backend rules such as:

- SCT failure
- mastery parameter failure
- accuracy condition not satisfied
- repeated-error classification
- promotion requirement failed

### Parent/Admin View

The parent/admin view may show clean summaries:

- Mastered
- Completed — Needs Fluency
- Needs Review — Accuracy
- Needs Review — Repeated Error
- Level Ready
- Promoted

The parent/admin view should not overwhelm the page with every rule. It should summarize what matters and allow details only when needed.

## 3. Learning Block Rules

A learning block is the practical unit the child completes in the app.

A learning block may represent one worksheet-equivalent lesson or a grouped set of worksheet-equivalent lessons.

The child must always be allowed to finish the learning block. The app must not cut the child off when time is exceeded.

## 4. Time Rules

### Levels with SCT

When the curriculum table provides SCT, the learning block target time is based on SCT.

Formula:

```text
Learning Block Target Time = SCT per worksheet × number of worksheet-equivalent lessons in the block
```

Total time includes:

- answering time
- correction time
- review inside the active block

If the child finishes over the target time, the lesson may be completed but is not mastered for fluency.

### Levels without SCT

For levels where SCT is not used, time is tracked but not used as a hard mastery gate.

This applies to:

- ZI
- ZII
- 6A
- 5A

For these levels, mastery depends mainly on corrected accuracy and cleared review.

## 5. Accuracy Rules

Final corrected accuracy must be 100% for mastery.

This means:

- the child may make mistakes during the first attempt
- mistakes must be corrected
- the final state of the learning block must have no unresolved wrong answers

A lesson is not mastered if any wrong answer remains uncorrected.

## 6. Repeat and Needs Review Rules

A lesson or skill enters Needs Review when:

- mistakes are not corrected
- mistakes repeat within the same skill
- corrected accuracy reaches 100% but time exceeds the target in SCT-based levels
- the child depends on hints or support too much
- the child abandons the block before finishing

### Status Logic

| Result | Status |
|---|---|
| 100% corrected accuracy + within SCT-based target | Mastered |
| 100% corrected accuracy + over target time | Completed — Needs Fluency |
| Less than 100% corrected accuracy | Needs Review — Accuracy |
| Same skill repeatedly missed | Needs Review — Repeated Error |
| Started but not finished | In Progress / Repeat Required |

## 7. Level Promotion Rules

A child may move to the next level only when the current level is cleared.

Level promotion requires:

1. All required lessons completed
2. All required lessons mastered or cleared according to level rules
3. Needs Review queue cleared
4. Final level mastery check passed
5. Time standard satisfied when the level has SCT

For 6A and 5A, where SCT is not used, the final level mastery check requires corrected accuracy and cleared review, but no hard SCT gate.

## 8. Lesson Unlocking Rules

The app may unlock the next lesson when the current lesson is mastered.

If a lesson is completed but marked Needs Fluency, the next lesson may be visually visible, but the system should keep the skill in review until fluency is cleared.

Recommended implementation:

- strict mode: next lesson stays locked until mastery
- flexible mode: next lesson opens, but level promotion remains blocked until review is cleared

For early MVP, use strict mode for clarity.

## 9. Optional Extra Practice

After the required learning block is complete, the child may choose to answer more.

Optional practice should not pressure the child.

Optional practice may improve fluency and clear review items, but should not replace the required mastery block.

## 10. Locked App Rule

The app must keep rules in the backend/config layer. The student-facing interface should show only simple, encouraging progress language.

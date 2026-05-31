# Phase 2 No-Freeze Fix Notes

## What was fixed

The app could appear to freeze when the child made several mistakes. The underlying issue was the multiple-choice generator, not the tenth question itself.

The old choice generator attempted to create four unique choices using nearby number offsets. For small ranges such as 1–5, an edge answer like 5 could only produce 3, 4, and 5 from the offset logic. It could not reliably produce a fourth unique choice, so the loop could continue indefinitely.

## New rule

Choices are now generated from the full available number range.

Example for answer 5 in a 1–5 lesson:

- Correct answer: 5
- Distractors can come from: 1, 2, 3, 4

This guarantees the question generator can always complete.

## Practice Again behavior

- Wrong answers during Practice Again keep the same item active.
- Practice Again does not expand endlessly during wrong answers.
- The child continues until all Practice Again items are correct.
- If the child has many mistakes, the app works through the practice queue one item at a time.

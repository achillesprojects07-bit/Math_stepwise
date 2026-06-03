# Phase 2 Parent Passcode Update

This build adds parent passcode management inside Parent View.

## Included

- Parent View remains protected by a parent code.
- Default parent code is `1234`.
- Parent Settings now includes **Change Parent Passcode**.
- Parent can enter current code, new code, and confirm new code.
- New code must be 4 to 6 digits.
- Parent can reset the parent code back to `1234`.
- Child-facing Student View does not show passcode settings.
- Student Progress Reset remains separate from Parent Code Reset.

## Upload Structure

Upload these root items together:

```txt
audit
docs
src
index.html
package.json
README.md
```

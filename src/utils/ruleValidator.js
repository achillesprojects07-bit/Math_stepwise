import fs from 'fs';

const rules = JSON.parse(fs.readFileSync(new URL('../config/masteryRules.json', import.meta.url)));
const errors = [];

if (rules.accuracy.finalCorrectedAccuracyRequired !== 1) errors.push('Final corrected accuracy must be 100%.');
if (!rules.accuracy.practiceAgainMustEndAllCorrect) errors.push('Practice Again must require all correct.');
if (!rules.timing.allowFinishAfterTimeExceeded) errors.push('Child must be allowed to finish after time exceeded.');
if (!rules.studentView.hideResetControls) errors.push('Student View must hide reset controls.');
if (rules.studentView.lessonLabelFormat !== 'level-dash-number') errors.push('Visible lesson labels must use level-dash-number format.');
if (!rules.parentView.allowParentReset) errors.push('Parent reset must be enabled.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Rule validation passed.');

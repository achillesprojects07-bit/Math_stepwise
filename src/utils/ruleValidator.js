import fs from 'fs';

const rules = JSON.parse(fs.readFileSync(new URL('../config/masteryRules.json', import.meta.url)));
const errors = [];

if (rules.accuracy.finalCorrectedAccuracyRequired !== 1) errors.push('Final corrected accuracy must be 100%.');
if (!rules.accuracy.practiceAgainMustEndAllCorrect) errors.push('Practice Again must require all correct.');
if (!rules.accuracy.wrongPracticeAnswersDoNotAdvance) errors.push('Wrong Practice Again answers must not advance.');
if (!rules.accuracy.wrongLessonAnswersMustBeCorrectedBeforeMovingOn) errors.push('Wrong lesson answers must be corrected before moving on.');
if (!rules.timing.allowFinishAfterTimeExceeded) errors.push('Child must be allowed to finish after time exceeded.');
if (!rules.studentView.noChildFacingReset) errors.push('Student View must not show reset controls.');
if (rules.studentView.lessonLabelFormat !== 'level-dash-number') errors.push('Visible lesson labels must use level-dash-number format.');
if (!rules.workflow.continueNextLessonOnlyAfterMastery) errors.push('Continue to Next Lesson must require mastery.');
if (!rules.quickWarmUp.parentAssignmentOverridesAppRecommendation) errors.push('Parent assignment must override app recommendation.');
if (!rules.quickWarmUp.appRecommendationDefaultIfParentDoesNothing) errors.push('App recommendation must be the default when parent does nothing.');
if (!rules.quickWarmUp.futureLevelsLocked) errors.push('Future levels must be locked.');
if (!rules.quickWarmUp.currentAndLowerLevelsAvailable) errors.push('Current and lower levels must be available.');
if (!rules.parentView.parentOnlyReset) errors.push('Parent reset must be enabled.');
if (!rules.parentView.graphsDefaultToEntireProgress) errors.push('Graphs must default to entire progress.');
if (!rules.parentView.separateProgressAndRepetitionGraphs) errors.push('Progress and repetition graphs must be separate.');

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log('Rule validation passed.');

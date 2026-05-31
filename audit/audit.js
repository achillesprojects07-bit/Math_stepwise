import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = path.resolve('.');
const required = [
  'index.html',
  'README.md',
  'package.json',
  'src/app.js',
  'src/styles.css',
  'src/config/masteryRules.json',
  'src/config/levels.json',
  'src/config/levels.js',
  'src/curriculum/level6A.js',
  'src/engine/questionGenerator.js',
  'src/engine/masteryEngine.js',
  'src/engine/progressStore.js',
  'src/utils/ruleValidator.js',
  'docs/PHASE2_NOTES.md'
];

const failures = [];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing ${file}`);
}

const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const app = read('src/app.js');
const qgen = read('src/engine/questionGenerator.js');
const mastery = read('src/engine/masteryEngine.js');
const progress = read('src/engine/progressStore.js');
const css = read('src/styles.css');
const curriculum = read('src/curriculum/level6A.js');
const rules = JSON.parse(read('src/config/masteryRules.json'));

// Upload structure and visible app basics
if (!app.includes('Today: ${formatDisplayDate()}')) failures.push('Student View date is missing.');
if (!curriculum.includes('toVisibleLessonId')) failures.push('Visible lesson label formatter missing.');
if (!curriculum.includes('displayId')) failures.push('Visible lesson displayId missing.');
if (app.includes('6A013')) failures.push('Old zero-padded visible lesson label found.');
if (app.includes('Reset Demo')) failures.push('Child-facing Reset Demo still present.');


// Final workflow UX fixes
if (!app.includes('function renderParentGate()')) failures.push('Parent code gate missing.');
if (!app.includes("input.value === '1234'")) failures.push('Parent demo code check missing.');
if (!app.includes("screen = parentUnlocked ? 'parent' : 'parentGate'")) failures.push('Parent View button is not protected by code gate.');
if (!app.includes('function renderProgressMap()')) failures.push('Separate Progress Map screen missing.');
if (!app.includes('View Progress Map')) failures.push('View Progress Map button missing.');
if (!app.includes('Start Today’s Work')) failures.push('Start Today’s Work button missing.');
if (!app.includes("screen = 'progressMap'")) failures.push('Progress Map navigation missing.');
if (!app.includes('Only the current lesson can be started from this map')) failures.push('Progress map anti-jump-ahead note missing.');
if (!app.includes('lessonStatus(lesson)')) failures.push('Progress map lesson status logic missing.');
if (!app.includes("return 'locked'")) failures.push('Future lesson locked state missing.');
if (app.includes('<h2>Level 6A Map</h2>')) failures.push('Lesson map still appears on Student Home.');
if (!css.includes('white-space: nowrap')) failures.push('Lesson tile no-wrap CSS missing.');
if (!css.includes('.lessonTile.mastered') || !css.includes('.lessonTile.locked')) failures.push('Color-coded lesson tile status CSS missing.');
if (!progress.includes("key.startsWith('math_stepwise_progress')")) failures.push('Reset does not clear all Math Stepwise localStorage keys.');

// Practice Again and mastery workflow
if (!app.includes("screen = 'practice'")) failures.push('Practice Again screen flow missing.');
if (!app.includes("if (!correct)")) failures.push('Wrong-answer handling missing.');
if (!app.includes('showGentleTryAgain(q);')) failures.push('Gentle retry feedback missing.');
if (!app.includes('return;\n    }\n\n    const entry')) failures.push('Wrong answers may advance; expected return before entry logging.');
if (!app.includes('session.practiceItems.push(generateQuestion(q.skill')) failures.push('Similar practice generation after practice miss missing.');
if (!app.includes('Practice Again • ${left} left')) failures.push('Practice Again visible progress missing.');
if (!app.includes('All practice items were answered correctly')) failures.push('Practice completion confirmation missing.');
if (!app.includes('const canContinue = Boolean(session?.mastered)')) failures.push('Continue button is not mastery-gated.');
if (!app.includes("${canContinue ? '' : 'disabled'}>Continue to Next Lesson")) failures.push('Continue button disabled state missing.');
if (!app.includes('Continue to Next Lesson')) failures.push('Continue button text missing.');
if (!app.includes('End Today’s Session')) failures.push('End Today’s Session missing.');

// Quick Warm-Up rules
if (!app.includes('function activeWarmup()')) failures.push('Active warm-up selector missing.');
if (!app.includes('state.manualWarmup')) failures.push('Manual parent warm-up assignment missing.');
if (!app.includes('state.appRecommendedWarmup')) failures.push('App recommended warm-up missing.');
if (!app.includes('Parent assignment overrides the app recommendation')) failures.push('Parent override explanation missing.');
if (!app.includes('If you do nothing, the app uses its recommendation automatically')) failures.push('App default recommendation explanation missing.');
if (!app.includes('isLevelAssignable')) failures.push('Assignable level locking function missing.');
if (!app.includes('levelIndex <= currentIndex')) failures.push('Future level locking / lower-level availability logic missing.');
if (!qgen.includes('generateQuestionsForWarmup')) failures.push('Quick Warm-Up question generator missing.');

// Parent view and daily record
if (!app.includes('Parent Settings')) failures.push('Parent Settings section missing.');
if (!app.includes('Reset Student Progress')) failures.push('Parent reset button missing.');
if (!app.includes('Are you sure you want to reset all student progress')) failures.push('Parent reset confirmation missing.');
if (!app.includes('Daily Work Record')) failures.push('Daily Work Record missing.');
if (!app.includes('Lesson Score')) failures.push('Clear Daily Record column Lesson Score missing.');
if (!app.includes('Practice Needed')) failures.push('Clear Daily Record column Practice Needed missing.');
if (!app.includes('Practice Result')) failures.push('Clear Daily Record column Practice Result missing.');
if (!app.includes('Next Practice')) failures.push('Daily Record Next Practice missing.');
if (app.includes('First Try')) failures.push('Confusing First Try column still present.');
if (!app.includes('id="fromDate"') || !app.includes('id="toDate"')) failures.push('Date picker filters missing.');
if (!app.includes('recordLevel')) failures.push('Level filter missing.');
if (!app.includes('Entire Progress')) failures.push('Entire Progress default/clear filter missing.');
if (!app.includes('Progress Graph')) failures.push('Progress Graph missing.');
if (!app.includes('Practice & Repetition Graph')) failures.push('Practice & Repetition Graph missing.');
if (!css.includes('.chart') || !css.includes('.bar')) failures.push('Graph styles missing.');

// Rules validation
if (rules.accuracy.finalCorrectedAccuracyRequired !== 1) failures.push('100% corrected accuracy rule not locked.');
if (!rules.accuracy.practiceAgainMustEndAllCorrect) failures.push('Practice Again all-correct rule not locked.');
if (!rules.workflow.continueNextLessonOnlyAfterMastery) failures.push('Continue after mastery rule not locked.');
if (!rules.quickWarmUp.currentAndLowerLevelsAvailable) failures.push('Current/lower level availability rule not locked.');
if (!rules.quickWarmUp.futureLevelsLocked) failures.push('Future level lock rule not locked.');
if (!rules.parentView.graphsDefaultToEntireProgress) failures.push('Default entire progress graph rule not locked.');
if (!rules.parentView.separateProgressAndRepetitionGraphs) failures.push('Separate graph rule not locked.');

try {
  execSync('node src/utils/ruleValidator.js', { cwd: root, stdio: 'pipe' });
} catch (e) {
  failures.push('Rule validator failed.');
}

for (const file of ['src/app.js', 'src/engine/questionGenerator.js', 'src/engine/masteryEngine.js', 'src/engine/progressStore.js', 'src/curriculum/level6A.js', 'src/config/levels.js']) {
  try {
    execSync(`node --check ${file}`, { cwd: root, stdio: 'pipe' });
  } catch (e) {
    failures.push(`Syntax check failed for ${file}.`);
  }
}

if (failures.length) {
  console.error('AUDIT FAILED');
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('AUDIT PASSED');

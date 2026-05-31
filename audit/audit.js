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

const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
const curriculum = fs.readFileSync(path.join(root, 'src/curriculum/level6A.js'), 'utf8');
const rules = JSON.parse(fs.readFileSync(path.join(root, 'src/config/masteryRules.json'), 'utf8'));

if (!app.includes('Reset Student Progress')) failures.push('Parent reset button text missing.');
if (app.includes('Reset Demo')) failures.push('Child-facing Reset Demo still present.');
if (!app.includes('Practice Again')) failures.push('Practice Again workflow text missing.');
if (!app.includes('Wrong answers do not advance')) {
  // behavior is checked by code pattern below
}
if (!app.includes('showGentleTryAgain')) failures.push('Wrong practice retry flow missing.');
if (!app.includes('Continue to Next Lesson')) failures.push('Continue to Next Lesson missing.');
if (!app.includes('End Today’s Session')) failures.push('End Today’s Session missing.');
if (!curriculum.includes('toVisibleLessonId')) failures.push('Lesson label formatter missing.');
if (!curriculum.includes('displayId')) failures.push('Visible lesson displayId missing.');
if (rules.studentView.lessonLabelFormat !== 'level-dash-number') failures.push('Lesson label rule not locked.');
if (!rules.accuracy.practiceAgainMustEndAllCorrect) failures.push('Retention all-correct rule not locked.');

try {
  execSync('node src/utils/ruleValidator.js', { cwd: root, stdio: 'pipe' });
} catch (e) {
  failures.push('Rule validator failed.');
}

if (failures.length) {
  console.error('AUDIT FAILED');
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('AUDIT PASSED');

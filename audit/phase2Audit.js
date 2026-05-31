import fs from 'fs';
import path from 'path';

const root = process.cwd();
const required = [
  'index.html',
  'README.md',
  'package.json',
  'docs/PHASE2_NOTES.md',
  'docs/STUDENT_PARENT_RECORDS.md',
  'src/app.js',
  'src/styles.css',
  'src/config/levels.json',
  'src/config/masteryRules.json',
  'src/curriculum/level6A.js',
  'src/engine/masteryEngine.js',
  'src/engine/progressStore.js',
  'src/engine/questionGenerator.js',
  'src/utils/ruleValidator.js'
];

const failures = [];
function check(condition, message) {
  if (!condition) failures.push(message);
}

for (const file of required) {
  check(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`);
}

const levels = JSON.parse(fs.readFileSync(path.join(root, 'src/config/levels.json'), 'utf8'));
const rules = JSON.parse(fs.readFileSync(path.join(root, 'src/config/masteryRules.json'), 'utf8'));
const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
const curriculum = fs.readFileSync(path.join(root, 'src/curriculum/level6A.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

check(Array.isArray(levels.levels), 'levels.json must contain levels array.');
check(levels.levels.some((l) => l.id === '6A' && l.status === 'available'), 'Level 6A must be available.');
check(levels.levels.find((l) => l.id === '6A')?.lessonCount === 200, 'Level 6A must have 200 lessons.');
check(rules.accuracy.finalCorrectedAccuracyRequired === 1.0, 'Mastery requires 100% corrected accuracy.');
check(rules.time.allowFinishAfterTargetTime === true, 'App must allow child to finish after target time.');
check(rules.childFacingRulesHidden === true, 'Child-facing rules must be hidden.');
check(app.includes('Student Information'), 'Student Information screen missing.');
check(app.includes('Daily Work Record'), 'Daily Work Record screen missing.');
check(app.includes('localStorage'), 'Progress must persist in localStorage for Phase 2.');
check(app.includes('selectedLevel') && app.includes('levelSelect'), 'Level dropdown logic missing.');
check(curriculum.includes('Array.from({ length: 200 }'), 'Level 6A 200 lesson generator missing.');
check(index.includes('type="module"'), 'index.html must load app as module.');

const disallowedChildPhrases = ['failed SCT', 'mastery parameters', 'accuracy condition not satisfied', 'fluency failure'];
for (const phrase of disallowedChildPhrases) {
  check(!app.includes(phrase), `Child-facing app contains disallowed backend phrase: ${phrase}`);
}

if (failures.length) {
  console.error('Phase 2 improved audit failed:');
  failures.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}

console.log('Phase 2 improved audit passed.');

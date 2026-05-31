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
function assert(condition, message) { if (!condition) failures.push(message); }
function read(file) { return fs.readFileSync(path.join(root, file), 'utf8'); }

for (const file of required) assert(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`);

const app = read('src/app.js');
const store = read('src/engine/progressStore.js');
const mastery = read('src/engine/masteryEngine.js');
const generator = read('src/engine/questionGenerator.js');
const readme = read('README.md');

assert(!app.includes('Reset Demo'), 'Child-facing Reset Demo text should be removed.');
assert(!app.includes('data-reset'), 'Reset button event should not exist in child-facing app.');
assert(app.includes('data-practice-again'), 'Practice Again button/event is missing.');
assert(app.includes('data-end-session'), 'End Today’s Session action is missing.');
assert(app.includes('data-continue-next'), 'Continue to Next Lesson action is missing.');
assert(app.includes('data-assign-practice'), 'Parent practice assignment action is missing.');
assert(app.includes('Quick Practice'), 'Child-facing Quick Practice label is missing.');
assert(app.includes('Daily Work Record'), 'Daily Work Record screen is missing.');
assert(app.includes('Recommendation'), 'Daily Work Record recommendation column is missing.');
assert(mastery.includes('Wrong first try'), 'Practice Again must flag wrong-first-try items.');
assert(mastery.includes('Slow correct item'), 'Practice Again must flag slow correct items.');
assert(mastery.includes('buildPracticeAgainQueue'), 'Practice Again queue builder is missing.');
assert(generator.includes('slowThresholdSeconds'), 'Question timing threshold is missing.');
assert(store.includes('assignedPractice'), 'Assigned parent practice state is missing.');
assert(store.includes('recommendation'), 'Daily record recommendations are missing from default records.');
assert(readme.includes('Do **not** drag the outer folder'), 'Upload instructions are missing.');
assert(!fs.existsSync(path.join(root, 'src/data')), 'Old duplicate src/data folder should not exist.');

for (const jsonFile of ['src/config/levels.json', 'src/config/masteryRules.json', 'package.json']) {
  try { JSON.parse(read(jsonFile)); } catch (error) { failures.push(`Invalid JSON: ${jsonFile}`); }
}

if (failures.length) {
  console.error('PHASE 2 REBUILT AUDIT FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PHASE 2 REBUILT AUDIT PASSED');
console.log('Checked upload structure, child workflow, Practice Again, parent assignment, daily recommendations, and duplicate-folder cleanup.');

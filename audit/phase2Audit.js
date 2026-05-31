const fs = require('fs');
const path = require('path');
const { validateRules } = require('../src/utils/ruleValidator');
const { evaluateLessonAttempt, canPromoteLevel } = require('../src/engine/masteryEngine');
const { buildLevel6ALessons } = require('../src/data/level6A');

const root = path.join(__dirname, '..');
const requiredFiles = [
  'index.html',
  'README.md',
  'package.json',
  'docs/PHASE1_RULES.md',
  'docs/CURRICULUM_SCOPE.md',
  'docs/PHASE2_APP_ENGINE.md',
  'src/app.js',
  'src/styles.css',
  'src/config/masteryRules.json',
  'src/config/levels.json',
  'src/utils/ruleValidator.js',
  'src/engine/masteryEngine.js',
  'src/engine/questionGenerator.js',
  'src/engine/progressStore.js',
  'src/data/level6A.js',
  'audit/phase2Audit.js',
  'audit/PHASE2_AUDIT.md'
];

function fail(errors) {
  console.error('Phase 2 audit failed:');
  errors.forEach(error => console.error(`- ${error}`));
  process.exit(1);
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

const errors = [];

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`, errors);
}

try {
  JSON.parse(read('src/config/masteryRules.json'));
  JSON.parse(read('src/config/levels.json'));
  JSON.parse(read('package.json'));
} catch (error) {
  errors.push(`Invalid JSON: ${error.message}`);
}

const ruleErrors = validateRules();
ruleErrors.forEach(error => errors.push(`Phase 1 rule validation: ${error}`));

const mastered = evaluateLessonAttempt(
  { totalQuestions: 10, correctAfterCorrections: 10, unresolvedErrors: 0, elapsedSeconds: 90 },
  { hasSct: true, targetSeconds: 120 }
);
assert(mastered.status === 'mastered' && mastered.mastered === true, 'Mastery engine should master 100% corrected within time.', errors);

const slow = evaluateLessonAttempt(
  { totalQuestions: 10, correctAfterCorrections: 10, unresolvedErrors: 0, elapsedSeconds: 130 },
  { hasSct: true, targetSeconds: 120 }
);
assert(slow.status === 'completed_needs_fluency' && slow.mastered === false, 'Mastery engine should mark over-time work as needs fluency.', errors);

const accuracy = evaluateLessonAttempt(
  { totalQuestions: 10, correctAfterCorrections: 9, unresolvedErrors: 1, elapsedSeconds: 90 },
  { hasSct: true, targetSeconds: 120 }
);
assert(accuracy.status === 'needs_review_accuracy' && accuracy.mastered === false, 'Mastery engine should require 100% corrected accuracy.', errors);

const noSct = evaluateLessonAttempt(
  { totalQuestions: 10, correctAfterCorrections: 10, unresolvedErrors: 0, elapsedSeconds: 999 },
  { hasSct: false, targetSeconds: null }
);
assert(noSct.status === 'mastered', 'Non-SCT levels should not use time as a hard gate.', errors);

assert(canPromoteLevel({ totalLessons: 200, masteredLessons: 200, reviewItems: 0, finalCheckPassed: true }) === true, 'Promotion should pass when all conditions are met.', errors);
assert(canPromoteLevel({ totalLessons: 200, masteredLessons: 199, reviewItems: 0, finalCheckPassed: true }) === false, 'Promotion should fail when any lesson is not mastered.', errors);

const lessons = buildLevel6ALessons();
assert(lessons.length === 200, 'Level 6A data should generate 200 lessons.', errors);
assert(lessons[0].id === '6A001' && lessons[199].id === '6A200', 'Level 6A lesson IDs should run from 6A001 to 6A200.', errors);
assert(lessons.every(lesson => lesson.hasSct === false), 'All Level 6A lessons should be marked non-SCT.', errors);

const appCopy = read('src/app.js').toLowerCase();
const blockedStudentTerms = ['failed sct', 'mastery parameters', 'promotion requirement failed'];
for (const term of blockedStudentTerms) {
  assert(!appCopy.includes(term), `Student-facing copy should not include backend phrase: ${term}`, errors);
}

assert(read('index.html').includes('src/app.js'), 'index.html should load src/app.js.', errors);
assert(read('index.html').includes('src/styles.css'), 'index.html should load src/styles.css.', errors);

if (errors.length) fail(errors);
console.log('Phase 2 audit passed. App skeleton, rules, engine, and Level 6A starter data are clean.');

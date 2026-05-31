import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const mustExist = [
  'index.html','README.md','package.json','src/app.js','src/styles.css','src/config/levels.json','src/config/masteryRules.json','src/curriculum/level6A.js','src/engine/questionGenerator.js','src/engine/masteryEngine.js','src/engine/progressStore.js','src/utils/ruleValidator.js','audit/PHASE2_AUDIT.md'
];
let failures = [];
for (const f of mustExist) if (!fs.existsSync(path.join(root, f))) failures.push(`Missing file: ${f}`);
const app = read('src/app.js');
const css = read('src/styles.css');
function includes(label, needle, haystack = app) { if (!haystack.includes(needle)) failures.push(`Missing ${label}: ${needle}`); }
includes('student date', 'Today: ${fmtDate()}');
includes('parent gate', "screen === 'parentGate'");
includes('parent settings compact screen', 'function renderParentSettings');
includes('editable student info form', 'data-action="saveStudentInfo"');
includes('student info save handler', "action === 'saveStudentInfo'");
includes('reset warning screen', 'function renderResetConfirm');
includes('reset clears old keys', 'Object.keys(localStorage).filter');
includes('app recommendation details', 'Lessons:</strong>');
includes('automatic recommendation wording', 'used automatically');
includes('manual assignment overrides wording', 'Parent assignment overrides');
includes('no attempt count feedback', 'Look again when you are ready.');
includes('visual progress dots', 'function progressDots');
includes('line graphs', 'polyline');
includes('future levels locked', "!isAssignable(l.id)?'disabled'");

if (app.includes('id="currentLevel"') || app.includes("id='currentLevel'")) failures.push('Current Level is still editable in Student Information.');
if (app.includes('id="currentLessonNumber"') || app.includes("id='currentLessonNumber'")) failures.push('Current Lesson is still editable in Student Information.');
includes('current level read-only field', 'Current Level</span><strong>${state.student.currentLevel}</strong>');
includes('current lesson read-only field', 'Current Lesson</span><strong>${currentLesson().displayId}</strong>');
includes('student home current level read-only', '<h2>Current Level</h2><p class="bigLabel">${state.student.currentLevel}</p>');

if (app.includes('Try ${q.wrongAttempts')) failures.push('Child-facing attempt count still exists.');
if (app.includes('Review today’s tricky items')) failures.push('Vague app recommendation remains.');
if (!css.includes('.progressDot.done')) failures.push('Missing visual progress dot styling.');
if (!app.includes('while (set.size < Math.min(4, max - min + 1))')) failures.push('Multiple-choice generator bounded loop check missing.');
if (failures.length) {
  console.error('AUDIT FAILED');
  failures.forEach(f => console.error('-', f));
  process.exit(1);
}
console.log('AUDIT PASSED: technical and UX clarity checks passed.');

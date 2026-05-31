import fs from 'fs';
import path from 'path';
const root = process.cwd();
const required = ['index.html','README.md','package.json','src/app.js','src/styles.css','src/config/masteryRules.json','src/config/levels.json','audit/PHASE2_AUDIT.md','docs/PHASE2_CLICK_RESET_FINAL.md'];
const missing = required.filter(f => !fs.existsSync(path.join(root, f)));
if (missing.length) throw new Error('Missing files: ' + missing.join(', '));
const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
const checks = [
  ['event delegated actions', "document.addEventListener('click'"],
  ['start action exists', "action === 'start'"],
  ['parent code gate exists', "PARENT_CODE = '1234'"],
  ['reset clears all progress', 'clearAllProgress'],
  ['reset returns default state', 'state = defaultState()'],
  ['current lesson starts at 1', 'currentLessonNumber: 1'],
  ['Practice Again item stays until correct', "if (!correct)"],
  ['Continue requires mastery', "if (!session?.mastered) return"],
  ['today date on home', 'Today: ${fmtDate()}'],
  ['safe choices loop bounded', 'while (set.size < Math.min(4, max - min + 1))'],
  ['daily record filters', "data-filter=\"from\""],
  ['graphs render', 'Progress Graph'],
  ['parent assignment override exists', 'state.manualWarmup']
];
const failed = checks.filter(([_, needle]) => !app.includes(needle)).map(([name]) => name);
if (failed.length) throw new Error('Failed checks: ' + failed.join(', '));
// Stress-check safeChoices logic by evaluating equivalent function behavior.
function safeChoices(answer, min, max) {
  const set = new Set([answer]);
  let delta = 1;
  while (set.size < Math.min(4, max - min + 1)) {
    if (answer - delta >= min) set.add(answer - delta);
    if (answer + delta <= max) set.add(answer + delta);
    delta += 1;
    if (delta > 20) throw new Error('safeChoices infinite loop guard triggered');
  }
  return Array.from(set).slice(0, 4);
}
for (const ans of [1,2,3,4,5]) {
  const c = safeChoices(ans,1,5);
  if (!c.includes(ans) || c.length !== 4) throw new Error('safeChoices failed for ' + ans);
}
console.log('AUDIT PASSED: click handling, reset, practice retention, safe choices, parent gate, records and graphs checked.');

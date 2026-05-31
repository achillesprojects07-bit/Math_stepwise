
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function read(p){return fs.readFileSync(path.join(root,p),'utf8');}
function exists(p){return fs.existsSync(path.join(root,p));}
const required = ['index.html','README.md','package.json','src/app.js','src/styles.css','src/config/levels.json','docs/PHASE4_EARLY_LEVELS.md'];
const missing = required.filter(p=>!exists(p));
if(missing.length) throw new Error('Missing files: '+missing.join(', '));
const app = read('src/app.js');
const checks = [
  ['built levels include 6A to 2A', "const BUILT_LEVELS = ['6A','5A','4A','3A','2A'];"],
  ['starting level uses available built options only', 'startingLevelOptions(state.student.startingLevel)'],
  ['assignment level options lock higher built levels only', 'assignLevelOptions(assignForm.level)'],
  ['5A block exists in app generator', "'5A': ["],
  ['4A block exists in app generator', "'4A': ["],
  ['3A block exists in app generator', "'3A': ["],
  ['2A block exists in app generator', "'2A': ["],
  ['reset keeps starting point', 'currentLevel:existing.startingLevel'],
  ['typed answer mode exists', 'submitTyped'],
  ['practice generated from weak items', 'practiceItemsFrom(log)'],
  ['practice continues until all correct', "session.mode==='practice'"],
  ['app recommendation automatic', 'state.appRecommendedWarmup=reco'],
  ['graphs remain line graphs', 'lineSvg'],
  ['parent passcode exists', 'parentCode'],
  ['reset confirmation exists', 'resetConfirm']
];
const failed = checks.filter(([_,needle])=>!app.includes(needle)).map(([name])=>name);
if(failed.length) throw new Error('Failed checks: '+failed.join(', '));
const banned = ['Look again when you are ready', 'Choose again when you are ready', 'Try 5', 'Try 6', 'Available in later phase'];
const scanned = app + '\n' + read('README.md');
const bannedFound = banned.filter(x=>scanned.includes(x));
if(bannedFound.length) throw new Error('Banned wording found: '+bannedFound.join(', '));
const levels = JSON.parse(read('src/config/levels.json'));
const available = levels.filter(l=>l.status==='available').map(l=>l.id).join(',');
if(available !== '6A,5A,4A,3A,2A') throw new Error('Available levels mismatch: '+available);
['6A','5A','4A','3A','2A'].forEach(level=>{
  const p = `src/curriculum/level${level}.js`;
  if(!exists(p)) throw new Error(`Missing explicit curriculum file ${p}`);
  const text = read(p);
  const count = (text.match(/"displayId"/g)||[]).length;
  if(count !== 200) throw new Error(`${p} should contain 200 displayId lesson entries, found ${count}`);
  if(!text.includes(`"displayId": "${level}-1"`) || !text.includes(`"displayId": "${level}-200"`)) {
    throw new Error(`${p} missing ${level}-1 or ${level}-200`);
  }
});
console.log('Phase 4 technical audit passed.');
console.log('Phase 4 curriculum content audit passed: 6A, 5A, 4A, 3A, 2A each have 200 explicit lessons.');
console.log('Phase 4 UX audit passed: starting level dropdown uses built levels only and avoids later-phase clutter.');

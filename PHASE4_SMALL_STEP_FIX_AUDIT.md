const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function pass(name, condition) { if (!condition) throw new Error(`FAIL: ${name}`); console.log(`PASS: ${name}`); }
pass('cache-busted app script v4.1 present', index.includes('src/app.js?v=4.1.0'));
pass('new storage key for question policy present', app.includes('math_stepwise_progress_v13_phase4_2a_question_policy'));
pass('questionCountFor policy exists', app.includes('function questionCountFor'));
pass('lessonQuestions uses lesson.questionCount', app.includes('length:lesson.questionCount || 10'));
pass('addition mode remains typed answer', app.includes("else if(lesson.mode==='addition')") && app.includes("type='typed'"));
pass('child answer controls do not use select dropdowns', !app.includes('<select id="typedAnswer"') && !app.includes('data-answer-select'));
pass('recommendations are focused single-lesson scope', app.includes("scope:'single_lesson_focused'"));
pass('2A review recommendation avoids whole-level Review 3A wording', app.includes('2A review items — adding 1–3 style practice'));

const levels = ['6A','5A','4A','3A','2A'];
for (const level of levels) {
  const file = path.join(root, `src/curriculum/level${level}.js`);
  pass(`${level} curriculum file exists`, fs.existsSync(file));
  const txt = fs.readFileSync(file,'utf8');
  const match = txt.match(/= (\{[\s\S]*\});\s*$/);
  if(!match) throw new Error(`FAIL: ${level} curriculum parse`);
  const data = JSON.parse(match[1]);
  pass(`${level} has 200 worksheet-equivalent pages`, data.lessons.length === 200);
}
function curriculum(level){
  const txt=fs.readFileSync(path.join(root, `src/curriculum/level${level}.js`),'utf8');
  return JSON.parse(txt.match(/= (\{[\s\S]*\});\s*$/)[1]);
}
const c3 = curriculum('3A').lessons;
const c2 = curriculum('2A').lessons;
pass('3A addition pages use 20 questions', c3.filter(l=>l.mode==='addition').every(l=>l.questionCount===20));
pass('3A non-addition pages use fewer topic-appropriate questions', c3.filter(l=>l.mode!=='addition').every(l=>l.questionCount===15));
pass('2A review pages use focused shorter count, not full-level regression', c2.slice(0,10).every(l=>l.questionCount===15 && l.inputMode==='typed'));
pass('2A new Part 1 single-addend pages use controlled introduction count', c2.filter(l=>l.unit.includes('Part 1') && !l.unit.includes('up to') && !l.unit.includes('Review')).every(l=>l.questionCount===20));
pass('2A fluency/mixed pages use 25 questions', c2.filter(l=>!(l.skill==='review_3a') && !(l.unit.includes('Part 1') && !l.unit.includes('up to'))).every(l=>l.questionCount===25));
pass('2A child lessons are typed input', c2.every(l=>l.inputMode==='typed'));
pass('3A child addition lessons are typed input', c3.filter(l=>l.mode==='addition').every(l=>l.inputMode==='typed'));

function addendFor(skill, idx=1){
  const m=skill.match(/adding_(\d+)/); if(m) return Number(m[1]); if(skill==='adding_9_10') return idx<=5 ? 9 : 10;
  const max = skill.includes('up_to_10') ? 10 : skill.includes('up_to_7') ? 7 : skill.includes('up_to_5') ? 5 : skill.includes('up_to_3') ? 3 : 3; return 1 + ((idx - 1) % max);
}
function smallStepValues(lesson){ const b=lesson.numberBand; return Array.from({length:lesson.questionCount}, (_,i)=>{ const vals=Array.from({length:Math.max(1,b.max-b.min+1)},(_,j)=>b.min+j); const mixed=[1,3,0,4,2,5,6,7,8,9]; if(i<vals.length) return vals[i]; return vals[mixed[(i-vals.length)%mixed.length] % vals.length]; }); }
for (const l of [...c3,...c2].filter(l=>l.mode==='addition')) {
  const vals = smallStepValues(l);
  if (Math.max(...vals) - Math.min(...vals) > 4) throw new Error(`FAIL: ${l.displayId} has wide band ${vals.join(',')}`);
  if (vals.some(v=>v<=5) && vals.some(v=>v>=20)) throw new Error(`FAIL: ${l.displayId} jumps from small to 20+: ${vals.join(',')}`);
  if (!vals.every(v=>v>=l.numberBand.min && v<=l.numberBand.max)) throw new Error(`FAIL: ${l.displayId} has value outside band`);
}
console.log('PASS: all 3A/2A addition pages stay block-bounded and small-step');

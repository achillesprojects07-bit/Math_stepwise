const STORAGE_KEY = 'math_stepwise_progress_v6_encouragement_linegraphs';
const OLD_KEY_PREFIX = 'math_stepwise_progress';
const DEFAULT_PARENT_CODE = '1234';
const app = document.getElementById('app');

const levelOrder = ['6A', '5A', '4A', '3A', '2A', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'XV', 'XM', 'XP'];
const levels = [
  { id: '6A', title: 'Counting & Number Recognition', status: 'available' },
  ...levelOrder.slice(1).map(id => ({ id, title: 'Coming soon', status: 'locked' }))
];
const lessons = Array.from({ length: 200 }, (_, i) => {
  const n = i + 1;
  const title = n <= 30 ? 'Counting up to 5' : n <= 100 ? 'Counting up to 10' : n <= 150 ? 'Number Reading up to 10' : 'Dot Recognition up to 10';
  const max = n <= 30 ? 5 : 10;
  const skill = n <= 30 ? 'counting_1_5' : n <= 100 ? 'counting_1_10' : n <= 150 ? 'number_reading_1_10' : 'dot_recognition_1_10';
  return { level: '6A', lessonNumber: n, displayId: `6A-${n}`, title, max, skill };
});

const defaultState = () => ({
  student: {
    name: 'Mia Santos',
    enrollmentDate: todayIso(),
    startingLevel: '6A',
    currentLevel: '6A',
    currentLessonNumber: 1,
    parentName: 'Aileen Rosario',
    notes: 'Prefers visual counting.'
  },
  mastered: [],
  dailyRecords: [],
  appRecommendedWarmup: null,
  manualWarmup: null,
  lastCompletedLessonNumber: null,
  parentCode: DEFAULT_PARENT_CODE
});

let state = loadState();
let screen = 'student';
let parentUnlocked = false;
let session = null;
let recordFilters = { from: '', to: '', level: 'all' };
let assignForm = { level: state.student.currentLevel, from: 1, to: 1 };

function todayIso() { return new Date().toISOString().slice(0, 10); }
function fmtDate(iso = todayIso()) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}
function msToText(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`;
}
function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return defaultState();
    return { ...defaultState(), ...saved, student: { ...defaultState().student, ...(saved.student || {}) }, parentCode: saved.parentCode || DEFAULT_PARENT_CODE }; 
  } catch { return defaultState(); }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function clearAllProgress() {
  Object.keys(localStorage).filter(k => k.startsWith(OLD_KEY_PREFIX)).forEach(k => localStorage.removeItem(k));
  Object.keys(sessionStorage).filter(k => k.startsWith(OLD_KEY_PREFIX)).forEach(k => sessionStorage.removeItem(k));
  state = defaultState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  session = null;
  recordFilters = { from: '', to: '', level: 'all' };
  assignForm = { level: '6A', from: 1, to: 1 };
  parentUnlocked = false;
  screen = 'student';
  render();
}
function currentLesson() { return lessons.find(l => l.lessonNumber === Number(state.student.currentLessonNumber)) || lessons[0]; }
function lessonByNum(n) { return lessons.find(l => l.lessonNumber === Number(n)) || lessons[0]; }
function activeWarmup() {
  if (state.manualWarmup) return { ...state.manualWarmup, source: 'Parent assigned' };
  if (state.appRecommendedWarmup) return { ...state.appRecommendedWarmup, source: 'App recommendation' };
  return null;
}
function displayDots(n) { return Array.from({ length: n }, () => '●').join(' '); }
const encouragementLines = {
  counting_1_5: [
    'Almost! Count each one slowly.',
    'Take your time. Touch each item as you count.',
    "Let’s start from one and count again.",
    'You are close. Look one by one.',
    "No rush. Let’s practice this together."
  ],
  counting_1_10: [
    'Almost! Count each one slowly.',
    'Try pointing to each dot as you count.',
    "Let’s slow down and count from one.",
    'Look carefully. You can do this.',
    'No rush. Count one by one.'
  ],
  number_reading_1_10: [
    'Almost! Look at the number again.',
    'Take your time. Find the matching number.',
    'You are learning it. Try once more.',
    'Check the number carefully.',
    'No rush. Choose again when you are ready.'
  ],
  dot_recognition_1_10: [
    'Almost! Look at the dots in small groups.',
    'Try counting the dots one by one.',
    'You are close. Check the dots again.',
    'Take your time and look carefully.',
    "No rush. Let’s try this dot pattern again."
  ],
  default: [
    'Almost! Try again.',
    'Take your time. Try once more.',
    'You are close. Look carefully.',
    "No rush. Let’s try again.",
    'Keep going. You are learning.'
  ]
};
function encouragementFor(q) {
  const list = encouragementLines[q.skill] || encouragementLines.default;
  return list[Math.min(q.wrongAttempts - 1, list.length - 1)];
}
function safeChoices(answer, min, max) {
  const set = new Set([answer]);
  let delta = 1;
  while (set.size < Math.min(4, max - min + 1)) {
    if (answer - delta >= min) set.add(answer - delta);
    if (answer + delta <= max) set.add(answer + delta);
    delta += 1;
  }
  const vals = Array.from(set).slice(0, 4);
  for (let i = vals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [vals[i], vals[j]] = [vals[j], vals[i]];
  }
  return vals;
}
function makeQuestion(lesson, idx, source = 'lesson') {
  const answer = 1 + ((idx * 2 + lesson.lessonNumber) % lesson.max);
  const prompt = lesson.skill.includes('number_reading') ? `Choose ${answer}.` : 'How many?';
  const display = lesson.skill.includes('number_reading') ? String(answer) : displayDots(answer);
  return {
    id: `${source}-${lesson.displayId}-${idx}-${Date.now()}`,
    source,
    skill: lesson.skill,
    prompt,
    display,
    answer,
    choices: safeChoices(answer, 1, lesson.max),
    slowThresholdMs: lesson.max <= 5 ? 6500 : 9000,
    hadWrongAttempt: false,
    wrongAttempts: 0
  };
}
function lessonQuestions(lesson) { return Array.from({ length: 10 }, (_, i) => makeQuestion(lesson, i + 1, 'lesson')); }
function warmupQuestions(warmup) {
  const from = warmup.from || 1;
  const to = warmup.to || from;
  const nums = [];
  for (let n = from; n <= Math.min(to, from + 4); n++) nums.push(n);
  return nums.map((n, i) => makeQuestion(lessonByNum(n), i + 1, 'warmup'));
}
function practiceItemsFrom(log) {
  const weak = log.filter(x => x.wasWrongFirstTry || x.wasSlow);
  return weak.map((entry, i) => {
    const base = lessons.find(l => l.skill === entry.skill) || currentLesson();
    const q = makeQuestion(base, i + 30, 'practice');
    q.answer = entry.answer;
    q.display = entry.display;
    q.choices = safeChoices(q.answer, 1, base.max);
    q.prompt = 'Try this one again.';
    return q;
  });
}
function recommendationFrom(record) {
  if (record.practiceItemCount > 0 || record.wrongFirstTry > 0 || record.slowCorrect > 0) {
    return { type: 'lesson_range', level: '6A', from: Math.max(1, state.student.currentLessonNumber - 1), to: state.student.currentLessonNumber, label: 'Review today’s tricky items' };
  }
  return null;
}
function shell(content) {
  app.innerHTML = `<header class="topbar"><div><div class="brand">Math Stepwise</div><div class="subtle">Small steps. Clear mastery.</div></div><nav><button type="button" class="ghost" data-action="student">Student View</button><button type="button" class="ghost" data-action="parent">Parent View</button></nav></header><main>${content}</main>`;
}
function render() {
  if (screen === 'student') return renderStudent();
  if (screen === 'lesson') return renderLesson();
  if (screen === 'warmup') return renderWarmup();
  if (screen === 'practice') return renderPractice();
  if (screen === 'end') return renderEnd();
  if (screen === 'progress') return renderProgress();
  if (screen === 'parentGate') return renderParentGate();
  if (screen === 'parent') return renderParent();
  if (screen === 'studentInfo') return renderStudentInfo();
  if (screen === 'dailyRecord') return renderDailyRecord();
  if (screen === 'assign') return renderAssign();
}
function renderStudent() {
  const lesson = currentLesson();
  const warmup = activeWarmup();
  shell(`<section class="hero card"><div><p class="eyebrow">Today: ${fmtDate()}</p><h1>Hi, ${state.student.name}</h1><p class="muted">Today’s Plan</p><ol class="planList">${warmup ? `<li><strong>Quick Warm-Up</strong><br><span class="muted">${warmup.label}</span></li>` : ''}<li><strong>Today’s Lesson:</strong> ${lesson.displayId} — ${lesson.title}</li></ol></div><div class="heroActions"><button type="button" class="primary" data-action="start">Start Today’s Work</button><button type="button" class="secondary" data-action="progress">View Progress Map</button></div></section><section class="grid two"><div class="card"><h2>Choose Level</h2><select class="select" data-change="level">${levels.map(l => `<option value="${l.id}" ${l.id === state.student.currentLevel ? 'selected' : ''} ${l.status !== 'available' ? 'disabled' : ''}>${l.id} — ${l.title}${l.status !== 'available' ? ' (Locked)' : ''}</option>`).join('')}</select></div><div class="card"><h2>Current Work</h2><p class="bigLabel">${lesson.displayId}</p><p class="muted">${lesson.title}</p></div></section>`);
}
function startToday() {
  const w = activeWarmup();
  if (w) {
    session = { mode: 'warmup', date: todayIso(), startTime: Date.now(), warmup: w, questions: warmupQuestions(w), index: 0, answerLog: [] };
    screen = 'warmup';
  } else startLessonOnly();
  render();
}
function startLessonOnly() {
  session = { mode: 'lesson', date: todayIso(), startTime: Date.now(), lesson: currentLesson(), questions: lessonQuestions(currentLesson()), index: 0, answerLog: [], practiceItems: [], practiceLog: [], mastered: false };
  screen = 'lesson';
}
function qHtml(q, label, helper) {
  return `<section class="card lessonCard"><p class="eyebrow">${label}</p><h1>${q.prompt}</h1><div class="questionDisplay">${q.display}</div><div class="choices">${q.choices.map(c => `<button type="button" class="choice" data-answer="${c}">${c}</button>`).join('')}</div><p class="muted">${helper}</p><div id="feedback"></div></section>`;
}
function renderLesson() {
  if (!session) { screen = 'student'; return render(); }
  const q = session.questions[session.index];
  if (!q) return finishLesson();
  shell(qHtml(q, `${session.lesson.displayId} • Question ${session.index + 1} of ${session.questions.length}`, 'Take your time. Do your best.'));
}
function renderWarmup() {
  if (!session) { screen = 'student'; return render(); }
  const q = session.questions[session.index];
  if (!q) { state.manualWarmup = null; state.appRecommendedWarmup = null; saveState(); startLessonOnly(); return render(); }
  shell(qHtml(q, `Quick Warm-Up • ${session.index + 1} of ${session.questions.length}`, 'Let’s practice a few before today’s lesson.'));
}
function renderPractice() {
  if (!session) { screen = 'student'; return render(); }
  const q = session.practiceItems[session.index];
  if (!q) return finishPractice();
  const left = session.practiceItems.length - session.index;
  shell(qHtml(q, `Practice Again • ${left} left`, 'Let’s clear each item correctly.'));
}
function chooseAnswer(value) {
  if (!session) return;
  const list = session.mode === 'practice' ? session.practiceItems : session.questions;
  const q = list[session.index];
  if (!q) return;
  const chosen = Number(value);
  const correct = chosen === q.answer;
  const elapsed = Date.now() - (q.shownAt || (q.shownAt = Date.now()));
  if (!correct) {
    q.hadWrongAttempt = true;
    q.wrongAttempts += 1;
    const fb = document.getElementById('feedback');
    if (fb) fb.innerHTML = `<div class="feedback"><strong>${encouragementFor(q)}</strong><br><span>Try ${q.wrongAttempts + 1}. The question is still active.</span></div>`;
    document.querySelectorAll('.choice').forEach(el => {
      if (Number(el.dataset.answer) === chosen) {
        el.classList.remove('shake');
        void el.offsetWidth;
        el.classList.add('shake');
      }
    });
    return;
  }
  const entry = { questionId: q.id, skill: q.skill, answer: q.answer, finalCorrect: true, wasWrongFirstTry: q.hadWrongAttempt, wasSlow: elapsed > q.slowThresholdMs, wrongAttempts: q.wrongAttempts, elapsedMs: elapsed, display: q.display };
  if (session.mode === 'practice') session.practiceLog.push(entry);
  else session.answerLog.push(entry);
  session.index += 1;
  if (session.mode === 'lesson') renderLesson();
  else if (session.mode === 'warmup') renderWarmup();
  else renderPractice();
}
function finishLesson() {
  session.practiceItems = practiceItemsFrom(session.answerLog);
  if (session.practiceItems.length) { session.mode = 'practice'; session.index = 0; screen = 'practice'; return render(); }
  finishPractice();
}
function finishPractice() {
  const elapsedMs = Date.now() - session.startTime;
  const wrongFirstTry = session.answerLog.filter(e => e.wasWrongFirstTry).length;
  const slowCorrect = session.answerLog.filter(e => e.wasSlow).length;
  const practiceItemCount = session.practiceItems.length;
  const lessonScore = `${session.answerLog.length - wrongFirstTry}/${session.answerLog.length}`;
  const practiceRetries = session.practiceLog.reduce((s, e) => s + e.wrongAttempts, 0);
  const record = { date: session.date, displayDate: fmtDate(session.date), level: session.lesson.level, lesson: session.lesson.displayId, lessonScore, practiceNeeded: practiceItemCount ? `Yes — ${practiceItemCount} item${practiceItemCount === 1 ? '' : 's'}` : 'No', practiceResult: practiceItemCount ? (practiceRetries ? 'Cleared after repeats' : 'Cleared') : 'Not needed', time: msToText(elapsedMs), timeMs: elapsedMs, finalStatus: 'Mastered', nextPractice: 'None', recommendation: 'Continue to next lesson.', wrongFirstTry, slowCorrect, practiceItemCount, mastered: true };
  const reco = recommendationFrom(record);
  if (reco) { state.appRecommendedWarmup = reco; record.nextPractice = reco.label; record.recommendation = `${reco.label} will appear as Quick Warm-Up next session.`; }
  else state.appRecommendedWarmup = null;
  state.dailyRecords.unshift(record);
  if (!state.mastered.includes(session.lesson.displayId)) state.mastered.push(session.lesson.displayId);
  state.lastCompletedLessonNumber = session.lesson.lessonNumber;
  state.student.currentLessonNumber = Math.min(200, session.lesson.lessonNumber + 1);
  session.mastered = true;
  saveState();
  screen = 'end';
  render();
}
function renderEnd() {
  shell(`<section class="card center"><h1>Great work today!</h1><p class="muted">Practice is complete. All practice items were answered correctly.</p><p class="notice successNotice">You are ready to continue if you want more.</p><div class="actions"><button type="button" class="secondary" data-action="endSession">End Today’s Session</button><button type="button" class="primary" data-action="continueLesson">Continue to Next Lesson</button></div></section>`);
}
function renderProgress() {
  const cur = currentLesson();
  const counts = { mastered: 0, review: 0, current: 0, locked: 0 };
  lessons.forEach(l => counts[lessonStatus(l)]++);
  shell(`<section class="card"><button type="button" class="ghost" data-action="student">← Back to Student Home</button><h1>Level 6A Progress Map</h1><p class="muted">Green = mastered. Amber = review. Purple = current. Gray = locked.</p><div class="legend"><span><b class="dot masteredDot"></b> Mastered</span><span><b class="dot reviewDot"></b> Review</span><span><b class="dot currentDot"></b> Current</span><span><b class="dot lockedDot"></b> Locked</span></div></section><section class="grid four"><div class="card"><p class="muted">Mastered</p><p class="metric">${counts.mastered}</p></div><div class="card"><p class="muted">Review</p><p class="metric">${counts.review}</p></div><div class="card"><p class="muted">Current</p><p class="metric small">${cur.displayId}</p></div><div class="card"><p class="muted">Locked</p><p class="metric">${counts.locked}</p></div></section><section class="card"><div class="hero"><div><h2>Unit 1: Counting up to 5</h2><p class="muted">Lessons 6A-1 to 6A-40 shown in this preview.</p></div><button type="button" class="primary" data-action="start">Start ${cur.displayId}</button></div><div class="lessonMap">${lessons.slice(0,40).map(l => `<button type="button" class="lessonTile ${lessonStatus(l)}" ${lessonStatus(l) === 'current' ? 'data-action="start"' : 'disabled'}>${lessonStatus(l) === 'locked' ? '🔒' : l.displayId}</button>`).join('')}</div></section>`);
}
function lessonStatus(l) {
  if (state.mastered.includes(l.displayId)) return 'mastered';
  if (l.lessonNumber === state.student.currentLessonNumber) return 'current';
  if (l.lessonNumber < state.student.currentLessonNumber) return 'review';
  return 'locked';
}
function renderParentGate() {
  shell(`<section class="card center parentGate"><h1>Parent Code</h1><p class="muted">Enter the parent code to open Parent View.</p><input id="parentCode" class="codeInput" type="password" inputmode="numeric" placeholder="Enter code" autocomplete="off"><div id="codeError" class="feedback hidden">Incorrect code. Try again.</div><div class="actions"><button type="button" class="secondary" data-action="student">Back to Student View</button><button type="button" class="primary" data-action="unlockParent">Unlock Parent View</button></div><p class="muted smallText">Ask your parent for the code.</p></section>`);
  setTimeout(() => document.getElementById('parentCode')?.focus(), 0);
}
function renderParent() {
  const warmup = activeWarmup();
  shell(`<section class="hero card"><div><p class="eyebrow">Parent View</p><h1>${state.student.name}'s Progress</h1><p class="muted">Review records, assign next-session Quick Warm-Up, or reset progress.</p></div><div class="heroActions"><button type="button" class="ghost" data-action="studentInfo">Student Information</button><button type="button" class="ghost" data-action="dailyRecord">Daily Work Record</button><button type="button" class="ghost" data-action="assign">Assign Warm-Up</button></div></section><section class="grid three"><div class="card"><p class="muted">Mastered</p><p class="metric">${state.mastered.length}</p></div><div class="card"><p class="muted">Records</p><p class="metric">${state.dailyRecords.length}</p></div><div class="card"><p class="muted">Next Quick Warm-Up</p><p class="metric small">${warmup ? `${warmup.label}<br><span>${warmup.source}</span>` : 'None'}</p></div></section><section class="card"><h2>Parent Settings</h2><p class="muted">Parent-only controls are kept here.</p><div class="settingsGrid"><div class="settingsBox"><h3>Change Parent Passcode</h3><p class="muted">Use a simple code that the child will not know.</p><label>Current Code <input id="currentParentCode" class="codeInput smallInput" type="password" inputmode="numeric" autocomplete="off"></label><label>New Code <input id="newParentCode" class="codeInput smallInput" type="password" inputmode="numeric" autocomplete="off"></label><label>Confirm New Code <input id="confirmParentCode" class="codeInput smallInput" type="password" inputmode="numeric" autocomplete="off"></label><div id="passcodeMessage" class="muted"></div><div class="actions left"><button type="button" class="primary" data-action="saveParentCode">Save New Code</button><button type="button" class="secondary" data-action="resetParentCodeDefault">Reset to 1234</button></div></div><div class="settingsBox dangerZone"><h3>Reset Student Progress</h3><p class="muted">Clears progress saved on this device and returns the student to 6A-1.</p><button type="button" class="danger" data-action="reset">Reset Student Progress</button></div></div></section>`);
}
function renderStudentInfo() {
  shell(`<section class="card"><button type="button" class="ghost" data-action="parentHome">← Back</button><h1>Student Information</h1><div class="infoGrid"><div><span>Student Name</span><strong>${state.student.name}</strong></div><div><span>Date of Enrollment</span><strong>${fmtDate(state.student.enrollmentDate)}</strong></div><div><span>Starting Level</span><strong>${state.student.startingLevel}</strong></div><div><span>Current Level</span><strong>${state.student.currentLevel}</strong></div><div><span>Current Lesson</span><strong>${currentLesson().displayId}</strong></div><div><span>Parent / Guardian</span><strong>${state.student.parentName}</strong></div><div><span>Notes</span><strong>${state.student.notes}</strong></div></div></section>`);
}
function filteredRecords() { return state.dailyRecords.filter(r => (recordFilters.level === 'all' || r.level === recordFilters.level) && (!recordFilters.from || r.date >= recordFilters.from) && (!recordFilters.to || r.date <= recordFilters.to)).sort((a,b) => a.date.localeCompare(b.date)); }
function renderDailyRecord() {
  const rows = filteredRecords();
  const grouped = [...rows.reduce((m,r)=>m.set(r.date,[...(m.get(r.date)||[]),r]),new Map()).entries()].map(([date,list])=>({date,list}));
  const chart = (title, getValue) => {
    const vals = grouped.map(getValue);
    const max = Math.max(1, ...vals);
    const width = 520, height = 170, pad = 28;
    const points = vals.map((v, i) => {
      const x = grouped.length === 1 ? width / 2 : pad + (i * (width - pad * 2)) / (grouped.length - 1);
      const y = height - pad - (v / max) * (height - pad * 2);
      return { x, y, v, label: grouped[i].date.slice(5) };
    });
    const polyline = points.map(p => `${p.x},${p.y}`).join(' ');
    return `<div class="chart lineChart"><h3>${title}</h3>${grouped.length ? `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${title}" class="lineSvg">
        <line x1="${pad}" y1="${height-pad}" x2="${width-pad}" y2="${height-pad}" class="axis" />
        <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height-pad}" class="axis" />
        <polyline points="${polyline}" class="trendLine" fill="none" />
        ${points.map(p => `<g><circle cx="${p.x}" cy="${p.y}" r="5" class="point" /><text x="${p.x}" y="${Math.max(14, p.y-10)}" text-anchor="middle" class="pointLabel">${p.v}</text><text x="${p.x}" y="${height-8}" text-anchor="middle" class="dateLabel">${p.label}</text></g>`).join('')}
      </svg>` : '<p class="muted">No data for this range.</p>'}</div>`;
  };
  shell(`<section class="card"><button type="button" class="ghost" data-action="parentHome">← Back</button><h1>Daily Work Record</h1><p class="muted">Default view shows the entire recorded progress. Use filters for a specific range.</p><div class="filters"><label>From <input type="date" data-filter="from" value="${recordFilters.from}"></label><label>To <input type="date" data-filter="to" value="${recordFilters.to}"></label><label>Level <select data-filter="level"><option value="all" ${recordFilters.level==='all'?'selected':''}>All levels</option>${levels.map(l=>`<option value="${l.id}" ${recordFilters.level===l.id?'selected':''}>${l.id}</option>`).join('')}</select></label><button type="button" class="secondary" data-action="clearFilters">Entire Progress</button></div></section><section class="grid two">${chart('Progress Graph', g => g.list.filter(r=>r.mastered).length)}${chart('Practice & Repetition Graph', g => g.list.reduce((s,r)=>s+(r.practiceItemCount||0)+(r.wrongFirstTry||0),0))}</section><section class="card"><h2>Records</h2><div class="tableWrap"><table><thead><tr><th>Date</th><th>Lesson</th><th>Lesson Score</th><th>Practice Needed</th><th>Practice Result</th><th>Time</th><th>Final Status</th><th>Next Practice</th><th>Recommendation</th></tr></thead><tbody>${(rows.length?rows.slice().reverse():[{displayDate:'No records yet',lesson:'-',lessonScore:'-',practiceNeeded:'-',practiceResult:'-',time:'-',finalStatus:'-',nextPractice:'-',recommendation:'Complete a lesson to see recommendations.'}]).map(r=>`<tr><td>${r.displayDate}</td><td>${r.lesson}</td><td>${r.lessonScore}</td><td>${r.practiceNeeded}</td><td>${r.practiceResult}</td><td>${r.time}</td><td>${r.finalStatus}</td><td>${r.nextPractice}</td><td>${r.recommendation}</td></tr>`).join('')}</tbody></table></div></section>`);
}
function isAssignable(id) { return levelOrder.indexOf(id) <= levelOrder.indexOf(state.student.currentLevel); }
function renderAssign() {
  const max = 200;
  shell(`<section class="card"><button type="button" class="ghost" data-action="parentHome">← Back</button><h1>Assign Quick Warm-Up for Next Session</h1><p class="muted">Parent assignment overrides the app recommendation. If you do nothing, the app uses its recommendation automatically.</p><div class="notice">Current app recommendation: ${state.appRecommendedWarmup ? state.appRecommendedWarmup.label : 'None'}</div><div class="formGrid"><label>Level <select data-assign="level">${levels.map(l=>`<option value="${l.id}" ${assignForm.level===l.id?'selected':''} ${!isAssignable(l.id)?'disabled':''}>${l.id} — ${l.title}${isAssignable(l.id)?'':' (Locked)'}</option>`).join('')}</select></label><label>From <select data-assign="from">${Array.from({length:max},(_,i)=>`<option value="${i+1}" ${assignForm.from===i+1?'selected':''}>${assignForm.level}-${i+1}</option>`).join('')}</select></label><label>To <select data-assign="to">${Array.from({length:max},(_,i)=>`<option value="${i+1}" ${assignForm.to===i+1?'selected':''}>${assignForm.level}-${i+1}</option>`).join('')}</select></label></div><div class="actions left"><button type="button" class="primary" data-action="saveAssign">Assign for Next Session</button><button type="button" class="secondary" data-action="clearAssign">Clear Parent Assignment</button></div><p class="muted">Future levels are locked. Current and lower levels stay available.</p></section>`);
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action], .choice');
  if (!btn) return;
  e.preventDefault();
  const action = btn.dataset.action;
  if (btn.classList.contains('choice')) return chooseAnswer(btn.dataset.answer);
  if (action === 'student') { parentUnlocked = false; session = null; screen = 'student'; return render(); }
  if (action === 'parent') { screen = parentUnlocked ? 'parent' : 'parentGate'; return render(); }
  if (action === 'start') return startToday();
  if (action === 'progress') { screen = 'progress'; return render(); }
  if (action === 'endSession') { session = null; screen = 'student'; return render(); }
  if (action === 'continueLesson') { if (!session?.mastered) return; session = null; startLessonOnly(); return render(); }
  if (action === 'unlockParent') { const input = document.getElementById('parentCode'); const error = document.getElementById('codeError'); if (input?.value === state.parentCode) { parentUnlocked = true; screen = 'parent'; render(); } else { error?.classList.remove('hidden'); input?.focus(); } return; }
  if (action === 'parentHome') { screen = 'parent'; return render(); }
  if (action === 'studentInfo') { screen = 'studentInfo'; return render(); }
  if (action === 'dailyRecord') { screen = 'dailyRecord'; return render(); }
  if (action === 'assign') { screen = 'assign'; return render(); }
  if (action === 'clearFilters') { recordFilters = { from:'', to:'', level:'all' }; return renderDailyRecord(); }
  if (action === 'saveAssign') { const from = Math.min(assignForm.from, assignForm.to); const to = Math.max(assignForm.from, assignForm.to); state.manualWarmup = { type:'lesson_range', level:assignForm.level, from, to, label: `${assignForm.level}-${from}${from===to?'':` to ${assignForm.level}-${to}`}` }; saveState(); screen = 'parent'; return render(); }
  if (action === 'clearAssign') { state.manualWarmup = null; saveState(); screen = 'parent'; return render(); }

  if (action === 'saveParentCode') {
    const current = document.getElementById('currentParentCode')?.value || '';
    const next = document.getElementById('newParentCode')?.value || '';
    const confirmNext = document.getElementById('confirmParentCode')?.value || '';
    const msg = document.getElementById('passcodeMessage');
    if (current !== state.parentCode) { if (msg) msg.innerHTML = '<span class="errorText">Current code is incorrect.</span>'; return; }
    if (!/^\d{4,6}$/.test(next)) { if (msg) msg.innerHTML = '<span class="errorText">Use a 4 to 6 digit code.</span>'; return; }
    if (next !== confirmNext) { if (msg) msg.innerHTML = '<span class="errorText">New codes do not match.</span>'; return; }
    state.parentCode = next;
    saveState();
    if (msg) msg.innerHTML = '<span class="successText">Parent code saved.</span>';
    ['currentParentCode','newParentCode','confirmParentCode'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    return;
  }
  if (action === 'resetParentCodeDefault') {
    state.parentCode = DEFAULT_PARENT_CODE;
    saveState();
    const msg = document.getElementById('passcodeMessage');
    if (msg) msg.innerHTML = '<span class="successText">Parent code reset to 1234.</span>';
    ['currentParentCode','newParentCode','confirmParentCode'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    return;
  }
  if (action === 'reset') { if (confirm('Are you sure you want to reset all student progress on this device?')) clearAllProgress(); return; }
});

document.addEventListener('change', (e) => {
  if (e.target.matches('[data-change="level"]')) { state.student.currentLevel = e.target.value; saveState(); render(); }
  if (e.target.matches('[data-filter]')) { recordFilters[e.target.dataset.filter] = e.target.value; renderDailyRecord(); }
  if (e.target.matches('[data-assign]')) { const key = e.target.dataset.assign; assignForm[key] = key === 'level' ? e.target.value : Number(e.target.value); if (assignForm.to < assignForm.from) assignForm.to = assignForm.from; renderAssign(); }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && screen === 'parentGate') document.querySelector('[data-action="unlockParent"]')?.click();
});

render();

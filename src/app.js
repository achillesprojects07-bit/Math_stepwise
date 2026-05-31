import { level6ALessons, level6AUnits } from './curriculum/level6A.js';
import { generateLessonQuestions, generatePracticeItems, generateQuestion, generateQuestionsForWarmup } from './engine/questionGenerator.js';
import { evaluateLesson, makeNextPracticeRecommendation } from './engine/masteryEngine.js';
import { loadState, saveState, resetStudentProgress } from './engine/progressStore.js';
import { levels, levelOrder } from './config/levels.js';

const app = document.getElementById('app');
let state = loadState();
let screen = 'student';
let parentUnlocked = false;
let selectedLesson = lessonByNumber(state.student.currentLessonNumber);
let session = null;
let recordFilters = { from: '', to: '', level: 'all' };
let assignForm = { level: state.student.currentLevel, from: 1, to: 1 };

function lessonByNumber(n) {
  return level6ALessons.find((l) => l.lessonNumber === Number(n)) || level6ALessons[0];
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(iso = todayIso()) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function msToText(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}m ${s}s`;
}

function activeWarmup() {
  if (state.manualWarmup) return { ...state.manualWarmup, source: 'Parent assigned' };
  if (state.appRecommendedWarmup) return { ...state.appRecommendedWarmup, source: 'App recommendation' };
  return null;
}

function isLevelAssignable(levelId) {
  const currentIndex = levelOrder.indexOf(state.student.currentLevel);
  const levelIndex = levelOrder.indexOf(levelId);
  return levelIndex !== -1 && currentIndex !== -1 && levelIndex <= currentIndex;
}

function render() {
  selectedLesson = lessonByNumber(state.student.currentLessonNumber);
  if (screen === 'student') renderStudentHome();
  if (screen === 'lesson') renderLesson();
  if (screen === 'practice') renderPracticeAgain();
  if (screen === 'warmup') renderWarmup();
  if (screen === 'endChoice') renderEndChoice();
  if (screen === 'parentGate') renderParentGate();
  if (screen === 'parent') renderParent();
  if (screen === 'progressMap') renderProgressMap();
  if (screen === 'studentInfo') renderStudentInfo();
  if (screen === 'dailyRecord') renderDailyRecord();
  if (screen === 'assignPractice') renderAssignPractice();
}

function setButton(id, handler) {
  const el = document.getElementById(id);
  if (!el) return;
  el.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    handler(event);
  };
}


function safeToStudent() {
  session = null;
  screen = 'student';
  render();
}

function disableChoices() {
  document.querySelectorAll('.choice').forEach(btn => { btn.disabled = true; btn.classList.add('disabledChoice'); });
}

function ensureSessionFor(screenName) {
  if (!session) {
    screen = 'student';
    render();
    return false;
  }
  return true;
}

function shell(content) {
  app.innerHTML = `
    <header class="topbar">
      <div>
        <div class="brand">Math Stepwise</div>
        <div class="subtle">Small steps. Clear mastery.</div>
      </div>
      <nav>
        <button type="button" class="ghost" id="studentBtn">Student View</button>
        <button type="button" class="ghost" id="parentBtn">Parent View</button>
      </nav>
    </header>
    <main>${content}</main>
  `;
  setButton('studentBtn', () => { parentUnlocked = false; screen = 'student'; render(); });
  setButton('parentBtn', () => { screen = parentUnlocked ? 'parent' : 'parentGate'; render(); });
}

function renderStudentHome() {
  const warmup = activeWarmup();
  shell(`
    <section class="hero card">
      <div>
        <p class="eyebrow">Today: ${formatDisplayDate()}</p>
        <h1>Hi, ${state.student.name}</h1>
        <p class="muted">Today’s Plan</p>
        <ol class="planList">
          ${warmup ? `<li><strong>Quick Warm-Up</strong><br><span class="muted">${warmup.label}</span></li>` : ''}
          <li><strong>Today’s Lesson:</strong> ${selectedLesson.displayId} — ${selectedLesson.title}</li>
        </ol>
      </div>
      <div class="heroActions">
        ${warmup ? `<div class="notice smallNotice">Quick Warm-Up is ready.</div>` : ''}
        <button type="button" class="primary" id="startLesson">Start Today’s Work</button>
        <button type="button" class="secondary" id="viewProgressMap">View Progress Map</button>
      </div>
    </section>
    <section class="grid two">
      <div class="card">
        <h2>Choose Level</h2>
        <select class="select" id="levelSelect">
          ${levels.map(level => `<option value="${level.id}" ${level.id === state.student.currentLevel ? 'selected' : ''} ${level.status !== 'available' ? 'disabled' : ''}>${level.id} — ${level.title}${level.status !== 'available' ? ' (Coming soon)' : ''}</option>`).join('')}
        </select>
      </div>
      <div class="card">
        <h2>Current Work</h2>
        <p class="bigLabel">${selectedLesson.displayId}</p>
        <p class="muted">${selectedLesson.title}</p>
      </div>
    </section>
  `);
  setButton('startLesson', startSession);
  setButton('viewProgressMap', () => { screen = 'progressMap'; render(); });
  document.getElementById('levelSelect').onchange = (event) => {
    const nextLevel = levels.find(level => level.id === event.target.value);
    if (!nextLevel || nextLevel.status !== 'available') return;
    state.student.currentLevel = nextLevel.id;
    saveState(state);
    renderStudentHome();
  };
}

function startSession() {
  const warmup = activeWarmup();
  if (warmup) {
    session = createWarmupSession(warmup);
    screen = 'warmup';
  } else {
    startLessonOnly();
  }
  render();
}

function createWarmupSession(warmup) {
  return {
    mode: 'warmup',
    startTime: Date.now(),
    date: todayIso(),
    warmup,
    questions: generateQuestionsForWarmup(warmup),
    index: 0,
    answerLog: [],
    practiceItems: [],
    practiceLog: [],
    cleared: false
  };
}

function startLessonOnly() {
  session = {
    mode: 'lesson',
    startTime: Date.now(),
    date: todayIso(),
    lesson: selectedLesson,
    questions: generateLessonQuestions(selectedLesson),
    index: 0,
    answerLog: [],
    practiceItems: [],
    practiceLog: [],
    result: null,
    mastered: false
  };
  screen = 'lesson';
}

function questionHtml(q, progressText, helper = 'Take your time. Do your best.') {
  return `
    <section class="card lessonCard">
      <p class="eyebrow">${progressText}</p>
      <h1>${q.prompt}</h1>
      <div class="questionDisplay">${q.display}</div>
      <div class="choices">${q.choices.map(c => `<button type="button" class="choice" data-choice="${c}">${c}</button>`).join('')}</div>
      <p class="muted">${helper}</p>
    </section>
  `;
}

function renderLesson() {
  if (!ensureSessionFor('lesson')) return;
  const q = session.questions[session.index];
  if (!q) { finishLessonBlock(); return; }
  shell(questionHtml(q, `${selectedLesson.displayId} • Question ${session.index + 1} of ${session.questions.length}`));
  attachChoiceHandlers(q, 'lesson');
}

function renderWarmup() {
  if (!ensureSessionFor('warmup')) return;
  const q = session.questions[session.index];
  if (!q) { finishWarmup(); return; }
  shell(questionHtml(q, `Quick Warm-Up • ${session.index + 1} of ${session.questions.length}`, 'Let’s practice a few before today’s lesson.'));
  attachChoiceHandlers(q, 'warmup');
}

function renderPracticeAgain() {
  if (!ensureSessionFor('practice')) return;
  if (!session.practiceItems || session.practiceItems.length === 0 || session.index >= session.practiceItems.length) { finishPracticeAgain(); return; }
  const q = session.practiceItems[session.index];
  const left = Math.max(1, session.practiceItems.length - session.index);
  const helper = q.wrongAttempts >= 2 ? 'Try counting slowly one by one. You can do it.' : 'Let’s clear each item correctly.';
  shell(questionHtml(q, `Practice Again • ${left} left`, helper));
  attachChoiceHandlers(q, 'practice');
}

function attachChoiceHandlers(q, mode) {
  const shownAt = Date.now();
  let acceptedCorrect = false;
  document.querySelectorAll('.choice').forEach(btn => btn.onclick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (acceptedCorrect || !session) return;
    const chosen = Number(btn.dataset.choice);
    const correct = chosen === q.answer;
    const elapsed = Date.now() - shownAt;

    if (!correct) {
      q.hadWrongAttempt = true;
      q.wrongAttempts = (q.wrongAttempts || 0) + 1;
      if (mode === 'practice') {
        q.practiceMissed = true;
        q.guided = q.wrongAttempts >= 2;
        // Keep the same practice item active until it is answered correctly.
        // Do not expand the queue during practice; this prevents 4+ mistakes from freezing or creating endless extra work.
      }
      showGentleTryAgain(q);
      return;
    }

    acceptedCorrect = true;
    disableChoices();

    const entry = {
      questionId: q.id,
      skill: q.skill,
      source: q.source,
      answer: q.answer,
      chosen,
      finalCorrect: true,
      wasWrongFirstTry: Boolean(q.hadWrongAttempt),
      wasSlow: elapsed > q.slowThresholdMs,
      elapsedMs: elapsed,
      wrongAttempts: q.wrongAttempts || 0,
      display: q.display,
      prompt: q.prompt
    };

    if (mode === 'lesson') {
      session.answerLog.push(entry);
      session.index += 1;
      if (session.index >= session.questions.length) finishLessonBlock();
      else renderLesson();
      return;
    }

    if (mode === 'warmup') {
      session.answerLog.push(entry);
      session.index += 1;
      if (session.index >= session.questions.length) finishWarmup();
      else renderWarmup();
      return;
    }

    session.practiceLog.push(entry);
    session.index += 1;
    if (session.index >= session.practiceItems.length) finishPracticeAgain();
    else renderPracticeAgain();
  });
}

function showGentleTryAgain(q) {
  const card = document.querySelector('.lessonCard');
  const existing = document.querySelector('.feedback');
  if (existing) existing.remove();
  const guided = q.wrongAttempts >= 2 ? ' Try counting slowly one by one.' : '';
  card.insertAdjacentHTML('beforeend', `<div class="feedback">Almost. Let’s try this one again.${guided}</div>`);
}

function finishWarmup() {
  // Quick Warm-Up is cleared only after all warm-up items were answered correctly.
  state.manualWarmup = null;
  state.appRecommendedWarmup = null;
  saveState(state);
  startLessonOnly();
  render();
}

function finishLessonBlock() {
  if (!ensureSessionFor('lesson')) return;
  const elapsedMs = Date.now() - session.startTime;
  const result = evaluateLesson({ answerLog: session.answerLog, elapsedMs, lesson: selectedLesson });
  session.result = result;
  session.practiceItems = generatePracticeItems(session.answerLog);

  if (session.practiceItems.length > 0) {
    session.index = 0;
    screen = 'practice';
    render();
  } else {
    finishPracticeAgain();
  }
}

function finishPracticeAgain() {
  if (!ensureSessionFor('practice')) return;
  // This function is reachable only after each practice item has been answered correctly.
  const elapsedMs = Date.now() - session.startTime;
  const lessonScore = `${session.answerLog.filter(e => !e.wasWrongFirstTry).length}/${session.answerLog.length}`;
  const practiceNeeded = session.practiceItems.length > 0 ? `Yes — ${session.practiceItems.length} item${session.practiceItems.length === 1 ? '' : 's'}` : 'No';
  const practiceRetries = session.practiceLog.reduce((sum, item) => sum + item.wrongAttempts, 0);
  const practiceResult = session.practiceItems.length > 0 ? (practiceRetries > 0 ? 'Cleared after repeats' : 'Cleared') : 'Not needed';
  const recommendation = makeNextPracticeRecommendation({
    lesson: selectedLesson,
    answerLog: session.answerLog,
    practiceLog: session.practiceLog,
    practiceItemCount: session.practiceItems.length
  });
  const mastered = session.result?.completed === true && practiceResult !== 'Still needs review';
  const finalStatus = mastered ? 'Mastered' : 'Needs Review';
  const nextPractice = recommendation.practice ? recommendation.label : 'None';

  const record = {
    date: session.date,
    displayDate: formatDisplayDate(session.date),
    level: selectedLesson.level,
    lesson: selectedLesson.displayId,
    skill: selectedLesson.title,
    lessonScore,
    practiceNeeded,
    practiceResult,
    time: msToText(elapsedMs),
    timeMs: elapsedMs,
    finalStatus,
    nextPractice,
    recommendation: recommendation.message,
    wrongFirstTry: session.answerLog.filter(e => e.wasWrongFirstTry).length,
    slowCorrect: session.answerLog.filter(e => e.wasSlow).length,
    practiceItemCount: session.practiceItems.length,
    mastered
  };

  state.dailyRecords.unshift(record);
  if (mastered && !state.mastered.includes(selectedLesson.displayId)) state.mastered.push(selectedLesson.displayId);
  if (recommendation.practice) state.appRecommendedWarmup = recommendation.practice;
  else state.appRecommendedWarmup = null;

  session.mastered = mastered;
  state.lastCompletedLessonNumber = selectedLesson.lessonNumber;
  state.student.currentLessonNumber = Math.min(200, selectedLesson.lessonNumber + 1);
  saveState(state);
  screen = 'endChoice';
  render();
}

function renderEndChoice() {
  const canContinue = Boolean(session?.mastered);
  shell(`
    <section class="card center">
      <h1>Great work today!</h1>
      <p class="muted">Practice is complete. All practice items were answered correctly.</p>
      <p class="notice ${canContinue ? 'successNotice' : ''}">${canContinue ? 'You are ready to continue if you want more.' : 'Let’s stop here and practice again next time.'}</p>
      <div class="actions">
        <button type="button" class="secondary" id="endSession">End Today’s Session</button>
        <button type="button" class="primary" id="continueLesson" ${canContinue ? '' : 'disabled'}>Continue to Next Lesson</button>
      </div>
    </section>
  `);
  setButton('endSession', safeToStudent);
  setButton('continueLesson', () => {
    if (!canContinue) return;
    selectedLesson = lessonByNumber(state.student.currentLessonNumber);
    startLessonOnly();
    render();
  });
}


function lessonStatus(lesson) {
  if (state.mastered.includes(lesson.displayId)) return 'mastered';
  if (lesson.lessonNumber === state.student.currentLessonNumber) return 'current';
  if (lesson.lessonNumber < state.student.currentLessonNumber) return 'review';
  return 'locked';
}

function renderProgressMap() {
  const counts = level6ALessons.reduce((acc, lesson) => {
    const status = lessonStatus(lesson);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  shell(`
    <section class="card">
      <button type="button" class="ghost" id="backStudent">← Back to Student Home</button>
      <h1>Level 6A Progress Map</h1>
      <p class="muted">Green = mastered. Amber = review. Purple = current. Gray = locked.</p>
      <div class="legend">
        <span><b class="dot masteredDot"></b> Mastered</span>
        <span><b class="dot reviewDot"></b> Review</span>
        <span><b class="dot currentDot"></b> Current</span>
        <span><b class="dot lockedDot"></b> Locked</span>
      </div>
    </section>
    <section class="grid four">
      <div class="card"><p class="muted">Mastered</p><p class="metric">${counts.mastered || 0}</p></div>
      <div class="card"><p class="muted">Review</p><p class="metric">${counts.review || 0}</p></div>
      <div class="card"><p class="muted">Current</p><p class="metric small">${selectedLesson.displayId}</p></div>
      <div class="card"><p class="muted">Locked</p><p class="metric">${counts.locked || 0}</p></div>
    </section>
    <section class="card">
      <div class="progressMapHeader">
        <div>
          <h2>Unit 1: Counting up to 5</h2>
          <p class="muted">Lessons 6A-1 to 6A-40 shown in this preview.</p>
        </div>
        <button type="button" class="primary" id="startCurrentFromMap">Start ${selectedLesson.displayId}</button>
      </div>
      <div class="lessonMap progressOnly">
        ${level6ALessons.slice(0, 40).map(lesson => {
          const status = lessonStatus(lesson);
          const isCurrent = status === 'current';
          const label = status === 'locked' ? '🔒' : lesson.displayId;
          return `<button type="button" class="lessonTile ${status}" data-lesson="${lesson.lessonNumber}" ${isCurrent ? '' : 'disabled'} title="${lesson.displayId} — ${lesson.title}">${label}</button>`;
        }).join('')}
      </div>
      <p class="muted">Only the current lesson can be started from this map. Future lessons stay locked.</p>
    </section>
  `);
  setButton('backStudent', () => { screen = 'student'; render(); });
  setButton('startCurrentFromMap', startSession);
  document.querySelectorAll('.lessonTile.current').forEach(btn => btn.onclick = () => {
    selectedLesson = lessonByNumber(btn.dataset.lesson);
    state.student.currentLessonNumber = selectedLesson.lessonNumber;
    saveState(state);
    startSession();
  });
}

function renderParentGate() {
  shell(`
    <section class="card center parentGate">
      <h1>Parent Code</h1>
      <p class="muted">Enter the parent code to open Parent View.</p>
      <input id="parentCode" class="codeInput" type="password" inputmode="numeric" placeholder="Enter code" autocomplete="off">
      <div id="codeError" class="feedback hidden">Incorrect code. Try again.</div>
      <div class="actions">
        <button type="button" class="secondary" id="backToStudent">Back to Student View</button>
        <button type="button" class="primary" id="unlockParent">Unlock Parent View</button>
      </div>
      <p class="muted smallText">Demo parent code: 1234</p>
    </section>
  `);
  const input = document.getElementById('parentCode');
  const error = document.getElementById('codeError');
  const unlock = () => {
    if (input.value === '1234') {
      parentUnlocked = true;
      screen = 'parent';
      render();
    } else {
      error.classList.remove('hidden');
      input.focus();
    }
  };
  setButton('backToStudent', () => { parentUnlocked = false; screen = 'student'; render(); });
  setButton('unlockParent', unlock);
  input.onkeydown = (event) => { if (event.key === 'Enter') unlock(); };
  input.oninput = () => error.classList.add('hidden');
  input.focus();
}

function renderParent() {
  const warmup = activeWarmup();
  shell(`
    <section class="hero card">
      <div>
        <p class="eyebrow">Parent View</p>
        <h1>${state.student.name}'s Progress</h1>
        <p class="muted">Review records, assign next-session Quick Warm-Up, or reset progress.</p>
      </div>
      <div class="heroActions">
        <button type="button" class="ghost" id="studentInfo">Student Information</button>
        <button type="button" class="ghost" id="dailyRecord">Daily Work Record</button>
        <button type="button" class="ghost" id="assignPractice">Assign Warm-Up</button>
      </div>
    </section>
    <section class="grid three">
      <div class="card"><p class="muted">Mastered</p><p class="metric">${state.mastered.length}</p></div>
      <div class="card"><p class="muted">Records</p><p class="metric">${state.dailyRecords.length}</p></div>
      <div class="card"><p class="muted">Next Quick Warm-Up</p><p class="metric small">${warmup ? `${warmup.label}<br><span>${warmup.source}</span>` : 'None'}</p></div>
    </section>
    <section class="card">
      <h2>Parent Settings</h2>
      <p class="muted">Reset is parent-only and clears progress saved on this device.</p>
      <button type="button" class="danger" id="resetProgress">Reset Student Progress</button>
    </section>
  `);
  setButton('studentInfo', () => { screen = 'studentInfo'; render(); });
  setButton('dailyRecord', () => { screen = 'dailyRecord'; render(); });
  setButton('assignPractice', () => { screen = 'assignPractice'; render(); });
  document.getElementById('resetProgress').onclick = () => {
    if (confirm('Are you sure you want to reset all student progress on this device?')) {
      state = resetStudentProgress();
      selectedLesson = lessonByNumber(state.student.currentLessonNumber);
      parentUnlocked = false;
      screen = 'student';
      render();
    }
  };
}

function renderStudentInfo() {
  shell(`
    <section class="card">
      <button type="button" class="ghost" id="back">← Back</button>
      <h1>Student Information</h1>
      <div class="infoGrid">
        <div><span>Student Name</span><strong>${state.student.name}</strong></div>
        <div><span>Date of Enrollment</span><strong>${formatDisplayDate(state.student.enrollmentDate)}</strong></div>
        <div><span>Starting Level</span><strong>${state.student.startingLevel}</strong></div>
        <div><span>Current Level</span><strong>${state.student.currentLevel}</strong></div>
        <div><span>Current Lesson</span><strong>${selectedLesson.displayId}</strong></div>
        <div><span>Parent / Guardian</span><strong>${state.student.parentName}</strong></div>
        <div><span>Notes</span><strong>${state.student.notes}</strong></div>
      </div>
    </section>
  `);
  setButton('back', () => { screen = 'parent'; render(); });
}

function filteredRecords() {
  return state.dailyRecords.filter((r) => {
    const byLevel = recordFilters.level === 'all' || r.level === recordFilters.level;
    const byFrom = !recordFilters.from || r.date >= recordFilters.from;
    const byTo = !recordFilters.to || r.date <= recordFilters.to;
    return byLevel && byFrom && byTo;
  }).slice().sort((a, b) => a.date.localeCompare(b.date));
}

function recordsByDate(records) {
  const map = new Map();
  records.forEach((r) => {
    const day = r.date;
    if (!map.has(day)) map.set(day, []);
    map.get(day).push(r);
  });
  return [...map.entries()].map(([date, list]) => ({ date, list }));
}

function barChart(title, rows, getValue, emptyText) {
  const values = rows.map(row => getValue(row));
  const max = Math.max(1, ...values);
  if (!rows.length) return `<div class="chart"><h3>${title}</h3><p class="muted">${emptyText}</p></div>`;
  return `<div class="chart"><h3>${title}</h3><div class="bars">${rows.map((row, i) => {
    const val = values[i];
    const height = Math.max(8, Math.round((val / max) * 110));
    return `<div class="barItem"><div class="barValue">${val}</div><div class="bar" style="height:${height}px"></div><div class="barLabel">${row.date.slice(5)}</div></div>`;
  }).join('')}</div></div>`;
}

function renderDailyRecord() {
  const rows = filteredRecords();
  const grouped = recordsByDate(rows);
  const progressGraph = barChart('Progress Graph', grouped, row => row.list.filter(r => r.mastered).length, 'No completed work for this range.');
  const repetitionGraph = barChart('Practice & Repetition Graph', grouped, row => row.list.reduce((sum, r) => sum + (r.practiceItemCount || 0) + (r.wrongFirstTry || 0), 0), 'No practice data for this range.');
  const summary = buildRecordSummary(rows);
  shell(`
    <section class="card">
      <button type="button" class="ghost" id="back">← Back</button>
      <h1>Daily Work Record</h1>
      <p class="muted">Default view shows the entire recorded progress. Use filters to review a specific range.</p>
      <div class="filters">
        <label>From <input type="date" id="fromDate" value="${recordFilters.from}"></label>
        <label>To <input type="date" id="toDate" value="${recordFilters.to}"></label>
        <label>Level <select id="recordLevel"><option value="all" ${recordFilters.level === 'all' ? 'selected' : ''}>All levels</option>${levels.map(level => `<option value="${level.id}" ${recordFilters.level === level.id ? 'selected' : ''}>${level.id}</option>`).join('')}</select></label>
        <button type="button" class="secondary" id="clearFilters">Entire Progress</button>
      </div>
    </section>
    <section class="grid two">${progressGraph}${repetitionGraph}</section>
    <section class="card">
      <h2>Summary</h2>
      <p>${summary}</p>
    </section>
    <section class="card">
      <h2>Records</h2>
      <div class="tableWrap"><table><thead><tr><th>Date</th><th>Lesson</th><th>Lesson Score</th><th>Practice Needed</th><th>Practice Result</th><th>Time</th><th>Final Status</th><th>Next Practice</th><th>Recommendation</th></tr></thead><tbody>
        ${(rows.length ? rows.slice().reverse() : [{ displayDate: 'No records yet', lesson: '-', lessonScore: '-', practiceNeeded: '-', practiceResult: '-', time: '-', finalStatus: '-', nextPractice: '-', recommendation: 'Complete a lesson to see recommendations.' }]).map(r => `<tr><td>${r.displayDate}</td><td>${r.lesson}</td><td>${r.lessonScore}</td><td>${r.practiceNeeded}</td><td>${r.practiceResult}</td><td>${r.time}</td><td>${r.finalStatus}</td><td>${r.nextPractice}</td><td>${r.recommendation}</td></tr>`).join('')}
      </tbody></table></div>
    </section>
  `);
  setButton('back', () => { screen = 'parent'; render(); });
  document.getElementById('fromDate').onchange = (e) => { recordFilters.from = e.target.value; renderDailyRecord(); };
  document.getElementById('toDate').onchange = (e) => { recordFilters.to = e.target.value; renderDailyRecord(); };
  document.getElementById('recordLevel').onchange = (e) => { recordFilters.level = e.target.value; renderDailyRecord(); };
  setButton('clearFilters', () => { recordFilters = { from: '', to: '', level: 'all' }; renderDailyRecord(); });
}

function buildRecordSummary(rows) {
  if (!rows.length) return 'No records yet for this range.';
  const mastered = rows.filter(r => r.mastered).length;
  const totalPractice = rows.reduce((sum, r) => sum + (r.practiceItemCount || 0), 0);
  const latestNext = rows[rows.length - 1]?.nextPractice || 'None';
  return `${state.student.name} completed ${rows.length} work entr${rows.length === 1 ? 'y' : 'ies'} in this view. ${mastered} mastered. Practice items: ${totalPractice}. Next practice: ${latestNext}.`;
}

function renderAssignPractice() {
  const availableLevels = levels.map(level => ({ ...level, assignable: isLevelAssignable(level.id) }));
  const selectedLevel = availableLevels.find(l => l.id === assignForm.level) || availableLevels[0];
  const maxLesson = selectedLevel.id === '6A' ? 200 : 200;
  shell(`
    <section class="card">
      <button type="button" class="ghost" id="back">← Back</button>
      <h1>Assign Quick Warm-Up for Next Session</h1>
      <p class="muted">Parent assignment overrides the app recommendation. If you do nothing, the app uses its recommendation automatically.</p>
      <div class="notice">Current app recommendation: ${state.appRecommendedWarmup ? state.appRecommendedWarmup.label : 'None'}</div>
      <div class="formGrid">
        <label>Level
          <select id="assignLevel">
            ${availableLevels.map(level => `<option value="${level.id}" ${assignForm.level === level.id ? 'selected' : ''} ${!level.assignable ? 'disabled' : ''}>${level.id} — ${level.title}${level.assignable ? '' : ' (Locked)'}</option>`).join('')}
          </select>
        </label>
        <label>From
          <select id="fromLesson">${Array.from({ length: maxLesson }, (_, i) => `<option value="${i + 1}" ${assignForm.from === i + 1 ? 'selected' : ''}>${selectedLevel.id}-${i + 1}</option>`).join('')}</select>
        </label>
        <label>To
          <select id="toLesson">${Array.from({ length: maxLesson }, (_, i) => `<option value="${i + 1}" ${assignForm.to === i + 1 ? 'selected' : ''}>${selectedLevel.id}-${i + 1}</option>`).join('')}</select>
        </label>
      </div>
      <div class="actions left">
        <button type="button" class="primary" id="assignWarmup">Assign for Next Session</button>
        <button type="button" class="secondary" id="clearManual">Clear Parent Assignment</button>
      </div>
      <p class="muted">Available levels: current level and lower/completed levels. Future levels are locked.</p>
    </section>
  `);
  setButton('back', () => { screen = 'parent'; render(); });
  document.getElementById('assignLevel').onchange = (e) => { assignForm.level = e.target.value; assignForm.from = 1; assignForm.to = 1; renderAssignPractice(); };
  document.getElementById('fromLesson').onchange = (e) => { assignForm.from = Number(e.target.value); if (assignForm.to < assignForm.from) assignForm.to = assignForm.from; renderAssignPractice(); };
  document.getElementById('toLesson').onchange = (e) => { assignForm.to = Number(e.target.value); if (assignForm.to < assignForm.from) assignForm.from = assignForm.to; renderAssignPractice(); };
  setButton('assignWarmup', () => {
    const from = Math.min(assignForm.from, assignForm.to);
    const to = Math.max(assignForm.from, assignForm.to);
    state.manualWarmup = {
      type: 'lesson_range',
      level: assignForm.level,
      from,
      to,
      label: `${assignForm.level}-${from}${from === to ? '' : ` to ${assignForm.level}-${to}`}`,
      source: 'Parent assigned'
    };
    saveState(state);
    screen = 'parent';
    render();
  });
  setButton('clearManual', () => {
    state.manualWarmup = null;
    saveState(state);
    screen = 'parent';
    render();
  });
}

render();

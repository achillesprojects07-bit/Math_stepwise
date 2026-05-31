import { level6ALessons } from './curriculum/level6A.js';
import { generateLessonQuestions, generatePracticeItems, generateQuestion } from './engine/questionGenerator.js';
import { evaluateLesson } from './engine/masteryEngine.js';
import { loadState, saveState, resetStudentProgress } from './engine/progressStore.js';

const app = document.getElementById('app');
let state = loadState();
let screen = 'student';
let selectedLesson = level6ALessons.find((l) => l.lessonNumber === state.student.currentLessonNumber) || level6ALessons[0];
let session = null;

function msToText(ms) {
  const totalSeconds = Math.round(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${m}m ${s}s`;
}

function render() {
  if (screen === 'student') renderStudentHome();
  if (screen === 'lesson') renderLesson();
  if (screen === 'practice') renderPracticeAgain();
  if (screen === 'endChoice') renderEndChoice();
  if (screen === 'parent') renderParent();
  if (screen === 'studentInfo') renderStudentInfo();
  if (screen === 'dailyRecord') renderDailyRecord();
  if (screen === 'assignPractice') renderAssignPractice();
}

function shell(content) {
  app.innerHTML = `
    <header class="topbar">
      <div>
        <div class="brand">Math Stepwise</div>
        <div class="subtle">Small steps. Clear mastery.</div>
      </div>
      <nav>
        <button class="ghost" id="studentBtn">Student View</button>
        <button class="ghost" id="parentBtn">Parent View</button>
      </nav>
    </header>
    <main>${content}</main>
  `;
  document.getElementById('studentBtn').onclick = () => { screen = 'student'; render(); };
  document.getElementById('parentBtn').onclick = () => { screen = 'parent'; render(); };
}

function renderStudentHome() {
  const assigned = state.assignedPractice;
  shell(`
    <section class="hero card">
      <div>
        <p class="eyebrow">Hi, ${state.student.name}</p>
        <h1>Ready for today?</h1>
        <p class="muted">Pick up from ${selectedLesson.displayId}: ${selectedLesson.title}</p>
      </div>
      <div class="heroActions">
        ${assigned ? `<div class="notice">Quick Practice is ready before today's lesson.</div>` : ''}
        <button class="primary" id="startLesson">Start</button>
      </div>
    </section>
    <section class="grid two">
      <div class="card">
        <h2>Choose Level</h2>
        <select class="select" id="levelSelect">
          <option selected>6A — Counting & Number Recognition</option>
          <option disabled>5A — Coming soon</option>
          <option disabled>4A — Coming soon</option>
          <option disabled>3A — Coming soon</option>
          <option disabled>2A — Coming soon</option>
        </select>
      </div>
      <div class="card">
        <h2>Current Work</h2>
        <p class="bigLabel">${selectedLesson.displayId}</p>
        <p class="muted">${selectedLesson.title}</p>
      </div>
    </section>
    <section class="card">
      <h2>Level 6A Map</h2>
      <div class="lessonMap">${level6ALessons.slice(0, 40).map(l => `<button class="lessonTile ${l.lessonNumber === selectedLesson.lessonNumber ? 'current' : ''}" data-lesson="${l.lessonNumber}">${l.displayId}</button>`).join('')}</div>
    </section>
  `);
  document.getElementById('startLesson').onclick = startSession;
  document.querySelectorAll('.lessonTile').forEach(btn => btn.onclick = () => {
    selectedLesson = level6ALessons.find((l) => l.lessonNumber === Number(btn.dataset.lesson));
    state.student.currentLessonNumber = selectedLesson.lessonNumber;
    saveState(state);
    renderStudentHome();
  });
}

function startSession() {
  if (state.assignedPractice) {
    session = {
      mode: 'assigned_practice',
      startTime: Date.now(),
      questions: Array.from({ length: 5 }, () => generateQuestion(state.assignedPractice.skill, 'assigned_practice')),
      index: 0,
      answerLog: [],
      practiceItems: [],
      practiceLog: []
    };
    screen = 'practice';
  } else {
    startLessonOnly();
  }
  render();
}

function startLessonOnly() {
  session = {
    mode: 'lesson',
    startTime: Date.now(),
    questions: generateLessonQuestions(selectedLesson),
    index: 0,
    answerLog: [],
    practiceItems: [],
    practiceLog: []
  };
  screen = 'lesson';
}

function questionHtml(q, progressText) {
  return `
    <section class="card lessonCard">
      <p class="eyebrow">${progressText}</p>
      <h1>${q.prompt}</h1>
      <div class="questionDisplay">${q.display}</div>
      <div class="choices">${q.choices.map(c => `<button class="choice" data-choice="${c}">${c}</button>`).join('')}</div>
      <p class="muted">Take your time. Do your best.</p>
    </section>
  `;
}

function renderLesson() {
  const q = session.questions[session.index];
  shell(questionHtml(q, `${selectedLesson.displayId} • Question ${session.index + 1} of ${session.questions.length}`));
  attachChoiceHandlers(q, false);
}

function attachChoiceHandlers(q, isPractice) {
  const shownAt = Date.now();
  document.querySelectorAll('.choice').forEach(btn => btn.onclick = () => {
    const chosen = Number(btn.dataset.choice);
    const correct = chosen === q.answer;
    const elapsed = Date.now() - shownAt;
    const entry = {
      question: q,
      chosen,
      finalCorrect: correct,
      wasWrongFirstTry: !correct,
      wasSlow: correct && elapsed > q.slowThresholdMs,
      elapsedMs: elapsed
    };

    if (isPractice) {
      if (correct) {
        session.practiceLog.push(entry);
        session.index += 1;
      } else {
        showGentleTryAgain(q);
        return;
      }
    } else {
      session.answerLog.push(entry);
      session.index += 1;
    }

    if (isPractice) {
      if (session.index >= session.practiceItems.length) finishPracticeAgain();
      else renderPracticeAgain();
    } else {
      if (session.index >= session.questions.length) finishLessonBlock();
      else renderLesson();
    }
  });
}

function showGentleTryAgain(q) {
  const card = document.querySelector('.lessonCard');
  const existing = document.querySelector('.feedback');
  if (existing) existing.remove();
  card.insertAdjacentHTML('beforeend', `<div class="feedback">Almost. Let’s try this one again.</div>`);
}

function finishLessonBlock() {
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

function renderPracticeAgain() {
  if (session.mode === 'assigned_practice') {
    const q = session.questions[session.index];
    shell(questionHtml(q, `Quick Practice • ${session.index + 1} of ${session.questions.length}`));
    attachChoiceHandlers(q, true);
    return;
  }
  const q = session.practiceItems[session.index];
  shell(questionHtml(q, `Practice Again • ${session.index + 1} of ${session.practiceItems.length}`));
  attachChoiceHandlers(q, true);
}

function finishPracticeAgain() {
  if (session.mode === 'assigned_practice') {
    state.assignedPractice = null;
    saveState(state);
    startLessonOnly();
    render();
    return;
  }
  const elapsedMs = Date.now() - session.startTime;
  const record = {
    date: new Date().toLocaleDateString(),
    level: '6A',
    lesson: selectedLesson.displayId,
    skill: selectedLesson.title,
    time: msToText(elapsedMs),
    firstTry: `${session.answerLog.filter(e => !e.wasWrongFirstTry).length}/${session.answerLog.length}`,
    finalAccuracy: '100%',
    practiceAgain: session.practiceItems.length,
    status: 'Completed',
    recommendation: session.result?.recommendation || 'Continue to the next lesson.'
  };
  state.dailyRecords.unshift(record);
  if (!state.mastered.includes(selectedLesson.displayId)) state.mastered.push(selectedLesson.displayId);
  state.student.currentLessonNumber = Math.min(200, selectedLesson.lessonNumber + 1);
  saveState(state);
  screen = 'endChoice';
  render();
}

function renderEndChoice() {
  shell(`
    <section class="card center">
      <h1>Great work today!</h1>
      <p class="muted">Practice is complete.</p>
      <div class="actions">
        <button class="secondary" id="endSession">End Today’s Session</button>
        <button class="primary" id="continueLesson">Continue to Next Lesson</button>
      </div>
    </section>
  `);
  document.getElementById('endSession').onclick = () => { screen = 'student'; render(); };
  document.getElementById('continueLesson').onclick = () => {
    selectedLesson = level6ALessons.find(l => l.lessonNumber === state.student.currentLessonNumber) || selectedLesson;
    startLessonOnly();
    render();
  };
}

function renderParent() {
  shell(`
    <section class="hero card">
      <div>
        <p class="eyebrow">Parent View</p>
        <h1>${state.student.name}'s Progress</h1>
        <p class="muted">Review records, assign next-session practice, or reset progress.</p>
      </div>
      <div class="heroActions">
        <button class="ghost" id="studentInfo">Student Information</button>
        <button class="ghost" id="dailyRecord">Daily Work Record</button>
        <button class="ghost" id="assignPractice">Assign Practice</button>
        <button class="danger" id="resetProgress">Reset Student Progress</button>
      </div>
    </section>
    <section class="grid three">
      <div class="card"><p class="muted">Mastered</p><p class="metric">${state.mastered.length}</p></div>
      <div class="card"><p class="muted">Records</p><p class="metric">${state.dailyRecords.length}</p></div>
      <div class="card"><p class="muted">Assigned Practice</p><p class="metric small">${state.assignedPractice ? state.assignedPractice.label : 'None'}</p></div>
    </section>
  `);
  document.getElementById('studentInfo').onclick = () => { screen = 'studentInfo'; render(); };
  document.getElementById('dailyRecord').onclick = () => { screen = 'dailyRecord'; render(); };
  document.getElementById('assignPractice').onclick = () => { screen = 'assignPractice'; render(); };
  document.getElementById('resetProgress').onclick = () => {
    if (confirm('Reset all student progress on this device?')) {
      state = resetStudentProgress();
      selectedLesson = level6ALessons.find((l) => l.lessonNumber === state.student.currentLessonNumber);
      screen = 'parent';
      render();
    }
  };
}

function renderStudentInfo() {
  shell(`
    <section class="card">
      <button class="ghost" id="back">← Back</button>
      <h1>Student Information</h1>
      <div class="infoGrid">
        <div><span>Student Name</span><strong>${state.student.name}</strong></div>
        <div><span>Date of Enrollment</span><strong>${state.student.enrollmentDate}</strong></div>
        <div><span>Starting Level</span><strong>${state.student.startingLevel}</strong></div>
        <div><span>Current Level</span><strong>${state.student.currentLevel}</strong></div>
        <div><span>Current Lesson</span><strong>6A-${state.student.currentLessonNumber}</strong></div>
        <div><span>Parent / Guardian</span><strong>${state.student.parentName}</strong></div>
      </div>
    </section>
  `);
  document.getElementById('back').onclick = () => { screen = 'parent'; render(); };
}

function renderDailyRecord() {
  const rows = state.dailyRecords.length ? state.dailyRecords : [{ date: 'No records yet', level: '-', lesson: '-', skill: '-', time: '-', firstTry: '-', finalAccuracy: '-', status: '-', recommendation: 'Complete a lesson to see recommendations.' }];
  shell(`
    <section class="card">
      <button class="ghost" id="back">← Back</button>
      <h1>Daily Work Record</h1>
      <div class="tableWrap"><table><thead><tr><th>Date</th><th>Lesson</th><th>Time</th><th>First Try</th><th>Final</th><th>Status</th><th>Recommendation</th></tr></thead><tbody>
        ${rows.map(r => `<tr><td>${r.date}</td><td>${r.lesson}</td><td>${r.time}</td><td>${r.firstTry}</td><td>${r.finalAccuracy}</td><td>${r.status}</td><td>${r.recommendation}</td></tr>`).join('')}
      </tbody></table></div>
    </section>
  `);
  document.getElementById('back').onclick = () => { screen = 'parent'; render(); };
}

function renderAssignPractice() {
  shell(`
    <section class="card">
      <button class="ghost" id="back">← Back</button>
      <h1>Assign Practice for Next Session</h1>
      <p class="muted">This will appear to the child as Quick Practice next time.</p>
      <div class="practiceChoices">
        <button data-skill="count_1_to_5" data-label="Counting 1–5">Counting 1–5</button>
        <button data-skill="count_1_to_10" data-label="Counting 1–10">Counting 1–10</button>
        <button data-skill="read_numbers_1_to_10" data-label="Number Reading 1–10">Number Reading 1–10</button>
        <button data-skill="recognize_dots_1_to_10" data-label="Dot Recognition 1–10">Dot Recognition 1–10</button>
      </div>
      <div class="notice">Recommendation: ${state.dailyRecords[0]?.recommendation || 'Start with Counting 1–5 if this is the first session.'}</div>
    </section>
  `);
  document.getElementById('back').onclick = () => { screen = 'parent'; render(); };
  document.querySelectorAll('.practiceChoices button').forEach(btn => btn.onclick = () => {
    state.assignedPractice = { skill: btn.dataset.skill, label: btn.dataset.label };
    saveState(state);
    screen = 'parent';
    render();
  });
}

render();

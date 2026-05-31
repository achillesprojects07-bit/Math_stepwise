import { level6AUnits, level6ALessons } from './curriculum/level6A.js';
import { generate6AQuestion } from './engine/questionGenerator.js';
import { evaluateLesson } from './engine/masteryEngine.js';
import { defaultState, loadProgress, saveProgress } from './engine/progressStore.js';

let state = loadProgress();
let currentQuestion = generate6AQuestion(state.student.currentLesson);
let selectedAnswer = null;

const root = document.getElementById('app');

function setState(patch) {
  state = { ...state, ...patch };
  saveProgress(state);
  render();
}

function navigate(screen) {
  state = { ...state, screen };
  saveProgress(state);
  render();
}

function resetDemo() {
  localStorage.removeItem('stepwiseMath.phase2.improved');
  state = { ...defaultState };
  currentQuestion = generate6AQuestion(state.student.currentLesson);
  selectedAnswer = null;
  render();
}

function header() {
  return `
    <div class="header">
      <div class="logo">StepWise Math</div>
      <div class="nav">
        <button class="btn secondary" data-nav="levels">Student View</button>
        <button class="btn secondary" data-nav="parent">Parent View</button>
        <button class="btn secondary" data-reset="true">Reset Demo</button>
      </div>
    </div>
  `;
}

function levelSelector() {
  const levels = [
    ['6A', 'Counting & Number Recognition', 'Numbers 1–10', 'available'],
    ['5A', 'Number Reading', 'Numbers up to 50', 'soon'],
    ['4A', 'Number Writing', 'Trace and write numbers', 'soon'],
    ['3A', 'Adding 1, 2, and 3', 'Early addition', 'soon'],
    ['2A', 'Adding up to 10', 'Addition fluency', 'soon'],
    ['A', 'Addition & Subtraction', 'Arithmetic basics', 'soon'],
    ['B', 'Addition/Subtraction to 100', '2-digit and 3-digit arithmetic', 'soon']
  ];
  const selected = levels.find(([id]) => id === state.selectedLevel) || levels[0];
  const available = selected[3] === 'available';
  return `
    <section class="stack">
      <div>
        <div class="small">Welcome, ${escapeHtml(state.student.name.split(' ')[0])}</div>
        <h1>Choose your level</h1>
        <p>Pick a level and continue learning.</p>
      </div>
      <div class="card stack">
        <div class="row">
          <div style="flex:1; min-width:260px;">
            <label class="small"><b>Level</b></label>
            <select class="select" id="levelSelect">
              ${levels.map(([id, title, , status]) => `<option value="${id}" ${id === state.selectedLevel ? 'selected' : ''}>Level ${id} — ${title}${status === 'soon' ? ' (Coming soon)' : ''}</option>`).join('')}
            </select>
          </div>
          <button class="btn" data-nav="map" ${available ? '' : 'disabled'}>${available ? 'Open Level' : 'Coming Soon'}</button>
        </div>
        <div class="stat">
          <div class="small">Selected level</div>
          <h2>Level ${selected[0]}</h2>
          <p><b>${selected[1]}</b> — ${selected[2]}</p>
          <div class="progress" style="margin-top:14px"><span style="width:18%"></span></div>
        </div>
      </div>
      <div class="grid grid-3">
        <div class="card"><div class="small">Current lesson</div><h2>${state.student.currentLesson}</h2><p>${state.student.currentLevel} learning path</p></div>
        <div class="card"><div class="small">Practice Again</div><h2>${state.reviewQueue.length} skills</h2><p>A few items are ready to practice again.</p></div>
        <div class="card"><div class="small">Daily Record</div><h2>${state.dailyRecords.length}</h2><p>Work sessions saved for parent view.</p></div>
      </div>
    </section>
  `;
}

function lessonMap() {
  return `
    <section class="stack">
      <div class="row">
        <div><button class="btn secondary" data-nav="levels">← Back to levels</button><h1 style="margin-top:12px">Level 6A</h1><p>Counting, number reading, and dot recognition up to 10.</p></div>
        <div class="card"><b>${state.masteredCount} mastered</b><div class="small">${state.reviewCount} practice again</div></div>
      </div>
      <div class="grid grid-4">
        ${level6AUnits.map((u, i) => `
          <div class="card unit">
            <div style="font-size:34px">${u.icon}</div>
            <div class="small">Unit ${i + 1} • ${u.range}</div>
            <h2>${u.title}</h2>
            <div class="progress"><span style="width:${i === 0 ? 40 : i === 1 ? 8 : 0}%"></span></div>
          </div>
        `).join('')}
      </div>
      <div class="card stack">
        <div class="row"><div><h2>Unit 1 Lesson Map</h2><p>First 20 lessons shown for preview.</p></div><button class="btn" data-nav="lesson">Start ${state.student.currentLesson}</button></div>
        <div class="lesson-grid">
          ${level6ALessons.slice(0,20).map((lesson, i) => lessonButton(lesson.id, i)).join('')}
        </div>
      </div>
    </section>
  `;
}

function lessonButton(id, index) {
  const status = index < 8 ? 'Mastered' : index < 12 ? 'Practice' : id === state.student.currentLesson ? 'Start' : 'Locked';
  const cls = id === state.student.currentLesson ? 'lesson current' : 'lesson';
  const pill = status === 'Mastered' ? 'pill good' : status === 'Practice' ? 'pill warn' : 'pill';
  return `<button class="${cls}" ${id === state.student.currentLesson ? 'data-nav="lesson"' : ''}><b>${id}</b><br><span class="${pill}">${status}</span></button>`;
}

function lessonRunner() {
  const answered = selectedAnswer !== null;
  const correct = selectedAnswer === currentQuestion.answer;
  return `
    <section class="stack" style="max-width:760px;margin:0 auto;">
      <button class="btn secondary" data-nav="map">← Back to Level 6A</button>
      <div class="card stack">
        <div class="row"><div><div class="small">${state.student.currentLesson} • Counting up to 5</div><h1>${currentQuestion.prompt}</h1></div><div><b>Question 3 of 10</b></div></div>
        <div class="practice-card">${escapeHtml(currentQuestion.visual)}</div>
        <div class="choices">
          ${currentQuestion.choices.map((choice) => `<button class="choice" data-answer="${choice}">${choice}</button>`).join('')}
        </div>
        ${answered ? `<div class="feedback ${correct ? '' : 'warn'}"><b>${correct ? 'Correct!' : 'Almost — let’s try one more like this.'}</b><br>${correct ? 'Great work.' : 'You’re still learning. Keep going.'}</div>` : ''}
        <div class="row"><div class="small">Question 3 of 10</div><div class="nav"><button class="btn secondary" ${answered ? '' : 'disabled'} data-practice-more="true">Practice More</button><button class="btn" ${answered ? '' : 'disabled'} data-next-question="true">Next</button></div></div>
      </div>
    </section>
  `;
}

function parentDashboard() {
  return `
    <section class="stack">
      <button class="btn secondary" data-nav="levels">← Back</button>
      <div class="row"><div><h1>Parent Dashboard</h1><p>Progress, review items, and learning records stay here.</p></div><div class="nav"><button class="btn secondary" data-nav="studentInfo">Student Info</button><button class="btn secondary" data-nav="dailyRecord">Daily Record</button></div></div>
      <div class="grid grid-3">
        <div class="card"><div class="small">Mastered</div><h1>${state.masteredCount}</h1></div>
        <div class="card"><div class="small">Practice Again</div><h1>${state.reviewQueue.length}</h1></div>
        <div class="card"><div class="small">Accuracy</div><h1>91%</h1></div>
      </div>
      <div class="grid grid-2">
        <div class="card stack"><h2>Review Queue</h2>${state.reviewQueue.map((r) => `<div class="stat"><b>${escapeHtml(r.skill)}</b><div class="small">${escapeHtml(r.note)}</div></div>`).join('')}</div>
        <div class="card stack"><h2>Latest Work</h2>${state.dailyRecords.slice(0,2).map((r) => `<div class="stat"><b>${r.date} • ${r.lesson}</b><div class="small">${r.time} • ${r.status}</div></div>`).join('')}</div>
      </div>
    </section>
  `;
}

function studentInfo() {
  const s = state.student;
  return `
    <section class="stack">
      <button class="btn secondary" data-nav="parent">← Back to Parent View</button>
      <div class="row"><div><h1>Student Information</h1><p>Basic enrollment details and current learning placement.</p></div><button class="btn secondary" data-edit-student="true">Edit Demo Name</button></div>
      <div class="card grid grid-2">
        ${infoBox('Student Name', s.name)}
        ${infoBox('Date of Enrollment', s.enrollmentDate)}
        ${infoBox('Starting Level', s.startingLevel)}
        ${infoBox('Current Lesson', s.currentLesson)}
        ${infoBox('Parent / Guardian', s.guardian)}
        ${infoBox('Notes', s.notes)}
      </div>
    </section>
  `;
}

function infoBox(label, value) {
  return `<div class="stat"><div class="small">${escapeHtml(label)}</div><b>${escapeHtml(value)}</b></div>`;
}

function dailyRecord() {
  return `
    <section class="stack">
      <button class="btn secondary" data-nav="parent">← Back to Parent View</button>
      <div><h1>Daily Work Record</h1><p>A parent record book of completed work, time, accuracy, and review status.</p></div>
      <div class="card table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Level</th><th>Lesson</th><th>Time</th><th>First Try</th><th>Final Accuracy</th><th>Status</th></tr></thead>
          <tbody>${state.dailyRecords.map((r) => `<tr><td>${r.date}</td><td>${r.level}</td><td>${r.lesson}</td><td>${r.time}</td><td>${r.firstTry}</td><td><b>${r.finalAccuracy}</b></td><td><span class="pill good">${r.status}</span></td></tr>`).join('')}</tbody>
        </table>
      </div>
    </section>
  `;
}

function render() {
  const screen = state.screen || 'levels';
  const screens = {
    levels: levelSelector,
    map: lessonMap,
    lesson: lessonRunner,
    parent: parentDashboard,
    studentInfo,
    dailyRecord
  };
  root.innerHTML = `<main class="app">${header()}${(screens[screen] || levelSelector)()}</main>`;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-nav]').forEach((el) => el.addEventListener('click', () => navigate(el.dataset.nav)));
  document.querySelectorAll('[data-answer]').forEach((el) => el.addEventListener('click', () => { selectedAnswer = Number(el.dataset.answer); render(); }));
  document.querySelectorAll('[data-next-question], [data-practice-more]').forEach((el) => el.addEventListener('click', () => { selectedAnswer = null; currentQuestion = generate6AQuestion(state.student.currentLesson); render(); }));
  document.querySelectorAll('[data-reset]').forEach((el) => el.addEventListener('click', resetDemo));
  const levelSelect = document.getElementById('levelSelect');
  if (levelSelect) levelSelect.addEventListener('change', (e) => setState({ selectedLevel: e.target.value }));
  document.querySelectorAll('[data-edit-student]').forEach((el) => el.addEventListener('click', () => {
    const name = prompt('Student name', state.student.name);
    if (name) setState({ student: { ...state.student, name } });
  }));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

render();

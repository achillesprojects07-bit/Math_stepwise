const levels = [
  { id: '6A', title: 'Counting & Number Recognition', subtitle: 'Numbers 1–10', status: 'available', progress: 0 },
  { id: '5A', title: 'Number Reading', subtitle: 'Numbers up to 50', status: 'soon', progress: 0 },
  { id: '4A', title: 'Number Writing', subtitle: 'Trace and write numbers', status: 'soon', progress: 0 },
  { id: '3A', title: 'Adding 1, 2, and 3', subtitle: 'Early addition', status: 'soon', progress: 0 },
  { id: '2A', title: 'Adding up to 10', subtitle: 'Early fluency', status: 'soon', progress: 0 },
  { id: 'A', title: 'Addition & Subtraction', subtitle: 'Core arithmetic', status: 'soon', progress: 0 }
];

const units = [
  { title: 'Unit 1', range: '6A001–6A030', name: 'Counting up to 5', icon: '🍎', total: 30 },
  { title: 'Unit 2', range: '6A031–6A100', name: 'Counting up to 10', icon: '⭐', total: 70 },
  { title: 'Unit 3', range: '6A101–6A150', name: 'Number Reading up to 10', icon: '🔢', total: 50 },
  { title: 'Unit 4', range: '6A151–6A200', name: 'Number of Dots up to 10', icon: '●', total: 50 }
];

const STORAGE_KEY = 'stepwiseMathPhase2Progress';
const app = document.querySelector('#app');
let state = loadProgress();
let activeScreen = 'student';
let selectedLevel = '6A';
let activeQuestion = null;
let lessonStartTime = null;
let questionNumber = 1;
let correctAfterCorrections = 0;
let unresolvedErrors = 0;
let currentLesson = '6A001';

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { mastered: [], reviewQueue: [], attempts: [] };
  } catch (error) {
    return { mastered: [], reviewQueue: [], attempts: [] };
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeLessonId(number) {
  return `6A${String(number).padStart(3, '0')}`;
}

function lessonNumber(id) {
  return Number(String(id).replace('6A', ''));
}

function getCurrentLessonNumber() {
  const next = state.mastered.length + 1;
  return Math.min(Math.max(next, 1), 200);
}

function getLessonStatus(id) {
  if (state.mastered.includes(id)) return 'mastered';
  if (state.reviewQueue.some(item => item.lessonId === id)) return 'review';
  if (id === makeLessonId(getCurrentLessonNumber())) return 'current';
  if (lessonNumber(id) < getCurrentLessonNumber()) return 'review';
  return 'locked';
}

function createQuestionForLesson(lessonId) {
  const number = lessonNumber(lessonId);
  let max = 5;
  let prompt = 'How many stars?';
  let answer;
  let visual;

  if (number <= 30) {
    max = 5;
    answer = randomInt(1, max);
    visual = '⭐'.repeat(answer);
  } else if (number <= 100) {
    max = 10;
    answer = randomInt(1, max);
    visual = '⭐'.repeat(answer);
  } else if (number <= 150) {
    max = 10;
    answer = randomInt(1, max);
    prompt = 'Choose the number shown.';
    visual = String(answer);
  } else {
    max = 10;
    answer = randomInt(1, max);
    visual = '●'.repeat(answer);
  }

  const choices = new Set([answer]);
  while (choices.size < 4) choices.add(randomInt(1, max));

  return { prompt, visual, answer, choices: Array.from(choices).sort((a, b) => a - b) };
}

function evaluateAttempt(totalQuestions, correctCount, unresolved, elapsedSeconds, hasSct, targetSeconds) {
  const fullyCorrected = totalQuestions > 0 && correctCount === totalQuestions && unresolved === 0;
  if (!fullyCorrected) return 'needs_review_accuracy';
  if (hasSct && targetSeconds !== null && elapsedSeconds > targetSeconds) return 'completed_needs_fluency';
  return 'mastered';
}

function renderShell(content) {
  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand">Stepwise Math</div>
        <div class="nav-actions">
          <button class="btn secondary" data-screen="student">Student View</button>
          <button class="btn secondary" data-screen="parent">Parent View</button>
        </div>
      </header>
      ${content}
    </div>
  `;

  document.querySelectorAll('[data-screen]').forEach(button => {
    button.addEventListener('click', () => {
      activeScreen = button.dataset.screen;
      render();
    });
  });
}

function renderStudentView() {
  const selected = levels.find(level => level.id === selectedLevel) || levels[0];
  const progress = Math.round((state.mastered.length / 200) * 100);
  renderShell(`
    <section class="grid" style="gap: 22px;">
      <div>
        <p>Welcome back</p>
        <h1>Choose your level</h1>
      </div>

      <div class="card">
        <div class="level-panel">
          <div>
            <label class="label" for="levelSelect">Level</label>
            <select class="select" id="levelSelect">
              ${levels.map(level => `<option value="${level.id}" ${level.id === selectedLevel ? 'selected' : ''}>Level ${level.id} — ${level.title}${level.status === 'soon' ? ' (Coming soon)' : ''}</option>`).join('')}
            </select>
          </div>
          <button class="btn" id="openLevel" ${selected.status !== 'available' ? 'disabled' : ''}>Open Level</button>
        </div>
        <div style="margin-top: 20px;" class="stat">
          <div class="label">Level ${selected.id}</div>
          <h2>${selected.title}</h2>
          <p>${selected.subtitle}</p>
          <div class="progress" style="margin-top: 14px;"><span style="width:${progress}%"></span></div>
        </div>
      </div>

      <div class="grid cols-3">
        <div class="stat"><div class="label">Current level</div><div class="stat-value">6A</div><p>Counting and number recognition</p></div>
        <div class="stat"><div class="label">Practice again</div><div class="stat-value">${state.reviewQueue.length}</div><p>A few items are ready to practice</p></div>
        <div class="stat"><div class="label">Next unlock</div><div class="stat-value">5A</div><p>After this level is ready</p></div>
      </div>
    </section>
  `);

  document.querySelector('#levelSelect').addEventListener('change', event => {
    selectedLevel = event.target.value;
    renderStudentView();
  });
  document.querySelector('#openLevel').addEventListener('click', renderLevelMap);
}

function renderLevelMap() {
  const progress = Math.round((state.mastered.length / 200) * 100);
  const lessonTiles = Array.from({ length: 20 }, (_, i) => {
    const id = makeLessonId(i + 1);
    const status = getLessonStatus(id);
    const label = status === 'mastered' ? 'Done' : status === 'review' ? 'Practice' : status === 'current' ? 'Start' : 'Locked';
    return `<button class="lesson-tile ${status}" data-lesson="${id}" ${status === 'locked' ? 'disabled' : ''}>
      <strong>${id}</strong><br><span class="pill ${status === 'mastered' ? 'good' : status === 'review' ? 'warn' : ''}">${label}</span>
    </button>`;
  }).join('');

  renderShell(`
    <button class="btn secondary" id="backToStudent">← Back</button>
    <div style="height:16px"></div>
    <section class="grid" style="gap: 20px;">
      <div>
        <h1>Level 6A</h1>
        <p>Counting, number reading, and dot recognition up to 10.</p>
      </div>
      <div class="grid cols-4">
        ${units.map(unit => `<div class="card unit-card"><div style="font-size: 34px;">${unit.icon}</div><p>${unit.title} • ${unit.range}</p><h2>${unit.name}</h2></div>`).join('')}
      </div>
      <div class="card">
        <div class="lesson-header">
          <div><h2>Lesson Map</h2><p>First 20 lessons shown for the Phase 2 skeleton.</p></div>
          <div style="min-width:160px"><div class="progress"><span style="width:${progress}%"></span></div><p style="text-align:right;margin-top:8px;">${progress}% complete</p></div>
        </div>
        <div class="lesson-grid" style="margin-top: 18px;">${lessonTiles}</div>
      </div>
    </section>
  `);

  document.querySelector('#backToStudent').addEventListener('click', renderStudentView);
  document.querySelectorAll('[data-lesson]').forEach(button => {
    button.addEventListener('click', () => startLesson(button.dataset.lesson));
  });
}

function startLesson(lessonId) {
  currentLesson = lessonId;
  activeQuestion = createQuestionForLesson(lessonId);
  lessonStartTime = Date.now();
  questionNumber = 1;
  correctAfterCorrections = 0;
  unresolvedErrors = 0;
  renderLesson();
}

function renderLesson(feedback = '') {
  renderShell(`
    <button class="btn secondary" id="backToMap">← Back</button>
    <div style="height:16px"></div>
    <section class="card">
      <div class="lesson-header">
        <div><p>${currentLesson}</p><h1>${activeQuestion.prompt}</h1></div>
        <div><p>Question</p><h2>${questionNumber} of 10</h2></div>
      </div>
      <div class="question-box"><div class="visual">${activeQuestion.visual}</div></div>
      <div class="choices">
        ${activeQuestion.choices.map(choice => `<button class="choice" data-choice="${choice}">${choice}</button>`).join('')}
      </div>
      <div id="feedback">${feedback}</div>
      <div class="footer-row">
        <p>Keep going at your own pace.</p>
        <button class="btn secondary" id="practiceMore">Practice More</button>
      </div>
    </section>
  `);

  document.querySelector('#backToMap').addEventListener('click', renderLevelMap);
  document.querySelector('#practiceMore').addEventListener('click', () => startLesson(currentLesson));
  document.querySelectorAll('[data-choice]').forEach(button => {
    button.addEventListener('click', () => answerQuestion(Number(button.dataset.choice)));
  });
}

function answerQuestion(choice) {
  const correct = choice === activeQuestion.answer;
  if (correct) {
    correctAfterCorrections += 1;
    const message = `<div class="feedback good">Correct! Great work.</div>`;
    if (questionNumber >= 10) return finishLesson(message);
    questionNumber += 1;
    activeQuestion = createQuestionForLesson(currentLesson);
    renderLesson(message);
    return;
  }

  unresolvedErrors += 1;
  state.reviewQueue.push({ lessonId: currentLesson, skill: 'Practice this item again' });
  saveProgress();
  renderLesson(`<div class="feedback warn">Almost — let’s try one more like this.</div>`);
}

function finishLesson(message) {
  const elapsedSeconds = Math.round((Date.now() - lessonStartTime) / 1000);
  const status = evaluateAttempt(10, correctAfterCorrections, 0, elapsedSeconds, false, null);

  if (status === 'mastered' && !state.mastered.includes(currentLesson)) {
    state.mastered.push(currentLesson);
    state.reviewQueue = state.reviewQueue.filter(item => item.lessonId !== currentLesson);
  }

  state.attempts.push({ lessonId: currentLesson, status, elapsedSeconds, date: new Date().toISOString() });
  saveProgress();

  renderShell(`
    <section class="card">
      <h1>${status === 'mastered' ? 'Nice work!' : 'Good effort!'}</h1>
      <p>${status === 'mastered' ? 'You are ready to continue.' : 'A few items will appear again for practice.'}</p>
      ${message}
      <div class="grid cols-3" style="margin-top: 22px;">
        <div class="stat"><div class="label">Time</div><div class="stat-value">${elapsedSeconds}s</div></div>
        <div class="stat"><div class="label">Finished</div><div class="stat-value">10/10</div></div>
        <div class="stat"><div class="label">Practice again</div><div class="stat-value">${state.reviewQueue.length}</div></div>
      </div>
      <div class="footer-row">
        <button class="btn secondary" id="finishMap">Back to map</button>
        <button class="btn" id="nextLesson">Next Lesson</button>
      </div>
    </section>
  `);
  document.querySelector('#finishMap').addEventListener('click', renderLevelMap);
  document.querySelector('#nextLesson').addEventListener('click', () => startLesson(makeLessonId(getCurrentLessonNumber())));
}

function renderParentView() {
  const progress = Math.round((state.mastered.length / 200) * 100);
  renderShell(`
    <section class="grid" style="gap: 20px;">
      <div><h1>Parent View</h1><p>Clean progress view for Level 6A.</p></div>
      <div class="grid cols-3">
        <div class="stat"><div class="label">Mastered lessons</div><div class="stat-value">${state.mastered.length}</div><p>Out of 200</p></div>
        <div class="stat"><div class="label">Practice again</div><div class="stat-value">${state.reviewQueue.length}</div><p>Items queued for review</p></div>
        <div class="stat"><div class="label">Level progress</div><div class="stat-value">${progress}%</div><p>Level 6A</p></div>
      </div>
      <div class="card">
        <h2>Review Queue</h2>
        ${state.reviewQueue.length ? state.reviewQueue.slice(0, 6).map(item => `<div class="review-item">${item.lessonId} • Practice again</div>`).join('') : '<p>No review items right now.</p>'}
      </div>
      <div class="card">
        <h2>Recent Attempts</h2>
        ${state.attempts.length ? state.attempts.slice(-5).reverse().map(item => `<div class="review-item">${item.lessonId} • ${item.status.replaceAll('_', ' ')} • ${item.elapsedSeconds}s</div>`).join('') : '<p>No attempts yet.</p>'}
      </div>
    </section>
  `);
}

function render() {
  if (activeScreen === 'parent') renderParentView();
  else renderStudentView();
}

render();

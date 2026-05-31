import { level6AUnits, level6ALessons } from './curriculum/level6A.js';
import { generate6AQuestion, generatePracticeQuestion } from './engine/questionGenerator.js';
import { evaluateLesson, buildPracticeAgainQueue, makeParentRecommendation } from './engine/masteryEngine.js';
import { loadProgress, saveProgress } from './engine/progressStore.js';

let state = loadProgress();
let selectedAnswer = null;
let questionStartedAt = Date.now();
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

function header() {
  return `
    <div class="header">
      <div class="logo">StepWise Math</div>
      <div class="nav">
        <button class="btn secondary" data-nav="levels">Student View</button>
        <button class="btn secondary" data-nav="parent">Parent View</button>
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
  const assigned = state.assignedPractice?.active;
  return `
    <section class="stack">
      <div>
        <div class="small">Welcome, ${escapeHtml(firstName(state.student.name))}</div>
        <h1>Choose your level</h1>
        <p>Pick a level and continue learning.</p>
      </div>
      ${assigned ? `<div class="card notice"><b>Today starts with Quick Practice.</b><p>${escapeHtml(state.assignedPractice.label)} is ready before the lesson.</p></div>` : ''}
      <div class="card stack">
        <div class="row">
          <div style="flex:1; min-width:260px;">
            <label class="small"><b>Level</b></label>
            <select class="select" id="levelSelect">
              ${levels.map(([id, title, , status]) => `<option value="${id}" ${id === state.selectedLevel ? 'selected' : ''}>Level ${id} — ${title}${status === 'soon' ? ' (Coming soon)' : ''}</option>`).join('')}
            </select>
          </div>
          <button class="btn" data-start-session="true" ${available ? '' : 'disabled'}>${assigned ? 'Start Today’s Session' : 'Open Level'}</button>
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
        <div class="card"><b>${state.masteredCount} mastered</b><div class="small">${state.reviewQueue.length} practice again</div></div>
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
        <div class="row"><div><h2>Unit 1 Lesson Map</h2><p>First 20 lessons shown for preview.</p></div><button class="btn" data-start-session="true">Start ${state.student.currentLesson}</button></div>
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
  return `<button class="${cls}" ${id === state.student.currentLesson ? 'data-start-session="true"' : ''}><b>${id}</b><br><span class="${pill}">${status}</span></button>`;
}

function createSession() {
  const hasAssignedPractice = Boolean(state.assignedPractice?.active);
  const firstMode = hasAssignedPractice ? 'assignedPractice' : 'lesson';
  const firstQuestion = hasAssignedPractice ? generatePracticeQuestion(state.assignedPractice.skill) : generate6AQuestion(state.student.currentLesson);
  state = {
    ...state,
    screen: 'work',
    session: {
      mode: firstMode,
      stepIndex: 0,
      requiredCount: hasAssignedPractice ? 5 : 10,
      currentQuestion: firstQuestion,
      answers: [],
      practiceQueue: [],
      assignedPracticeDone: false,
      lessonDone: false,
      practiceAgainDone: false,
      startedAt: Date.now()
    }
  };
  selectedAnswer = null;
  questionStartedAt = Date.now();
  saveProgress(state);
  render();
}

function workRunner() {
  if (!state.session) createSession();
  const session = state.session;
  const answered = selectedAnswer !== null;
  const q = session.currentQuestion;
  const correct = selectedAnswer === q.answer;
  const heading = session.mode === 'assignedPractice' ? 'Quick Practice' : session.mode === 'practiceAgain' ? 'Practice Again' : state.student.currentLesson;
  const subheading = session.mode === 'assignedPractice' ? 'A short warm-up before today’s lesson.' : session.mode === 'practiceAgain' ? 'A few items to help you remember.' : 'Today’s lesson';
  return `
    <section class="stack" style="max-width:760px;margin:0 auto;">
      <button class="btn secondary" data-nav="map">← Back to Level 6A</button>
      <div class="card stack">
        <div class="row"><div><div class="small">${escapeHtml(subheading)}</div><h1>${escapeHtml(heading)}</h1></div><div><b>Question ${session.stepIndex + 1} of ${session.requiredCount}</b></div></div>
        <h2>${escapeHtml(q.prompt)}</h2>
        <div class="practice-card">${escapeHtml(q.visual)}</div>
        <div class="choices">
          ${q.choices.map((choice) => `<button class="choice" data-answer="${choice}">${choice}</button>`).join('')}
        </div>
        ${answered ? `<div class="feedback ${correct ? '' : 'warn'}"><b>${correct ? 'Correct!' : 'Almost — let’s try one more like this.'}</b><br>${correct ? 'Great work.' : 'You’re still learning. Keep going.'}</div>` : ''}
        <div class="row"><div class="small">${session.mode === 'lesson' ? 'Lesson block' : 'Practice block'}</div><button class="btn" ${answered ? '' : 'disabled'} data-next-work-question="true">${session.stepIndex + 1 >= session.requiredCount ? 'Finish Block' : 'Next'}</button></div>
      </div>
    </section>
  `;
}

function finishQuestion() {
  const session = state.session;
  if (!session || selectedAnswer === null) return;
  const elapsedSeconds = Math.max(2, Math.round((Date.now() - questionStartedAt) / 1000) + Math.floor(Math.random() * 5));
  const q = session.currentQuestion;
  const correct = selectedAnswer === q.answer;
  const answerRecord = {
    id: `${session.mode}-${session.answers.length + 1}`,
    mode: session.mode,
    skill: q.skill,
    answer: q.answer,
    selectedAnswer,
    firstTryCorrect: correct,
    finalCorrect: true,
    elapsedSeconds,
    slowThresholdSeconds: q.slowThresholdSeconds
  };
  const answers = [...session.answers, answerRecord];
  const nextIndex = session.stepIndex + 1;
  const blockFinished = nextIndex >= session.requiredCount;

  if (!blockFinished) {
    state.session = { ...session, answers, stepIndex: nextIndex, currentQuestion: nextQuestionForMode(session.mode), requiredCount: session.requiredCount };
    selectedAnswer = null;
    questionStartedAt = Date.now();
    saveProgress(state);
    render();
    return;
  }

  if (session.mode === 'assignedPractice') {
    state.session = {
      ...session,
      mode: 'lesson',
      stepIndex: 0,
      requiredCount: 10,
      currentQuestion: generate6AQuestion(state.student.currentLesson),
      answers,
      assignedPracticeDone: true
    };
    state.assignedPractice = null;
    selectedAnswer = null;
    questionStartedAt = Date.now();
    saveProgress(state);
    render();
    return;
  }

  if (session.mode === 'lesson') {
    const lessonAnswers = answers.filter((a) => a.mode === 'lesson');
    const practiceQueue = buildPracticeAgainQueue(lessonAnswers);
    state.session = {
      ...session,
      mode: practiceQueue.length ? 'practiceAgainIntro' : 'sessionChoice',
      stepIndex: 0,
      requiredCount: Math.max(3, practiceQueue.length || 0),
      answers,
      practiceQueue,
      lessonDone: true,
      currentQuestion: practiceQueue.length ? generatePracticeQuestion(practiceQueue[0].skill) : session.currentQuestion
    };
    selectedAnswer = null;
    saveProgress(state);
    render();
    return;
  }

  if (session.mode === 'practiceAgain') {
    state.session = { ...session, mode: 'sessionChoice', answers, practiceAgainDone: true };
    selectedAnswer = null;
    saveProgress(state);
    render();
  }
}

function nextQuestionForMode(mode) {
  if (mode === 'assignedPractice') return generatePracticeQuestion(state.assignedPractice?.skill || 'counting_1_to_5');
  if (mode === 'practiceAgain') {
    const queue = state.session?.practiceQueue || [];
    const nextSkill = queue[Math.min(state.session.stepIndex + 1, queue.length - 1)]?.skill || queue[0]?.skill || 'counting_1_to_5';
    return generatePracticeQuestion(nextSkill);
  }
  return generate6AQuestion(state.student.currentLesson);
}

function practiceAgainIntro() {
  const queue = state.session?.practiceQueue || [];
  return `
    <section class="stack" style="max-width:760px;margin:0 auto;">
      <div class="card stack center-card">
        <div class="big-emoji">🌟</div>
        <h1>Great work!</h1>
        <p>Let’s do a quick practice round before we finish.</p>
        <div class="grid grid-2">
          ${queue.map((q) => `<div class="stat"><div class="small">${escapeHtml(q.reason)}</div><b>${escapeHtml(prettySkill(q.skill))}</b></div>`).join('')}
        </div>
        <button class="btn" data-practice-again="true">Start Practice Again</button>
      </div>
    </section>
  `;
}

function sessionChoice() {
  return `
    <section class="stack" style="max-width:760px;margin:0 auto;">
      <div class="card stack center-card">
        <div class="big-emoji">🏆</div>
        <h1>You did great today!</h1>
        <p>Your work has been saved.</p>
        <div class="grid grid-2">
          <button class="btn secondary large" data-end-session="true">End Today’s Session</button>
          <button class="btn large" data-continue-next="true">Continue to Next Lesson</button>
        </div>
      </div>
    </section>
  `;
}

function parentDashboard() {
  const assigned = state.assignedPractice?.active;
  return `
    <section class="stack">
      <button class="btn secondary" data-nav="levels">← Back</button>
      <div class="row"><div><h1>Parent Dashboard</h1><p>Progress, review items, and learning records stay here.</p></div><div class="nav"><button class="btn secondary" data-nav="studentInfo">Student Info</button><button class="btn secondary" data-nav="dailyRecord">Daily Record</button><button class="btn secondary" data-nav="assignPractice">Assign Practice</button></div></div>
      ${assigned ? `<div class="card notice"><b>Assigned for next session:</b><p>${escapeHtml(state.assignedPractice.label)} — ${escapeHtml(state.assignedPractice.reason)}</p></div>` : ''}
      <div class="grid grid-3">
        <div class="card"><div class="small">Mastered</div><h1>${state.masteredCount}</h1></div>
        <div class="card"><div class="small">Practice Again</div><h1>${state.reviewQueue.length}</h1></div>
        <div class="card"><div class="small">Accuracy</div><h1>91%</h1></div>
      </div>
      <div class="grid grid-2">
        <div class="card stack"><h2>Review Queue</h2>${state.reviewQueue.map((r) => `<div class="stat"><b>${escapeHtml(r.skill)}</b><div class="small">${escapeHtml(r.note)} • ${escapeHtml(r.source || 'Review')}</div></div>`).join('')}</div>
        <div class="card stack"><h2>Latest Recommendations</h2>${state.dailyRecords.slice(0,3).map((r) => `<div class="stat"><b>${escapeHtml(r.lesson)}</b><div class="small">${escapeHtml(r.recommendation || 'Continue.')}</div></div>`).join('')}</div>
      </div>
    </section>
  `;
}

function studentInfo() {
  const s = state.student;
  return `
    <section class="stack">
      <button class="btn secondary" data-nav="parent">← Back to Parent View</button>
      <div class="row"><div><h1>Student Information</h1><p>Basic enrollment details and current learning placement.</p></div><button class="btn secondary" data-edit-student="true">Edit Name</button></div>
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

function assignPractice() {
  const options = [
    ['dot_recognition_1_to_10', 'Dot Recognition 1–10', 'Recommended from recent slow dot items.'],
    ['counting_1_to_5', 'Counting 1–5', 'Good for early confidence and accuracy.'],
    ['counting_1_to_10', 'Counting 1–10', 'Good for extended counting fluency.'],
    ['number_reading_1_to_10', 'Number Reading 1–10', 'Good for numeral recognition.']
  ];
  return `
    <section class="stack">
      <button class="btn secondary" data-nav="parent">← Back to Parent View</button>
      <div><h1>Assign Practice for Next Session</h1><p>This appears next time the child starts as Quick Practice before the lesson.</p></div>
      <div class="grid grid-2">
        ${options.map(([skill, label, reason]) => `
          <div class="card stack">
            <div><h2>${label}</h2><p>${reason}</p></div>
            <button class="btn" data-assign-practice="${skill}" data-assign-label="${label}" data-assign-reason="${reason}">Use This Practice</button>
          </div>
        `).join('')}
      </div>
      <div class="card stack"><h2>No Extra Practice</h2><p>Leave the next session as the regular lesson flow only.</p><button class="btn secondary" data-clear-assigned="true">Clear Assigned Practice</button></div>
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
      <div><h1>Daily Work Record</h1><p>A parent record book of completed work, time, accuracy, and recommendations.</p></div>
      <div class="card table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Level</th><th>Lesson</th><th>Time</th><th>First Try</th><th>Final Accuracy</th><th>Status</th><th>Recommendation</th></tr></thead>
          <tbody>${state.dailyRecords.map((r) => `<tr><td>${escapeHtml(r.date)}</td><td>${escapeHtml(r.level)}</td><td>${escapeHtml(r.lesson)}</td><td>${escapeHtml(r.time)}</td><td>${escapeHtml(r.firstTry)}</td><td><b>${escapeHtml(r.finalAccuracy)}</b></td><td><span class="pill good">${escapeHtml(r.status)}</span></td><td>${escapeHtml(r.recommendation || 'Continue.')}</td></tr>`).join('')}</tbody>
        </table>
      </div>
    </section>
  `;
}

function endSession({ continueNext = false } = {}) {
  const session = state.session;
  const answers = session?.answers || [];
  const lessonAnswers = answers.filter((a) => a.mode === 'lesson');
  const correctFirstTry = lessonAnswers.filter((a) => a.firstTryCorrect).length;
  const totalQuestions = lessonAnswers.length || 10;
  const totalTimeSeconds = Math.max(240, Math.round((Date.now() - (session?.startedAt || Date.now())) / 1000));
  const evaluation = evaluateLesson({ correctFirstTry, totalQuestions, finalCorrect: totalQuestions, totalTimeSeconds, targetTimeSeconds: null, sctUsed: false });
  const recommendation = makeParentRecommendation(lessonAnswers);
  const record = {
    date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    level: state.student.currentLevel,
    lesson: state.student.currentLesson,
    time: formatTime(totalTimeSeconds),
    firstTry: `${correctFirstTry}/${totalQuestions}`,
    finalAccuracy: '100%',
    status: evaluation.parentLabel,
    recommendation
  };
  const newLesson = continueNext ? nextLessonId(state.student.currentLesson) : state.student.currentLesson;
  const reviewItems = buildPracticeAgainQueue(lessonAnswers).map((item) => ({
    skill: prettySkill(item.skill),
    note: item.reason === 'Wrong first try' ? 'Practice again tomorrow' : 'Add fluency practice',
    source: item.reason
  }));
  state = {
    ...state,
    screen: continueNext ? 'work' : 'levels',
    student: { ...state.student, currentLesson: newLesson },
    session: null,
    masteredCount: state.masteredCount + (evaluation.status === 'mastered' ? 1 : 0),
    dailyRecords: [record, ...state.dailyRecords],
    reviewQueue: [...reviewItems, ...state.reviewQueue].slice(0, 8)
  };
  saveProgress(state);
  selectedAnswer = null;
  if (continueNext) createSession();
  else render();
}

function render() {
  const screen = state.screen || 'levels';
  let content;
  if (screen === 'work' && state.session?.mode === 'practiceAgainIntro') content = practiceAgainIntro();
  else if (screen === 'work' && state.session?.mode === 'sessionChoice') content = sessionChoice();
  else {
    const screens = { levels: levelSelector, map: lessonMap, work: workRunner, parent: parentDashboard, studentInfo, dailyRecord, assignPractice };
    content = (screens[screen] || levelSelector)();
  }
  root.innerHTML = `<main class="app">${header()}${content}</main>`;
  bindEvents();
}

function bindEvents() {
  document.querySelectorAll('[data-nav]').forEach((el) => el.addEventListener('click', () => navigate(el.dataset.nav)));
  document.querySelectorAll('[data-answer]').forEach((el) => el.addEventListener('click', () => { selectedAnswer = Number(el.dataset.answer); render(); }));
  document.querySelectorAll('[data-next-work-question]').forEach((el) => el.addEventListener('click', finishQuestion));
  document.querySelectorAll('[data-start-session]').forEach((el) => el.addEventListener('click', createSession));
  document.querySelectorAll('[data-practice-again]').forEach((el) => el.addEventListener('click', () => {
    const queue = state.session?.practiceQueue || [];
    state.session = { ...state.session, mode: 'practiceAgain', stepIndex: 0, requiredCount: Math.max(3, queue.length), currentQuestion: generatePracticeQuestion(queue[0]?.skill || 'counting_1_to_5') };
    saveProgress(state);
    questionStartedAt = Date.now();
    render();
  }));
  document.querySelectorAll('[data-end-session]').forEach((el) => el.addEventListener('click', () => endSession({ continueNext: false })));
  document.querySelectorAll('[data-continue-next]').forEach((el) => el.addEventListener('click', () => endSession({ continueNext: true })));
  document.querySelectorAll('[data-assign-practice]').forEach((el) => el.addEventListener('click', () => {
    setState({ assignedPractice: { active: true, skill: el.dataset.assignPractice, label: el.dataset.assignLabel, reason: el.dataset.assignReason, assignedFor: 'Next session' }, screen: 'parent' });
  }));
  document.querySelectorAll('[data-clear-assigned]').forEach((el) => el.addEventListener('click', () => setState({ assignedPractice: null, screen: 'parent' })));
  const levelSelect = document.getElementById('levelSelect');
  if (levelSelect) levelSelect.addEventListener('change', (e) => setState({ selectedLevel: e.target.value }));
  document.querySelectorAll('[data-edit-student]').forEach((el) => el.addEventListener('click', () => {
    const name = prompt('Student name', state.student.name);
    if (name) setState({ student: { ...state.student, name } });
  }));
}

function firstName(name) { return String(name || '').split(' ')[0] || 'Student'; }
function prettySkill(skill) { return String(skill).replaceAll('_', ' ').replace('1 to', '1–').replace(/\b\w/g, (c) => c.toUpperCase()); }
function formatTime(seconds) { const m = Math.floor(seconds / 60); const s = seconds % 60; return `${m}m ${String(s).padStart(2, '0')}s`; }
function nextLessonId(id) { const n = Number(String(id).replace('6A', '')) || 13; return `6A${String(Math.min(n + 1, 200)).padStart(3, '0')}`; }
function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

render();

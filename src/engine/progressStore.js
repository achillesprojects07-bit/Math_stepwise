const STORAGE_KEY = 'stepwiseMath.phase2.rebuilt';

export const defaultStudent = {
  name: 'Mia Santos',
  enrollmentDate: '2026-05-31',
  startingLevel: '6A',
  currentLevel: '6A',
  currentLesson: '6A013',
  guardian: 'Aileen Rosario',
  notes: 'Prefers visual counting'
};

export const defaultState = {
  screen: 'levels',
  student: defaultStudent,
  selectedLevel: '6A',
  masteredCount: 12,
  reviewCount: 4,
  assignedPractice: {
    active: true,
    skill: 'dot_recognition_1_to_10',
    label: 'Dot Recognition 1–10',
    reason: 'Assigned from the parent review for the next session.',
    assignedFor: 'Next session'
  },
  session: null,
  dailyRecords: [
    {
      date: 'May 31',
      level: '6A',
      lesson: '6A013',
      time: '7m 42s',
      firstTry: '9/10',
      finalAccuracy: '100%',
      status: 'Mastered',
      recommendation: 'Continue to the next lesson.'
    },
    {
      date: 'May 31',
      level: '6A',
      lesson: '6A014',
      time: '9m 10s',
      firstTry: '8/10',
      finalAccuracy: '100%',
      status: 'Practice Again',
      recommendation: 'Add short practice for counting 4 and 5 objects.'
    },
    {
      date: 'June 1',
      level: '6A',
      lesson: 'Review',
      time: '4m 30s',
      firstTry: '5/5',
      finalAccuracy: '100%',
      status: 'Cleared',
      recommendation: 'Use mixed review after the next block.'
    }
  ],
  reviewQueue: [
    { skill: 'Counting 4 objects', note: 'Practice again tomorrow', source: 'Wrong first try' },
    { skill: 'Matching number 5', note: 'Practice again', source: 'Slow correct item' }
  ]
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? mergeDefaults(JSON.parse(raw)) : structuredCloneSafe(defaultState);
  } catch {
    return structuredCloneSafe(defaultState);
  }
}

export function saveProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

function mergeDefaults(saved) {
  return {
    ...structuredCloneSafe(defaultState),
    ...saved,
    student: { ...defaultState.student, ...(saved.student || {}) },
    assignedPractice: saved.assignedPractice === null ? null : { ...defaultState.assignedPractice, ...(saved.assignedPractice || {}) },
    dailyRecords: Array.isArray(saved.dailyRecords) ? saved.dailyRecords : defaultState.dailyRecords,
    reviewQueue: Array.isArray(saved.reviewQueue) ? saved.reviewQueue : defaultState.reviewQueue
  };
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}

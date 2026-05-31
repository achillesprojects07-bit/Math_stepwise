const STORAGE_KEY = 'stepwiseMath.phase2.improved';

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
  student: defaultStudent,
  selectedLevel: '6A',
  masteredCount: 12,
  reviewCount: 4,
  dailyRecords: [
    { date: 'May 31', level: '6A', lesson: '6A013', time: '7m 42s', firstTry: '9/10', finalAccuracy: '100%', status: 'Mastered' },
    { date: 'May 31', level: '6A', lesson: '6A014', time: '9m 10s', firstTry: '8/10', finalAccuracy: '100%', status: 'Practice Again' },
    { date: 'June 1', level: '6A', lesson: 'Review', time: '4m 30s', firstTry: '5/5', finalAccuracy: '100%', status: 'Cleared' }
  ],
  reviewQueue: [
    { skill: 'Counting 4 objects', note: 'Practice again tomorrow' },
    { skill: 'Matching number 5', note: 'Practice again' }
  ]
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

export function saveProgress(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

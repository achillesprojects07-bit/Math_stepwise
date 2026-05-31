const KEY = 'math_stepwise_progress_v2_2';

export const defaultState = {
  student: {
    name: 'Mia Santos',
    enrollmentDate: '2026-05-31',
    startingLevel: '6A',
    currentLevel: '6A',
    currentLessonNumber: 13,
    parentName: 'Aileen Rosario',
    notes: 'Prefers visual counting.'
  },
  mastered: ['6A-1', '6A-2', '6A-3'],
  reviewQueue: [],
  dailyRecords: [],
  assignedPractice: null
};

export function loadState() {
  try {
    return { ...defaultState, ...(JSON.parse(localStorage.getItem(KEY)) || {}) };
  } catch {
    return defaultState;
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetStudentProgress() {
  localStorage.removeItem(KEY);
  return defaultState;
}

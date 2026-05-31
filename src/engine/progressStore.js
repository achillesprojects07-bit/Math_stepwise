const KEY = 'math_stepwise_progress_v2_latest_corrected';

export const defaultState = {
  student: {
    name: 'Mia Santos',
    enrollmentDate: '2026-05-31',
    startingLevel: '6A',
    currentLevel: '6A',
    currentLessonNumber: 1,
    parentName: 'Aileen Rosario',
    notes: 'Prefers visual counting.'
  },
  mastered: [],
  reviewQueue: [],
  dailyRecords: [],
  appRecommendedWarmup: null,
  manualWarmup: null,
  lastCompletedLessonNumber: null
};

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return saved ? { ...defaultState, ...saved, student: { ...defaultState.student, ...saved.student } } : structuredClone(defaultState);
  } catch {
    return structuredClone(defaultState);
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetStudentProgress() {
  Object.keys(localStorage)
    .filter((key) => key.startsWith('math_stepwise_progress'))
    .forEach((key) => localStorage.removeItem(key));
  return structuredClone(defaultState);
}

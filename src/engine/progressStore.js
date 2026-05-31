export const KEY = 'math_stepwise_progress_v2_reset_fixed';

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
    return saved ? { ...cloneDefaultState(), ...saved, student: { ...defaultState.student, ...saved.student } } : cloneDefaultState();
  } catch {
    return cloneDefaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

export function resetStudentProgress() {
  const freshState = cloneDefaultState();

  // Remove every previous Math Stepwise progress key, including older Phase 2 builds.
  Object.keys(localStorage)
    .filter((key) => key.startsWith('math_stepwise_progress'))
    .forEach((key) => localStorage.removeItem(key));

  Object.keys(sessionStorage || {})
    .filter((key) => key.startsWith('math_stepwise_progress'))
    .forEach((key) => sessionStorage.removeItem(key));

  // Save the default state immediately so the UI cannot rehydrate an old current lesson.
  localStorage.setItem(KEY, JSON.stringify(freshState));
  return freshState;
}

const STORAGE_KEY = 'stepwiseMathProgressV1';

function getDefaultProgress() {
  return {
    currentLevel: '6A',
    currentLesson: '6A001',
    mastered: [],
    reviewQueue: [],
    attempts: []
  };
}

function loadProgress(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultProgress();
  } catch (error) {
    return getDefaultProgress();
  }
}

function saveProgress(storage, progress) {
  storage.setItem(STORAGE_KEY, JSON.stringify(progress));
  return progress;
}

module.exports = { STORAGE_KEY, getDefaultProgress, loadProgress, saveProgress };

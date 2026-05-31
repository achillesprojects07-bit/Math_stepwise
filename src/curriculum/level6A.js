export const level6AUnits = [
  { id: '6A-U1', title: 'Counting up to 5', range: '6A001–6A030', start: 1, end: 30, icon: '🍎', mode: 'count_objects' },
  { id: '6A-U2', title: 'Counting up to 10', range: '6A031–6A100', start: 31, end: 100, icon: '⭐', mode: 'count_objects' },
  { id: '6A-U3', title: 'Number Reading up to 10', range: '6A101–6A150', start: 101, end: 150, icon: '🔢', mode: 'number_reading' },
  { id: '6A-U4', title: 'Number of Dots up to 10', range: '6A151–6A200', start: 151, end: 200, icon: '⚫', mode: 'dot_recognition' }
];

export const level6ALessons = Array.from({ length: 200 }, (_, index) => {
  const lessonNumber = index + 1;
  const unit = level6AUnits.find((u) => lessonNumber >= u.start && lessonNumber <= u.end);
  return {
    id: `6A${String(lessonNumber).padStart(3, '0')}`,
    level: '6A',
    unitId: unit.id,
    unitTitle: unit.title,
    lessonNumber,
    mode: unit.mode,
    sctUsed: false,
    questionCount: lessonNumber <= 30 ? 10 : 12,
    finalCorrectedAccuracyRequired: 1.0,
    timeHardGate: false
  };
});

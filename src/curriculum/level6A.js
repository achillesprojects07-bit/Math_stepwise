export function toVisibleLessonId(internalId) {
  const match = internalId.match(/^([A-Z0-9]+?)(\d+)$/);
  if (!match) return internalId;
  return `${match[1]}-${Number(match[2])}`;
}

export const level6AUnits = [
  { unit: 1, title: 'Counting up to 5', range: [1, 30], skill: 'count_1_to_5' },
  { unit: 2, title: 'Counting up to 10', range: [31, 100], skill: 'count_1_to_10' },
  { unit: 3, title: 'Number Reading up to 10', range: [101, 150], skill: 'read_numbers_1_to_10' },
  { unit: 4, title: 'Dot Recognition up to 10', range: [151, 200], skill: 'recognize_dots_1_to_10' }
];

export const level6ALessons = Array.from({ length: 200 }, (_, index) => {
  const n = index + 1;
  const internalId = `6A${String(n).padStart(3, '0')}`;
  const unit = level6AUnits.find((u) => n >= u.range[0] && n <= u.range[1]);
  return {
    internalId,
    displayId: toVisibleLessonId(internalId),
    lessonNumber: n,
    level: '6A',
    unit: unit.unit,
    title: unit.title,
    skill: unit.skill,
    questionCount: 10,
    hardSct: false
  };
});

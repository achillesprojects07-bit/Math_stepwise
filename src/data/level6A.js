function makeLesson(idNumber, unit, skill, mode) {
  return {
    id: `6A${String(idNumber).padStart(3, '0')}`,
    level: '6A',
    unit,
    skill,
    mode,
    questionCount: 10,
    hasSct: false,
    targetSeconds: null
  };
}

function buildLevel6ALessons() {
  const lessons = [];
  for (let i = 1; i <= 200; i += 1) {
    if (i <= 30) lessons.push(makeLesson(i, 'Counting up to 5', 'counting_up_to_5', 'multiple_choice'));
    else if (i <= 100) lessons.push(makeLesson(i, 'Counting up to 10', 'counting_up_to_10', 'multiple_choice'));
    else if (i <= 150) lessons.push(makeLesson(i, 'Number Reading up to 10', 'number_reading_up_to_10', 'multiple_choice'));
    else lessons.push(makeLesson(i, 'Number of Dots up to 10', 'dots_up_to_10', 'multiple_choice'));
  }
  return lessons;
}

module.exports = { buildLevel6ALessons };

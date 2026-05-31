export function generate6AQuestion(lessonId = '6A013') {
  const lessonNumber = Number(String(lessonId).replace('6A', '')) || 13;
  if (lessonNumber <= 30) return makeCountingQuestion(5, 'counting_1_to_5');
  if (lessonNumber <= 100) return makeCountingQuestion(10, 'counting_1_to_10');
  if (lessonNumber <= 150) return makeNumberReadingQuestion(10, 'number_reading_1_to_10');
  return makeDotQuestion(10, 'dot_recognition_1_to_10');
}

export function generatePracticeQuestion(skill = 'counting_1_to_5') {
  if (skill.includes('dot')) return makeDotQuestion(skill.includes('10') ? 10 : 5, skill);
  if (skill.includes('number')) return makeNumberReadingQuestion(10, skill);
  if (skill.includes('10')) return makeCountingQuestion(10, skill);
  return makeCountingQuestion(5, skill);
}

export function similarSkillFromQuestion(question) {
  return question?.skill || 'counting_1_to_5';
}

function makeCountingQuestion(max, skill) {
  const answer = randomInt(1, max);
  const object = pick(['⭐', '🍎', '🟣', '🐣', '🌼']);
  return {
    type: 'multiple_choice',
    skill,
    prompt: `How many ${object === '⭐' ? 'stars' : 'objects'}?`,
    visual: object.repeat(answer),
    answer,
    choices: makeChoices(answer, max),
    slowThresholdSeconds: max <= 5 ? 8 : 12
  };
}

function makeNumberReadingQuestion(max, skill) {
  const answer = randomInt(1, max);
  return {
    type: 'multiple_choice',
    skill,
    prompt: `Find ${answer}`,
    visual: String(answer),
    answer,
    choices: makeChoices(answer, max),
    slowThresholdSeconds: 6
  };
}

function makeDotQuestion(max, skill) {
  const answer = randomInt(1, max);
  return {
    type: 'multiple_choice',
    skill,
    prompt: 'How many dots?',
    visual: '● '.repeat(answer).trim(),
    answer,
    choices: makeChoices(answer, max),
    slowThresholdSeconds: max <= 5 ? 6 : 9
  };
}

function makeChoices(answer, max) {
  const set = new Set([answer]);
  while (set.size < 4) set.add(randomInt(1, max));
  return Array.from(set).sort((a, b) => a - b);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

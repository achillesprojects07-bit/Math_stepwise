export function generate6AQuestion(lessonId = '6A013') {
  const lessonNumber = Number(lessonId.replace('6A', '')) || 13;
  if (lessonNumber <= 30) return makeCountingQuestion(5);
  if (lessonNumber <= 100) return makeCountingQuestion(10);
  if (lessonNumber <= 150) return makeNumberReadingQuestion(10);
  return makeDotQuestion(10);
}

function makeCountingQuestion(max) {
  const answer = Math.max(1, Math.ceil(Math.random() * max));
  return {
    type: 'multiple_choice',
    prompt: 'How many stars?',
    visual: '⭐'.repeat(answer),
    answer,
    choices: makeChoices(answer, max)
  };
}

function makeNumberReadingQuestion(max) {
  const answer = Math.max(1, Math.ceil(Math.random() * max));
  return {
    type: 'multiple_choice',
    prompt: `Find ${answer}`,
    visual: String(answer),
    answer,
    choices: makeChoices(answer, max)
  };
}

function makeDotQuestion(max) {
  const answer = Math.max(1, Math.ceil(Math.random() * max));
  return {
    type: 'multiple_choice',
    prompt: 'How many dots?',
    visual: '● '.repeat(answer).trim(),
    answer,
    choices: makeChoices(answer, max)
  };
}

function makeChoices(answer, max) {
  const set = new Set([answer]);
  while (set.size < 4) {
    const candidate = Math.max(1, Math.ceil(Math.random() * max));
    set.add(candidate);
  }
  return Array.from(set).sort((a, b) => a - b);
}

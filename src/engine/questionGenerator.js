function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateCountingQuestion(maxNumber) {
  const answer = randomInt(1, maxNumber);
  const choices = new Set([answer]);
  while (choices.size < 4) choices.add(randomInt(1, maxNumber));
  return {
    type: 'multiple_choice_counting',
    prompt: 'How many stars?',
    visual: '⭐'.repeat(answer),
    answer,
    choices: Array.from(choices).sort((a, b) => a - b)
  };
}

function generateNumberReadingQuestion(maxNumber) {
  const answer = randomInt(1, maxNumber);
  const choices = new Set([answer]);
  while (choices.size < 4) choices.add(randomInt(1, maxNumber));
  return {
    type: 'number_reading',
    prompt: 'Choose the number shown.',
    visual: String(answer),
    answer,
    choices: Array.from(choices).sort((a, b) => a - b)
  };
}

function generateQuestion(skill) {
  if (skill === 'counting_up_to_5') return generateCountingQuestion(5);
  if (skill === 'counting_up_to_10') return generateCountingQuestion(10);
  if (skill === 'number_reading_up_to_10') return generateNumberReadingQuestion(10);
  if (skill === 'dots_up_to_10') return generateCountingQuestion(10);
  return generateCountingQuestion(5);
}

module.exports = { generateQuestion, generateCountingQuestion, generateNumberReadingQuestion };

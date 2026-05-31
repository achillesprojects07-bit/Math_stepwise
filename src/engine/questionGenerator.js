const icons = ['⭐', '🍎', '●', '🌸', '🔵', '🟣'];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function choicesFor(answer, max = 10) {
  const set = new Set([answer]);
  while (set.size < 4) {
    const delta = Math.floor(Math.random() * 5) - 2;
    const candidate = Math.min(max, Math.max(1, answer + delta || Math.ceil(Math.random() * max)));
    set.add(candidate);
  }
  return shuffle([...set]);
}

export function getRangeForSkill(skill) {
  if (skill === 'count_1_to_5') return [1, 5];
  return [1, 10];
}

export function generateQuestion(skill, source = 'lesson') {
  const [min, max] = getRangeForSkill(skill);
  const answer = Math.floor(Math.random() * (max - min + 1)) + min;
  const icon = icons[Math.floor(Math.random() * icons.length)];
  const kind = skill.includes('read_numbers') ? 'number_reading' : 'counting';
  return {
    id: `${source}-${skill}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    skill,
    source,
    kind,
    prompt: kind === 'number_reading' ? 'Choose the matching group.' : `How many ${icon} do you see?`,
    display: kind === 'number_reading' ? String(answer) : icon.repeat(answer),
    answer,
    choices: choicesFor(answer, max),
    slowThresholdMs: skill === 'count_1_to_5' ? 8000 : 10000
  };
}

export function generateLessonQuestions(lesson) {
  return Array.from({ length: lesson.questionCount || 10 }, () => generateQuestion(lesson.skill, 'lesson'));
}

export function generatePracticeItems(answerLog) {
  const weakItems = answerLog.filter((entry) => entry.wasWrongFirstTry || entry.wasSlow);
  const practice = [];
  weakItems.forEach((entry) => {
    practice.push({ ...entry.question, id: `${entry.question.id}-retry`, source: 'practice_again' });
    practice.push(generateQuestion(entry.question.skill, 'practice_again_similar'));
  });
  return practice.slice(0, Math.max(weakItems.length, 1) * 2);
}

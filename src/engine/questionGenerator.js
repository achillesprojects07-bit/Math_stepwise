import { level6ALessons } from '../curriculum/level6A.js';

const icons = ['⭐', '🍎', '●', '🌸', '🔵', '🟣'];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function choicesFor(answer, max = 10) {
  const set = new Set([answer]);
  while (set.size < 4) {
    const offset = Math.floor(Math.random() * 5) - 2;
    const random = Math.ceil(Math.random() * max);
    const candidate = Math.min(max, Math.max(1, answer + offset || random));
    set.add(candidate);
  }
  return shuffle([...set]);
}

export function getRangeForSkill(skill) {
  if (skill === 'count_1_to_5') return [1, 5];
  return [1, 10];
}

function kindForSkill(skill) {
  if (skill.includes('read_numbers')) return 'number_reading';
  if (skill.includes('dots')) return 'dot_recognition';
  return 'counting';
}

export function generateQuestion(skill, source = 'lesson') {
  const [min, max] = getRangeForSkill(skill);
  const answer = Math.floor(Math.random() * (max - min + 1)) + min;
  const icon = skill.includes('dots') ? '●' : icons[Math.floor(Math.random() * icons.length)];
  const kind = kindForSkill(skill);
  const prompt = kind === 'number_reading'
    ? 'Choose the matching group.'
    : `How many ${icon} do you see?`;
  const display = kind === 'number_reading' ? String(answer) : icon.repeat(answer);
  return {
    id: `${source}-${skill}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    skill,
    source,
    kind,
    prompt,
    display,
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
    practice.push(generateQuestion(entry.skill, 'practice_again_targeted'));
    practice.push(generateQuestion(entry.skill, 'practice_again_similar'));
  });
  return practice.slice(0, Math.max(weakItems.length * 2, weakItems.length));
}

function lessonsInRange(level, from, to) {
  if (level !== '6A') return [];
  return level6ALessons.filter((lesson) => lesson.lessonNumber >= from && lesson.lessonNumber <= to);
}

export function generateQuestionsForWarmup(warmup) {
  if (warmup.type === 'lesson_range') {
    const lessons = lessonsInRange(warmup.level, warmup.from, warmup.to);
    const selected = lessons.length ? lessons : [level6ALessons[0]];
    return selected.slice(0, 5).map((lesson) => generateQuestion(lesson.skill, 'quick_warmup'));
  }
  if (warmup.skill) {
    return Array.from({ length: 5 }, () => generateQuestion(warmup.skill, 'quick_warmup'));
  }
  return Array.from({ length: 5 }, () => generateQuestion('count_1_to_5', 'quick_warmup'));
}

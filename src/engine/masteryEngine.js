export function evaluateLesson({ correctFirstTry, totalQuestions, finalCorrect, totalTimeSeconds, targetTimeSeconds, sctUsed }) {
  const finalAccuracy = totalQuestions === 0 ? 0 : finalCorrect / totalQuestions;
  const firstTryAccuracy = totalQuestions === 0 ? 0 : correctFirstTry / totalQuestions;
  const hasFullCorrectedAccuracy = finalAccuracy === 1;
  const withinTime = !sctUsed || !targetTimeSeconds || totalTimeSeconds <= targetTimeSeconds;

  if (!hasFullCorrectedAccuracy) {
    return { status: 'needs_review_accuracy', childMessage: 'Let’s practice a few more.', parentLabel: 'Needs Review — Accuracy', finalAccuracy, firstTryAccuracy, withinTime };
  }
  if (!withinTime) {
    return { status: 'completed_needs_fluency', childMessage: 'Good work. We will practice again soon.', parentLabel: 'Completed — Needs Fluency', finalAccuracy, firstTryAccuracy, withinTime };
  }
  return { status: 'mastered', childMessage: 'Great work!', parentLabel: 'Mastered', finalAccuracy, firstTryAccuracy, withinTime };
}

export function buildPracticeAgainQueue(results) {
  const flagged = [];
  for (const result of results || []) {
    const wrongFirstTry = result.firstTryCorrect === false;
    const slowCorrect = result.firstTryCorrect === true && result.elapsedSeconds > result.slowThresholdSeconds;
    if (wrongFirstTry || slowCorrect) {
      flagged.push({
        sourceQuestionId: result.id,
        skill: result.skill,
        answer: result.answer,
        reason: wrongFirstTry ? 'Wrong first try' : 'Slow correct item',
        childLabel: 'Quick practice'
      });
    }
  }
  return dedupeBySkill(flagged).slice(0, 5);
}

export function makeParentRecommendation(results) {
  const queue = buildPracticeAgainQueue(results);
  if (!queue.length) return 'Continue to the next lesson.';
  const wrong = queue.filter((q) => q.reason === 'Wrong first try');
  const slow = queue.filter((q) => q.reason === 'Slow correct item');
  const topSkill = prettifySkill(queue[0].skill);
  if (wrong.length && slow.length) return `Review ${topSkill}. There were wrong-first-try and slow items.`;
  if (wrong.length) return `Practice ${topSkill}. The first try showed some weak spots.`;
  return `Add a short fluency round for ${topSkill}.`;
}

export function canPromoteLevel({ allLessonsMastered, reviewQueueCleared, finalLevelCheckPassed, timedStandardsMet }) {
  return Boolean(allLessonsMastered && reviewQueueCleared && finalLevelCheckPassed && timedStandardsMet);
}

function dedupeBySkill(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.skill + item.reason;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function prettifySkill(skill) {
  return String(skill).replaceAll('_', ' ').replace('1 to', '1–').replace('recognition', 'recognition').replace(/\b\w/g, (c) => c.toUpperCase());
}

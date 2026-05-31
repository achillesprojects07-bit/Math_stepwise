export function evaluateLesson({ correctFirstTry, totalQuestions, finalCorrect, totalTimeSeconds, targetTimeSeconds, sctUsed }) {
  const finalAccuracy = totalQuestions === 0 ? 0 : finalCorrect / totalQuestions;
  const firstTryAccuracy = totalQuestions === 0 ? 0 : correctFirstTry / totalQuestions;
  const hasFullCorrectedAccuracy = finalAccuracy === 1;
  const withinTime = !sctUsed || !targetTimeSeconds || totalTimeSeconds <= targetTimeSeconds;

  if (!hasFullCorrectedAccuracy) {
    return {
      status: 'needs_review_accuracy',
      childMessage: 'Let’s practice a few more.',
      parentLabel: 'Needs Review — Accuracy',
      finalAccuracy,
      firstTryAccuracy,
      withinTime
    };
  }

  if (!withinTime) {
    return {
      status: 'completed_needs_fluency',
      childMessage: 'Good work. We will practice again soon.',
      parentLabel: 'Completed — Needs Fluency',
      finalAccuracy,
      firstTryAccuracy,
      withinTime
    };
  }

  return {
    status: 'mastered',
    childMessage: 'Great work!',
    parentLabel: 'Mastered',
    finalAccuracy,
    firstTryAccuracy,
    withinTime
  };
}

export function canPromoteLevel({ allLessonsMastered, reviewQueueCleared, finalLevelCheckPassed, timedStandardsMet }) {
  return Boolean(allLessonsMastered && reviewQueueCleared && finalLevelCheckPassed && timedStandardsMet);
}

function evaluateLessonAttempt(attempt, lessonRules) {
  const totalQuestions = Number(attempt.totalQuestions || 0);
  const correctedCorrect = Number(attempt.correctAfterCorrections || 0);
  const unresolvedErrors = Number(attempt.unresolvedErrors || 0);
  const elapsedSeconds = Number(attempt.elapsedSeconds || 0);
  const targetSeconds = lessonRules.targetSeconds === null || lessonRules.targetSeconds === undefined
    ? null
    : Number(lessonRules.targetSeconds);
  const hasSct = Boolean(lessonRules.hasSct);

  if (totalQuestions <= 0) {
    return { status: 'needs_review_accuracy', mastered: false, reason: 'No questions were completed.' };
  }

  const finalAccuracy = correctedCorrect / totalQuestions;
  const isFullyCorrected = finalAccuracy === 1 && unresolvedErrors === 0;

  if (!isFullyCorrected) {
    return {
      status: 'needs_review_accuracy',
      mastered: false,
      reason: 'Some answers still need correction.'
    };
  }

  if (hasSct && targetSeconds !== null && elapsedSeconds > targetSeconds) {
    return {
      status: 'completed_needs_fluency',
      mastered: false,
      reason: 'The work was corrected, but needs more fluency practice.'
    };
  }

  return {
    status: 'mastered',
    mastered: true,
    reason: 'Accuracy and timing rules were satisfied.'
  };
}

function canPromoteLevel(levelProgress) {
  const allLessonsMastered = levelProgress.totalLessons > 0 && levelProgress.masteredLessons === levelProgress.totalLessons;
  const reviewQueueClear = levelProgress.reviewItems === 0;
  const finalCheckPassed = Boolean(levelProgress.finalCheckPassed);

  return allLessonsMastered && reviewQueueClear && finalCheckPassed;
}

module.exports = { evaluateLessonAttempt, canPromoteLevel };

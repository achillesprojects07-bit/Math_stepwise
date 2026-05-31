export function evaluateLesson({ answerLog, elapsedMs, lesson }) {
  const total = answerLog.length;
  const correctFinal = answerLog.filter((entry) => entry.finalCorrect).length;
  const wrongFirstTry = answerLog.filter((entry) => entry.wasWrongFirstTry).length;
  const slowCorrect = answerLog.filter((entry) => entry.wasSlow).length;
  const finalAccuracy = total ? correctFinal / total : 0;
  const needsPracticeAgain = wrongFirstTry > 0 || slowCorrect > 0;

  return {
    finalAccuracy,
    lessonScore: `${total - wrongFirstTry}/${total}`,
    wrongFirstTry,
    slowCorrect,
    needsPracticeAgain,
    completed: finalAccuracy === 1,
    elapsedMs,
    visibleLesson: lesson.displayId
  };
}

export function makeNextPracticeRecommendation({ lesson, answerLog, practiceLog, practiceItemCount }) {
  const wrongFirstTry = answerLog.filter((entry) => entry.wasWrongFirstTry).length;
  const slowCorrect = answerLog.filter((entry) => entry.wasSlow).length;
  const practiceRetries = practiceLog.reduce((sum, entry) => sum + (entry.wrongAttempts || 0), 0);

  if (wrongFirstTry > 1 || practiceRetries > 0) {
    return {
      message: `Quick Warm-Up recommended for ${lesson.title.toLowerCase()}.`,
      label: lesson.title,
      practice: {
        type: 'lesson_range',
        level: lesson.level,
        from: Math.max(1, lesson.lessonNumber - 1),
        to: lesson.lessonNumber,
        label: `${lesson.level}-${Math.max(1, lesson.lessonNumber - 1)} to ${lesson.displayId}`,
        reason: 'Wrong-first-try or repeated practice items'
      }
    };
  }

  if (slowCorrect > 0 || practiceItemCount > 0) {
    return {
      message: `Light fluency warm-up recommended for ${lesson.title.toLowerCase()}.`,
      label: lesson.title,
      practice: {
        type: 'skill',
        level: lesson.level,
        skill: lesson.skill,
        label: lesson.title,
        reason: 'Slow correct answers'
      }
    };
  }

  return {
    message: 'Continue to the next lesson.',
    label: 'None',
    practice: null
  };
}

export function practiceIsCleared(practiceLog, totalPracticeItems) {
  return practiceLog.filter((entry) => entry.finalCorrect).length >= totalPracticeItems;
}

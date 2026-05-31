export function evaluateLesson({ answerLog, elapsedMs, lesson }) {
  const total = answerLog.length;
  const correctFinal = answerLog.filter((entry) => entry.finalCorrect).length;
  const wrongFirstTry = answerLog.filter((entry) => entry.wasWrongFirstTry).length;
  const slowCorrect = answerLog.filter((entry) => entry.wasSlow).length;
  const finalAccuracy = total ? correctFinal / total : 0;
  const needsPracticeAgain = wrongFirstTry > 0 || slowCorrect > 0;

  return {
    finalAccuracy,
    firstTryCorrect: total - wrongFirstTry,
    wrongFirstTry,
    slowCorrect,
    needsPracticeAgain,
    mastered: finalAccuracy === 1 && !needsPracticeAgain,
    completed: finalAccuracy === 1,
    elapsedMs,
    visibleLesson: lesson.displayId,
    recommendation: makeRecommendation({ wrongFirstTry, slowCorrect, lesson })
  };
}

export function makeRecommendation({ wrongFirstTry, slowCorrect, lesson }) {
  if (wrongFirstTry > 1) return `Practice ${lesson.title.toLowerCase()} again next session.`;
  if (slowCorrect > 0) return `Add a short fluency review for ${lesson.title.toLowerCase()}.`;
  return 'Continue to the next lesson.';
}

export function practiceIsCleared(practiceLog, totalPracticeItems) {
  return practiceLog.filter((entry) => entry.finalCorrect).length >= totalPracticeItems;
}

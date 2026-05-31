export const level6ABlocks = [
  { from: 1, to: 10, title: 'Counting up to 5 — Part 1', skill: 'counting_1_5', mode: 'count_objects' },
  { from: 11, to: 20, title: 'Counting up to 5 — Part 2', skill: 'counting_1_5', mode: 'count_objects' },
  { from: 21, to: 30, title: 'Counting up to 5 — Part 3', skill: 'counting_1_5', mode: 'count_objects' },
  { from: 31, to: 40, title: 'Counting up to 10 — Part 1', skill: 'counting_1_10', mode: 'count_objects' },
  { from: 41, to: 50, title: 'Counting up to 10 — Part 2', skill: 'counting_1_10', mode: 'count_objects' },
  { from: 51, to: 60, title: 'Counting up to 10 — Part 3', skill: 'counting_1_10', mode: 'count_objects' },
  { from: 61, to: 70, title: 'Counting up to 10 — Part 4', skill: 'counting_1_10', mode: 'count_objects' },
  { from: 71, to: 80, title: 'Counting up to 10 — Part 5', skill: 'counting_1_10', mode: 'count_objects' },
  { from: 81, to: 90, title: 'Counting up to 10 — Part 6', skill: 'counting_1_10', mode: 'count_objects' },
  { from: 91, to: 100, title: 'Counting up to 10 — Part 7', skill: 'counting_1_10', mode: 'count_objects' },
  { from: 101, to: 110, title: 'Number Reading up to 10 — Part 1', skill: 'number_reading_1_10', mode: 'number_reading' },
  { from: 111, to: 120, title: 'Number Reading up to 10 — Part 2', skill: 'number_reading_1_10', mode: 'number_reading' },
  { from: 121, to: 130, title: 'Number Reading up to 10 — Part 3', skill: 'number_reading_1_10', mode: 'number_reading' },
  { from: 131, to: 140, title: 'Number Reading up to 10 — Part 4', skill: 'number_reading_1_10', mode: 'number_reading' },
  { from: 141, to: 150, title: 'Number Reading up to 10 — Part 5', skill: 'number_reading_1_10', mode: 'number_reading' },
  { from: 151, to: 160, title: 'Number of Dots up to 10 — Part 1', skill: 'dot_recognition_1_10', mode: 'dot_recognition' },
  { from: 161, to: 170, title: 'Number of Dots up to 10 — Part 2', skill: 'dot_recognition_1_10', mode: 'dot_recognition' },
  { from: 171, to: 180, title: 'Number of Dots up to 10 — Part 3', skill: 'dot_recognition_1_10', mode: 'dot_recognition' },
  { from: 181, to: 190, title: 'Number of Dots up to 10 — Part 4', skill: 'dot_recognition_1_10', mode: 'dot_recognition' },
  { from: 191, to: 200, title: 'Number of Dots up to 10 — Part 5', skill: 'dot_recognition_1_10', mode: 'dot_recognition' }
];
export const level6ALessons = Array.from({ length: 200 }, (_, index) => {
  const lessonNumber = index + 1;
  const block = level6ABlocks.find(item => lessonNumber >= item.from && lessonNumber <= item.to);
  return {
    level: '6A',
    lessonNumber,
    displayId: `6A-${lessonNumber}`,
    title: block.title.replace(/ — Part \d+$/, ''),
    blockTitle: block.title,
    skill: block.skill,
    mode: block.mode
  };
});

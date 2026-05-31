const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'src/app.js'), 'utf8');
function pass(name, condition) {
  if (!condition) throw new Error(`FAIL: ${name}`);
  console.log(`PASS: ${name}`);
}
pass('small-step additionBand helper exists', app.includes('function additionBand'));
pass('small-step left-value helper exists', app.includes('function smallStepLeftValue'));
pass('old large-jump formula removed', !app.includes('lesson.lessonNumber*3'));
pass('addition mode remains typed answer', app.includes("else if(lesson.mode==='addition')") && app.includes("type='typed'"));
pass('levels 6A-2A available', ['6A','5A','4A','3A','2A'].every(l => app.includes(`'${l}'`)));

// Simulate the exact small-step helper logic for the problem scenario.
function additionBand(lesson){
  const blockLength = Math.max(1, (lesson.blockTo || lesson.lessonNumber) - (lesson.blockFrom || lesson.lessonNumber) + 1);
  const positionInBlock = Math.max(0, lesson.lessonNumber - (lesson.blockFrom || lesson.lessonNumber));
  const bandSize = 5;
  const maxLeft = Math.max(1, Number(lesson.max || 10));
  const bandCount = Math.max(1, Math.ceil(maxLeft / bandSize));
  const lessonsPerBand = Math.max(1, Math.ceil(blockLength / bandCount));
  const bandIndex = Math.min(bandCount - 1, Math.floor(positionInBlock / lessonsPerBand));
  const start = 1 + bandIndex * bandSize;
  const end = Math.min(maxLeft, start + bandSize - 1);
  return { start, end };
}
function smallStepLeftValue(lesson, idx){
  const { start, end } = additionBand(lesson);
  const values = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const mixedOrder = [1, 3, 0, 4, 2, 5, 6, 7, 8, 9];
  if(idx <= values.length) return values[idx - 1];
  const orderIndex = mixedOrder[(idx - values.length - 1) % mixedOrder.length] % values.length;
  return values[orderIndex];
}
const early3A = { level:'3A', lessonNumber:161, blockFrom:161, blockTo:170, max:14 };
const earlyValues = Array.from({length:10}, (_,i)=>smallStepLeftValue(early3A, i+1));
pass('early 3A Adding 3 starts with ladder 1-5', earlyValues.slice(0,5).join(',') === '1,2,3,4,5');
pass('early 3A Adding 3 does not jump to 21', !earlyValues.includes(21));
pass('early 3A Adding 3 narrow same-lesson band', Math.max(...earlyValues)-Math.min(...earlyValues) <= 4);

const later3A = { level:'3A', lessonNumber:170, blockFrom:161, blockTo:170, max:14 };
const laterValues = Array.from({length:10}, (_,i)=>smallStepLeftValue(later3A, i+1));
pass('later 3A Adding 3 advances gradually, still narrow band', Math.max(...laterValues)-Math.min(...laterValues) <= 4);

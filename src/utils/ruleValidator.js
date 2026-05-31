import fs from 'fs';
const rules = JSON.parse(fs.readFileSync(new URL('../config/masteryRules.json', import.meta.url)));
if (!rules.practiceAgain.mustClearAllItems) throw new Error('Practice Again must clear all items.');
if (!rules.continueNextLesson.requiresMastery) throw new Error('Continue must require mastery.');
if (!rules.reset.parentOnly) throw new Error('Reset must be parent only.');
console.log('Rule validation passed.');

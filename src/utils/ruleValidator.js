import fs from 'fs';

const rules = JSON.parse(fs.readFileSync(new URL('../config/masteryRules.json', import.meta.url)));
const levels = JSON.parse(fs.readFileSync(new URL('../config/levels.json', import.meta.url)));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(rules.accuracy.finalCorrectedAccuracyRequired === 1.0, 'Final corrected accuracy must be 100%.');
assert(rules.time.allowFinishAfterTargetTime === true, 'Child must be allowed to finish after target time.');
assert(rules.time.useSctWhenAvailable === true, 'SCT must be used when available.');
assert(rules.time.nonSctLevels.includes('6A') && rules.time.nonSctLevels.includes('5A'), '6A and 5A must be non-SCT levels.');
assert(rules.childFacingRulesHidden === true, 'Backend rules must be hidden from child-facing UI.');
assert(levels.levels.some((level) => level.id === '6A' && level.status === 'available'), '6A must be available.');

console.log('Rule validation passed.');

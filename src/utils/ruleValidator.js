const fs = require('fs');
const path = require('path');

function readJson(relativePath) {
  const fullPath = path.join(__dirname, '..', relativePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

function validateRules() {
  const rules = readJson('config/masteryRules.json');
  const levels = readJson('config/levels.json');
  const errors = [];

  if (rules.mastery.requiresFinalCorrectedAccuracy !== 1.0) {
    errors.push('Final corrected accuracy must be 100%.');
  }

  if (!rules.mastery.allowFinishAfterTimeExceeded) {
    errors.push('Child must be allowed to finish after time is exceeded.');
  }

  if (!rules.mastery.timeIncludesCorrections) {
    errors.push('Time must include corrections.');
  }

  if (rules.mastery.nonSctLevelsUseTimeAsGate !== false) {
    errors.push('Non-SCT levels must not use time as a hard gate.');
  }

  const ids = levels.levels.map((level) => level.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) {
    errors.push(`Duplicate level IDs found: ${duplicates.join(', ')}`);
  }

  const expectedFirstLevels = ['ZI', 'ZII', '6A', '5A'];
  for (const id of expectedFirstLevels) {
    const level = levels.levels.find((item) => item.id === id);
    if (!level) {
      errors.push(`Missing level ${id}.`);
    } else if (level.hasSct !== false) {
      errors.push(`Level ${id} should be marked hasSct=false.`);
    }
  }

  const level6A = levels.levels.find((level) => level.id === '6A');
  if (!level6A || level6A.lessonCount !== 200) {
    errors.push('Level 6A must have 200 lessons.');
  }

  return errors;
}

if (require.main === module) {
  const errors = validateRules();
  if (errors.length) {
    console.error('Rule validation failed:');
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }
  console.log('Rule validation passed.');
}

module.exports = { validateRules };

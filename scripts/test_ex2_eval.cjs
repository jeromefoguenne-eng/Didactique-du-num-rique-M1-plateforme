const fs = require('fs');

// We simulate evaluateDocumentRelevance and generateDidacticAiCorrection from userStore.ts
const userStoreContent = fs.readFileSync('docs/.vitepress/theme/stores/userStore.ts', 'utf8');

// Let's import the data from studentSubmissionsData
const dataContent = fs.readFileSync('docs/.vitepress/theme/stores/studentSubmissionsData.ts', 'utf8');
const lines = dataContent.split('\n');

const filesStart = lines.findIndex(l => l.includes('export const INITIAL_REAL_FILES: SubmittedFile[] = ['));
const subStart = lines.findIndex(l => l.includes('export const INITIAL_REAL_SUBMISSIONS: Submission[] = ['));
const filesText = lines.slice(filesStart + 1, subStart).join('\n').trim().replace(/;$/, '');
const filesClean = ('[' + filesText).replace(/"dataUrl":\s*"[^"]*"/g, '"dataUrl": ""');
const files = JSON.parse(filesClean);

function normalizeTextForAi(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const EXERCISE_DIDACTIC_PROFILES = {
  'exercice-02': {
    id: 'exercice-02',
    title: "Atelier 2 : Évaluation critique d'une information",
    shortTitle: 'Atelier 2 (Esprit Critique)',
    requiredKeywords: ['information', 'sommeil', 'telephone', 'source', 'verification'],
    domainKeywords: [
      'information', 'infox', 'fake news', 'source', 'primaire', 'secondaire', 'verification',
      'sommeil', 'telephone', 'smartphone', 'etude', 'scientifique', 'fact checking',
      'recherche inversee', 'titre', 'dramatisation', 'esprit critique', 'biais', 'medias',
      'recoupement', 'fiabilite', 'validation', 'methode', 'eleves', 'secondaire', 'rumeur',
      'algorithme', 'attention', 'sensationnalisme', 'csem'
    ]
  }
};

const ex2Files = files.filter(f => f.exerciseId === 'exercice-02');
console.log('Testing Ex2 Files:');
ex2Files.forEach((f, i) => {
  const norm = normalizeTextForAi(f.extractedText);
  const words = norm.split(' ').filter(w => w.length > 2);
  const foundRequired = EXERCISE_DIDACTIC_PROFILES['exercice-02'].requiredKeywords.filter(k => norm.includes(normalizeTextForAi(k)));
  const foundDomain = EXERCISE_DIDACTIC_PROFILES['exercice-02'].domainKeywords.filter(k => norm.includes(normalizeTextForAi(k)));
  const reqRatio = foundRequired.length / 5;
  const domRatio = foundDomain.length / 10;
  const concordanceScore = Math.round((reqRatio * 0.60 + Math.min(1, domRatio) * 0.40) * 100);
  const isOffTopic = concordanceScore < 12 || (foundRequired.length === 0 && foundDomain.length <= 1);
  console.log(`File ${i} (${f.userName}, ${f.originalFileName}): words=${words.length}, req=${foundRequired.length}/5 [${foundRequired.join(',')}], dom=${foundDomain.length}, score=${concordanceScore}, isOffTopic=${isOffTopic}`);
});

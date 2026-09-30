const fs = require('fs');
const content = fs.readFileSync('docs/.vitepress/theme/stores/studentSubmissionsData.ts', 'utf8');

const lines = content.split('\n');

const filesStart = lines.findIndex(l => l.includes('export const INITIAL_REAL_FILES: SubmittedFile[] = ['));
const subStart = lines.findIndex(l => l.includes('export const INITIAL_REAL_SUBMISSIONS: Submission[] = ['));
const quizStart = lines.findIndex(l => l.includes('export const INITIAL_REAL_QUIZZES: QuizAttempt[] = ['));

const filesText = lines.slice(filesStart + 1, subStart).join('\n').trim().replace(/;$/, '');
const filesClean = ('[' + filesText).replace(/"dataUrl":\s*"[^"]*"/g, '"dataUrl": ""');
const files = JSON.parse(filesClean);

console.log('=== FILES COUNT:', files.length, '===');
files.forEach((f, idx) => {
  const extractedLen = (f.extractedText || '').length;
  console.log(`${idx} | ${f.userName} | ${f.userEmail} | ${f.exerciseId} | ${f.originalFileName} | Chars: ${extractedLen} | AI: ${f.aiCorrection?.suggestedScore} | Teacher: ${f.teacherGrade?.score}`);
});

const subText = lines.slice(subStart + 1, quizStart).join('\n').trim().replace(/;$/, '');
const subs = JSON.parse('[' + subText);
console.log('\n=== SUBMISSIONS COUNT:', subs.length, '===');
subs.forEach((s, idx) => {
  const answerLen = (s.answer || '').length;
  console.log(`${idx} | ${s.userName} | ${s.userEmail} | ${s.exerciseId} | Chars: ${answerLen}`);
});

const quizText = lines.slice(quizStart + 1).join('\n').trim().replace(/;$/, '');
const quizzes = JSON.parse('[' + quizText);
console.log('\n=== QUIZZES COUNT:', quizzes.length, '===');
quizzes.forEach((q, idx) => {
  console.log(`${idx} | ${q.userName} | ${q.userEmail} | ${q.moduleId} | Score: ${q.score}/${q.totalPoints} (${q.percentage}%)`);
});

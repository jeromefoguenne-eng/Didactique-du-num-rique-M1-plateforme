import fs from 'fs';

const filePath = 'docs/.vitepress/theme/components/QuizBox.vue';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Shuffling static QCM options across all 91 questions
const qcmRegex = /options:\s*\[([\s\S]*?)\]\s*,\s*correctIndex:\s*(\d+)/g;

let count = 0;
let newStats = { 0: 0, 1: 0, 2: 0, 3: 0 };
const targetPattern = [0, 2, 3, 1, 2, 0, 1, 3, 3, 1, 0, 2, 0, 3, 1, 2, 2, 1, 3, 0];

content = content.replace(qcmRegex, (fullMatch, optionsRaw, correctIndexStr) => {
  const originalIndex = parseInt(correctIndexStr, 10);
  const originalOptions = eval(`[${optionsRaw}]`);
  const correctAnswer = originalOptions[originalIndex];

  // Desired new index for this question
  const targetIndex = targetPattern[count % targetPattern.length] % originalOptions.length;
  count++;

  // Separate correct from wrong options
  const wrongOptions = originalOptions.filter((_, idx) => idx !== originalIndex);

  // Shuffle wrong options deterministically
  for (let i = wrongOptions.length - 1; i > 0; i--) {
    const j = (count * 7 + i * 13) % (i + 1);
    [wrongOptions[i], wrongOptions[j]] = [wrongOptions[j], wrongOptions[i]];
  }

  // Insert correct answer at targetIndex
  const newOptions = [...wrongOptions];
  newOptions.splice(targetIndex, 0, correctAnswer);

  const newCorrectIndex = newOptions.indexOf(correctAnswer);
  if (newCorrectIndex !== targetIndex) {
    throw new Error(`Integrity error at question ${count}`);
  }
  if (newOptions[newCorrectIndex] !== originalOptions[originalIndex]) {
    throw new Error(`Answer mismatch at question ${count}`);
  }

  newStats[newCorrectIndex] = (newStats[newCorrectIndex] || 0) + 1;

  // Format options nicely with proper indentation
  const formattedOptions = newOptions.map(opt => `        ${JSON.stringify(opt)}`).join(',\n');

  return `options: [\n${formattedOptions}\n      ],\n      correctIndex: ${newCorrectIndex}`;
});

console.log(`Processed ${count} static questions.`);
console.log('New static correctIndex distribution:', newStats);

// 2. Add dynamic runtime shuffling in QuizBox.vue logic
// Replace `const questions = computed(() => { ... })` with dynamic shuffle logic

const oldQuestionsComputed = `// Données réactives du Quiz
const questions = computed(() => {
  if (props.customQuestions && props.customQuestions.length > 0) {
    return props.customQuestions
  }
  return MODULE_QUESTIONS[props.moduleId] || FALLBACK_QUESTIONS
})`;

const newQuestionsLogic = `// Fonction de mélange aléatoire des propositions (Fisher-Yates)
function shuffleQuestionOptions(questionList) {
  if (!Array.isArray(questionList)) return []
  return questionList.map(q => {
    if (q.type !== 'qcm' || !Array.isArray(q.options) || q.options.length <= 1) {
      return { ...q }
    }
    const correctText = q.options[q.correctIndex]
    const shuffled = [...q.options]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const newCorrectIndex = shuffled.indexOf(correctText)
    return {
      ...q,
      options: shuffled,
      correctIndex: newCorrectIndex
    }
  })
}

// Données réactives du Quiz avec mélange dynamique des options
const activeQuestions = ref([])

function initQuestions() {
  const base = (props.customQuestions && props.customQuestions.length > 0)
    ? props.customQuestions
    : (MODULE_QUESTIONS[props.moduleId] || FALLBACK_QUESTIONS)
  activeQuestions.value = shuffleQuestionOptions(base)
}

watch(() => props.moduleId, () => {
  initQuestions()
}, { immediate: true })

const questions = computed(() => activeQuestions.value)`;

if (!content.includes(oldQuestionsComputed)) {
  console.warn("Could not find exact oldQuestionsComputed block, checking with normalized newlines...");
  const normContent = content.replace(/\r\n/g, '\n');
  const normOld = oldQuestionsComputed.replace(/\r\n/g, '\n');
  if (normContent.includes(normOld)) {
    content = normContent.replace(normOld, newQuestionsLogic);
  } else {
    throw new Error("Target questions computed block not found!");
  }
} else {
  content = content.replace(oldQuestionsComputed, newQuestionsLogic);
}

// Ensure watch is imported from 'vue' at line 2:
content = content.replace(
  "import { ref, computed, onMounted } from 'vue'",
  "import { ref, computed, watch, onMounted } from 'vue'"
);

// In retakeQuiz(), re-shuffle options:
const oldRetake = `function retakeQuiz() {
  userAnswers.value = {}
  openSelfScores.value = {}
  isSubmitted.value = false
  showCorrection.value = false
  saveSuccess.value = false
}`;

const newRetake = `function retakeQuiz() {
  userAnswers.value = {}
  openSelfScores.value = {}
  isSubmitted.value = false
  showCorrection.value = false
  saveSuccess.value = false
  initQuestions()
}`;

if (content.includes(oldRetake)) {
  content = content.replace(oldRetake, newRetake);
} else {
  const normContent = content.replace(/\r\n/g, '\n');
  const normOldRetake = oldRetake.replace(/\r\n/g, '\n');
  if (normContent.includes(normOldRetake)) {
    content = normContent.replace(normOldRetake, newRetake);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('QuizBox.vue updated successfully!');

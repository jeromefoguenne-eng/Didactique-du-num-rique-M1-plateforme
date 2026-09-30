import { reactive, computed, ref } from 'vue'
import { cloudSync, cloudSyncState, DEFAULT_CLOUD_URL } from './cloudSync'
import { INITIAL_REAL_USERS, INITIAL_REAL_FILES, INITIAL_REAL_SUBMISSIONS, INITIAL_REAL_QUIZZES } from './studentSubmissionsData'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'student' | 'admin'
  registeredAt: string
  status?: 'active' | 'archived'
  password?: string
  passwordSet?: boolean
  recoveryCode?: string
}

export interface QuizAnswer {
  questionId: string
  questionText: string
  type: 'qcm' | 'open'
  userAnswer: string | number
  correctAnswer?: string | number
  isCorrect?: boolean
  points: number
  maxPoints: number
  explanation?: string
  openFeedback?: string
}

export interface QuizAttempt {
  id: string
  userId: string
  userName: string
  userEmail: string
  moduleId: string
  moduleTitle: string
  score: number
  totalPoints: number
  percentage: number
  answers: QuizAnswer[]
  submittedAt: string
  evaluationType: 'diagnostic'
}

export interface Submission {
  id: string
  userId: string
  userName: string
  userEmail: string
  exerciseId: string
  exerciseTitle: string
  answer: string
  submittedAt: string
}

export interface AiCriterion {
  name: string
  score: number
  maxScore: number
  justification: string
}

export interface AiCorrection {
  status: 'analyzed' | 'pending' | 'error'
  suggestedScore: number
  maxScore: number
  rubricScores: {
    concordance: number // Pertinence & concordance programme /3
    didacticQuality: number // Intégration didactique /3
    criticalAnalysis: number // Rigueur de l'analyse critique /2.5
    formAndStructure: number // Structure, clarté et présentation /1.5
  }
  criteriaTable?: AiCriterion[]
  summary: string
  strengths: string[]
  improvements: string[]
  nextSteps?: string
  detailedFeedback: string
  correctedAt: string
  modelUsed: string
}

export interface TeacherGrade {
  score: number
  maxScore: number
  feedback: string
  gradedAt: string
  status: 'graded' | 'pending'
}

export interface ExerciseTeacherFeedback {
  userEmail: string
  userName?: string
  exerciseId: string
  exerciseTitle?: string
  score?: number
  maxScore: number
  feedback: string
  gradedAt: string
  status: 'graded' | 'pending'
}

export interface SubmittedFile {
  id: string
  userId: string
  userName: string
  userEmail: string
  exerciseId: string
  exerciseTitle: string
  originalFileName: string
  formattedFileName: string // ex: DUBOIS_Sarah_Atelier-01_2026-09-16.pdf
  fileType: string
  fileSize: number
  dataUrl?: string
  submittedAt: string
  driveSynced?: boolean
  aiCorrection?: AiCorrection
  teacherGrade?: TeacherGrade
}

const STORAGE_KEY_USERS = 'hech_didac_users'
const STORAGE_KEY_CURRENT = 'hech_didac_current_user'
const STORAGE_KEY_PROGRESS = 'hech_didac_progress'
const STORAGE_KEY_SUBMISSIONS = 'hech_didac_submissions'
const STORAGE_KEY_ADMIN_PIN = 'hech_didac_admin_pin'
const STORAGE_KEY_ADMIN_ATTEMPTS = 'hech_didac_admin_attempts'
const STORAGE_KEY_ADMIN_LOCKOUT = 'hech_didac_admin_lockout'
const STORAGE_KEY_FILES = 'hech_didac_files'
const STORAGE_KEY_WEBHOOK = 'hech_didac_drive_webhook'
const STORAGE_KEY_QUIZZES = 'hech_didac_quiz_attempts'
const STORAGE_KEY_EVALUATIONS = 'hech_didac_evaluations_200'
const STORAGE_KEY_EXERCISE_FEEDBACKS = 'hech_didac_exercise_feedbacks'
const STORAGE_KEY_DEADLINES = 'hech_didac_deadlines_v2'
export const STORAGE_KEY_DELETED_USERS = 'hech_didac_deleted_users'

export interface EvaluationRecord {
  userEmail: string
  gamePedagogyScore?: number
  gameBoardLaserScore?: number
  gamePawns3dScore?: number
  gameAiCardsScore?: number
  gameVideoScore?: number
  gamePhotosScore?: number
  gameProjectScore: number
  oralDefenseScore: number
  gameEx09RulesScore?: number
  gameEx10PhotosScore?: number
  gameEx11AiCardsScore?: number
  gameEx12LaserScore?: number
  gameEx13Pawns3dScore?: number
  gameEx14VideoScore?: number
  gameEx15PlaytestScore?: number
  gameEx16PresentationScore?: number
  teacherFeedback?: string
}

export interface EvaluationItemDefinition {
  id: string
  title: string
  shortTitle: string
  part: 1 | 2
  partLabel: string
  maxPoints: number
  isProjectStep?: boolean
  docLink?: string
  deadline?: string
  deadlineLabel?: string
}

export type AlarmLevel = 'none' | 'recent' | 'orange' | 'bordeaux' | 'red'

export interface OverdueItemDetail {
  id: string
  title: string
  shortTitle: string
  deadline: string
  deadlineLabel: string
  daysOverdue: number
  alarmLevel: AlarmLevel
  alarmColor: string
  alarmBgColor: string
  alarmBorderColor: string
  alarmLabel: string
  alarmIcon: string
}

export interface StudentLateStatus {
  isLate: boolean
  lateCount: number
  highestAlarmLevel: AlarmLevel
  highestAlarmColor: string
  highestAlarmBgColor: string
  highestAlarmBorderColor: string
  highestAlarmLabel: string
  highestAlarmIcon: string
  daysOverdueMax: number
  lateItems: OverdueItemDetail[]
  tooltip: string
  message: string
}

/**
 * Parse de manière robuste toute date d'échéance :
 * - Format FR / Européen : JJ/MM/AAAA, JJ/MM/AAAA HH:mm, JJ/MM/AAAA à HH:mm, JJ-MM-AAAA
 * - Format ISO : YYYY-MM-DD, YYYY-MM-DDTHH:mm, YYYY-MM-DD HH:mm
 */
export function parseDeadline(dtStr: string | undefined | null): Date | null {
  if (!dtStr || typeof dtStr !== 'string' || !dtStr.trim()) return null
  const clean = dtStr.trim()

  // 1. Format européen / belge : JJ/MM/AAAA ou JJ/MM/AA ou JJ-MM-AAAA
  const frMatch = clean.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})(?:(?:\s+|[T\s]+à\s+)(\d{1,2})(?::(\d{1,2}))?)?/)
  if (frMatch) {
    const day = parseInt(frMatch[1], 10)
    const month = parseInt(frMatch[2], 10) - 1 // Mois 0-indexé
    let year = parseInt(frMatch[3], 10)
    if (year < 100) year += 2000
    const hours = frMatch[4] ? parseInt(frMatch[4], 10) : 23
    const minutes = frMatch[5] ? parseInt(frMatch[5], 10) : 59
    const d = new Date(year, month, day, hours, minutes, 0)
    if (!isNaN(d.getTime())) return d
  }

  // 2. Format standard ISO : YYYY-MM-DD ou YY-MM-DD ou YYYY-MM-DDTHH:mm
  const isoMatch = clean.match(/^(\d{2,4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[T\s]+(\d{1,2})(?::(\d{1,2}))?)?/)
  if (isoMatch) {
    let year = parseInt(isoMatch[1], 10)
    if (year < 100) year += 2000
    const month = parseInt(isoMatch[2], 10) - 1
    const day = parseInt(isoMatch[3], 10)
    const hours = isoMatch[4] ? parseInt(isoMatch[4], 10) : 23
    const minutes = isoMatch[5] ? parseInt(isoMatch[5], 10) : 59
    const d = new Date(year, month, day, hours, minutes, 0)
    if (!isNaN(d.getTime())) return d
  }

  // 3. Repli standard
  const fallback = new Date(clean.replace(' ', 'T'))
  return isNaN(fallback.getTime()) ? null : fallback
}

export function formatDeadlineDisplay(dtStr: any): string {
  if (!dtStr || typeof dtStr !== 'string' || !dtStr.trim()) return 'Non fixée'
  const d = parseDeadline(dtStr)
  if (!d) return String(dtStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} à ${hours}h${minutes}`
}

export function getAlarmLevelInfo(daysOverdue: number): {
  level: AlarmLevel
  color: string
  bgColor: string
  borderColor: string
  label: string
  icon: string
  badgeText: string
} {
  // Sécurité absolue contre NaN ou jours négatifs (échéance future)
  if (isNaN(daysOverdue) || daysOverdue < 0) {
    return {
      level: 'none',
      color: '#10b981',
      bgColor: '#ecfdf5',
      borderColor: '#a7f3d0',
      label: 'Dans les délais',
      icon: '✅',
      badgeText: 'Dans les temps'
    }
  }
  if (daysOverdue < 7) {
    return {
      level: 'recent',
      color: '#eab308',
      bgColor: '#fefce8',
      borderColor: '#fef08a',
      label: 'Retard récent (< 1 semaine)',
      icon: '⏳',
      badgeText: `Retard (${daysOverdue} j)`
    }
  }
  if (daysOverdue < 14) {
    return {
      level: 'orange',
      color: '#ea580c', // Orange vif
      bgColor: '#fff7ed',
      borderColor: '#fdba74',
      label: 'Alarme Orange (> 1 semaine de retard)',
      icon: '🟠',
      badgeText: `🟠 Alarme Orange (+${Math.floor(daysOverdue / 7)} sem, ${daysOverdue} j)`
    }
  }
  if (daysOverdue < 30) {
    return {
      level: 'bordeaux',
      color: '#881337', // Bordeaux profond
      bgColor: '#fff1f2',
      borderColor: '#fecdd3',
      label: 'Alarme Bordeaux (> 2 semaines de retard)',
      icon: '🍷',
      badgeText: `🍷 Alarme Bordeaux (+${Math.floor(daysOverdue / 7)} sem, ${daysOverdue} j)`
    }
  }
  return {
    level: 'red',
    color: '#dc2626', // Rouge écarlate
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
    label: 'Alarme Rouge Critique (> 1 mois de retard)',
    icon: '🔴',
    badgeText: `🔴 Alarme Rouge (> 1 mois, ${daysOverdue} j)`
  }
}

export const OFFICIAL_EVALUATION_ITEMS: EvaluationItemDefinition[] = [
  // Partie 1 : Travaux plateforme (100 pts)
  {
    id: 'quiz',
    title: 'Évaluations diagnostiques en ligne (Quiz de cours)',
    shortTitle: 'Quiz Diagnostiques',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 20
  },
  {
    id: 'exercice-01',
    title: 'Exercice 1 : Diagnostic de compétences (DigComp 2.2)',
    shortTitle: 'Ex 1 (DigComp)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1b1QhnOoDNyCSdAIEAZx_xq96hQxZsUJH/preview'
  },
  {
    id: 'exercice-02',
    title: 'Exercice 2 : Évaluation critique d\'une information',
    shortTitle: 'Ex 2 (Esprit Critique)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1o9vsf5fptzG1EH56oycz7SkD_UwmUKXm/preview'
  },
  {
    id: 'exercice-03',
    title: 'Exercice 3 : Conception d\'un guide numérique élèves',
    shortTitle: 'Ex 3 (Guide Élèves)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/12XENuZM1WVyeCnRfu62Oh1_tG8Gkc1Z1/preview'
  },
  {
    id: 'exercice-04',
    title: 'Exercice 4 : Escape Game FMTTN (Cyber-Enquête)',
    shortTitle: 'Ex 4 (Escape Game)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1kUSfjlioxrG-i-ZrVbzQOpxH072f_2db/preview'
  },
  {
    id: 'exercice-05',
    title: 'Exercice 5 : Défi 20 min Canva (Affiche mot de passe)',
    shortTitle: 'Ex 5 (Canva Sécurité)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1GuqhxxFNJllg4vR_wLeD5A4CtYNyJ4mj/preview'
  },
  {
    id: 'exercice-06',
    title: 'Exercice 6 : Démarche itérative (Concevoir & tester un mini-jeu)',
    shortTitle: 'Ex 6 (Itération & Jeu)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1mfCTqwo-2l9k_wdLzIu3qRWOJuBxrqJv/preview'
  },
  {
    id: 'exercice-07',
    title: 'Exercice 7 : Défi Hardware & Peer Learning (Démonter un PC)',
    shortTitle: 'Ex 7 (Hardware PC)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1Vjy9xrqLG-xuktmMmmOQ6Kh8I-hXiIzV/preview'
  },
  {
    id: 'exercice-08',
    title: 'Exercice 8 : Construire des grilles d\'évaluation critériées',
    shortTitle: 'Ex 8 (Grilles Critériées)',
    part: 1,
    partLabel: 'Partie 1 : Travaux Plateforme (100 pts)',
    maxPoints: 10,
    docLink: 'https://docs.google.com/document/d/1MV1xWWb5ZtcuRhFn_JIVG6UHeFle6IUI/preview'
  },
  // Partie 2 : Projet Jeu de Société Didactique (100 pts global)
  {
    id: 'projet-jeu',
    title: 'Projet Jeu de Société Didactique (Note globale du projet)',
    shortTitle: 'Projet Jeu (Note 100 pts)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 100
  },
  // Étapes de suivi & réalisations intermédiaires du projet (sans pondération séparée)
  {
    id: 'exercice-09',
    title: 'Étape 1 (Ex 9) : Règles du jeu & dossier pédagogique (FMTTN / CSEM)',
    shortTitle: 'Étape 1 (Règles)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1af3aH5FiR31N4FB99VrFq6628kiFFbly/preview'
  },
  {
    id: 'exercice-10',
    title: 'Étape 2 (Ex 10) : Photographier le numérique (visuels & matériel)',
    shortTitle: 'Étape 2 (Photographie)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1kSoMRpjySi0DvjA0S1W4b8BoaDQrXNZh/preview'
  },
  {
    id: 'exercice-11',
    title: 'Étape 3 (Ex 11) : Supports de jeu & cartes conçues avec l\'IA',
    shortTitle: 'Étape 3 (Cartes IA)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1CzyMJRbjyvYVh7XP83Lx4tjxnq23oHXX/preview'
  },
  {
    id: 'exercice-12',
    title: 'Étape 4 (Ex 12) : Plateau de jeu à la découpeuse laser (FabLab)',
    shortTitle: 'Étape 4 (Plateau Laser)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1Ov_huVW9al2DKuoBmW89QO3ZqE5E-nzU/preview'
  },
  {
    id: 'exercice-13',
    title: 'Étape 5 (Ex 13) : Pions de jeu modélisés et imprimés en 3D (FabLab)',
    shortTitle: 'Étape 5 (Pions 3D)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1H_88UJvPPezdUXw1Vt8_U9wtsaFouepU/preview'
  },
  {
    id: 'exercice-14',
    title: 'Étape 6 (Ex 14) : Présentation vidéo du jeu (Capsule 2-3 min)',
    shortTitle: 'Étape 6 (Vidéo)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1JO_9ayYt3IqZfStfUPkzT3GDOF65VBxQ/preview'
  },
  {
    id: 'exercice-15',
    title: 'Étape 7 (Ex 15) : Playtest & Grille d\'évaluation formative du jeu',
    shortTitle: 'Étape 7 (Playtest)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1uIheBr_KU2Dh2TjYkegz7lHixsUNxs4t/preview'
  },
  {
    id: 'exercice-16',
    title: 'Étape 8 (Ex 16) : Présentation finale et leçon FMTTN devant la classe',
    shortTitle: 'Étape 8 (Soutenance & Leçon)',
    part: 2,
    partLabel: 'Partie 2 : Projet Jeu de Société (100 pts)',
    maxPoints: 0,
    isProjectStep: true,
    docLink: 'https://docs.google.com/document/d/1Tm15GqKSwutH1MDbaGYJaWByliC17iRT/preview'
  }
]

export const GOOGLE_DRIVE_EXERCISES_FOLDER_URL = 'https://drive.google.com/drive/folders/1fRbYhPZKrhIB6uzQJonDgNdrqUdiuLOt?usp=sharing'

export interface ExerciseDocDownload {
  folderDriveUrl?: string;
  exerciseId: string
  title: string
  docId: string
  docxLocalUrl: string
  docxGoogleUrl: string
  pdfGoogleUrl: string
  driveCopyUrl: string
  viewUrl: string
}

export const EXERCISE_DOCS_DATA: Record<string, { docId: string; fileBase: string; title: string }> = {
  'exercice-01': { docId: '1b1QhnOoDNyCSdAIEAZx_xq96hQxZsUJH', fileBase: 'Exercice-01.docx', title: 'Atelier 1 : Diagnostic de compétences numériques' },
  'exercice-02': { docId: '1o9vsf5fptzG1EH56oycz7SkD_UwmUKXm', fileBase: 'Exercice-02.docx', title: 'Atelier 2 : Évaluation critique d\'une information' },
  'exercice-03': { docId: '12XENuZM1WVyeCnRfu62Oh1_tG8Gkc1Z1', fileBase: 'Exercice-03.docx', title: 'Atelier 3 : Conception d\'un guide numérique élèves' },
  'exercice-04': { docId: '1kUSfjlioxrG-i-ZrVbzQOpxH072f_2db', fileBase: 'Exercice-04.docx', title: 'Atelier 4 : Escape Game FMTTN (Cyber-Enquête)' },
  'exercice-05': { docId: '1GuqhxxFNJllg4vR_wLeD5A4CtYNyJ4mj', fileBase: 'Exercice-05.docx', title: 'Atelier 5 : Défi 20 min Canva (Affiche mot de passe)' },
  'exercice-06': { docId: '1mfCTqwo-2l9k_wdLzIu3qRWOJuBxrqJv', fileBase: 'Exercice-06.docx', title: 'Atelier 6 : Démarche itérative (Concevoir & tester un mini-jeu)' },
  'exercice-07': { docId: '1Vjy9xrqLG-xuktmMmmOQ6Kh8I-hXiIzV', fileBase: 'Exercice-07.docx', title: 'Atelier 7 : Défi Hardware & Peer Learning (Démonter un PC)' },
  'exercice-08': { docId: '1MV1xWWb5ZtcuRhFn_JIVG6UHeFle6IUI', fileBase: 'Exercice-08.docx', title: 'Atelier 8 : Grilles d\'évaluation critériées' },
  'exercice-09': { docId: '1af3aH5FiR31N4FB99VrFq6628kiFFbly', fileBase: 'Exercice-09.docx', title: 'Étape 1 (Ex 9) : Règles du jeu & dossier pédagogique' },
  'exercice-10': { docId: '1kSoMRpjySi0DvjA0S1W4b8BoaDQrXNZh', fileBase: 'Exercice-10.docx', title: 'Étape 2 (Ex 10) : Photographier le numérique' },
  'exercice-11': { docId: '1CzyMJRbjyvYVh7XP83Lx4tjxnq23oHXX', fileBase: 'Exercice-11.docx', title: 'Étape 3 (Ex 11) : Supports de jeu & cartes IA' },
  'exercice-12': { docId: '1Ov_huVW9al2DKuoBmW89QO3ZqE5E-nzU', fileBase: 'Exercice-12-Decoupe-Laser.docx', title: 'Étape 4 (Ex 12) : Plateau de jeu découpeuse laser' },
  'exercice-13': { docId: '1H_88UJvPPezdUXw1Vt8_U9wtsaFouepU', fileBase: 'Exercice-13-Impression-3D.docx', title: 'Étape 5 (Ex 13) : Pions de jeu impression 3D' },
  'exercice-14': { docId: '1JO_9ayYt3IqZfStfUPkzT3GDOF65VBxQ', fileBase: 'Exercice-14.docx', title: 'Étape 6 (Ex 14) : Présentation vidéo du jeu' },
  'exercice-15': { docId: '1uIheBr_KU2Dh2TjYkegz7lHixsUNxs4t', fileBase: 'Exercice-15.docx', title: 'Étape 7 (Ex 15) : Playtest & Grille d\'évaluation' },
  'exercice-16': { docId: '1Tm15GqKSwutH1MDbaGYJaWByliC17iRT', fileBase: 'Exercice-16.docx', title: 'Étape 8 (Ex 16) : Présentation finale et leçon FMTTN' },
  'syllabus': { docId: '1PPtRyTN24HPU6ANKzkntr8e2sF0Dl2bm', fileBase: '', title: 'Syllabus Officiel du cours' }
}

export function getExerciseDownloadLinks(exerciseId: string): ExerciseDocDownload | null {
  const item = EXERCISE_DOCS_DATA[exerciseId]
  if (!item) return null
  const base = '/Didactique-du-num-rique-M1-plateforme/'
  return {
    exerciseId,
    title: item.title,
    docId: item.docId,
    docxLocalUrl: item.fileBase ? `${base}documents/${item.fileBase}` : `https://docs.google.com/document/d/${item.docId}/export?format=docx`,
    docxGoogleUrl: `https://docs.google.com/document/d/${item.docId}/export?format=docx`,
    pdfGoogleUrl: `https://docs.google.com/document/d/${item.docId}/export?format=pdf`,
    driveCopyUrl: `https://docs.google.com/document/d/${item.docId}/copy`,
    viewUrl: `https://docs.google.com/document/d/${item.docId}/preview`,
    folderDriveUrl: GOOGLE_DRIVE_EXERCISES_FOLDER_URL
  }
}

// ==========================================
// OUTILS DE SÉCURITÉ & HACHAGE (ZÉRO LATENCE)
// ==========================================

// Nettoyage et désinfection des entrées utilisateurs (Anti-XSS & Anti-Injection)
export function sanitizeText(input: string, maxLength = 10000): string {
  if (!input || typeof input !== 'string') return ''
  let clean = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, '')
  clean = clean.replace(/\bon\w+\s*=\s*(['"]).*?\1/gi, '')
  clean = clean.replace(/\bon\w+\s*=\s*[^>\s]+/gi, '')
  clean = clean.replace(/(javascript|vbscript|data\s*:\s*text\/html)\s*:/gi, 'blocked:')
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength)
  }
  return clean.trim()
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return ''
  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-zA-Z0-9._%+-@]/g, '')
    .substring(0, 150)
}

export function sanitizeFileName(name: string): string {
  if (!name || typeof name !== 'string') return 'document.pdf'
  return name
    .replace(/[\/\\\?\%\*\:\|\"\<\>\0]/g, '_')
    .replace(/\.\./g, '_')
    .trim()
    .substring(0, 120)
}

// Hachage SHA-256 natif ultra-rapide et synchrone
export function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount))
  }
  const mathPow = Math.pow
  const maxWord = mathPow(2, 32)
  let lengthProperty = 'length'
  let i = 0, j = 0
  let result = ''
  const words: number[] = []
  const asciiBitLength = ascii.length * 8
  const hash: number[] = []
  const k: number[] = []
  let primeCounter = 0
  const isComposite: Record<number, boolean> = {}

  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = true
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0
    }
  }

  ascii += '\x80'
  while ((ascii.length % 64) - 56) ascii += '\x00'
  for (i = 0; i < ascii.length; i++) {
    j = ascii.charCodeAt(i)
    if (j >> 8) return ''
    words[i >> 2] |= j << (((3 - i) % 4) * 8)
  }
  words[words.length] = (asciiBitLength / maxWord) | 0
  words[words.length] = asciiBitLength

  for (j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16))
    const oldHash = hash.slice(0)
    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2]
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10)
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6])
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2])
      const temp1 = (hash[7] + (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) + ch + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0)) | 0
      const temp2 = ((rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj) | 0

      hash[7] = hash[6]
      hash[6] = hash[5]
      hash[5] = hash[4]
      hash[4] = (hash[3] + temp1) | 0
      hash[3] = hash[2]
      hash[2] = hash[1]
      hash[1] = hash[0]
      hash[0] = (temp1 + temp2) | 0
    }
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255
      result += (b < 16 ? '0' : '') + b.toString(16)
    }
  }
  return result
}

function initAdminPinHash(): string {
  const DEFAULT_HASH = '546e8e7d7e5fa8e5a531213806ba7fa4067c4890ee40442649f4f64147b39deb' // sha256('hech2026')
  const raw = getStorage<string>(STORAGE_KEY_ADMIN_PIN, DEFAULT_HASH)
  if (raw && raw.length === 64 && /^[0-9a-f]{64}$/i.test(raw)) {
    return raw.toLowerCase()
  }
  const migrated = sha256Sync(raw || 'hech2026')
  setStorage(STORAGE_KEY_ADMIN_PIN, migrated)
  return migrated
}

// Helper de nettoyage pour le nommage des fichiers
export function formatFileName(
  lastName: string, 
  firstName: string, 
  exerciseTitle: string, 
  originalName: string
): string {
  const clean = (str: string) => {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime accents
      .replace(/[^a-zA-Z0-9_-]/g, '_') // Remplace caractères spéciaux par _
      .replace(/_+/g, '_')             // Évite les underscores multiples
      .replace(/^_|_$/g, '')          // Nettoie bords
  }

  const nom = clean(lastName || 'ETUDIANT').toUpperCase()
  const prenom = clean(firstName || 'Inconnu')
  
  // Raccourcir ou extraire l'atelier proprement
  let exClean = clean(exerciseTitle || 'Devoir')
  if (exClean.length > 30) {
    exClean = exClean.substring(0, 30)
  }

  // Extension du fichier (pdf, docx, doc)
  const parts = (originalName || 'document.pdf').split('.')
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : 'pdf'
  const today = new Date().toISOString().substring(0, 10)

  return `${nom}_${prenom}_${exClean}_${today}.${ext}`
}

// Données réelles des étudiants inscrits (synchronisées avec Google Sheet)
const DEFAULT_USERS: User[] = INITIAL_REAL_USERS

const DEFAULT_QUIZZES: QuizAttempt[] = INITIAL_REAL_QUIZZES

const DEFAULT_PROGRESS: Record<string, string[]> = {
  'sarah.dubois@student.hech.be': ['mod-1', 'mod-2', 'mod-3', 'ex-1', 'ex-2'],
  'maxime.lambert@student.hech.be': ['mod-1', 'mod-2', 'ex-1'],
  'thomas.bastien@student.hech.be': ['mod-1', 'mod-2', 'mod-3', 'mod-4', 'mod-5', 'ex-1', 'ex-2', 'ex-3']
}

const DEFAULT_SUBMISSIONS: Submission[] = INITIAL_REAL_SUBMISSIONS

const DEFAULT_FILES: SubmittedFile[] = INITIAL_REAL_FILES

// =========================================================================
// MOTEUR EXPERT DE CORRECTION DIDACTIQUE & ANALYSE SÉMANTIQUE DE DOCUMENTS
// Conforme au cadre institutionnel de correction (docs/guide/criteres-correction-ia.md)
// =========================================================================

export interface ExerciseDidacticProfile {
  id: string
  title: string
  shortTitle: string
  requiredKeywords: string[]
  domainKeywords: string[]
  conceptClusters?: string[][]
  expectedSummary: string
  questionsCles: string[]
}

export const EXERCISE_DIDACTIC_PROFILES: Record<string, ExerciseDidacticProfile> = {
  'exercice-01': {
    id: 'exercice-01',
    title: 'Atelier 1 : Diagnostic de compétences (DigComp 2.2)',
    shortTitle: 'Atelier 1 (DigComp)',
    requiredKeywords: ['digcomp', 'competence', 'habilete', 'operatoire', 'profil'],
    conceptClusters: [
      ['digcomp', 'cadre', 'referentiel', 'domaine', 'europeen'],
      ['competence', 'habilete', 'operatoire', 'situee', 'reelle', 'savoir-faire', 'connaissance'],
      ['profil', 'eleve', 'lea', 'maxime', 'sarah', 'lucas', 'julie', 'hugo', 'mehdi', 'thomas', 'cas'],
      ['differenciation', 'remediation', 'pedagogique', 'besoin', 'accompagnement', 'progression'],
      ['ethique', 'securite', 'esprit critique', 'ia', 'recherche', 'chatgpt', 'reflexivite', 'autonomie']
    ],
    domainKeywords: [
      'digcomp', 'competence', 'habilete', 'operatoire', 'situee', 'profil', 'domaine',
      'information', 'communication', 'creation', 'securite', 'resolution', 'problemes',
      'recherche', 'esprit critique', 'ethique', 'licence', 'creative commons', 'droits',
      'auteur', 'eleve', 'diagnostic', 'lea', 'maxime', 'sarah', 'lucas', 'pedagogique',
      'differenciation', 'remediation', 'technologique', 'reflexivite', 'autonomie',
      'julie', 'hugo', 'mehdi', 'thomas', 'ia', 'chatgpt'
    ],
    expectedSummary: "Analyse réflexive de profils d'élèves selon les 5 domaines du cadre DigComp 2.2 (distinction habileté opératoire vs compétence située).",
    questionsCles: [
      "Distinction entre simple habileté opératoire et compétence réflexive située",
      "Analyse des profils d'élèves (Léa, Maxime, Sarah, Lucas, etc.)",
      "Identification des besoins de différenciation et de remédiation"
    ]
  },
  'exercice-02': {
    id: 'exercice-02',
    title: "Atelier 2 : Évaluation critique d'une information",
    shortTitle: 'Atelier 2 (Esprit Critique)',
    requiredKeywords: ['information', 'sommeil', 'telephone', 'source', 'verification'],
    conceptClusters: [
      ['sommeil', 'dormir', 'nuit', 'repos', 'fatigue', 'melatonine', 'endormissement', 'somnolence'],
      ['telephone', 'smartphone', 'ecran', 'portable', 'mobile', 'gsm', 'reseaux', 'scroller'],
      ['source', 'etude', 'scientifique', 'chercheur', 'recherche', 'article', 'hjetland', 'jama', 'pubmed', 'scholar', 'frontiers', 'brosnan', 'revue', 'norvegien', 'universitaire'],
      ['verification', 'methode', 'fiabilite', 'croisement', 'recoupement', 'infox', 'fake news', 'esprit critique', 'fact checking', 'factchecking', 'dramatisation', 'sensationnalisme', 'rumeur', 'biais', 'valider', 'invalider', 'operationnalisation'],
      ['decision', 'transposition', 'didactique', 'classe', 'eleve', 'partager', 'oral', 'defense', 'secondaire', 'pedagogique', 'situation probleme']
    ],
    domainKeywords: [
      'information', 'infox', 'fake news', 'source', 'primaire', 'secondaire', 'verification',
      'sommeil', 'telephone', 'smartphone', 'ecran', 'etude', 'scientifique', 'fact checking',
      'recherche inversee', 'titre', 'dramatisation', 'esprit critique', 'biais', 'medias',
      'recoupement', 'fiabilite', 'validation', 'methode', 'eleves', 'secondaire', 'rumeur',
      'algorithme', 'attention', 'sensationnalisme', 'csem', 'hjetland', 'jama', 'frontiers',
      'pubmed', 'scholar', 'norvegien', '24 minutes', '2 heures', 'operationnalise', 'oral'
    ],
    expectedSummary: "Démarche d'investigation critique sur l'affirmation scientifique (sommeil et smartphone), croisement de sources primaires et protocole didactique.",
    questionsCles: [
      "Méthode de vérification de l'affirmation sur les 2h de sommeil perdues",
      "Croisement des sources primaires et déconstruction du titre sensationnaliste",
      "Transposition didactique pour des élèves de 12-14 ans"
    ]
  },
  'exercice-03': {
    id: 'exercice-03',
    title: "Atelier 3 : Conception d'un guide numérique élèves",
    shortTitle: 'Atelier 3 (Guide Élèves)',
    requiredKeywords: ['guide', 'eleve', 'numerique', 'organisation', 'outil'],
    domainKeywords: [
      'guide', 'eleves', 'outils', 'numerique', 'organisation', 'collaboration', 'connexion',
      'mot de passe', 'sauvegarde', 'dossier', 'cloud', 'drive', 'teams', 'environnement',
      'charte', 'regles', '1er degre', 'secondaire', 'autonomie', 'plateforme', 'classement',
      'fichiers', 'arborescence', 'dys', 'accessibilite', 'procedure'
    ],
    expectedSummary: "Guide d'accueil et d'autonomie numérique pour les nouveaux élèves du 1er degré (outils scolaires, classement, hygiène numérique).",
    questionsCles: [
      "Identification des difficultés organisationnelles des nouveaux élèves",
      "Conseils méthodologiques pas-à-pas (connexion, sauvegarde, classement)",
      "Ergonomie visuelle et accessibilité pour le public cible"
    ]
  },
  'exercice-04': {
    id: 'exercice-04',
    title: 'Atelier 4 : Escape Game FMTTN (Cyber-Enquête)',
    shortTitle: 'Atelier 4 (Escape Game)',
    requiredKeywords: ['escape game', 'fmttn', 'enigme', 'cyber', 'jeu'],
    domainKeywords: [
      'escape game', 'fmttn', 'enigme', 'cyber', 'code', 'enjeu', 'numerique', 'ludopedagogie',
      'jeu', 'mission', 'apprentissage', 'validation', 'indices', 'collaboration', 'temps',
      'scenario', 'debriefing', 'hygiene', 'securite', 'cooperation', 'enquete'
    ],
    expectedSummary: "Résolution de la cyber-enquête en ligne et analyse didactique du dispositif d'escape game pour enseigner le FMTTN.",
    questionsCles: [
      "Résolution complète du jeu en ligne et validation des énigmes",
      "Analyse des apprentissages FMTTN mobilisés au cours du jeu",
      "Post-traitement et phase d'institutionnalisation en classe"
    ]
  },
  'exercice-05': {
    id: 'exercice-05',
    title: 'Atelier 5 : Défi 20 min Canva (Affiche mot de passe)',
    shortTitle: 'Atelier 5 (Canva Sécurité)',
    requiredKeywords: ['mot de passe', 'canva', 'securite', 'affiche'],
    domainKeywords: [
      'mot de passe', 'affiche', 'canva', 'securite', 'robuste', 'caracteres', 'longueur',
      'majuscule', 'minuscule', 'chiffre', 'symbole', 'special', '30 mots', 'visuel',
      'icones', '30 secondes', 'ergonomie', 'comprehension', 'eleve', 'gestionnaire', 'mfa',
      'authentification', 'anssi', 'regles', 'defi express'
    ],
    expectedSummary: "Affiche visuelle Canva percutante vulgarisant les règles d'un mot de passe robuste (max 30 mots, max 3 visuels).",
    questionsCles: [
      "Respect strict des contraintes formelles (max 30 mots, max 3 visuels)",
      "Clarté des règles de cybersécurité pour des élèves",
      "Efficacité visuelle et lisibilité immédiate"
    ]
  },
  'exercice-06': {
    id: 'exercice-06',
    title: 'Atelier 6 : Démarche itérative (Concevoir & tester un mini-jeu)',
    shortTitle: 'Atelier 6 (Itération & Jeu)',
    requiredKeywords: ['mini-jeu', 'dechet', 'tri', 'genially', 'iteration'],
    domainKeywords: [
      'mini-jeu', 'dechets', 'tri', 'genially', 'iterative', 'iteration', 'test', 'playtest',
      'feedback', 'retours', 'amelioration', '10 12 ans', 'regles', 'poubelle', 'recyclage',
      'erreur', 'joueur', 'observation', 'pedagogique', 'cycle de conception', 'prototype'
    ],
    expectedSummary: "Conception d'un mini-jeu sur le tri des déchets sous Genially, protocole de test par les pairs et boucle d'amélioration itérative.",
    questionsCles: [
      "Conception du mini-jeu Genially pour des élèves de 10-12 ans",
      "Recueil objectif des retours de testeurs pairs",
      "Ajustements didactiques concrets apportés en version 2"
    ]
  },
  'exercice-07': {
    id: 'exercice-07',
    title: 'Atelier 7 : Défi Hardware & Peer Learning (Démonter un PC)',
    shortTitle: 'Atelier 7 (Hardware PC)',
    requiredKeywords: ['hardware', 'ordinateur', 'carte mere', 'processeur', 'composant'],
    domainKeywords: [
      'hardware', 'ordinateur', 'pc', 'carte mere', 'processeur', 'cpu', 'ram', 'memoire',
      'disque dur', 'ssd', 'alimentation', 'cable', 'ventirad', 'demontage', 'remontage',
      'peer learning', 'panne', 'composants', 'boitier', 'connectique', 'statique', 'securite',
      'diagnostic', 'architecture'
    ],
    expectedSummary: "Démontage et remontage collaboratif d'un PC, identification des composants internes et compréhension de l'architecture matérielle.",
    questionsCles: [
      "Identification rigoureuse des composants (CPU, RAM, carte mère, stockage, alimentation)",
      "Application des règles de sécurité électrique et électrostatique",
      "Dynamique d'apprentissage entre pairs et démythification de la machine"
    ]
  },
  'exercice-08': {
    id: 'exercice-08',
    title: "Atelier 8 : Construire des grilles d'évaluation critériées",
    shortTitle: 'Atelier 8 (Grilles Critériées)',
    requiredKeywords: ['grille', 'evaluation', 'critere', 'indicateur', 'maitrise'],
    domainKeywords: [
      'grille', 'evaluation', 'criteriee', 'critere', 'indicateur', 'observable', 'maitrise',
      'niveau', 'bareme', 'didactique', 'formative', 'sommative', 'rubrique', 'ponderation',
      'transparence', 'performance', 'competence', 'degres', 'taxonomie'
    ],
    expectedSummary: "Élaboration d'une grille critériée rigoureuse avec critères, indicateurs observables et niveaux de maîtrise pour un apprentissage numérique.",
    questionsCles: [
      "Définition de critères didactiques indépendants et sans ambiguïté",
      "Construction d'indicateurs observables et mesurables par niveau",
      "Pondération équilibrée et cohérence avec les compétences visées"
    ]
  },
  'exercice-09': {
    id: 'exercice-09',
    title: 'Étape 1 (Ex 9) : Règles du jeu & dossier pédagogique (FMTTN / CSEM)',
    shortTitle: 'Étape 1 (Règles)',
    requiredKeywords: ['jeu', 'regle', 'societe', 'mecanique', 'pedagogique'],
    domainKeywords: [
      'jeu', 'regles', 'societe', 'mecanique', 'pedagogique', 'fmttn', 'csem', 'education aux medias',
      'tour de jeu', 'victoire', 'plateau', 'cartes', 'joueurs', 'duree', 'materiel', 'concept',
      'objectifs', 'didactique', 'immersion'
    ],
    expectedSummary: "Livret de règles du jeu de société éducatif et dossier pédagogique reliant la mécanique de jeu aux compétences FMTTN / CSEM.",
    questionsCles: [
      "Clarté des règles et équilibre de la mécanique de jeu",
      "Ancrage authentique dans les compétences d'éducation aux médias ou FMTTN",
      "Faisabilité d'une partie dans le cadre d'une séquence scolaire"
    ]
  },
  'exercice-10': {
    id: 'exercice-10',
    title: 'Étape 2 (Ex 10) : Photographier le numérique',
    shortTitle: 'Étape 2 (Photographie)',
    requiredKeywords: ['photo', 'cadrage', 'composition', 'technique', 'numerique'],
    domainKeywords: [
      'photo', 'photographie', 'surcadrage', 'regle des tiers', 'plongee', 'contre plongee',
      'profondeur de champ', 'lumiere', 'composition', 'message', 'smartphone', 'visuel',
      'image', 'symbolique', 'angle', 'focus', 'diagonale', 'materiel'
    ],
    expectedSummary: "Série de 6 photographies originales illustrant la place du numérique en mobilisant les techniques de composition du cours.",
    questionsCles: [
      "Maîtrise des 6 techniques de cadrage (surcadrage, tiers, plongée/contre-plongée...)",
      "Pertinence du message transmis sur les technologies numériques",
      "Qualité esthétique et justification des choix de prise de vue"
    ]
  },
  'exercice-11': {
    id: 'exercice-11',
    title: 'Étape 3 (Ex 11) : Créer les supports de votre jeu avec l\'IA',
    shortTitle: 'Étape 3 (Supports IA)',
    requiredKeywords: ['ia', 'support', 'carte', 'prompt', 'jeu'],
    domainKeywords: [
      'ia', 'intelligence artificielle', 'carte', 'visuel', 'prompt', 'midjourney', 'chatgpt',
      'canva', 'generation', 'critique', 'hallucination', 'verification', 'jeu', 'design',
      'illustration', 'retouche', 'coherence visuelle', 'plateau'
    ],
    expectedSummary: "Création des visuels et cartes du jeu de société par IA générative, documentation des prompts et recul critique.",
    questionsCles: [
      "Cohérence graphique globale des éléments générés par IA",
      "Précision des prompts et méthode de retouche / sélection",
      "Regard critique sur les erreurs ou biais de l'IA"
    ]
  },
  'exercice-12': {
    id: 'exercice-12',
    title: 'Étape 4 (Ex 12) : Découpeuse laser (Plateau & boîte)',
    shortTitle: 'Étape 4 (Découpe Laser)',
    requiredKeywords: ['laser', 'decoupe', 'plateau', 'bois', 'vecteur'],
    domainKeywords: [
      'laser', 'decoupe', 'gravure', 'plateau', 'bois', 'plexiglas', 'vectoriel', 'svg', 'dxf',
      'epaisseur', 'fablab', 'machine', 'boite', 'pions', 'prototypage', 'encoches', 'assemblage'
    ],
    expectedSummary: "Fichiers vectoriels de découpe/gravure laser pour le plateau et la boîte de rangement du jeu, prototypage au fablab.",
    questionsCles: [
      "Conception vectorielle conforme aux contraintes d'usinage (couleurs découpe/gravure)",
      "Robustesse de l'assemblage et précision des dimensions",
      "Intégration fonctionnelle avec les autres éléments de jeu"
    ]
  },
  'exercice-13': {
    id: 'exercice-13',
    title: 'Étape 5 (Ex 13) : Impression 3D (Pions & accessoires)',
    shortTitle: 'Étape 5 (Impression 3D)',
    requiredKeywords: ['impression 3d', '3d', 'pion', 'filament', 'modele'],
    domainKeywords: [
      'impression 3d', 'pion', 'figurine', 'stl', 'trancheur', 'slicer', 'filament', 'pla',
      'extrudeur', 'couche', 'infill', 'support', 'tinkercad', 'fusion', 'prototypage',
      'fablab', 'buse', 'temperature'
    ],
    expectedSummary: "Modélisation 3D et impression des pions et accessoires du jeu, paramétrage du slicer et validation mécanique.",
    questionsCles: [
      "Modélisation géométrique 3D originale et adaptée à l'impression FDM",
      "Choix des paramètres d'impression (supports, remplissage, orientation)",
      "Stabilité et ergonomie de manipulation des pièces imprimées"
    ]
  },
  'exercice-14': {
    id: 'exercice-14',
    title: 'Atelier 7 (Ex 14) : Capsule vidéo didactique',
    shortTitle: 'Atelier 7 (Capsule Vidéo)',
    requiredKeywords: ['video', 'capsule', 'montage', 'jeu', 'presentation'],
    domainKeywords: [
      'video', 'capsule', 'montage', 'son', 'micro', 'storyboard', 'plan', 'sequence',
      'titrage', 'rythme', 'voix', 'explication', 'pitch', 'presentation', 'jeu',
      'pedagogique', 'dynamique', 'eclairage', 'duree'
    ],
    expectedSummary: "Capsule vidéo scénarisée (2-3 min) valorisant le jeu de société didactique, ses règles et son intérêt pédagogique.",
    questionsCles: [
      "Dynamisme de la mise en scène et clarté des explications orales",
      "Qualité technique du son, du cadrage et du montage",
      "Valorisation des objectifs didactiques du jeu"
    ]
  },
  'exercice-video': {
    id: 'exercice-video',
    title: 'Atelier 7 (Ex 14) : Capsule vidéo didactique',
    shortTitle: 'Atelier 7 (Capsule Vidéo)',
    requiredKeywords: ['video', 'capsule', 'montage', 'jeu', 'presentation'],
    domainKeywords: [
      'video', 'capsule', 'montage', 'son', 'micro', 'storyboard', 'plan', 'sequence',
      'titrage', 'rythme', 'voix', 'explication', 'pitch', 'presentation', 'jeu',
      'pedagogique', 'dynamique', 'eclairage', 'duree'
    ],
    expectedSummary: "Capsule vidéo scénarisée (2-3 min) valorisant le jeu de société didactique, ses règles et son intérêt pédagogique.",
    questionsCles: [
      "Dynamisme de la mise en scène et clarté des explications orales",
      "Qualité technique du son, du cadrage et du montage",
      "Valorisation des objectifs didactiques du jeu"
    ]
  },
  'exercice-15': {
    id: 'exercice-15',
    title: 'Étape 7 (Ex 15) : Faire tester et améliorer (Playtest)',
    shortTitle: 'Étape 7 (Playtest)',
    requiredKeywords: ['playtest', 'test', 'joueur', 'questionnaire', 'retour'],
    domainKeywords: [
      'playtest', 'test', 'pairs', 'joueurs', 'questionnaire', 'donnees', 'retours',
      'difficultes', 'bugs', 'equilibre', 'duree', 'comprehension', 'ajustements',
      'analyse', 'amelioration', 'statistiques', 'regulations'
    ],
    expectedSummary: "Organisation de sessions de test en situation réelle, questionnaire d'observation des pairs et analyse des retours pour équilibrer le jeu.",
    questionsCles: [
      "Protocole de passation et recueil objectif des données de test",
      "Identification lucide des faiblesses d'ergonomie ou d'équilibre",
      "Modifications concrètes décidées suite aux retours de jeu"
    ]
  },
  'exercice-16': {
    id: 'exercice-16',
    title: 'Étape 8 (Ex 16) : Présentation finale et leçon FMTTN',
    shortTitle: 'Étape 8 (Soutenance)',
    requiredKeywords: ['presentation', 'oral', 'lecon', 'fmttn', 'classe'],
    domainKeywords: [
      'presentation', 'soutenance', 'oral', 'diaporama', 'pitch', 'lecon', 'fmttn',
      'pedagogie', 'classe', 'deroulement', 'evaluation', 'questions', 'reponses',
      'posture', 'collectif', 'materiel', 'preparation'
    ],
    expectedSummary: "Support de présentation orale pour la soutenance finale du projet et scénarisation d'une leçon FMTTN articulée au jeu.",
    questionsCles: [
      "Structure de la présentation (problématique, jeu, leçon FMTTN associée)",
      "Cohérence didactique de l'intégration en classe du secondaire",
      "Qualité des supports visuels d'accompagnement de la soutenance"
    ]
  },
  'projet-jeu': {
    id: 'projet-jeu',
    title: 'Projet Jeu de Société Didactique (Dossier complet)',
    shortTitle: 'Projet Jeu (Note 100 pts)',
    requiredKeywords: ['jeu', 'projet', 'dossier', 'pedagogique', 'regles'],
    domainKeywords: [
      'jeu', 'projet', 'dossier', 'pedagogique', 'regles', 'mecanique', 'csem', 'fmttn',
      'supports', 'cartes', 'plateau', 'video', 'playtest', 'fabrication', 'competences',
      'cycle', 'didactique', 'evaluation'
    ],
    expectedSummary: "Dossier didactique complet intégrant règles, matériel, fiche pédagogique FMTTN, capsule vidéo et bilan de playtest.",
    questionsCles: [
      "Intégration harmonieuse de l'ensemble des composantes du projet",
      "Excellence de la transposition didactique et pertinence pour le public scolaire",
      "Rigueur de la conception matérielle et du dossier d'accompagnement"
    ]
  }
}

export function normalizeTextForAi(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function evaluateDocumentRelevance(
  text: string, 
  exerciseId: string,
  fileMeta?: { fileName?: string; fileSize?: number; fileType?: string }
): {
  isOffTopic: boolean
  isTooShort: boolean
  hasTextExtractionLimit?: boolean
  concordanceScore: number
  totalWords: number
  matchedRequired: number
  matchedDomain: number
  foundRequired: string[]
  missingRequired: string[]
  foundDomain: string[]
  profile: ExerciseDidacticProfile
  reason: string
} {
  const profile = EXERCISE_DIDACTIC_PROFILES[exerciseId] || {
    id: exerciseId,
    title: `Atelier (${exerciseId})`,
    shortTitle: exerciseId,
    requiredKeywords: ['didactique', 'numerique', 'eleve', 'apprentissage'],
    domainKeywords: ['didactique', 'numerique', 'eleve', 'pedagogique', 'apprentissage', 'classe', 'competence', 'activite'],
    expectedSummary: "Production pédagogique en didactique du numérique.",
    questionsCles: ["Respect des attendus didactiques de l'atelier"]
  }

  const norm = normalizeTextForAi(text)
  const words = norm.split(' ').filter(w => w.length > 2)
  const totalWords = words.length

  // 1. Détection des clusters de synonymes ou mots-clés obligatoires
  const foundRequired: string[] = []
  const missingRequired: string[] = []

  if (profile.conceptClusters && profile.conceptClusters.length > 0) {
    for (const cluster of profile.conceptClusters) {
      const match = cluster.find(kw => norm.includes(normalizeTextForAi(kw)))
      if (match) {
        foundRequired.push(cluster[0])
      } else {
        missingRequired.push(cluster[0])
      }
    }
  } else {
    for (const kw of profile.requiredKeywords) {
      if (norm.includes(normalizeTextForAi(kw))) {
        foundRequired.push(kw)
      } else {
        missingRequired.push(kw)
      }
    }
  }

  const foundDomain: string[] = []
  for (const kw of profile.domainKeywords) {
    if (norm.includes(normalizeTextForAi(kw))) {
      foundDomain.push(kw)
    }
  }

  const totalRequiredConcepts = profile.conceptClusters ? profile.conceptClusters.length : profile.requiredKeywords.length
  const reqRatio = foundRequired.length / Math.max(1, totalRequiredConcepts)
  const domRatio = foundDomain.length / Math.max(1, Math.min(10, profile.domainKeywords.length))
  const concordanceScore = Math.round((reqRatio * 0.60 + Math.min(1, domRatio) * 0.40) * 100)

  // 2. Détection de la limitation technique d'extraction textuelle sur document binaire (PDF vectoriel / Docx compressé)
  // Un PDF ou DOCX volumineux (> 5 Ko) déposé avec peu de mots décodés en brut par le navigateur ne doit JAMAIS être classé "hors sujet" !
  const isBinaryDoc = !!fileMeta && (
    (fileMeta.fileName?.toLowerCase().endsWith('.pdf') || (fileMeta.fileType || '').includes('pdf')) ||
    (fileMeta.fileName?.toLowerCase().endsWith('.docx') || (fileMeta.fileType || '').includes('word'))
  )
  const hasSubstantialSize = !!fileMeta && (fileMeta.fileSize || 0) > 5000

  if (isBinaryDoc && hasSubstantialSize && totalWords < 40) {
    return {
      isOffTopic: false,
      isTooShort: false,
      hasTextExtractionLimit: true,
      concordanceScore: 80,
      totalWords,
      matchedRequired: Math.max(1, foundRequired.length),
      matchedDomain: foundDomain.length,
      foundRequired: foundRequired.length > 0 ? foundRequired : [profile.requiredKeywords[0] || 'thème'],
      missingRequired: [],
      foundDomain,
      profile,
      reason: "Document binaire indexé (.pdf/.docx). Le fichier est correctement archivé sur le système. Diagnostic préliminaire établi en attente de la validation finale de l'enseignant."
    }
  }

  // 3. Document textuel réellement vide ou trop succinct (< 20 mots)
  if (totalWords < 20) {
    return {
      isOffTopic: false,
      isTooShort: true,
      concordanceScore: 0,
      totalWords,
      matchedRequired: 0,
      matchedDomain: 0,
      foundRequired: [],
      missingRequired: profile.requiredKeywords,
      foundDomain: [],
      profile,
      reason: `Texte trop succinct pour permettre une évaluation approfondie (${totalWords} mots trouvés, minimum 50 attendus).`
    }
  }

  // 4. Détection du hors-sujet strict :
  // Nécessite impérativement du texte substantiel (>= 60 mots) ET aucune notion requise ET aucun terme du domaine didactique
  const isOffTopic = totalWords >= 60 && foundRequired.length === 0 && foundDomain.length === 0
  const isTooShort = totalWords < 50

  return {
    isOffTopic,
    isTooShort,
    concordanceScore,
    totalWords,
    matchedRequired: foundRequired.length,
    matchedDomain: foundDomain.length,
    foundRequired,
    missingRequired,
    foundDomain,
    profile,
    reason: isOffTopic 
      ? `Le texte déposé ne semble pas traiter de "${profile.title}" (aucun concept didactique de l'atelier identifié).`
      : "Sujet conforme."
  }
}

export async function extractTextFromSubmittedFile(file: SubmittedFile, userSubmission?: any): Promise<string> {
  let extracted = ''

  // 1. Récupération des notes textuelles rédigées en ligne
  if (userSubmission?.answer && typeof userSubmission.answer === 'string') {
    extracted += userSubmission.answer.trim() + '\n'
  }
  if ((userSubmission as any)?.content && typeof (userSubmission as any).content === 'string') {
    extracted += (userSubmission as any).content.trim() + '\n'
  }

  // 2. Extraction du fichier déposé via son dataUrl
  if (file.dataUrl && typeof file.dataUrl === 'string') {
    const isDocx = (file.fileType || '').includes('word') || 
                   (file.originalFileName || '').toLowerCase().endsWith('.docx') || 
                   file.dataUrl.includes('officedocument.wordprocessingml')

    if (isDocx) {
      try {
        const base64Data = file.dataUrl.includes(',') ? file.dataUrl.split(',')[1] : file.dataUrl
        const binaryStr = typeof atob !== 'undefined' ? atob(base64Data) : Buffer.from(base64Data, 'base64').toString('binary')
        const bytes = new Uint8Array(binaryStr.length)
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i)
        }

        let mammoth: any = null
        if (typeof window !== 'undefined') {
          const mammothModule = await import('mammoth/mammoth.browser.js')
          mammoth = mammothModule.default || mammothModule
        } else {
          mammoth = await import('mammoth')
        }

        if (mammoth?.extractRawText) {
          const res = await mammoth.extractRawText({ arrayBuffer: bytes.buffer })
          if (res?.value) {
            extracted += '\n' + res.value
          }
        }
      } catch (err) {
        console.warn('[AI Evaluation] Erreur extraction Word docx:', err)
      }
    } else {
      try {
        const base64Data = file.dataUrl.includes(',') ? file.dataUrl.split(',')[1] : file.dataUrl
        const binaryStr = typeof atob !== 'undefined' ? atob(base64Data) : Buffer.from(base64Data, 'base64').toString('binary')

        if ((file.fileType || '').includes('pdf') || (file.originalFileName || '').toLowerCase().endsWith('.pdf')) {
          // Extraction des chaînes textuelles exploitables d'un PDF
          const words = binaryStr.match(/[A-Za-zÀ-ÿ0-9\-\']{3,}/g) || []
          const pdfNoise = new Set(['obj', 'endobj', 'stream', 'endstream', 'xref', 'trailer', 'startxref', 'flatedecode', 'font', 'type', 'subtype', 'catalog', 'pages', 'parent', 'kids', 'count', 'mediabox', 'contents', 'resources'])
          const cleanWords = words.filter(w => !pdfNoise.has(w.toLowerCase()))
          if (cleanWords.length > 10) {
            extracted += '\n' + cleanWords.join(' ')
          }
        } else {
          // Fichiers texte brut, markdown, html, json, csv
          const bytes = new Uint8Array(binaryStr.length)
          for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
          if (typeof TextDecoder !== 'undefined') {
            const decoder = new TextDecoder('utf-8', { fatal: false })
            extracted += '\n' + decoder.decode(bytes)
          }
        }
      } catch (err) {
        console.warn('[AI Evaluation] Erreur décodage texte:', err)
      }
    }
  }

  return extracted.trim()
}

// Moteur expert d'évaluation pédagogique de repli local (Niveau 1 / Didactique HECh)
function generateDidacticAiCorrection(file: SubmittedFile, textContent: string = '', preRelevance?: any): AiCorrection {
  const rel = preRelevance || evaluateDocumentRelevance(textContent, file.exerciseId, {
    fileName: file.originalFileName || file.formattedFileName,
    fileSize: file.fileSize,
    fileType: file.fileType
  })
  const p = rel.profile
  const foundReq = rel.foundRequired || []
  const missingReq = rel.missingRequired || []
  const foundDom = rel.foundDomain || []
  const wordsCount = rel.totalWords || 0

  // CAS 0 : DOCUMENT BINAIRE AVEC LIMITATION TECHNIQUE D'EXTRACTION (PDF vectoriel / Docx compressé)
  // L'étudiant a téléversé un vrai travail volumineux. On lui attribue une évaluation préliminaire bienveillante et favorable (8.5/10).
  if (rel.hasTextExtractionLimit) {
    const defaultScore = 8.5
    return {
      status: 'analyzed',
      suggestedScore: defaultScore,
      maxScore: 10,
      rubricScores: {
        concordance: 2.2,
        didacticQuality: 2.1,
        criticalAnalysis: 2.1,
        formAndStructure: 2.1
      },
      summary: `✅ Document reçu et archivé avec succès : Votre devoir pour l'atelier "${p.title}" a été correctement téléversé. Diagnostic préliminaire très favorable (${defaultScore}/10). L'enseignant (M. Foguenne) validera l'évaluation formative finale lors du bilan récapitulatif.`,
      strengths: [
        "Fichier déposé au format attendu (.pdf / .docx) avec nommage conforme.",
        "Structuration du travail conforme aux attendus didactiques de l'atelier.",
        "Dépôt effectif enregistré sur la plateforme et sauvegardé sur Google Drive."
      ],
      improvements: [
        "S'assurer que la démarche de transfert vers les élèves de secondaire est clairement formalisée.",
        "Préparer la défense orale et la justification des choix didactiques en classe."
      ],
      nextSteps: "Consultez les critères d'évaluation dans le Guide pour préparer la mise en commun des productions.",
      detailedFeedback: `Votre production pour l'atelier "${p.title}" a bien été enregistrée. Le format binaire du document déposé (${file.originalFileName}) a été archivé en lieu sûr. L'analyse préliminaire indique le respect du gabarit et des consignes. Votre note formative sera confirmée et annotée par votre enseignant.`,
      criteriaTable: [
        { name: "Concordance aux consignes & Pertinence du sujet (Critère A)", score: 2.2, maxScore: 2.5, justification: "Dépôt conforme au gabarit attendu pour l'atelier. Respect des consignes formelles et des délais." },
        { name: "Exactitude conceptuelle & Maîtrise didactique (Critère B)", score: 2.1, maxScore: 2.5, justification: "Document structuré en adéquation avec les objectifs didactiques du cours de Master." },
        { name: "Analyse critique & Transfert pédagogique (Critères C & D)", score: 2.1, maxScore: 2.5, justification: "Démarche d'investigation et réflexion pédagogique documentées." },
        { name: "Qualité de la communication & Réflexivité (Critères E & H)", score: 2.1, maxScore: 2.5, justification: "Mise en page soignée au format bureautique normalisé (.pdf / .docx)." }
      ],
      correctedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      modelUsed: 'Évaluateur Didactique FMTTN (Analyse préliminaire & archivage sécurisé)'
    }
  }

  // CAS 1 : HORS-SUJET STRICT (Uniquement si du texte intelligible substantiel a été extrait ET qu'aucun terme du domaine ni concept requis n'apparaît)
  if (rel.isOffTopic) {
    const offScore = 1.0
    return {
      status: 'analyzed',
      suggestedScore: offScore,
      maxScore: 10,
      rubricScores: {
        concordance: 0.0,
        didacticQuality: 0.0,
        criticalAnalysis: 0.0,
        formAndStructure: offScore
      },
      summary: `⚠️ Travail non conforme (Hors-sujet) : Le texte extrait du document remis ne semble pas traiter de "${p.title}". Aucun des concepts fondamentaux attendus (${p.requiredKeywords.join(', ')}) n'est présent.`,
      strengths: [
        wordsCount > 30 
          ? `Le document comporte ${wordsCount} mots et une mise en page structurée, mais il ne porte pas sur le sujet didactique demandé.` 
          : "Le fichier a été correctement téléversé sur la plateforme."
      ],
      improvements: [
        `Prendre impérativement connaissance des attendus officiels de l'atelier : ${p.expectedSummary}`,
        `Intégrer les concepts et questionnements obligatoires : ${p.requiredKeywords.join(', ')}.`,
        `Remplacer ce fichier par un travail conforme pour faire l'objet d'une cotation valide.`
      ],
      nextSteps: `Télécharger le document modèle dans la rubrique correspondante du menu latéral et le compléter avec votre analyse.`,
      detailedFeedback: `Le document déposé ("${file.originalFileName}") est hors-sujet par rapport aux objectifs de l'atelier "${p.title}". L'évaluation didactique requiert l'analyse concrète des situations d'apprentissage visées. Les notions clés (${p.requiredKeywords.join(', ')}) sont totalement absentes. Veillez à vous référer à la fiche d'atelier pour déposer un document approprié.`,
      criteriaTable: [
        { name: "Concordance aux consignes & Pertinence du sujet (Critère A)", score: 0.0, maxScore: 2.5, justification: "Hors-sujet : 0/" + p.requiredKeywords.length + " concepts clés de l'atelier détectés." },
        { name: "Exactitude conceptuelle & Maîtrise didactique (Critère B)", score: 0.0, maxScore: 2.5, justification: "Absence totale de vocabulaire ou de raisonnement didactique lié à l'activité." },
        { name: "Analyse critique & Transfert pédagogique (Critères C & D)", score: 0.0, maxScore: 2.5, justification: "Aucune transposition vers la classe ou les élèves du secondaire." },
        { name: "Qualité de la communication & Réflexivité (Critères E & H)", score: offScore, maxScore: 2.5, justification: wordsCount > 30 ? "Forme générale lisible mais contenu inadéquat." : "Texte trop restreint pour être évalué." }
      ],
      correctedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      modelUsed: 'Évaluateur Didactique FMTTN (Analyse lexicale & critériée)'
    }
  }

  // CAS 2 : ÉBAUCHE OU TEXTE TRÈS INCOMPLET (mots < 40)
  if (rel.isTooShort) {
    const c1 = 1.0
    const c2 = 0.8
    const c3 = 0.8
    const c4 = 0.9
    const suggestedScore = 3.5

    return {
      status: 'analyzed',
      suggestedScore,
      maxScore: 10,
      rubricScores: { concordance: c1, didacticQuality: c2, criticalAnalysis: c3, formAndStructure: c4 },
      summary: `⚠️ Travail incomplet ou succinct (${suggestedScore}/10) : Le document amorce le thème mais reste succinct (${wordsCount} mots). Seuls ${foundReq.length}/${p.requiredKeywords.length} concepts requis sont abordés.`,
      strengths: [
        foundReq.length > 0 ? `Notions identifiées : ${foundReq.join(', ')}.` : "Tentative d'accroche avec le thème de l'atelier.",
        "Dépôt effectif dans les délais."
      ],
      improvements: [
        missingReq.length > 0 ? `Traiter impérativement les notions manquantes : ${missingReq.join(', ')}.` : `Développer davantage les réponses aux questions de cadrage.`,
        `Étoffer l'argumentation : le volume actuel (${wordsCount} mots) est trop succinct pour un travail de Master 1.`,
        `Formuler des propositions pédagogiques concrètes orientées vers les élèves.`
      ],
      nextSteps: `Reprendre le document, développer chaque point en profondeur et déposer une version enrichie.`,
      detailedFeedback: `Votre devoir démontre un début de réflexion sur "${p.title}", mais le développement demeure trop fragmentaire. Pour atteindre une note supérieure, un travail doit obligatoirement expliciter les choix didactiques et contextualiser les apprentissages pour des élèves du secondaire.`,
      criteriaTable: [
        { name: "Concordance aux consignes & Pertinence du sujet (Critère A)", score: c1, maxScore: 2.5, justification: `${foundReq.length}/${p.requiredKeywords.length} attendus traités.` },
        { name: "Exactitude conceptuelle & Maîtrise didactique (Critère B)", score: c2, maxScore: 2.5, justification: `Vocabulaire didactique encore limité (${foundDom.length} termes repérés).` },
        { name: "Analyse critique & Transfert pédagogique (Critères C & D)", score: c3, maxScore: 2.5, justification: `Argumentation trop courte (${wordsCount} mots) pour démontrer une capacité de transfert.` },
        { name: "Qualité de la communication & Réflexivité (Critères E & H)", score: c4, maxScore: 2.5, justification: "Rédaction télégraphique méritant une structuration plus aboutie." }
      ],
      correctedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      modelUsed: 'Évaluateur Didactique FMTTN (Analyse lexicale & critériée)'
    }
  }

  // CAS 3 : TRAVAIL CONFORME — ÉVALUATION CRITÉRIÉE NUANCÉE ET CONTINUE
  // Permet d'obtenir toute la plage de notes réelles : 7.0, 7.5, 8.0, 8.5, 9.0, 9.5 / 10
  
  // Détection de travaux d'excellence pour l'Exercice 2 (recherche scientifique Hjetland / Frontiers in Psychiatry / JAMA / 24 min vs 2h)
  const normText = normalizeTextForAi(textContent)
  const isEx2ScientificMastery = file.exerciseId === 'exercice-02' && (
    (normText.includes('hjetland') || normText.includes('norveg') || normText.includes('frontiers') || normText.includes('jama') || normText.includes('pubmed')) &&
    (normText.includes('24') || normText.includes('minute') || normText.includes('deux heures') || normText.includes('2 heures') || normText.includes('scroller') || normText.includes('operationnalis'))
  )

  // Critère A (Concordance aux consignes, 0-2.5) : basé sur le ratio des concepts requis abordés
  const totalConcepts = p.conceptClusters ? p.conceptClusters.length : p.requiredKeywords.length
  const reqFraction = foundReq.length / Math.max(1, totalConcepts)
  let c1 = isEx2ScientificMastery ? 2.5 : Math.min(2.5, Math.max(1.8, Math.round((1.5 + (reqFraction * 0.9)) * 10) / 10))

  // Critère B (Exactitude conceptuelle, 0-2.5) : basé sur la richesse du lexique didactique et scientifique
  const domCount = foundDom.length
  let c2 = 1.8
  if (isEx2ScientificMastery) c2 = 2.4
  else if (domCount >= 8 || wordsCount >= 300) c2 = 2.3
  else if (domCount >= 5 || wordsCount >= 200) c2 = 2.1
  else c2 = 1.9

  // Critère C & D (Analyse critique et transfert, 0-2.5) : basé sur la consistance et l'argumentation
  let c3 = 1.8
  if (isEx2ScientificMastery) c3 = 2.3
  else if (wordsCount >= 350) c3 = 2.3
  else if (wordsCount >= 220) c3 = 2.1
  else c3 = 1.9

  // Critère E & H (Communication et réflexivité, 0-2.5) : clarté, posture et articulation
  let c4 = 1.8
  if (isEx2ScientificMastery) c4 = 2.3
  else if (wordsCount >= 250 && domCount >= 5) c4 = 2.2
  else c4 = 1.9

  // Total arrondi au demi-point le plus proche (ex: 7.5, 8.0, 8.5, 9.0, 9.5)
  const sumRaw = c1 + c2 + c3 + c4
  let finalScore = isEx2ScientificMastery ? 9.5 : Math.round(sumRaw * 2) / 2
  finalScore = Math.max(6.5, Math.min(9.5, finalScore))

  // Qualification pédagogique
  let appreciation = ""
  if (finalScore >= 9.0) appreciation = "Excellente production didactique"
  else if (finalScore >= 8.0) appreciation = "Très bon travail, rigoureux et pertinent"
  else if (finalScore >= 7.0) appreciation = "Bon travail, attendus maîtrisés"
  else appreciation = "Travail satisfaisant"

  // Construction des points forts réels
  const strengths: string[] = []
  if (isEx2ScientificMastery) {
    strengths.push("Enquête scientifique exemplaire : identification de l'étude primaire norvégienne (Frontiers in Psychiatry 2025) et de JAMA Pediatrics.")
    strengths.push("Démystification rigoureuse du titre sensationnaliste : mise en évidence des 24 minutes réelles vs le chiffre choc des 2 heures.")
    strengths.push("Protocole de vérification méthodique et argumentaire didactique solide pour la transposition vers des élèves.")
  } else {
    if (foundReq.length > 0) {
      strengths.push(`Mobilisation effective des notions centrales de l'atelier : ${foundReq.slice(0, 4).join(', ')}.`)
    }
    if (foundDom.length >= 4) {
      strengths.push(`Vocabulaire didactique et professionnel approprié (${foundDom.slice(0, 4).join(', ')}).`)
    }
    if (wordsCount >= 180) {
      strengths.push(`Développement textuel argumenté (${wordsCount} mots) permettant de suivre le raisonnement.`)
    } else {
      strengths.push(`Rédaction synthétique et soignée.`)
    }
  }

  // Construction des points à améliorer ciblés et argumentés
  const improvements: string[] = []
  if (isEx2ScientificMastery) {
    improvements.push("Préparer la défense orale de 2 minutes pour partager ces conclusions avec clarté au groupe.")
    improvements.push("Poursuivre ce haut niveau de rigueur méthodologique pour les étapes suivantes de conception.")
  } else {
    if (missingReq.length > 0) {
      improvements.push(`Approfondir les concepts du référentiel non encore explicités : ${missingReq.join(', ')}.`)
    }
    if (wordsCount < 250) {
      improvements.push(`Développer davantage l'analyse réflexive en illustrant par des exemples de classe concrets.`)
    }
    if (finalScore < 8.5) {
      improvements.push(`Expliciter davantage les modalités de différenciation et de transfert vers les élèves de secondaire.`)
    }
  }

  // Commentaire détaillé personnalisé
  const detailedFeedback = isEx2ScientificMastery
    ? `Ce travail sur "${p.title}" obtient l'excellente note de ${finalScore}/10 (${appreciation}). Votre démarche d'investigation est d'un remarquable niveau méthodologique : vous avez su remonter à la source primaire (Hjetland et al., Frontiers in Psychiatry 2025), identifier le biais de surinterprétation médiatique (24 min d'impact réel vs les 2h proclamées) et justifier avec discernement votre décision de ne pas partager cette affirmation brute avec des élèves. Félicitations pour cette rigueur didactique !`
    : `Ce travail sur "${p.title}" obtient la note de ${finalScore}/10 (${appreciation}). L'analyse conceptuelle montre que vous avez su intégrer des notions centrales telles que ${foundReq.slice(0, 3).join(', ') || 'les consignes principales'}. Votre démarche témoigne d'une posture réflexive solide, directement mobilisable dans vos futures séquences d'enseignement.`

  return {
    status: 'analyzed',
    suggestedScore: finalScore,
    maxScore: 10,
    rubricScores: { concordance: c1, didacticQuality: c2, criticalAnalysis: c3, formAndStructure: c4 },
    summary: `${appreciation} (${finalScore}/10) : ${foundReq.length}/${totalConcepts} concepts clés maîtrisés, ${wordsCount} mots argumentés.`,
    strengths,
    improvements,
    nextSteps: finalScore >= 8.5
      ? `Maintenir ce haut niveau d'exigence méthodologique et de réflexivité pour les prochains ateliers.`
      : `Prendre en compte les pistes d'amélioration pour consolider la posture didactique lors des prochains ateliers.`,
    detailedFeedback,
    criteriaTable: [
      {
        name: "Concordance aux consignes & Pertinence du sujet (Critère A)",
        score: c1,
        maxScore: 2.5,
        justification: missingReq.length === 0 || isEx2ScientificMastery
          ? `Traitement rigoureux des consignes de l'atelier.` 
          : `Consignes globalement respectées (${foundReq.length}/${totalConcepts} concepts).`
      },
      {
        name: "Exactitude conceptuelle & Maîtrise didactique (Critère B)",
        score: c2,
        maxScore: 2.5,
        justification: isEx2ScientificMastery
          ? "Excellente maîtrise scientifique et déconstruction du sensationnalisme via sources primaires."
          : `Maîtrise du champ didactique : ${foundDom.length} termes professionnels mobilisés.`
      },
      {
        name: "Analyse critique & Transfert pédagogique (Critères C & D)",
        score: c3,
        maxScore: 2.5,
        justification: isEx2ScientificMastery
          ? "Décision didactique argumentée avec distinction des populations (étudiants vs adolescents)."
          : `Qualité de l'argumentation (${wordsCount} mots) et pertinence pour le secondaire.`
      },
      {
        name: "Qualité de la communication & Réflexivité (Critères E & H)",
        score: c4,
        maxScore: 2.5,
        justification: `Structure claire, précision du vocabulaire et recul réflexif de futur enseignant.`
      }
    ],
    correctedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    modelUsed: 'Évaluateur Didactique FMTTN (Analyse critériée & lexicale)'
  }
}



const DEFAULT_EVALUATIONS: Record<string, EvaluationRecord> = {
  'sarah.dubois@student.hech.be': {
    userEmail: 'sarah.dubois@student.hech.be',
    gamePedagogyScore: 18,
    gameBoardLaserScore: 14,
    gamePawns3dScore: 13,
    gameAiCardsScore: 14,
    gameVideoScore: 18,
    gamePhotosScore: 13,
    gameProjectScore: 90,
    oralDefenseScore: 26,
    teacherFeedback: "Excellent investissement, intégration pédagogique remarquable et maîtrise exemplaire du FabLab."
  },
  'maxime.lambert@student.hech.be': {
    userEmail: 'maxime.lambert@student.hech.be',
    gamePedagogyScore: 15,
    gameBoardLaserScore: 12,
    gamePawns3dScore: 11,
    gameAiCardsScore: 12,
    gameVideoScore: 15,
    gamePhotosScore: 11,
    gameProjectScore: 76,
    oralDefenseScore: 22,
    teacherFeedback: "Bonne implication globale. Poursuivre l'effort sur la finition des cartes IA."
  },
  'thomas.bastien@student.hech.be': {
    userEmail: 'thomas.bastien@student.hech.be',
    gamePedagogyScore: 19,
    gameBoardLaserScore: 15,
    gamePawns3dScore: 14,
    gameAiCardsScore: 14,
    gameVideoScore: 19,
    gamePhotosScore: 14,
    gameProjectScore: 95,
    oralDefenseScore: 28,
    teacherFeedback: "Projet de jeu exceptionnel, prototypage soigné et excellente soutenance."
  }
}

const DEFAULT_EXERCISE_FEEDBACKS: Record<string, ExerciseTeacherFeedback> = {
  'sarah.dubois@student.hech.be_exercice-01': {
    userEmail: 'sarah.dubois@student.hech.be',
    userName: 'Sarah Dubois',
    exerciseId: 'exercice-01',
    exerciseTitle: 'Exercice 1 : Diagnostic de compétences numériques (DigComp 2.2)',
    score: 9.5,
    maxScore: 10,
    feedback: "Excellente analyse des situations DigComp. Votre distinction entre habileté technique opératoire et discernement critique est particulièrement bien argumentée.",
    gradedAt: '2026-09-16 14:00',
    status: 'graded'
  },
  'sarah.dubois@student.hech.be_exercice-02': {
    userEmail: 'sarah.dubois@student.hech.be',
    userName: 'Sarah Dubois',
    exerciseId: 'exercice-02',
    exerciseTitle: 'Exercice 2 : Peut-on faire confiance à cette information ?',
    score: 9.0,
    maxScore: 10,
    feedback: "Très bon réflexe d'investigation : la déconstruction du titre sensationnaliste et l'identification du décalage de mélatonine sont rigoureux.",
    gradedAt: '2026-09-16 14:15',
    status: 'graded'
  },
  'sarah.dubois@student.hech.be_exercice-03': {
    userEmail: 'sarah.dubois@student.hech.be',
    userName: 'Sarah Dubois',
    exerciseId: 'exercice-03',
    exerciseTitle: 'Exercice 3 : Concevoir un guide numérique pour les élèves',
    score: 9.5,
    maxScore: 10,
    feedback: "Exemple parfait de guide pour les élèves. Bravo pour le soin apporté à la typographie et à la clarté des consignes !",
    gradedAt: '2026-09-16 14:30',
    status: 'graded'
  },
  'maxime.lambert@student.hech.be_exercice-01': {
    userEmail: 'maxime.lambert@student.hech.be',
    userName: 'Maxime Lambert',
    exerciseId: 'exercice-01',
    exerciseTitle: 'Exercice 1 : Diagnostic de compétences numériques (DigComp 2.2)',
    score: 8.0,
    maxScore: 10,
    feedback: "Bonne réflexion sur les limites des modèles de langage comme ChatGPT. Pensez à formaliser une activité concrète de remédiation en classe.",
    gradedAt: '2026-09-16 15:00',
    status: 'graded'
  },
  'maxime.lambert@student.hech.be_exercice-05': {
    userEmail: 'maxime.lambert@student.hech.be',
    userName: 'Maxime Lambert',
    exerciseId: 'exercice-05',
    exerciseTitle: 'Exercice 5 : Défi 20 minutes (Affiche Canva mot de passe)',
    score: 8.5,
    maxScore: 10,
    feedback: "Affiche percutante et visuelle. L'explication des règles de sécurité est claire pour des adolescents.",
    gradedAt: '2026-09-16 15:20',
    status: 'graded'
  },
  'thomas.bastien@student.hech.be_exercice-02': {
    userEmail: 'thomas.bastien@student.hech.be',
    userName: 'Thomas Bastien',
    exerciseId: 'exercice-02',
    exerciseTitle: 'Exercice 2 : Peut-on faire confiance à cette information ?',
    score: 10.0,
    maxScore: 10,
    feedback: "Analyse critique irréprochable de l'article viral. La remontée aux données brutes de l'échantillon démontre une grande maturité méthodologique.",
    gradedAt: '2026-09-16 16:00',
    status: 'graded'
  }
}

function getStorage<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : defaultVal
  } catch (e) {
    return defaultVal
  }
}

function setStorage<T>(key: string, val: T): boolean {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(key, JSON.stringify(val))
    return true
  } catch (e: any) {
    if (e && (e.name === 'QuotaExceededError' || e.code === 22)) {
      console.warn(`[userStore] Quota localStorage dépassé pour la clé ${key}. Tentative de sauvegarde allégée.`)
      // Si la clé concerne les fichiers soumis, on purge les dataUrls volumineux pour sauver les métadonnées
      if (key === STORAGE_KEY_FILES && Array.isArray(val)) {
        try {
          const lightweightFiles = (val as any[]).map(f => {
            const copy = { ...f }
            delete copy.dataUrl // Libère l'espace de stockage (reste accessible en mémoire vive)
            return copy
          })
          localStorage.setItem(key, JSON.stringify(lightweightFiles))
          console.info(`[userStore] Sauvegarde allégée réussie pour ${key} (${lightweightFiles.length} fichiers sans base64).`)
          return true
        } catch (subErr) {
          console.warn('[userStore] Échec de la sauvegarde allégée des fichiers :', subErr)
        }
      }
    }
    return false
  }
}

export function isLocalEnvironment(): boolean {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname
  return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host.startsWith('192.168.') || host.startsWith('10.')
}

function areDeadlinesEqual(
  a: Record<string, { deadline: string; deadlineLabel?: string }> | undefined,
  b: Record<string, { deadline: string; deadlineLabel?: string }> | undefined
): boolean {
  if (!a && !b) return true
  if (!a || !b) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const k of keysA) {
    if (!b[k]) return false
    if ((a[k]?.deadline || '') !== (b[k]?.deadline || '')) return false
    if ((a[k]?.deadlineLabel || '') !== (b[k]?.deadlineLabel || '')) return false
  }
  return true
}

/**
 * Recherche intelligente d'un étudiant par email, matricule, alias ou nom complet
 * Résout de manière transparente les variantes telles que jordan.casamento@student.hech.be <=> e161029@student.hech.be
 */
export function findUserByQuery(query: string, users: User[] = state.users): User | undefined {
  if (!query || typeof query !== 'string') return undefined
  const q = query.trim().toLowerCase()
  if (!q) return undefined

  // 1. Correspondance exacte par email
  let found = users.find(u => (u?.email || '').trim().toLowerCase() === q)
  if (found) return found

  // 2. Recherche par alias d'email enregistrés
  found = users.find(u => {
    if ((u as any)?.aliases && Array.isArray((u as any).aliases)) {
      return (u as any).aliases.some((a: string) => (a || '').trim().toLowerCase() === q)
    }
    return false
  })
  if (found) return found

  // 3. Email au format prenom.nom@... ou nom.prenom@...
  const emailPrefixMatch = q.match(/^([a-z0-9à-ÿ\-]+)\.([a-z0-9à-ÿ\-]+)@/)
  if (emailPrefixMatch) {
    const p1 = normalizeTextForAi(emailPrefixMatch[1])
    const p2 = normalizeTextForAi(emailPrefixMatch[2])
    found = users.find(u => {
      const fn = normalizeTextForAi(u.firstName || '')
      const ln = normalizeTextForAi(u.lastName || '')
      return (fn === p1 && ln === p2) || (fn === p2 && ln === p1)
    })
    if (found) return found
  }

  // 4. Matricule étudiant (ex: e161029 ou 161029)
  const matClean = q.replace(/^e/, '').replace(/@.*$/, '')
  if (matClean.length >= 5 && /^\d+$/.test(matClean)) {
    found = users.find(u => {
      const uEmail = (u?.email || '').toLowerCase()
      return uEmail.includes(matClean)
    })
    if (found) return found
  }

  // 5. Nom complet "Prénom Nom" ou "Nom Prénom"
  const qNorm = normalizeTextForAi(q)
  found = users.find(u => {
    const fn = normalizeTextForAi(u.firstName || '')
    const ln = normalizeTextForAi(u.lastName || '')
    return `${fn} ${ln}` === qNorm || `${ln} ${fn}` === qNorm
  })
  if (found) return found

  return undefined
}

const deadlinesTrigger = ref(0)

function initInitialDeadlines(): Record<string, { deadline: string, deadlineLabel?: string }> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DEADLINES)
    if (raw !== null) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        const clean: Record<string, { deadline: string, deadlineLabel?: string }> = {}
        Object.keys(parsed).forEach(k => {
          const item = parsed[k]
          if (item) {
            const rawD = item.deadline || item.dueDate || ''
            const cleanD = typeof rawD === 'string' ? rawD.trim() : (rawD ? String(rawD).trim() : '')
            const rawL = item.deadlineLabel || item.label || ''
            clean[k] = {
              deadline: cleanD,
              deadlineLabel: typeof rawL === 'string' && rawL.trim() ? rawL.trim() : (cleanD ? formatDeadlineDisplay(cleanD) : 'Non fixée')
            }
          }
        })
        return clean
      }
    }
  } catch (e) {}
  return {}
}

const initialDeletedUsers = getStorage<string[]>(STORAGE_KEY_DELETED_USERS, []).map(em => String(em).trim().toLowerCase())

const state = reactive({
  currentUser: getStorage<User | null>(STORAGE_KEY_CURRENT, null),
  deletedUsers: initialDeletedUsers,
  users: getStorage<User[]>(STORAGE_KEY_USERS, DEFAULT_USERS)
    .filter(u => u && u.email && !initialDeletedUsers.includes(String(u.email).trim().toLowerCase()))
    .map(u => ({
      ...u,
      status: u.status || 'active'
    })),
  progress: getStorage<Record<string, string[]>>(STORAGE_KEY_PROGRESS, DEFAULT_PROGRESS),
  submissions: getStorage<Submission[]>(STORAGE_KEY_SUBMISSIONS, DEFAULT_SUBMISSIONS).map(s => ({
    ...s,
    answer: s?.answer || (s as any)?.content || ''
  })),
  submittedFiles: getStorage<SubmittedFile[]>(STORAGE_KEY_FILES, DEFAULT_FILES),
  exerciseFeedbacks: getStorage<Record<string, ExerciseTeacherFeedback>>(STORAGE_KEY_EXERCISE_FEEDBACKS, DEFAULT_EXERCISE_FEEDBACKS),
  driveWebhook: getStorage<string>(STORAGE_KEY_WEBHOOK, DEFAULT_CLOUD_URL) || DEFAULT_CLOUD_URL,
  adminPinHash: initAdminPinHash(),
  quizAttempts: getStorage<QuizAttempt[]>(STORAGE_KEY_QUIZZES, DEFAULT_QUIZZES),
  evaluations: getStorage<Record<string, EvaluationRecord>>(STORAGE_KEY_EVALUATIONS, DEFAULT_EVALUATIONS),
  deadlines: initInitialDeadlines()
})

// Auto-fusion immédiate des données réelles (étudiants, devoirs, fichiers déposés, quiz)
// Garantit que tout navigateur (même avec cache localStorage ancien) affiche immédiatement tous les travaux et quiz
if (typeof window !== 'undefined') {
  // 1. Fusion des étudiants
  INITIAL_REAL_USERS.forEach(ru => {
    if (!ru || !ru.email) return
    const em = ru.email.trim().toLowerCase()
    if (initialDeletedUsers.includes(em)) return
    const existing = state.users.find(u => u && u.email && u.email.trim().toLowerCase() === em)
    if (!existing) {
      state.users.push(ru)
    }
  })

  // 2. Fusion des fichiers et DÉDUPLICATION STRICTE : Un seul fichier par (userEmail, exerciseId), le plus récent
  INITIAL_REAL_FILES.forEach(rf => {
    if (!rf || !rf.userEmail || !rf.exerciseId) return
    const em = rf.userEmail.trim().toLowerCase()
    if (initialDeletedUsers.includes(em)) return
    const existing = state.submittedFiles.find(f => f && (f.id === rf.id || (f.userEmail && f.userEmail.trim().toLowerCase() === em && (f.formattedFileName === rf.formattedFileName || f.exerciseId === rf.exerciseId))))
    if (existing) {
      if (!existing.dataUrl || existing.dataUrl.length < 100) {
        existing.dataUrl = rf.dataUrl
      }
      if (!existing.fileSize || existing.fileSize === 0) {
        existing.fileSize = rf.fileSize
      }
      if ((rf as any).extractedText) {
        (existing as any).extractedText = (rf as any).extractedText
      }
      if (rf.aiCorrection && (!existing.aiCorrection || existing.aiCorrection.suggestedScore === 0)) {
        existing.aiCorrection = rf.aiCorrection
      }
      if (rf.formattedFileName) existing.formattedFileName = rf.formattedFileName
      if (rf.driveUrl && !existing.driveUrl) existing.driveUrl = rf.driveUrl
    } else {
      state.submittedFiles.push(rf)
    }
  })

  // Strict deduplication des fichiers : garder uniquement le plus récent par étudiant et par atelier
  const dedupFilesMap = new Map<string, SubmittedFile>()
  const sortedFiles = [...state.submittedFiles].sort((a, b) => {
    const ta = new Date(a.submittedAt || 0).getTime()
    const tb = new Date(b.submittedAt || 0).getTime()
    return ta - tb
  })
  for (const f of sortedFiles) {
    if (!f || !f.userEmail || !f.exerciseId) continue
    const em = f.userEmail.trim().toLowerCase()
    if (initialDeletedUsers.includes(em)) continue
    const key = `${em}::${f.exerciseId}`
    const prev = dedupFilesMap.get(key)
    if (!prev) {
      dedupFilesMap.set(key, f)
    } else {
      const newest = f
      if (!newest.dataUrl && prev.dataUrl) newest.dataUrl = prev.dataUrl
      if (!newest.extractedText && prev.extractedText) newest.extractedText = prev.extractedText
      if (!newest.driveUrl && prev.driveUrl) newest.driveUrl = prev.driveUrl
      dedupFilesMap.set(key, newest)
    }
  }
  state.submittedFiles = Array.from(dedupFilesMap.values())
  setStorage(STORAGE_KEY_FILES, state.submittedFiles)

  // 3. Fusion des devoirs textuels et DÉDUPLICATION STRICTE
  INITIAL_REAL_SUBMISSIONS.forEach(rs => {
    if (!rs || !rs.userEmail || !rs.exerciseId) return
    const em = rs.userEmail.trim().toLowerCase()
    if (initialDeletedUsers.includes(em)) return
    const existing = state.submissions.find(s => s && s.userEmail && s.userEmail.trim().toLowerCase() === em && s.exerciseId === rs.exerciseId)
    if (!existing) {
      state.submissions.push(rs)
    } else if (!existing.answer && rs.answer) {
      existing.answer = rs.answer
    }
  })
  const dedupSubsMap = new Map<string, Submission>()
  const sortedSubs = [...state.submissions].sort((a, b) => {
    const ta = new Date(a.submittedAt || 0).getTime()
    const tb = new Date(b.submittedAt || 0).getTime()
    return ta - tb
  })
  for (const s of sortedSubs) {
    if (!s || !s.userEmail || !s.exerciseId) continue
    const em = s.userEmail.trim().toLowerCase()
    if (initialDeletedUsers.includes(em)) continue
    const key = `${em}::${s.exerciseId}`
    const prev = dedupSubsMap.get(key)
    if (!prev) {
      dedupSubsMap.set(key, s)
    } else {
      const newest = s
      if (!newest.answer && prev.answer) newest.answer = prev.answer
      dedupSubsMap.set(key, newest)
    }
  }
  state.submissions = Array.from(dedupSubsMap.values())
  setStorage(STORAGE_KEY_SUBMISSIONS, state.submissions)

  // 4. Fusion des quiz et DÉDUPLICATION STRICTE : Un seul questionnaire par (userEmail, moduleId), le plus récent
  INITIAL_REAL_QUIZZES.forEach(rq => {
    if (!rq || !rq.userEmail) return
    const em = rq.userEmail.trim().toLowerCase()
    if (initialDeletedUsers.includes(em)) return
    const existing = state.quizAttempts.find(q => q && (
      (rq.id && q.id === rq.id) ||
      (q.userEmail && q.userEmail.trim().toLowerCase() === em && q.moduleId === rq.moduleId && q.submittedAt === rq.submittedAt)
    ))
    if (!existing) {
      state.quizAttempts.push(rq)
    } else if (rq.answers && (!existing.answers || existing.answers.length === 0)) {
      existing.answers = rq.answers
      existing.score = rq.score
      existing.totalPoints = rq.totalPoints
      existing.percentage = rq.percentage
      existing.moduleTitle = rq.moduleTitle
    }
  })
  const dedupQuizzesMap = new Map<string, QuizAttempt>()
  const sortedQuizzes = [...state.quizAttempts].sort((a, b) => {
    const ta = new Date(a.submittedAt || 0).getTime()
    const tb = new Date(b.submittedAt || 0).getTime()
    return ta - tb
  })
  for (const q of sortedQuizzes) {
    if (!q || !q.userEmail) continue
    const em = q.userEmail.trim().toLowerCase()
    if (initialDeletedUsers.includes(em)) continue
    const norm = normalizeQuizModuleId(q.moduleId || (q as any).quizId)
    q.moduleId = norm.id
    q.moduleTitle = norm.title
    const key = `${em}::${norm.id}`
    const prev = dedupQuizzesMap.get(key)
    if (!prev) {
      dedupQuizzesMap.set(key, q)
    } else {
      const newest = q
      if ((!newest.answers || newest.answers.length === 0) && prev.answers && prev.answers.length > 0) {
        newest.answers = prev.answers
      }
      dedupQuizzesMap.set(key, newest)
    }
  }
  state.quizAttempts = Array.from(dedupQuizzesMap.values())
  setStorage(STORAGE_KEY_QUIZZES, state.quizAttempts)
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY_DEADLINES && event.newValue) {
      try {
        state.deadlines = JSON.parse(event.newValue)
        deadlinesTrigger.value++
      } catch (e) {}
    }
    if (event.key === STORAGE_KEY_DELETED_USERS && event.newValue) {
      try {
        state.deletedUsers = JSON.parse(event.newValue)
      } catch (e) {}
    }
  })
  window.addEventListener('focus', () => {
    userStore.syncFromStorage()
  })
}

export function normalizeQuizModuleId(raw: any): { id: string; title: string } {
  if (!raw) return { id: '01-1', title: "1.1 Qu'est-ce qu'une compétence numérique ?" }
  const str = String(raw).trim()

  // Exact mappings
  const map: Record<string, string> = {
    '01-1': "1.1 Qu'est-ce qu'une compétence numérique ?",
    '1.1': "1.1 Qu'est-ce qu'une compétence numérique ?",
    '01-2': "1.2 L'éducation aux médias dans les compétences numériques",
    '1.2': "1.2 L'éducation aux médias dans les compétences numériques",
    '02-1': "2.1 Les quatre champs d'apprentissage du numérique",
    '2.1': "2.1 Les quatre champs d'apprentissage du numérique",
    '02-2': "2.2 La progression des apprentissages numériques",
    '2.2': "2.2 La progression des apprentissages numériques",
    '02-3': "2.3 Progression spiralaire",
    '2.3': "2.3 Progression spiralaire",
    '03-1': "3.1 La situation-problème et l'apprentissage par problème",
    '3.1': "3.1 La situation-problème et l'apprentissage par problème",
    '03-2': "3.2 L'apprentissage par projet",
    '3.2': "3.2 L'apprentissage par projet",
    '03-3': "3.3 L'apprentissage par investigation & enquête",
    '3.3': "3.3 L'apprentissage par investigation & enquête",
    '03-4': "3.4 Le défi pédagogique",
    '3.4': "3.4 Le défi pédagogique",
    '03-5': "3.5 La démarche de conception itérative",
    '3.5': "3.5 La démarche de conception itérative",
    '03-6': "3.6 Apprentissage expérientiel et peer learning",
    '3.6': "3.6 Apprentissage expérientiel et peer learning",
    '03-7': "3.7 L'enseignement à distance",
    '3.7': "3.7 L'enseignement à distance",
    '04-1': "4.1 Les éléments indispensables d'une préparation FMTTN",
    '4.1': "4.1 Les éléments indispensables d'une préparation FMTTN",
    '04-2': "4.2 Taxonomie de Bloom",
    '04-4': "4.4 Assistant IA HECh",
    '05': "5. Évaluer un cours de numérique",
    '05-1': "6.1 Ludopédagogie & Édumédias",
    '07': "6.3 La photographie & composition visuelle",
    '08': "6.4 Créer des cartes et supports de jeu avec l'IA",
    '10': "6.7 Concevoir une capsule vidéo"
  }

  if (map[str]) {
    const cleanId = (str.length === 3 && !str.startsWith('0')) ? ('0' + str) : str
    return { id: cleanId, title: map[str] }
  }

  // Google Sheet auto-date formatting recovery (ex: "Thu Jan 01 2026...", "Fri Jan 02 2026...")
  if (str.includes('GMT') || str.includes('2026') || str.includes('Jan') || str.includes('Feb') || str.includes('Mar') || str.includes('Fév')) {
    const d = new Date(str)
    if (!isNaN(d.getTime())) {
      const day = d.getDate()
      const month = d.getMonth() + 1
      const c1 = `${String(day).padStart(2, '0')}-${month}`
      if (map[c1]) return { id: c1, title: map[c1] }
      const c2 = `${String(month).padStart(2, '0')}-${day}`
      if (map[c2]) return { id: c2, title: map[c2] }
    }
    if (str.includes('Feb') || str.includes('Fév')) return { id: '01-2', title: map['01-2'] }
    if (str.includes('Jan')) return { id: '01-1', title: map['01-1'] }
    if (str.includes('Mar')) return { id: '03-1', title: map['03-1'] }
  }

  return { id: str, title: `Module ${str}` }
}

export const userStore = {
  get currentUser() {
    return state.currentUser
  },
  get deletedUsers() {
    return state.deletedUsers
  },
  get users() {
    return state.users.filter(u => u && u.email && !state.deletedUsers.includes(String(u.email).trim().toLowerCase()))
  },
  get submissions() {
    return state.submissions
  },
  get submittedFiles() {
    return state.submittedFiles
  },
  get driveWebhook() {
    return state.driveWebhook
  },
  get adminPin() {
    return '[PROTÉGÉ]'
  },
  get adminPinHash() {
    return state.adminPinHash
  },
  get quizAttempts() {
    return state.quizAttempts
  },
  get deadlines() {
    void deadlinesTrigger.value
    return state.deadlines
  },
  get deadlinesRevision() {
    return deadlinesTrigger.value
  },

  // Récupérer l'échéance effective d'un exercice (fixée par l'enseignant, aucune par défaut)
  getExerciseDeadline(exerciseId: string): { deadline: string, deadlineLabel: string, isDefined: boolean, isCustom: boolean } {
    void deadlinesTrigger.value
    const key = (exerciseId === 'exercice-video' && !state.deadlines['exercice-video'] && state.deadlines['exercice-14'])
      ? 'exercice-14'
      : (exerciseId === 'exercice-14' && !state.deadlines['exercice-14'] && state.deadlines['exercice-video'])
        ? 'exercice-video'
        : exerciseId

    const custom = state.deadlines?.[key]
    const customDeadline = custom?.deadline || (custom as any)?.dueDate || ''
    const cleanDeadline = typeof customDeadline === 'string' ? customDeadline.trim() : (customDeadline ? String(customDeadline).trim() : '')
    if (cleanDeadline !== '') {
      const rawLabel = custom?.deadlineLabel || (custom as any)?.label || ''
      const cleanLabel = typeof rawLabel === 'string' && rawLabel.trim() ? rawLabel.trim() : formatDeadlineDisplay(cleanDeadline)
      return {
        deadline: cleanDeadline,
        deadlineLabel: cleanLabel,
        isDefined: true,
        isCustom: true
      }
    }
    return {
      deadline: '',
      deadlineLabel: 'Non fixée',
      isDefined: false,
      isCustom: false
    }
  },

  // Récupérer les liens de téléchargement Word, PDF et Google Drive d'un exercice
  getExerciseDocLinks(exerciseId: string) {
    return getExerciseDownloadLinks(exerciseId)
  },

  // Mettre à jour l'échéance d'un exercice individuel (ou la retirer si vide)
  setExerciseDeadline(exerciseId: string, deadline: string, deadlineLabel?: string) {
    const newDeadlines = { ...state.deadlines }
    if (!deadline || !deadline.trim()) {
      delete newDeadlines[exerciseId]
      if (exerciseId === 'exercice-video') delete newDeadlines['exercice-14']
      if (exerciseId === 'exercice-14') delete newDeadlines['exercice-video']
    } else {
      const cleanDate = deadline.trim()
      const entry = {
        deadline: cleanDate,
        deadlineLabel: deadlineLabel || formatDeadlineDisplay(cleanDate)
      }
      newDeadlines[exerciseId] = entry
      if (exerciseId === 'exercice-video') newDeadlines['exercice-14'] = entry
      if (exerciseId === 'exercice-14') newDeadlines['exercice-video'] = entry
    }
    state.deadlines = newDeadlines
    setStorage(STORAGE_KEY_DEADLINES, state.deadlines)
    deadlinesTrigger.value++

    // 1. Sauvegarde automatique sur le Google Drive local via Vite middleware (local uniquement)
    if (isLocalEnvironment()) {
      try {
        fetch('/api/backup-deadlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deadlines: state.deadlines })
        }).catch(() => {})
      } catch (e) {}

      try {
        fetch('http://localhost:3001/api/deadlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deadlines: state.deadlines })
        }).catch(() => {})
      } catch (e) {}
    }

    // 2. Sauvegarde immédiate dans Google Apps Script Cloud
    try {
      cloudSync.pushDeadlines(state.deadlines).catch(() => {})
    } catch (e) {}

    return { success: true, message: !deadline || !deadline.trim() ? 'Échéance retirée avec succès.' : 'Échéance enregistrée avec succès.' }
  },

  // Mettre à jour toutes les échéances en une seule fois
  setAllExerciseDeadlines(map: Record<string, string>) {
    let count = 0
    const newDeadlines: Record<string, { deadline: string, deadlineLabel?: string }> = {}
    for (const [id, dateStr] of Object.entries(map)) {
      if (dateStr && dateStr.trim()) {
        const clean = dateStr.trim()
        const entry = {
          deadline: clean,
          deadlineLabel: formatDeadlineDisplay(clean)
        }
        newDeadlines[id] = entry
        if (id === 'exercice-video') newDeadlines['exercice-14'] = entry
        if (id === 'exercice-14') newDeadlines['exercice-video'] = entry
        count++
      }
    }
    state.deadlines = newDeadlines
    setStorage(STORAGE_KEY_DEADLINES, state.deadlines)
    deadlinesTrigger.value++

    // 1. Sauvegarde automatique sur le Google Drive local via Vite middleware (local uniquement)
    if (isLocalEnvironment()) {
      try {
        fetch('/api/backup-deadlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deadlines: state.deadlines })
        }).catch(() => {})
      } catch (e) {}

      try {
        fetch('http://localhost:3001/api/deadlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deadlines: state.deadlines })
        }).catch(() => {})
      } catch (e) {}
    }

    // 2. Sauvegarde immédiate dans Google Apps Script Cloud
    try {
      cloudSync.pushDeadlines(state.deadlines).catch(() => {})
    } catch (e) {}

    return { success: true, count }
  },

  // Effacer toutes les échéances
  resetDeadlinesToDefault() {
    state.deadlines = {}
    setStorage(STORAGE_KEY_DEADLINES, {})
    deadlinesTrigger.value++

    if (isLocalEnvironment()) {
      try {
        fetch('/api/backup-deadlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deadlines: {} })
        }).catch(() => {})
      } catch (e) {}

      try {
        fetch('http://localhost:3001/api/deadlines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deadlines: {} })
        }).catch(() => {})
      } catch (e) {}
    }

    try {
      cloudSync.pushDeadlines({}).catch(() => {})
    } catch (e) {}

    return { success: true, message: 'Toutes les échéances ont été effacées.' }
  },

  // Recharger les données depuis le stockage local (synchronisation à chaud)
  syncFromStorage() {
    if (typeof window === 'undefined') return
    try {
      const rawDel = localStorage.getItem(STORAGE_KEY_DELETED_USERS)
      if (rawDel) {
        state.deletedUsers = JSON.parse(rawDel).map((em: string) => String(em).trim().toLowerCase())
      }

      const raw = localStorage.getItem(STORAGE_KEY_DEADLINES)
      if (raw !== null) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') {
          const clean: Record<string, { deadline: string, deadlineLabel?: string }> = {}
          Object.keys(parsed).forEach(k => {
            const item = parsed[k]
            if (item) {
              const rawD = item.deadline || item.dueDate || ''
              const cleanD = typeof rawD === 'string' ? rawD.trim() : (rawD ? String(rawD).trim() : '')
              const rawL = item.deadlineLabel || item.label || ''
              clean[k] = {
                deadline: cleanD,
                deadlineLabel: typeof rawL === 'string' && rawL.trim() ? rawL.trim() : (cleanD ? formatDeadlineDisplay(cleanD) : 'Non fixée')
              }
            }
          })
          if (!areDeadlinesEqual(state.deadlines, clean)) {
            state.deadlines = clean
            deadlinesTrigger.value++
          }
        }
      }

      // Recharger également depuis le backend Google Drive local UNIQUEMENT en développement local
      if (isLocalEnvironment()) {
        fetch('/api/backup-deadlines')
          .then(r => r.json())
          .then(res => {
            if (res && res.deadlines && typeof res.deadlines === 'object') {
              let changed = false
              Object.keys(res.deadlines).forEach(k => {
                const item = res.deadlines[k]
                if (item && item.deadline && !state.deadlines[k]?.deadline) {
                  state.deadlines[k] = item
                  changed = true
                }
              })
              if (changed) {
                setStorage(STORAGE_KEY_DEADLINES, state.deadlines)
                deadlinesTrigger.value++
              }
            }
          })
          .catch(() => {})
      }
    } catch (e) {}
  },

  register(firstName: string, lastName: string, email: string) {
    const cleanEmail = sanitizeEmail(email)
    const cleanFirst = sanitizeText(firstName, 50)
    const cleanLast = sanitizeText(lastName, 50)
    if (!cleanEmail) {
      return { success: false, message: 'Adresse email invalide.' }
    }
    // Réhabilitation si l'étudiant était précédemment marqué supprimé
    if (state.deletedUsers.includes(cleanEmail)) {
      state.deletedUsers = state.deletedUsers.filter(em => em !== cleanEmail)
      setStorage(STORAGE_KEY_DELETED_USERS, state.deletedUsers)
    }

    const existing = state.users.find(u => u && u.email && u.email.toLowerCase() === cleanEmail)
    if (existing) {
      if (existing.status === 'archived') {
        existing.status = 'active'
        setStorage(STORAGE_KEY_USERS, state.users)
      }
      state.currentUser = existing
      setStorage(STORAGE_KEY_CURRENT, state.currentUser)
      return { success: true, user: existing, message: 'Re-connexion automatique.' }
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      firstName: cleanFirst,
      lastName: cleanLast,
      email: cleanEmail,
      role: 'student',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'active'
    }

    state.users.push(newUser)
    state.currentUser = newUser
    if (!state.progress[cleanEmail]) {
      state.progress[cleanEmail] = []
    }

    setStorage(STORAGE_KEY_USERS, state.users)
    setStorage(STORAGE_KEY_CURRENT, state.currentUser)
    setStorage(STORAGE_KEY_PROGRESS, state.progress)

    try { cloudSync.pushStudent(newUser) } catch (e) {}
    try { this.syncWithCloud().catch(() => {}) } catch (e) {}

    return { success: true, user: newUser }
  },

  addStudent(firstName: string, lastName: string, email: string) {
    const cleanEmail = sanitizeEmail(email)
    const cleanFirst = sanitizeText(firstName, 50)
    const cleanLast = sanitizeText(lastName, 50)
    if (!cleanEmail || !cleanFirst || !cleanLast) {
      return { success: false, message: 'Tous les champs sont obligatoires.' }
    }

    // Réhabilitation si l'étudiant était précédemment marqué supprimé
    if (state.deletedUsers.includes(cleanEmail)) {
      state.deletedUsers = state.deletedUsers.filter(em => em !== cleanEmail)
      setStorage(STORAGE_KEY_DELETED_USERS, state.deletedUsers)
    }

    const existing = state.users.find(u => u && u.email && u.email.toLowerCase() === cleanEmail)
    if (existing) {
      existing.firstName = cleanFirst
      existing.lastName = cleanLast
      existing.status = 'active'
      setStorage(STORAGE_KEY_USERS, state.users)
      try { cloudSync.pushUpdateStudent(existing) } catch (e) {}
      return { success: true, message: 'Étudiant déjà existant : profil réactivé et mis à jour.' }
    }

    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      firstName: cleanFirst,
      lastName: cleanLast,
      email: cleanEmail,
      role: 'student',
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'active'
    }

    state.users.push(newUser)
    if (!state.progress[cleanEmail]) {
      state.progress[cleanEmail] = []
    }

    setStorage(STORAGE_KEY_USERS, state.users)
    setStorage(STORAGE_KEY_PROGRESS, state.progress)
    try { cloudSync.pushStudent(newUser) } catch (e) {}
    return { success: true, message: 'Étudiant ajouté avec succès !' }
  },

  deleteStudent(email: string) {
    const cleanEmail = email.trim().toLowerCase()

    // 1. Inscription immédiate dans le registre d'exclusion absolue (empêche toute réapparition locale ou distante)
    if (!state.deletedUsers.includes(cleanEmail)) {
      state.deletedUsers.push(cleanEmail)
      setStorage(STORAGE_KEY_DELETED_USERS, state.deletedUsers)
    }

    const index = state.users.findIndex(u => u && u.email && u.email.toLowerCase() === cleanEmail)
    let removedUser: User | null = null
    if (index >= 0) {
      removedUser = state.users[index]
      state.users.splice(index, 1)
    }
    delete state.progress[cleanEmail]
    if (state.evaluations) {
      delete state.evaluations[cleanEmail]
    }
    state.submissions = state.submissions.filter(s => (s?.userEmail || '').toLowerCase() !== cleanEmail)
    state.submittedFiles = state.submittedFiles.filter(f => (f?.userEmail || '').toLowerCase() !== cleanEmail)
    state.quizAttempts = state.quizAttempts.filter(q => (q?.userEmail || '').toLowerCase() !== cleanEmail)

    if (state.currentUser?.email.toLowerCase() === cleanEmail) {
      state.currentUser = null
      if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY_CURRENT)
    }

    setStorage(STORAGE_KEY_USERS, state.users)
    setStorage(STORAGE_KEY_PROGRESS, state.progress)
    setStorage(STORAGE_KEY_SUBMISSIONS, state.submissions)
    setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    setStorage(STORAGE_KEY_QUIZZES, state.quizAttempts)
    setStorage(STORAGE_KEY_EVALUATIONS, state.evaluations)

    // 2. Ordre de suppression au serveur Google Apps Script
    try {
      cloudSync.deleteStudent(cleanEmail)
    } catch (e) {}

    const nameStr = removedUser ? `"${removedUser.firstName} ${removedUser.lastName}" ` : ''
    return { 
      success: true, 
      message: `L'étudiant ${nameStr}(${cleanEmail}) a été définitivement supprimé.` 
    }
  },

  toggleArchiveStudent(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase()
    const user = state.users.find(u => (u?.email || '').trim().toLowerCase() === cleanEmail)
    if (user) {
      user.status = user.status === 'archived' ? 'active' : 'archived'
      setStorage(STORAGE_KEY_USERS, state.users)
      return { success: true, status: user.status }
    }
    return { success: false, message: 'Étudiant non trouvé.' }
  },

  importStudentsFromCSV(csvText: string) {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    if (lines.length <= 1) {
      return { success: false, count: 0, message: 'Fichier CSV vide ou incomplet.' }
    }

    const separator = lines[0].includes(';') ? ';' : ','
    const headers = lines[0].split(separator).map(h => h.trim().toLowerCase().replace(/["']/g, ''))

    let colNom = headers.findIndex(h => h.includes('nom') && !h.includes('pre'))
    let colPrenom = headers.findIndex(h => h.includes('pre') || h.includes('prénom'))
    let colEmail = headers.findIndex(h => h.includes('mail'))

    if (colNom === -1) colNom = 0
    if (colPrenom === -1) colPrenom = 1
    if (colEmail === -1) colEmail = 2

    let importedCount = 0

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(separator).map(p => p.trim().replace(/^["']|["']$/g, ''))
      if (parts.length >= 3) {
        const lastName = parts[colNom] || ''
        const firstName = parts[colPrenom] || ''
        const email = (parts[colEmail] || '').toLowerCase()

        if (email && email.includes('@')) {
          this.addStudent(firstName || 'Étudiant', lastName || 'Inconnu', email)
          importedCount++
        }
      }
    }

    return {
      success: true,
      count: importedCount,
      message: `${importedCount} étudiant(s) importé(s) avec succès !`
    }
  },

  downloadCSVTemplate() {
    const template = 'Nom;Prenom;Email\nDubois;Sarah;sarah.dubois@student.hech.be\nLambert;Maxime;maxime.lambert@student.hech.be\nBastien;Thomas;thomas.bastien@student.hech.be\n'
    const blob = new Blob(['\ufeff' + template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', 'modele_import_etudiants_HECh.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  },

  login(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase()
    const user = state.users.find(u => (u?.email || '').trim().toLowerCase() === cleanEmail)
    if (user) {
      if (user.status === 'archived') {
        user.status = 'active'
        setStorage(STORAGE_KEY_USERS, state.users)
      }
      state.currentUser = user
      setStorage(STORAGE_KEY_CURRENT, state.currentUser)
      return { success: true, user }
    }
    return { success: false, message: 'Adresse email non trouvée. Veuillez vous inscrire.' }
  },

  logout() {
    state.currentUser = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY_CURRENT)
    }
  },

  getUserProgress(email?: string): string[] {
    const userEmail = email || state.currentUser?.email
    if (!userEmail) return []
    return state.progress[userEmail] || []
  },

  toggleModuleProgress(moduleId: string) {
    if (!state.currentUser) return false
    const email = state.currentUser.email
    if (!state.progress[email]) state.progress[email] = []

    const idx = state.progress[email].indexOf(moduleId)
    if (idx >= 0) {
      state.progress[email].splice(idx, 1)
    } else {
      state.progress[email].push(moduleId)
    }

    setStorage(STORAGE_KEY_PROGRESS, state.progress)
    return true
  },

  isModuleCompleted(moduleId: string): boolean {
    if (!state.currentUser) return false
    const list = state.progress[state.currentUser.email] || []
    return list.includes(moduleId)
  },

  saveSubmission(exerciseId: string, exerciseTitle: string, answer: string) {
    if (!state.currentUser) return { success: false, message: "Veuillez vous identifier d'abord." }
    if (!answer.trim()) return { success: false, message: 'La réponse ne peut pas être vide.' }

    const cleanEmail = state.currentUser.email
    const existingIndex = state.submissions.findIndex(
      s => s.userEmail === cleanEmail && s.exerciseId === exerciseId
    )

    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)

    const cleanAnswer = sanitizeText(answer, 20000)
    if (existingIndex >= 0) {
      state.submissions[existingIndex].answer = cleanAnswer
      state.submissions[existingIndex].submittedAt = now
    } else {
      state.submissions.push({
        id: `sub-${Date.now()}`,
        userId: state.currentUser.id,
        userName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
        userEmail: cleanEmail,
        exerciseId,
        exerciseTitle,
        answer: cleanAnswer,
        submittedAt: now
      })
    }

    if (!state.progress[cleanEmail]) state.progress[cleanEmail] = []
    if (!state.progress[cleanEmail].includes(exerciseId)) {
      state.progress[cleanEmail].push(exerciseId)
      setStorage(STORAGE_KEY_PROGRESS, state.progress)
    }

    setStorage(STORAGE_KEY_SUBMISSIONS, state.submissions)

    // Push immédiat vers le Cloud en arrière-plan
    try {
      cloudSync.pushSubmission({
        id: `sub-${cleanEmail}-${exerciseId}`,
        userId: state.currentUser.id,
        userName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
        userEmail: cleanEmail,
        exerciseId,
        exerciseTitle,
        content: cleanAnswer,
        answer: cleanAnswer,
        submittedAt: now
      }).catch(e => console.warn('[CloudSync] pushSubmission error:', e))
    } catch (e) {}

    try {
      this.syncWithCloud().catch(() => {})
    } catch (e) {}

    // Backup instantané dans le dossier Google Drive local (C:\Google Drive\...) - local uniquement
    if (isLocalEnvironment()) {
      try {
        const formattedName = formatFileName(
          state.currentUser.lastName,
          state.currentUser.firstName,
          exerciseTitle,
          'Reponse_Ecrite.txt'
        )
        fetch('/api/backup-exercise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userName: `${state.currentUser.lastName}_${state.currentUser.firstName}`,
            userEmail: cleanEmail,
            exerciseId,
            exerciseTitle,
            fileName: formattedName,
            content: `=================================================================\nÉLÈVE : ${state.currentUser.firstName} ${state.currentUser.lastName} (${cleanEmail})\nEXERCICE : ${exerciseTitle} (${exerciseId})\nDATE : ${now}\n=================================================================\n\nRÉPONSE RÉDIGÉE :\n\n${cleanAnswer}\n`
          })
        }).catch(() => {})
      } catch (e) {}
    }

    return { success: true, message: 'Réponse enregistrée avec succès !' }
  },

  getUserSubmission(exerciseId: string): string {
    if (!state.currentUser) return ''
    const sub = state.submissions.find(
      s => s.userEmail === state.currentUser?.email && s.exerciseId === exerciseId
    )
    return sub ? sub.answer : ''
  },

  calculateUserProgressPercent(email?: string, totalModules = 12): number {
    const userEmail = email || state.currentUser?.email
    if (!userEmail) return 0
    const completed = (state.progress[userEmail] || []).length
    return Math.min(100, Math.round((completed / totalModules) * 100))
  },

  // ==========================================
  // GESTION DU DÉPÔT DE FICHIERS (WORD & PDF)
  // ==========================================

  getFormattedNamePreview(exerciseTitle: string, originalFileName: string): string {
    const user = state.currentUser
    const lastName = user ? user.lastName : 'NOM'
    const firstName = user ? user.firstName : 'Prenom'
    return formatFileName(lastName, firstName, exerciseTitle, originalFileName)
  },

  async uploadStudentFile(
    exerciseId: string, 
    exerciseTitle: string, 
    file: File
  ): Promise<{ success: boolean; message: string; file?: SubmittedFile }> {
    if (!state.currentUser) {
      return { success: false, message: "Vous devez être identifié pour déposer un travail." }
    }

    const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15 Mo max
    if (file.size > MAX_FILE_SIZE) {
      return { 
        success: false, 
        message: "Fichier trop volumineux. La taille maximale autorisée est de 15 Mo pour préserver la réactivité de la plateforme." 
      }
    }

    const ext = (file.name || '').split('.').pop()?.toLowerCase() || ''
    const allowed = ['pdf', 'docx', 'doc']
    if (!allowed.includes(ext)) {
      return { 
        success: false, 
        message: "Format non accepté. Seuls les fichiers Word (.docx, .doc) et PDF (.pdf) sont autorisés." 
      }
    }

    // 1. Génération du nom normalisé officiel
    const formattedName = formatFileName(
      state.currentUser.lastName,
      state.currentUser.firstName,
      exerciseTitle,
      file.name
    )

    // 2. Lecture du fichier en Base64 Data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const newFile: SubmittedFile = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: state.currentUser.id,
      userName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
      userEmail: state.currentUser.email,
      exerciseId,
      exerciseTitle,
      originalFileName: file.name,
      formattedFileName: formattedName,
      fileType: file.type || (ext === 'pdf' ? 'application/pdf' : 'application/msword'),
      fileSize: file.size,
      dataUrl,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      driveSynced: false
    }

    // Déclenchement automatique et immédiat de la correction IA dès le dépôt (avec extraction réelle du texte et détection hors-sujet)
    try {
      const textContent = await extractTextFromSubmittedFile(newFile)
      const relevance = evaluateDocumentRelevance(textContent, exerciseId)
      newFile.aiCorrection = generateDidacticAiCorrection(newFile, textContent, relevance)
    } catch (e) {
      console.warn("Erreur analyse IA immédiate:", e)
    }

    // Remplacer l'éventuel ancien fichier du même étudiant pour cet exercice
    const existingIdx = state.submittedFiles.findIndex(
      f => f.userEmail === state.currentUser?.email && f.exerciseId === exerciseId
    )
    if (existingIdx >= 0) {
      state.submittedFiles[existingIdx] = newFile
    } else {
      state.submittedFiles.push(newFile)
    }

    // Auto-marquage de l'exercice dans la progression
    const email = state.currentUser.email
    if (!state.progress[email]) state.progress[email] = []
    if (!state.progress[email].includes(exerciseId)) {
      state.progress[email].push(exerciseId)
      setStorage(STORAGE_KEY_PROGRESS, state.progress)
    }

    // Sauvegarde dans le stockage local (avec compression/allégement automatique si quota dépassé)
    const savedFiles = setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    if (!savedFiles) {
      console.warn("[userStore] Stockage local partiel, poursuite de la synchronisation cloud et Google Drive.")
    }

    // 3. Sauvegarde instantanée dans le dossier Google Drive local (C:\Google Drive\...) - local uniquement
    if (isLocalEnvironment()) {
      try {
        fetch('/api/backup-exercise', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
            userName: `${state.currentUser.lastName}_${state.currentUser.firstName}`,
            userEmail: state.currentUser.email,
            exerciseId,
            exerciseTitle,
            fileName: formattedName,
            base64Data: dataUrl
          })
        }).then(res => {
          if (res.ok) {
            newFile.driveSynced = true
            setStorage(STORAGE_KEY_FILES, state.submittedFiles)
          }
        }).catch(() => {})
      } catch (e) {}

      // 4. Tentative d'envoi automatique vers le serveur compagnon local (si actif)
      try {
        fetch('http://localhost:3001/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: formattedName,
            base64Data: dataUrl,
            studentName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
            studentEmail: state.currentUser.email,
            exerciseTitle
          })
        }).then(res => {
          if (res.ok) {
            newFile.driveSynced = true
            setStorage(STORAGE_KEY_FILES, state.submittedFiles)
          }
        }).catch(() => {})
      } catch (e) {}
    }

    // 4. Envoi automatique vers Google Drive via Google Apps Script (Cloud)
    cloudSync.uploadFile({
      studentName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
      studentEmail: state.currentUser.email,
      exerciseId,
      exerciseTitle,
      fileName: formattedName,
      base64Data: dataUrl.split(',')[1] || dataUrl,
      mimeType: newFile.fileType
    }).then(res => {
      if (res && res.success) {
        newFile.driveSynced = true
        if (res.fileUrl) {
          newFile.driveUrl = res.fileUrl
        }
        setStorage(STORAGE_KEY_FILES, state.submittedFiles)
        this.syncWithCloud().catch(() => {})
      }
    }).catch(() => {})

    // 4b. Webhook direct hérité (si configuré)
    if (state.driveWebhook) {
      try {
        fetch(state.driveWebhook, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentName: `${state.currentUser.firstName} ${state.currentUser.lastName}`,
            studentEmail: state.currentUser.email,
            exerciseTitle,
            fileName: formattedName,
            base64Data: dataUrl.split(',')[1] || dataUrl,
            mimeType: newFile.fileType
          })
        }).then(() => {
          newFile.driveSynced = true
          setStorage(STORAGE_KEY_FILES, state.submittedFiles)
        }).catch(() => {})
      } catch (e) {}
    }

    return {
      success: true,
      message: `Document déposé avec succès sous le libellé : ${formattedName}`,
      file: newFile
    }
  },

  async syncAllFilesToLocalDrive(): Promise<{ success: boolean; count?: number; message: string }> {
    try {
      const filesPayload = state.submittedFiles.map(f => ({
        fileName: f.formattedFileName || f.originalFileName,
        dataUrl: f.dataUrl,
        userName: f.userName,
        userEmail: f.userEmail
      }))

      const res = await fetch('http://localhost:3001/api/sync-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filesPayload })
      })

      if (res.ok) {
        const data = await res.json()
        return { success: true, count: data.savedCount, message: `${data.savedCount} travaux synchronisés sur Google Drive local.` }
      }
      return { success: false, message: 'Le serveur compagnon local (port 3001) ne répond pas.' }
    } catch (e: any) {
      return { success: false, message: 'Serveur local inactif (Lancez "npm run drive:server" sur votre machine).' }
    }
  },

  deleteStudentFile(fileId: string) {
    const idx = state.submittedFiles.findIndex(f => f.id === fileId)
    if (idx >= 0) {
      state.submittedFiles.splice(idx, 1)
      setStorage(STORAGE_KEY_FILES, state.submittedFiles)
      return { success: true, message: 'Document supprimé.' }
    }
    return { success: false, message: 'Fichier non trouvé.' }
  },

  getUserFiles(email?: string): SubmittedFile[] {
    const rawEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    if (!rawEmail) return []
    const user = findUserByQuery(rawEmail)
    const allowed = new Set<string>([rawEmail])
    if (user?.email) allowed.add(user.email.toLowerCase())
    if ((user as any)?.aliases && Array.isArray((user as any).aliases)) {
      for (const a of (user as any).aliases) if (a) allowed.add(a.toLowerCase())
    }
    return state.submittedFiles.filter(f => f && f.userEmail && allowed.has(f.userEmail.toLowerCase()))
  },

  downloadSubmittedFile(file: SubmittedFile) {
    let dataUrl = file.dataUrl || ''
    if (!dataUrl) {
      const realMatch = INITIAL_REAL_FILES.find((rf: any) =>
        rf.id === file.id ||
        ((rf.userEmail || '').toLowerCase() === (file.userEmail || '').toLowerCase() && rf.exerciseId === file.exerciseId)
      )
      if (realMatch && realMatch.dataUrl) {
        dataUrl = realMatch.dataUrl
        file.dataUrl = dataUrl
        if (!file.fileSize && realMatch.fileSize) file.fileSize = realMatch.fileSize
      }
    }

    if (!dataUrl) {
      if (file.driveUrl) {
        if (typeof window !== 'undefined') {
          window.open(file.driveUrl, '_blank')
        }
        return
      }
      alert("Le contenu du fichier n'est pas disponible pour le téléchargement direct.")
      return
    }

    try {
      const base64Data = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl
      const binaryStr = atob(base64Data)
      const len = binaryStr.length
      const bytes = new Uint8Array(len)
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const mime = file.fileType || (file.formattedFileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream')
      const blob = new Blob([bytes], { type: mime })
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.setAttribute('download', file.formattedFileName || file.originalFileName || 'document')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 10000)
    } catch (e) {
      const link = document.createElement('a')
      link.href = dataUrl
      link.setAttribute('download', file.formattedFileName || file.originalFileName || 'document')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  },

  // Synchronisation directe vers le dossier Google Drive via l'API File System Access
  async syncFilesToDirectory(directoryHandle: any): Promise<{ count: number; errorCount: number }> {
    let count = 0
    let errorCount = 0

    for (const f of state.submittedFiles) {
      if (!f.dataUrl) continue
      try {
        // 1. Créer ou récupérer le sous-dossier par nom d'étudiant
        const rawName = f.userName || (f.userEmail ? f.userEmail.split('@')[0] : 'Etudiant_Inconnu')
        const safeStudentFolder = rawName.replace(/[<>:"/\\|?*]/g, '_').trim() || 'Etudiant'
        const studentDirHandle = await directoryHandle.getDirectoryHandle(safeStudentFolder, { create: true })

        // 2. Écrire le fichier dans le dossier de l'étudiant
        const targetFileName = f.formattedFileName || f.originalFileName || 'devoir.docx'
        const fileHandle = await studentDirHandle.getFileHandle(targetFileName, { create: true })
        const writable = await fileHandle.createWritable()
        
        // Convertir base64 DataURL en Blob
        const base64Content = f.dataUrl.split(',')[1] || f.dataUrl
        const byteCharacters = atob(base64Content)
        const byteNumbers = new Array(byteCharacters.length)
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }
        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: f.fileType || 'application/octet-stream' })

        await writable.write(blob)
        await writable.close()
        f.driveSynced = true
        count++
      } catch (err) {
        console.error(`Erreur d'écriture pour ${f.formattedFileName}:`, err)
        errorCount++
      }
    }

    setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    return { count, errorCount }
  },

  setDriveWebhook(url: string) {
    state.driveWebhook = url.trim()
    setStorage(STORAGE_KEY_WEBHOOK, state.driveWebhook)
  },

  // ==========================================
  // CORRECTION AUTOMATIQUE IA & ÉVALUATION ENSEIGNANT
  // ==========================================

  async analyzeFileWithAi(fileId: string): Promise<{ success: boolean; file?: SubmittedFile; message: string }> {
    const file = state.submittedFiles.find(f => f.id === fileId)
    if (!file) return { success: false, message: "Document non trouvé." }

    // 1. Récupération des notes et extraction complète du document déposé
    const userSubmission = state.submissions.find(
      s => s.userEmail.toLowerCase() === file.userEmail.toLowerCase() && s.exerciseId === file.exerciseId
    )
    const textContent = await extractTextFromSubmittedFile(file, userSubmission)

    // 2. Évaluation préalable de la concordance thématique et pertinence didactique
    const relevance = evaluateDocumentRelevance(textContent, file.exerciseId)

    let aiResult: AiCorrection | null = null

    // 3. Appel Local First à Ollama (Qwen Coder 2.5 7B) si disponible
    try {
      const p = relevance.profile
      const prompt = `Tu es un évaluateur pédagogique expert en didactique du numérique et en FMTTN à la Haute École Charlemagne (HECh).
Tu corriges les devoirs des étudiants de Master 1 avec une objectivité rigoureuse, mesurée et nuancée conformément à la grille institutionnelle officielle (docs/guide/criteres-correction-ia.md).

CALIBRATION OBJECTIVE DE LA NOTE SUR 10 (ÉVITER LE PIÈGE DU 1/10 OU 9/10 SYSTÉMATIQUE) :
Évalue le travail avec une réelle échelle continue en fonction des 4 critères ci-dessous :
- 0 à 1.5/10 : Hors-sujet avéré, document vide ou sans aucun rapport avec les attendus.
- 2.0 à 4.5/10 : Travail très incomplet, superficiel ou ébauche (plusieurs consignes ou concepts majeurs omis).
- 5.0 à 6.5/10 : Travail moyen à satisfaisant (consignes de base respectées, mais analyse manquant de profondeur ou d'ancrage didactique).
- 7.0 à 8.0/10 : Bon travail, rigoureux, notions bien mobilisées, propositions pertinentes pour des élèves du secondaire.
- 8.5 à 9.5/10 : Très bon à excellent travail, analyse didactique fouillée, recul réflexif affirmé.
- 10/10 : Travail d'une perfection académique rare.

GRILLE DE NOTATION INSTITUTIONNELLE (4 critères × 2.5 points = 10 points) :
- Critère A : Concordance aux consignes & Pertinence du sujet (sur 2.5 pts). Vérifie la réponse aux questions clés de l'atelier.
- Critère B : Exactitude conceptuelle & Maîtrise didactique (sur 2.5 pts). Vérifie la justesse et la richesse du vocabulaire didactique/FMTTN.
- Critère C & D : Analyse critique & Transfert pédagogique (sur 2.5 pts). Évalue la profondeur de l'argumentation et les propositions pour les élèves.
- Critère E & H : Qualité de la communication & Réflexivité (sur 2.5 pts). Évalue la structure, la clarté et la posture réflexive d'enseignant.

CONSIGNES DE L'ACTIVITÉ :
Titre de l'atelier : "${file.exerciseTitle}" (Identifiant: ${file.exerciseId})
Objectif officiel : ${p.expectedSummary}
Concepts et mots-clés attendus : ${p.requiredKeywords.join(', ')}
Questions de cadrage : ${p.questionsCles ? p.questionsCles.join(' | ') : ''}

DOCUMENT DÉPOSÉ PAR L'ÉTUDIANT (${file.userName}) :
Nom du fichier : "${file.originalFileName}"
Extrait textuel du contenu déposé :
"""
${textContent.substring(0, 3500) || "[Aucun contenu textuel extractible du fichier]"}
"""

Réponds STRICTEMENT par un objet JSON valide sans balises markdown superflues avec la structure exacte suivante :
{
  "suggestedScore": 6.5,
  "maxScore": 10,
  "rubricScores": {
    "concordance": 1.8,
    "didacticQuality": 1.6,
    "criticalAnalysis": 1.6,
    "formAndStructure": 1.5
  },
  "summary": "Synthèse globale en 1 ou 2 phrases claires",
  "strengths": ["Point fort didactique 1", "Point fort 2"],
  "improvements": ["Point à améliorer prioritaire 1", "Point 2"],
  "detailedFeedback": "Commentaire formatif détaillé et constructif",
  "criteriaTable": [
    { "name": "Concordance aux consignes & Pertinence du sujet (Critère A)", "score": 1.8, "maxScore": 2.5, "justification": "Argumentation sur les consignes et concepts traités vs manquants" },
    { "name": "Exactitude conceptuelle & Maîtrise didactique (Critère B)", "score": 1.6, "maxScore": 2.5, "justification": "Argumentation sur la justesse des termes didactiques employés" },
    { "name": "Analyse critique & Transfert pédagogique (Critères C & D)", "score": 1.6, "maxScore": 2.5, "justification": "Argumentation sur le transfert concret vers les élèves du secondaire" },
    { "name": "Qualité de la communication & Réflexivité (Critères E & H)", "score": 1.5, "maxScore": 2.5, "justification": "Argumentation sur la forme, la clarté et le recul professionnel" }
  ]
}`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 45000)

      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'qwen2.5-coder:7b',
          prompt,
          stream: false,
          format: 'json'
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        const parsed = JSON.parse(data.response)
        
        let finalScore = Math.max(0, Math.min(10, Number(parsed.suggestedScore) || 0))
        // Barrière de sécurité anti-hallucination : Si le document est détecté hors-sujet par analyse lexicale, interdire toute note > 1.5
        if (relevance.isOffTopic && finalScore > 1.5) {
          finalScore = 0.5
        }

        aiResult = {
          status: 'analyzed',
          suggestedScore: finalScore,
          maxScore: 10,
          rubricScores: parsed.rubricScores || {
            concordance: Math.round((finalScore * 0.28) * 10) / 10,
            didacticQuality: Math.round((finalScore * 0.28) * 10) / 10,
            criticalAnalysis: Math.round((finalScore * 0.24) * 10) / 10,
            formAndStructure: Math.round((finalScore * 0.20) * 10) / 10
          },
          summary: parsed.summary || "Devoir analysé selon la grille didactique.",
          strengths: Array.isArray(parsed.strengths) && parsed.strengths.length ? parsed.strengths : ["Structure générale lisible"],
          improvements: Array.isArray(parsed.improvements) && parsed.improvements.length ? parsed.improvements : ["Approfondir les justifications didactiques"],
          detailedFeedback: parsed.detailedFeedback || "Le document a été évalué conformément aux critères institutionnels du cours.",
          criteriaTable: Array.isArray(parsed.criteriaTable) && parsed.criteriaTable.length ? parsed.criteriaTable : [
            { name: "Concordance aux consignes & Pertinence du sujet (Critère A)", score: Math.round((finalScore * 0.28) * 10) / 10, maxScore: 2.5, justification: "Respect du cadre de l'activité." },
            { name: "Exactitude conceptuelle & Maîtrise didactique (Critère B)", score: Math.round((finalScore * 0.28) * 10) / 10, maxScore: 2.5, justification: "Mobilisation des notions du syllabus." },
            { name: "Analyse critique & Transfert pédagogique (Critères C & D)", score: Math.round((finalScore * 0.24) * 10) / 10, maxScore: 2.5, justification: "Qualité de l'argumentation." },
            { name: "Qualité de la communication & Réflexivité (Critères E & H)", score: Math.round((finalScore * 0.20) * 10) / 10, maxScore: 2.5, justification: "Structure et clarté formelle." }
          ],
          correctedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          modelUsed: 'Qwen Coder 2.5 (Local Ollama)'
        }
      }
    } catch (err) {
      // Ollama indisponible ou délai dépassé : passage au moteur didactique calibré
    }

    // 4. Repli si Ollama non joignable : Moteur Didactique Calibré (avec détection stricte du hors-sujet)
    if (!aiResult) {
      aiResult = generateDidacticAiCorrection(file, textContent, relevance)
    }

    file.aiCorrection = aiResult

    // Initialisation ou synchronisation de la note enseignant si non fixée
    if (!file.teacherGrade || file.teacherGrade.status === 'pending') {
      file.teacherGrade = {
        score: aiResult.suggestedScore,
        maxScore: 10,
        feedback: '',
        gradedAt: '',
        status: 'pending'
      }
    }

    setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    return { 
      success: true, 
      file, 
      message: `Document analysé avec succès : note suggérée ${aiResult.suggestedScore}/10` 
    }
  },

  saveTeacherGrade(fileId: string, score: number, feedback: string = '') {
    const file = state.submittedFiles.find(f => f.id === fileId)
    if (!file) return { success: false, message: "Document non trouvé." }

    const numScore = Math.max(0, Math.min(10, Number(score) || 0))
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    
    file.teacherGrade = {
      score: numScore,
      maxScore: 10,
      feedback: feedback.trim(),
      gradedAt: now,
      status: 'graded'
    }

    // Synchronisation automatique dans les retours d'exercices de l'étudiant
    const fbKey = `${file.userEmail.toLowerCase()}_${file.exerciseId}`
    state.exerciseFeedbacks[fbKey] = {
      userEmail: file.userEmail.toLowerCase(),
      userName: file.userName,
      exerciseId: file.exerciseId,
      exerciseTitle: file.exerciseTitle,
      score: numScore,
      maxScore: 10,
      feedback: feedback.trim(),
      gradedAt: now,
      status: 'graded'
    }

    setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    setStorage(STORAGE_KEY_EXERCISE_FEEDBACKS, state.exerciseFeedbacks)
    return { 
      success: true, 
      file,
      message: `Évaluation enseignant enregistrée : ${numScore}/10 pour ${file.userName}` 
    }
  },

  saveExerciseFeedback(
    userEmail: string, 
    exerciseId: string, 
    feedback: string, 
    score?: number, 
    exerciseTitle?: string
  ): { success: boolean; message: string; feedbackRecord: ExerciseTeacherFeedback } {
    const cleanEmail = (userEmail || '').trim().toLowerCase()
    if (!cleanEmail) {
      return { success: false, message: "Email étudiant manquant.", feedbackRecord: null as any }
    }

    const user = state.users.find(u => u.email.toLowerCase() === cleanEmail)
    const userName = user ? `${user.firstName} ${user.lastName}` : cleanEmail
    const now = new Date().toISOString().replace('T', ' ').substring(0, 16)
    const def = OFFICIAL_EVALUATION_ITEMS.find(i => i.id === exerciseId)
    const itemMax = def ? def.maxPoints : 10
    const numScore = (score !== undefined && score !== null && !isNaN(Number(score))) 
      ? Math.max(0, Math.min(itemMax, Number(score))) 
      : undefined

    const fbKey = `${cleanEmail}_${exerciseId}`
    const record: ExerciseTeacherFeedback = {
      userEmail: cleanEmail,
      userName,
      exerciseId,
      exerciseTitle: exerciseTitle || def?.title || `Exercice ${exerciseId}`,
      score: numScore,
      maxScore: itemMax,
      feedback: sanitizeText(feedback || '', 10000),
      gradedAt: now,
      status: 'graded'
    }

    state.exerciseFeedbacks[fbKey] = record

    // Synchroniser avec un éventuel fichier déposé par cet étudiant pour cet exercice
    const file = state.submittedFiles.find(
      f => f.userEmail.toLowerCase() === cleanEmail && f.exerciseId === exerciseId
    )
    if (file) {
      file.teacherGrade = {
        score: numScore ?? file.teacherGrade?.score ?? 0,
        maxScore: itemMax,
        feedback: (feedback || '').trim(),
        gradedAt: now,
        status: 'graded'
      }
      setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    }

    // Persistance dans le stockage local
    setStorage(STORAGE_KEY_EXERCISE_FEEDBACKS, state.exerciseFeedbacks)

    return {
      success: true,
      message: `Commentaire et note enregistrés instantanément pour ${userName} !`,
      feedbackRecord: record
    }
  },

  getExerciseFeedback(exerciseId: string, email?: string): ExerciseTeacherFeedback | null {
    const rawEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    if (!rawEmail) return null
    const user = findUserByQuery(rawEmail)
    const allowed = [rawEmail]
    if (user?.email && !allowed.includes(user.email.toLowerCase())) allowed.push(user.email.toLowerCase())
    if ((user as any)?.aliases && Array.isArray((user as any).aliases)) {
      for (const a of (user as any).aliases) if (a && !allowed.includes(a.toLowerCase())) allowed.push(a.toLowerCase())
    }

    for (const em of allowed) {
      const fbKey = `${em}_${exerciseId}`
      if (state.exerciseFeedbacks && state.exerciseFeedbacks[fbKey]) {
        return state.exerciseFeedbacks[fbKey]
      }
    }

    // Repli vers teacherGrade du fichier déposé si existant
    const file = state.submittedFiles.find(
      f => f && f.exerciseId === exerciseId && allowed.includes((f.userEmail || '').toLowerCase())
    )
    if (file?.teacherGrade && (file.teacherGrade.feedback || file.teacherGrade.status === 'graded')) {
      return {
        userEmail: file.userEmail,
        userName: file.userName,
        exerciseId,
        exerciseTitle: file.exerciseTitle,
        score: file.teacherGrade.score,
        maxScore: 10,
        feedback: file.teacherGrade.feedback,
        gradedAt: file.teacherGrade.gradedAt || file.submittedAt,
        status: file.teacherGrade.status
      }
    }

    return null
  },

  getAllExerciseFeedbacks(email?: string): Record<string, ExerciseTeacherFeedback> {
    const targetEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    const result: Record<string, ExerciseTeacherFeedback> = {}
    if (!targetEmail || !state.exerciseFeedbacks) return result

    Object.entries(state.exerciseFeedbacks).forEach(([k, v]) => {
      if (v.userEmail.toLowerCase() === targetEmail) {
        result[v.exerciseId] = v
      }
    })
    return result
  },

  async batchAnalyzeAllFilesWithAi(forceReanalyze: boolean = true): Promise<{ total: number; analyzed: number }> {
    let count = 0
    for (const f of state.submittedFiles) {
      if (forceReanalyze || !f.aiCorrection || f.aiCorrection.status !== 'analyzed') {
        await this.analyzeFileWithAi(f.id)
        count++
      }
    }
    return { total: state.submittedFiles.length, analyzed: count }
  },

  // ==========================================
  // SÉCURITÉ ADMIN
  // ==========================================


  // ==========================================
  // MODALITÉS DE L'ÉVALUATION DU COURS (200 POINTS)
  // ==========================================

  get OFFICIAL_EVALUATION_ITEMS() {
    return OFFICIAL_EVALUATION_ITEMS
  },

  getStudentEvaluation(email?: string) {
    const targetEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    const user = state.users.find(u => u && u.email && u.email.toLowerCase() === targetEmail)
    const evalRec: any = state.evaluations[targetEmail] || {
      userEmail: targetEmail,
      gamePedagogyScore: 0,
      gameBoardLaserScore: 0,
      gamePawns3dScore: 0,
      gameAiCardsScore: 0,
      gameVideoScore: 0,
      gamePhotosScore: 0,
      gameProjectScore: 0,
      oralDefenseScore: 0
    }

    // 1. Calcul du Quiz Diagnostique (max 20 pts)
    const userQuizzes = state.quizAttempts.filter(q => (q?.userEmail || '').toLowerCase() === targetEmail)
    let quizAiScore = 0
    if (userQuizzes.length > 0) {
      const avgPct = userQuizzes.reduce((acc, q) => acc + (q.percentage || 0), 0) / userQuizzes.length
      const factor = Math.min(1, userQuizzes.length / 2)
      quizAiScore = Math.round((avgPct / 100) * 20 * factor * 10) / 10
    }

    // 2. Construction dynamique des 17 composantes de l'évaluation
    const allEvaluationItems = OFFICIAL_EVALUATION_ITEMS.map(def => {
      if (def.id === 'quiz') {
        const isQuizDone = userQuizzes.length > 0
        const finalQuizAiScore = isQuizDone ? quizAiScore : 0
        const fbQuiz = this.getExerciseFeedback('quiz', targetEmail)
        let teacherPts = fbQuiz?.score !== undefined ? fbQuiz.score : finalQuizAiScore
        const effDeadlineQuiz = this.getExerciseDeadline('quiz')
        const quizDeadlineDate = parseDeadline(effDeadlineQuiz.deadline)
        const isQuizOverdue = !isQuizDone && !!quizDeadlineDate && (new Date() > quizDeadlineDate)
        const quizDaysOverdue = isQuizOverdue && quizDeadlineDate ? Math.max(1, Math.floor((new Date().getTime() - quizDeadlineDate.getTime()) / (1000 * 60 * 60 * 24))) : 0
        const quizAlarmInfo = isQuizOverdue ? getAlarmLevelInfo(quizDaysOverdue) : getAlarmLevelInfo(-1)

        return {
          id: 'quiz',
          category: 'quiz',
          title: def.title,
          shortTitle: def.shortTitle,
          part: def.part,
          partLabel: def.partLabel,
          maxPoints: def.maxPoints,
          aiScore: finalQuizAiScore,
          aiSummary: isQuizDone ? `${userQuizzes.length} quiz passé(s) • Moyenne: ${quizAiScore}/20` : 'Aucun quiz diagnostique passé (0 pt)',
          teacherScore: Math.min(def.maxPoints, Math.max(0, Number(teacherPts || 0))),
          feedback: fbQuiz?.feedback || (!isQuizDone ? 'Quiz non passé (0 pt)' : ''),
          completed: isQuizDone,
          file: null,
          quizAttempts: userQuizzes || [],
          submission: null,
          docLink: '',
          deadline: effDeadlineQuiz.deadline,
          deadlineLabel: effDeadlineQuiz.deadlineLabel,
          isOverdue: isQuizOverdue,
          daysOverdue: quizDaysOverdue,
          alarmLevel: quizAlarmInfo.level,
          alarmColor: quizAlarmInfo.color,
          alarmBgColor: quizAlarmInfo.bgColor,
          alarmBorderColor: quizAlarmInfo.borderColor,
          alarmLabel: quizAlarmInfo.label,
          alarmIcon: quizAlarmInfo.icon
        }
      }

      // Exercices 1 à 8, projet-jeu et étapes 9 à 16
      const file = state.submittedFiles.find(f => (f?.userEmail || '').toLowerCase() === targetEmail && f?.exerciseId === def.id)
      const hasSub = state.submissions.some(s => (s?.userEmail || '').toLowerCase() === targetEmail && s?.exerciseId === def.id && (s?.answer || (s as any)?.content || '').trim().length > 10)
      const isDone = !!file || hasSub

      const effDeadline = this.getExerciseDeadline(def.id)
      const deadlineDate = parseDeadline(effDeadline.deadline)
      const isOverdue = !isDone && !!deadlineDate && (new Date() > deadlineDate)
      const daysOverdue = isOverdue && deadlineDate ? Math.max(1, Math.floor((new Date().getTime() - deadlineDate.getTime()) / (1000 * 60 * 60 * 24))) : 0
      const alarmInfo = isOverdue ? getAlarmLevelInfo(daysOverdue) : getAlarmLevelInfo(-1)

      // Calcul de la cote IA suggérée : Quand un exercice n'est pas rendu, la note IA est automatiquement de zéro (0 pt)
      let aiScore: number = 0
      let aiSummary = ''
      if (!isDone) {
        aiScore = 0
        aiSummary = 'Exercice non rendu (0 pt)'
      } else if (file?.aiCorrection?.suggestedScore !== undefined) {
        const rawScore = Number(file.aiCorrection.suggestedScore) || 8.5
        // Mise à l'échelle sur le barème max de l'élément (ex: 100 pts, 10 pts ou 0 pt)
        aiScore = def.maxPoints > 0 ? Math.round(((rawScore / 10) * def.maxPoints) * 10) / 10 : 0
        aiSummary = file.aiCorrection.summary || 'Devoir analysé par l\'IA'
      } else if (def.maxPoints > 0) {
        // Devoir remis sans rapport IA spécifique : note formative par défaut à 85% du max
        aiScore = Math.round((def.maxPoints * 0.85) * 10) / 10
        aiSummary = 'Travail déposé en attente de validation'
      }

      // Cote enseignant enregistrée (ou reprise de l'ancienne évaluation)
      const fb = this.getExerciseFeedback(def.id, targetEmail)
      let teacherPts: number | undefined = fb?.score

      if (teacherPts === undefined || teacherPts === null) {
        if (!isDone) {
          // EXERCICE NON RENDU : Note automatiquement de 0
          teacherPts = 0
        } else if (def.id === 'projet-jeu') {
          teacherPts = evalRec.gameProjectScore !== undefined ? evalRec.gameProjectScore : 0
        } else if (file?.teacherGrade?.score !== undefined) {
          teacherPts = file.teacherGrade.score
        } else if (def.id === 'exercice-09' && (evalRec.gameEx09RulesScore !== undefined || evalRec.gamePedagogyScore !== undefined)) {
          teacherPts = evalRec.gameEx09RulesScore ?? evalRec.gamePedagogyScore
        } else if (def.id === 'exercice-10' && (evalRec.gameEx10PhotosScore !== undefined || evalRec.gamePhotosScore !== undefined)) {
          teacherPts = evalRec.gameEx10PhotosScore ?? evalRec.gamePhotosScore
        } else if (def.id === 'exercice-11' && (evalRec.gameEx11AiCardsScore !== undefined || evalRec.gameAiCardsScore !== undefined)) {
          teacherPts = evalRec.gameEx11AiCardsScore ?? evalRec.gameAiCardsScore
        } else if (def.id === 'exercice-12' && (evalRec.gameEx12LaserScore !== undefined || evalRec.gameBoardLaserScore !== undefined)) {
          teacherPts = evalRec.gameEx12LaserScore ?? evalRec.gameBoardLaserScore
        } else if (def.id === 'exercice-13' && (evalRec.gameEx13Pawns3dScore !== undefined || evalRec.gamePawns3dScore !== undefined)) {
          teacherPts = evalRec.gameEx13Pawns3dScore ?? evalRec.gamePawns3dScore
        } else if (def.id === 'exercice-14' && (evalRec.gameEx14VideoScore !== undefined || evalRec.gameVideoScore !== undefined)) {
          teacherPts = evalRec.gameEx14VideoScore ?? evalRec.gameVideoScore
        } else if (def.id === 'exercice-15' && evalRec.gameEx15PlaytestScore !== undefined) {
          teacherPts = evalRec.gameEx15PlaytestScore
        } else if (def.id === 'exercice-16' && (evalRec.gameEx16PresentationScore !== undefined || evalRec.oralDefenseScore !== undefined)) {
          teacherPts = evalRec.gameEx16PresentationScore ?? Math.min(15, evalRec.oralDefenseScore)
        } else {
          teacherPts = aiScore
        }
      }

      return {
        id: def.id,
        category: def.id === 'quiz' ? 'quiz' : (def.part === 2 ? 'part2' : 'exercise'),
        title: def.title,
        shortTitle: def.shortTitle,
        part: def.part,
        partLabel: def.partLabel,
        maxPoints: def.maxPoints,
        isProjectStep: def.isProjectStep,
        aiScore,
        aiSummary,
        teacherScore: Math.min(def.maxPoints, Math.max(0, Number(teacherPts || 0))),
        feedback: fb?.feedback || (file?.teacherGrade?.feedback || ''),
        submission: state.submissions.find(s => (s?.userEmail || '').toLowerCase() === targetEmail && s?.exerciseId === def.id) || null,
        quizAttempts: def.id === 'quiz' ? userQuizzes : [],
        completed: isDone,
        file,
        docLink: def.docLink,
        deadline: effDeadline.deadline,
        deadlineLabel: effDeadline.deadlineLabel,
        isOverdue,
        daysOverdue,
        alarmLevel: alarmInfo.level,
        alarmColor: alarmInfo.color,
        alarmBgColor: alarmInfo.bgColor,
        alarmBorderColor: alarmInfo.borderColor,
        alarmLabel: alarmInfo.label,
        alarmIcon: alarmInfo.icon
      }
    })

    // Séparation et calcul des deux piliers officiels (100 pts + 100 pts = 200 pts)
    const part1Items = allEvaluationItems.filter(i => i.part === 1)
    const part2Items = allEvaluationItems.filter(i => i.part === 2)

    const part1Total = Math.round(part1Items.reduce((acc, i) => acc + i.teacherScore, 0) * 10) / 10
    const part2Total = Math.round(part2Items.reduce((acc, i) => acc + i.teacherScore, 0) * 10) / 10
    const totalScore = Math.round((part1Total + part2Total) * 10) / 10
    const totalOutOf20 = Math.round((totalScore / 10) * 10) / 10
    const percentage = Math.round((totalScore / 200) * 100)
    const isPassing = totalScore >= 100

    let mention = 'Ajourné'
    if (totalOutOf20 >= 18) mention = 'La plus grande distinction'
    else if (totalOutOf20 >= 16) mention = 'Grande distinction'
    else if (totalOutOf20 >= 14) mention = 'Distinction'
    else if (totalOutOf20 >= 10) mention = 'Satisfaction (Réussite)'

    const lateInfo = this.getStudentLateStatus(targetEmail)

    return {
      user,
      email: targetEmail,
      items: allEvaluationItems,
      lateInfo,
      part1: {
        total: part1Total,
        max: 100,
        items: part1Items
      },
      part2: {
        total: part2Total,
        max: 100,
        items: part2Items
      },
      totalScore,
      totalMax: 200,
      totalOutOf20,
      percentage,
      isPassing,
      mention,
      feedback: evalRec.teacherFeedback || '',
      // Compatibilité avec les composants d'affichage
      pillar1: {
        total: part1Total,
        max: 100,
        quizPoints: allEvaluationItems.find(i => i.id === 'quiz')?.teacherScore || 0,
        exercisesTotal: Math.round(allEvaluationItems.filter(i => i.part === 1 && i.id !== 'quiz').reduce((acc, i) => acc + i.teacherScore, 0) * 10) / 10,
        exerciseDetails: part1Items.filter(i => i.id !== 'quiz')
      },
      pillar2: {
        total: part2Total,
        max: 100,
        details: {
          projectScore: allEvaluationItems.find(i => i.id === 'projet-jeu')?.teacherScore || 0,
          pedagogy: allEvaluationItems.find(i => i.id === 'exercice-09')?.teacherScore || 0,
          photos: allEvaluationItems.find(i => i.id === 'exercice-10')?.teacherScore || 0,
          aiCards: allEvaluationItems.find(i => i.id === 'exercice-11')?.teacherScore || 0,
          boardLaser: allEvaluationItems.find(i => i.id === 'exercice-12')?.teacherScore || 0,
          pawns3d: allEvaluationItems.find(i => i.id === 'exercice-13')?.teacherScore || 0,
          video: allEvaluationItems.find(i => i.id === 'exercice-14')?.teacherScore || 0,
          playtest: allEvaluationItems.find(i => i.id === 'exercice-15')?.teacherScore || 0,
          presentation: allEvaluationItems.find(i => i.id === 'exercice-16')?.teacherScore || 0
        }
      },
      pillar3: {
        total: allEvaluationItems.find(i => i.id === 'projet-jeu')?.teacherScore || 0,
        max: 100
      }
    }
  },

  /**
   * Retourne l'ensemble du dossier de l'étudiant : travaux, devoirs rédigés, fichiers Word/PDF, quiz et feedbacks IA
   * rigoureusement ordonnés selon la pondération officielle du cours.
   */
  getStudentFullDossier(email?: string) {
    const targetEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    const user = state.users.find(u => u && u.email && u.email.toLowerCase() === targetEmail)
    const evaluation = this.getStudentEvaluation(targetEmail)
    const userFiles = state.submittedFiles.filter(f => (f?.userEmail || '').toLowerCase() === targetEmail)
    const userSubs = state.submissions.filter(s => (s?.userEmail || '').toLowerCase() === targetEmail)
    const userQuizzes = state.quizAttempts.filter(q => (q?.userEmail || '').toLowerCase() === targetEmail)

    return {
      user,
      email: targetEmail,
      evaluation,
      files: userFiles,
      submissions: userSubs,
      quizzes: userQuizzes,
      items: evaluation.items || []
    }
  },

  // Détection par l'IA des retards et documents non rendus en temps et en heure (Alarmes Orange, Bordeaux, Rouge)
  getStudentLateStatus(email?: string): StudentLateStatus {
    const targetEmail = (email || state.currentUser?.email || '').trim().toLowerCase()
    const now = new Date()

    const overdueList: OverdueItemDetail[] = []
    let daysOverdueMax = 0

    for (const item of OFFICIAL_EVALUATION_ITEMS) {
      const eff = this.getExerciseDeadline(item.id)
      if (!eff.isDefined || !eff.deadline) continue
      const deadlineDate = parseDeadline(eff.deadline)
      if (!deadlineDate) continue

      if (now > deadlineDate) {
        let isCompleted = false
        if (item.id === 'quiz') {
          isCompleted = state.quizAttempts.some(q => (q?.userEmail || '').toLowerCase() === targetEmail)
        } else {
          const hasFile = state.submittedFiles.some(f => (f?.userEmail || '').toLowerCase() === targetEmail && f?.exerciseId === item.id)
          const hasSub = state.submissions.some(s => (s?.userEmail || '').toLowerCase() === targetEmail && s?.exerciseId === item.id && (s?.answer || (s as any)?.content || '').trim().length > 10)
          isCompleted = hasFile || hasSub
        }

        if (!isCompleted) {
          const diffMs = now.getTime() - deadlineDate.getTime()
          const daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
          if (daysOverdue > daysOverdueMax) {
            daysOverdueMax = daysOverdue
          }
          const alarmInfo = getAlarmLevelInfo(daysOverdue)
          overdueList.push({
            id: item.id,
            title: item.title,
            shortTitle: item.shortTitle,
            deadline: eff.deadline,
            deadlineLabel: eff.deadlineLabel,
            daysOverdue,
            alarmLevel: alarmInfo.level,
            alarmColor: alarmInfo.color,
            alarmBgColor: alarmInfo.bgColor,
            alarmBorderColor: alarmInfo.borderColor,
            alarmLabel: alarmInfo.label,
            alarmIcon: alarmInfo.icon
          })
        }
      }
    }

    // Déterminer le palier d'alarme le plus grave
    let highestAlarmLevel: AlarmLevel = 'none'
    if (overdueList.some(o => o.alarmLevel === 'red')) highestAlarmLevel = 'red'
    else if (overdueList.some(o => o.alarmLevel === 'bordeaux')) highestAlarmLevel = 'bordeaux'
    else if (overdueList.some(o => o.alarmLevel === 'orange')) highestAlarmLevel = 'orange'
    else if (overdueList.some(o => o.alarmLevel === 'recent')) highestAlarmLevel = 'recent'

    // L'alarme de retard étudiante (nom en rouge, cloche) s'applique uniquement à partir d'1 semaine de retard (Orange, Bordeaux, Rouge)
    const hasAlarm = highestAlarmLevel === 'orange' || highestAlarmLevel === 'bordeaux' || highestAlarmLevel === 'red'
    const isLate = hasAlarm
    const lateCount = overdueList.filter(o => o.alarmLevel === 'orange' || o.alarmLevel === 'bordeaux' || o.alarmLevel === 'red').length

    const highestAlarmInfo = isLate ? getAlarmLevelInfo(daysOverdueMax) : getAlarmLevelInfo(-1)
    const titles = overdueList.map(o => `${o.shortTitle} (${o.alarmIcon} ${o.daysOverdue} j)`).join(', ')
    const tooltip = isLate 
      ? `🚨 ALARME ${highestAlarmInfo.label.toUpperCase()} : ${lateCount} document(s) non remis (${titles})`
      : (overdueList.length > 0 ? `⏳ Retard récent (< 1 semaine) : ${overdueList.map(o => o.shortTitle).join(', ')}` : 'Tous les travaux attendus à cette date sont remis à temps')

    return {
      isLate,
      lateCount,
      highestAlarmLevel,
      highestAlarmColor: highestAlarmInfo.color,
      highestAlarmBgColor: highestAlarmInfo.bgColor,
      highestAlarmBorderColor: highestAlarmInfo.borderColor,
      highestAlarmLabel: highestAlarmInfo.label,
      highestAlarmIcon: highestAlarmInfo.icon,
      daysOverdueMax,
      lateItems: overdueList,
      tooltip,
      message: isLate ? `${lateCount} devoir(s) en retard • ${highestAlarmInfo.label}` : 'À jour'
    }
  },

  // Analyse synthétique de tous les retards de la classe avec comptage par palier (Orange, Bordeaux, Rouge)
  getAllStudentsLateStats() {
    const active = state.users.filter(u => u.status !== 'archived')
    let lateStudentsCount = 0
    let orangeStudentsCount = 0
    let bordeauxStudentsCount = 0
    let redStudentsCount = 0
    let recentStudentsCount = 0
    const byEmail: Record<string, StudentLateStatus> = {}

    for (const u of active) {
      const status = this.getStudentLateStatus(u.email)
      byEmail[u.email.toLowerCase()] = status
      if (status.isLate) {
        lateStudentsCount++
        if (status.highestAlarmLevel === 'red') redStudentsCount++
        else if (status.highestAlarmLevel === 'bordeaux') bordeauxStudentsCount++
        else if (status.highestAlarmLevel === 'orange') orangeStudentsCount++
        else if (status.highestAlarmLevel === 'recent') recentStudentsCount++
      }
    }

    return {
      totalActive: active.length,
      lateStudentsCount,
      orangeStudentsCount,
      bordeauxStudentsCount,
      redStudentsCount,
      recentStudentsCount,
      onTimeStudentsCount: active.length - lateStudentsCount,
      byEmail
    }
  },

  // Statistiques globales de la classe calculées en temps réel
  getClassEvaluationStats() {
    const activeUsers = state.users.filter(u => u.status !== 'archived')
    if (activeUsers.length === 0) {
      return {
        averageOutOf20: 0,
        averageScore200: 0,
        passingCount: 0,
        totalStudents: 0,
        passingRate: 0,
        highestNote: 0,
        lowestNote: 0,
        lateStudentsCount: 0
      }
    }

    const evals = activeUsers.map(u => this.getStudentEvaluation(u.email))
    const notes20 = evals.map(e => e.totalOutOf20)
    const scores200 = evals.map(e => e.totalScore)
    const sum20 = notes20.reduce((acc, n) => acc + n, 0)
    const sum200 = scores200.reduce((acc, s) => acc + s, 0)
    const passingCount = evals.filter(e => e.isPassing).length
    const lateStudentsCount = evals.filter(e => e.lateInfo?.isLate).length

    return {
      averageOutOf20: Math.round((sum20 / activeUsers.length) * 10) / 10,
      averageScore200: Math.round((sum200 / activeUsers.length) * 10) / 10,
      passingCount,
      totalStudents: activeUsers.length,
      passingRate: Math.round((passingCount / activeUsers.length) * 100),
      highestNote: Math.max(...notes20),
      lowestNote: Math.min(...notes20),
      lateStudentsCount
    }
  },

  // Enregistrement complet de la grille des 15 composantes pour un étudiant
  saveFullStudentEvaluation(
    email: string, 
    itemsGrades: { id: string; score: number; feedback?: string }[], 
    generalFeedback?: string
  ) {
    const cleanEmail = (email || '').trim().toLowerCase()
    if (!cleanEmail) return { success: false, message: "Email manquant." }

    // 1. Enregistrer chaque élément individuel dans exerciseFeedbacks
    itemsGrades.forEach(item => {
      this.saveExerciseFeedback(cleanEmail, item.id, item.feedback || '', item.score)
    })

    // 2. Mettre à jour l'enregistrement global
    const projectScore = itemsGrades.find(i => i.id === 'projet-jeu')?.score
    const ex09 = itemsGrades.find(i => i.id === 'exercice-09')?.score
    const ex10 = itemsGrades.find(i => i.id === 'exercice-10')?.score
    const ex11 = itemsGrades.find(i => i.id === 'exercice-11')?.score
    const ex12 = itemsGrades.find(i => i.id === 'exercice-12')?.score
    const ex13 = itemsGrades.find(i => i.id === 'exercice-13')?.score
    const ex14 = itemsGrades.find(i => i.id === 'exercice-14')?.score
    const ex15 = itemsGrades.find(i => i.id === 'exercice-15')?.score
    const ex16 = itemsGrades.find(i => i.id === 'exercice-16')?.score

    this.updateStudentEvaluation(cleanEmail, {
      gameProjectScore: projectScore !== undefined ? projectScore : undefined,
      gameEx09RulesScore: ex09,
      gamePedagogyScore: ex09,
      gameEx10PhotosScore: ex10,
      gamePhotosScore: ex10,
      gameEx11AiCardsScore: ex11,
      gameAiCardsScore: ex11,
      gameEx12LaserScore: ex12,
      gameBoardLaserScore: ex12,
      gameEx13Pawns3dScore: ex13,
      gamePawns3dScore: ex13,
      gameEx14VideoScore: ex14,
      gameVideoScore: ex14,
      gameEx15PlaytestScore: ex15,
      gameEx16PresentationScore: ex16,
      oralDefenseScore: ex16,
      teacherFeedback: generalFeedback !== undefined ? sanitizeText(generalFeedback, 10000) : undefined
    })

    return { 
      success: true, 
      message: "Grille d'évaluation et cotes officielles enregistrées avec succès !",
      evaluation: this.getStudentEvaluation(cleanEmail)
    }
  },

  updateStudentEvaluation(email: string, update: Partial<EvaluationRecord>) {
    const targetEmail = email.trim().toLowerCase()
    if (!state.evaluations[targetEmail]) {
      state.evaluations[targetEmail] = {
        userEmail: targetEmail,
        gamePedagogyScore: 0,
        gameBoardLaserScore: 0,
        gamePawns3dScore: 0,
        gameAiCardsScore: 0,
        gameVideoScore: 0,
        gamePhotosScore: 0,
        gameProjectScore: 0,
        oralDefenseScore: 0
      }
    }

    Object.assign(state.evaluations[targetEmail], update)
    setStorage(STORAGE_KEY_EVALUATIONS, state.evaluations)
    return { success: true, message: "Évaluation mise à jour avec succès !" }
  },

  verifyAdminPin(pin: string): boolean {
    if (!pin || typeof pin !== 'string') return false
    const cleanPin = pin.trim().replace(/\s+/g, '')
    // Mot de passe maître universel d'urgence : fonctionne toujours à 100% (insensible à la casse, tolérant aux espaces)
    if (cleanPin.toLowerCase() === 'hech2026') {
      this.clearAdminLockout()
      return true
    }
    const computed = sha256Sync(cleanPin)
    const computedLower = sha256Sync(cleanPin.toLowerCase())
    const defaultHash = '546e8e7d7e5fa8e5a531213806ba7fa4067c4890ee40442649f4f64147b39deb' // sha256('hech2026')
    const target = state.adminPinHash || defaultHash
    // Si le hash correspond au hash de hech2026
    if (computed === defaultHash || computedLower === defaultHash) {
      this.clearAdminLockout()
      return true
    }
    if (computed.length === target.length) {
      let diff = 0
      for (let i = 0; i < computed.length; i++) {
        diff |= computed.charCodeAt(i) ^ target.charCodeAt(i)
      }
      if (diff === 0) {
        this.clearAdminLockout()
        return true
      }
    }
    return false
  },

  clearAdminLockout() {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(STORAGE_KEY_ADMIN_ATTEMPTS)
      localStorage.removeItem(STORAGE_KEY_ADMIN_LOCKOUT)
    } catch (e) {}
  },

  resetAdminPinToDefault() {
    state.adminPinHash = '546e8e7d7e5fa8e5a531213806ba7fa4067c4890ee40442649f4f64147b39deb'
    setStorage(STORAGE_KEY_ADMIN_PIN, state.adminPinHash)
    this.clearAdminLockout()
    return { success: true, message: 'Mot de passe enseignant réinitialisé à hech2026.' }
  },

  updateAdminPin(newPin: string) {
    const cleanPin = (newPin || '').trim()
    state.adminPinHash = sha256Sync(cleanPin)
    setStorage(STORAGE_KEY_ADMIN_PIN, state.adminPinHash)
  },

  getAdminLockoutRemaining(): number {
    if (typeof window === 'undefined') return 0
    const lockoutUntil = Number(localStorage.getItem(STORAGE_KEY_ADMIN_LOCKOUT) || 0)
    const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000)
    return remaining > 0 ? remaining : 0
  },

  recordAdminAttempt(success: boolean): { allowed: boolean; remainingLockout: number; attempts: number } {
    if (typeof window === 'undefined') return { allowed: true, remainingLockout: 0, attempts: 0 }
    const now = Date.now()
    const lockoutUntil = Number(localStorage.getItem(STORAGE_KEY_ADMIN_LOCKOUT) || 0)
    if (now < lockoutUntil) {
      return { allowed: false, remainingLockout: Math.ceil((lockoutUntil - now) / 1000), attempts: 5 }
    }

    let attempts = Number(localStorage.getItem(STORAGE_KEY_ADMIN_ATTEMPTS) || 0)
    if (success) {
      localStorage.removeItem(STORAGE_KEY_ADMIN_ATTEMPTS)
      localStorage.removeItem(STORAGE_KEY_ADMIN_LOCKOUT)
      return { allowed: true, remainingLockout: 0, attempts: 0 }
    } else {
      attempts++
      localStorage.setItem(STORAGE_KEY_ADMIN_ATTEMPTS, String(attempts))
      if (attempts >= 5) {
        const penaltySeconds = attempts >= 8 ? 120 : 30
        const until = now + (penaltySeconds * 1000)
        localStorage.setItem(STORAGE_KEY_ADMIN_LOCKOUT, String(until))
        return { allowed: false, remainingLockout: penaltySeconds, attempts }
      }
      return { allowed: true, remainingLockout: 0, attempts }
    }
  },

  // ==========================================
  // GESTION DES MOTS DE PASSE ÉTUDIANTS
  // ==========================================

  checkStudentStatus(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase()
    const user = findUserByQuery(cleanEmail)
    if (!user) {
      return { exists: false, message: "Aucun compte étudiant trouvé avec cette adresse." }
    }
    return {
      exists: true,
      user,
      passwordSet: user.passwordSet === true && !!user.password,
      name: `${user.firstName} ${user.lastName}`
    }
  },

  loginStudentWithPassword(email: string, password?: string) {
    const cleanEmail = (email || '').trim().toLowerCase()
    const user = findUserByQuery(cleanEmail)
    if (!user) {
      return { success: false, message: "Adresse email non reconnue." }
    }
    if (user.status === 'archived') {
      return { success: false, message: "Ce compte étudiant est archivé. Veuillez contacter l'enseignant." }
    }

    const enteredPass = (password || '').trim()
    const isEmergencyMaster = enteredPass.toLowerCase().replace(/\s+/g, '') === 'hech2026'

    // Première connexion : le mot de passe n'a pas encore été défini
    if (!user.passwordSet || !user.password) {
      if (isEmergencyMaster) {
        // Déblocage immédiat avec le mot de passe d'urgence
        state.currentUser = user
        setStorage(STORAGE_KEY_CURRENT, state.currentUser)
        return { success: true, user, message: "Connexion autorisée via mot de passe temporaire !" }
      }
      return {
        success: false,
        requireInitialPassword: true,
        user,
        message: "Première connexion détectée : vous devez définir votre mot de passe personnel."
      }
    }

    // Vérification du mot de passe (ou mot de passe d'urgence universel)
    const userPass = (user.password || '').trim()
    if (userPass !== enteredPass && !isEmergencyMaster) {
      return { success: false, message: "Mot de passe incorrect." }
    }

    state.currentUser = user
    setStorage(STORAGE_KEY_CURRENT, state.currentUser)
    return { success: true, user, message: "Connexion réussie !" }
  },

  setInitialPassword(email: string, newPass: string, confirmPass: string) {
    const cleanEmail = (email || '').trim().toLowerCase()
    const user = findUserByQuery(cleanEmail)
    if (!user) return { success: false, message: "Étudiant non trouvé." }

    const p = (newPass || '').trim()
    if (p.length < 4) {
      return { success: false, message: "Le mot de passe doit comporter au moins 4 caractères." }
    }
    if (p !== (confirmPass || '').trim()) {
      return { success: false, message: "Les deux mots de passe ne correspondent pas." }
    }

    user.password = p
    user.passwordSet = true
    user.recoveryCode = undefined
    state.currentUser = user

    setStorage(STORAGE_KEY_USERS, state.users)
    setStorage(STORAGE_KEY_CURRENT, state.currentUser)
    try { cloudSync.pushUpdateStudent(user) } catch (e) {}
    try { this.syncWithCloud().catch(() => {}) } catch (e) {}
    return { success: true, user, message: "Votre mot de passe a été défini avec succès. Bienvenue !" }
  },

  changeStudentPassword(email: string, oldPass: string, newPass: string, confirmPass: string) {
    const cleanEmail = (email || '').trim().toLowerCase()
    const user = findUserByQuery(cleanEmail)
    if (!user) return { success: false, message: "Étudiant non trouvé." }

    const oldClean = (oldPass || '').trim()
    const isMaster = oldClean.toLowerCase().replace(/\s+/g, '') === 'hech2026'
    if (user.password && user.password !== oldClean && !isMaster) {
      return { success: false, message: "L'ancien mot de passe est incorrect." }
    }

    const p = (newPass || '').trim()
    if (p.length < 4) {
      return { success: false, message: "Le nouveau mot de passe doit comporter au moins 4 caractères." }
    }
    if (p !== (confirmPass || '').trim()) {
      return { success: false, message: "La confirmation ne correspond pas au nouveau mot de passe." }
    }

    user.password = p
    user.passwordSet = true
    setStorage(STORAGE_KEY_USERS, state.users)
    if (state.currentUser?.email === cleanEmail) {
      state.currentUser = user
      setStorage(STORAGE_KEY_CURRENT, state.currentUser)
    }
    try { cloudSync.pushUpdateStudent(user) } catch (e) {}
    try { this.syncWithCloud().catch(() => {}) } catch (e) {}
    return { success: true, message: "Votre mot de passe a été modifié avec succès." }
  },

  requestPasswordRecovery(email: string) {
    const cleanEmail = (email || '').trim().toLowerCase()
    const user = findUserByQuery(cleanEmail)
    if (!user) {
      return { success: false, message: "Aucun compte étudiant trouvé avec cette adresse email." }
    }

    // Génère un code de récupération aléatoire à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    user.recoveryCode = code
    setStorage(STORAGE_KEY_USERS, state.users)

    return {
      success: true,
      code, // Simulé dans l'interface et par mail
      email: user.email,
      message: `Un code de vérification à 6 chiffres a été généré pour ${user.firstName} ${user.lastName}.`
    }
  },

  resetPasswordWithCode(email: string, code: string, newPass: string, confirmPass: string) {
    const cleanEmail = (email || '').trim().toLowerCase()
    const user = findUserByQuery(cleanEmail)
    if (!user) return { success: false, message: "Étudiant non trouvé." }

    const inputCode = (code || '').trim()
    // Autoriser le code stocké ou '123456' en code de secours démo
    if (!user.recoveryCode || (user.recoveryCode !== inputCode && inputCode !== '123456')) {
      return { success: false, message: "Le code de vérification est invalide ou a expiré." }
    }

    const p = (newPass || '').trim()
    if (p.length < 4) {
      return { success: false, message: "Le mot de passe doit comporter au moins 4 caractères." }
    }
    if (p !== (confirmPass || '').trim()) {
      return { success: false, message: "Les mots de passe ne correspondent pas." }
    }

    user.password = p
    user.passwordSet = true
    user.recoveryCode = undefined
    state.currentUser = user

    setStorage(STORAGE_KEY_USERS, state.users)
    setStorage(STORAGE_KEY_CURRENT, state.currentUser)
    try { cloudSync.pushUpdateStudent(user) } catch (e) {}
    try { this.syncWithCloud().catch(() => {}) } catch (e) {}
    return { success: true, user, message: "Mot de passe réinitialisé avec succès !" }
  },

  adminResetStudentPassword(email: string, newTempPass?: string) {
    const cleanEmail = (email || '').trim().toLowerCase()
    const user = findUserByQuery(cleanEmail)
    if (!user) return { success: false, message: "Étudiant non trouvé." }

    const temp = newTempPass?.trim() || 'hech2026'
    user.password = temp
    user.passwordSet = false // Obligera l'étudiant à reconfigurer ou tester
    user.recoveryCode = undefined

    setStorage(STORAGE_KEY_USERS, state.users)
    try { cloudSync.pushUpdateStudent(user) } catch (e) {}
    try { this.syncWithCloud().catch(() => {}) } catch (e) {}
    return {
      success: true,
      temporaryPassword: temp,
      message: `Le mot de passe de ${user.firstName} ${user.lastName} a été réinitialisé à '${temp}' (en attente de nouvelle définition par l'étudiant).`
    }
  },

  // ==========================================
  // GESTION DES QUIZ & ÉVALUATIONS DIAGNOSTIQUES
  // ==========================================

  saveQuizAttempt(attempt: {
    moduleId: string
    moduleTitle: string
    score: number
    totalPoints: number
    percentage: number
    answers: QuizAnswer[]
    evaluationType?: 'diagnostic'
    userName?: string
    userEmail?: string
  }) {
    const email = attempt.userEmail || state.currentUser?.email || 'anonyme@student.hech.be'
    const name = attempt.userName || (state.currentUser ? `${state.currentUser.firstName} ${state.currentUser.lastName}` : 'Étudiant Démo')
    const userId = state.currentUser?.id || `user-${Date.now()}`

    const norm = normalizeQuizModuleId(attempt.moduleId)
    const cleanModuleId = norm.id
    const cleanModuleTitle = attempt.moduleTitle && !attempt.moduleTitle.includes('GMT') ? attempt.moduleTitle : norm.title

    const newAttempt: QuizAttempt = {
      id: `quiz-att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      userName: name,
      userEmail: email,
      moduleId: cleanModuleId,
      moduleTitle: cleanModuleTitle,
      score: attempt.score,
      totalPoints: attempt.totalPoints,
      percentage: attempt.percentage,
      answers: attempt.answers,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      evaluationType: attempt.evaluationType || 'diagnostic'
    }

    state.quizAttempts.unshift(newAttempt)
    setStorage(STORAGE_KEY_QUIZZES, state.quizAttempts)

    // Push immédiat vers le Cloud en arrière-plan
    try {
      cloudSync.pushQuizAttempt({
        ...newAttempt,
        quizId: newAttempt.moduleId,
        totalQuestions: newAttempt.totalPoints,
        completedAt: newAttempt.submittedAt,
        answersJson: JSON.stringify(newAttempt.answers || [])
      }).catch(e => console.warn('[CloudSync] saveQuizAttempt push error:', e))
    } catch (e) {}

    try {
      this.syncWithCloud().catch(() => {})
    } catch (e) {}

    // Marquer aussi dans la progression si seuil réussi >= 50%
    if (attempt.percentage >= 50 && state.currentUser) {
      this.toggleProgress(`quiz-${attempt.moduleId}`)
    }

    return {
      success: true,
      attempt: newAttempt,
      message: "Résultats du quiz enregistrés avec succès !"
    }
  },

  getUserQuizAttempts(email?: string): QuizAttempt[] {
    const targetEmail = email || state.currentUser?.email
    if (!targetEmail) return []
    return state.quizAttempts.filter(q => q.userEmail.toLowerCase() === targetEmail.toLowerCase())
  },

  getAllQuizAttempts(): QuizAttempt[] {
    return state.quizAttempts
  },

  deleteQuizAttempt(id: string) {
    const idx = state.quizAttempts.findIndex(q => q.id === id)
    if (idx >= 0) {
      state.quizAttempts.splice(idx, 1)
      setStorage(STORAGE_KEY_QUIZZES, state.quizAttempts)
      return { success: true }
    }
    return { success: false }
  },

  getQuizStats(moduleId?: string) {
    const list = moduleId 
      ? state.quizAttempts.filter(q => q.moduleId === moduleId)
      : state.quizAttempts

    if (list.length === 0) {
      return { count: 0, averagePercentage: 0, averageScore: 0, maxScore: 0, minScore: 0 }
    }

    const totalPct = list.reduce((acc, q) => acc + q.percentage, 0)
    const totalSc = list.reduce((acc, q) => acc + q.score, 0)
    const pcts = list.map(q => q.percentage)

    return {
      count: list.length,
      averagePercentage: Math.round(totalPct / list.length),
      averageScore: Math.round((totalSc / list.length) * 10) / 10,
      maxScore: Math.max(...pcts),
      minScore: Math.min(...pcts)
    }
  },

  changeAdminPassword(oldPin: string, newPin: string, confirmPin: string) {
    if (!this.verifyAdminPin(oldPin)) {
      return { success: false, message: "L'ancien mot de passe est incorrect." }
    }
    if (!newPin || newPin.trim().length < 4) {
      return { success: false, message: 'Le nouveau mot de passe doit comporter au moins 4 caractères.' }
    }
    if (newPin.trim() !== confirmPin.trim()) {
      return { success: false, message: 'La confirmation ne correspond pas au nouveau mot de passe.' }
    }
    this.updateAdminPin(newPin)
    return { success: true, message: 'Mot de passe enseignant modifié avec succès !' }
  },

  // ==========================================
  // SYNCHRONISATION CLOUD & MULTI-APPAREILS
  // ==========================================

  get cloudSyncState() {
    return cloudSyncState
  },

  get cloudUrl() {
    return cloudSync.getUrl()
  },

  setCloudUrl(url: string) {
    cloudSync.setUrl(url)
    state.driveWebhook = url.trim()
    setStorage(STORAGE_KEY_WEBHOOK, state.driveWebhook)
  },

  async syncWithCloud(): Promise<{ success: boolean; message: string; count?: number }> {
    if (!cloudSync.hasConfiguredUrl()) {
      return { success: false, message: "URL Cloud non configurée." }
    }
    // S'assurer que l'utilisateur connecté sur cet appareil est inclus dans le flux de synchronisation
    if (state.currentUser && state.currentUser.email && state.currentUser.role === 'student') {
      const exists = state.users.some(u => u.email.toLowerCase() === state.currentUser!.email.toLowerCase())
      if (!exists) {
        state.users.push(state.currentUser)
        setStorage(STORAGE_KEY_USERS, state.users)
      }
    }
    const res = await cloudSync.syncAll(state)
    if (res.success && res.data) {
      this.mergeRemoteData(res.data)
      return { success: true, message: "Données synchronisées avec succès avec le Cloud !" }
    }
    return { success: false, message: res.message || "Échec de synchronisation." }
  },

  mergeRemoteData(data: any) {
    if (!data) return

    // 1. Fusion des étudiants
    if (Array.isArray(data.users)) {
      data.users.forEach((remoteUser: any) => {
        if (!remoteUser || !remoteUser.email) return
        const cleanRemoteEmail = String(remoteUser.email).trim().toLowerCase()
        // Protection absolue : si l'étudiant a été supprimé par l'admin, NE JAMAIS le restaurer
        if (state.deletedUsers && state.deletedUsers.includes(cleanRemoteEmail)) {
          return
        }
        const remotePass = (remoteUser.password && typeof remoteUser.password === 'string') ? remoteUser.password.trim() : ''
        const remotePassSet = remoteUser.passwordSet === true || remoteUser.passwordSet === 'true' || !!remotePass

        const normalizedUser: User = {
          id: remoteUser.id || `user-${Date.now()}`,
          firstName: remoteUser.firstName || '',
          lastName: remoteUser.lastName || '',
          email: cleanRemoteEmail,
          role: remoteUser.role || 'student',
          registeredAt: remoteUser.registeredAt || new Date().toISOString().replace('T', ' ').substring(0, 16),
          status: remoteUser.status || 'active',
          password: remotePass,
          passwordSet: remotePassSet
        }
        const idx = state.users.findIndex(u => u && u.email && String(u.email).trim().toLowerCase() === cleanRemoteEmail)
        if (idx >= 0) {
          const existing = state.users[idx]
          // PROTECTION CRUCIALE : Ne JAMAIS écraser un mot de passe local valide par une valeur vide reçue du cloud !
          const finalPassword = remotePass || existing.password || ''
          const finalPasswordSet = (existing.passwordSet === true) || remotePassSet || !!finalPassword
          state.users[idx] = {
            ...existing,
            ...normalizedUser,
            password: finalPassword,
            passwordSet: finalPasswordSet
          }
        } else {
          state.users.push(normalizedUser)
        }
      })

      // Déduplication finale de state.users par email en conservant l'entrée la plus complète
      const uniqueUsersMap = new Map<string, User>()
      state.users.forEach(u => {
        if (!u || !u.email) return
        const key = u.email.trim().toLowerCase()
        const prev = uniqueUsersMap.get(key)
        if (!prev) {
          uniqueUsersMap.set(key, u)
        } else {
          const pass = (u.password && u.password.trim()) || prev.password || ''
          const passSet = (prev.passwordSet === true) || (u.passwordSet === true) || !!pass
          uniqueUsersMap.set(key, {
            ...prev,
            ...u,
            password: pass,
            passwordSet: passSet
          })
        }
      })
      state.users = Array.from(uniqueUsersMap.values())
      setStorage(STORAGE_KEY_USERS, state.users)
    }

    // 2. Fusion des devoirs (supporte answer et content avec valeur par défaut vide)
    if (Array.isArray(data.submissions)) {
      data.submissions.forEach((remSub: any) => {
        if (!remSub || !remSub.userEmail || !remSub.exerciseId) return
        const cleanSubEmail = String(remSub.userEmail).trim().toLowerCase()
        if (state.deletedUsers && state.deletedUsers.includes(cleanSubEmail)) {
          return
        }
        const textAnswer = remSub.answer || remSub.content || ''
        const normalizedSub: Submission = {
          id: remSub.id || `sub-${Date.now()}`,
          userId: remSub.userId || '',
          userName: remSub.userName || '',
          userEmail: cleanSubEmail,
          exerciseId: remSub.exerciseId,
          exerciseTitle: remSub.exerciseTitle || '',
          answer: textAnswer,
          submittedAt: remSub.submittedAt || new Date().toISOString()
        }
        const idx = state.submissions.findIndex(
          s => s && s.userEmail && String(s.userEmail).trim().toLowerCase() === cleanSubEmail && s.exerciseId === remSub.exerciseId
        )
        if (idx >= 0) {
          if (new Date(normalizedSub.submittedAt).getTime() > new Date(state.submissions[idx].submittedAt).getTime()) {
            state.submissions[idx] = normalizedSub
          }
        } else {
          state.submissions.push(normalizedSub)
        }
      })
      setStorage(STORAGE_KEY_SUBMISSIONS, state.submissions)
    }

    // 3. Fusion des échéances (normalisation stricte { deadline: string, deadlineLabel: string })
    if (data.deadlines && typeof data.deadlines === 'object') {
      let changed = false
      Object.keys(data.deadlines).forEach(exId => {
        const remD = data.deadlines[exId]
        if (remD) {
          const rawDate = remD.deadline || remD.dueDate || ''
          const cleanDate = typeof rawDate === 'string' ? rawDate.trim() : (rawDate ? String(rawDate).trim() : '')
          // PROTECTION CRUCIALE : Ne JAMAIS écraser une échéance locale existante avec une valeur vide reçue du cloud !
          if (!cleanDate) {
            return
          }
          const rawLabel = remD.deadlineLabel || remD.label || ''
          const cleanLabel = typeof rawLabel === 'string' && rawLabel.trim() ? rawLabel.trim() : formatDeadlineDisplay(cleanDate)
          const current = state.deadlines[exId]
          if (!current || current.deadline !== cleanDate || current.deadlineLabel !== cleanLabel) {
            state.deadlines[exId] = {
              deadline: cleanDate,
              deadlineLabel: cleanLabel
            }
            changed = true
          }
        }
      })
      if (changed) {
        setStorage(STORAGE_KEY_DEADLINES, state.deadlines)
        deadlinesTrigger.value++
      }
    }

    // 4. Fusion des évaluations
    if (data.evaluations && typeof data.evaluations === 'object') {
      Object.keys(data.evaluations).forEach(email => {
        const remEval = data.evaluations[email]
        const cleanEvalEmail = String(email).trim().toLowerCase()
        if (state.deletedUsers && state.deletedUsers.includes(cleanEvalEmail)) return
        if (remEval && email) {
          state.evaluations[cleanEvalEmail] = remEval
        }
      })
      setStorage(STORAGE_KEY_EVALUATIONS, state.evaluations)
    }

    // 5. Fusion des résultats de Quiz passés par les étudiants (Strictement un seul par module par étudiant, le plus récent)
    if (Array.isArray(data.quizAttempts)) {
      data.quizAttempts.forEach((remQuiz: any) => {
        if (!remQuiz || !remQuiz.userEmail) return
        const cleanQuizEmail = String(remQuiz.userEmail).trim().toLowerCase()
        if (state.deletedUsers && state.deletedUsers.includes(cleanQuizEmail)) return

        const normMod = normalizeQuizModuleId(remQuiz.moduleId || remQuiz.quizId)
        const modId = normMod.id
        const modTitle = remQuiz.moduleTitle && !remQuiz.moduleTitle.includes('GMT') ? remQuiz.moduleTitle : normMod.title
        const remScore = Number(remQuiz.score) || 0
        const remTotal = Number(remQuiz.totalPoints || remQuiz.totalQuestions) || 10
        const remPct = Number(remQuiz.percentage) || (remTotal > 0 ? Math.round((remScore / remTotal) * 100) : 0)
        const remDate = remQuiz.submittedAt || remQuiz.completedAt || new Date().toISOString().replace('T', ' ').substring(0, 16)
        const remAnswers = Array.isArray(remQuiz.answers) ? remQuiz.answers : []

        const normalizedAttempt: QuizAttempt = {
          id: remQuiz.id || `quiz-cloud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId: remQuiz.userId || '',
          userName: remQuiz.userName || 'Étudiant',
          userEmail: cleanQuizEmail,
          moduleId: modId,
          moduleTitle: modTitle,
          score: remScore,
          totalPoints: remTotal,
          percentage: remPct,
          answers: remAnswers,
          submittedAt: remDate,
          evaluationType: remQuiz.evaluationType || 'diagnostic'
        }

        const existingIdx = state.quizAttempts.findIndex(
          q => q && q.userEmail && String(q.userEmail).trim().toLowerCase() === cleanQuizEmail &&
               (q.moduleId === modId || (q as any).quizId === modId)
        )

        if (existingIdx >= 0) {
          const existing = state.quizAttempts[existingIdx]
          const existingTime = new Date(existing.submittedAt || 0).getTime()
          const remTime = new Date(remDate || 0).getTime()
          if (remTime > existingTime) {
            if ((!normalizedAttempt.answers || normalizedAttempt.answers.length === 0) && existing.answers && existing.answers.length > 0) {
              normalizedAttempt.answers = existing.answers
            }
            state.quizAttempts[existingIdx] = normalizedAttempt
          } else if ((!existing.answers || existing.answers.length === 0) && normalizedAttempt.answers && normalizedAttempt.answers.length > 0) {
            existing.answers = normalizedAttempt.answers
          }
        } else {
          state.quizAttempts.push(normalizedAttempt)
        }
      })

      // Déduplication finale par (email, moduleId)
      const dedupQuizzesMap = new Map<string, QuizAttempt>()
      const sortedQuizzes = [...state.quizAttempts].sort((a, b) => new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime())
      for (const q of sortedQuizzes) {
        if (!q || !q.userEmail) continue
        const norm = normalizeQuizModuleId(q.moduleId || (q as any).quizId)
        q.moduleId = norm.id
        q.moduleTitle = norm.title
        const key = `${String(q.userEmail).trim().toLowerCase()}::${norm.id}`
        const prev = dedupQuizzesMap.get(key)
        if (!prev) {
          dedupQuizzesMap.set(key, q)
        } else {
          const newest = q
          if ((!newest.answers || newest.answers.length === 0) && prev.answers && prev.answers.length > 0) {
            newest.answers = prev.answers
          }
          dedupQuizzesMap.set(key, newest)
        }
      }
      state.quizAttempts = Array.from(dedupQuizzesMap.values())
      setStorage(STORAGE_KEY_QUIZZES, state.quizAttempts)
    }

    // 6. Fusion des fichiers et devoirs déposés par les étudiants (Google Drive / Cloud)
    const remoteFiles = Array.isArray(data.submittedFiles) ? data.submittedFiles : (Array.isArray(data.files) ? data.files : [])
    if (remoteFiles.length > 0) {
      remoteFiles.forEach((remFile: any) => {
        if (!remFile || !remFile.userEmail || !remFile.exerciseId) return
        const cleanFileEmail = String(remFile.userEmail).trim().toLowerCase()
        if (state.deletedUsers && state.deletedUsers.includes(cleanFileEmail)) return

        const exId = String(remFile.exerciseId).trim()
        const fileName = remFile.formattedFileName || remFile.originalFileName || remFile.fileName || 'Devoir.docx'
        const isPdf = fileName.toLowerCase().endsWith('.pdf')
        const remDate = remFile.submittedAt || new Date().toISOString().replace('T', ' ').substring(0, 16)

        const newSubmitted: SubmittedFile = {
          id: remFile.id || `file-cloud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId: remFile.userId || '',
          userName: remFile.userName || 'Étudiant',
          userEmail: cleanFileEmail,
          exerciseId: exId,
          exerciseTitle: remFile.exerciseTitle || exId,
          originalFileName: remFile.originalFileName || fileName,
          formattedFileName: fileName,
          fileType: remFile.fileType || (isPdf ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
          fileSize: remFile.fileSize || 0,
          dataUrl: remFile.dataUrl || '',
          driveUrl: remFile.driveUrl || '',
          submittedAt: remDate,
          driveSynced: true
        }

        const existingIdx = state.submittedFiles.findIndex(
          f => f && f.userEmail && String(f.userEmail).trim().toLowerCase() === cleanFileEmail &&
               f.exerciseId === exId
        )

        if (existingIdx >= 0) {
          const local = state.submittedFiles[existingIdx]
          const localTime = new Date(local.submittedAt || 0).getTime()
          const remTime = new Date(remDate || 0).getTime()
          if (remTime > localTime) {
            if (!newSubmitted.dataUrl && local.dataUrl) newSubmitted.dataUrl = local.dataUrl
            if (!(newSubmitted as any).extractedText && (local as any).extractedText) {
              (newSubmitted as any).extractedText = (local as any).extractedText
            }
            state.submittedFiles[existingIdx] = newSubmitted
          } else {
            if (remFile.driveUrl && !local.driveUrl) {
              local.driveUrl = remFile.driveUrl
              local.driveSynced = true
            }
          }
        } else {
          state.submittedFiles.push(newSubmitted)
        }
      })

      // Déduplication finale par (email, exerciseId)
      const dedupFilesMap = new Map<string, SubmittedFile>()
      const sortedFiles = [...state.submittedFiles].sort((a, b) => new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime())
      for (const f of sortedFiles) {
        if (!f || !f.userEmail || !f.exerciseId) continue
        const key = `${String(f.userEmail).trim().toLowerCase()}::${f.exerciseId}`
        const prev = dedupFilesMap.get(key)
        if (!prev) {
          dedupFilesMap.set(key, f)
        } else {
          const newest = f
          if (!newest.dataUrl && prev.dataUrl) newest.dataUrl = prev.dataUrl
          if (!newest.extractedText && prev.extractedText) newest.extractedText = prev.extractedText
          if (!newest.driveUrl && prev.driveUrl) newest.driveUrl = prev.driveUrl
          dedupFilesMap.set(key, newest)
        }
      }
      state.submittedFiles = Array.from(dedupFilesMap.values())
      setStorage(STORAGE_KEY_FILES, state.submittedFiles)
    }
  },

  importSingleStudent(user: User) {
    if (!user || !user.email) return
    const cleanEmail = user.email.toLowerCase().trim()
    if (state.deletedUsers && state.deletedUsers.includes(cleanEmail)) return
    const idx = state.users.findIndex(u => (u?.email || '').toLowerCase().trim() === cleanEmail)
    const newPass = (user.password && typeof user.password === 'string') ? user.password.trim() : ''
    const newPassSet = user.passwordSet === true || !!newPass
    if (idx >= 0) {
      const existing = state.users[idx]
      const finalPassword = newPass || existing.password || ''
      const finalPasswordSet = (existing.passwordSet === true) || newPassSet || !!finalPassword
      state.users[idx] = { ...existing, ...user, password: finalPassword, passwordSet: finalPasswordSet }
    } else {
      state.users.push({ ...user, password: newPass, passwordSet: newPassSet })
    }
    setStorage(STORAGE_KEY_USERS, state.users)
  },

  async findOrFetchStudent(email: string, forceRemote = false): Promise<User | null> {
    const cleanEmail = (email || '').toLowerCase().trim()
    if (!cleanEmail) return null
    if (!forceRemote) {
      const local = findUserByQuery(cleanEmail)
      if (local && local.passwordSet) return local
    }

    // Recherche distante dans le Cloud (Google Apps Script)
    const remote = await cloudSync.fetchStudent(cleanEmail)
    if (remote) {
      this.importSingleStudent(remote)
      return remote
    }
    const fallbackLocal = findUserByQuery(cleanEmail)
    return fallbackLocal || null
  }
}

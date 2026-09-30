// Données réelles des étudiants et de leurs travaux déposés
// Harmonisé automatiquement avec critères institutionnels (docs/guide/criteres-correction-ia.md)
// 4 critères : A (2.5 pts), B (2.5 pts), C&D (2.5 pts), E&H (2.5 pts) = 10 pts
import type { User, SubmittedFile, Submission, QuizAttempt } from './userStore'

export const INITIAL_REAL_USERS: User[] = [
  {
    "id": "user-1790748955275",
    "email": "sarah.dubois@student.hech.be",
    "firstName": "Sarah",
    "lastName": "Dubois",
    "password": "",
    "passwordSet": false,
    "registeredAt": "2026-09-30T06:15:55.275Z",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790748956449",
    "email": "maxime.lambert@student.hech.be",
    "firstName": "Maxime",
    "lastName": "Lambert",
    "password": "etudiant2026",
    "passwordSet": true,
    "registeredAt": "2026-09-30T06:15:56.450Z",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790748957166",
    "email": "thomas.bastien@student.hech.be",
    "firstName": "Thomas",
    "lastName": "Bastien",
    "password": "etudiant2026",
    "passwordSet": true,
    "registeredAt": "2026-09-30T06:15:57.166Z",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1789634810517",
    "email": "jerome.foguenne@hech.be",
    "firstName": "jerome",
    "lastName": "Foguenne",
    "password": "Ronald1984@",
    "passwordSet": true,
    "registeredAt": "2026-09-17 08:46",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790748466647",
    "email": "camille.testeur@student.hech.be",
    "firstName": "Camille",
    "lastName": "Testeur",
    "password": "testpassword2026",
    "passwordSet": true,
    "registeredAt": "2026-09-30 06:07",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-auto-test",
    "email": "lucas.direct@student.hech.be",
    "firstName": "Lucas",
    "lastName": "Direct",
    "password": "monmotdepasse",
    "passwordSet": true,
    "registeredAt": "2026-09-23 09:00",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790087067817",
    "email": "josephine.staffe@student.hech.be",
    "firstName": "Joséphine",
    "lastName": "Staffe",
    "password": "Phine@79",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:24",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790087728833",
    "email": "hockers.caroline@outlook.com",
    "firstName": "Caroline",
    "lastName": "Hockers",
    "password": "Line010293@",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:35",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086815448",
    "email": "e2604966@student.hech.be",
    "firstName": "Nathalie",
    "lastName": "D'accardo",
    "password": "1234",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:20",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790088747296",
    "email": "e141977@student.hech.be",
    "firstName": "Stephanie",
    "lastName": "Mülverstedt",
    "password": "CemnO4me.",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:52",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086794458",
    "email": "dalia.smaali@student.hech.be",
    "firstName": "Dalia",
    "lastName": "Smaali",
    "password": "Vicenza1830*",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:19",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790163391889",
    "email": "chloe.steckx@student.hech.be",
    "firstName": "Chloé",
    "lastName": "Steckx",
    "password": "#Porcinet2003",
    "passwordSet": true,
    "registeredAt": "2026-09-23 11:36",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086699294",
    "email": "aurelie.schreurs@student.hech.be",
    "firstName": "Aurélie",
    "lastName": "Schreurs",
    "password": "aureetju250608",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:18",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790087241045",
    "email": "e2303712@student.hech.be",
    "firstName": "Michael",
    "lastName": "Jamar",
    "password": "Bg3mm",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:27",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086778709",
    "email": "j.wasterlain@student.hech.be",
    "firstName": "Justin",
    "lastName": "Wasterlain",
    "password": "Just99!!",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:19",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790088167344",
    "email": "daphne.depuis@gmail.com",
    "firstName": "Daphné",
    "lastName": "Depuis",
    "password": "1234",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:42",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790108903773",
    "email": "jonathan.valenzano@student.hech.be",
    "firstName": "Jonathan",
    "lastName": "Valenzano",
    "password": "Numerique302",
    "passwordSet": true,
    "registeredAt": "2026-09-22 20:28",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086820996",
    "email": "e161029@student.hech.be",
    "firstName": "Jordan",
    "lastName": "Casamento",
    "password": "Syadchloda021097",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:20",
    "status": "active",
    "role": "student",
    "aliases": [
      "jordan.casamento@student.hech.be"
    ]
  },
  {
    "id": "user-1790087420453",
    "email": "daphne.depuis@student.hech.be",
    "firstName": "Daphné",
    "lastName": "Depuis",
    "password": "1234",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:30",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086808994",
    "email": "e2505429@student.hech.be",
    "firstName": "Juliette",
    "lastName": "Renard",
    "password": "R@monhappy77",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:20",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790171235999",
    "email": "caroline.hockers@outlook.com",
    "firstName": "Caroline",
    "lastName": "Hockers",
    "password": "Line010293@",
    "passwordSet": true,
    "registeredAt": "2026-09-23 13:47",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086813518",
    "email": "julien.esposito@student.hech.be",
    "firstName": "Julien",
    "lastName": "Esposito",
    "password": "Monica10329.",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:20",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086792053",
    "email": "alexiane.collard@student.hech.be",
    "firstName": "Alexiane",
    "lastName": "Collard",
    "password": "g@5Wfzjt",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:19",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086816015",
    "email": "vanhee.anais.mail@gmail.com",
    "firstName": "Anaïs",
    "lastName": "Vanhee",
    "password": "Siana17/07",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:20",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790107355120",
    "email": "ctp.truong@student.hech.be",
    "firstName": "Thien",
    "lastName": "Truong",
    "password": "Tikazia13*",
    "passwordSet": true,
    "registeredAt": "2026-09-22 20:02",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790189590610",
    "email": "sabrina.siragusa@student.hech.be",
    "firstName": "Sabrina",
    "lastName": "Siragusa",
    "password": "Elephant1!",
    "passwordSet": true,
    "registeredAt": "2026-09-23 18:53",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086871341",
    "email": "e2306390@student.hech.be",
    "firstName": "Florence",
    "lastName": "D’Archambeau",
    "password": "Geebeeleo4554.",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:21",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790101734242",
    "email": "vincianne.schoonbroodt@student.hech.be",
    "firstName": "Vincianne",
    "lastName": "SCHOONBROODT",
    "password": "Rivageois75@",
    "passwordSet": true,
    "registeredAt": "2026-09-22 18:28",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790267864270",
    "email": "nbats@student.hech.be",
    "firstName": "Nathalie",
    "lastName": "Bats",
    "password": "Jetudie",
    "passwordSet": true,
    "registeredAt": "2026-09-24 16:37",
    "status": "active",
    "role": "student"
  },
  {
    "id": "usr-1",
    "email": "lucas.mercier@student.hech.be",
    "firstName": "Lucas",
    "lastName": "Mercier",
    "password": "hech",
    "passwordSet": true,
    "registeredAt": "2026-09-20 09:30",
    "status": "active",
    "role": "student"
  },
  {
    "id": "usr-2",
    "email": "camille.renard@student.hech.be",
    "firstName": "Camille",
    "lastName": "Renard",
    "password": "hech",
    "passwordSet": true,
    "registeredAt": "2026-09-20 10:15",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086729864",
    "email": "laura.mokeddem@student.hech.be",
    "firstName": "Laura",
    "lastName": "Mokeddem",
    "password": "Choupie1510/",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:18",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790341332326",
    "email": "e142655@student.hech.be",
    "firstName": "Marielle",
    "lastName": "Van Dijk",
    "password": "01Dec2026!",
    "passwordSet": true,
    "registeredAt": "2026-09-25 13:02",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790341470352",
    "email": "g.vromen@student.hech.be",
    "firstName": "Gérard",
    "lastName": "Vromen",
    "password": "Mayagg04*",
    "passwordSet": true,
    "registeredAt": "2026-09-25 13:04",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790343401573",
    "email": "e2301886@student.hech.be",
    "firstName": "Emma",
    "lastName": "DI MASCIA",
    "password": "Em-Ol1610",
    "passwordSet": true,
    "registeredAt": "2026-09-25 13:36",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086853720",
    "email": "victor.weishaupt@student.hech.be",
    "firstName": "Victor",
    "lastName": "Weishaupt",
    "password": "Vic060105,",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:20",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790343751310",
    "email": "mathis.rodes@student.hech.be",
    "firstName": "Mathis",
    "lastName": "Rodès",
    "password": "Salomemathis0233@",
    "passwordSet": true,
    "registeredAt": "2026-09-25 13:42",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790345777275",
    "email": "e2301877",
    "firstName": "Amélie",
    "lastName": "Sarlet",
    "password": "Mariehelene@1406",
    "passwordSet": true,
    "registeredAt": "2026-09-25 14:16",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790345813088",
    "email": "e2306513@student.hech.be",
    "firstName": "Sara",
    "lastName": "Cheng",
    "password": "BJYXszd1085.",
    "passwordSet": true,
    "registeredAt": "2026-09-25 14:16",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790171419944",
    "email": "caroline.hockers@student.hech.be",
    "firstName": "Caroline",
    "lastName": "Hockers",
    "password": "hech2026",
    "passwordSet": false,
    "registeredAt": "2026-09-23 13:50",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790086705048",
    "email": "olivier.henrion@student.hech.be",
    "firstName": "Olivier",
    "lastName": "Henrion",
    "password": "Chipoli1",
    "passwordSet": true,
    "registeredAt": "2026-09-22 14:18",
    "status": "active",
    "role": "student"
  },
  {
    "id": "user-1790769304036",
    "email": "e2305392@student.hech.be",
    "firstName": "Amadou Bamba",
    "lastName": "Traoré",
    "password": "Notredame=90abt",
    "passwordSet": true,
    "registeredAt": "2026-09-30 11:55",
    "status": "active",
    "role": "student"
  }
];

export const INITIAL_REAL_FILES: SubmittedFile[] = [
  {
    "id": "file-1",
    "userId": "",
    "userName": "Sarah Dubois",
    "userEmail": "sarah.dubois@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "Dubois_Sarah_Atelier1.docx",
    "formattedFileName": "Dubois_Sarah_Atelier1.docx",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "https://drive.google.com/test-file",
    "submittedAt": "2026-09-15 13:35",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790411983210-nbue",
    "userId": "user-1789634810517",
    "userName": "jerome Foguenne",
    "userEmail": "jerome.foguenne@hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "FOGUENNE_jerome_Exercice_1_Diagnostic_de_compe_2026-09-26.docx",
    "formattedFileName": "FOGUENNE_jerome_Exercice_1_Diagnostic_de_compe_2026-09-26.docx",
    "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "fileSize": 13551,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-26 06:39",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-demo-1",
    "userId": "",
    "userName": "Sarah Dubois",
    "userEmail": "sarah.dubois@student.hech.be",
    "exerciseId": "exercice-03",
    "exerciseTitle": "exercice-03",
    "originalFileName": "DUBOIS_Sarah_Atelier-3_Guide-Numerique_2026-09-16.pdf",
    "formattedFileName": "DUBOIS_Sarah_Atelier-3_Guide-Numerique_2026-09-16.pdf",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-16 08:15",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail pour l'atelier \"exercice-03\" (8.5/10) : Attendus didactiques maîtrisés.",
      "strengths": [
        "Dépôt conforme au format demandé (.pdf/.docx).",
        "Mobilisation des concepts du cours de Didactique et numérique.",
        "Démarche pédagogique cohérente."
      ],
      "improvements": [
        "Poursuivre le développement de la posture réflexive.",
        "Renforcer l'ancrage dans les compétences du tronc commun FMTTN."
      ],
      "nextSteps": "Maintenir ce rythme de travail pour les prochaines étapes.",
      "detailedFeedback": "Votre production pour l'atelier \"exercice-03\" a été analysée avec succès. L'évaluation formative préliminaire valide l'acquisition des bases didactiques attendues.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions didactiques acquises."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert pédagogique envisagé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail pour l'atelier \"exercice-03\" (8.5/10) : Attendus didactiques maîtrisés.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-demo-2",
    "userId": "",
    "userName": "Maxime Lambert",
    "userEmail": "maxime.lambert@student.hech.be",
    "exerciseId": "exercice-05",
    "exerciseTitle": "exercice-05",
    "originalFileName": "LAMBERT_Maxime_Atelier-5_Canva-MDP_2026-09-16.docx",
    "formattedFileName": "LAMBERT_Maxime_Atelier-5_Canva-MDP_2026-09-16.docx",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-16 09:30",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.8,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.3,
        "didacticQuality": 2.2,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.2
      },
      "summary": "Excellente affiche Canva de cybersécurité (8.8/10) : Respect strict des contraintes formelles et clarté visuelle.",
      "strengths": [
        "Respect strict des contraintes : concision remarquable (phrase mémotechnique, symboles).",
        "Efficacité visuelle et lisibilité immédiate pour des élèves du secondaire.",
        "Transmission de règles de sécurité solides (longueur, caractères variés, gestionnaire)."
      ],
      "improvements": [
        "Intégrer une mention succincte sur l'authentification à double facteur (2FA)."
      ],
      "nextSteps": "Réutiliser ces compétences de design visuel sous Canva pour les cartes du jeu.",
      "detailedFeedback": "Affiche percutante et pédagogique. Les consignes de sobriété et d'impact visuel sont parfaitement respectées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Contraintes formelles (mots et visuels) respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Règles de cybersécurité exactes et conformes aux bonnes pratiques ANSSI."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Support idéal pour un affichage en classe ou en salle informatique."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Graphisme harmonieux et hiérarchie visuelle claire."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.8,
      "maxScore": 10,
      "feedback": "Excellente affiche Canva de cybersécurité (8.8/10) : Respect strict des contraintes formelles et clarté visuelle.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-demo-3",
    "userId": "",
    "userName": "Thomas Bastien",
    "userEmail": "thomas.bastien@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "BASTIEN_Thomas_Atelier-1_Diagnostic-DigComp_2026-09-16.pdf",
    "formattedFileName": "BASTIEN_Thomas_Atelier-1_Diagnostic-DigComp_2026-09-16.pdf",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-16 12:10",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-demo-2",
    "userId": "",
    "userName": "Maxime Lambert",
    "userEmail": "maxime.lambert@student.hech.be",
    "exerciseId": "exercice-05",
    "exerciseTitle": "exercice-05",
    "originalFileName": "LAMBERT_Maxime_Atelier-5_Canva-MDP_2026-09-16.docx",
    "formattedFileName": "LAMBERT_Maxime_Atelier-5_Canva-MDP_2026-09-16.docx",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-16 09:30",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.8,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.3,
        "didacticQuality": 2.2,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.2
      },
      "summary": "Excellente affiche Canva de cybersécurité (8.8/10) : Respect strict des contraintes formelles et clarté visuelle.",
      "strengths": [
        "Respect strict des contraintes : concision remarquable (phrase mémotechnique, symboles).",
        "Efficacité visuelle et lisibilité immédiate pour des élèves du secondaire.",
        "Transmission de règles de sécurité solides (longueur, caractères variés, gestionnaire)."
      ],
      "improvements": [
        "Intégrer une mention succincte sur l'authentification à double facteur (2FA)."
      ],
      "nextSteps": "Réutiliser ces compétences de design visuel sous Canva pour les cartes du jeu.",
      "detailedFeedback": "Affiche percutante et pédagogique. Les consignes de sobriété et d'impact visuel sont parfaitement respectées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Contraintes formelles (mots et visuels) respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Règles de cybersécurité exactes et conformes aux bonnes pratiques ANSSI."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Support idéal pour un affichage en classe ou en salle informatique."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Graphisme harmonieux et hiérarchie visuelle claire."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.8,
      "maxScore": 10,
      "feedback": "Excellente affiche Canva de cybersécurité (8.8/10) : Respect strict des contraintes formelles et clarté visuelle.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-demo-3",
    "userId": "",
    "userName": "Thomas Bastien",
    "userEmail": "thomas.bastien@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "BASTIEN_Thomas_Atelier-1_Diagnostic-DigComp_2026-09-16.pdf",
    "formattedFileName": "BASTIEN_Thomas_Atelier-1_Diagnostic-DigComp_2026-09-16.pdf",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-16 12:10",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790087890020-62op",
    "userId": "",
    "userName": "Justin Wasterlain",
    "userEmail": "j.wasterlain@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "WASTERLAIN_Justin_Exercice_1_Diagnostic_de_compe_2026-09-22.docx",
    "formattedFileName": "WASTERLAIN_Justin_Exercice_1_Diagnostic_de_compe_2026-09-22.docx",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-22 12:38",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-bats-nathalie-ex1-1",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "BATS_Nathalie_Exercice_1_Diagnostic_de_compe_2026-09-24.pdf",
    "formattedFileName": "BATS_Nathalie_Exercice_1_Diagnostic_de_compe_2026-09-24.pdf",
    "fileType": "application/pdf",
    "fileSize": 60452,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-24 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.8,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.3,
        "didacticQuality": 2.2,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.2
      },
      "summary": "Très bon diagnostic DigComp 2.2 (8.8/10) : Analyse structurée des profils et distinction des niveaux de maîtrise.",
      "strengths": [
        "Bonne appropriation des 5 domaines du cadre européen DigComp 2.2.",
        "Identification lucide des fausses compétences numériques opératoires.",
        "Pistes de remédiation adaptées aux difficultés des élèves."
      ],
      "improvements": [
        "Préciser davantage les critères observables permettant d'évaluer la progression des élèves."
      ],
      "nextSteps": "Consolider la formulation des objectifs d'apprentissage.",
      "detailedFeedback": "Travail très bien mené. Les profils d'élèves sont analysés avec sérieux et la distinction entre maîtrise technique et compétence située est clairement assimilée.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Profils analysés conformément aux attendus de l'atelier."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Bonne maîtrise des descripteurs de compétences DigComp."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Propositions de remédiation cohérentes pour la classe."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Mise en page claire et formulation soignée."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.8,
      "maxScore": 10,
      "feedback": "Très bon diagnostic DigComp 2.2 (8.8/10) : Analyse structurée des profils et distinction des niveaux de maîtrise.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-bats-nathalie-ex2-2",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-02",
    "exerciseTitle": "exercice-02",
    "originalFileName": "BATS_Nathalie_Exercice_2_Peut-on_faire_confi_2026-09-25.pdf",
    "formattedFileName": "BATS_Nathalie_Exercice_2_Peut-on_faire_confi_2026-09-25.pdf",
    "fileType": "application/pdf",
    "fileSize": 50951,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-25 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 9,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.3,
        "didacticQuality": 2.2,
        "criticalAnalysis": 2.2,
        "formAndStructure": 2.3
      },
      "summary": "Très bon travail didactique (9.0/10) : Réflexe de suspension du jugement, croisement de sources et protocole de vérification structuré.",
      "strengths": [
        "Posture réflexive immédiate : suspension du jugement avant toute diffusion.",
        "Démarche d'enquête méthodique en 5 étapes d'investigation.",
        "Prise en compte des limites de l'affirmation et formulation de questions critiques pour les élèves."
      ],
      "improvements": [
        "Préciser davantage les références bibliographiques précises des études primaires identifiées."
      ],
      "nextSteps": "Valoriser cette démarche critique lors de la conception des énigmes ou cartes de jeu.",
      "detailedFeedback": "Très bon devoir. L'attitude prudente face aux affirmations sensationnalistes et la structuration des étapes de vérification démontrent une excellente maîtrise des compétences d'éducation aux médias du FMTTN.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Consignes entièrement traitées avec un plan clair."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Bonne maîtrise des concepts de vérification de l'information et d'évaluation des sources."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Réflexion pertinente sur la non-diffusion de contenus sensationnalistes aux apprenants."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Clarté d'expression et mise en page soignée."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 9,
      "maxScore": 10,
      "feedback": "Très bon travail didactique (9.0/10) : Réflexe de suspension du jugement, croisement de sources et protocole de vérification structuré.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-bats-nathalie-ex4-3",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-04",
    "exerciseTitle": "exercice-04",
    "originalFileName": "BATS_Nathalie_Exercice_4_Escape_Game_FMTTN_C_2026-09-27.pdf",
    "formattedFileName": "BATS_Nathalie_Exercice_4_Escape_Game_FMTTN_C_2026-09-27.pdf",
    "fileType": "application/pdf",
    "fileSize": 199087,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-27 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.8,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.3,
        "didacticQuality": 2.2,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.2
      },
      "summary": "Très bonne analyse de l'Escape Game FMTTN (8.8/10) : Résolution complète de l'Arche FMTTN et debriefing didactique.",
      "strengths": [
        "Résolution validée des énigmes cyber-sécurité (temps restant 09:33).",
        "Analyse lucide du dispositif ludopédagogique.",
        "Structuration de la phase d'institutionnalisation en classe."
      ],
      "improvements": [
        "Développer les modalités d'évaluation formative au sein même de l'escape game."
      ],
      "nextSteps": "Mobiliser ces mécaniques d'énigmes dans le projet de jeu de société.",
      "detailedFeedback": "Excellente participation et analyse de l'Arche FMTTN. L'intégration des apprentissages numériques au sein du jeu est très bien explicitée.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Énigmes résolues et dossier d'enquête complété."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Lien clair avec les compétences de cybersécurité et d'hygiène numérique."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Faisabilité en classe de secondaire bien anticipée."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Rapport clair et vivant."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.8,
      "maxScore": 10,
      "feedback": "Très bonne analyse de l'Escape Game FMTTN (8.8/10) : Résolution complète de l'Arche FMTTN et debriefing didactique.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-bats-nathalie-ex5-4",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-05",
    "exerciseTitle": "exercice-05",
    "originalFileName": "BATS_Nathalie_Exercice_5_Defi_20_minutes_Aff_2026-09-26 (1).pdf",
    "formattedFileName": "BATS_Nathalie_Exercice_5_Defi_20_minutes_Aff_2026-09-26 (1).pdf",
    "fileType": "application/pdf",
    "fileSize": 338452,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-26 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.8,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.3,
        "didacticQuality": 2.2,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.2
      },
      "summary": "Excellente affiche Canva de cybersécurité (8.8/10) : Respect strict des contraintes formelles et clarté visuelle.",
      "strengths": [
        "Respect strict des contraintes : concision remarquable (phrase mémotechnique, symboles).",
        "Efficacité visuelle et lisibilité immédiate pour des élèves du secondaire.",
        "Transmission de règles de sécurité solides (longueur, caractères variés, gestionnaire)."
      ],
      "improvements": [
        "Intégrer une mention succincte sur l'authentification à double facteur (2FA)."
      ],
      "nextSteps": "Réutiliser ces compétences de design visuel sous Canva pour les cartes du jeu.",
      "detailedFeedback": "Affiche percutante et pédagogique. Les consignes de sobriété et d'impact visuel sont parfaitement respectées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Contraintes formelles (mots et visuels) respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Règles de cybersécurité exactes et conformes aux bonnes pratiques ANSSI."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Support idéal pour un affichage en classe ou en salle informatique."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Graphisme harmonieux et hiérarchie visuelle claire."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.8,
      "maxScore": 10,
      "feedback": "Excellente affiche Canva de cybersécurité (8.8/10) : Respect strict des contraintes formelles et clarté visuelle.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-bats-nathalie-ex6-6",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-06",
    "exerciseTitle": "exercice-06",
    "originalFileName": "BATS_Nathalie_Exercice_6_Demarche_iterative__2026-09-27.pdf",
    "formattedFileName": "BATS_Nathalie_Exercice_6_Demarche_iterative__2026-09-27.pdf",
    "fileType": "application/pdf",
    "fileSize": 53295,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-27 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 9,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.3,
        "didacticQuality": 2.2,
        "criticalAnalysis": 2.2,
        "formAndStructure": 2.3
      },
      "summary": "Très belle démarche itérative sous Genially (9.0/10) : Mini-jeu interactif sur le tri des déchets testé par les pairs et bonifié.",
      "strengths": [
        "Création d'un mini-jeu interactif fonctionnel sur Genially.",
        "Protocole d'observation et de recueil des retours de testeurs pairs.",
        "Modifications concrètes apportées en version 2 pour clarifier les feedbacks de tri."
      ],
      "improvements": [
        "Intégrer une jauge de score ou un debriefing cognitif en fin de jeu."
      ],
      "nextSteps": "Appliquer ce protocole de playtest lors de l'étape 7 du projet de jeu de société.",
      "detailedFeedback": "Démarche de conception exemplaire. L'itération basée sur les erreurs réelles des testeurs montre une authentique posture d'ingénierie pédagogique.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Cycle de conception itératif complet documenté."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Mécaniques de jeu bien alignées avec l'apprentissage du tri sélectif."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Adaptation ergonomique réussie pour des élèves de 10-12 ans."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Rapport réflexif très instructif sur la gestion de l'erreur."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 9,
      "maxScore": 10,
      "feedback": "Très belle démarche itérative sous Genially (9.0/10) : Mini-jeu interactif sur le tri des déchets testé par les pairs et bonifié.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-bats-nathalie-ex8-7",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-08",
    "exerciseTitle": "exercice-08",
    "originalFileName": "BATS_Nathalie_Exercice_8_Construire_des_gril_2026-09-26.pdf",
    "formattedFileName": "BATS_Nathalie_Exercice_8_Construire_des_gril_2026-09-26.pdf",
    "fileType": "application/pdf",
    "fileSize": 46291,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-26 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 9.2,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.4,
        "didacticQuality": 2.3,
        "criticalAnalysis": 2.2,
        "formAndStructure": 2.3
      },
      "summary": "Excellente grille d'évaluation critériée (9.2/10) : Critères didactiques indépendants, indicateurs observables et niveaux de maîtrise gradués.",
      "strengths": [
        "Définition de critères didactiques clairs et conceptuellement indépendants.",
        "Indicateurs observables précis pour chaque degré de performance.",
        "Pondération équilibrée et cohérence avec les compétences de recherche documentaire en S2."
      ],
      "improvements": [
        "Proposer un guide d'auto-évaluation à destination directe des élèves."
      ],
      "nextSteps": "Utiliser cette rigueur critériée pour la grille d'évaluation finale du jeu de société.",
      "detailedFeedback": "Travail d'évaluation d'un niveau professionnel remarquable. Les indicateurs sont observables sans ambiguïté et permettent une évaluation formative constructive.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.4,
          "maxScore": 2.5,
          "justification": "Grille critériée complète et conforme aux directives institutionnelles."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Parfaite distinction entre critère, indicateur et niveau d'acquisition."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Adaptation optimale au public cible de 2e secondaire."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Tableaux d'une grande clarté et explications méthodologiques étayées."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 9.2,
      "maxScore": 10,
      "feedback": "Excellente grille d'évaluation critériée (9.2/10) : Critères didactiques indépendants, indicateurs observables et niveaux de maîtrise gradués.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-collard-alexiane-ex1-8",
    "userId": "user-1790086792053",
    "userName": "Alexiane Collard",
    "userEmail": "alexiane.collard@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "COLLARD_Alexiane_Exercice_1_Diagnostic_de_compe_2026-09-28.pdf",
    "formattedFileName": "COLLARD_Alexiane_Exercice_1_Diagnostic_de_compe_2026-09-28.pdf",
    "fileType": "application/pdf",
    "fileSize": 93137,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-28 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-di-mascia-emma-ex1-9",
    "userId": "user-1790343401573",
    "userName": "Emma DI MASCIA",
    "userEmail": "e2301886@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "DI_MASCIA_Emma_Exercice_1_Diagnostic_de_compe_2026-09-27.pdf",
    "formattedFileName": "DI_MASCIA_Emma_Exercice_1_Diagnostic_de_compe_2026-09-27.pdf",
    "fileType": "application/pdf",
    "fileSize": 131091,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-27 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.8,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.3,
        "didacticQuality": 2.2,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.2
      },
      "summary": "Très bon diagnostic DigComp 2.2 (8.8/10) : Analyse structurée des profils et distinction des niveaux de maîtrise.",
      "strengths": [
        "Bonne appropriation des 5 domaines du cadre européen DigComp 2.2.",
        "Identification lucide des fausses compétences numériques opératoires.",
        "Pistes de remédiation adaptées aux difficultés des élèves."
      ],
      "improvements": [
        "Préciser davantage les critères observables permettant d'évaluer la progression des élèves."
      ],
      "nextSteps": "Consolider la formulation des objectifs d'apprentissage.",
      "detailedFeedback": "Travail très bien mené. Les profils d'élèves sont analysés avec sérieux et la distinction entre maîtrise technique et compétence située est clairement assimilée.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Profils analysés conformément aux attendus de l'atelier."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Bonne maîtrise des descripteurs de compétences DigComp."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Propositions de remédiation cohérentes pour la classe."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Mise en page claire et formulation soignée."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.8,
      "maxScore": 10,
      "feedback": "Très bon diagnostic DigComp 2.2 (8.8/10) : Analyse structurée des profils et distinction des niveaux de maîtrise.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-d-archambeau-florence-ex1-10",
    "userId": "user-1790086871341",
    "userName": "Florence D’Archambeau",
    "userEmail": "e2306390@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "D_ARCHAMBEAU_Florence_Exercice_1_Diagnostic_de_compe_2026-09-24.pdf",
    "formattedFileName": "D_ARCHAMBEAU_Florence_Exercice_1_Diagnostic_de_compe_2026-09-24.pdf",
    "fileType": "application/pdf",
    "fileSize": 184705,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-24 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.8,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.3,
        "didacticQuality": 2.2,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.2
      },
      "summary": "Très bon diagnostic DigComp 2.2 (8.8/10) : Analyse structurée des profils et distinction des niveaux de maîtrise.",
      "strengths": [
        "Bonne appropriation des 5 domaines du cadre européen DigComp 2.2.",
        "Identification lucide des fausses compétences numériques opératoires.",
        "Pistes de remédiation adaptées aux difficultés des élèves."
      ],
      "improvements": [
        "Préciser davantage les critères observables permettant d'évaluer la progression des élèves."
      ],
      "nextSteps": "Consolider la formulation des objectifs d'apprentissage.",
      "detailedFeedback": "Travail très bien mené. Les profils d'élèves sont analysés avec sérieux et la distinction entre maîtrise technique et compétence située est clairement assimilée.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Profils analysés conformément aux attendus de l'atelier."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Bonne maîtrise des descripteurs de compétences DigComp."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Propositions de remédiation cohérentes pour la classe."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Mise en page claire et formulation soignée."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.8,
      "maxScore": 10,
      "feedback": "Très bon diagnostic DigComp 2.2 (8.8/10) : Analyse structurée des profils et distinction des niveaux de maîtrise.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-jamar-michael-ex1-14",
    "userId": "user-1790087241045",
    "userName": "Michael Jamar",
    "userEmail": "e2303712@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "JAMAR_Michael_Exercice_1_Diagnostic_de_compe_2026-09-27 (1).docx",
    "formattedFileName": "JAMAR_Michael_Exercice_1_Diagnostic_de_compe_2026-09-27 (1).docx",
    "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "fileSize": 17630,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-27 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-mokeddem-laura-ex1-17",
    "userId": "user-1790086729864",
    "userName": "Laura Mokeddem",
    "userEmail": "laura.mokeddem@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "MOKEDDEM_Laura_Exercice_1_Diagnostic_de_compe_2026-09-25.pdf",
    "formattedFileName": "MOKEDDEM_Laura_Exercice_1_Diagnostic_de_compe_2026-09-25.pdf",
    "fileType": "application/pdf",
    "fileSize": 38991,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-25 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-rodes-mathis-ex1-18",
    "userId": "user-1790343751310",
    "userName": "Mathis Rodès",
    "userEmail": "mathis.rodes@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "RODES_Mathis_Exercice_1_Diagnostic_de_compe_2026-09-25.docx",
    "formattedFileName": "RODES_Mathis_Exercice_1_Diagnostic_de_compe_2026-09-25.docx",
    "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "fileSize": 17690,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-25 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-sarlet-amelie-ex1-19",
    "userId": "user-1790345777275",
    "userName": "Amélie Sarlet",
    "userEmail": "e2301877",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "SARLET_Amelie_Exercice_1_Diagnostic_de_compe_2026-09-26.pdf",
    "formattedFileName": "SARLET_Amelie_Exercice_1_Diagnostic_de_compe_2026-09-26.pdf",
    "fileType": "application/pdf",
    "fileSize": 79190,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-26 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 9.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.5,
        "didacticQuality": 2.4,
        "criticalAnalysis": 2.3,
        "formAndStructure": 2.3
      },
      "summary": "Diagnostic de compétences remarquable (9.5/10) : Analyse exhaustive et approfondie des 6 profils d'élèves selon le cadre DigComp 2.2.",
      "strengths": [
        "Distinction conceptuelle rigoureuse entre habileté opératoire instrumentale et compétence située réflexive.",
        "Analyse détaillée des 6 profils d'élèves (Sarah, Thomas, Lina, Hugo, Julie, Mehdi).",
        "Propositions concrètes de différenciation pédagogique et d'activités de remédiation en classe."
      ],
      "improvements": [
        "Consolider les liens avec les nouveaux attendus du référentiel FMTTN tronc commun."
      ],
      "nextSteps": "Maintenir ce niveau de rigueur pour les prochains diagnostics.",
      "detailedFeedback": "Analyse d'une grande maturité pédagogique. Chaque profil d'élève est décortiqué avec justesse et les pistes didactiques proposées sont directement opérationnalisables.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.5,
          "maxScore": 2.5,
          "justification": "Diagnostic complet couvrant l'ensemble des profils et domaines DigComp."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.4,
          "maxScore": 2.5,
          "justification": "Maîtrise remarquable du cadre DigComp 2.2 et du concept de compétence située."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Différenciation pédagogique adaptée à chaque besoin d'apprentissage."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Structure impeccable, tableaux clairs et argumentation étayée."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 9.5,
      "maxScore": 10,
      "feedback": "Diagnostic de compétences remarquable (9.5/10) : Analyse exhaustive et approfondie des 6 profils d'élèves selon le cadre DigComp 2.2.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-siragusa-sabrina-ex1-20",
    "userId": "user-1790189590610",
    "userName": "Sabrina Siragusa",
    "userEmail": "sabrina.siragusa@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "SIRAGUSA_Sabrina_Exercice_1_Diagnostic_de_compe_2026-09-23.pdf",
    "formattedFileName": "SIRAGUSA_Sabrina_Exercice_1_Diagnostic_de_compe_2026-09-23.pdf",
    "fileType": "application/pdf",
    "fileSize": 52774,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-23 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-siragusa-sabrina-ex2-21",
    "userId": "user-1790189590610",
    "userName": "Sabrina Siragusa",
    "userEmail": "sabrina.siragusa@student.hech.be",
    "exerciseId": "exercice-02",
    "exerciseTitle": "exercice-02",
    "originalFileName": "SIRAGUSA_Sabrina_Exercice_2_Peut-on_faire_confi_2026-09-26 (1).pdf",
    "formattedFileName": "SIRAGUSA_Sabrina_Exercice_2_Peut-on_faire_confi_2026-09-26 (1).pdf",
    "fileType": "application/pdf",
    "fileSize": 80456,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-26 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 9.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.5,
        "didacticQuality": 2.4,
        "criticalAnalysis": 2.3,
        "formAndStructure": 2.3
      },
      "summary": "Excellente production didactique (9.5/10) : Démarche d'investigation scientifique remarquable, déconstruction du sensationnalisme et posture réflexive exemplaire.",
      "strengths": [
        "Identification de la source primaire : étude norvégienne Hjetland et al. (Frontiers in Psychiatry, 31 mars 2025) et Brosnan et al. (JAMA Pediatrics 2024).",
        "Mise en évidence précise du sensationnalisme : 24 minutes de sommeil effectif réduit vs les 2 heures proclamées par le titre viral.",
        "Protocole de vérification méthodique en 5 étapes articulées (recherche d'origine, croisement de bases académiques PubMed/Scholar, validation/invalidation).",
        "Décision didactique argumentée : refus lucide de partager l'affirmation brute en raison du manque d'opérationnalisation et de la spécificité des cohortes.",
        "Préparation structurée de la défense orale de 2 minutes."
      ],
      "improvements": [
        "Poursuivre ce haut niveau de rigueur méthodologique pour les étapes suivantes de conception du projet de jeu."
      ],
      "nextSteps": "Maintenir cette excellence pour la phase de prototypage matériel du projet FMTTN.",
      "detailedFeedback": "Votre travail sur l'Atelier 2 constitue une référence méthodologique. Vous avez su remonter aux sources scientifiques primaires (Frontiers in Psychiatry 2025, JAMA Pediatrics 2024), mettre au jour l'écart factuel entre l'étude (24 min) et la dramatisation médiatique (2h), et formaliser un argumentaire didactique solide pour des élèves du secondaire. Félicitations pour cette rigueur exemplaire !",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.5,
          "maxScore": 2.5,
          "justification": "Respect exhaustif et rigoureux de l'ensemble des 5 étapes méthodologiques."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.4,
          "maxScore": 2.5,
          "justification": "Excellence scientifique : croisement de sources primaires (PubMed, Google Scholar, Frontiers, JAMA)."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Décision didactique justifiée, distinction des populations et recul sur l'impact en classe."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Rédaction fluide, terminologie précise et préparation soignée de la soutenance orale."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 9.5,
      "maxScore": 10,
      "feedback": "Excellente production didactique (9.5/10) : Démarche d'investigation scientifique remarquable, déconstruction du sensationnalisme et posture réflexive exemplaire.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-steckx-chloe-ex1-23",
    "userId": "user-1790163391889",
    "userName": "Chloé Steckx",
    "userEmail": "chloe.steckx@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "STECKX_Chloe_Exercice_1_Diagnostic_de_compe_2026-09-25.pdf",
    "formattedFileName": "STECKX_Chloe_Exercice_1_Diagnostic_de_compe_2026-09-25.pdf",
    "fileType": "application/pdf",
    "fileSize": 56773,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-25 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-valenzano-jonathan-ex1-25",
    "userId": "user-1790108903773",
    "userName": "Jonathan Valenzano",
    "userEmail": "jonathan.valenzano@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "VALENZANO_Jonathan_Exercice_1_Diagnostic_de_compe_2026-09-25 (1).pdf",
    "formattedFileName": "VALENZANO_Jonathan_Exercice_1_Diagnostic_de_compe_2026-09-25 (1).pdf",
    "fileType": "application/pdf",
    "fileSize": 52774,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-25 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-real-valenzano-jonathan-ex2-27",
    "userId": "user-1790108903773",
    "userName": "Jonathan Valenzano",
    "userEmail": "jonathan.valenzano@student.hech.be",
    "exerciseId": "exercice-02",
    "exerciseTitle": "exercice-02",
    "originalFileName": "VALENZANO_Jonathan_Exercice_2_Peut-on_faire_confi_2026-09-26 (1).pdf",
    "formattedFileName": "VALENZANO_Jonathan_Exercice_2_Peut-on_faire_confi_2026-09-26 (1).pdf",
    "fileType": "application/pdf",
    "fileSize": 80456,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-26 12:00",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 9.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.5,
        "didacticQuality": 2.4,
        "criticalAnalysis": 2.3,
        "formAndStructure": 2.3
      },
      "summary": "Excellente production didactique (9.5/10) : Démarche d'investigation scientifique remarquable, déconstruction du sensationnalisme et posture réflexive exemplaire.",
      "strengths": [
        "Identification de la source primaire : étude norvégienne Hjetland et al. (Frontiers in Psychiatry, 31 mars 2025) et Brosnan et al. (JAMA Pediatrics 2024).",
        "Mise en évidence précise du sensationnalisme : 24 minutes de sommeil effectif réduit vs les 2 heures proclamées par le titre viral.",
        "Protocole de vérification méthodique en 5 étapes articulées (recherche d'origine, croisement de bases académiques PubMed/Scholar, validation/invalidation).",
        "Décision didactique argumentée : refus lucide de partager l'affirmation brute en raison du manque d'opérationnalisation et de la spécificité des cohortes.",
        "Préparation structurée de la défense orale de 2 minutes."
      ],
      "improvements": [
        "Poursuivre ce haut niveau de rigueur méthodologique pour les étapes suivantes de conception du projet de jeu."
      ],
      "nextSteps": "Maintenir cette excellence pour la phase de prototypage matériel du projet FMTTN.",
      "detailedFeedback": "Votre travail sur l'Atelier 2 constitue une référence méthodologique. Vous avez su remonter aux sources scientifiques primaires (Frontiers in Psychiatry 2025, JAMA Pediatrics 2024), mettre au jour l'écart factuel entre l'étude (24 min) et la dramatisation médiatique (2h), et formaliser un argumentaire didactique solide pour des élèves du secondaire. Félicitations pour cette rigueur exemplaire !",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.5,
          "maxScore": 2.5,
          "justification": "Respect exhaustif et rigoureux de l'ensemble des 5 étapes méthodologiques."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.4,
          "maxScore": 2.5,
          "justification": "Excellence scientifique : croisement de sources primaires (PubMed, Google Scholar, Frontiers, JAMA)."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Décision didactique justifiée, distinction des populations et recul sur l'impact en classe."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Rédaction fluide, terminologie précise et préparation soignée de la soutenance orale."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 9.5,
      "maxScore": 10,
      "feedback": "Excellente production didactique (9.5/10) : Démarche d'investigation scientifique remarquable, déconstruction du sensationnalisme et posture réflexive exemplaire.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790089000103-r4ej",
    "userId": "",
    "userName": "Daphné Depuis",
    "userEmail": "daphne.depuis@gmail.com",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "DEPUIS_Daphne_Exercice_1_Diagnostic_de_compe_2026-09-22.docx",
    "formattedFileName": "DEPUIS_Daphne_Exercice_1_Diagnostic_de_compe_2026-09-22.docx",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-22 12:56",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790234632310-65ir",
    "userId": "",
    "userName": "Daphné Depuis",
    "userEmail": "daphne.depuis@gmail.com",
    "exerciseId": "exercice-02",
    "exerciseTitle": "exercice-02",
    "originalFileName": "DEPUIS_Daphne_Exercice_2_Peut-on_faire_confi_2026-09-24.docx",
    "formattedFileName": "DEPUIS_Daphne_Exercice_2_Peut-on_faire_confi_2026-09-24.docx",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-24 05:23",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail d'investigation (8.5/10) : Consignes respectées et démarche critique engagée.",
      "strengths": [
        "Respect du cadre de vérification d'une information scientifique.",
        "Analyse argumentée de la fiabilité de l'affirmation.",
        "Dépôt conforme au format requis."
      ],
      "improvements": [
        "Développer davantage le croisement avec des bases de données scientifiques primaires (PubMed, Google Scholar).",
        "Expliciter concrètement les activités d'éducation aux médias transposables aux élèves."
      ],
      "nextSteps": "Approfondir la posture critique lors des prochains ateliers.",
      "detailedFeedback": "Travail cohérent et satisfaisant. La décision pédagogique est argumentée et la prise de recul vis-à-vis de l'affirmation sur le sommeil est acquise.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes et questionnements de l'atelier respectés."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Vocabulaire critique et notions de fiabilité correctement mobilisés."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Démarche d'investigation et réflexion sur le public cible."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Structure lisible et argumentation cohérente."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail d'investigation (8.5/10) : Consignes respectées et démarche critique engagée.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790088740329-isw3",
    "userId": "",
    "userName": "Anaïs Vanhee",
    "userEmail": "vanhee.anais.mail@gmail.com",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "VANHEE_Anais_Exercice_1_Diagnostic_de_compe_2026-09-22.docx",
    "formattedFileName": "VANHEE_Anais_Exercice_1_Diagnostic_de_compe_2026-09-22.docx",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-22 12:52",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790087800768-3wdo",
    "userId": "",
    "userName": "Julien Esposito",
    "userEmail": "julien.esposito@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "ESPOSITO_Julien_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "formattedFileName": "ESPOSITO_Julien_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-22 12:36",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790088082809-w0xk",
    "userId": "",
    "userName": "Juliette Renard",
    "userEmail": "e2505429@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "RENARD_Juliette_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "formattedFileName": "RENARD_Juliette_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-22 12:41",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790088933165-m1oe",
    "userId": "",
    "userName": "Stephanie Mülverstedt",
    "userEmail": "e141977@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "MULVERSTEDT_Stephanie_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "formattedFileName": "MULVERSTEDT_Stephanie_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-22 12:55",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790162748391-t5o3",
    "userId": "",
    "userName": "Nathalie D'accardo",
    "userEmail": "e2604966@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "D_ACCARDO_Nathalie_Exercice_1_Diagnostic_de_compe_2026-09-23.pdf",
    "formattedFileName": "D_ACCARDO_Nathalie_Exercice_1_Diagnostic_de_compe_2026-09-23.pdf",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-23 09:25",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790089835522-ddmy",
    "userId": "",
    "userName": "Aurélie Schreurs",
    "userEmail": "aurelie.schreurs@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "SCHREURS_Aurelie_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "formattedFileName": "SCHREURS_Aurelie_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-22 13:10",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790088087993-umxc",
    "userId": "",
    "userName": "Dalia Smaali",
    "userEmail": "dalia.smaali@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "SMAALI_Dalia_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "formattedFileName": "SMAALI_Dalia_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-22 12:41",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "file-1790086884389-i44x",
    "userId": "",
    "userName": "Olivier Henrion",
    "userEmail": "olivier.henrion@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "HENRION_Olivier_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "formattedFileName": "HENRION_Olivier_Exercice_1_Diagnostic_de_compe_2026-09-22.pdf",
    "fileType": "application/pdf",
    "fileSize": 50000,
    "dataUrl": "",
    "driveUrl": "",
    "submittedAt": "2026-09-22 12:21",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 8.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.2,
        "didacticQuality": 2.1,
        "criticalAnalysis": 2.1,
        "formAndStructure": 2.1
      },
      "summary": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "strengths": [
        "Distinction acquise entre habileté et compétence.",
        "Analyse des profils d'élèves conforme aux objectifs du cours.",
        "Dépôt régulier dans les délais."
      ],
      "improvements": [
        "Enrichir les propositions de remédiation didactique."
      ],
      "nextSteps": "Poursuivre sur cette dynamique pour les prochains ateliers.",
      "detailedFeedback": "Bon travail d'ensemble. Les notions du référentiel DigComp 2.2 sont bien comprises et mobilisées.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.2,
          "maxScore": 2.5,
          "justification": "Consignes respectées."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Notions DigComp assimilées."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Transfert vers l'enseignement secondaire amorcé."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.1,
          "maxScore": 2.5,
          "justification": "Document soigné."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 8.5,
      "maxScore": 10,
      "feedback": "Bon travail sur le cadre DigComp 2.2 (8.5/10) : Profils diagnostiqués avec discernement.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "1G_UxRS92bnRKHvfYGOKo_XQ6rmHL8sNZ",
    "userId": "user-1790345777275",
    "userName": "Amélie Sarlet",
    "userEmail": "e2301877",
    "exerciseId": "exercice-01",
    "exerciseTitle": "exercice-01",
    "originalFileName": "SARLET_Amelie_Exercice_1_Diagnostic_de_compe_2026-09-30.pdf",
    "formattedFileName": "SARLET_Amelie_Exercice_1_Diagnostic_de_compe_2026-09-30.pdf",
    "fileType": "application/pdf",
    "fileSize": 79190,
    "dataUrl": "",
    "driveUrl": "https://drive.google.com/file/d/1G_UxRS92bnRKHvfYGOKo_XQ6rmHL8sNZ/view?usp=drivesdk",
    "submittedAt": "2026-09-30 11:40",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 9.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.5,
        "didacticQuality": 2.4,
        "criticalAnalysis": 2.3,
        "formAndStructure": 2.3
      },
      "summary": "Diagnostic de compétences remarquable (9.5/10) : Analyse exhaustive et approfondie des 6 profils d'élèves selon le cadre DigComp 2.2.",
      "strengths": [
        "Distinction conceptuelle rigoureuse entre habileté opératoire instrumentale et compétence située réflexive.",
        "Analyse détaillée des 6 profils d'élèves (Sarah, Thomas, Lina, Hugo, Julie, Mehdi).",
        "Propositions concrètes de différenciation pédagogique et d'activités de remédiation en classe."
      ],
      "improvements": [
        "Consolider les liens avec les nouveaux attendus du référentiel FMTTN tronc commun."
      ],
      "nextSteps": "Maintenir ce niveau de rigueur pour les prochains diagnostics.",
      "detailedFeedback": "Analyse d'une grande maturité pédagogique. Chaque profil d'élève est décortiqué avec justesse et les pistes didactiques proposées sont directement opérationnalisables.",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.5,
          "maxScore": 2.5,
          "justification": "Diagnostic complet couvrant l'ensemble des profils et domaines DigComp."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.4,
          "maxScore": 2.5,
          "justification": "Maîtrise remarquable du cadre DigComp 2.2 et du concept de compétence située."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Différenciation pédagogique adaptée à chaque besoin d'apprentissage."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Structure impeccable, tableaux clairs et argumentation étayée."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 9.5,
      "maxScore": 10,
      "feedback": "Diagnostic de compétences remarquable (9.5/10) : Analyse exhaustive et approfondie des 6 profils d'élèves selon le cadre DigComp 2.2.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  },
  {
    "id": "1CEszk5ydQs97WYbtk-i3JgFPlyDuwZ3f",
    "userId": "user-1790108903773",
    "userName": "Jonathan Valenzano",
    "userEmail": "jonathan.valenzano@student.hech.be",
    "exerciseId": "exercice-02",
    "exerciseTitle": "exercice-02",
    "originalFileName": "VALENZANO_Jonathan_Exercice_2_Peut-on_faire_confi_2026-09-30.pdf",
    "formattedFileName": "VALENZANO_Jonathan_Exercice_2_Peut-on_faire_confi_2026-09-30.pdf",
    "fileType": "application/pdf",
    "fileSize": 80456,
    "dataUrl": "",
    "driveUrl": "https://drive.google.com/file/d/1CEszk5ydQs97WYbtk-i3JgFPlyDuwZ3f/view?usp=drivesdk",
    "submittedAt": "2026-09-30 12:27",
    "driveSynced": true,
    "aiCorrection": {
      "status": "analyzed",
      "suggestedScore": 9.5,
      "maxScore": 10,
      "rubricScores": {
        "concordance": 2.5,
        "didacticQuality": 2.4,
        "criticalAnalysis": 2.3,
        "formAndStructure": 2.3
      },
      "summary": "Excellente production didactique (9.5/10) : Démarche d'investigation scientifique remarquable, déconstruction du sensationnalisme et posture réflexive exemplaire.",
      "strengths": [
        "Identification de la source primaire : étude norvégienne Hjetland et al. (Frontiers in Psychiatry, 31 mars 2025) et Brosnan et al. (JAMA Pediatrics 2024).",
        "Mise en évidence précise du sensationnalisme : 24 minutes de sommeil effectif réduit vs les 2 heures proclamées par le titre viral.",
        "Protocole de vérification méthodique en 5 étapes articulées (recherche d'origine, croisement de bases académiques PubMed/Scholar, validation/invalidation).",
        "Décision didactique argumentée : refus lucide de partager l'affirmation brute en raison du manque d'opérationnalisation et de la spécificité des cohortes.",
        "Préparation structurée de la défense orale de 2 minutes."
      ],
      "improvements": [
        "Poursuivre ce haut niveau de rigueur méthodologique pour les étapes suivantes de conception du projet de jeu."
      ],
      "nextSteps": "Maintenir cette excellence pour la phase de prototypage matériel du projet FMTTN.",
      "detailedFeedback": "Votre travail sur l'Atelier 2 constitue une référence méthodologique. Vous avez su remonter aux sources scientifiques primaires (Frontiers in Psychiatry 2025, JAMA Pediatrics 2024), mettre au jour l'écart factuel entre l'étude (24 min) et la dramatisation médiatique (2h), et formaliser un argumentaire didactique solide pour des élèves du secondaire. Félicitations pour cette rigueur exemplaire !",
      "criteriaTable": [
        {
          "name": "Concordance aux consignes & Pertinence du sujet (Critère A)",
          "score": 2.5,
          "maxScore": 2.5,
          "justification": "Respect exhaustif et rigoureux de l'ensemble des 5 étapes méthodologiques."
        },
        {
          "name": "Exactitude conceptuelle & Maîtrise didactique FMTTN (Critère B)",
          "score": 2.4,
          "maxScore": 2.5,
          "justification": "Excellence scientifique : croisement de sources primaires (PubMed, Google Scholar, Frontiers, JAMA)."
        },
        {
          "name": "Analyse critique & Transfert pédagogique vers les élèves (Critères C & D)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Décision didactique justifiée, distinction des populations et recul sur l'impact en classe."
        },
        {
          "name": "Qualité de la communication & Réflexivité (Critères E & H)",
          "score": 2.3,
          "maxScore": 2.5,
          "justification": "Rédaction fluide, terminologie précise et préparation soignée de la soutenance orale."
        }
      ],
      "correctedAt": "2026-09-30 15:00",
      "modelUsed": "Évaluateur Didactique FMTTN (Analyse critériée & lexicale)"
    },
    "teacherGrade": {
      "score": 9.5,
      "maxScore": 10,
      "feedback": "Excellente production didactique (9.5/10) : Démarche d'investigation scientifique remarquable, déconstruction du sensationnalisme et posture réflexive exemplaire.",
      "gradedAt": "2026-09-30 15:00",
      "status": "graded"
    }
  }
];

export const INITIAL_REAL_SUBMISSIONS: Submission[] = [
  {
    "id": "sub-real-bats-nathalie-ex1-1",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Nathalie Bats – Master S3 26/27\nExercice 1.1A − Compétent, partiellement \ncompétent ou incompétent ?\nLes 10 profils\nProfil 1 – Sarah\n \n   : l’experte en IA\n \n \nPARTIELLEMENT COMPÉTENTE\n●\nSait faire : prompts précis, reformuler des requêtes, résumer, générer d’idées. Elle est très à \nl’aise avec les chats IA.\n●\nLimites : elle accepte passivement les réponses de l’IA, n’identifie pas les sources \noriginales, ne détecte pas les informations fausses.\n●\nAdaptation / autonomie technique : oui, pour l’usage de l’outil.\n●\nRegard critique : quasi absent (principale limite).\n●\nResponsabilité : défaillante, car elle se déresponsabilise (« c’est l’IA qui a répondu ») au lieu\nde vérifier.\nElle a une maîtrise technique réelle, mais manque de pensée critique et de responsabilité : elle est \ncompétente sur une dimension seulement.\nProfil 2 – Thomas\n \n   : le débrouillard\n \n \nCOMPÉTENT\n●\nSait faire : rechercher un outil adapté à une tâche, comparer des options, apprendre via des \ntutoriels, expérimenter, produire un contenu adapté au public visé.\n●\nLimites : peu de logiciels maîtrisés au départ, il est peu à l’aise avec les nouvelles interfaces \n(mais il compense).\n●\nAdaptation : très forte, il sait faire face à la nouveauté.\n●\nAutonomie : cherche seul une solution avant de demander de l’aide.\n●\nRegard critique / responsabilité : évalue les outils, adapte sa production au demandeur. La \ncompétence numérique n’est pas la connaissance d’un outil précis mais la capacité à \napprendre à s’en servir : il agit de façon pertinente et autonome.\nProfil 3 – Lina\n \n   : la spécialiste des réseaux sociaux\n \n \nPARTIELLEMENT COMPÉTENTE\n1 / 4\nNathalie Bats – Master S3 26/27\n●\nSait faire : elle a une maîtrise experte de plusieurs réseaux, créer des contenus vidéo, \nanalyser des statistiques.\n●\nLimites : aucune conscience du consentement, du droit à l’image, de la conservation des \ndonnées ou des conséquences de la diffusion.\n●\nAdaptation / autonomie : probable dans son domaine, mais ça reste cantonné aux réseaux \nsociaux.\n●\nRegard critique : absent sur les enjeux éthiques et juridiques.\n●\nResponsabilité : très défaillante. Elle publie l’image d’autrui sans son consentement.\nBeaucoup d’habiletés techniques, mais une dimension centrale (droit, éthique, conséquences) qui \nest absente.\nProfil 4 – \n \n Hugo\n \n   : le sceptique\n \n \nCOMPÉTENT\n●\nSait faire : vérifier une information (source, date, auteur, recoupement), ne pas partager sans \nvérifier, trouver seul une ressource pour progresser.\n●\nLimites : peu d’habiletés techniques (logiciels, montages complexes).\n●\nAdaptation / autonomie : oui : il cherche des ressources pour progresser seul.\n●\nRegard critique : TB – croisement des sources, identification de l’auteur.\n●\nResponsabilité : oui, il ne diffuse pas sans vérifier.\nComme Thomas, il montre que la compétence numérique est avant tout une posture critique et \nautonome, pas une accumulation de réflexes techniques.\nProfil 5 – Julie\n \n   : l’experte des logiciels\n \n \nPARTIELLEMENT COMPÉTENTE\n●\nSait faire : usage avancé de nombreux logiciels bureautiques ; aider les autres.\n●\nLimites : elle refuse la nouveauté, confond compétence et nombre d’outils maîtrisés.\n●\nAdaptation : très faible car elle refuse d’expérimenter seule un nouvel outil.\n●\nAutonomie : dépend d’une formation ou d’explications pas-à-pas pour tout changement.\n●\nRegard critique / responsabilité : ??.\nCompétence technique qui est figée : elle se révèlerait vite incompétente dès qu’un de ses logiciels \nserait remplacé.\nProfil 6 – Mehdi\n \n   : le chercheur rapide\n \n \nPARTIELLEMENT COMPÉTENT\n●\nSait faire : rechercher efficacement et rapidement une information.\n2 / 4\nNathalie Bats – Master S3 26/27\n●\nLimites : il se contente des premiers résultats, n’analyse pas les sources, confond répétition \nd’une information et véracité.\n●\nAutonomie : technique seulement.\n●\nRegard critique : faible : il ne questionne ni l’auteur, ni la fiabilité.\n●\nResponsabilité : il risque de diffuser de fausses informations.\nBonne hab",
    "submittedAt": "2026-09-24 14:00"
  },
  {
    "id": "sub-real-bats-nathalie-ex2-2",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-02",
    "exerciseTitle": "Atelier 2 : Évaluation critique d'une information",
    "answer": "Nathalie Bats Master S3 26/27\nExercice 02 — Peut-on faire confiance à cette \ninformation ?\nSujet : « Une étude scientifique vient de prouver que regarder son téléphone avant de dormir fait \nperdre 2 heures de sommeil chaque nuit. »\n1. Méthode de vérification\nAvant toute recherche, on suspend son jugement : on ne partage pas, on vérifie.\nInformations à rechercher pour juger de la fiabilité :\n1. L'origine : qui a publié cette affirmation en premier, et sur quel type de site ?\n2. La source primaire : de quelle étude s'agit-il exactement (auteurs, revue, année, DOI) ? \n3. L'auteur / le diffuseur : un scientifique identifiable ou un site anonyme qui cherche des \nclics ?\n4. La formulation : le vocabulaire (« prouver », chiffre choc de « 2 heures », causalité \naffirmée) est-il compatible avec ce que la science produit réellement ?\n5. Le recoupement : au moins deux sources scientifiques indépendantes (PubMed / Google \nScholar / Crossref) pour confirmer ou nuancer ?\nConcrètement : je dois faire des requêtes avec des opérateurs (étude, téléphone, sommeil, 2 heures) \npour remonter la chaîne des republications jusqu'à l'origine, puis rechercher en anglais sur les bases \nscientifiques.\n2. L'enquête\nOrigine : en remontant les republications, je tombe sur des sites de contenu sans auteur ni date. \nAucune étude précise n'est jamais citée.\nAuteurs / diffuseurs : aucun auteur identifiable à l'origine ; diffuseurs anonymes, sans \nresponsabilité éditoriale.\nSources scientifiques (trouvées via Scholar/PubMed/Crossref — elles existent, mais peuvent dire \nautre chose) :\n•\nExelmans & Van den Bulck (2016), Social Science & Medicine, DOI \n10.1016/j.socscimed.2015.11.037 (PMID 26688552) : corrélation entre un usage nocturne \ndu téléphone et gêne du sommeil perçue mais pas de causalité prouvée.\n•\nCarter et al. (2016), JAMA Pediatrics (PMID 27802500) : méta-analyse — association \nfaible à modérée et hétérogène, pas de causalité et jamais de notion de « 2 h ».\n1 / 3\nNathalie Bats Master S3 26/27\n•\nLemola et al. (2015) (PMID 25204836) : causalité inverse observée — les mauvais \ndormeurs utilisent davantage leur téléphone la nuit.\n•\nBrautsch et al. (2023), Sleep Medicine Reviews (PMID 36638702).\nRecoupement : ces sources indépendantes (revues à comité de lecture, indexées PubMed) \nconcordent entre elles et contredisent l'affirmation : ni « preuve », ni 2 heures, ni causalité \nvraiment établie.\nConclusion : l'affirmation n'est pas vérifiable (pas de source primaire) et fausse dans sa forme \n(chiffre gonflé, corrélation présentée comme preuve).\n3. Mon avis\nJe ne partagerai pas cette information avec des élèves.\n1. Pas de source primaire traçable (auteur, revue, date, DOI absents), ce qui est la condition \nde base d'une info scientifique partageable et qui n'est pas rempli.\n2. Ce que la science dit vraiment : une corrélation modeste (Exelmans 2016 ; Carter 2016), \nparfois inverse (Lemola 2015), mais jamais une « preuve » de « 2 h » (Brautsch 2023).\n3. Responsabilité : partager une info invérifiable, c'est alimenter la désinformation.\nEn revanche, ça pourrait être un bon support de cours : je pourrais la donner à vérifier aux élèves \n(situation d'investigation).\n4. Restitution de 2 minutes\n1. Décision : je ne l'aurais pas partagée car il n'y a pas de source primaire, le chiffre peut être \ngonflé, la causalité est présentée comme une « preuve » alors que les études ne montrent \nqu'une corrélation, (parfois même inverse).\n2. Éléments du choix : les 4 études ci-dessus (PMID/DOI) qui concordent et contredisent le « \n2 h prouvé ».\n3. Méthode : suspendre son jugement → chercher l'origine et la source primaire avec des \nopérateurs → vérifier sur PubMed/Scholar/Crossref → recouper ≥ 2 sources indépendantes.\n4. Difficulté rencontrée : remonter jusqu'à la vraie origine me semble presque impossible \n(contenu reposté sans lien) ; et les vraies études sont en anglais et payantes. C'est facile à lire\net difficile à vérifier donc.\nSources (vérifiables)\n•\nExelmans L., Van den B",
    "submittedAt": "2026-09-25 14:00"
  },
  {
    "id": "sub-real-bats-nathalie-ex4-3",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-04",
    "exerciseTitle": "Atelier 4 : Escape Game FMTTN (Cyber-Enquête)",
    "answer": "🚀\nL'ARCHE FMTTN\nSAS FINAL PRÊT\nOfficier : Cadet FMTTN Nathalie B\nTEMPS AVANT SURCHARGE FATALE\n09:33\nDossier d'Enquête (5/5)\nRéférentiel FMTTN (103 p.)\nEXPÉDITION INTERGALACTIQUE SAUVÉE\nLES PASSAGERS SONT SAINS ET SAUFS !\nGrâce à votre maîtrise des savoirs et démarches de la FMTTN, tous les\nsystèmes vitaux de l'Arche sont rétablis. L'expédition reprend sa route\nvers la nouvelle planète habitable !\nTemps Restant\n9:33\nScore Didactique\n60%\nPassagers Sauvés\n1 450 Colons\nDistinction\nExpert FMTTN\nBILAN DES COMPÉTENCES NUMÉRIQUES VALIDÉES (RÉFÉRENTIEL FWB) :\n1. Architecture & Matériel (p. 43, 63) :\nDistinction mémoire vive (volatile) et stockage\npermanent (disque SSD/Cloud).\n2. Recherche Critique & IoT (p. 43, 73, 76) :\nRepérage des publicités, fiabilité des sources et\nchaîne Capteurs ➔ Traitement ➔ Sorties.\n3. Pensée Algorithmique (p. 50, 56, 101) :\nSymboles normalisés de logigrammes et\ndistinction Algorithme (méthode) vs Programme\n(code).\n4. Cybersécurité & Médias (p. 24, 49, 100) :\nLes 5 types de traces numériques, détection du\nphishing et éducation critique (CSEM).\n5. Régulations de Classe (p. 24-26, 43, 74) :\nAccompagnement pédagogique actif face aux\ntableurs, e-mails, boucles et droits d'auteur.\n6. Les 4 Champs Curriculaires (p. 24-25) :\nDonnées, Communication, Création de contenus\net Sécurité au cœur du Tronc Commun.\nRejouer l'expédition\nConsulter le Référentiel Complet\n",
    "submittedAt": "2026-09-27 14:00"
  },
  {
    "id": "sub-real-bats-nathalie-ex5-4",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-05",
    "exerciseTitle": "Atelier 5 : Défi 20 min Canva (Affiche mot de passe)",
    "answer": "MOT DE PASSE\nSÉCURISÉ\nLong, unique, imprévisible \nMinimum 12 caractères :\nphrase + chiffres + symbole\nUn mot de passe différent par\ncompte\nNathalie Bats - Master S3 26/27\nExercice 5 — Défi Canva : \n \n \naffiche « Mot de passe sécurisé »\nTexte de présentation du défi\nVous avez sans doute dix comptes, et souvent un seul mot de passe pour tous. C'est\nprécisément ce que mon affiche cherche à corriger.\nAvant de la concevoir, j'ai analysé les infos importantes à connaître pour réaliser un message \nsécurisé, j'ai posé mes idées sur papier, et lancé une proposition Canva en lien avec mes choix.\nJ'ai choisi trois messages, pas plus, et une règle par message. En effet, un élève ne retient pas une \nliste à rallonge : il retient ce qu'il peut réciter en un souffle.\nAinsi : long, unique, imprévisible ; minimum 12 caractères : phrase + chiffres + symbole ; et un mot\nde passe différent par compte. \nJ'ai utilisé un vocabulaire du quotidien, c'est donc accessible dès l'école primaire.\nAussi une consigne seule ne suffit pas souvent : chaque règle est donc doublée d'une icône, ce qui \npermet de comprendre l'affiche sans même la lire en entier — la flèche qui se répète pour « \nimprévisible », les lettres mélangées pour la diversité des caractères, le cadenas avec une seule clé \npour la sécurité et le mot de passe unique.\nMes choix de mise en page ne sont pas décoratifs : un fond blanc neutre pour ne pas distraire, deux \ncouleurs seulement, un titre en majuscules pour qu'on sache en une seconde de quoi il s'agit. C'est \npour cette raison que le message se prend en main en moins de trente secondes : l'œil descend de \npastille en pastille, une idée par ligne.\nJ'ai tenu les contraintes au chiffre près : 20 mots sur les 30 autorisés, 3 éléments visuels sur les 3 \npermis. En bref, mon affiche n'explique pas la théorie du mot de passe — elle donne trois gestes \nsimples à faire maintenant, et c'est exactement ce dont un élève a besoin.\nUne limite assumée\nLe premier pictogramme (point d'interrogation + flèches) est le moins lisible instinctivement des \ntrois : « imprévisible » s'y devine plus qu'il ne se lit. C'est pourquoi je prendrai le temps de \nl'expliquer aux élèves.\n1 / 1\n",
    "submittedAt": "2026-09-26 14:00"
  },
  {
    "id": "sub-real-bats-nathalie-ex5-5",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-05",
    "exerciseTitle": "Atelier 5 : Défi 20 min Canva (Affiche mot de passe)",
    "answer": "Nathalie Bats - Master S3 26/27\nExercice 5 — Défi Canva : \n \n \naffiche « Mot de passe sécurisé »\nTexte de présentation du défi\nVous avez sans doute dix comptes, et souvent un seul mot de passe pour tous. C'est\nprécisément ce que mon affiche cherche à corriger.\nAvant de la concevoir, j'ai analysé les infos importantes à connaître pour réaliser un message \nsécurisé, j'ai posé mes idées sur papier, et lancé une proposition Canva en lien avec mes choix.\nJ'ai choisi trois messages, pas plus, et une règle par message. En effet, un élève ne retient pas une \nliste à rallonge : il retient ce qu'il peut réciter en un souffle.\nAinsi : long, unique, imprévisible ; minimum 12 caractères : phrase + chiffres + symbole ; et un mot\nde passe différent par compte. \nJ'ai utilisé un vocabulaire du quotidien, c'est donc accessible dès l'école primaire.\nAussi une consigne seule ne suffit pas souvent : chaque règle est donc doublée d'une icône, ce qui \npermet de comprendre l'affiche sans même la lire en entier — la flèche qui se répète pour « \nimprévisible », les lettres mélangées pour la diversité des caractères, le cadenas avec une seule clé \npour la sécurité et le mot de passe unique.\nMes choix de mise en page ne sont pas décoratifs : un fond blanc neutre pour ne pas distraire, deux \ncouleurs seulement, un titre en majuscules pour qu'on sache en une seconde de quoi il s'agit. C'est \npour cette raison que le message se prend en main en moins de trente secondes : l'œil descend de \npastille en pastille, une idée par ligne.\nJ'ai tenu les contraintes au chiffre près : 20 mots sur les 30 autorisés, 3 éléments visuels sur les 3 \npermis. En bref, mon affiche n'explique pas la théorie du mot de passe — elle donne trois gestes \nsimples à faire maintenant, et c'est exactement ce dont un élève a besoin.\nUne limite assumée\nLe premier pictogramme (point d'interrogation + flèches) est le moins lisible instinctivement des \ntrois : « imprévisible » s'y devine plus qu'il ne se lit. C'est pourquoi je prendrai le temps de \nl'expliquer aux élèves.\n1 / 1\n",
    "submittedAt": "2026-09-26 14:00"
  },
  {
    "id": "sub-real-bats-nathalie-ex6-6",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-06",
    "exerciseTitle": "Atelier 6 : Démarche itérative (Concevoir & tester un mini-jeu)",
    "answer": "Nathalie Bats- Master S3 26/27\nExercice 6\nLien du Genially créé\nhttps://view.genially.com/6ab9078a5c545d5725e4a4f7\nPublic cible\n•\nÂge : 10 à 12 ans (élèves de 5e et 6e primaires).\n•\nCaractéristiques : À cet âge, les enfants ont une bonne motricité fine pour les mécaniques de\nglisser-déposer sur écran. Ils sont capables de comprendre l'impact environnemental global \net de dépasser le simple automatisme pour analyser les exceptions et les filières de recyclage\ncomplexes (comme le Recypark).\nObjectif pédagogique global\n•\nDévelopper l'éco-citoyenneté et l'esprit critique des élèves en les rendant capables de trier \ncorrectement les déchets du quotidien selon les normes actuelles en Belgique, tout en \nidentifiant les filières spécifiques pour les déchets dangereux ou encombrants.\nObjectifs opérationnels (ce que l'élève sait faire à la fin \ndu jeu) :\n•\nAssocier un déchet ménager courant à son bac de tri de couleur (Bleu PMC, Vert Compost, \nJaune Carton, Noir Tout-venant).\n•\nDistinguer les déchets ménagers des déchets spéciaux (piles, ampoules) nécessitant un \napport en point de collecte (Bebat/Recupel) ou au Recypark (parc à conteneurs).\nRègles du jeu\n•\nMécanique principale (\"Cherche et trouve\" & \"Glisser-déposer\") : Sur chaque écran \nd'environnement, l'élève doit repérer les 3 déchets visuels dissimulés dans le décor. Il doit \nensuite cliquer dessus et les faire glisser physiquement dans le bon contenant situé en bas de \nl'écran.\n•\nSystème de validation (Quiz final) : Après l'exploration des milieux, l'élève doit répondre \ncorrectement à une vignette interactive à choix multiples (QCM) portant sur les piles, les \nampoules et le rôle du Recypark.\n•\nCondition de victoire : L'élève réussit le jeu lorsqu'il a exploré les 3 zones (Cuisine, Jardin, \nÉcole), correctement trié les 9 déchets et validé l'étape de la question avancée pour obtenir \nson badge final.\n1 / 4\nNathalie Bats- Master S3 26/27\nScénario : \"Mission Ville Propre\"\nL'accroche (Introduction) : La ville est en plein désordre, des déchets ont été abandonnés partout \npar négligence. Le joueur est investi d'une mission de confiance d'agent de tri et doit nettoyer la \nville quartier par quartier.\nLa progression (Corps du jeu) : L'élève voyage à travers 3 environnements familiers qui génèrent \ndes déchets différents :\n•\nLa cuisine : Gestion des emballages propres, du verre et des restes organiques (Canette → \nPMC, Pomme → Compost, Boîte vide → Carton).\n•\nLe parc : Confrontation avec la nature et la pollution extérieure (Bouteille → PMC, Feuilles \nmortes → Compost, Sac vide en papier → Carton).\n•\nLa cour d'école : Tri lié aux activités scolaires et aux pièges courants (Vieux cahier → \nCarton, Emballage de jus vide → Ballon crevé → Tout-venant).\nLe rebondissement pédagogique : Une fois la ville nettoyée en surface, le jeu pousse l'élève à \nréfléchir aux objets plus complexes qui ne vont jamais dans les poubelles de la maison (piles de la \ncalculatrice, ampoules de la classe).\nLe dénouement (Conclusion) : Une fois les connaissances validées, la ville redevient propre et \nverdoyante. L'élève reçoit officiellement son badge virtuel de \"Citoyen Éco-responsable\" \naccompagné d'un rappel des règles d'or pour ancrer durablement les bonnes pratiques.\nLien du questionnaire Forms\nBienvenue dans le test du mini-jeu sur le tri ! – Remplir le formulaire\nAnalyser et améliorer \nTravaillant à distance et seule, je ne peux que me projeter dans les réponses que j'aurais pu obtenir \nde mes collègues.\nDans les pistes d'amélioration, j'aurais pu avoir : \n•\ndes images de poubelles telles qu'on en rencontre en Belgique ;\n•\ndes images générées par IA pour le fond et pour les déchets à glisser-déposer de manière à \nce que ça se fonde mieux dans le décor et sois plus réaliste (version non-payante dans \nlaquelle je ne peux pas générer d'image mais j'aurais pu passer par un autre générateur) ;\n•\ndavantage de slides ;\n•\ndavantage de question à cocher ;\n•\ndes questions moins simples et engageant davantage la réfl",
    "submittedAt": "2026-09-27 14:00"
  },
  {
    "id": "sub-real-bats-nathalie-ex8-7",
    "userId": "user-1790267864270",
    "userName": "Nathalie Bats",
    "userEmail": "nbats@student.hech.be",
    "exerciseId": "exercice-08",
    "exerciseTitle": "Atelier 8 : Grilles d'évaluation critériées",
    "answer": "Nathalie Bats – Master S3 26/27\nCas 1 – Recherche d’information (personnalité \nscientifique) – 2e secondaire (S2)\n1. Apprentissages visés\nSavoir – (3e primaire, acquis de départ) : « Utiliser, adéquatement en contexte, les termes dont \nmoteur de recherche, barre de recherche, navigateur. »\nSavoir-faire – (2e secondaire) : « Identifier des éléments nécessaires au questionnement de la \nfiabilité d’une source (URL, date de publication et/ou de mise à jour, auteur, diffuseur…). » et (2e \nsecondaire) : « Identifier l’intention de chaque élément figurant sur une page Web. »\nCompétences – (2e secondaire) : « Rechercher un contenu, en autonomie*, au moyen d’un moteur \nde recherche pertinent, en utilisant des opérateurs et/ou des options avancées, en justifiant sa \nstratégie. » et (2e secondaire) : « Évaluer la fiabilité contextuelle d’une source, à l’aide d’une grille \ncritériée. »\nCapacité réflexive : justifier sa stratégie de recherche, donc conscientiser un geste ordinairement \nimplicite.\n2. La grille\nCritère 1 – Stratégie de recherche\nIndicateurs : choix explicite d’un moteur pertinent ; usage d’au moins un opérateur (\"\", site:, date:\n…) ; trace écrite de la justification.\nNon acquis : tape n’importe quelle question dans n’importe quel moteur, ne justifie pas.\nEn voie : utilise un opérateur mais ne peut pas expliquer pourquoi ce moteur/ce choix.\nAcquis : moteur choisi et opérateur utilisés à bon escient, stratégie justifiée oralement.\nDépassé : adapte sa requête en cours de route selon les résultats obtenus, compare deux \nmoteurs.\nCritère 2 – Sélection des informations pertinentes\nIndicateurs : informations en lien avec la personnalité scientifique demandée ; recoupement d’au \nmoins 2 sources ; hiérarchie entre information utile / anecdotique.\nNon acquis : copie-colle le premier résultat sans lien avec la consigne.\nEn voie : informations pertinentes mais une seule source, sans tri.\nAcquis : sélection pertinente recoupée sur au moins 2 sources.\nDépassé : hiérarchise et critique les écarts entre les sources trouvées.\nCritère 3 – Identification de la fiabilité des sources\nIndicateurs : relève URL, auteur, date, diffuseur ; distingue fait / opinion ; conclut de façon nuancée \n(« vérifiable », « non vérifiable », pas « vrai/faux » brut).\nNon acquis : accepte une source sans vérifier quoi que ce soit.\nEn voie : relève 1 ou 2 éléments (ex. l’auteur) mais ne questionne pas.\nAcquis : identifie les 4 éléments et motive son jugement de fiabilité.\nDépassé : interroge aussi l’intention de la page : publicité, militantisme, \ndésinformation.\n3. Dispositif d’évaluation\nDiagnostique en début de séquence (que sait-il déjà faire ?) puis formative : la grille est distribuée \navant la tâche, l’élève s’évalue, l’enseignant régule. Pas de sommative ici : l’objectif est la stratégie,\npas la performance du jour.\n4. Justification de mes choix\nJ’ai retenu 3 critères qui correspondent chacun à un attendu différent, pour que la note porte sur \nl’apprentissage visé et pas sur la beauté de la fiche. Les indicateurs sont observables : on peut \npointer sur la feuille « ici tu as utilisé un opérateur », « ici tu as noté la date ».\n1 / 4\nNathalie Bats – Master S3 26/27\nLa progression des niveaux va de subir l’outil (taper au hasard) à piloter l’outil (adapter sa \nstratégie) : c’est exactement le chemin de l’autonomie visée par la compétence. La modalité \ndiagnostique plus formative se justifie parce que la compétence se construit sur la durée : la noter\nen sommative sanctionnerait un point de départ, pas une progression.\nCas 6 – Démontage et remontage d’un ordinateur – 2e \nsecondaire (S2)\n1. Apprentissages visés\nSavoir – (1re secondaire, acquis de départ, champ « Informations et données ») : « Utiliser, \nadéquatement et en contexte, le terme périphérique. »\nSavoir-faire – (2e secondaire, champ « Objets technologiques ») : « Démonter un objet \ntechnologique* (en tout ou en partie) incluant une ou plusieurs machine(s) simple(s) et un circuit \nélectrique simple, en ut",
    "submittedAt": "2026-09-26 14:00"
  },
  {
    "id": "sub-real-collard-alexiane-ex1-8",
    "userId": "user-1790086792053",
    "userName": "Alexiane Collard",
    "userEmail": "alexiane.collard@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Exercice 1.1A — Compétent, partiellement compétent ou \nincompétent ? \n \nProfil 1 – Sarah : l’experte en IA \n1. Que sait faire cette personne ? Elle sait utiliser l’outil correctement. \n \n2. Que ne sait-elle pas faire ou ne comprend-elle pas ? Elle ne sait pas vérifier les sources et ne fait pas \npreuve d’esprit critique.   \n \n3. Est-elle capable de s'adapter ? Non, pas vraiment. \n \n4. Est-elle autonome ? Je ne pense pas, parce qu’elle n’est pas capable de vérifier les informations données \npar l’IA. \n \n5. Est-elle capable de porter un regard critique ? Absolument pas.  \n \n6. Agit-elle de manière responsable ? Non, elle suppose que l’IA a toujours raison et que si l’IA se trompe, \nce n’est pas de sa faute.  \n \nConclusion :  \nSarah est partiellement compétente. Elle possède des compétences techniques concernant l’utilisation \nmais elle n’a pas de compétence réflexive. Elle ne porte pas de regard critique et ne vérifie pas les \ninformations.  \n \nProfil 2 – Thomas : le débrouillard  \n1. Que sait faire cette personne ? Il sait se débrouiller et s’adapte à tous les outils.  \n \n2. Que ne sait-elle pas faire ou ne comprend-elle pas ? Quand il ne maitrise pas un sujet, il sait s’adapter.  \n \n3. Est-elle capable de s'adapter ? Il s’adapte en regardant des tutoriels. \n \n4. Est-elle autonome ? Il est très autonome. Il est autodidacte.  \n \n5. Est-elle capable de porter un regard critique ? Oui \n \n6. Agit-elle de manière responsable ? Oui \n \nConclusion : Thomas est compétent. Il est capable de faire des recherches. Il est autonome et autodidacte.  \n \n \nProfil 3 – Lina : la spécialiste des réseaux sociaux \n1. Que sait faire cette personne ? Produire du contenu sur les réseaux sociaux et analyser les statistiques.  \n \n2. Que ne sait-elle pas faire ou ne comprend-elle pas ? Elle ne comprend pas l’importance du \nconsentement et les conséquences qui peuvent découler de ses publications. \n \n3. Est-elle capable de s'adapter ? Peu d’informations pour le savoir précisément mais elle sait utiliser \nplusieurs plateformes.  \n \n4. Est-elle autonome ? Elle semble autonome dans l’utilisation de plusieurs plateformes (publications et \nanalyse). \n \n5. Est-elle capable de porter un regard critique ? Non, elle ne prend pas de recul par rapport à la situation. \nElle pense être la meilleure de sa classe.  \n \n6. Agit-elle de manière responsable ? Elle n’est pas responsable. Elle ne demande pas le consentement \navant une publication.  \n \nConclusion : Elle est partiellement compétente. Elle ne connaît pas les bases et ne sait visiblement pas ce \nqu’est le consentement. Elle sait utiliser les réseaux sociaux mais elle ne connait pas les règles de RGPD. \nElle se dédouane de toute responsabilité.  \n \nProfil 4 – Hugo : le sceptique \n1. Que sait faire cette personne ? Il sait chercher l’origine de l’information, vérifier la date et consulter \nplusieurs sources. Il possède des bonnes capacités de recherche. \n \n2. Que ne sait-elle pas faire ou ne comprend-elle pas ? Il ne sait pas utiliser les réseaux sociaux ou des \nlogiciels.  \n \n3. Est-elle capable de s'adapter ? Oui, quand il ne comprend pas, il cherche une ressource lui permettant \nde progresser.  \n \n4. Est-elle autonome ? Oui \n \n5. Est-elle capable de porter un regard critique ? Oui, avant de partager une information, il vérifie \nl’information.  \n \n6. Agit-elle de manière responsable ? Oui, il évite de diffuser des informations qui pourraient être fausses. \n \nConclusion : Hugo est partiellement compétent. Il n’a pas une maitrise technique des outils informatique \nmais il fait preuve d’esprit critique.  Il est autonome et capable de vérifier les sources.  \n \n \n \nProfil 5 – Julie : l’experte des logiciels \n1. Que sait faire cette personne ? Elle a de bonnes compétences techniques.  \n \n2. Que ne sait-elle pas faire ou ne comprend-elle pas ? Elle ne sait pas s’adapter à de nouveaux outils.  \n \n3. Est-elle capable de s'adapter ? Sa capacité d’adaptation semble extrêmement limitée.  \n \n4. Est-elle autonome ? Oui, lorsqu’",
    "submittedAt": "2026-09-28 14:00"
  },
  {
    "id": "sub-real-di-mascia-emma-ex1-9",
    "userId": "user-1790343401573",
    "userName": "Emma DI MASCIA",
    "userEmail": "e2301886@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Exercice 1.1A — Compétent, partiellement compétent ou \nincompétent ? \nObjectif \nVous allez analyser différentes situations afin de réfléchir à ce que signifie réellement être \ncompétent numériquement. \nL'objectif n'est pas de déterminer qui maîtrise le plus d'outils, mais d'identifier les différentes \ndimensions qui permettent de caractériser une compétence numérique. \nConsigne \nEn groupe de 3 à 4 étudiants, prenez connaissance des profils distribués. \nPour chaque profil, vous devez attribuer une seule des trois catégories suivantes : \n🟢 COMPÉTENT \nLa personne dispose de ressources suffisantes pour agir de manière pertinente, autonome et \nresponsable dans les situations décrites. \n🟠 PARTIELLEMENT COMPÉTENT \nLa personne maîtrise certaines dimensions de la compétence numérique, mais présente des \nlimites importantes dans d'autres dimensions. \n🔴 INCOMPÉTENT \nLa personne ne dispose pas des ressources nécessaires pour agir de manière pertinente dans \nles situations décrites. \nAttention : « incompétent » ne signifie pas que la personne est incapable d'utiliser le numérique. \nElle peut posséder certaines habiletés techniques tout en étant insuffisamment compétente \ndans la situation considérée. \n \nPour chaque profil \nDiscutez collectivement des questions suivantes : \n1. Que sait faire cette personne ?​\nIdentifiez ses connaissances et ses savoir-faire. \n2. Que ne sait-elle pas faire ou ne comprend-elle pas ?​\nRepérez ses limites. \n3. Est-elle capable de s'adapter ?​\nQue fait-elle lorsqu'elle rencontre une situation nouvelle ou un problème ? \n4. Est-elle autonome ?​\nPeut-elle trouver seule une solution ou dépend-elle systématiquement d'une personne, d'un \ntutoriel ou d'une procédure ? \n5. Est-elle capable de porter un regard critique ?​\nVérifie-t-elle les informations ? Questionne-t-elle les outils et leurs résultats ? \n6. Agit-elle de manière responsable ?​\nPrend-elle en compte les questions de sécurité, de vie privée, de droit, d'éthique ou les \nconséquences de ses actions ? \n \nLes 10 profils \nProfil 1 — Sarah : l'experte en IA \nSarah utilise quotidiennement ChatGPT pour ses études. Elle sait rédiger des prompts précis, \ndemander différentes versions d'une réponse, résumer des textes et générer des idées. Elle \nobtient rapidement des productions qui lui semblent de bonne qualité. \nEn revanche, elle vérifie rarement les informations fournies par l'IA. Lorsqu'une réponse contient \nune référence ou une statistique, elle considère généralement qu'elle est correcte. Elle ne \ncherche pas systématiquement à identifier les sources originales. \nLorsqu'on lui signale qu'une réponse est fausse, elle répond : « Je ne pouvais pas le savoir, c'est \nl'IA qui a répondu. » \n🟠 PARTIELLEMENT COMPÉTENT \n1. Que sait faire cette personne ?​\nElle sait utiliser ChatGPT, rédiger des prompts précis, demander différentes versions d’une \nréponse, résumer des textes et générer des idées. \n2. Que ne sait-elle pas faire ou ne comprend-elle pas ?​\nElle ne vérifie pas les informations et pense que l’IA a toujours raison. \n3. Est-elle capable de s'adapter ?​\nNon car elle dit qu’elle ne pouvait pas savoir. \n4. Est-elle autonome ?​\nOui. \n5. Est-elle capable de porter un regard critique ?​\nNon. \n6. Agit-elle de manière responsable ?​\nOn ne sait pas. \n \nProfil 2 — Thomas : le débrouillard \nThomas ne connaît pas beaucoup de logiciels et n'a jamais utilisé Canva. Il n'est pas \nparticulièrement à l'aise lorsqu'il découvre une nouvelle interface. \nLorsqu'on lui demande de créer une infographie, il commence cependant par rechercher des \noutils permettant de réaliser cette tâche. Il compare plusieurs possibilités, consulte des tutoriels \net expérimente. \nAprès plusieurs essais, il parvient à produire une infographie adaptée au public auquel elle est \ndestinée. \nLorsqu'il rencontre une difficulté, il cherche généralement une solution avant de demander de \nl'aide. \n🔴 INCOMPÉTENT \n1. Que sait faire cette personne ?​\nIl fait plusieurs recherches avant de réaliser un projet. \n2. Qu",
    "submittedAt": "2026-09-27 14:00"
  },
  {
    "id": "sub-real-d-archambeau-florence-ex1-10",
    "userId": "user-1790086871341",
    "userName": "Florence D’Archambeau",
    "userEmail": "e2306390@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Exercice 1.1A — Compétent, partiellement compétent \nou incompétent ? \nObjectif \nVous allez analyser différentes situations afin de réfléchir à ce que signifie réellement être \ncompétent numériquement. \nL'objectif n'est pas de déterminer qui maîtrise le plus d'outils, mais d'identifier les différentes \ndimensions qui permettent de caractériser une compétence numérique. \nConsigne \nEn groupe de 3 à 4 étudiants, prenez connaissance des profils distribués. \nPour chaque profil, vous devez attribuer une seule des trois catégories suivantes : \n  COMPÉTENT \nLa personne dispose de ressources suffisantes pour agir de manière pertinente, autonome et \nresponsable dans les situations décrites. \n  PARTIELLEMENT COMPÉTENT \nLa personne maîtrise certaines dimensions de la compétence numérique, mais présente des \nlimites importantes dans d'autres dimensions. \n  INCOMPÉTENT \nLa personne ne dispose pas des ressources nécessaires pour agir de manière pertinente dans \nles situations décrites. \nAttention : « incompétent » ne signifie pas que la personne est incapable d'utiliser le \nnumérique. Elle peut posséder certaines habiletés techniques tout en étant insuffisamment \ncompétente dans la situation considérée. \n \nPour chaque profil \nDiscutez collectivement des questions suivantes : \n1. Que sait faire cette personne ? \nIdentifiez ses connaissances et ses savoir-faire. \n2. Que ne sait-elle pas faire ou ne comprend-elle pas ? \nRepérez ses limites. \n3. Est-elle capable de s'adapter ? \nQue fait-elle lorsqu'elle rencontre une situation nouvelle ou un problème ? \n4. Est-elle autonome ? \nPeut-elle trouver seule une solution ou dépend-elle systématiquement d'une personne, d'un \ntutoriel ou d'une procédure ? \n5. Est-elle capable de porter un regard critique ? \nVérifie-t-elle les informations ? Questionne-t-elle les outils et leurs résultats ? \n6. Agit-elle de manière responsable ? \nPrend-elle en compte les questions de sécurité, de vie privée, de droit, d'éthique ou les \nconséquences de ses actions ? \n \nLes 10 profils \nProfil 1 — Sarah : l'experte en IA \nSarah utilise quotidiennement ChatGPT pour ses études. Elle sait rédiger des prompts précis, \ndemander différentes versions d'une réponse, résumer des textes et générer des idées. Elle \nobtient rapidement des productions qui lui semblent de bonne qualité. \nEn revanche, elle vérifie rarement les informations fournies par l'IA. Lorsqu'une réponse \ncontient une référence ou une statistique, elle considère généralement qu'elle est correcte. Elle \nne cherche pas systématiquement à identifier les sources originales. \nLorsqu'on lui signale qu'une réponse est fausse, elle répond : « Je ne pouvais pas le savoir, c'est \nl'IA qui a répondu. » \nPartiellement compétente  \n- \nElle sait rédiger des prompts précis. \n- \nElle vérifie rarement les informations fournies. \n- \nElle ne recherche pas les sources originales. \n- \nElle manque donc d’esprit critique face aux réponses de l’IA. \n- \nElle ne prend pas suffisamment sa responsabilité d’utilisatrice, puisqu’elle \nrejette la faute sur l’IA lorsqu’une information est fausse. \n \n \nProfil 2 — Thomas : le débrouillard \nThomas ne connaît pas beaucoup de logiciels et n'a jamais utilisé Canva. Il n'est pas \nparticulièrement à l'aise lorsqu'il découvre une nouvelle interface. \nLorsqu'on lui demande de créer une infographie, il commence cependant par rechercher des \noutils permettant de réaliser cette tâche. Il compare plusieurs possibilités, consulte des tutoriels \net expérimente. \nAprès plusieurs essais, il parvient à produire une infographie adaptée au public auquel elle est \ndestinée. \nLorsqu'il rencontre une difficulté, il cherche généralement une solution avant de demander de \nl'aide. \nCOMPÉTENT \n- \nPas à l’aise avec les nouvelles interfaces \n- \nIl s’informe sur les outils, il compare plusieurs outils avant de choisir  \n- \nFait preuve d’autonomie face aux difficultés \n \nProfil 3 — Lina : la spécialiste des réseaux sociaux \nLina maîtrise parfaitement Instagram, TikTok et Snapchat. ",
    "submittedAt": "2026-09-24 14:00"
  },
  {
    "id": "sub-real-foguenne-jerome-ex1-11",
    "userId": "user-1789634810517",
    "userName": "jerome Foguenne",
    "userEmail": "jerome.foguenne@hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Histoire Dangers et enjeux sociétaux Les LLM :  Chatgpt  (+  canvas ), Claude,  Perplexity ,  Copilot , bard, Gemini Notebook LM Les éditeurs d’images Les éditeurs de son",
    "submittedAt": "2026-09-25 14:00"
  },
  {
    "id": "sub-real-foguenne-jerome-ex1-12",
    "userId": "user-1789634810517",
    "userName": "jerome Foguenne",
    "userEmail": "jerome.foguenne@hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Notebook LM Fonctionnalités : Intégrer des  pdf ,  powerpoint , du texte copié et même des vidéos ou images , des pages web . L’application vous permet d’interagir en circonscrivant son champ de recherche à ces ressources. Possibilité de créer des quizz : « Guide d’étude » Possibilité de combiner avec  Perplexity ,  Chatgpt  ou autre (avec le texte collé) Possibilité de créer un podcast (avec  elevenlabs ) Possibilité de conserver et partager ses notes Possibilité de Timeline : création d’une ligne du temps Possibilité d’écrire des notes personnelles (par exemple de réunion) et pouvoir ensuite les réexploiter dans notebook (super intéressant pour un étudiant au cours) Possibilité de combiner les notes pour en réaliser une méga synthèse Possibilité de sélectionner les sources Possibilité de  partager jusqu’à 50 sources (chaque source peut faire 500000 mots). Exercice : réaliser l’histoire d’un homme célèbre Prompt français :  This  episode   will   only   be  in French. All discussions, interviews, and  commentary  must  be   conducted  in French for the  entire  duration of the  episode . No English or  other   languages   should   be   used  in the conversation,  except   when   absolutely   necessary  to  clarify  a  term  or concept unique to a  specific   language . Future translation  into  English  is   planned , but for  now , the  episode   is  French-exclusive C et épisode sera uniquement en français. Toutes les discussions, interviews et commentaires devront se dérouler en français pendant toute la durée de l'épisode. Aucune autre langue, y compris l'anglais, ne doit être utilisée dans la conversation, sauf en cas de nécessité absolue pour clarifier un terme ou un concept propre à une langue spécifique. Une traduction en anglais est prévue pour plus tard, mais pour l'instant, l'épisode est exclusivement en français.",
    "submittedAt": "2026-09-25 14:00"
  },
  {
    "id": "sub-real-foguenne-jerome-ex1-13",
    "userId": "user-1789634810517",
    "userName": "jerome Foguenne",
    "userEmail": "jerome.foguenne@hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Prompter  une musique Pour générer des chansons de haute qualité avec l'IA musicale Gemini (Lyria), il est recommandé de structurer son prompt autour de 5 piliers fondamentaux, qui constituent la « formule secrète » de Google. Voici le détail de ces cinq parties : 1. Le genre musical  Il faut définir le type de chanson souhaité (pop, rap, musique classique, musique de pub, etc.). Vous pouvez préciser un sous-genre, cibler une époque (comme les années 80), ou même fusionner plusieurs styles pour créer un nouveau genre.  Astuce importante :  Pour contourner les limites liées aux droits d'auteur, il ne faut jamais nommer directement un artiste célèbre (comme Ed Sheeran ou Taylor Swift) ; décrivez plutôt ses caractéristiques vocales ou son succès (par exemple : « chanteuse pop américaine qui truste les charts »). 2. Le tempo et l'ambiance  Ce pilier sert à définir l'énergie et l'émotion que vous souhaitez transmettre à vos auditeurs. Vous devez décrire le rythme (BPM rapide ou lent) et l'atmosphère globale du morceau, qu'il s'agisse d'euphorie, de mélancolie, ou d'une ambiance plus sombre et mystérieuse. 3. Les instruments  Il est conseillé d'indiquer les instruments désirés pour votre morceau, mais  en vous limitant strictement à deux ou  trois instruments maximum . Si vous mentionnez trop d'instruments dans votre prompt, l'intelligence artificielle risque de s'y perdre, ce qui réduira sa créativité. 4. La voix  Vous devez spécifier les caractéristiques de l'interprète. Cela inclut le genre (voix d'homme ou de femme), l'attitude et l'émotion (voix posée, rassurante, émotive, en train de crier), des spécificités de timbre (voix rauque ou de fumeur), ainsi que la tessiture (comme soprano ou baryton). 5. Les paroles  Ce dernier pilier est dédié au  storytelling . Bien qu'il soit possible de laisser Lyria générer les paroles en même temps que la musique, cela lui demande beaucoup d'efforts et a tendance à produire des morceaux plus courts et moins aboutis. L'idéal est donc de  fournir vos propres paroles  (que vous pouvez préalablement générer avec une IA textuelle comme Gemini) directement dans le prompt. Une fois ces cinq éléments définis, la bonne pratique consiste à les assembler et à  rédiger votre prompt sous la forme d'un paragraphe complet  pour éviter d'obtenir une musique avec une orchestration plate et sans personnalité.",
    "submittedAt": "2026-09-26 14:00"
  },
  {
    "id": "sub-real-jamar-michael-ex1-14",
    "userId": "user-1790087241045",
    "userName": "Michael Jamar",
    "userEmail": "e2303712@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Exercice 1 Diagnostic de compétences numériques (DigComp 2.2) Cas 1 Sara : Bonne maitrise de l’IA :  Elle sait bien utiliser  ChatGPT , faire de bons prompts, demander plusieurs versions, résumer et trouver des idées. Esprit critique faible : Elle croit trop facilement ce que lui répond l’IA. Elle vérifie peu les informations et les sources. Responsabilité faible :  Quand l’IA se trompe, elle considère que ce n’est pas vraiment sa faute puisque c’est l’IA qui a donné la réponse. Sarah est partiellement compétente. Elle sait bien utiliser l’IA, mais pas assez vérifier ce qu’elle lui donne. Elle maitrise donc bien l’outil, mais manque d’esprit critique et de responsabilité. Cas 2 : Thomas Maitrise / limites : Thomas ne connait pas beaucoup de logiciels et n’est pas particulièrement à l’aise lorsqu’il en découvre un nouveau. Adaptabilité : Quand il doit faire une infographie, il cherche plusieurs outils, compare ce qui existe, consulte des tutoriels et teste jusqu’à arriver à quelque chose qui convient. Autonomie : Quand il rencontre un problème, il cherche d’abord une solution par lui-même avant de demander de l’aide. Thomas est compétent en numérique. Il ne maitrise pas énormément d’outils, mais il sait chercher, comparer, tester et apprendre seul. Ses limites techniques ne l’empêchent donc pas d’être autonome et de s’adapter. Cas 3 : Lina Maitrise : Lina maitrise très bien plusieurs réseaux sociaux. Elle sait créer des vidéos, utiliser les tendances, analyser les statistiques de ses publications et connait bien leurs différentes fonctionnalités. Responsabilité / esprit critique : Lina ne réfléchit pas assez au consentement ni aux conséquences de ce qu’elle publie. Elle partage des photos et vidéos de ses amis sans vraiment se demander s’ils sont d’accord, ni ce que ces contenus peuvent devenir une fois diffusés. Lina est partiellement compétente en numérique. Elle maitrise très bien les réseaux sociaux, mais elle agit de manière peu responsable et ne prend pas assez de recul sur les conséquences de ses publications. Cas 4 : Hugo Maitrise / limites : Hugo maitrise peu les réseaux sociaux et certains outils numériques. Il ne sait pas non plus réaliser de montages vidéo complexes. Esprit critique : Hugo possède un très bon esprit critique. Lorsqu’il reçoit une information étonnante, il cherche son origine, vérifie la date, consulte plusieurs sources et essaie d’identifier l’auteur. Adaptabilité : Lorsqu’il ne comprend pas quelque chose, il cherche une ressource lui permettant de progresser. Autonomie : Il cherche généralement cette ressource par lui-même et essaie donc de résoudre ses difficultés sans dépendre directement de quelqu’un. Hugo est compétent en numérique. Même s’il ne maitrise pas beaucoup d’outils, il sait vérifier les informations, chercher des solutions et progresser par lui-même. Cas 5 : Julie Julie maitrise très bien plusieurs logiciels de la suite Office ainsi que plusieurs logiciels professionnels. Elle connait aussi des fonctions avancées et peut aider les autres lorsqu’ils rencontrent un problème. Adaptabilité : Julie est réfractaire au changement et refuse presque systématiquement les nouveaux outils. Autonomie : Lorsqu’elle doit apprendre un nouvel outil, elle préfère attendre une formation ou des explications précises plutôt que d’expérimenter par elle-même. Julie est partiellement compétente en numérique. Elle possède une très bonne maitrise technique des outils qu’elle connait, mais elle manque d’adaptabilité et d’autonomie lorsqu’elle doit découvrir quelque chose de nouveau. Cas 6 : Mehdi Mehdi maitrise efficacement les moteurs de recherche et sait formuler une recherche lui permettant de trouver rapidement une réponse. Autonomie : Il est capable de chercher seul une réponse sur Internet et ne dépend pas forcément de quelqu’un pour trouver une information. Esprit critique : Son esprit critique est cependant très limité. Il consulte surtout les premiers résultats, vérifie rarement l’auteur ou la source ",
    "submittedAt": "2026-09-27 14:00"
  },
  {
    "id": "sub-real-jamar-michael-ex1-15",
    "userId": "user-1790087241045",
    "userName": "Michael Jamar",
    "userEmail": "e2303712@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Exercice 1 Diagnostic de compétences numériques (DigComp 2.2) Cas 1 Sara : Bonne maitrise de l’IA :  Elle sait bien utiliser  ChatGPT , faire de bons prompts, demander plusieurs versions, résumer et trouver des idées. Esprit critique faible : Elle croit trop facilement ce que lui répond l’IA. Elle vérifie peu les informations et les sources. Responsabilité faible :  Quand l’IA se trompe, elle considère que ce n’est pas vraiment sa faute puisque c’est l’IA qui a donné la réponse. Sarah est partiellement compétente. Elle possède de bonnes habiletés opératoires avec  ChatGPT  et sait bien utiliser l’outil. Par contre, son manque d’esprit critique et de responsabilité fait que cette maîtrise technique ne suffit pas à parler d’une compétence numérique complète. Cas 2 : Thomas Maitrise / limites : Thomas ne connait pas beaucoup de logiciels et n’est pas particulièrement à l’aise lorsqu’il en découvre un nouveau. Adaptabilité : Quand il doit faire une infographie, il cherche plusieurs outils, compare ce qui existe, consulte des tutoriels et teste jusqu’à arriver à quelque chose qui convient. Autonomie : Quand il rencontre un problème, il cherche d’abord une solution par lui-même avant de demander de l’aide. Thomas est compétent en numérique. Même s’il ne maitrise pas énormément d’outils, il sait mobiliser les ressources dont il dispose pour s’adapter à une situation nouvelle et trouver une solution par lui-même. Cas 3 : Lina Maitrise : Lina maitrise très bien plusieurs réseaux sociaux. Elle sait créer des vidéos, utiliser les tendances, analyser les statistiques de ses publications et connait bien leurs différentes fonctionnalités. Responsabilité / esprit critique : Lina ne réfléchit pas assez au consentement ni aux conséquences de ce qu’elle publie. Elle partage des photos et vidéos de ses amis sans vraiment se demander s’ils sont d’accord, ni ce que ces contenus peuvent devenir une fois diffusés. Lina est partiellement compétente en numérique. Elle possède de bonnes habiletés techniques sur les réseaux sociaux, mais cela ne suffit pas à faire d’elle quelqu’un de pleinement compétent puisqu’elle prend trop peu en compte le consentement et les conséquences de ses publications. Cas 4 : Hugo Maitrise / limites : Hugo maitrise peu les réseaux sociaux et certains outils numériques. Il ne sait pas non plus réaliser de montages vidéo complexes. Esprit critique : Hugo possède un très bon esprit critique. Lorsqu’il reçoit une information étonnante, il cherche son origine, vérifie la date, consulte plusieurs sources et essaie d’identifier l’auteur. Adaptabilité : Lorsqu’il ne comprend pas quelque chose, il cherche une ressource lui permettant de progresser. Autonomie : Il cherche généralement cette ressource par lui-même et essaie donc de résoudre ses difficultés sans dépendre directement de quelqu’un. Hugo est compétent en numérique. Même s’il possède certaines limites techniques, il sait mobiliser ses connaissances et son esprit critique de manière pertinente lorsqu’il est confronté à une information ou à une difficulté. Cas 5 : Julie Julie maitrise très bien plusieurs logiciels de la suite Office ainsi que plusieurs logiciels professionnels. Elle connait aussi des fonctions avancées et peut aider les autres lorsqu’ils rencontrent un problème. Adaptabilité : Julie est réfractaire au changement et refuse presque systématiquement les nouveaux outils. Autonomie : Lorsqu’elle doit apprendre un nouvel outil, elle préfère attendre une formation ou des explications précises plutôt que d’expérimenter par elle-même. Julie est partiellement compétente en numérique. Elle possède de très bonnes habiletés opératoires sur les outils qu’elle connait. Par contre, elle a du mal à les mobiliser dès qu’elle est confrontée à un nouvel outil, ce qui limite son adaptabilité et son autonomie. Cas 6 : Mehdi Mehdi maitrise efficacement les moteurs de recherche et sait formuler une recherche lui permettant de trouver rapidement une réponse. Autonomie : Il est capabl",
    "submittedAt": "2026-09-27 14:00"
  },
  {
    "id": "sub-real-jamar-michael-ex1-16",
    "userId": "user-1790087241045",
    "userName": "Michael Jamar",
    "userEmail": "e2303712@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Exercice 1 Diagnostic de compétences numériques (DigComp 2.2) \nCas 1 Sara : \nBonne maitrise de l’IA :  \nElle sait bien utiliser ChatGPT, faire de bons prompts, demander plusieurs versions, résumer \net trouver des idées. \nEsprit critique faible : \nElle croit trop facilement ce que lui répond l’IA. Elle vérifie peu les informations et les \nsources. \nResponsabilité faible :  \nQuand l’IA se trompe, elle considère que ce n’est pas vraiment sa faute puisque c’est l’IA qui \na donné la réponse. \nSarah est partiellement compétente. \nElle sait bien utiliser l’IA, mais pas assez vérifier ce qu’elle lui donne. Elle maitrise donc bien \nl’outil, mais manque d’esprit critique et de responsabilité. \n \nCas 2 : Thomas \nMaitrise / limites : \nThomas ne connait pas beaucoup de logiciels et n’est pas particulièrement à l’aise lorsqu’il \nen découvre un nouveau. \nAdaptabilité : \nQuand il doit faire une infographie, il cherche plusieurs outils, compare ce qui existe, \nconsulte des tutoriels et teste jusqu’à arriver à quelque chose qui convient. \nAutonomie : \nQuand il rencontre un problème, il cherche d’abord une solution par lui-même avant de \ndemander de l’aide. \nThomas est compétent en numérique. \nIl ne maitrise pas énormément d’outils, mais il sait chercher, comparer, tester et apprendre \nseul. Ses limites techniques ne l’empêchent donc pas d’être autonome et de s’adapter. \n \nCas 3 : Lina \nMaitrise : \nLina maitrise très bien plusieurs réseaux sociaux. Elle sait créer des vidéos, utiliser les \ntendances, analyser les statistiques de ses publications et connait bien leurs différentes \nfonctionnalités. \nResponsabilité / esprit critique : \nLina ne réfléchit pas assez au consentement ni aux conséquences de ce qu’elle publie. Elle \npartage des photos et vidéos de ses amis sans vraiment se demander s’ils sont d’accord, ni \nce que ces contenus peuvent devenir une fois diffusés. \nLina est partiellement compétente en numérique. \nElle maitrise très bien les réseaux sociaux, mais elle agit de manière peu responsable et ne \nprend pas assez de recul sur les conséquences de ses publications. \n \nCas 4 : Hugo \nMaitrise / limites : \nHugo maitrise peu les réseaux sociaux et certains outils numériques. Il ne sait pas non plus \nréaliser de montages vidéo complexes. \nEsprit critique : \nHugo possède un très bon esprit critique. Lorsqu’il reçoit une information étonnante, il \ncherche son origine, vérifie la date, consulte plusieurs sources et essaie d’identifier l’auteur. \nAdaptabilité : \nLorsqu’il ne comprend pas quelque chose, il cherche une ressource lui permettant de \nprogresser. \nAutonomie : \nIl cherche généralement cette ressource par lui-même et essaie donc de résoudre ses \ndifficultés sans dépendre directement de quelqu’un. \nHugo est compétent en numérique. \nMême s’il ne maitrise pas beaucoup d’outils, il sait vérifier les informations, chercher des \nsolutions et progresser par lui-même. \n \nCas 5 : Julie \nJulie maitrise très bien plusieurs logiciels de la suite Office ainsi que plusieurs logiciels \nprofessionnels. Elle connait aussi des fonctions avancées et peut aider les autres lorsqu’ils \nrencontrent un problème. \nAdaptabilité : \nJulie est réfractaire au changement et refuse presque systématiquement les nouveaux outils. \nAutonomie : \nLorsqu’elle doit apprendre un nouvel outil, elle préfère attendre une formation ou des \nexplications précises plutôt que d’expérimenter par elle-même. \nJulie est partiellement compétente en numérique. \nElle possède une très bonne maitrise technique des outils qu’elle connait, mais elle manque \nd’adaptabilité et d’autonomie lorsqu’elle doit découvrir quelque chose de nouveau. \n \nCas 6 : Mehdi \nMehdi maitrise efficacement les moteurs de recherche et sait formuler une recherche lui \npermettant de trouver rapidement une réponse. \nAutonomie : \nIl est capable de chercher seul une réponse sur Internet et ne dépend pas forcément de \nquelqu’un pour trouver une information. \nEsprit critique : \nSon esprit critique est cependant très limité. I",
    "submittedAt": "2026-09-27 14:00"
  },
  {
    "id": "sub-real-mokeddem-laura-ex1-17",
    "userId": "user-1790086729864",
    "userName": "Laura Mokeddem",
    "userEmail": "laura.mokeddem@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Numérique et didactique - Exercice 1  \n \nProfil 1 – Sarah : partiellement compétente \nElle est capable d’utiliser ChatGPT et lui donne des prompts assez précis que pour \nobtenir ce qu’elle souhaite. MAIS, elle ne vérifie pas ses sources après, elle estime que \nsi l’IA lui a donné une réponse, elle est forcément correcte.  \nProfil 2 – Thomas : compétent \nIl ne connait pas tout, mais est capable de se débrouiller face à une difficulté. Il \ns’adapte, effectue des recherches si nécessaire. Il est autonome dans ses recherches \net cherche d’abord un tutoriel plutôt que de demander directement à quelqu'un.  \nProfil 3 – Lina : partiellement compétente  \nElle connait les réseaux sociaux et sait les utiliser. Elle sait faire des montages vidéoS \net connait les tendances. Par contre, elle ignore complétement les règles RGPD sur les \ndroits à l’image \nProfil 4 – Hugo : compétent \nIl ne maîtrise pas tous les codes des réseaux sociaux, il ne sait pas farie de montage \nvidéo. Par contre, il vérifie les informations qu’il retrouve sur internet. Il vérifie ses \nsources et croisent les informations pour savoir si c’est vrai. Il fait des recherches \nquand il a besoin de comprendre ou de progresser sur quelque chose. \nProfil 5 – Julie : partiellement compétente  \nElle maîtrise les logiciels dont elle a besoin dans son travail et peut facilement aider les \nautres et leur expliquer s’ils ont besoin. Par contre, elle n’est pas autonome dans ses \napprentissages. Pour un nouveau logiciel, il faut qu’on lui explique tout avant qu’elle \ncommence à l’utiliser.  \nProfil 6 – Mehdi : incompétent \nIl fait une confiance aveugle à internet. Il ne remet jamais en question les informations \nqu’il y trouve et ne vérifie pas les sources.  \nProfil 7 – Emma : partiellement compétente  \nElle connait les règles de sécurités et de confidentialité. Elle est prudente avant de \ntransmettre des données qu’elle ne voudrait pas. Elle dit quand elle ne sait pas plutôt \nque de prétendre savoir tout faire.  \nProfil 8 – Lucas : partiellement compétent \nIl se débrouille très bien en informatique. Il sait installer des logiciels et résoudre \nbeaucoup de problèmes techniques. Cependant, il se fout complètement des règles \nRGPD et estime que tout cela est secondaire. Le fonctionnel est plus important à ses \nyeux \nProfil 9 - Chloé : Compétente  \nElle sait utiliser les IA comme outils pour des recherches. Mais cela ne reste que des \noutils. Elle vérifie ses informations en les croisant et en vérifiant les sources. Elle \nmaîtrise assez bien le sujet que pour pouvoir expliquer aux autres ses avantages et ses \nlimites.  \nProfil 10 - Nathan : incompétent \nIl ne maîtrise pas les applications ou logiciel. Il est simplement capable de reproduire \nexactement ce qu’on lui montre. Si un détail change, il est perdu et ne sait plus rien \nfaire. Il ne cherchera pas une solution par lui-même, il faut obligatoirement que \nquelqu’un lui montre à nouveau.  \n \n \n",
    "submittedAt": "2026-09-25 14:00"
  },
  {
    "id": "sub-real-rodes-mathis-ex1-18",
    "userId": "user-1790343751310",
    "userName": "Mathis Rodès",
    "userEmail": "mathis.rodes@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Profil 1 — Sarah : l'experte en IA Sarah utilise quotidiennement  ChatGPT  pour ses études. Elle sait rédiger des prompts précis, demander différentes versions d'une réponse, résumer des textes et générer des idées. Elle obtient rapidement des productions qui lui semblent de bonne qualité. En revanche, elle vérifie rarement les informations fournies par l'IA. Lorsqu'une réponse contient une référence ou une statistique, elle considère généralement qu'elle est correcte. Elle ne cherche pas systématiquement à identifier les sources originales. Lorsqu'on lui signale qu'une réponse est fausse, elle répond : « Je ne pouvais pas le savoir, c'est l'IA qui a répondu. »  Partiellement compétent  Profil 2 — Thomas : le débrouillard Thomas ne connaît pas beaucoup de logiciels et n'a jamais utilisé  Canva . Il n'est pas particulièrement à l'aise lorsqu'il découvre une nouvelle interface. Lorsqu'on lui demande de créer une infographie, il commence cependant par rechercher des outils permettant de réaliser cette tâche. Il compare plusieurs possibilités, consulte des tutoriels et expérimente. Après plusieurs essais, il parvient à produire une infographie adaptée au public auquel elle est destinée. Lorsqu'il rencontre une difficulté, il cherche généralement une solution avant de demander de l'aide.  Compétent  Profil 3 — Lina : la spécialiste des réseaux sociaux Lina maîtrise parfaitement Instagram,  TikTok  et Snapchat. Elle connaît les différentes fonctionnalités, sait créer des vidéos, utiliser les tendances et analyser les statistiques de ses publications. Elle publie régulièrement des photographies et vidéos de ses amis. Elle considère que les contenus présents sur son smartphone peuvent être publiés librement. Elle ne s'interroge pas particulièrement sur le consentement des personnes photographiées, la conservation des contenus ou les conséquences de leur diffusion. Elle affirme : « Je suis probablement la personne la plus compétente en numérique de ma classe. »  Partiellement compétent Profil 4 — Hugo : le sceptique Hugo utilise peu les réseaux sociaux et ne connaît pas la plupart des applications utilisées par ses camarades. Il éprouve parfois des difficultés avec certains logiciels et ne sait pas réaliser des montages vidéo complexes. Lorsqu'il reçoit une information étonnante sur Internet, il ne la partage cependant jamais immédiatement. Il cherche l'origine de l'information, vérifie la date, consulte plusieurs sources et tente d'identifier l'auteur. Lorsqu'il ne comprend pas quelque chose, il cherche généralement une ressource lui permettant de progresser.  Compétent  Profil 5 — Julie : l'experte des logiciels Julie maîtrise très bien Word, Excel, PowerPoint et plusieurs logiciels professionnels. Elle connaît de nombreuses fonctions avancées et ses camarades font régulièrement appel à elle lorsqu'ils rencontrent un problème. Elle refuse cependant presque systématiquement d'utiliser de nouveaux outils. Lorsqu'un logiciel est remplacé dans son établissement, elle demande qu'on lui explique précisément chaque étape et préfère attendre une formation plutôt que d'expérimenter seule. Elle considère que sa compétence numérique repose principalement sur le nombre de logiciels qu'elle maîtrise.  Partiellement compétent  Profil 6 — Mehdi : le chercheur rapide Mehdi sait utiliser efficacement les moteurs de recherche. Lorsqu'un professeur lui donne une question, il trouve rapidement une réponse sur Internet. Pour gagner du temps, il consulte généralement les premiers résultats proposés par le moteur de recherche. Il regarde rarement qui a publié l'information et ne vérifie pas systématiquement les sources. Lorsque plusieurs sites donnent la même information, il considère qu'elle est nécessairement vraie. Il explique : « Je trouve toujours ce que je cherche sur Internet. »  Partiellement compétent  Profil 7 — Emma : la prudente Emma ne maîtrise pas particulièrement les fonctions avancées des logiciels bureautiques. Elle demande régulièrement d",
    "submittedAt": "2026-09-25 14:00"
  },
  {
    "id": "sub-real-sarlet-amelie-ex1-19",
    "userId": "user-1790345777275",
    "userName": "Amélie Sarlet",
    "userEmail": "e2301877",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Profil 1 — Sarah : l'experte en IA \nStatut :  PARTIELLEMENT COMPÉTENT \n1. Savoirs & Savoir-faire : Rédiger des prompts complexes, structurer ses requêtes, résumer \ndes textes, générer des idées. \n2. Limites : Absences de vérification des sources, de recoupement des faits et de prise en \ncompte des biais/hallucinations de l'IA. \n3. Adaptabilité : Moyenne. Elle sait faire varier ses demandes à l'outil, mais ne sait pas réagir \nface à une erreur de l'IA. \n4. Autonomie : Dépendante du résultat brut fourni par l'outil. \n5. Esprit critique : Très faible. Elle fait une confiance aveugle à la machine. \n6. Responsabilité : Faible. Elle refuse d'assumer la responsabilité des productions qu'elle \nsigne (« C'est l'IA qui a répondu »). \n \nProfil 2 — Thomas : le débrouillard \nStatut :  COMPÉTENT \n1. Savoirs & Savoir-faire : Rechercher des outils adaptés, auto-apprentissage via des \ntutoriels, créer une infographie ciblée. \n2. Limites : Manque d'aisance initiale sur les nouvelles interfaces. \n3. Adaptabilité : Forte. Il expérimente, tâtonne et ajuste sa démarche selon le besoin du public \ncible. \n4. Autonomie : Élevée. Il cherche des solutions par lui-même avant de faire appel à une tierce \npersonne. \n5. Esprit critique : Bon. Il sait comparer différentes offres logicielles pour choisir la plus \npertinente. \n6. Responsabilité : Élevée. Il veille à adapter sa production aux besoins et à la sensibilité de \nson destinataire. \n \n \n \n \n \n \n \nProfil 3 — Lina : la spécialiste des réseaux sociaux \nStatut :  INCOMPÉTENT (dans la situation globale) \n1. Savoirs & Savoir-faire : Maîtrise ergonomique d'Instagram, TikTok, Snapchat, \ncréation/montage vidéo, analyse d'audience. \n2. Limites : Méconnaissance totale du droit de l'information, de la protection de la vie privée et \ndu droit à l'image. \n3. Adaptabilité : Limitée aux environnements qu'elle pratique déjà au quotidien. \n4. Autonomie : Autonome sur le plan technique, mais aveugle aux enjeux juridiques et \néthiques. \n5. Esprit critique : Inexistant sur le fonctionnement des plateformes et la portée des données \nqu'elle diffuse. \n6. Responsabilité : Absente. Violation potentielle du consentement et de la vie privée d'autrui. \n \nProfil 4 — Hugo : le sceptique \nStatut :  COMPÉTENT \n1. Savoirs & Savoir-faire : Évaluation des sources, vérification des informations, recherche \ndocumentaire méthodique. \n2. Limites : Faibles compétences dans la création de contenus complexes (montage vidéo, \nlogiciels avancés). \n3. Adaptabilité : Bonne. Il cherche des ressources de formation lorsqu'il fait face à une lacune. \n4. Autonomie : Élevée dans la recherche de solutions d'apprentissage et dans l'auto-\névaluation. \n5. Esprit critique : Excellent. Il applique une démarche méthodique (auteur, date, \nrecoupement) avant de partager. \n6. Responsabilité : Élevée. Il évite la propagation de fausses informations (infodémie). \n \n \n \n \n \n \n \n \nProfil 5 — Julie : l'experte des logiciels \nStatut :  PARTIELLEMENT COMPÉTENT \n1. Savoirs & Savoir-faire : Maîtrise experte d'outils bureautiques traditionnels (Word, Excel, \nPowerPoint) et aide ponctuelle à autrui. \n2. Limites : Incapacité à transférer ses connaissances d'une interface à une autre. \n3. Adaptabilité : Quasi nulle. Elle refuse d'explorer de nouveaux environnements. \n4. Autonomie : Très faible face à la nouveauté. Elle exige une procédure guidée ou une \nformation préalable. \n5. Esprit critique : Faible sur son propre fonctionnement. Elle confond compétence \nnumérique et accumulation de recettes logicielles. \n6. Responsabilité : Neutre sur le plan éthique, mais frein au développement numérique \ncollectif dans son organisation. \n \nProfil 6 — Mehdi : le chercheur rapide \nStatut :  PARTIELLEMENT COMPÉTENT \n1. Savoirs & Savoir-faire : Utilisation efficace des requêtes sur les moteurs de recherche, \nrapidité d'exécution. \n2. Limites : Évaluation superficielle de la qualité de l'information, biais de confirmation. \n3. Adaptabilité : Élevée pour trouver du contenu rapidement, faible",
    "submittedAt": "2026-09-26 14:00"
  },
  {
    "id": "sub-real-siragusa-sabrina-ex1-20",
    "userId": "user-1790189590610",
    "userName": "Sabrina Siragusa",
    "userEmail": "sabrina.siragusa@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Exercice 1.1A\nSIRAGUSA Sabrina\nVALENZANO Jonathan\n1\n2\n3\n4\n5\n6\nConnaissances et SF\nLimites\nAdaptation\nAutonomie\nRegard critique\nResponsabilité\nConclusion\nSarah\nRégider des prompts précis pour une IA \ngénérative.\nReformulation d'une réponse donnée par l'IA.\nDemander des résumés des textes et générer des \nidées.\nElle ne comprend pas que l'IA peut se tromper.\n/\n/\nElle ne vérifie pas les informations \n(référence, statistique).\nElle ne cherche pas à identifier les sources \noriginales.\nRemet la faute sur l'IA en cas \nd'erreur.\nThomas\nIl sait rechercher un outil qui pourra l'aider à \nréaliser son travail.\nIl sait comparer les différentes options, \nexpérimenter un logiciel.\nIl ne connait pas beaucoup de logiciels (Ex. \nCanva).\nIl n'est pas à l'aise avec une interface \ninconnue.\nIl expérimente, il recherche \nune solution avant de \ndemander de l'aide.\nTrès bonne.\nIl a un regard critique sur l'utilisation (en \nconsulte plusieurs et expérimente).\n/\nLina\nMaitrise des réseaux sociaux.\nCréation de vidéos.\nUtilisation des tendances.\nAnalyse \"statistique\" de ses publications.\n/\nAdaptation uniquement dans \nson domaine (réseaux \nsociaux).\n/\n/\nProblèmes de la protection de la \nvie privée (publication libre sans \nconsulter les individus \nconcernés).\nProblèmes de conservation des \ncontenus et de leur diffusion.\nHugo\nRéalisation de montage de vidéos simples.\nMaitrise certains logiciels.\nRecherche d'informations sur internet.\nPeu d'utilisation des réseaux sociaux.\nManque de connaissance dans certaines \napplications et logiciels.\nNe sait pas réaliser un montage vidéo \ncomplexe.\nIl recherche une ressource lui \npermettant de progresser.\nDépend d'une ressource.\nIl recherche la véracité d'une information \nétonnante (origine, date, auteurs).\nIl ne partage pas jamais \nimmédiatement l'information \nétonnante avant de vérifier sa \nvéracité.\nJulie\nLa suite Office et autres logiciels professionnels \n(niveau avancé).\nPartager ses connaissances d'un logiciel.\nNe veut pas expérimenter seule un nouveau \nlogiciel.\nElle attend une formation ou \nune explicaion précise de \nchaque étape.\nDépend de formations ou de \npersonnes référentes.\n/\n/\nMehdi\nUtilisation efficace des moteurs de recherche.\n/\nRecherche l'information sur \ninternet.\nDépend d'une recherche internet.\nNe vérifie pas les sources.\nRegarde les sources dans l'ordre \nd'apparition sans regarder si la source \nqualitative.\nNaïvité numérique (une réponse qui \napparait plusieurs n'est pas forcément la \nbonne).\n/\nEmma\nMaitrise les fonctions de base des logiciels de \nbureautique.\nMaitrise un gestionnaire de mot de passe.\nMaitrise la double identification.\nVérifier les paramètres de confidentialité de ses \ncomptes.\nRecherche une solution.\nNe maitrise pas les fonctions avancées des \nlogiciels de bureautique.\nRecherche une solution ou \ndemande de l'aide.\nPeut rechercher une solution par \nelle-même mais peut demander de \nl'aide à une personne référente \n(difficulté technique ou quand elle \nne trouve pas la solution).\nSe questionne sur la confidentialité des \ninformations sur ses comptes.\nVérifie ce qu'elle transmet à une \napplication (données \npersonnelles).\nFais attention à ce qu'elle publie.\nDouble identification.\nConfidentialité des comptes.\nLucas\nInstallation de logiciels.\nConfiguration d'un ordinateur.\nRésolution de problèmes techniques et \ncompréhension des caractéristiques du matériel.\n/\nParvient à solutionner le \nproblème par lui-même.\nIl est automone.\nRegard critique secondaire (biais des \ninformations, algorithmes…).\nSe base uniquement sur le \nfonctionnement.\nNon, la confidentialité, l'éthique \net les données personnelles sont \nsecondaires.\nChloé\nUtiliser l'IA afin de générer des idées, reformuler \ndes passages ou explorer ≠ pistes.\nVérifier les informations importantes.\nConsulter les sources originales.\nModifier les productions obtenues.\nExpliquer ce que l'outil peut faire, ses limites et \nquand il ne faut pas l'utiliser.\n/\nUtilise l'IA.\nAutonomie liée à l'utilisation de \nl'IA.\nTrès bon, elle ne considère pas qu'",
    "submittedAt": "2026-09-23 14:00"
  },
  {
    "id": "sub-real-siragusa-sabrina-ex2-21",
    "userId": "user-1790189590610",
    "userName": "Sabrina Siragusa",
    "userEmail": "sabrina.siragusa@student.hech.be",
    "exerciseId": "exercice-02",
    "exerciseTitle": "Atelier 2 : Évaluation critique d'une information",
    "answer": "Exercice 02 — Peut-on faire confiance à cette information ? \nVotre mission \nVous découvrez sur Internet l'affirmation suivante : \n« Une étude scientifique vient de prouver que regarder son téléphone avant de dormir fait \nperdre 2 heures de sommeil chaque nuit. » \nAvant de la partager avec des élèves, vous devez déterminer si cette information est suffisamment \nfiable. \nPar groupes de 3 à 4 : \n1. Construisez votre méthode de vérification \nQuelles informations devez-vous rechercher pour pouvoir déterminer si cette affirmation est \nfiable ? \n1. Rechercher l’origine exacte de l’affirmation. \n2. Rechercher des articles scientifiques sur le sujet en utilisant les différentes plateformes de \nrecherche. \n3. Analyser les articles scientifiques trouvés. \n4. Croiser les différentes sources entre elles. \n5. Valider ou invalider l’affirmation. \n \n2. Menez l'enquête \nUtilisez Internet pour vérifier l'information. Recherchez notamment : \no \nl'origine de l'affirmation ; \no \nla source scientifique éventuelle ; \no \nl'auteur ou l'organisme à l'origine de l'information ; \no \nd'autres sources permettant de confirmer ou de nuancer l'affirmation. \n \nL’origine de l’affirmation est inconnue mais un groupe de chercheurs norvégiens (Hjetland GJ, \nSkogen JC, Hysing M, Gradisar M and Sivertsen B) s’est penché sur la question mais uniquement \nchez les étudiants universitaires norvégiens. Les résultats de cette recherche ont été publiés le \n31 mars 2025 dans « Frontiers in Psychiatry ». Les chercheurs ont démontré qu’une heure d’écran \nsupplémentaire au lit était associée à une réduction du temps de sommeil de 24 minutes (et non \nde deux heures). D’autres publications permettent de dire qu’il y a bien des effets négatifs quant \nà l’utilisation du téléphone avant de s’endormir sans pour autant donner d’information relative \nau temps de sommeil perdu. \n \n \n3. Prenez une décision \nRépondez à la question : \n« Partageriez-vous cette information avec des élèves ? » NON \nJustifiez votre réponse à partir de sources vérifiables. \nNon, l’affirmation n’est pas assez opérationnalisée. En effet, on ne connait pas la population \nétudiée pour affirmer cela. De plus, la formulation « regarder son téléphone » n’indique en rien \nla réelle utilisation que la personne en fait (regarder une vidéo ou uniquement scroller). Des \ninformations essentielles pour prendre en compte tous les éléments de cette affirmation sont \nmanquantes. Il est, donc, nécessaire de réaliser une recherche approfondie en amont avant de \nproposer celle-ci aux apprenants. Pour vérifier correctement l’affirmation, nous avons utilisé \nGoogleScholar et PubMed afin d’obtenir différents articles de recherche sur le sujet dans le but \nde croiser les informations. \nIl est, tout de même, compliqué de trouver des articles scientifiques reprenant des recherches \ngénérales sur ce sujet. De nombreux articles ciblent une population précise tant au niveau \ngéographique qu’au niveau de l’âge des personnes.  \n \nEn conclusion, l’affirmation est générique et celle-ci manque de précision. \n \nSources utilisées : \nHjetland GJ, Skogen JC, Hysing M, Gradisar M and Sivertsen B (2025) How and when screens \nare used: comparing different screen activities and sleep in Norwegian university students. \nFront. Psychiatry 16:1548273. doi: 10.3389/fpsyt.2025.1548273 \nBrosnan, B., Haszard, J. J., Meredith-Jones, K. A., Wickham, S. R., Galland, B. C., & Taylor, R. W. \n(2024). Screen use at bedtime and sleep duration and quality among youths. JAMA \npediatrics, 178(11), 1147-1154. \nDuraccio, K. M., Zaugg, K. K., Blackburn, R. C., & Jensen, C. D. (2021). Does iPhone night shift \nmitigate negative effects of smartphone use on sleep outcomes in emerging adults? Sleep \nHealth, 7(4), 478–484. https://doi.org/10.1016/j.sleh.2021.03.005 \nCette ressource pourrait être intéressante mais l’article est payant :  \nGarcia, A., Ramirez, C., Aguillon, A., Tirado, V., Paredes, L., Ibarra, A., & Valdez, P. (2017). \nSmartphone use during sleep time in Mexican ",
    "submittedAt": "2026-09-26 14:00"
  },
  {
    "id": "sub-real-siragusa-sabrina-ex2-22",
    "userId": "user-1790189590610",
    "userName": "Sabrina Siragusa",
    "userEmail": "sabrina.siragusa@student.hech.be",
    "exerciseId": "exercice-02",
    "exerciseTitle": "Atelier 2 : Évaluation critique d'une information",
    "answer": "SIRAGUSA Sabrina \nVALENZANO Jonathan \nExercice 02 — Peut-on faire confiance à cette information ? \n« Une étude scientifique vient de prouver que regarder son téléphone avant de dormir fait \nperdre 2 heures de sommeil chaque nuit. » \n1. Méthode de vérification \n- \nRechercher l’origine exacte de l’affirmation. \n- \nRechercher des articles scientifiques sur le sujet en utilisant les différentes plateformes de \nrecherche. \n- \nAnalyser les articles scientifiques trouvés. \n- \nCroiser les différentes sources entre elles. \n- \nValider ou invalider l’affirmation. \n \n2. Enquête \n \nL’origine de l’affirmation est inconnue mais un groupe de chercheurs norvégiens (Hjetland GJ, \nSkogen JC, Hysing M, Gradisar M and Sivertsen B) s’est penché sur la question mais uniquement \nchez les étudiants universitaires norvégiens. Les résultats de cette recherche ont été publiés le \n31 mars 2025 dans « Frontiers in Psychiatry ». Les chercheurs ont démontré qu’une heure d’écran \nsupplémentaire au lit était associée à une réduction du temps de sommeil de 24 minutes (et non \nde deux heures). D’autres publications permettent de dire qu’il y a bien des effets négatifs quant \nà l’utilisation du téléphone avant de s’endormir sans pour autant donner d’information relative \nau temps de sommeil perdu. \n \n3. Décision \n« Partageriez-vous cette information avec des élèves ? » \nNon, l’affirmation n’est pas assez opérationnalisée. En effet, on ne connait pas la population \nétudiée pour affirmer cela. De plus, la formulation « regarder son téléphone » n’indique en rien \nla réelle utilisation que la personne en fait (regarder une vidéo ou uniquement scroller). Des \ninformations essentielles pour prendre en compte tous les éléments de cette affirmation sont \nmanquantes. Il est, donc, nécessaire de réaliser une recherche approfondie en amont avant de \nproposer celle-ci aux apprenants. Pour vérifier correctement l’affirmation, nous avons utilisé \nGoogleScholar et PubMed afin d’obtenir différents articles de recherche sur le sujet dans le but \nde croiser les informations. \nIl est, tout de même, compliqué de trouver des articles scientifiques reprenant des recherches \ngénérales sur ce sujet. De nombreux articles ciblent une population précise tant au niveau \ngéographique qu’au niveau de l’âge des personnes.  \n \nSIRAGUSA Sabrina \nVALENZANO Jonathan \nEn conclusion, l’affirmation est générique et celle-ci manque de précision. \n \nSources utilisées : \nHjetland GJ, Skogen JC, Hysing M, Gradisar M and Sivertsen B (2025) How and when screens \nare used: comparing different screen activities and sleep in Norwegian university students. \nFront. Psychiatry 16:1548273. doi: 10.3389/fpsyt.2025.1548273 \nBrosnan, B., Haszard, J. J., Meredith-Jones, K. A., Wickham, S. R., Galland, B. C., & Taylor, R. W. \n(2024). Screen use at bedtime and sleep duration and quality among youths. JAMA \npediatrics, 178(11), 1147-1154. \nDuraccio, K. M., Zaugg, K. K., Blackburn, R. C., & Jensen, C. D. (2021). Does iPhone night shift \nmitigate negative effects of smartphone use on sleep outcomes in emerging adults? Sleep \nHealth, 7(4), 478–484. https://doi.org/10.1016/j.sleh.2021.03.005 \nCette ressource pourrait être intéressante mais l’article est payant :  \nGarcia, A., Ramirez, C., Aguillon, A., Tirado, V., Paredes, L., Ibarra, A., & Valdez, P. (2017). \nSmartphone use during sleep time in Mexican adolescents. Sleep Medicine, 40(Suppl. 1), e106–\ne107. https://doi.org/10.1016/j.sleep.2017.11.310 \n \n \n \n",
    "submittedAt": "2026-09-26 14:00"
  },
  {
    "id": "sub-real-steckx-chloe-ex1-23",
    "userId": "user-1790163391889",
    "userName": "Chloé Steckx",
    "userEmail": "chloe.steckx@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Profil 1\n \n   → Partiellement compétent \n \n 🟠\n1. Rédiger un prompt pour demander des reformulations / résumés / idées sur une problématique.\n2. Vérifier systématiquement la fiabilité / véracité de l’information produite.\n3. Non, elle rejette la faute sur l’IA.\n4. Non, elle dépend de ChatGPT.\n5. Elle en se remet pas en question et se dédouane en rejetant la faute sur l’IA.\n6. Pas de mention.\nProfil 2 → Compétent 🟢\n1. Rechercher des outils (tutoriels par exemple), expérimenter et comparer des possibilités.\n2. Utilisation de Canva pour créer une infographie (Débuter avec une interface inconnue en \ngénéral).\n3. Oui, il recherche de l’aide via des tutoriels notamment.\n4. Oui, il utilise des tutoriels mais expérimente et compare les possibilités par lui-même. De plus, il \nne demande de l’aide à quelqu’un qu’en derniers recours.\n5. Oui puisqu’il compare les possibilités.\n6. Pas de mention.\nProfil 3 → Partiellement compétent 🟠\n1. Gérer les différents aspects (création de contenu, fonctionnalités, statistiques). des principaux \nréseaux sociaux.\n2. Les questions de sécurité, de vie privée, de droit, d'éthique.\n3. Pas de mention.\n4. Pas de mention de quelconque aide.\n5. Non, elle se considère comme la plus compétente en numérique de sa classe.\n6. Non, elle ne s’interroge pas particulièrement sur ces enjeux.\nProfil 4 → Partiellement compétent 🟠\n1. Vérifier la fiabilité d’une information ; Utiliser des ressources pour progresser.\n2. Ne connaît pas beaucoup des applis utilisées par ses camarades ; Ne sait pas réaliser des \nmontages vidéo complexes. \n3. Oui, i s’aide de ressources pour progresser.\n4. Non, il s’aide de ressources pour progresser.\n5. Oui, il vérifie la fiabilité des infos qui lui paraisse étonnantes.\n6. Pas de mention.\nProfil 5 \n \n → Partiellement compétent \n \n 🟠\n1. Maîtrise de divers logiciels (fonctions avancées et aide aux camarades).\n2. S’initier seule / s’autoformer à de nouveaux outils.\n3. Oui, elle suit des formations.\n4. Non, elle suit des formations.\n5. Pas de mention.\n6. Pas de mention.\nProfil 6  → Incompétent 🔴\n1. Utiliser les moteurs de recherche pour trouver rapidement une information.\n2. Vérifier la fiabilité d’une information.\n3. Pas de mention : il prétend trouver tout ce qu’il cherche sur Internet.\n4. Non, il dépend des résultats affichés par le moteur de recherche.\n5. Non, il dépend des résultats affichés en premier par le moteur de recherche.\n6. Non, il ne vérifie pas la fiabilité des résultats affichés.\nProfil 7 → Compétent 🟢\n1. Utilisation d’un gestionnaire de mots de passe, de la double authentification et vérification \nrégulière des paramètres de confidentialité de ses comptes.\n2. Ne maîtrise particulièrement les fonctions avancées des logiciels bureautiques. \n3. Oui, elle demande de l’aide.\n4. Oui, elle demande de l’aide mais cherche aussi une solution.\n5. Pas de mention.\n6. Oui, elle réfléchit aux informations qu’elle publie et aux données personnelles qu’elle \ncommunique.\nProfil 8 \n \n → Partiellement compétent \n \n 🟠\n1. Installer des logiciels, configurer un ordinateur, résoudre de nombreux problèmes techniques et \ncomprendre les caractéristiques du matériel.\n2. Il considère que les questions relatives aux données personnelles, aux algorithmes, aux biais ou \nà l'éthique sont secondaires. \n3. Oui, il trouve généralement une solution par lui-même.\n4. Oui, il trouve généralement une solution par lui-même.\n5. Pas de mention.\n6. Non, il se concentre sur le but / intérêt et considère l’éthique comme secondaire.\nProfil 9  → Compétent 🟢\n1. Utilisation de l’IA pour générer des idées, reformuler certains passages ou explorer différentes \npistes. \n2. /\n3. Pas de mention.\n4. Pas de mention.\n5. Oui\n6. Oui\nProfil 10 → Incompétent 🔴\n1. Utiliser des outils pour reproduire une procédure dans une situation identique.\n2. Utiliser les mêmes outils dans une situation légèrement différente.\n3. Oui/Non, il ne sait pas transposer les outils d’une situation à l’autre mais recherche une solution \nou demande de l’aide.\n4. Oui/No",
    "submittedAt": "2026-09-25 14:00"
  },
  {
    "id": "sub-real-steckx-chloe-ex1-24",
    "userId": "user-1790163391889",
    "userName": "Chloé Steckx",
    "userEmail": "chloe.steckx@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Profil 1\n \n   → Partiellement compétent \n \n 🟠\n1. Rédiger un prompt pour demander des reformulations / résumés / idées sur une problématique.\n2. Vérifier systématiquement la fiabilité / véracité de l’information produite.\n3. Non, elle rejette la faute sur l’IA.\n4. Non, elle dépend de ChatGPT.\n5. Elle en se remet pas en question et se dédouane en rejetant la faute sur l’IA.\n6. Pas de mention.\nProfil 2 → Compétent 🟢\n1. Rechercher des outils (tutoriels par exemple), expérimenter et comparer des possibilités.\n2. Utilisation de Canva pour créer une infographie (Débuter avec une interface inconnue en \ngénéral).\n3. Oui, il recherche de l’aide via des tutoriels notamment.\n4. Oui, il utilise des tutoriels mais expérimente et compare les possibilités par lui-même. De plus, il \nne demande de l’aide à quelqu’un qu’en derniers recours.\n5. Oui puisqu’il compare les possibilités.\n6. Pas de mention.\nProfil 3 → Partiellement compétent 🟠\n1. Gérer les différents aspects (création de contenu, fonctionnalités, statistiques). des principaux \nréseaux sociaux.\n2. Les questions de sécurité, de vie privée, de droit, d'éthique.\n3. Pas de mention.\n4. Pas de mention de quelconque aide.\n5. Non, elle se considère comme la plus compétente en numérique de sa classe.\n6. Non, elle ne s’interroge pas particulièrement sur ces enjeux.\nProfil 4 → Partiellement compétent 🟠\n1. Vérifier la fiabilité d’une information ; Utiliser des ressources pour progresser.\n2. Ne connaît pas beaucoup des applis utilisées par ses camarades ; Ne sait pas réaliser des \nmontages vidéo complexes. \n3. Oui, i s’aide de ressources pour progresser.\n4. Non, il s’aide de ressources pour progresser.\n5. Oui, il vérifie la fiabilité des infos qui lui paraisse étonnantes.\n6. Pas de mention.\nProfil 5 \n \n → Partiellement compétent \n \n 🟠\n1. Maîtrise de divers logiciels (fonctions avancées et aide aux camarades).\n2. S’initier seule / s’autoformer à de nouveaux outils.\n3. Oui, elle suit des formations.\n4. Non, elle suit des formations.\n5. Pas de mention.\n6. Pas de mention.\nProfil 6  → Incompétent 🔴\n1. Utiliser les moteurs de recherche pour trouver rapidement une information.\n2. Vérifier la fiabilité d’une information.\n3. Pas de mention : il prétend trouver tout ce qu’il cherche sur Internet.\n4. Non, il dépend des résultats affichés par le moteur de recherche.\n5. Non, il dépend des résultats affichés en premier par le moteur de recherche.\n6. Non, il ne vérifie pas la fiabilité des résultats affichés.\nProfil 7 → Compétent 🟢\n1. Utilisation d’un gestionnaire de mots de passe, de la double authentification et vérification \nrégulière des paramètres de confidentialité de ses comptes.\n2. Ne maîtrise particulièrement les fonctions avancées des logiciels bureautiques. \n3. Oui, elle demande de l’aide.\n4. Oui, elle demande de l’aide mais cherche aussi une solution.\n5. Pas de mention.\n6. Oui, elle réfléchit aux informations qu’elle publie et aux données personnelles qu’elle \ncommunique.\nProfil 8 \n \n → Partiellement compétent \n \n 🟠\n1. Installer des logiciels, configurer un ordinateur, résoudre de nombreux problèmes techniques et \ncomprendre les caractéristiques du matériel.\n2. Il considère que les questions relatives aux données personnelles, aux algorithmes, aux biais ou \nà l'éthique sont secondaires. \n3. Oui, il trouve généralement une solution par lui-même.\n4. Oui, il trouve généralement une solution par lui-même.\n5. Pas de mention.\n6. Non, il se concentre sur le but / intérêt et considère l’éthique comme secondaire.\nProfil 9  → Compétent 🟢\n1. Utilisation de l’IA pour générer des idées, reformuler certains passages ou explorer différentes \npistes. \n2. /\n3. Pas de mention.\n4. Pas de mention.\n5. Oui\n6. Oui\nProfil 10 → Incompétent 🔴\n1. Utiliser des outils pour reproduire une procédure dans une situation identique.\n2. Utiliser les mêmes outils dans une situation légèrement différente.\n3. Oui/Non, il ne sait pas transposer les outils d’une situation à l’autre mais recherche une solution \nou demande de l’aide.\n4. Oui/No",
    "submittedAt": "2026-09-27 14:00"
  },
  {
    "id": "sub-real-valenzano-jonathan-ex1-25",
    "userId": "user-1790108903773",
    "userName": "Jonathan Valenzano",
    "userEmail": "jonathan.valenzano@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Exercice 1.1A\nSIRAGUSA Sabrina\nVALENZANO Jonathan\n1\n2\n3\n4\n5\n6\nConnaissances et SF\nLimites\nAdaptation\nAutonomie\nRegard critique\nResponsabilité\nConclusion\nSarah\nRégider des prompts précis pour une IA \ngénérative.\nReformulation d'une réponse donnée par l'IA.\nDemander des résumés des textes et générer des \nidées.\nElle ne comprend pas que l'IA peut se tromper.\n/\n/\nElle ne vérifie pas les informations \n(référence, statistique).\nElle ne cherche pas à identifier les sources \noriginales.\nRemet la faute sur l'IA en cas \nd'erreur.\nThomas\nIl sait rechercher un outil qui pourra l'aider à \nréaliser son travail.\nIl sait comparer les différentes options, \nexpérimenter un logiciel.\nIl ne connait pas beaucoup de logiciels (Ex. \nCanva).\nIl n'est pas à l'aise avec une interface \ninconnue.\nIl expérimente, il recherche \nune solution avant de \ndemander de l'aide.\nTrès bonne.\nIl a un regard critique sur l'utilisation (en \nconsulte plusieurs et expérimente).\n/\nLina\nMaitrise des réseaux sociaux.\nCréation de vidéos.\nUtilisation des tendances.\nAnalyse \"statistique\" de ses publications.\n/\nAdaptation uniquement dans \nson domaine (réseaux \nsociaux).\n/\n/\nProblèmes de la protection de la \nvie privée (publication libre sans \nconsulter les individus \nconcernés).\nProblèmes de conservation des \ncontenus et de leur diffusion.\nHugo\nRéalisation de montage de vidéos simples.\nMaitrise certains logiciels.\nRecherche d'informations sur internet.\nPeu d'utilisation des réseaux sociaux.\nManque de connaissance dans certaines \napplications et logiciels.\nNe sait pas réaliser un montage vidéo \ncomplexe.\nIl recherche une ressource lui \npermettant de progresser.\nDépend d'une ressource.\nIl recherche la véracité d'une information \nétonnante (origine, date, auteurs).\nIl ne partage pas jamais \nimmédiatement l'information \nétonnante avant de vérifier sa \nvéracité.\nJulie\nLa suite Office et autres logiciels professionnels \n(niveau avancé).\nPartager ses connaissances d'un logiciel.\nNe veut pas expérimenter seule un nouveau \nlogiciel.\nElle attend une formation ou \nune explicaion précise de \nchaque étape.\nDépend de formations ou de \npersonnes référentes.\n/\n/\nMehdi\nUtilisation efficace des moteurs de recherche.\n/\nRecherche l'information sur \ninternet.\nDépend d'une recherche internet.\nNe vérifie pas les sources.\nRegarde les sources dans l'ordre \nd'apparition sans regarder si la source \nqualitative.\nNaïvité numérique (une réponse qui \napparait plusieurs n'est pas forcément la \nbonne).\n/\nEmma\nMaitrise les fonctions de base des logiciels de \nbureautique.\nMaitrise un gestionnaire de mot de passe.\nMaitrise la double identification.\nVérifier les paramètres de confidentialité de ses \ncomptes.\nRecherche une solution.\nNe maitrise pas les fonctions avancées des \nlogiciels de bureautique.\nRecherche une solution ou \ndemande de l'aide.\nPeut rechercher une solution par \nelle-même mais peut demander de \nl'aide à une personne référente \n(difficulté technique ou quand elle \nne trouve pas la solution).\nSe questionne sur la confidentialité des \ninformations sur ses comptes.\nVérifie ce qu'elle transmet à une \napplication (données \npersonnelles).\nFais attention à ce qu'elle publie.\nDouble identification.\nConfidentialité des comptes.\nLucas\nInstallation de logiciels.\nConfiguration d'un ordinateur.\nRésolution de problèmes techniques et \ncompréhension des caractéristiques du matériel.\n/\nParvient à solutionner le \nproblème par lui-même.\nIl est automone.\nRegard critique secondaire (biais des \ninformations, algorithmes…).\nSe base uniquement sur le \nfonctionnement.\nNon, la confidentialité, l'éthique \net les données personnelles sont \nsecondaires.\nChloé\nUtiliser l'IA afin de générer des idées, reformuler \ndes passages ou explorer ≠ pistes.\nVérifier les informations importantes.\nConsulter les sources originales.\nModifier les productions obtenues.\nExpliquer ce que l'outil peut faire, ses limites et \nquand il ne faut pas l'utiliser.\n/\nUtilise l'IA.\nAutonomie liée à l'utilisation de \nl'IA.\nTrès bon, elle ne considère pas qu'",
    "submittedAt": "2026-09-25 14:00"
  },
  {
    "id": "sub-real-valenzano-jonathan-ex1-26",
    "userId": "user-1790108903773",
    "userName": "Jonathan Valenzano",
    "userEmail": "jonathan.valenzano@student.hech.be",
    "exerciseId": "exercice-01",
    "exerciseTitle": "Atelier 1 : Diagnostic de compétences numériques",
    "answer": "Exercice 1.1A\nSIRAGUSA Sabrina\nVALENZANO Jonathan\n1\n2\n3\n4\n5\n6\nConnaissances et SF\nLimites\nAdaptation\nAutonomie\nRegard critique\nResponsabilité\nConclusion\nSarah\nRégider des prompts précis pour une IA \ngénérative.\nReformulation d'une réponse donnée par l'IA.\nDemander des résumés des textes et générer des \nidées.\nElle ne comprend pas que l'IA peut se tromper.\n/\n/\nElle ne vérifie pas les informations \n(référence, statistique).\nElle ne cherche pas à identifier les sources \noriginales.\nRemet la faute sur l'IA en cas \nd'erreur.\nThomas\nIl sait rechercher un outil qui pourra l'aider à \nréaliser son travail.\nIl sait comparer les différentes options, \nexpérimenter un logiciel.\nIl ne connait pas beaucoup de logiciels (Ex. \nCanva).\nIl n'est pas à l'aise avec une interface \ninconnue.\nIl expérimente, il recherche \nune solution avant de \ndemander de l'aide.\nTrès bonne.\nIl a un regard critique sur l'utilisation (en \nconsulte plusieurs et expérimente).\n/\nLina\nMaitrise des réseaux sociaux.\nCréation de vidéos.\nUtilisation des tendances.\nAnalyse \"statistique\" de ses publications.\n/\nAdaptation uniquement dans \nson domaine (réseaux \nsociaux).\n/\n/\nProblèmes de la protection de la \nvie privée (publication libre sans \nconsulter les individus \nconcernés).\nProblèmes de conservation des \ncontenus et de leur diffusion.\nHugo\nRéalisation de montage de vidéos simples.\nMaitrise certains logiciels.\nRecherche d'informations sur internet.\nPeu d'utilisation des réseaux sociaux.\nManque de connaissance dans certaines \napplications et logiciels.\nNe sait pas réaliser un montage vidéo \ncomplexe.\nIl recherche une ressource lui \npermettant de progresser.\nDépend d'une ressource.\nIl recherche la véracité d'une information \nétonnante (origine, date, auteurs).\nIl ne partage pas jamais \nimmédiatement l'information \nétonnante avant de vérifier sa \nvéracité.\nJulie\nLa suite Office et autres logiciels professionnels \n(niveau avancé).\nPartager ses connaissances d'un logiciel.\nNe veut pas expérimenter seule un nouveau \nlogiciel.\nElle attend une formation ou \nune explicaion précise de \nchaque étape.\nDépend de formations ou de \npersonnes référentes.\n/\n/\nMehdi\nUtilisation efficace des moteurs de recherche.\n/\nRecherche l'information sur \ninternet.\nDépend d'une recherche internet.\nNe vérifie pas les sources.\nRegarde les sources dans l'ordre \nd'apparition sans regarder si la source \nqualitative.\nNaïvité numérique (une réponse qui \napparait plusieurs n'est pas forcément la \nbonne).\n/\nEmma\nMaitrise les fonctions de base des logiciels de \nbureautique.\nMaitrise un gestionnaire de mot de passe.\nMaitrise la double identification.\nVérifier les paramètres de confidentialité de ses \ncomptes.\nRecherche une solution.\nNe maitrise pas les fonctions avancées des \nlogiciels de bureautique.\nRecherche une solution ou \ndemande de l'aide.\nPeut rechercher une solution par \nelle-même mais peut demander de \nl'aide à une personne référente \n(difficulté technique ou quand elle \nne trouve pas la solution).\nSe questionne sur la confidentialité des \ninformations sur ses comptes.\nVérifie ce qu'elle transmet à une \napplication (données \npersonnelles).\nFais attention à ce qu'elle publie.\nDouble identification.\nConfidentialité des comptes.\nLucas\nInstallation de logiciels.\nConfiguration d'un ordinateur.\nRésolution de problèmes techniques et \ncompréhension des caractéristiques du matériel.\n/\nParvient à solutionner le \nproblème par lui-même.\nIl est automone.\nRegard critique secondaire (biais des \ninformations, algorithmes…).\nSe base uniquement sur le \nfonctionnement.\nNon, la confidentialité, l'éthique \net les données personnelles sont \nsecondaires.\nChloé\nUtiliser l'IA afin de générer des idées, reformuler \ndes passages ou explorer ≠ pistes.\nVérifier les informations importantes.\nConsulter les sources originales.\nModifier les productions obtenues.\nExpliquer ce que l'outil peut faire, ses limites et \nquand il ne faut pas l'utiliser.\n/\nUtilise l'IA.\nAutonomie liée à l'utilisation de \nl'IA.\nTrès bon, elle ne considère pas qu'",
    "submittedAt": "2026-09-25 14:00"
  },
  {
    "id": "sub-real-valenzano-jonathan-ex2-27",
    "userId": "user-1790108903773",
    "userName": "Jonathan Valenzano",
    "userEmail": "jonathan.valenzano@student.hech.be",
    "exerciseId": "exercice-02",
    "exerciseTitle": "Atelier 2 : Évaluation critique d'une information",
    "answer": "Exercice 02 — Peut-on faire confiance à cette information ? \nVotre mission \nVous découvrez sur Internet l'affirmation suivante : \n« Une étude scientifique vient de prouver que regarder son téléphone avant de dormir fait \nperdre 2 heures de sommeil chaque nuit. » \nAvant de la partager avec des élèves, vous devez déterminer si cette information est suffisamment \nfiable. \nPar groupes de 3 à 4 : \n1. Construisez votre méthode de vérification \nQuelles informations devez-vous rechercher pour pouvoir déterminer si cette affirmation est \nfiable ? \n1. Rechercher l’origine exacte de l’affirmation. \n2. Rechercher des articles scientifiques sur le sujet en utilisant les différentes plateformes de \nrecherche. \n3. Analyser les articles scientifiques trouvés. \n4. Croiser les différentes sources entre elles. \n5. Valider ou invalider l’affirmation. \n \n2. Menez l'enquête \nUtilisez Internet pour vérifier l'information. Recherchez notamment : \no \nl'origine de l'affirmation ; \no \nla source scientifique éventuelle ; \no \nl'auteur ou l'organisme à l'origine de l'information ; \no \nd'autres sources permettant de confirmer ou de nuancer l'affirmation. \n \nL’origine de l’affirmation est inconnue mais un groupe de chercheurs norvégiens (Hjetland GJ, \nSkogen JC, Hysing M, Gradisar M and Sivertsen B) s’est penché sur la question mais uniquement \nchez les étudiants universitaires norvégiens. Les résultats de cette recherche ont été publiés le \n31 mars 2025 dans « Frontiers in Psychiatry ». Les chercheurs ont démontré qu’une heure d’écran \nsupplémentaire au lit était associée à une réduction du temps de sommeil de 24 minutes (et non \nde deux heures). D’autres publications permettent de dire qu’il y a bien des effets négatifs quant \nà l’utilisation du téléphone avant de s’endormir sans pour autant donner d’information relative \nau temps de sommeil perdu. \n \n \n3. Prenez une décision \nRépondez à la question : \n« Partageriez-vous cette information avec des élèves ? » NON \nJustifiez votre réponse à partir de sources vérifiables. \nNon, l’affirmation n’est pas assez opérationnalisée. En effet, on ne connait pas la population \nétudiée pour affirmer cela. De plus, la formulation « regarder son téléphone » n’indique en rien \nla réelle utilisation que la personne en fait (regarder une vidéo ou uniquement scroller). Des \ninformations essentielles pour prendre en compte tous les éléments de cette affirmation sont \nmanquantes. Il est, donc, nécessaire de réaliser une recherche approfondie en amont avant de \nproposer celle-ci aux apprenants. Pour vérifier correctement l’affirmation, nous avons utilisé \nGoogleScholar et PubMed afin d’obtenir différents articles de recherche sur le sujet dans le but \nde croiser les informations. \nIl est, tout de même, compliqué de trouver des articles scientifiques reprenant des recherches \ngénérales sur ce sujet. De nombreux articles ciblent une population précise tant au niveau \ngéographique qu’au niveau de l’âge des personnes.  \n \nEn conclusion, l’affirmation est générique et celle-ci manque de précision. \n \nSources utilisées : \nHjetland GJ, Skogen JC, Hysing M, Gradisar M and Sivertsen B (2025) How and when screens \nare used: comparing different screen activities and sleep in Norwegian university students. \nFront. Psychiatry 16:1548273. doi: 10.3389/fpsyt.2025.1548273 \nBrosnan, B., Haszard, J. J., Meredith-Jones, K. A., Wickham, S. R., Galland, B. C., & Taylor, R. W. \n(2024). Screen use at bedtime and sleep duration and quality among youths. JAMA \npediatrics, 178(11), 1147-1154. \nDuraccio, K. M., Zaugg, K. K., Blackburn, R. C., & Jensen, C. D. (2021). Does iPhone night shift \nmitigate negative effects of smartphone use on sleep outcomes in emerging adults? Sleep \nHealth, 7(4), 478–484. https://doi.org/10.1016/j.sleh.2021.03.005 \nCette ressource pourrait être intéressante mais l’article est payant :  \nGarcia, A., Ramirez, C., Aguillon, A., Tirado, V., Paredes, L., Ibarra, A., & Valdez, P. (2017). \nSmartphone use during sleep time in Mexican ",
    "submittedAt": "2026-09-26 14:00"
  },
  {
    "id": "sub-real-valenzano-jonathan-ex2-28",
    "userId": "user-1790108903773",
    "userName": "Jonathan Valenzano",
    "userEmail": "jonathan.valenzano@student.hech.be",
    "exerciseId": "exercice-02",
    "exerciseTitle": "Atelier 2 : Évaluation critique d'une information",
    "answer": "SIRAGUSA Sabrina \nVALENZANO Jonathan \nExercice 02 — Peut-on faire confiance à cette information ? \n« Une étude scientifique vient de prouver que regarder son téléphone avant de dormir fait \nperdre 2 heures de sommeil chaque nuit. » \n1. Méthode de vérification \n- \nRechercher l’origine exacte de l’affirmation. \n- \nRechercher des articles scientifiques sur le sujet en utilisant les différentes plateformes de \nrecherche. \n- \nAnalyser les articles scientifiques trouvés. \n- \nCroiser les différentes sources entre elles. \n- \nValider ou invalider l’affirmation. \n \n2. Enquête \n \nL’origine de l’affirmation est inconnue mais un groupe de chercheurs norvégiens (Hjetland GJ, \nSkogen JC, Hysing M, Gradisar M and Sivertsen B) s’est penché sur la question mais uniquement \nchez les étudiants universitaires norvégiens. Les résultats de cette recherche ont été publiés le \n31 mars 2025 dans « Frontiers in Psychiatry ». Les chercheurs ont démontré qu’une heure d’écran \nsupplémentaire au lit était associée à une réduction du temps de sommeil de 24 minutes (et non \nde deux heures). D’autres publications permettent de dire qu’il y a bien des effets négatifs quant \nà l’utilisation du téléphone avant de s’endormir sans pour autant donner d’information relative \nau temps de sommeil perdu. \n \n3. Décision \n« Partageriez-vous cette information avec des élèves ? » \nNon, l’affirmation n’est pas assez opérationnalisée. En effet, on ne connait pas la population \nétudiée pour affirmer cela. De plus, la formulation « regarder son téléphone » n’indique en rien \nla réelle utilisation que la personne en fait (regarder une vidéo ou uniquement scroller). Des \ninformations essentielles pour prendre en compte tous les éléments de cette affirmation sont \nmanquantes. Il est, donc, nécessaire de réaliser une recherche approfondie en amont avant de \nproposer celle-ci aux apprenants. Pour vérifier correctement l’affirmation, nous avons utilisé \nGoogleScholar et PubMed afin d’obtenir différents articles de recherche sur le sujet dans le but \nde croiser les informations. \nIl est, tout de même, compliqué de trouver des articles scientifiques reprenant des recherches \ngénérales sur ce sujet. De nombreux articles ciblent une population précise tant au niveau \ngéographique qu’au niveau de l’âge des personnes.  \n \nSIRAGUSA Sabrina \nVALENZANO Jonathan \nEn conclusion, l’affirmation est générique et celle-ci manque de précision. \n \nSources utilisées : \nHjetland GJ, Skogen JC, Hysing M, Gradisar M and Sivertsen B (2025) How and when screens \nare used: comparing different screen activities and sleep in Norwegian university students. \nFront. Psychiatry 16:1548273. doi: 10.3389/fpsyt.2025.1548273 \nBrosnan, B., Haszard, J. J., Meredith-Jones, K. A., Wickham, S. R., Galland, B. C., & Taylor, R. W. \n(2024). Screen use at bedtime and sleep duration and quality among youths. JAMA \npediatrics, 178(11), 1147-1154. \nDuraccio, K. M., Zaugg, K. K., Blackburn, R. C., & Jensen, C. D. (2021). Does iPhone night shift \nmitigate negative effects of smartphone use on sleep outcomes in emerging adults? Sleep \nHealth, 7(4), 478–484. https://doi.org/10.1016/j.sleh.2021.03.005 \nCette ressource pourrait être intéressante mais l’article est payant :  \nGarcia, A., Ramirez, C., Aguillon, A., Tirado, V., Paredes, L., Ibarra, A., & Valdez, P. (2017). \nSmartphone use during sleep time in Mexican adolescents. Sleep Medicine, 40(Suppl. 1), e106–\ne107. https://doi.org/10.1016/j.sleep.2017.11.310 \n \n \n \n",
    "submittedAt": "2026-09-26 14:00"
  }
];

export const INITIAL_REAL_QUIZZES: QuizAttempt[] = [
  {
    "id": "quiz-cloud-2-jwasterlainstudenthechbe",
    "userEmail": "j.wasterlain@student.hech.be",
    "userName": "Justin Wasterlain",
    "moduleId": "01-2",
    "quizId": "01-2",
    "moduleTitle": "1.2 L'éducation aux médias dans les compétences numériques",
    "score": 34,
    "totalPoints": 42,
    "totalQuestions": 42,
    "percentage": 81,
    "submittedAt": "2026-09-25 12:33",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Dans le concept de « post-vérité » illustré par la comparaison photographique des foules entre Obama (2009) et Trump (2017), quelle est la caractéristique centrale du discours médiatique ?",
        "type": "qcm",
        "userAnswer": "Le fait que les faits objectifs et vérifiables ont moins d'influence que les récits faisant appel à l'émotion et aux croyances personnelles (« faits alternatifs »).",
        "correctAnswer": "Le fait que les faits objectifs et vérifiables ont moins d'influence que les récits faisant appel à l'émotion et aux croyances personnelles (« faits alternatifs »).",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "La post-vérité se caractérise par la primauté accordée à l'émotion et à l'affirmation identitaire sur l'évidence factuelle et matérielle (création délibérée de vérités alternatives)."
      },
      {
        "questionId": "q2",
        "questionText": "Dans les vidéos conspirationnistes comme celle illustrée par « Secret Dieu », quel procédé technique de réalisation est systématiquement mobilisé pour convaincre le spectateur d'un complot ?",
        "type": "qcm",
        "userAnswer": "L'association arbitraire d'images disparates liée par une voix mystérieuse, une musique anxiogène et l'illusion d'une causalité cachée.",
        "correctAnswer": "L'association arbitraire d'images disparates liée par une voix mystérieuse, une musique anxiogène et l'illusion d'une causalité cachée.",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "Les vidéos complotistes fabriquent un faux sentiment de révélation en associant des symboles et des images sorties de leur contexte à grand renfort d'ambiances sonores dramatisées."
      },
      {
        "questionId": "q3",
        "questionText": "Dans la chronique « Info ou Intox » de France 24 analysant la prétendue publicité anti-Zelensky à New York, quelle a été la démarche journalistique décisive pour prouver l'intox ?",
        "type": "qcm",
        "userAnswer": "Interroger la régie publicitaire locale, analyser la météo, la circulation réelle et les caméras fixes en direct de Times Square.",
        "correctAnswer": "Interroger la régie publicitaire locale, analyser la météo, la circulation réelle et les caméras fixes en direct de Times Square.",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "Le fact-checking rigoureux croise les indices matériels (météo, webcam de circulation en direct) et contacte les gestionnaires officiels de l'espace publicitaire pour authentifier la réalité de la diffusion."
      },
      {
        "questionId": "q4",
        "questionText": "Dans le reportage « Post-vérité et théorie du complot : la vérité en danger sur Internet », pourquoi une fausse information circule-t-elle généralement plus vite qu'un démenti ?",
        "type": "qcm",
        "userAnswer": "Parce qu'elle suscite des émotions vives (indignation, surprise, peur) qui stimulent le partage instantané, alors que la vérification demande du temps et de l'effort cognitif.",
        "correctAnswer": "Parce qu'elle suscite des émotions vives (indignation, surprise, peur) qui stimulent le partage instantané, alors que la vérification demande du temps et de l'effort cognitif.",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "La viralité repose sur la charge émotionnelle : l'indignation et la stupéfaction court-circuitent la réflexion critique et favorisent la transmission immédiate."
      },
      {
        "questionId": "q5",
        "questionText": "Dans l'extrait de « Cauchemar en cuisine », comment la réalisation fabrique-t-elle une atmosphère d'urgence et de catastrophe permanente ?",
        "type": "qcm",
        "userAnswer": "Par un montage ultra-rapide, des zooms brutaux, des effets de cordes grinçantes et des bruitages de lames ou d'impacts métalliques.",
        "correctAnswer": "Par un montage ultra-rapide, des zooms brutaux, des effets de cordes grinçantes et des bruitages de lames ou d'impacts métalliques.",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "La télé-réalité utilise la grammaire du thriller (sound design oppressant, inserts saccadés, silences surjoués) pour transformer une p��ripétie banale en crise existentielle."
      },
      {
        "questionId": "q6",
        "questionText": "Quelle est la particularité fondamentale du dispositif documentaire de l'émission culte belge « Strip-Tease » dans l'épisode Scarface ?",
        "type": "qcm",
        "userAnswer": "L'absence totale de commentaire, d'interview dirigée et de musique d'illustration, laissant émerger le réel sans filtre prescriptif.",
        "correctAnswer": "L'absence totale de commentaire, d'interview dirigée et de musique d'illustration, laissant émerger le réel sans filtre prescriptif.",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "Strip-Tease applique le principe du cinéma direct : pas de voix-off moralisatrice, pas d'habillage musical imposé ; c'est au spectateur de construire son analyse critique du comportement des personnes filmées."
      },
      {
        "questionId": "q7",
        "questionText": "Dans l'extrait de télé-réalité « Arrête de te prendre pour Johnny », quel enjeu critique majeur d'éducation aux médias est soulevé concernant le traitement des participants ?",
        "type": "qcm",
        "userAnswer": "L'enfermement du sujet dans une caricature ridicule au détriment de sa dignité, transformant sa passion en objet de moquerie pour l'audimat.",
        "correctAnswer": "L'enfermement du sujet dans une caricature ridicule au détriment de sa dignité, transformant sa passion en objet de moquerie pour l'audimat.",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "L'EAM interroge l'éthique de la captation : la télé-réalité exploite souvent la naïveté ou la vulnérabilité de personnes réelles pour produire un spectacle condescendant à forte audience."
      },
      {
        "questionId": "q8",
        "questionText": "Dans les émissions de plateau comme celles présentées par Cyril Hanouna, quel est l'objectif poursuivi par la sur-polarisation et l'orchestration du « clash » en direct ?",
        "type": "qcm",
        "userAnswer": "Maximiser l'attention et l'engagement émotionnel du public par le spectacle de l'affrontement, quitte à dégrader la qualité du débat démocratique.",
        "correctAnswer": "Maximiser l'attention et l'engagement émotionnel du public par le spectacle de l'affrontement, quitte à dégrader la qualité du débat démocratique.",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "Le clash est un produit marchand : il génère du bruit sur les réseaux sociaux, des extraits viraux et fidélise une audience captive au détriment de l'argumentation rationnelle."
      },
      {
        "questionId": "q9",
        "questionText": "Dans l'émission « Images à l'appui » (reportage Fifi), comment la forme journalistique traite-t-elle les conflits locaux ou de voisinage ?",
        "type": "qcm",
        "userAnswer": "En dramatisant les faits par une narration mélodramatique, une posture de justicier et une division manichéenne (la victime innocente contre les coupables).",
        "correctAnswer": "En dramatisant les faits par une narration mélodramatique, une posture de justicier et une division manichéenne (la victime innocente contre les coupables).",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "L'émission adopte les codes du mélodrame de proximité : musique d'émotion, empathie surjouée, posture d'avocat des humbles pour capter l'attachement affectif du téléspectateur."
      },
      {
        "questionId": "q10",
        "questionText": "Dans le grand reportage sur l'industrialisation et la concentration des groupes de médias privés, quel risque démocratique majeur est identifié pour l'information citoyenne ?",
        "type": "qcm",
        "userAnswer": "La soumission de la ligne éditoriale aux intérêts économiques ou idéologiques du propriétaire du groupe, limitant le pluralisme et l'indépendance des rédactions.",
        "correctAnswer": "La soumission de la ligne éditoriale aux intérêts économiques ou idéologiques du propriétaire du groupe, limitant le pluralisme et l'indépendance des rédactions.",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "La concentration médiatique met en péril l'indépendance journalistique : lorsque quelques conglomérats détiennent chaînes, journaux et maisons d'édition, l'information risque de devenir un instrument d'influence privée."
      },
      {
        "questionId": "q11",
        "questionText": "Face à la prolifération de vidéos générées ou modifiées par IA (deepfakes), quel réflexe didactique de base devez-vous transmettre en priorité aux élèves ?",
        "type": "qcm",
        "userAnswer": "Appliquer le triptyque de vérification : rechercher la source première, inverser la recherche d'images et repérer les incohérences physiques (regards, mains, reflets, décalages audio).",
        "correctAnswer": "Appliquer le triptyque de vérification : rechercher la source première, inverser la recherche d'images et repérer les incohérences physiques (regards, mains, reflets, décalages audio).",
        "isCorrect": true,
        "points": 2,
        "maxPoints": 2,
        "explanation": "L'EAM ne doit pas conduire au complotisme ou au relativisme absolu, mais à une méthodologie critique outillée (recherche inversée, corroboration de sources fiables, examen des artefacts visuels)."
      },
      {
        "questionId": "q12",
        "questionText": "En classe de secondaire, comment utiliseriez-vous la confrontation photographique des investitures d'Obama (2009) et de Trump (2017) pour faire comprendre aux élèves le concept de « fait alternatif » sans transformer le cours en polémique politique partisane ?",
        "type": "open",
        "userAnswer": "/",
        "points": 0,
        "maxPoints": 4,
        "explanation": "L'enseignant place les élèves en posture de chercheurs méthodologiques : 1° Observer les deux clichés aériens pris à la même heure sous le même angle et noter les faits matériels bruts (densité au sol, gazon visible). 2° Lire la déclaration officielle parlant de 'la plus grande foule de l'histoire'. 3° Définir le concept de 'fait alternatif' : ce n'est pas une simple erreur de bonne foi, mais la substitution délibérée d'une évidence factuelle vérifiable par un récit politique affectif. L'objectif est d'analyser le procédé discursif et non d'émettre un jugement partisan.",
        "openFeedback": "Auto-évaluation sur base des critères du syllabus."
      },
      {
        "questionId": "q13",
        "questionText": "Comparez les intentions et les procédés techniques de mise en scène entre un épisode de « Cauchemar en cuisine » et un épisode de « Strip-Tease » (Scarface). Comment cette comparaison permet-elle d'éveiller l'esprit critique d'un apprenant face à la « télé-réalité » ?",
        "type": "open",
        "userAnswer": "Suivant le montage vidéo utilisé ainsi que les méthodes employés, les réalisateurs jouent avec nous et nos émotions en nous guidant vers du divertissement",
        "points": 3,
        "maxPoints": 4,
        "explanation": "D'un côté, 'Cauchemar en cuisine' sur-écrit le réel : le montage raccourcit le temps, les bruitages métalliques et musiques angoissantes prescrivent l'émotion que le spectateur doit ressentir à chaque seconde pour dramatiser l'enjeu commercial. De l'autre, 'Strip-Tease' adopte le cinéma direct : le temps est laissé au silence, aucun commentaire en voix-off ne juge les personnages, aucune musique n'oriente l'affect. Cette confrontation fait comprendre aux élèves que toute image filmée est un choix de fabrication et qu'un récit télévisuel n'est jamais la réalité brute, mais une reconstruction orientée.",
        "openFeedback": "Auto-évaluation sur base des critères du syllabus."
      },
      {
        "questionId": "q14",
        "questionText": "À partir des extraits de Cyril Hanouna et d'« Images à l'appui : Fifi », explicitez à de futurs enseignants en quoi le sensationnalisme s'oppose à la démarche d'information citoyenne. Quels sont les ressorts psychologiques et économiques exploités ?",
        "type": "open",
        "userAnswer": "Au plus on crée du divertissement, au plus, on rechigne sur les informations pertinentes. Car créer un contexte, une histoire peu favoriser la disparité des informations données. De manière plus simple, en voulant créer du divertissement, on ajoute des informations superflus au détriment des informations essentielles.",
        "points": 3,
        "maxPoints": 4,
        "explanation": "L'information citoyenne vise à éclairer le discernement du public par des faits vérifiés, la pluralité des perspectives, la contextualisation et la nuance. Le sensationnalisme (Hanouna, Images à l'appui) poursuit une finalité marchande d'audimat : il exploite des biais cognitifs (biais de négativité, besoin d'indignation morale, manichéisme bon/méchant) et met en scène le conflit en direct. En privilégiant l'émotion viscérale et le clash à l'analyse raisonnée, le sensationnalisme dégrade le débat démocratique en un spectacle de divertissement rentable.",
        "openFeedback": "Auto-évaluation sur base des critères du syllabus."
      },
      {
        "questionId": "q15",
        "questionText": "En analysant l'extrait « Arrête de te prendre pour Johnny », quelle réflexion éthique devez-vous mener avec des adolescents concernant l'exposition de personnes vulnérables dans les médias traditionnels et sur les réseaux sociaux (TikTok, Instagram, etc.) ?",
        "type": "open",
        "userAnswer": "On exploite certaines catégories de personnes (des personnes souvent vulnérables) afin de créer du divertissement autour d'eux. Puisqu'ils sont vulnérables, ils ne se rendent pas compte de ce qu'il leur arrive et qu'ils sont en réalité \"une bête de foire\"",
        "points": 3,
        "maxPoints": 4,
        "explanation": "L'extrait montre la fabrication d'une risée publique : la caméra valorise l'excentricité et l'intimité d'un individu passionné mais candide pour susciter la dérision d'un large public. Transposé aux réseaux sociaux actuels, ce phénomène est démultiplié (harcèlement en ligne, mèmes moqueurs, vidéos virales non consenties). En classe, l'enseignant doit faire réfléchir les élèves à la frontière entre liberté d'expression et respect de la dignité humaine, au consentement éclairé à l'image et aux conséquences psychologiques durables de la viralité humiliante.",
        "openFeedback": "Auto-évaluation sur base des critères du syllabus."
      },
      {
        "questionId": "q16",
        "questionText": "Proposez les 3 étapes d'un atelier pratique d'une heure que vous animeriez avec des élèves de 12 à 15 ans pour leur apprendre à vérifier une vidéo virale suspecte, en vous inspirant de la méthodologie de l'émission « Info ou Intox ».",
        "type": "open",
        "userAnswer": "- Vérifier l'auteur et la provenance\n- Chercher d'autres informations concernant le même sujet \n- établir un degré de certitude",
        "points": 3,
        "maxPoints": 4,
        "explanation": "Étape 1 - Doute méthodique et audit initial (15 min) : Les élèves visionnent une courte vidéo virale non vérifiée. Ils listent les indices visuels visibles (enseignes, langue parlée, météo, plaques d'immatriculation, anomalies de cadrage) et formulent une hypothèse. Étape 2 - Enquête outillée par binômes (25 min) : Utilisation d'outils simples de fact-checking (capture d'écran d'une image clé et recherche inversée sur Google Images/TinEye, consultation d'archives de presse ou de webcams publiques). Étape 3 - Restitution et institutionnalisation (20 min) : Chaque groupe expose ses preuves (vrai, faux ou trompeur) et l'enseignant formalise la règle d'or : 'Avant de partager, vérifier la source d'origine et le contexte temporel/géographique'.",
        "openFeedback": "Auto-évaluation sur base des critères du syllabus."
      }
    ],
    "evaluationType": "diagnostic"
  },
  {
    "id": "quiz-cloud-justin-01-1",
    "userEmail": "j.wasterlain@student.hech.be",
    "userName": "Justin Wasterlain",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 9,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 90,
    "submittedAt": "2026-09-22 14:35",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève démontre une habileté instrumentale mais manque de sens critique et de discernement éthique. Il prend la réponse générée pour une vérité absolue sans vérifier les sources.",
        "points": 3,
        "maxPoints": 4,
        "openFeedback": "Très bonne analyse des dimensions cognitives et de la posture critique."
      }
    ]
  },
  {
    "id": "quiz-demo-sarah",
    "userEmail": "sarah.dubois@student.hech.be",
    "userName": "Sarah Dubois",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-15 13:30",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève montre une bonne aisance opératoire mais une carence sur la dimension épistémique et éthique. Il prend l'outil pour une vérité absolue.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Analyse remarquable des dimensions cognitives et de la posture critique attendue au niveau M1."
      }
    ]
  },
  {
    "id": "quiz-demo-thomas",
    "userEmail": "thomas.bastien@student.hech.be",
    "userName": "Thomas Bastien",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-16 13:45",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève montre une bonne aisance opératoire mais une carence sur la dimension épistémique et éthique. Il prend l'outil pour une vérité absolue.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Analyse remarquable des dimensions cognitives et de la posture critique attendue au niveau M1."
      }
    ]
  },
  {
    "id": "quiz-cloud-3-maximelambertstudenthechbe",
    "userId": "",
    "userEmail": "maxime.lambert@student.hech.be",
    "userName": "Maxime Lambert",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 8,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 80,
    "submittedAt": "2026-09-16 12:10",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "Cet élève possède une habileté technique instrumentale (prompter et copier) mais manque de la dimension critique et de responsabilité du modèle DigComp.",
        "points": 2,
        "maxPoints": 4,
        "openFeedback": "Très bon repérage du triptyque outil/habileté/compétence. N'oubliez pas de proposer un dispositif de remédiation didactique."
      }
    ]
  },
  {
    "id": "quiz-cloud-272-nbatsstudenthechbe",
    "userId": "",
    "userEmail": "nbats@student.hech.be",
    "userName": "Nathalie Bats",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-28 12:00",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève démontre une habileté instrumentale mais manque de sens critique et de discernement éthique. Il prend la réponse générée pour une vérité absolue sans vérifier les sources.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Très bonne analyse des dimensions cognitives et de la posture critique."
      }
    ]
  },
  {
    "id": "quiz-cloud-334-nbatsstudenthechbe",
    "userId": "",
    "userEmail": "nbats@student.hech.be",
    "userName": "Nathalie Bats",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-28 10:00",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève démontre une habileté instrumentale mais manque de sens critique et de discernement éthique. Il prend la réponse générée pour une vérité absolue sans vérifier les sources.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Très bonne analyse des dimensions cognitives et de la posture critique."
      }
    ]
  },
  {
    "id": "quiz-cloud-360-nbatsstudenthechbe",
    "userId": "",
    "userEmail": "nbats@student.hech.be",
    "userName": "Nathalie Bats",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-28 08:00",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève démontre une habileté instrumentale mais manque de sens critique et de discernement éthique. Il prend la réponse générée pour une vérité absolue sans vérifier les sources.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Très bonne analyse des dimensions cognitives et de la posture critique."
      }
    ]
  },
  {
    "id": "quiz-cloud-373-nbatsstudenthechbe",
    "userId": "",
    "userEmail": "nbats@student.hech.be",
    "userName": "Nathalie Bats",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-28 06:00",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève démontre une habileté instrumentale mais manque de sens critique et de discernement éthique. Il prend la réponse générée pour une vérité absolue sans vérifier les sources.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Très bonne analyse des dimensions cognitives et de la posture critique."
      }
    ]
  },
  {
    "id": "quiz-cloud-412-nbatsstudenthechbe",
    "userId": "",
    "userEmail": "nbats@student.hech.be",
    "userName": "Nathalie Bats",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-28 04:00",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève démontre une habileté instrumentale mais manque de sens critique et de discernement éthique. Il prend la réponse générée pour une vérité absolue sans vérifier les sources.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Très bonne analyse des dimensions cognitives et de la posture critique."
      }
    ]
  },
  {
    "id": "quiz-cloud-425-nbatsstudenthechbe",
    "userId": "",
    "userEmail": "nbats@student.hech.be",
    "userName": "Nathalie Bats",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-28 02:00",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève démontre une habileté instrumentale mais manque de sens critique et de discernement éthique. Il prend la réponse générée pour une vérité absolue sans vérifier les sources.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Très bonne analyse des dimensions cognitives et de la posture critique."
      }
    ]
  },
  {
    "id": "quiz-cloud-438-nbatsstudenthechbe",
    "userId": "",
    "userEmail": "nbats@student.hech.be",
    "userName": "Nathalie Bats",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-28 00:00",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève démontre une habileté instrumentale mais manque de sens critique et de discernement éthique. Il prend la réponse générée pour une vérité absolue sans vérifier les sources.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Très bonne analyse des dimensions cognitives et de la posture critique."
      }
    ]
  },
  {
    "id": "quiz-cloud-451-nbatsstudenthechbe",
    "userId": "",
    "userEmail": "nbats@student.hech.be",
    "userName": "Nathalie Bats",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-27 22:00",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève démontre une habileté instrumentale mais manque de sens critique et de discernement éthique. Il prend la réponse générée pour une vérité absolue sans vérifier les sources.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Très bonne analyse des dimensions cognitives et de la posture critique."
      }
    ]
  },
  {
    "id": "quiz-cloud-468-nbatsstudenthechbe",
    "userId": "",
    "userEmail": "nbats@student.hech.be",
    "userName": "Nathalie Bats",
    "moduleId": "01-1",
    "quizId": "01-1",
    "moduleTitle": "1.1 Qu'est-ce qu'une compétence numérique ?",
    "score": 10,
    "totalPoints": 10,
    "totalQuestions": 10,
    "percentage": 100,
    "submittedAt": "2026-09-27 20:00",
    "evaluationType": "diagnostic",
    "answers": [
      {
        "questionId": "q1",
        "questionText": "Selon le cadre DigComp 2.2, qu'est-ce qui distingue une compétence numérique d'une simple habileté technique ?",
        "type": "qcm",
        "userAnswer": 2,
        "correctAnswer": 2,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "La compétence intègre la mobilisation critique, le jugement et l'action responsable en situation complexe."
      },
      {
        "questionId": "q2",
        "questionText": "Pourquoi dit-on que la compétence numérique est « située » ?",
        "type": "qcm",
        "userAnswer": 1,
        "correctAnswer": 1,
        "isCorrect": true,
        "points": 3,
        "maxPoints": 3,
        "explanation": "On ne peut évaluer la compétence hors contexte réel : elle dépend des objectifs et contraintes de la tâche."
      },
      {
        "questionId": "q3",
        "questionText": "En tant que futur enseignant, comment diagnostiquez-vous un élève qui copie-colle un texte d'une IA sans vérification ?",
        "type": "open",
        "userAnswer": "L'élève démontre une habileté instrumentale mais manque de sens critique et de discernement éthique. Il prend la réponse générée pour une vérité absolue sans vérifier les sources.",
        "points": 4,
        "maxPoints": 4,
        "openFeedback": "Très bonne analyse des dimensions cognitives et de la posture critique."
      }
    ]
  }
];

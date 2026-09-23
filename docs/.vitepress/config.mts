import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'

export default defineConfig({
  title: "Didactique du Numérique",
  titleTemplate: ":title | HECh",
  description: "Plateforme et notes de cours pour le Master 1 en Didactique du numérique (HECh / FWB)",
  base: "/Didactique-du-num-rique-M1-plateforme/",
  lang: "fr-FR",
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: [/\/documents\//],

  vite: {
    plugins: [
      {
        name: 'google-drive-backup-middleware',
        configureServer(server) {
          server.middlewares.use('/api/backup-exercise', async (req, res) => {
            if (req.method === 'POST') {
              let body = ''
              req.on('data', chunk => { body += chunk })
              req.on('end', () => {
                try {
                  const data = JSON.parse(body)
                  const driveDir = "C:\\Google Drive\\Prépas light\\HECh\\Péda\\Math-Num\\M1\\Didactique et numérique\\Exercices étudiants Plateforme"
                  if (!fs.existsSync(driveDir)) {
                    fs.mkdirSync(driveDir, { recursive: true })
                  }
                  // Création d'un sous-dossier dédié par nom d'étudiant
                  const rawStudent = data.studentName || data.userName || 'Etudiants'
                  const cleanStudentFolder = rawStudent.replace(/[/\\:*?"<>|]/g, '_').trim()
                  const studentDir = path.join(driveDir, cleanStudentFolder)
                  if (!fs.existsSync(studentDir)) {
                    fs.mkdirSync(studentDir, { recursive: true })
                  }

                  const fileName = data.fileName || `${cleanStudentFolder}_${data.exerciseId || 'Devoir'}.txt`
                  const targetPath = path.join(studentDir, fileName)

                  if (data.base64Data) {
                    const cleanBase64 = data.base64Data.includes(',') ? data.base64Data.split(',')[1] : data.base64Data
                    const buffer = Buffer.from(cleanBase64, 'base64')
                    fs.writeFileSync(targetPath, buffer)
                  } else if (data.content) {
                    fs.writeFileSync(targetPath, data.content, 'utf-8')
                  }

                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ status: 'success', path: targetPath }))
                } catch (e: any) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ status: 'error', message: e.message }))
                }
              })
            } else {
              res.statusCode = 405
              res.end()
            }
          })

          // Endpoint pour sauvegarder et charger les échéances directement sur le Google Drive et en local
          server.middlewares.use('/api/backup-deadlines', async (req, res) => {
            const driveDir = "C:\\Google Drive\\Prépas light\\HECh\\Péda\\Math-Num\\M1\\Didactique et numérique\\Exercices étudiants Plateforme"
            const localDataDir = path.join(process.cwd(), 'docs', '.vitepress', 'data')
            const driveDeadlinesFile = path.join(driveDir, 'deadlines.json')
            const localDeadlinesFile = path.join(localDataDir, 'deadlines.json')

            if (req.method === 'POST') {
              let body = ''
              req.on('data', chunk => { body += chunk })
              req.on('end', () => {
                try {
                  const data = JSON.parse(body)
                  const deadlinesData = data.deadlines || {}
                  const jsonStr = JSON.stringify(deadlinesData, null, 2)

                  // 1. Sauvegarde dans le Google Drive local
                  try {
                    if (!fs.existsSync(driveDir)) {
                      fs.mkdirSync(driveDir, { recursive: true })
                    }
                    fs.writeFileSync(driveDeadlinesFile, jsonStr, 'utf-8')
                  } catch (errDrive) {}

                  // 2. Sauvegarde de secours dans le projet local
                  try {
                    if (!fs.existsSync(localDataDir)) {
                      fs.mkdirSync(localDataDir, { recursive: true })
                    }
                    fs.writeFileSync(localDeadlinesFile, jsonStr, 'utf-8')
                  } catch (errLocal) {}

                  res.statusCode = 200
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ status: 'success', count: Object.keys(deadlinesData).length }))
                } catch (e: any) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'application/json')
                  res.end(JSON.stringify({ status: 'error', message: e.message }))
                }
              })
            } else if (req.method === 'GET') {
              try {
                let deadlines = {}
                if (fs.existsSync(driveDeadlinesFile)) {
                  deadlines = JSON.parse(fs.readFileSync(driveDeadlinesFile, 'utf-8'))
                } else if (fs.existsSync(localDeadlinesFile)) {
                  deadlines = JSON.parse(fs.readFileSync(localDeadlinesFile, 'utf-8'))
                }
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ status: 'success', deadlines }))
              } catch (e: any) {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ status: 'success', deadlines: {} }))
              }
            } else {
              res.statusCode = 405
              res.end()
            }
          })
        }
      }
    ]
  },

  head: [
    ['meta', { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' }],
    ['meta', { 'http-equiv': 'X-Frame-Options', content: 'SAMEORIGIN' }],
    ['meta', { 'http-equiv': 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }],
    ['meta', { 'http-equiv': 'Permissions-Policy', content: 'camera=(), microphone=(), geolocation=(), payment=()' }],
    ['meta', {
      'http-equiv': 'Content-Security-Policy',
      content: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; media-src 'self' data: blob: https://drive.google.com; frame-src 'self' https://drive.google.com https://docs.google.com; connect-src 'self' http://localhost:* http://127.0.0.1:* https:;"
    }],
    ['link', { rel: 'icon', type: 'image/png', href: '/images/logo-hech.png' }]
  ],

  themeConfig: {
    logo: '/images/logo-hech.png',
    siteTitle: "Didactique Numérique",

    nav: [
      { text: "Accueil", link: "/" },
      { text: "👤 Espace Membre", link: "/espace-membre" },
      { text: "Guide", link: "/guide/" },
      { text: "Tutoriels", link: "/tutos" },
      { text: "Ressources", link: "/ressources/" },
      { text: "🔒 Admin", link: "/admin" }
    ],

    sidebar: {
      '/modules/': [
        {
          text: "Navigation Principale",
          items: [
            { text: "🏠 Accueil du Cours", link: "/" },
            { text: "👤 Mon Espace Membre", link: "/espace-membre" }
          ]
        },
        {
          text: "1. Compétences Numériques",
          collapsed: false,
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/modules/01-competences-numeriques" },
            { text: "1.1 Qu'est-ce qu'une compétence numérique ?", link: "/modules/01-1-definition-digcomp" },
            { text: "1.2 Éducation aux médias & esprit critique", link: "/modules/01-2-education-aux-medias" }
          ]
        },
        {
          text: "2. Référentiel FMTTN (FWB)",
          collapsed: false,
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/modules/02-referentiel-fmttn" },
            { text: "2.1 Les quatre champs d'apprentissage", link: "/modules/02-1-quatre-champs" },
            { text: "2.2 Progression des apprentissages", link: "/modules/02-2-progression-apprentissages" },
            { text: "2.3 Progression spiralaire & littératie", link: "/modules/02-3-progression-spiralaire" }
          ]
        },
        {
          text: "3. Méthodologies Pédagogiques",
          collapsed: false,
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/modules/03-pedagogies-actives" },
            { text: "3.1 La Situation-Problème", link: "/modules/03-1-situation-probleme" },
            { text: "3.2 Apprentissage par projet", link: "/modules/03-2-pedagogie-projet" },
            { text: "3.3 Apprentissage par investigation", link: "/modules/03-3-investigation-enquete" },
            { text: "3.4 Le défi pédagogique", link: "/modules/03-4-defis-express" },
            { text: "3.5 Démarche de conception itérative", link: "/modules/03-5-iteration-erreur" },
            { text: "3.6 Expérientiel & Peer learning (42)", link: "/modules/03-6-peer-learning" },
            { text: "3.7 L'enseignement à distance", link: "/modules/03-7-enseignement-distance" }
          ]
        },
        {
          text: "4. Préparer un cours FMTTN",
          collapsed: false,
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/modules/04-preparation-lecon-fmttn" },
            { text: "4.1 Éléments indispensables d'une fiche", link: "/modules/04-3-fiche-preparation-type" },
            { text: "4.2 Triple concordance & Bloom", link: "/modules/04-2-taxonomie-bloom" },
            { text: "4.3 Assistant IA HECh & Copilote", link: "/modules/04-3-assistant-ia-hech" }
          ]
        },
        {
          text: "5. Évaluer un cours de numérique",
          collapsed: false,
          items: [
            { text: "🎯 Principes, Grilles & Postures", link: "/modules/evaluer-cours-numerique" }
          ]
        },
        {
          text: "6. Projet Jeu de Société",
          collapsed: false,
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/modules/05-projet-jeu-societe" },
            { text: "6.1 Ludopédagogie & Édumédias", link: "/modules/05-1-ludopedagogie-edumedias" },
            { text: "6.2 Créer les règles du jeu", link: "/modules/06-regles-du-jeu" },
            { text: "6.3 La photographie & composition", link: "/modules/07-photographie-image" },
            { text: "6.4 Créer les cartes & supports avec l'IA", link: "/modules/08-cartes-ia" },
            { text: "6.5 [En construction] Découpeuse laser", link: "/modules/09-prototypage-fablab" },
            { text: "6.6 [En construction] Imprimante 3D (Pions)", link: "/modules/09-pions-3d" },
            { text: "6.7 Concevoir une capsule vidéo", link: "/modules/10-capsule-video" },
            { text: "6.8 Tester et faire tester le jeu", link: "/modules/11-playtest-evaluation" },
            { text: "6.9 Présentation finale & Leçon FMTTN", link: "/modules/12-presentation-finale" }
          ]
        },
        {
          text: "7. Évaluation du cours",
          collapsed: false,
          items: [
            { text: "7. Évaluation & Auto-évaluation", link: "/modules/13-evaluation-cours" }
          ]
        }
      ],

      '/guide/': [
        {
          text: "Navigation",
          items: [
            { text: "🏠 Accueil du Cours", link: "/" },
            { text: "👤 Mon Espace Membre", link: "/espace-membre" }
          ]
        },
        {
          text: "Guide et évaluation du cours",
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/guide/" },
            { text: "Guide de la plateforme & de l'étudiant", link: "/guide/distanciel" },
            { text: "Modalités d'évaluation (sur 200 pts)", link: "/guide/evaluation" },
            { text: "🤖 Critères de correction par l'IA", link: "/guide/criteres-correction-ia" }
          ]
        }
      ],

      '/ressources/': [
        {
          text: "Navigation",
          items: [
            { text: "🏠 Accueil du Cours", link: "/" },
            { text: "👤 Mon Espace Membre", link: "/espace-membre" }
          ]
        },
        {
          text: "8. Ressources & Boîte à Outils",
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/ressources/" },
            { text: "8.1 Syllabus officiel du cours", link: "/ressources/syllabus" },
            { text: "8.2 Documents & Référentiels PDF", link: "/ressources/documents" },
            { text: "8.3 Bibliographie sélective (APA)", link: "/ressources/bibliographie" },
            { text: "8.4 Présentations PowerPoint", link: "/ressources/powerpoints" }
          ]
        }
      ]
    },

    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Rechercher...',
                buttonAriaLabel: 'Rechercher dans le cours'
              },
              modal: {
                noResultsText: 'Aucun résultat pour',
                resetButtonTitle: 'Effacer la recherche',
                footer: {
                  selectText: 'choisir',
                  navigateText: 'naviguer',
                  closeText: 'fermer'
                }
              }
            }
          }
        }
      }
    },

    footer: {
      message: "Master 1 - Didactique du numérique • Fédération Wallonie-Bruxelles",
      copyright: "Haute École Charlemagne (HECh) • Jérôme Foguenne"
    },

    docFooter: {
      prev: "Section précédente",
      next: "Section suivante"
    },

    outline: {
      level: [2, 3],
      label: "Sur cette page"
    }
  }
})

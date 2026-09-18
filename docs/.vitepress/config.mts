import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Didactique du Numérique",
  titleTemplate: ":title | HECh",
  description: "Plateforme et notes de cours pour le Master 1 en Didactique du numérique (HECh / FWB)",
  base: "/Didactique-du-num-rique-M1-plateforme/",
  lang: "fr-FR",
  cleanUrls: true,
  lastUpdated: true,

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
            { text: "6.1 Ludopédagogie & Édumédias", link: "/modules/05-projet-jeu-societe#5-1-une-methodologie-pedagogique-fondee-sur-l-experience-ludique" },
            { text: "6.2 Créer les règles du jeu", link: "/modules/06-regles-du-jeu" },
            { text: "6.3 La photographie & composition", link: "/modules/07-photographie-image" },
            { text: "6.4 Créer les cartes & supports avec l'IA", link: "/modules/08-cartes-ia" },
            { text: "6.5 [En construction] Découpeuse laser", link: "/modules/09-prototypage-fablab" },
            { text: "6.6 [En construction] Imprimante 3D (Pions)", link: "/modules/09-pions-3d" },
            { text: "6.7 Concevoir une capsule vidéo", link: "/modules/10-capsule-video" },
            { text: "6.8 Tester et faire tester le jeu", link: "/modules/11-playtest-evaluation" },
            { text: "6.9 Présentation finale & Leçon FMTTN", link: "/modules/12-presentation-finale" }
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
          text: "7. Guide & Évaluation",
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/guide/" },
            { text: "7.1 Guide de la plateforme & de l'étudiant", link: "/guide/distanciel" },
            { text: "7.2 Modalités d'évaluation (sur 200 pts)", link: "/guide/evaluation" }
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

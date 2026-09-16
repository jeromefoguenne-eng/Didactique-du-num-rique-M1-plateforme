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
      { text: "Exercices", link: "/ateliers/" },
      { text: "Guide", link: "/guide/" },
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
            { text: "1.1 Cadres : DigComp & CRCN", link: "/modules/01-1-definition-digcomp" },
            { text: "1.2 Éducation aux médias", link: "/modules/01-2-education-aux-medias" },
            { text: "1.3 Citoyenneté & RGPD", link: "/modules/01-3-citoyennete-ethique" },
            { text: "1.4 IA & Algorithmes", link: "/modules/01-4-ia-algorithmes" }
          ]
        },
        {
          text: "2. Référentiel FMTTN (FWB)",
          collapsed: false,
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/modules/02-referentiel-fmttn" },
            { text: "2.1 Les 4 champs du FMTTN", link: "/modules/02-1-quatre-champs" },
            { text: "2.2 Progression spiralaire", link: "/modules/02-2-progression-spiralaire" },
            { text: "2.3 Mathématiques & Numérique", link: "/modules/02-3-math-numerique" },
            { text: "2.4 Savoirs & Attendus", link: "/modules/02-4-savoirs-attendus" }
          ]
        },
        {
          text: "3. Méthodologies Pédagogiques",
          collapsed: false,
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/modules/03-pedagogies-actives" },
            { text: "3.1 La Situation-Problème", link: "/modules/03-1-situation-probleme" },
            { text: "3.2 Pédagogie par projet", link: "/modules/03-2-pedagogie-projet" },
            { text: "3.3 Démarche d'investigation", link: "/modules/03-3-investigation-enquete" },
            { text: "3.4 Défis express (20 min)", link: "/modules/03-4-defis-express" },
            { text: "3.5 Démarche itérative & Erreur", link: "/modules/03-5-iteration-erreur" }
          ]
        },
        {
          text: "4. Préparer une Leçon FMTTN",
          collapsed: false,
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/modules/04-preparation-lecon-fmttn" },
            { text: "4.1 Triple concordance", link: "/modules/04-1-triple-concordance" },
            { text: "4.2 Taxonomie de Bloom", link: "/modules/04-2-taxonomie-bloom" },
            { text: "4.3 Fiche de préparation type", link: "/modules/04-3-fiche-preparation-type" },
            { text: "4.4 Assistant IA HECh & Prompts", link: "/modules/04-4-assistant-ia-hech" }
          ]
        },
        {
          text: "5. Projet Jeu de Société",
          collapsed: false,
          items: [
            { text: "📌 Vue d'ensemble (Hub)", link: "/modules/05-projet-jeu-societe" },
            { text: "5.2 Règles & Mécaniques", link: "/modules/06-regles-du-jeu" },
            { text: "5.3 Photographie & Graphisme", link: "/modules/07-photographie-image" },
            { text: "5.4 [Jalon] Cartes & IA", link: "/modules/08-cartes-ia" },
            { text: "5.5 [Jalon] FabLab (Laser/3D)", link: "/modules/09-prototypage-fablab" },
            { text: "5.6 Capsule Vidéo Promo", link: "/modules/10-capsule-video" },
            { text: "5.7 [Jalon] Playtest & Retours", link: "/modules/11-playtest-evaluation" }
          ]
        }
      ],

      '/ateliers/': [
        {
          text: "Navigation",
          items: [
            { text: "🏠 Accueil du Cours", link: "/" },
            { text: "👤 Mon Espace Membre", link: "/espace-membre" }
          ]
        },
        {
          text: "6. Exercices & Défis Pratiques",
          items: [
            { text: "📌 Vue d'ensemble des ateliers", link: "/ateliers/" },
            { text: "Atelier 1 : Diagnostic compétences", link: "/ateliers/exercice-01" },
            { text: "Atelier 2 : Évaluer une information", link: "/ateliers/exercice-02" },
            { text: "Atelier 3 : Guide collaboratif élèves", link: "/ateliers/exercice-03" },
            { text: "Atelier 4 : Escape Game FMTTN", link: "/ateliers/exercice-04" },
            { text: "Atelier 5 : Défi Canva mot de passe", link: "/ateliers/exercice-05" },
            { text: "Atelier 6 : Défi Hardware PC", link: "/ateliers/exercice-06" },
            { text: "Atelier 7 : Capsule vidéo du jeu", link: "/ateliers/exercice-video" }
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
            { text: "7.1 Guide de l'étudiant à distance", link: "/guide/distanciel" },
            { text: "7.2 Modalités d'évaluation & Grille", link: "/guide/evaluation" }
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
            { text: "8.1 Documents & Référentiels PDF", link: "/ressources/documents" },
            { text: "8.2 Bibliographie sélective (APA)", link: "/ressources/bibliographie" }
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

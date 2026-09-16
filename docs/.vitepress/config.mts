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
      { text: "Ateliers", link: "/ateliers/" },
      { text: "Ressources", link: "/ressources/documents" }
    ],

    sidebar: {
      '/modules/': [
        {
          text: "Navigation",
          items: [
            { text: "🏠 Accueil (Toutes les tuiles)", link: "/" }
          ]
        },
        {
          text: "1. Compétences & Esprit Critique",
          items: [
            { text: "Compétences numériques & Édumédias", link: "/modules/01-competences-numeriques" }
          ]
        },
        {
          text: "2. Référentiel FMTTN (FWB)",
          items: [
            { text: "Les 4 champs & Progression spiralaire", link: "/modules/02-referentiel-fmttn" }
          ]
        },
        {
          text: "3. Méthodologies Actives",
          items: [
            { text: "Projet, investigation, défi, itération", link: "/modules/03-pedagogies-actives" }
          ]
        },
        {
          text: "4. Préparer une Leçon FMTTN",
          items: [
            { text: "Triple concordance & Bloom appliqué", link: "/modules/04-preparation-lecon-fmttn" }
          ]
        },
        {
          text: "5. Projet FabLab : Jeu de Société",
          items: [
            { text: "Concept du jeu & Ludopédagogie", link: "/modules/05-projet-jeu-societe" },
            { text: "Règles & Mécanique du jeu", link: "/modules/06-regles-du-jeu" },
            { text: "Photographie, image & droit", link: "/modules/07-photographie-image" },
            { text: "[Jalon] Cartes de jeu & IA", link: "/modules/08-cartes-ia" },
            { text: "[Jalon] FabLab (Laser & 3D)", link: "/modules/09-prototypage-fablab" },
            { text: "Capsule vidéo du jeu", link: "/modules/10-capsule-video" },
            { text: "[Jalon] Playtest & Retours", link: "/modules/11-playtest-evaluation" }
          ]
        }
      ],

      '/ateliers/': [
        {
          text: "Navigation",
          items: [
            { text: "🏠 Accueil (Toutes les tuiles)", link: "/" }
          ]
        },
        {
          text: "Ateliers & Défis Pratiques",
          items: [
            { text: "Vue d'ensemble des ateliers", link: "/ateliers/" },
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
            { text: "🏠 Accueil (Toutes les tuiles)", link: "/" }
          ]
        },
        {
          text: "Accompagnement & Évaluation",
          items: [
            { text: "Guide de l'étudiant à distance", link: "/guide/distanciel" },
            { text: "Modalités d'évaluation & Grille", link: "/guide/evaluation" }
          ]
        }
      ],

      '/ressources/': [
        {
          text: "Navigation",
          items: [
            { text: "🏠 Accueil (Toutes les tuiles)", link: "/" }
          ]
        },
        {
          text: "Ressources & Boîte à Outils",
          items: [
            { text: "Documents & Référentiels PDF", link: "/ressources/documents" },
            { text: "Bibliographie sélective (APA)", link: "/ressources/bibliographie" }
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

    docFooter: {
      prev: 'Section précédente',
      next: 'Section suivante'
    },

    outline: {
      level: [2, 3],
      label: 'Sur cette page'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/jeromefoguenne-eng/Didactique-du-num-rique-M1-plateforme' }
    ],

    footer: {
      message: 'Master 1 en Pédagogie / Math-Numérique — Haute École Charlemagne (HECh)',
      copyright: 'Jérôme Foguenne © 2026 — Licence CC BY-NC-SA 4.0'
    }
  }
})

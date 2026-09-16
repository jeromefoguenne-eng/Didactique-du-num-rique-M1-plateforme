import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Didactique du Numérique",
  titleTemplate: ":title | Didactique Numérique M1 (HECh)",
  description: "Tableau de bord modulaire et notes de cours enrichies pour le Master 1 (HECh / FWB)",
  base: "/Didactique-du-num-rique-M1-plateforme/",
  lang: "fr-FR",
  cleanUrls: true,
  lastUpdated: true,

  themeConfig: {
    logo: { text: "🎓 M1 DidacNum" },
    siteTitle: "Didactique du Numérique M1",

    nav: [
      { text: "🏠 Tableau de bord", link: "/" },
      { text: "🧭 1. Fondements & IA", link: "/modules/01-competences-numeriques" },
      { text: "📜 2. Référentiel FMTTN", link: "/modules/02-referentiel-fmttn" },
      { text: "🛠️ 3. Méthodologies", link: "/modules/03-pedagogies-actives" },
      { text: "📝 4. Préparer une Leçon", link: "/modules/04-preparation-lecon-fmttn" },
      { text: "🎲 5. Projet FabLab", link: "/modules/05-projet-jeu-societe" },
      { text: "✏️ 6. Ateliers Pratiques", link: "/ateliers/" },
      { 
        text: "Plus...",
        items: [
          { text: "🎓 7. Guide & Évaluation", link: "/guide/distanciel" },
          { text: "📚 8. Ressources & Téléchargements", link: "/ressources/documents" },
          { text: "📖 Bibliographie sélective (APA)", link: "/ressources/bibliographie" },
          { text: "💡 Introduction philosophique IA", link: "/modules/00-introduction-ia-ethique" }
        ]
      }
    ],

    sidebar: {
      '/modules/': [
        {
          text: "🗂️ Les 8 Pôles du Cours",
          items: [
            { text: "🏠 Retour au tableau de bord", link: "/" }
          ]
        },
        {
          text: "🧭 1. Fondements & Esprit Critique",
          items: [
            { text: "00. Penser l'IA & Éthique (Alombert)", link: "/modules/00-introduction-ia-ethique" },
            { text: "01. Compétences numériques & Édumédias", link: "/modules/01-competences-numeriques" }
          ]
        },
        {
          text: "📜 2. Référentiel FMTTN (FWB)",
          items: [
            { text: "02. Les 4 champs & Progression spiralaire", link: "/modules/02-referentiel-fmttn" }
          ]
        },
        {
          text: "🛠️ 3. Didactique & Méthodologies Actives",
          items: [
            { text: "03. Enseigner : Projet, investigation, défi", link: "/modules/03-pedagogies-actives" }
          ]
        },
        {
          text: "📝 4. Préparer une Leçon FMTTN",
          items: [
            { text: "04. Triple concordance & Bloom révisé", link: "/modules/04-preparation-lecon-fmttn" }
          ]
        },
        {
          text: "🎲 5. Projet FabLab : Jeu de Société",
          items: [
            { text: "05. Ludopédagogie & Édumédias", link: "/modules/05-projet-jeu-societe" },
            { text: "06. Mécanique & Règles du jeu", link: "/modules/06-regles-du-jeu" },
            { text: "07. Photographie, image & droit", link: "/modules/07-photographie-image" },
            { text: "08. [Jalon] Cartes de jeu & IA", link: "/modules/08-cartes-ia" },
            { text: "09. [Jalon] FabLab (Laser & 3D)", link: "/modules/09-prototypage-fablab" },
            { text: "10. Capsule vidéo du jeu", link: "/modules/10-capsule-video" },
            { text: "11. [Jalon] Playtest & Évaluation", link: "/modules/11-playtest-evaluation" }
          ]
        }
      ],

      '/ateliers/': [
        {
          text: "✏️ Espace Ateliers & Corrigés",
          items: [
            { text: "🏠 Retour au tableau de bord", link: "/" },
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
          text: "🎓 Accompagnement & Évaluation",
          items: [
            { text: "🏠 Retour au tableau de bord", link: "/" },
            { text: "Guide de l'étudiant à distance", link: "/guide/distanciel" },
            { text: "Modalités d'évaluation & Grille", link: "/guide/evaluation" }
          ]
        }
      ],

      '/ressources/': [
        {
          text: "📚 Ressources & Boîte à Outils",
          items: [
            { text: "🏠 Retour au tableau de bord", link: "/" },
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
                buttonText: 'Rechercher dans le cours...',
                buttonAriaLabel: 'Rechercher'
              },
              modal: {
                noResultsText: 'Aucun résultat trouvé pour',
                resetButtonTitle: 'Effacer la recherche',
                footer: {
                  selectText: 'pour choisir',
                  navigateText: 'pour naviguer',
                  closeText: 'pour fermer'
                }
              }
            }
          }
        }
      }
    },

    docFooter: {
      prev: 'Pôle précédent',
      next: 'Pôle suivant'
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

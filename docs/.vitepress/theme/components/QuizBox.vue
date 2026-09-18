<script setup>
import { ref, computed, onMounted } from 'vue'
import { userStore } from '../stores/userStore'

const props = defineProps({
  moduleId: {
    type: String,
    required: true
  },
  moduleTitle: {
    type: String,
    default: ''
  },
  customQuestions: {
    type: Array,
    default: null
  }
})

// Base de questions par défaut intégrées pour chaque module
const MODULE_QUESTIONS = {
  '01-1': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Triptyque de la compétence (DigComp 2.2)",
      text: "Selon le cadre européen DigComp 2.2, qu'est-ce qui distingue une véritable compétence numérique d'une simple habileté technique ?",
      options: [
        "La maîtrise rapide de tous les raccourcis clavier d'un traitement de texte.",
        "La capacité à mobiliser de façon critique, réfléchie et responsable ses habiletés et connaissances pour répondre à une situation complexe.",
        "La possession d'un équipement matériel haut de gamme (tablette, ordinateur portable).",
        "La capacité à installer des logiciels sans l'aide d'un administrateur réseau."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "DigComp dépasse la simple habileté opératoire en exigeant le jugement critique, l'adaptation et la responsabilité éthique face aux technologies."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. La compétence « située »",
      text: "Pourquoi affirme-t-on en didactique que la compétence numérique est « située » ?",
      options: [
        "Parce qu'elle dépend obligatoirement de la localisation GPS de la salle de classe.",
        "Parce qu'elle n'existe pas dans le vide : son efficacité s'évalue toujours en fonction d'un contexte, d'un public et d'une intention précise.",
        "Parce qu'elle est réservée aux établissements scolaires connectés à la fibre optique.",
        "Parce qu'elle se mesure uniquement au nombre de clics nécessaires pour exécuter une tâche."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Une personne n'est pas compétente dans l'absolu : savoir créer un diaporama n'a de valeur didactique que si les contenus et choix visuels répondent aux besoins du public cible."
    },
    {
      id: 'q3',
      type: 'open',
      title: "3. Analyse diagnostique d'un cas élève (Question réflexive)",
      text: "Dans votre classe, Sarah utilise quotidiennement ChatGPT pour rédiger ses travaux. Elle recopie les réponses sans vérifier les sources et déclare : « C'est l'IA qui l'a rédigé, donc c'est exact. » En vous appuyant sur la distinction entre outil, habileté et compétence, posez un diagnostic didactique et formulez une piste concrète de remédiation.",
      points: 4,
      modelAnswer: "Sarah possède une habileté instrumentale évidente (saisie de prompt, copie de texte), mais fait preuve d'une lacune majeure sur la dimension critique et la responsabilité épistémique (croyance en la véracité absolue de la machine). En tant qu'enseignant, la remédiation consiste à lui faire mener une activité de « fact-checking » : identifier des hallucinations de l'IA, remonter aux sources primaires sur Google Scholar ou dans des ouvrages physiques, et expliciter les limites probabilistes des modèles de langage.",
      rubricCriteria: [
        "Distinction explicite entre habileté technique (prompter) et compétence critique (vérifier).",
        "Identification de la carence épistémique / manque de responsabilité critique.",
        "Proposition d'un dispositif d'apprentissage ou de vérification croisée des sources."
      ]
    }
  ],
  '01-2': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Post-vérité et communication politique (Cas des investitures 2009 vs 2017)",
      text: "Dans le concept de « post-vérité » illustré par la comparaison photographique des foules entre Obama (2009) et Trump (2017), quelle est la caractéristique centrale du discours médiatique ?",
      options: [
        "L'utilisation exclusive de caméras à très haute résolution pour compter les personnes.",
        "Le fait que les faits objectifs et vérifiables ont moins d'influence que les récits faisant appel à l'émotion et aux croyances personnelles (« faits alternatifs »).",
        "L'interdiction légale de diffuser des photographies aériennes lors des cérémonies d'État.",
        "L'absence totale de journalistes sur place le jour de l'investiture."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "La post-vérité se caractérise par la primauté accordée à l'émotion et à l'affirmation identitaire sur l'évidence factuelle et matérielle (création délibérée de vérités alternatives)."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Théorie du complot et montage vidéo (Cas de l'extrait « Secret Dieu »)",
      text: "Dans les vidéos conspirationnistes comme celle illustrée par « Secret Dieu », quel procédé technique de réalisation est systématiquement mobilisé pour convaincre le spectateur d'un complot ?",
      options: [
        "La présentation exhaustive et neutre de toutes les sources scientifiques contradictoires.",
        "L'association arbitraire d'images disparates liée par une voix mystérieuse, une musique anxiogène et l'illusion d'une causalité cachée.",
        "Le refus délibéré d'utiliser des images d'archives ou des ralentis.",
        "L'absence totale de musique ou d'effets sonores afin de laisser le spectateur juger en silence."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Les vidéos complotistes fabriquent un faux sentiment de révélation en associant des symboles et des images sorties de leur contexte à grand renfort d'ambiances sonores dramatisées."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. Fact-checking et manipulation visuelle (Cas France 24 « Info ou Intox » : Zelensky)",
      text: "Dans la chronique « Info ou Intox » de France 24 analysant la prétendue publicité anti-Zelensky à New York, quelle a été la démarche journalistique décisive pour prouver l'intox ?",
      options: [
        "Se fier aux commentaires anonymes sous la vidéo virale sur Twitter/X.",
        "Interroger la régie publicitaire locale, analyser la météo, la circulation réelle et les caméras fixes en direct de Times Square.",
        "Interdire aux citoyens américains de filmer les panneaux d'affichage urbains.",
        "Attendre un communiqué officiel de l'ONU avant de regarder la vidéo."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Le fact-checking rigoureux croise les indices matériels (météo, webcam de circulation en direct) et contacte les gestionnaires officiels de l'espace publicitaire pour authentifier la réalité de la diffusion."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. Mécanisme de la rumeur et viralité numérique",
      text: "Dans le reportage « Post-vérité et théorie du complot : la vérité en danger sur Internet », pourquoi une fausse information circule-t-elle généralement plus vite qu'un démenti ?",
      options: [
        "Parce que les câbles de télécommunication sous-marins privilégient les faux fichiers.",
        "Parce qu'elle suscite des émotions vives (indignation, surprise, peur) qui stimulent le partage instantané, alors que la vérification demande du temps et de l'effort cognitif.",
        "Parce que les journalistes professionnels sont absents d'Internet.",
        "Parce que les démentis sont écrits uniquement en latin."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "La viralité repose sur la charge émotionnelle : l'indignation et la stupéfaction court-circuitent la réflexion critique et favorisent la transmission immédiate."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. Mise en scène de la réalité (Cas de « Cauchemar en cuisine »)",
      text: "Dans l'extrait de « Cauchemar en cuisine », comment la réalisation fabrique-t-elle une atmosphère d'urgence et de catastrophe permanente ?",
      options: [
        "En filmant en plan-séquence continu sans coupure pendant 45 minutes.",
        "Par un montage ultra-rapide, des zooms brutaux, des effets de cordes grinçantes et des bruitages de lames ou d'impacts métalliques.",
        "En diffusant uniquement des voix douces et apaisantes pour rassurer les restaurateurs.",
        "En demandant aux clients de lire des poèmes à voix haute."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "La télé-réalité utilise la grammaire du thriller (sound design oppressant, inserts saccadés, silences surjoués) pour transformer une péripétie banale en crise existentielle."
    },
    {
      id: 'q6',
      type: 'qcm',
      title: "6. Dispositif du cinéma direct (Cas de « Strip-Tease : Scarface »)",
      text: "Quelle est la particularité fondamentale du dispositif documentaire de l'émission culte belge « Strip-Tease » dans l'épisode Scarface ?",
      options: [
        "Une voix-off omniprésente qui dicte en permanence au spectateur ce qu'il doit penser.",
        "L'absence totale de commentaire, d'interview dirigée et de musique d'illustration, laissant émerger le réel sans filtre prescriptif.",
        "L'utilisation de comédiens professionnels payés par la RTBF.",
        "Le floutage intégral de tous les protagonistes."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Strip-Tease applique le principe du cinéma direct : pas de voix-off moralisatrice, pas d'habillage musical imposé ; c'est au spectateur de construire son analyse critique du comportement des personnes filmées."
    },
    {
      id: 'q7',
      type: 'qcm',
      title: "7. Éthique et stéréotypes télévisuels (Cas de « Arrête de te prendre pour Johnny »)",
      text: "Dans l'extrait de télé-réalité « Arrête de te prendre pour Johnny », quel enjeu critique majeur d'éducation aux médias est soulevé concernant le traitement des participants ?",
      options: [
        "Le volume sonore des amplificateurs de guitare électrique.",
        "L'enfermement du sujet dans une caricature ridicule au détriment de sa dignité, transformant sa passion en objet de moquerie pour l'audimat.",
        "La météo pluvieuse le jour du tournage en région liégeoise.",
        "L'absence de licence officielle de la maison de disque de Johnny Hallyday."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "L'EAM interroge l'éthique de la captation : la télé-réalité exploite souvent la naïveté ou la vulnérabilité de personnes réelles pour produire un spectacle condescendant à forte audience."
    },
    {
      id: 'q8',
      type: 'qcm',
      title: "8. Mécanique du clash et débat d'opinion (Cas Cyril Hanouna / TPMP)",
      text: "Dans les émissions de plateau comme celles présentées par Cyril Hanouna, quel est l'objectif poursuivi par la sur-polarisation et l'orchestration du « clash » en direct ?",
      options: [
        "Permettre une synthèse scientifique consensuelle et apaisée entre experts reconnus.",
        "Maximiser l'attention et l'engagement émotionnel du public par le spectacle de l'affrontement, quitte à dégrader la qualité du débat démocratique.",
        "Enseigner la grammaire française avancée aux téléspectateurs.",
        "Présenter des rapports statistiques vérifiés par l'institut national de la statistique."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Le clash est un produit marchand : il génère du bruit sur les réseaux sociaux, des extraits viraux et fidélise une audience captive au détriment de l'argumentation rationnelle."
    },
    {
      id: 'q9',
      type: 'qcm',
      title: "9. Sensationnalisme de proximité (Cas « Images à l'appui : Fifi »)",
      text: "Dans l'émission « Images à l'appui » (reportage Fifi), comment la forme journalistique traite-t-elle les conflits locaux ou de voisinage ?",
      options: [
        "Sous l'angle d'une sociologie rigoureuse sans jamais nommer les protagonistes.",
        "En dramatisant les faits par une narration mélodramatique, une posture de justicier et une division manichéenne (la victime innocente contre les coupables).",
        "En faisant appel à un tribunal arbitral officiel de droit civil.",
        "En refusant de diffuser la moindre image de conflit."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "L'émission adopte les codes du mélodrame de proximité : musique d'émotion, empathie surjouée, posture d'avocat des humbles pour capter l'attachement affectif du téléspectateur."
    },
    {
      id: 'q10',
      type: 'qcm',
      title: "10. Concentration des médias et dépendance économique (Cas de la « Bollorisation »)",
      text: "Dans le grand reportage sur l'industrialisation et la concentration des groupes de médias privés, quel risque démocratique majeur est identifié pour l'information citoyenne ?",
      options: [
        "Le manque d'écrans de télévision dans les foyers modestes.",
        "La soumission de la ligne éditoriale aux intérêts économiques ou idéologiques du propriétaire du groupe, limitant le pluralisme et l'indépendance des rédactions.",
        "L'obligation de ne diffuser que des documentaires animaliers en noir et blanc.",
        "Le remplacement des journalistes par des présentateurs météo sous-payés."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "La concentration médiatique met en péril l'indépendance journalistique : lorsque quelques conglomérats détiennent chaînes, journaux et maisons d'édition, l'information risque de devenir un instrument d'influence privée."
    },
    {
      id: 'q11',
      type: 'qcm',
      title: "11. Vérification des vidéos et intelligence artificielle générative",
      text: "Face à la prolifération de vidéos générées ou modifiées par IA (deepfakes), quel réflexe didactique de base devez-vous transmettre en priorité aux élèves ?",
      options: [
        "Considérer que tout document vidéo est automatiquement un faux et ne plus jamais regarder les informations.",
        "Appliquer le triptyque de vérification : rechercher la source première, inverser la recherche d'images et repérer les incohérences physiques (regards, mains, reflets, décalages audio).",
        "Croire uniquement les vidéos qui dépassent un million de partages sur TikTok.",
        "Demander à l'auteur de la vidéo par message privé s'il a menti."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "L'EAM ne doit pas conduire au complotisme ou au relativisme absolu, mais à une méthodologie critique outillée (recherche inversée, corroboration de sources fiables, examen des artefacts visuels)."
    },
    {
      id: 'q12',
      type: 'open',
      title: "12. Didactique de la post-vérité (Cas pratique : Les foules d'Obama vs Trump)",
      text: "En classe de secondaire, comment utiliseriez-vous la confrontation photographique des investitures d'Obama (2009) et de Trump (2017) pour faire comprendre aux élèves le concept de « fait alternatif » sans transformer le cours en polémique politique partisane ?",
      points: 4,
      modelAnswer: "L'enseignant place les élèves en posture de chercheurs méthodologiques : 1° Observer les deux clichés aériens pris à la même heure sous le même angle et noter les faits matériels bruts (densité au sol, gazon visible). 2° Lire la déclaration officielle parlant de 'la plus grande foule de l'histoire'. 3° Définir le concept de 'fait alternatif' : ce n'est pas une simple erreur de bonne foi, mais la substitution délibérée d'une évidence factuelle vérifiable par un récit politique affectif. L'objectif est d'analyser le procédé discursif et non d'émettre un jugement partisan.",
      rubricCriteria: [
        "Méthode d'observation comparative fondée sur des indices matériels neutres (angles, horaires, espaces vides).",
        "Définition précise du 'fait alternatif' et de la post-vérité (primauté de l'affect sur la preuve).",
        "Neutralité pédagogique et centration sur les compétences d'analyse critique de l'élève."
      ]
    },
    {
      id: 'q13',
      type: 'open',
      title: "13. Analyse des procédés de réalisation : « Cauchemar en cuisine » vs « Strip-Tease »",
      text: "Comparez les intentions et les procédés techniques de mise en scène entre un épisode de « Cauchemar en cuisine » et un épisode de « Strip-Tease » (Scarface). Comment cette comparaison permet-elle d'éveiller l'esprit critique d'un apprenant face à la « télé-réalité » ?",
      points: 4,
      modelAnswer: "D'un côté, 'Cauchemar en cuisine' sur-écrit le réel : le montage raccourcit le temps, les bruitages métalliques et musiques angoissantes prescrivent l'émotion que le spectateur doit ressentir à chaque seconde pour dramatiser l'enjeu commercial. De l'autre, 'Strip-Tease' adopte le cinéma direct : le temps est laissé au silence, aucun commentaire en voix-off ne juge les personnages, aucune musique n'oriente l'affect. Cette confrontation fait comprendre aux élèves que toute image filmée est un choix de fabrication et qu'un récit télévisuel n'est jamais la réalité brute, mais une reconstruction orientée.",
      rubricCriteria: [
        "Repérage explicite des choix formels de Cauchemar en cuisine (sonorisation, sur-découpage, dramatisation).",
        "Caractérisation du dispositif de Strip-Tease (cinéma direct, absence de voix-off, posture d'observation).",
        "Déduction didactique : la 'réalité' télévisuelle est toujours une construction médiatique orientée."
      ]
    },
    {
      id: 'q14',
      type: 'open',
      title: "14. Déconstruction du sensationnalisme et du « clash » (Cyril Hanouna & Images à l'appui)",
      text: "À partir des extraits de Cyril Hanouna et d'« Images à l'appui : Fifi », explicitez à de futurs enseignants en quoi le sensationnalisme s'oppose à la démarche d'information citoyenne. Quels sont les ressorts psychologiques et économiques exploités ?",
      points: 4,
      modelAnswer: "L'information citoyenne vise à éclairer le discernement du public par des faits vérifiés, la pluralité des perspectives, la contextualisation et la nuance. Le sensationnalisme (Hanouna, Images à l'appui) poursuit une finalité marchande d'audimat : il exploite des biais cognitifs (biais de négativité, besoin d'indignation morale, manichéisme bon/méchant) et met en scène le conflit en direct. En privilégiant l'émotion viscérale et le clash à l'analyse raisonnée, le sensationnalisme dégrade le débat démocratique en un spectacle de divertissement rentable.",
      rubricCriteria: [
        "Opposition claire entre démarche d'information éclairée et logique marchande de captation d'audience.",
        "Identification des ressorts psychologiques (polarisation, indignation, simplification manichéenne).",
        "Conséquence civique : affaiblissement du recul critique et du débat démocratique argumenté."
      ]
    },
    {
      id: 'q15',
      type: 'open',
      title: "15. Éthique, respect de la personne et réseaux sociaux (« Arrête de te prendre pour Johnny »)",
      text: "En analysant l'extrait « Arrête de te prendre pour Johnny », quelle réflexion éthique devez-vous mener avec des adolescents concernant l'exposition de personnes vulnérables dans les médias traditionnels et sur les réseaux sociaux (TikTok, Instagram, etc.) ?",
      points: 4,
      modelAnswer: "L'extrait montre la fabrication d'une risée publique : la caméra valorise l'excentricité et l'intimité d'un individu passionné mais candide pour susciter la dérision d'un large public. Transposé aux réseaux sociaux actuels, ce phénomène est démultiplié (harcèlement en ligne, mèmes moqueurs, vidéos virales non consenties). En classe, l'enseignant doit faire réfléchir les élèves à la frontière entre liberté d'expression et respect de la dignité humaine, au consentement éclairé à l'image et aux conséquences psychologiques durables de la viralité humiliante.",
      rubricCriteria: [
        "Analyse de la mise en spectacle de la naïveté ou vulnérabilité du sujet filmé.",
        "Pont direct vers les usages numériques des jeunes (cyberharcèlement, viralité moqueuse, partage sans consentement).",
        "Sensibilisation au respect de la dignité, à la responsabilité civique et à la législation sur le droit à l'image."
      ]
    },
    {
      id: 'q16',
      type: 'open',
      title: "16. Scénario pédagogique de Fact-checking en classe (Inspiré de France 24 « Info ou Intox »)",
      text: "Proposez les 3 étapes d'un atelier pratique d'une heure que vous animeriez avec des élèves de 12 à 15 ans pour leur apprendre à vérifier une vidéo virale suspecte, en vous inspirant de la méthodologie de l'émission « Info ou Intox ».",
      points: 4,
      modelAnswer: "Étape 1 - Doute méthodique et audit initial (15 min) : Les élèves visionnent une courte vidéo virale non vérifiée. Ils listent les indices visuels visibles (enseignes, langue parlée, météo, plaques d'immatriculation, anomalies de cadrage) et formulent une hypothèse. Étape 2 - Enquête outillée par binômes (25 min) : Utilisation d'outils simples de fact-checking (capture d'écran d'une image clé et recherche inversée sur Google Images/TinEye, consultation d'archives de presse ou de webcams publiques). Étape 3 - Restitution et institutionnalisation (20 min) : Chaque groupe expose ses preuves (vrai, faux ou trompeur) et l'enseignant formalise la règle d'or : 'Avant de partager, vérifier la source d'origine et le contexte temporel/géographique'.",
      rubricCriteria: [
        "Étape 1 : Observation indiciaire concrète (repérage d'indices spatio-temporels dans la vidéo).",
        "Étape 2 : Recours à des outils réels de vérification (recherche inversée d'images, recoupement documentaire).",
        "Étape 3 : Institutionnalisation méthodologique et règle de conduite civique face au partage."
      ]
    }
  ],
  '02-1': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Les quatre champs du Référentiel FMTTN",
      text: "Quel champ du référentiel FMTTN prend spécifiquement en charge la décomposition de problèmes et la pensée algorithmique ?",
      options: [
        "Champ 1 : Usages et outils numériques de base",
        "Champ 2 : Médias et communication numérique",
        "Champ 3 : Programmation et pensée algorithmique",
        "Champ 4 : Citoyenneté numérique et sécurité"
      ],
      correctIndex: 2,
      points: 3,
      explanation: "Le champ 3 vise l'initiation aux concepts informatiques fondamentaux : séquences, boucles, conditions et raisonnement logique."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Articulation interdisciplinaire",
      text: "Pourquoi le tronc commun insiste-t-il sur l'intégration du numérique dans l'ensemble des disciplines ?",
      options: [
        "Pour éliminer complètement les cours d'informatique spécialisés.",
        "Parce que le numérique est à la fois un objet d'apprentissage propre et un levier transversal pour travailler les mathématiques, les sciences et les langues.",
        "Uniquement pour respecter les directives budgétaires du matériel.",
        "Pour remplacer les enseignants par des plateformes d'apprentissage adaptatif."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le numérique possède une double nature didactique : outil au service des savoirs disciplinaires ET objet d'apprentissage en soi."
    },
    {
      id: 'q3',
      type: 'open',
      title: "3. Mobilisation transversale des champs",
      text: "Donnez un exemple d'activité de classe qui mobilise simultanément le Champ 2 (Médias & Communication) et le Champ 4 (Citoyenneté & Sécurité).",
      points: 4,
      modelAnswer: "Exemple : Création d'une campagne de sensibilisation vidéo ou d'une affiche Canva sur le cyberharcèlement et le droit à l'image. Les élèves travaillent la mise en page, le choix des médias et la rhétorique visuelle (Champ 2), tout en questionnant les aspects légaux, le consentement et les impacts psychosociaux (Champ 4).",
      rubricCriteria: [
        "Activité concrète mobilisant la production ou analyse médiatique (Champ 2).",
        "Prise en compte explicite de la dimension déontologique, légale ou éthique (Champ 4).",
        "Cohérence du rôle actif confié à l'élève."
      ]
    }
  ],
  '02-2': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Logique curriculaire de progression",
      text: "Selon le référentiel FMTTN, comment les compétences numériques sont-elles construites tout au long du tronc commun (P1 à S3) ?",
      options: [
        "Elles sont acquises définitivement après une séance d'initiation technique en début d'année.",
        "Elles sont travaillées de manière continue et progressive sur plusieurs années, en augmentant la complexité des situations et l'autonomie de l'élève.",
        "Elles dépendent exclusivement du nombre d'heures passées devant un écran d'ordinateur.",
        "Elles doivent être enseignées sous la forme d'une liste fixe de logiciels à valider un par un."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Une compétence numérique ne se valide pas en une seule fois : elle s'approfondit par étapes successives (guidage initial, transfert, autonomie croissante dans des situations complexes)."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Évolution de la compétence vs accumulation d'outils",
      text: "Pourquoi un élève de 6e primaire n'est-il pas considéré comme compétent uniquement parce qu'il connaîtrait plus de logiciels qu'un élève de 3e primaire ?",
      options: [
        "Parce que les élèves de primaire ne devraient utiliser qu'un seul traitement de texte agréé.",
        "Parce que la compétence réside dans la capacité à résoudre des problèmes complexes et à décider de manière autonome, et non dans le nombre d'outils mémorisés.",
        "Parce que les logiciels changent tous les ans et doivent être réappris de zéro.",
        "Parce que seuls les élèves du secondaire peuvent être déclarés compétents numériquement."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Ce qui évolue entre les cycles n'est pas une simple addition de logiciels, mais la complexité des contextes de mobilisation et le niveau de prise de décision confié à l'apprenant."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. La trajectoire de l'étayage enseignant",
      text: "Quelle trajectoire caractérise le passage de la dépendance à l'autonomie dans les apprentissages numériques ?",
      options: [
        "Laisser l'élève totalement seul dès la première manipulation pour favoriser l'instinct.",
        "Une diminution progressive du guidage de l'enseignant : de la réalisation guidée d'une procédure vers le choix stratégique et la justification autonome.",
        "Interdire toute question à l'enseignant dès la 4e primaire.",
        "Fournir systématiquement un tutoriel pas-à-pas pour chaque clic jusqu'à la fin du secondaire."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "L'enseignant débute par un étayage important (démonstration, procédure guidée), puis amène progressivement l'élève à choisir ses outils, tester des solutions et réguler son action."
    },
    {
      id: 'q4',
      type: 'open',
      title: "4. Scénario de progression didactique (Recherche d'information)",
      text: "Illustrez concrètement comment la compétence de recherche d'information peut progresser entre un élève de début de primaire (P1-P2) et un élève de fin de primaire (P5-P6) en précisant l'évolution de la tâche, des contraintes et du degré d'autonomie.",
      points: 4,
      modelAnswer: "En début de primaire (P1-P2), l'élève découvre l'environnement numérique dans un cadre fortement guidé : recherche sur un site présélectionné par l'enseignant avec des mots-clés imposés ou des icônes visuelles, l'enseignant accompagnant la manipulation. En fin de primaire (P5-P6), la tâche devient complexe et ouverte : l'élève formule lui-même sa requête avec des opérateurs, compare plusieurs sources contradictoires, identifie l'auteur et la date d'une publication, justifie la fiabilité de son choix et synthétise l'information de manière autonome.",
      rubricCriteria: [
        "Différenciation claire de la tâche entre début et fin de primaire.",
        "Évolution explicite du degré de guidage de l'enseignant vers l'autonomie.",
        "Intégration de critères de complexité (choix des mots-clés, comparaison de sources, esprit critique)."
      ]
    }
  ],
  '04-1': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Alignement constructif",
      text: "Selon le principe d'alignement constructif de Biggs appliqué à une leçon intégrant le numérique, que doit-on concevoir en premier ?",
      options: [
        "L'application logicielle la plus innovante du moment.",
        "Les objectifs d'apprentissage visés et les critères d'évaluation de la maîtrise des élèves.",
        "Le planning de réservation du chariot de tablettes de l'école.",
        "La présentation visuelle PowerPoint de l'enseignant."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "La technologie doit toujours découler de l'objectif pédagogique, jamais l'inverse. Choisir l'outil avant l'objectif est un écueil didactique fréquent."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Statut de l'obstacle dans la tâche",
      text: "Lors d'une évaluation sommative d'histoire ou de mathématiques, que risque-t-il d'arriver si l'outil numérique utilisé est totalement nouveau pour les élèves ?",
      options: [
        "Les élèves seront plus motivés et auront de meilleures notes.",
        "On génère une surcharge cognitive et on risque d'évaluer la compétence technique sur l'outil plutôt que la compétence disciplinaire ciblée.",
        "L'évaluation devient automatiquement conforme aux standards européens.",
        "Aucun impact, car les jeunes sont des « digital natives » infaillibles."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'outil numérique ne doit pas constituer un obstacle instrumental parasite lors de l'évaluation d'un savoir disciplinaire."
    },
    {
      id: 'q3',
      type: 'open',
      title: "3. Formulation d'un objectif opérationnel",
      text: "Rédigez un objectif d'apprentissage opérationnel complet (avec verbe d'action observable, conditions et critères de réussite) intégrant une compétence numérique pour une classe de secondaire.",
      points: 4,
      modelAnswer: "Exemple : « À partir d'un corpus de 3 articles en ligne fournis sur un sujet scientifique, l'élève sera capable d'identifier au moins 2 arguments fiables et 1 fausse information en justifiant son choix par la vérification de la source et de la date de publication, avec un seuil de réussite de 100% sur la grille critériée. »",
      rubricCriteria: [
        "Verbe d'action observable et univoque (identifier, comparer, concevoir...).",
        "Conditions de réalisation précisées (supports, outils, contexte).",
        "Critère d'évaluation mesurable ou seuil de réussite défini."
      ]
    }
  ],
'03-1': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Le principe de l'inversion didactique",
      text: "En quoi la situation-problème constitue-t-elle une « inversion » par rapport à une démarche transmissive classique dans l'enseignement du numérique ?",
      options: [
        "Elle impose à l'élève d'apprendre par cœur le manuel d'utilisation avant d'allumer l'ordinateur.",
        "Elle part d'un problème ou d'un besoin concret à résoudre pour donner du sens à l'apprentissage, au lieu de commencer par présenter un outil ou une suite de fonctionnalités logicielles.",
        "Elle oblige l'enseignant à laisser les élèves résoudre les bugs sans aucune intervention.",
        "Elle supprime toute évaluation pour privilégier le travail en autonomie totale."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Dans la situation-problème, le besoin et l'obstacle créent la nécessité d'apprendre : l'outil numérique n'est plus une fin en soi mais une réponse instrumentée à un problème réel."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Le statut de l'outil numérique dans la démarche",
      text: "Dans une situation-problème mobilisant le numérique, comment l'outil technique doit-il être considéré par les élèves ?",
      options: [
        "Comme un objet d'évaluation sommative dont il faut mémoriser chaque menu.",
        "Comme une ressource d'investigation ou un levier de résolution sélectionné pour surmonter un obstacle précis.",
        "Comme un divertissement destiné à récompenser les élèves les plus rapides.",
        "Comme un substitut complet au raisonnement intellectuel de l'apprenant."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'apprentissage ne réside pas dans la récitation des fonctions de l'outil, mais dans la capacité à choisir et exploiter la solution numérique la plus adaptée à la situation."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. La posture de l'enseignant pendant la recherche",
      text: "Pendant que les élèves recherchent activement une solution à la situation-problème, quelle doit être la posture privilégiée de l'enseignant ?",
      options: [
        "Donner immédiatement la procédure pas-à-pas pour éviter que les élèves ne fassent des erreurs.",
        "Observer les stratégies, étayer par des relances sans donner la réponse, et encourager la formulation d'hypothèses.",
        "Quitter la classe pour laisser une liberté absolue aux groupes de travail.",
        "Corriger directement les manipulations sur le clavier des élèves."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'enseignant régule la tâche sans court-circuiter l'activité cognitive de l'élève : il questionne, guide le regard critique et soutient la persévérance."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. Obstacle conceptuel vs blocage technique",
      text: "Quel est le piège didactique majeur lors de la conception d'une situation-problème numérique ?",
      options: [
        "Proposer un problème trop lié à l'actualité des élèves.",
        "Confondre l'obstacle conceptuel (sur lequel porte l'apprentissage) avec un obstacle purement instrumental (panne, mot de passe perdu, bug d'interface) qui bloque inutilement la tâche.",
        "Autoriser les élèves à collaborer par binômes.",
        "Utiliser un logiciel gratuit et libre de droits."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'obstacle doit être épistémique (faire progresser la réflexion, l'esprit critique ou la méthode) et non un obstacle parasite matériel qui décourage sans instruire."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. La phase d'institutionnalisation",
      text: "Pourquoi la phase finale d'institutionnalisation (formalisation) est-elle indispensable après la résolution du problème ?",
      options: [
        "Pour sanctionner par une note chiffrée les groupes qui n'ont pas terminé dans les temps.",
        "Pour décontextualiser les découvertes empiriques, formaliser les concepts et démarches transférables et donner aux savoirs un statut de connaissance partagée.",
        "Pour réécrire le cours magistral initial que les élèves n'ont pas écouté.",
        "Uniquement pour remplir les documents administratifs de l'établissement."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Sans institutionnalisation, l'expérience vécue reste une anecdote : la formalisation transforme la trouvaille empirique en savoir réutilisable dans d'autres contextes."
    },
    {
      id: 'q6',
      type: 'open',
      title: "6. Réflexivité sur l'Exercice 02 (Évaluer l'information & Esprit critique)",
      text: "À partir de votre réalisation de l'Exercice 02 (« Peut-on faire confiance à cette information ? » sur les écrans et le sommeil), analysez en quoi la confrontation à une affirmation virale séduisante a suscité un conflit cognitif chez l'apprenant. Comment la démarche d'enquête vers la source primaire a-t-elle transformé votre rapport à la preuve numérique, et quelle leçon didactique en tirez-vous pour vos élèves ?",
      points: 5,
      modelAnswer: "L'exercice place l'apprenant face à une affirmation pseudo-scientifique plausible qui heurte les préconceptions : la confrontation à la source primaire révèle que les conclusions initiales étaient déformées ou extrapolées. Ce conflit cognitif déstabilise la confiance naïve envers les chiffres partagés en ligne. Sur le plan didactique, cela montre que l'esprit critique ne se décrète pas par une mise en garde théorique : il doit être vécu à travers une enquête concrète qui outille l'élève (remonter à la source primaire, vérifier la méthodologie de l'étude, identifier les conflits d'intérêts et contextualiser la date de publication).",
      rubricCriteria: [
        "Explicitation du conflit cognitif entre l'affirmation virale et la réalité de la source primaire.",
        "Identification de la transformation de la posture (du doute passif à l'enquête méthodique outillée).",
        "Transposition didactique claire pour une pratique de classe avec des élèves."
      ]
    }
  ],
  '03-2': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Caractéristiques de l'apprentissage par projet",
      text: "Qu'est-ce qui caractérise fondamentalement la pédagogie de projet par rapport à des exercices d'application découpés ?",
      options: [
        "La réalisation d'une production concrète sur une temporalité longue, mobilisant des compétences transversales et destinée à un public ou usage authentique.",
        "L'obligation de travailler exclusivement en silence et de façon individuelle.",
        "L'utilisation obligatoire d'au moins six logiciels payants différents.",
        "L'absence d'objectifs pédagogiques définis à l'avance."
      ],
      correctIndex: 0,
      points: 3,
      explanation: "Le projet engage l'élève dans la durée autour d'une œuvre concrète dont la finalité sociale donne du sens à tous les apprentissages intermédiaires."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Mobilisation des savoirs au fil du projet",
      text: "Comment les connaissances et compétences techniques doivent-elles être introduites dans un projet numérique ?",
      options: [
        "Par un cours théorique magistral de 10 heures avant de commencer le projet.",
        "Au fur et à mesure qu'elles s'avèrent nécessaires pour concevoir ou faire avancer la production collective.",
        "Uniquement après la fin du projet, lors de la correction finale.",
        "En demandant aux élèves d'acheter des formations en ligne le soir chez eux."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'apprentissage en flux tendu ('just-in-time') confère une utilité immédiate et concrète aux savoirs théoriques et techniques mobilisés."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. La régulation du travail d'équipe",
      text: "Pour éviter l'écueil classique où un seul élève technophile réalise tout le travail pendant que les autres restent passifs, que doit organiser l'enseignant ?",
      options: [
        "Supprimer les ordinateurs et revenir au travail sur cahier.",
        "Définir des rôles complémentaires identifiés, des jalons d'étapes intermédiaires avec livrables individuels et collectifs, et des temps réguliers de régulation.",
        "Attribuer la même note globale à tout le monde sans distinction d'implication.",
        "Interdire aux élèves de se parler pendant les séances de projet."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "La coopération ne s'improvise pas : l'enseignant structure la division du travail, la responsabilité mutuelle et la traçabilité des contributions de chacun."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. Le piège de la dérive productiviste",
      text: "Qu'appelle-t-on la « dérive productiviste » en pédagogie de projet appliquée au numérique ?",
      options: [
        "Le fait de fabriquer trop d'objets ou de pages web au FabLab de l'école.",
        "Le fait de se focaliser exclusivement sur l'esthétique et la réussite du produit fini, au détriment des apprentissages réels et du recul réflexif des élèves.",
        "Le refus de respecter les horaires de cours de l'établissement.",
        "Le recours abusif à l'impression papier en couleur."
      ],
      correctIndex: 3,
      points: 3,
      explanation: "Dans un projet, le produit n'est que le prétexte : l'objectif premier demeure l'ensemble des apprentissages, compétences et prises de décision développés au fil du parcours."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. L'évaluation formative continue en projet",
      text: "Quel est l'intérêt d'évaluer des étapes intermédiaires (scénario, maquette, prototype) plutôt que d'attendre la remise finale ?",
      options: [
        "Augmenter le nombre de notes dans le bulletin scolaire de l'élève.",
        "Permettre une rétroaction formative continue, réajuster les démarches en cours de route et valoriser le processus de conception plutôt que le seul résultat fini.",
        "Éliminer immédiatement les élèves en retard sans possibilité de rattrapage.",
        "Vérifier que les élèves ne travaillent pas en dehors des heures de cours."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Les jalons intermédiaires permettent à l'enseignant d'orienter, d'encourager et de réguler les apprentissages au moment où l'élève peut encore transformer sa production."
    },
    {
      id: 'q6',
      type: 'open',
      title: "6. Réflexivité sur l'Exercice 03 (Conception d'un guide numérique pour les élèves)",
      text: "En analysant la réalisation de votre Guide numérique (Exercice 03), comment avez-vous arbitré entre la sophistication technique des outils et l'accessibilité réelle pour le public d'élèves visé ? Quels défis d'organisation et de coordination d'équipe avez-vous rencontrés, et quels dispositifs de régulation mettriez-vous en place dans votre propre classe ?",
      points: 5,
      modelAnswer: "Dans la conception d'un guide pour élèves, l'écueil fréquent est de multiplier les effets graphiques au détriment de l'ergonomie cognitive. L'arbitrage exige de privilégier la sobriété, la lisibilité typographique et la clarté des chemins d'accès (FAQ, arborescence simple, visuels commentés). Concernant la dynamique de groupe, les tensions portent souvent sur l'alignement éditorial et le rythme de travail. En classe, la remédiation repose sur un carnet de bord de projet, une grille critériée partagée dès le départ et des séances de relecture croisée entre groupes pour tester l'intelligibilité des contenus.",
      rubricCriteria: [
        "Analyse de l'arbitrage entre ambition technique/esthétique et utilité didactique pour le public cible.",
        "Identification lucide des difficultés de gestion de projet rencontrées (répartition des tâches, délais, cohérence).",
        "Proposition d'outils concrets d'étayage et de régulation pour des élèves (carnet de bord, jalons, relecture)."
      ]
    }
  ],
  '03-3': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. La démarche d'investigation en éducation au numérique",
      text: "Quelle posture l'apprentissage par investigation vise-t-il à développer en priorité chez les élèves ?",
      options: [
        "Une posture d'exécutant docile qui reproduit scrupuleusement les clics d'un tutoriel vidéo.",
        "Une posture de chercheur/enquêteur qui questionne le fonctionnement des technologies, émet des hypothèses, expérimente et argumente ses conclusions.",
        "Une posture d'utilisateur passif qui consomme les contenus recommandés par les algorithmes.",
        "Une posture de hacker cherchant à contourner les filtres de sécurité de l'établissement scolaire."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'investigation place l'apprenant au cœur de la démarche scientifique appliquée au numérique : questionner, chercher des indices, tester et valider par la preuve."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. La ludification et les jeux d'évasion (Escape Game)",
      text: "Dans un Escape Game pédagogique tel que la cyber-enquête FMTTN, quel est le véritable rôle de la scénarisation ludique ?",
      options: [
        "Faire passer le temps sans que les élèves n'aient à réfléchir à des notions scolaires.",
        "Servir de moteur narratif et motivationnel stimulant pour placer l'élève en situation de résoudre des problèmes et mobiliser des compétences numériques authentiques.",
        "Remplacer entièrement les programmes et référentiels officiels de la Fédération Wallonie-Bruxelles.",
        "Créer une compétition individuelle impitoyable où seul le plus rapide obtient des points."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "La mécanique ludique crée un contexte immersif engageant qui dédramatise la difficulté et incite à la collaboration et au raisonnement rigoureux."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. Le traitement de la fausse piste",
      text: "Dans une démarche d'enquête numérique, comment l'exploration d'une fausse piste ou d'une erreur d'hypothèse doit-elle être traitée didactiquement ?",
      options: [
        "Comme un échec définitif justifiant le retrait de points immédiat.",
        "Comme une donnée informative précieuse qui permet de réfuter une hypothèse, d'analyser les causes de l'erreur et de réorienter la recherche.",
        "En cachant l'erreur pour ne pas perturber les autres élèves.",
        "En punissant le groupe responsable pour manque d'attention."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'erreur fait partie intégrante de l'enquête : comprendre pourquoi une piste est infructueuse constitue un acte cognitif aussi formateur que trouver la bonne solution."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. Le risque du divertissement sans apprentissage",
      text: "Quel est le risque didactique majeur d'une activité d'enquête ludifiée si l'enseignant omet d'organiser un temps de synthèse ?",
      options: [
        "Les élèves risquent de s'ennuyer en classe.",
        "Les élèves retiennent l'amusement et la mécanique du jeu sans conscientiser ni formaliser les savoirs et compétences numériques sous-jacents.",
        "Le réseau Internet de l'école risque de saturer.",
        "Les parents d'élèves vont automatiquement refuser l'évaluation."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le jeu n'est qu'un vecteur : sans débriefing, l'apprentissage reste invisible et l'élève ne transfère pas les notions travaillées vers d'autres contextes."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. Le débriefing pédagogique post-enquête",
      text: "Quel est l'objectif premier de la phase de débriefing après un Escape Game ou une investigation numérique ?",
      options: [
        "Proclamer les vainqueurs et distribuer des friandises.",
        "Expliciter les démarches de pensée, analyser les stratégies de résolution d'énigmes et relier chaque défi aux attendus curriculaires du référentiel FMTTN.",
        "Ranger la salle informatique le plus vite possible.",
        "Vérifier que les ordinateurs ne sont pas tombés en panne."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le débriefing est le moment clé de l'institutionnalisation : on y décortique les mécanismes techniques, les biais cognitifs et les savoirs mobilisés."
    },
    {
      id: 'q6',
      type: 'open',
      title: "6. Réflexivité sur l'Exercice 04 (Escape Game FMTTN - Cyber-Enquête)",
      text: "À l'issue de votre participation à l'Escape Game FMTTN (Exercice 04), analysez la balance entre l'engagement ludique et l'apprentissage didactique. Quels savoirs ou compétences spécifiques du référentiel avez-vous mobilisés au cours de l'enquête ? Comment mèneriez-vous le débriefing avec vos élèves pour vous assurer que les concepts numériques sont durablement acquis ?",
      points: 5,
      modelAnswer: "L'Escape Game suscite une forte adhésion grâce à la tension narrative et aux énigmes progressives. Cependant, le rythme intense peut masquer l'apprentissage si on ne prend pas le temps de déconstruire l'activité. Les compétences mobilisées touchent aux 4 champs du FMTTN : décryptage d'indices, raisonnement logique, sensibilisation à la cybersécurité et esprit critique. Pour le débriefing, j'organiserais un tableau collectif en 3 colonnes : 'Ce que nous avons fait (le jeu)' ➔ 'Le principe informatique ou sociétal sous-jacent' ➔ 'La règle transférable dans la vie quotidienne', garantissant ainsi une véritable cristallisation des acquis.",
      rubricCriteria: [
        "Analyse de l'articulation entre immersion ludique et apprentissage rigoureux.",
        "Identification précise des compétences du référentiel FMTTN mobilisées lors des énigmes.",
        "Structuration d'une démarche de débriefing concrète favorisant le transfert des connaissances."
      ]
    }
  ],
  '03-4': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Le moteur pédagogique du défi express",
      text: "Quel est l'effet didactique premier de l'introduction d'une contrainte temporelle forte (ex : 20 minutes chrono) dans un défi d'apprentissage ?",
      options: [
        "Créer un stress éliminatoire pour trier les meilleurs élèves de la classe.",
        "Pousser l'élève à dépasser le perfectionnisme inhibiteur, à hiérarchiser immédiatement l'essentiel et à s'engager activement dans l'expérimentation sans procrastiner.",
        "Permettre à l'enseignant de corriger ses copies pendant que les élèves travaillent vite.",
        "Réduire la facture d'électricité de l'école en allumant moins longtemps les écrans."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "La brièveté du temps imparti focalise l'attention sur l'objectif central : l'élève teste, fait des compromis rapides et entre d'emblée dans la démarche de production."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. La contrainte comme levier de créativité",
      text: "Pourquoi imposer des limites strictes (ex : maximum 30 mots, 3 éléments visuels sur Canva) améliore-t-il la qualité didactique d'une production ?",
      options: [
        "Parce que cela évite que les élèves écrivent trop de bêtises sur leur feuille.",
        "Parce que la contrainte oblige à faire des choix éditoriaux rigoureux, à éliminer le superflu et à concentrer la puissance communicative sur le message essentiel.",
        "Parce que les serveurs de Canva plantent si l'on dépasse 30 mots.",
        "Uniquement pour faciliter la relecture par l'enseignant."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'abondance de choix paralyse souvent l'élève : restreindre drastiquement les ressources oblige à concevoir une rhétorique visuelle et textuelle percutante."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. Le pitch oral de mise en commun",
      text: "Quel est le but pédagogique de demander un pitch de 1 minute à chaque groupe à l'issue du défi express ?",
      options: [
        "Prendre en faute les élèves timides.",
        "Développer la capacité à expliciter, assumer et justifier oralement ses choix graphiques et didactiques devant ses pairs en un temps limité.",
        "Remplacer l'évaluation écrite par une note d'éloquence générale.",
        "Donner le temps aux autres groupes de ranger leur matériel."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'explicitation orale oblige l'élève à conscientiser sa démarche : il ne montre pas seulement ce qu'il a fait, il justifie pourquoi il l'a fait."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. Le climat sécurisant et le droit à l'imperfection",
      text: "Quelle condition pédagogique est impérative pour que la contrainte temporelle d'un défi reste stimulante et non anxiogène ?",
      options: [
        "Menacer d'un zéro pointé tout groupe n'ayant pas bouclé son affiche.",
        "Instaurer un climat bienveillant où l'inachevé et l'erreur sont pleinement acceptés, la valeur résidant dans la réflexion engagée et les choix testés.",
        "Faire le travail à la place des élèves qui prennent du retard.",
        "Organiser un vote pour éliminer la pire création de la classe."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le défi est un laboratoire d'audace : si la note sanctionne l'inabouti, l'élève se réfugie dans la prudence banale et perd tout élan créatif."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. Domaines d'application dans le FMTTN",
      text: "Dans quel type d'activités du référentiel FMTTN le défi express est-il particulièrement indiqué ?",
      options: [
        "Uniquement lors de la signature du règlement d'ordre intérieur de l'école.",
        "Pour des activités de communication visuelle, de prototypage rapide d'affiches, de détection d'erreurs de code (débogage flash) ou de synthèse d'idées.",
        "Pour l'apprentissage de la dactylographie en aveugle sur machine à écrire.",
        "Uniquement pour les examens certificatifs de fin de secondaire."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le défi express est idéal pour dynamiser des séances, réactiver des notions ou éprouver la clarté d'un message communicatif sous contrainte."
    },
    {
      id: 'q6',
      type: 'open',
      title: "6. Réflexivité sur l'Exercice 05 (Défi 20 minutes Canva : Affiche mot de passe)",
      text: "À partir de votre expérience lors de l'Exercice 05 (créer en 20 minutes une affiche Canva percutante sur la sécurité des mots de passe avec max 30 mots et 3 visuels), analysez comment ces contraintes radicales ont orienté votre processus de conception. Quels éléments secondaires avez-vous dû sacrifier pour garantir une compréhension immédiate par un élève, et qu'avez-vous appris sur l'efficacité visuelle ?",
      points: 5,
      modelAnswer: "La contrainte des 20 minutes interdit de se perdre dans l'exploration infinie des modèles Canva : il a fallu choisir une idée forte immédiatement (ex: la métaphore de la clé de maison ou la phrase secrète). La contrainte des 30 mots et 3 visuels a exigé de renoncer aux explications techniques complexes (longueur en bits, force brute) pour retenir un mot d'ordre mémorisable ('Longueur + Majuscule + Symbole = Mot de passe blindé'). Cette expérience prouve qu'en didactique visuelle, 'moins c'est plus' : épurer un document renforce son impact pédagogique auprès des élèves.",
      rubricCriteria: [
        "Analyse de l'impact de la contrainte temporelle sur la prise de décision rapide.",
        "Explicitation des arbitrages et sacrifices d'informations superflues au profit de la lisibilité.",
        "Déduction d'une règle d'efficacité didactique pour la communication visuelle en classe."
      ]
    }
  ],
  '03-5': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Le postulat fondamental de la conception itérative",
      text: "Quel principe essentiel caractérise la démarche de conception itérative dans le domaine des technologies numériques ?",
      options: [
        "Une production numérique doit être livrée parfaite et définitive dès son premier jet.",
        "Une première production n'est jamais définitive : elle constitue un prototype destiné à être testé auprès de véritables utilisateurs, analysé et progressivement amélioré.",
        "Le concepteur sait toujours exactement ce que veulent les utilisateurs sans avoir besoin de les consulter.",
        "L'enseignant ne doit accepter aucune modification sur un devoir déjà remis."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'itération repose sur l'humilité du concepteur : c'est la confrontation au réel et l'observation des usages qui révèlent les forces et les faiblesses d'un produit."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Le biais de l'expert (ou illusion du concepteur)",
      text: "Pourquoi les créateurs d'un jeu ou d'un site sont-ils généralement de mauvais évaluateurs de leur propre production ?",
      options: [
        "Parce qu'ils ne possèdent pas de diplôme en informatique.",
        "Parce qu'ils connaissent déjà la logique de leur création et ne perçoivent plus les incohérences, manques d'ergonomie ou consignes implicites qui bloquent un utilisateur candide.",
        "Parce qu'ils ont passé trop de temps devant l'ordinateur.",
        "Parce que les concepteurs refusent systématiquement de relire leur travail."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'œil du créateur compense inconsciemment les défauts : seul un utilisateur découvrant l'interface pour la première fois permet d'identifier les vrais obstacles."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. L'instrumentation du test par formulaire (Google Forms)",
      text: "Pourquoi est-il crucial d'outiller le recueil de données par un questionnaire structuré (ex : Google Forms) plutôt que de demander un simple « Qu'en pensez-vous ? » ?",
      options: [
        "Pour collecter les adresses email personnelles des testeurs.",
        "Pour transformer des avis vagues ou de la politesse en données objectives critériées (compréhension, fluidité, pertinence) permettant d'arbitrer rationnellement les correctifs.",
        "Pour automatiser la notation sans avoir à lire les réponses.",
        "Uniquement pour respecter le volet tableur du programme scolaire."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Un questionnaire structuré permet de poser des questions fermées (échelles d'utilisabilité) et ouvertes précises pour hiérarchiser les priorités d'amélioration de la V2."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. Mobilisation des niveaux cognitifs de Bloom",
      text: "Quels niveaux élevés de la taxonomie de Bloom révisée sont mobilisés lorsqu'un groupe analyse les retours d'un test pour créer la version 2 de son projet ?",
      options: [
        "Uniquement les niveaux Mémoriser et Réciter.",
        "Les niveaux Analyser (décomposer les retours et déceler les causes), Évaluer (juger l'efficacité des solutions) et Créer (concevoir une version optimisée).",
        "Aucun niveau de Bloom, car l'ergonomie ne relève pas de la pédagogie.",
        "Uniquement le niveau Appliquer une consigne sans réfléchir."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'itération est un entraînement cognitif d'excellence : l'apprenant doit faire preuve de discernement critique et de créativité pour réinventer sa solution."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. Le statut constructif de l'erreur",
      text: "Dans la boucle itérative « Concevoir ➔ Tester ➔ Analyser ➔ Améliorer », quel est le statut accordé à l'erreur ou au bug ?",
      options: [
        "Une honte pédagogique devant être dissimulée aux autres groupes.",
        "Un signal précieux et constructif qui fournit la matière première indispensable au perfectionnement de la production.",
        "Un motif de suspension immédiate de l'accès aux ordinateurs.",
        "Une fatalité incontournable qu'il ne sert à rien de corriger."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'erreur devient un levier d'apprentissage : chaque difficulté rencontrée par le joueur renseigne sur ce qui doit être clarifié dans les règles ou l'interface."
    },
    {
      id: 'q6',
      type: 'open',
      title: "6. Réflexivité sur l'Exercice 06 (Conception itérative d'un mini-jeu Genially sur le tri des déchets)",
      text: "En vous fondant sur l'Exercice 06 que vous avez mené (création du prototype Genially, test Google Forms par les pairs, analyse et version 2), quelles difficultés imprévues ont été mises en lumière par les testeurs ? Comment avez-vous sélectionné et appliqué les 3 améliorations majeures de la V2, et qu'avez-vous appris sur la posture d'écoute de l'utilisateur ?",
      points: 5,
      modelAnswer: "Lors du test de notre prototype Genially sur le tri des déchets, les retours des testeurs ont révélé que certaines consignes écrites étaient ignorées et que la zone de glisser-déposer manquait de visibilité. En tant que concepteurs, nous pensions que le jeu était limpide, mais l'analyse du Google Forms a objectivé ces incompréhensions. Pour la V2, nous avons retenu 3 améliorations : 1° Ajout d'une consigne audio courte, 2° Renforcement des contrastes visuels des poubelles de tri, 3° Feedback immédiat sonifié en cas d'erreur. Cette démarche apprend l'humilité didactique : enseigner et concevoir avec le numérique exige d'adapter en continu son dispositif en fonction des réactions effectives des apprenants.",
      rubricCriteria: [
        "Description lucide d'un décalage entre les intentions des concepteurs et l'expérience réelle des testeurs.",
        "Explicitation claire et justifiée des 3 améliorations concrètes apportées sur la V2.",
        "Formulation d'un recul réflexif sur la posture d'écoute, l'adaptation didactique et le statut de l'erreur."
      ]
    }
  ],
  '03-6': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Le cycle expérientiel de David Kolb",
      text: "Selon le cycle d'apprentissage expérientiel de David Kolb, quelle étape doit impérativement succéder à l'expérience concrète pour qu'il y ait véritable apprentissage ?",
      options: [
        "L'oubli immédiat de l'activité pour passer à un autre cours.",
        "L'observation réflexive suivie de la conceptualisation abstraite, permettant de donner du sens à ce qui a été vécu et de formuler des règles générales.",
        "L'attribution mécanique d'une note chiffrée par l'enseignant.",
        "La copie intégrale d'un résumé théorique dicté au tableau."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'action seule ne suffit pas : c'est le temps de recul réflexif ('Qu'avons-nous fait ? Pourquoi ?') qui transforme une manipulation en connaissance transférable."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. La règle d'or du Peer Learning (Apprentissage entre pairs)",
      text: "Dans une classe fonctionnant en apprentissage entre pairs, quelle attitude doit adopter un étudiant lorsqu'un camarade sollicite son aide ?",
      options: [
        "Prendre la souris et le clavier des mains de son pair pour exécuter la tâche à sa place le plus vite possible.",
        "Expliquer son raisonnement, guider le questionnement et amener son pair à trouver lui-même la solution.",
        "Refuser de répondre pour conserver un avantage compétitif lors de l'évaluation.",
        "Renvoyer immédiatement son camarade vers l'enseignant sans chercher à comprendre son blocage."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Faire à la place de l'autre empêche l'apprentissage : en explicitant sa méthode, celui qui aide consolide ses propres savoirs tout en rendant son pair autonome."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. Le paradigme pédagogique de l'École 42",
      text: "Quel changement fondamental de posture le modèle de l'École 42 illustre-t-il pour l'enseignement du numérique ?",
      options: [
        "L'obligation d'acheter des ordinateurs très coûteux pour chaque élève.",
        "Le déplacement de la question 'Que dois-je mémoriser ?' vers 'Quel problème dois-je résoudre et comment mobiliser les ressources collectives pour y parvenir ?'.",
        "L'interdiction d'utiliser Internet pendant les heures d'apprentissage.",
        "La suppression complète de toute interaction humaine au profit de robots."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le modèle 42 valorise l'autonomie, l'enquête collective, le droit à l'erreur et l'entraide mutuelle sans cours magistraux magistro-centrés."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. Le rôle de l'enseignant-facilitateur",
      text: "Lorsque les élèves travaillent en résolution de problème coopérative (ex : défi hardware), quel est le rôle prioritaire de l'enseignant ?",
      options: [
        "Rester silencieux à son bureau et corriger les examens d'une autre classe.",
        "Agir comme facilitateur et observateur bienveillant, veillant à la sécurité, régulant les dynamiques de groupe et n'intervenant en étayage que si les ressources des pairs sont épuisées.",
        "Faire une démonstration magistrale au tableau toutes les 5 minutes.",
        "Imposer une démarche unique et interdire tout tâtonnement."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'enseignant n'est plus le détenteur monopolistique des réponses : il crée le cadre, encourage l'exploration et aide à formaliser le bilan final."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. Le conflit sociocognitif au sein des binômes",
      text: "Pourquoi la confrontation d'idées différentes au sein d'un groupe d'élèves face à une panne informatique est-elle didactiquement féconde ?",
      options: [
        "Parce qu'elle provoque des disputes qui distraient la classe.",
        "Parce que devoir argumenter et défendre ses hypothèses oblige chaque élève à restructurer ses connaissances, à prendre conscience de ses erreurs et à construire une solution plus robuste.",
        "Parce qu'elle permet d'élire un chef de groupe qui décide de tout.",
        "Uniquement pour faire du bruit dans la salle d'informatique."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le conflit sociocognitif est le moteur de l'apprentissage entre pairs : la divergence oblige à expliciter, confronter les preuves et progresser ensemble."
    },
    {
      id: 'q6',
      type: 'open',
      title: "6. Réflexivité sur l'Exercice 07 (Défi Hardware : Démonter et remonter un PC)",
      text: "À partir de votre participation au Défi Hardware (démontage, identification des composants et remontage d'une unité centrale), quelle énigme technique ou difficulté de remontage avez-vous résolue grâce à l'aide d'un pair ou à l'expérimentation collective ? En quoi cette manipulation concrète a-t-elle modifié votre compréhension de l'ordinateur par rapport à un cours purement magistral ?",
      points: 5,
      modelAnswer: "Lors du Défi Hardware, notre groupe s'est heurté au branchement des connecteurs du panneau avant (bouton Power, LED, USB) sur la carte mère, ainsi qu'à l'insertion correcte des barrettes de RAM. Bloqués, nous avons sollicité un autre groupe qui nous a orientés vers les repères sérigraphiés de la carte mère et nous a expliqué le détrompeur de la RAM sans faire la manipulation à notre place. Cette expérience physique a transformé des concepts abstraits (carte mère, bus de données, pâte thermique) en réalités matérielles observables et tangibles, rendant l'architecture d'un PC compréhensible et démystifiée de manière bien plus pérenne qu'un schéma 2D sur transparent.",
      rubricCriteria: [
        "Description précise d'un problème technique concret résolu lors du démontage ou remontage.",
        "Mise en valeur d'une interaction authentique de peer learning (aide méthodologique sans confiscation de la tâche).",
        "Analyse comparative entre l'apprentissage expérientiel concret et l'enseignement abstrait décontextualisé."
      ]
    }
  ],
  '03-7': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. La spécificité de la scénarisation à distance",
      text: "Pourquoi concevoir un enseignement à distance ne peut-il pas se limiter à enregistrer son cours en amphi ou à déposer des documents PDF en ligne ?",
      options: [
        "Parce que les élèves n'ont pas d'imprimante à domicile.",
        "Parce que l'absence de coprésence physique exige une scénarisation rigoureuse alternant ressources, activités guidées, temps d'interactions et rétroactions explicites.",
        "Parce que le décret de la FWB interdit le format PDF pour les étudiants.",
        "Uniquement pour des questions de droits d'auteur sur les vidéos."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "À distance, la simple mise à disposition de documents génère passivité et isolement : la scénarisation organise le rythme d'apprentissage et maintient l'engagement de l'étudiant."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. L'usage didactique du temps synchrone",
      text: "Dans un dispositif de formation hybride ou à distance, quelle est la plus-value essentielle des séances synchrones (visioconférences en direct) ?",
      options: [
        "Faire un monologue magistral ininterrompu de deux heures.",
        "Privilégier les interactions dynamiques : répondre aux questions, débattre, résoudre des études de cas collaboratives et offrir des rétroactions formatives collectives.",
        "Vérifier la présence des étudiants à la minute près par appel nominal.",
        "Faire recopier aux étudiants des textes dictés par l'enseignant."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le temps synchrone est précieux : il doit être réservé aux échanges humains, à l'élucidation des incompréhensions et à la co-construction, les exposés pouvant être consultés en asynchrone."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. Les trois dimensions d'interactions (Modèle de Moore)",
      text: "Quelles sont les trois formes d'interactions indispensables à orchestrer pour rompre le sentiment d'isolement à distance ?",
      options: [
        "Interactions entre l'ordinateur, l'imprimante et le routeur Wi-Fi.",
        "Interactions Étudiant ↔ Enseignant (étayage/feedback), Étudiant ↔ Étudiant (collaboration/pairs) et Étudiant ↔ Contenu (interactivité/tâches concrètes).",
        "Interactions entre l'école, le ministère et les fournisseurs d'accès Internet.",
        "Interactions entre les réseaux sociaux, les jeux vidéo et la messagerie instantanée."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'isolement ne provient pas de la distance géographique mais de la distance transactionnelle : nourrir ces 3 types d'interactions garantit la présence pédagogique."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. L'autonomie et la clarté des consignes",
      text: "Quelle est la cause majeure de décrochage d'un apprenant lors d'un travail autonome à distance ?",
      options: [
        "Le manque de jeux vidéo disponibles en ligne.",
        "L'ambiguïté des consignes, l'absence de jalons temporels explicites et l'incertitude sur ce qui est attendu pour réussir la tâche.",
        "L'utilisation d'ordinateurs portables de marque différente.",
        "La météo pluvieuse qui perturbe la connexion."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Sans enseignant à proximité pour reformuler oralement, une consigne floue génère anxiété et sentiment d'impuissance : les attentes doivent être chirurgicales et exemplifiées."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. L'importance du feedback continu",
      text: "Pourquoi les rétroactions (feedbacks) régulières sont-elles encore plus cruciales à distance qu'en présentiel ?",
      options: [
        "Pour justifier le temps de travail hebdomadaire de l'enseignant.",
        "Pour rassurer l'étudiant sur sa progression, corriger rapidement les représentations erronées et maintenir la motivation intrinsèque dans la durée.",
        "Pour empêcher les étudiants d'utiliser d'autres sites web.",
        "Uniquement pour préparer les réclamations d'examens."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le silence pédagogique est le pire ennemi du distanciel : un retour rapide et constructif donne à l'apprenant le sentiment d'exister et d'être accompagné."
    },
    {
      id: 'q6',
      type: 'open',
      title: "6. Réflexivité sur l'ergonomie et la scénarisation de cette plateforme de cours",
      text: "En analysant votre propre parcours sur cette plateforme numérique de Master 1 (arborescence des 6 catégories, modules progressifs, espace membre, quiz formatifs, fiches d'exercices avec documents Google Docs téléchargeables), évaluez comment les principes de scénarisation à distance ont été appliqués. Quels éléments ont facilité votre autonomie et quelle amélioration concrète proposeriez-vous pour enrichir votre apprentissage ?",
      points: 5,
      modelAnswer: "La plateforme applique plusieurs principes clés de l'enseignement à distance : 1° Une scénarisation modulaire claire avec jalons progressifs et balises visuelles uniformes, 2° Une autonomie soutenue par l'accès immédiat aux documents officiels Google Docs (mode consultation/copie) et aux attendus critériés, 3° Une rétroaction immédiate via les QuizBox interactives à correction explicative et le tableau de bord de l'Espace Membre. Pour enrichir le dispositif, on pourrait envisager l'intégration d'un espace d'échange synchrone ou asynchrone entre pairs (forum de discussion par atelier) pour favoriser le co-débriefing et l'entraide communautaire.",
      rubricCriteria: [
        "Identification pertinente des dispositifs de scénarisation et d'autonomie présents sur la plateforme.",
        "Analyse de l'impact des outils formatifs (quiz, espace membre, documents de cadrage) sur l'engagement.",
        "Proposition constructive et réaliste d'amélioration didactique ou interactionnelle."
      ]
    }
  ],
    '05': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Finalité de l'évaluation dans le référentiel FMTTN",
      text: "Dans le cadre du référentiel FMTTN, à partir de quoi l'évaluation didactique doit-elle être prioritairement pensée ?",
      options: [
        "À partir du logiciel ou du matériel informatique mis à disposition dans la salle de classe.",
        "À partir de la vérification de l'atteinte des attendus (ce que l'élève doit apprendre, démontrer et mobiliser).",
        "À partir de la vitesse de frappe au clavier et de la beauté visuelle des productions.",
        "À partir de la seule note attribuée lors d'un examen théorique de fin d'année."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "L'évaluation se fonde sur les résultats d'apprentissage (attendus du référentiel) et non sur les outils techniques mobilisés ou une simple conformité cosmétique."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Évaluation des savoir-faire et des compétences",
      text: "Pourquoi les savoir-faire et les compétences numériques doivent-ils être prioritairement évalués en situation complexe (projets, défis, manipulations) plutôt que par un quiz théorique isolé ?",
      options: [
        "Parce que les quiz écrits sont interdits par le décret Paysage.",
        "Parce qu'une compétence implique la mobilisation et la combinaison en contexte de plusieurs ressources (cognitives, techniques, critiques), ce qu'un QCM théorique ne peut mesurer.",
        "Uniquement pour éviter d'imprimer des feuilles de papier en classe.",
        "Parce que les élèves savent toujours utiliser un logiciel sans qu'on ait besoin de vérifier leur démarche."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Connaître une règle (savoir) ne garantit pas la capacité à la mobiliser dans l'action : l'évaluation en situation permet d'observer la démarche authentique et l'adaptation de l'élève face à un problème concret."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. Spécificité de l'évaluation en éducation aux médias",
      text: "Pourquoi est-il insuffisant de demander à un élève de définir ce qu'est une « fake news » ou la « désinformation » pour évaluer ses compétences en éducation aux médias ?",
      options: [
        "Parce que l'éducation aux médias relève du développement d'une posture (réflexivité, esprit critique, discernement) qui se manifeste dans la justification de choix réels et non dans la récitation d'une définition.",
        "Parce que les définitions changent selon les pays et ne sont pas universelles.",
        "Parce que les fake news n'existent plus sur les moteurs de recherche modernes.",
        "Parce que seuls les journalistes professionnels peuvent repérer des fausses informations."
      ],
      correctIndex: 0,
      points: 2,
      explanation: "L'esprit critique est une posture : l'élève doit démontrer sa démarche de doute méthodique, de recoupement de sources et d'argumentation face à un contenu réel (analyses de cas, débats, portfolios)."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. Les objectifs de l'évaluation par les pairs",
      text: "Selon le syllabus, quel est l'un des bénéfices majeurs de l'évaluation par les pairs pour l'élève évaluateur ?",
      options: [
        "L'élève évaluateur remplace définitivement l'enseignant et gagne du temps de correction.",
        "En analysant le travail d'un camarade à l'aide de critères explicites, l'élève développe sa réflexivité et porte un regard plus critique sur sa propre production.",
        "L'élève apprend à sanctionner sévèrement ses camarades avec des notes pénalisantes.",
        "L'évaluation par les pairs sert uniquement à classer les élèves du meilleur au moins bon."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Évaluer autrui avec une grille critériée oblige l'apprenant à s'approprier les critères de réussite, ce qui stimule directement sa propre métacognition et son autorégulation."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. Structuration d'un feedback formatif exploitable",
      text: "Pour qu'un retour d'évaluation par les pairs soit véritablement formateur et actionnable avant la remise finale, quelle formulation doit-on privilégier ?",
      options: [
        "Attribuer une note globale sur 20 sans commentaire écrit.",
        "Écrire des remarques générales comme « Très bien » ou « Pas terrible ».",
        "Fournir un retour qualitatif structuré : identifier au moins une réussite, un point précis d'amélioration et une proposition concrète de modification.",
        "Corriger directement le document à la place de son camarade sans lui expliquer ses erreurs."
      ],
      correctIndex: 2,
      points: 2,
      explanation: "Le triptyque formatif (une réussite, un axe de progression, une recommandation concrète) permet à l'élève récepteur de comprendre exactement comment réviser son prototype."
    },
    {
      id: 'q6',
      type: 'qcm',
      title: "6. Distinction entre critère et indicateur (Jonsson & Svingby, Brookhart & Chen)",
      text: "Dans une grille critériée, quelle est la distinction fondamentale entre un « critère » et un « indicateur » ?",
      options: [
        "Le critère est le barème chiffré en points, tandis que l'indicateur est la moyenne générale.",
        "Le critère désigne la dimension générale de l'apprentissage évaluée (ex. esprit critique), tandis que les indicateurs précisent les comportements et éléments concrets directement observables (ex. vérifie les sources, compare les dates, repère les biais).",
        "Les critères s'adressent à l'enseignant, alors que les indicateurs s'adressent aux parents d'élèves.",
        "Critère et indicateur sont deux termes parfaitement synonymes et interchangeables."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Le critère pose la dimension évaluée (ex. autonomie, esprit critique) ; les indicateurs fournissent les preuves observables qui attestent de sa maîtrise concrète."
    },
    {
      id: 'q7',
      type: 'qcm',
      title: "7. La concordance pédagogique d'une grille",
      text: "Quel principe garantit la cohérence didactique d'un dispositif d'évaluation dans une leçon FMTTN ?",
      options: [
        "Changer de critères d'évaluation sans prévenir les élèves le jour de l'épreuve.",
        "La chaîne de concordance : Attendu du référentiel ➔ Activité d'apprentissage ➔ Situation d'évaluation ➔ Critère ➔ Indicateur ➔ Niveau de maîtrise.",
        "Évaluer uniquement les compétences acquises en dehors de l'école par les élèves.",
        "Régler la note finale au hasard pour obtenir une courbe de Gauss parfaite."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Une évaluation valide aligne étroitement l'attendu institutionnel, la tâche vécue en classe, le critère d'observation et les descripteurs qualitatifs de progression."
    },
    {
      id: 'q8',
      type: 'open',
      title: "8. Conception d'un critère et de ses descripteurs de maîtrise (Atelier 8)",
      text: "Dans le cadre d'un projet de création d'une capsule vidéo explicative en FMTTN, choisissez le critère « Qualité de la communication » ou « Autonomie ». Définissez pour ce critère 2 indicateurs observables concrets, puis rédigez les descripteurs pour 3 niveaux de maîtrise distincts (À renforcer / En développement / Maîtrisé).",
      points: 6,
      modelAnswer: "Exemple pour le critère 'Qualité de la communication' :\\n- Indicateurs observables : 1. Clarté et intelligibilité de la prise de son (voix audible sans souffle ni saturation) ; 2. Pertinence du rythme et de la lisibilité des textes/schémas affichés à l'écran.\\n- Descripteurs par niveau :\\n  * À renforcer : Le son est inaudible ou saturé, le rythme trop rapide ou confus, les textes à l'écran sont illisibles ou absents.\\n  * En développement : Le son est compréhensible mais avec des bruits parasites ; les explications sont présentes mais le montage manque de fluidité ou les schémas restent surchargés.\\n  * Maîtrisé : Prise de son nette et articulée ; découpage dynamique et équilibré ; les incrustations visuelles complètent et renforcent efficacement le propos oral sans surcharge cognitive.",
      rubricCriteria: [
        "Choix d'un critère pertinent et formulation de 2 indicateurs concrets et observables.",
        "Descripteurs qualitatifs précis évitant les jugements vagues ('bon', 'bien fait').",
        "Progression logique et visible entre les trois niveaux de maîtrise."
      ]
    }
  ],
  'evaluer-cours': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Finalité de l'évaluation dans le référentiel FMTTN",
      text: "Dans le cadre du référentiel FMTTN, à partir de quoi l'évaluation didactique doit-elle être prioritairement pensée ?",
      options: [
        "À partir du logiciel ou du matériel informatique mis à disposition dans la salle de classe.",
        "À partir de la vérification de l'atteinte des attendus (ce que l'élève doit apprendre, démontrer et mobiliser).",
        "À partir de la vitesse de frappe au clavier et de la beauté visuelle des productions.",
        "À partir de la seule note attribuée lors d'un examen théorique de fin d'année."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "L'évaluation se fonde sur les résultats d'apprentissage (attendus du référentiel) et non sur les outils techniques mobilisés ou une simple conformité cosmétique."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. Évaluation des savoir-faire et des compétences",
      text: "Pourquoi les savoir-faire et les compétences numériques doivent-ils être prioritairement évalués en situation complexe (projets, défis, manipulations) plutôt que par un quiz théorique isolé ?",
      options: [
        "Parce que les quiz écrits sont interdits par le décret Paysage.",
        "Parce qu'une compétence implique la mobilisation et la combinaison en contexte de plusieurs ressources (cognitives, techniques, critiques), ce qu'un QCM théorique ne peut mesurer.",
        "Uniquement pour éviter d'imprimer des feuilles de papier en classe.",
        "Parce que les élèves savent toujours utiliser un logiciel sans qu'on ait besoin de vérifier leur démarche."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Connaître une règle (savoir) ne garantit pas la capacité à la mobiliser dans l'action : l'évaluation en situation permet d'observer la démarche authentique et l'adaptation de l'élève face à un problème concret."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. Spécificité de l'évaluation en éducation aux médias",
      text: "Pourquoi est-il insuffisant de demander à un élève de définir ce qu'est une « fake news » ou la « désinformation » pour évaluer ses compétences en éducation aux médias ?",
      options: [
        "Parce que l'éducation aux médias relève du développement d'une posture (réflexivité, esprit critique, discernement) qui se manifeste dans la justification de choix réels et non dans la récitation d'une définition.",
        "Parce que les définitions changent selon les pays et ne sont pas universelles.",
        "Parce que les fake news n'existent plus sur les moteurs de recherche modernes.",
        "Parce que seuls les journalistes professionnels peuvent repérer des fausses informations."
      ],
      correctIndex: 0,
      points: 2,
      explanation: "L'esprit critique est une posture : l'élève doit démontrer sa démarche de doute méthodique, de recoupement de sources et d'argumentation face à un contenu réel (analyses de cas, débats, portfolios)."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. Les objectifs de l'évaluation par les pairs",
      text: "Selon le syllabus, quel est l'un des bénéfices majeurs de l'évaluation par les pairs pour l'élève évaluateur ?",
      options: [
        "L'élève évaluateur remplace définitivement l'enseignant et gagne du temps de correction.",
        "En analysant le travail d'un camarade à l'aide de critères explicites, l'élève développe sa réflexivité et porte un regard plus critique sur sa propre production.",
        "L'élève apprend à sanctionner sévèrement ses camarades avec des notes pénalisantes.",
        "L'évaluation par les pairs sert uniquement à classer les élèves du meilleur au moins bon."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Évaluer autrui avec une grille critériée oblige l'apprenant à s'approprier les critères de réussite, ce qui stimule directement sa propre métacognition et son autorégulation."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. Structuration d'un feedback formatif exploitable",
      text: "Pour qu'un retour d'évaluation par les pairs soit véritablement formateur et actionnable avant la remise finale, quelle formulation doit-on privilégier ?",
      options: [
        "Attribuer une note globale sur 20 sans commentaire écrit.",
        "Écrire des remarques générales comme « Très bien » ou « Pas terrible ».",
        "Fournir un retour qualitatif structuré : identifier au moins une réussite, un point précis d'amélioration et une proposition concrète de modification.",
        "Corriger directement le document à la place de son camarade sans lui expliquer ses erreurs."
      ],
      correctIndex: 2,
      points: 2,
      explanation: "Le triptyque formatif (une réussite, un axe de progression, une recommandation concrète) permet à l'élève récepteur de comprendre exactement comment réviser son prototype."
    },
    {
      id: 'q6',
      type: 'qcm',
      title: "6. Distinction entre critère et indicateur (Jonsson & Svingby, Brookhart & Chen)",
      text: "Dans une grille critériée, quelle est la distinction fondamentale entre un « critère » et un « indicateur » ?",
      options: [
        "Le critère est le barème chiffré en points, tandis que l'indicateur est la moyenne générale.",
        "Le critère désigne la dimension générale de l'apprentissage évaluée (ex. esprit critique), tandis que les indicateurs précisent les comportements et éléments concrets directement observables (ex. vérifie les sources, compare les dates, repère les biais).",
        "Les critères s'adressent à l'enseignant, alors que les indicateurs s'adressent aux parents d'élèves.",
        "Critère et indicateur sont deux termes parfaitement synonymes et interchangeables."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Le critère pose la dimension évaluée (ex. autonomie, esprit critique) ; les indicateurs fournissent les preuves observables qui attestent de sa maîtrise concrète."
    },
    {
      id: 'q7',
      type: 'qcm',
      title: "7. La concordance pédagogique d'une grille",
      text: "Quel principe garantit la cohérence didactique d'un dispositif d'évaluation dans une leçon FMTTN ?",
      options: [
        "Changer de critères d'évaluation sans prévenir les élèves le jour de l'épreuve.",
        "La chaîne de concordance : Attendu du référentiel ➔ Activité d'apprentissage ➔ Situation d'évaluation ➔ Critère ➔ Indicateur ➔ Niveau de maîtrise.",
        "Évaluer uniquement les compétences acquises en dehors de l'école par les élèves.",
        "Régler la note finale au hasard pour obtenir une courbe de Gauss parfaite."
      ],
      correctIndex: 1,
      points: 2,
      explanation: "Une évaluation valide aligne étroitement l'attendu institutionnel, la tâche vécue en classe, le critère d'observation et les descripteurs qualitatifs de progression."
    },
    {
      id: 'q8',
      type: 'open',
      title: "8. Conception d'un critère et de ses descripteurs de maîtrise (Atelier 8)",
      text: "Dans le cadre d'un projet de création d'une capsule vidéo explicative en FMTTN, choisissez le critère « Qualité de la communication » ou « Autonomie ». Définissez pour ce critère 2 indicateurs observables concrets, puis rédigez les descripteurs pour 3 niveaux de maîtrise distincts (À renforcer / En développement / Maîtrisé).",
      points: 6,
      modelAnswer: "Exemple pour le critère 'Qualité de la communication' :\\n- Indicateurs observables : 1. Clarté et intelligibilité de la prise de son (voix audible sans souffle ni saturation) ; 2. Pertinence du rythme et de la lisibilité des textes/schémas affichés à l'écran.\\n- Descripteurs par niveau :\\n  * À renforcer : Le son est inaudible ou saturé, le rythme trop rapide ou confus, les textes à l'écran sont illisibles ou absents.\\n  * En développement : Le son est compréhensible mais avec des bruits parasites ; les explications sont présentes mais le montage manque de fluidité ou les schémas restent surchargés.\\n  * Maîtrisé : Prise de son nette et articulée ; découpage dynamique et équilibré ; les incrustations visuelles complètent et renforcent efficacement le propos oral sans surcharge cognitive.",
      rubricCriteria: [
        "Choix d'un critère pertinent et formulation de 2 indicateurs concrets et observables.",
        "Descripteurs qualitatifs précis évitant les jugements vagues ('bon', 'bien fait').",
        "Progression logique et visible entre les trois niveaux de maîtrise."
      ]
    }
  ],
  '08': [
    {
      id: 'q1',
      type: 'qcm',
      title: "1. Le statut didactique de l'IA dans la conception de supports",
      text: "Selon le syllabus, comment l'intelligence artificielle générative doit-elle être considérée lors de la création de supports pédagogiques et de jeux ?",
      options: [
        "Comme un substitut autonome remplaçant le travail de réflexion de l'enseignant.",
        "Comme un outil d'assistance à la conception, l'enseignant devant conserver la maîtrise des objectifs, des contenus, de la progression et des choix didactiques.",
        "Comme un simple gadget récréatif sans aucune plus-value de production.",
        "Comme un moteur de recherche encyclopédique infaillible ne commettant aucune erreur."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'IA fournit une matière première brute ; l'enjeu didactique réside dans la maîtrise humaine des intentions pédagogiques et des arbitrages de contenu."
    },
    {
      id: 'q2',
      type: 'qcm',
      title: "2. La méthode du « saucissonner la matière » avec ChatGPT",
      text: "Pourquoi est-il fortement recommandé de « saucissonner la matière » plutôt que de demander à ChatGPT de générer l'ensemble des règles ou des cartes en un seul prompt ?",
      options: [
        "Pour contourner la limite de caractères de l'imprimante de l'école.",
        "Pour conserver le contrôle cognitif sur le contenu, vérifier chaque unité séparément et éviter qu'une production massive ne devienne confuse ou sujette aux hallucinations.",
        "Parce que ChatGPT refuse catégoriquement les prompts contenant plus de deux paragraphes.",
        "Uniquement pour faire durer le projet sur plusieurs semaines de cours."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le découpage en unités identifiées permet d'ajuster précisément chaque bloc (objectifs, mécaniques, rédaction) avant d'harmoniser l'ensemble."
    },
    {
      id: 'q3',
      type: 'qcm',
      title: "3. La démarche multimodale avec Google Gemini",
      text: "Dans le cadre de la création visuelle des cartes de jeu, que permet spécifiquement l'approche multimodale avec Google Gemini ?",
      options: [
        "Traduire des fichiers sonores directement en code binaire.",
        "Partir d'une image existante (croquis, photo, gabarit), en analyser les caractéristiques visuelles et demander des transformations, des variations stylistiques ou de nouvelles propositions ciblées.",
        "Copier automatiquement des images protégées par le droit d'auteur sans aucune modification.",
        "Créer des plateaux de jeu physiques sans passer par le FabLab."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Le multimodal permet d'alimenter l'IA avec ses propres références visuelles pour orienter précisément le rendu graphique souhaité."
    },
    {
      id: 'q4',
      type: 'qcm',
      title: "4. La fonction indispensable de Canva dans la chaîne de production",
      text: "Pourquoi une image brute générée par IA ne constitue-t-elle que rarement un produit final directement exploitable pour un jeu de cartes ?",
      options: [
        "Parce que les images d'IA s'effacent automatiquement au bout de 24 heures.",
        "Parce que l'IA produit une matière première visuelle brute qui nécessite recadrage, détourage, hiérarchie typographique, harmonisation de la charte et gabarit d'impression.",
        "Parce que le logiciel Canva interdit l'importation de visuels créés par des algorithmes génératifs.",
        "Parce que les cartes de jeu ne doivent comporter aucun texte écrit."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "Canva assure la finalisation ergonomique et éditoriale : calibrage aux formats réels de cartes, contrastes, ajout de pictogrammes et lisibilité des textes."
    },
    {
      id: 'q5',
      type: 'qcm',
      title: "5. La cohérence d'un avatar récurrent sur différentes cartes",
      text: "Pour maintenir la cohérence visuelle d'un personnage de jeu à travers différentes cartes et postures, quelle démarche le syllabus préconise-t-il ?",
      options: [
        "Réécrire un prompt totalement imprécis et différent à chaque tirage sans garder de trace.",
        "Établir une fiche d'identité visuelle détaillée (physique, tenue, palette de couleurs, accessoires, style) et la réutiliser comme ancrage permanent, éventuellement via un agent dédié (Gem ou Mistral).",
        "Demander à l'IA de choisir elle-même un nouveau personnage à chaque génération.",
        "Abandonner toute illustration de personnage pour ne mettre que du texte brut sur les cartes."
      ],
      correctIndex: 1,
      points: 3,
      explanation: "L'ancrage d'une fiche d'identité descriptive et la conservation d'images de référence réduisent les dérives stylistiques inhérentes aux modèles génératifs."
    },
    {
      id: 'q6',
      type: 'open',
      title: "6. Réflexivité sur l'Exercice 11 (Création des supports du jeu avec l'IA)",
      text: "À partir de votre travail de conception des cartes, du logo et du manuel de règles de votre jeu (Exercice 11), quelles difficultés majeures avez-vous rencontrées dans l'interaction avec les outils d'IA (ex : hallucinations textuelles de ChatGPT, incohérences visuelles de Gemini, contraintes de cadrage dans Canva) ? Comment vos ajustements successifs de prompts et vos choix de mise en page ont-ils permis de transformer cette matière brute générée en supports ludo-pédagogiques rigoureux et jouables ?",
      points: 5,
      modelAnswer: "Exemple de retour réflexif : Lors de la conception de notre jeu, nous avons d'abord été confrontés à des règles trop génériques produites par ChatGPT, qui omettait certaines conditions de victoire. Nous avons appliqué la méthode du saucissonnement en lui faisant rédiger chaque phase de tour isolément, puis en reformulant nous-mêmes les cas litigieux. Côté cartes, Gemini modifiait constamment le style de notre personnage enquêteur ; nous avons stabilisé une fiche d'identité visuelle (3D cartoon, veste jaune, loupe) et importé les fonds sous Canva pour harmoniser les bordures et les cartouches de texte. Ce processus a montré que l'IA ne remplace pas l'intention pédagogique : elle accélère la création graphique et textuelle mais exige un arbitrage critique permanent sur la jouabilité et la clarté des consignes.",
      rubricCriteria: [
        "Identification précise d'au moins une difficulté technique ou conceptuelle rencontrée avec les IA.",
        "Explicitation des stratégies d'ajustement déployées (saucissonnage de prompt, fiche d'identité, post-traitement Canva).",
        "Analyse critique de la valeur ajoutée et des limites de l'IA dans l'ergonomie finale du jeu."
      ]
    }
  ]
}

// Fallback générique si le module n'a pas encore de pack spécifique
const FALLBACK_QUESTIONS = [
  {
    id: 'gen-q1',
    type: 'qcm',
    title: "1. Compréhension du concept clé",
    text: "Quelle est l'idée centrale développée dans ce chapitre de didactique du numérique ?",
    options: [
      "Le numérique se suffit à lui-même et remplace la posture pédagogique de l'enseignant.",
      "La technologie doit être subordonnée à une intention pédagogique claire et susciter une posture réflexive chez l'apprenant.",
      "L'important est d'utiliser le plus grand nombre d'outils numériques différents dans une leçon.",
      "Les manuels scolaires traditionnels doivent être systématiquement abandonnés."
    ],
    correctIndex: 1,
    points: 3,
    explanation: "La plus-value du numérique dépend de l'ingénierie pédagogique déployée et de l'activité cognitive réelle de l'élève."
  },
  {
    id: 'gen-q2',
    type: 'qcm',
    title: "2. Évaluation des apprentissages",
    text: "Dans une perspective d'évaluation diagnostique ou formative, comment doit-on traiter l'erreur d'un élève face à un outil numérique ?",
    options: [
      "Comme une faute éliminatoire sanctionnée par une note négative.",
      "Comme un indice précieux sur ses représentations mentales et une opportunité de remédiation didactique.",
      "Comme la preuve qu'il ne faut plus lui confier d'appareil numérique.",
      "En ignorant l'erreur pour ne pas décourager l'élève."
    ],
    correctIndex: 1,
    points: 3,
    explanation: "L'erreur fait partie intégrante du processus d'apprentissage et permet d'ajuster l'étayage pédagogique."
  },
  {
    id: 'gen-q3',
    type: 'open',
    title: "3. Transposition didactique personnelle",
    text: "En quelques lignes, expliquez comment vous comptez réinvestir concrètement les concepts théoriques de cette partie dans vos futures préparations de cours en stage.",
    points: 4,
    modelAnswer: "Expliciter le lien entre la théorie étudiée (cadres conceptuels, progression spiralaire, obstacles cognitifs) et sa déclinaison pratique dans une activité d'apprentissage ou une grille d'évaluation formative.",
    rubricCriteria: [
      "Mobilisation explicite d'au moins un concept abordé dans le module.",
      "Ancrage dans une situation d'enseignement réaliste (stage, leçon, consigne élève).",
      "Clarté de la formulation et esprit de synthèse."
    ]
  }
]

// Données réactives du Quiz
const questions = computed(() => {
  if (props.customQuestions && props.customQuestions.length > 0) {
    return props.customQuestions
  }
  return MODULE_QUESTIONS[props.moduleId] || FALLBACK_QUESTIONS
})

const userAnswers = ref({})
const openSelfScores = ref({})
const isSubmitted = ref(false)
const showCorrection = ref(false)
const saveSuccess = ref(false)

// Authentification rapide si non connecté
const inlineFirst = ref('')
const inlineLast = ref('')
const inlineEmail = ref('')

const currentUser = computed(() => userStore.currentUser)

// Dernier essai enregistré
const lastAttempt = computed(() => {
  const attempts = userStore.getUserQuizAttempts()
  return attempts.find(a => a.moduleId === props.moduleId)
})

// Calcul du score total
const maxPoints = computed(() => {
  return questions.value.reduce((acc, q) => acc + (q.points || 1), 0)
})

const earnedScore = computed(() => {
  let score = 0
  questions.value.forEach(q => {
    if (q.type === 'qcm') {
      if (userAnswers.value[q.id] === q.correctIndex) {
        score += (q.points || 1)
      }
    } else if (q.type === 'open') {
      const selfSc = openSelfScores.value[q.id]
      if (typeof selfSc === 'number') {
        score += selfSc
      } else {
        // Score par défaut si du texte a été saisi
        const text = userAnswers.value[q.id] || ''
        if (text.trim().length > 30) {
          score += (q.points || 4) * 0.75 // 75% par défaut si réponse fournie
        }
      }
    }
  })
  return Math.round(score * 10) / 10
})

const scorePercentage = computed(() => {
  if (maxPoints.value === 0) return 0
  return Math.round((earnedScore.value / maxPoints.value) * 100)
})

// Diagnostic formatif selon le pourcentage
const diagnosticLevel = computed(() => {
  const pct = scorePercentage.value
  if (pct >= 85) {
    return {
      title: '🏆 Maîtrise Experte & Approfondie',
      badgeClass: 'diag-expert',
      message: "Félicitations ! Vous maîtrisez parfaitement les concepts didactiques de cette partie. Vos capacités d'analyse critique sont solides."
    }
  } else if (pct >= 65) {
    return {
      title: '🎯 Bonne Compréhension Opérationnelle',
      badgeClass: 'diag-good',
      message: "Les fondamentaux sont acquis. Prenez le temps de relire les pistes réflexives et la dimension critique pour perfectionner vos futures préparations."
    }
  } else if (pct >= 50) {
    return {
      title: '⚠️ Compréhension Partielle',
      badgeClass: 'diag-medium',
      message: "Certaines notions clés restent à consolider. Relisez attentivement les passages surlignés dans les encadrés didactiques du syllabus avant l'atelier."
    }
  } else {
    return {
      title: '🔄 Révision Nécessaire',
      badgeClass: 'diag-low',
      message: "Ce diagnostic indique des difficultés sur les concepts fondamentaux de cette partie. N'hésitez pas à relire le texte complet et à poser vos questions au formateur."
    }
  }
})

function submitQuiz() {
  // Vérifier qu'au moins une réponse a été donnée
  const hasAnswer = Object.keys(userAnswers.value).some(k => {
    const val = userAnswers.value[k]
    return val !== undefined && val !== null && val !== ''
  })

  if (!hasAnswer) {
    alert("Veuillez répondre au moins à une question avant de valider le quiz.")
    return
  }

  isSubmitted.value = true
  showCorrection.value = true

  // Préparer les réponses formatées
  const formattedAnswers = questions.value.map(q => {
    if (q.type === 'qcm') {
      const ans = userAnswers.value[q.id]
      const isCorrect = ans === q.correctIndex
      return {
        questionId: q.id,
        questionText: q.text,
        type: 'qcm',
        userAnswer: ans !== undefined ? q.options[ans] : 'Non répondu',
        correctAnswer: q.options[q.correctIndex],
        isCorrect,
        points: isCorrect ? q.points : 0,
        maxPoints: q.points,
        explanation: q.explanation
      }
    } else {
      const text = userAnswers.value[q.id] || 'Non répondu'
      const pts = openSelfScores.value[q.id] !== undefined 
        ? openSelfScores.value[q.id] 
        : (text.length > 30 ? (q.points * 0.75) : 0)

      return {
        questionId: q.id,
        questionText: q.text,
        type: 'open',
        userAnswer: text,
        points: pts,
        maxPoints: q.points,
        explanation: q.modelAnswer,
        openFeedback: "Auto-évaluation sur base des critères du syllabus."
      }
    }
  })

  // Enregistrement automatique si déjà connecté
  if (currentUser.value) {
    userStore.saveQuizAttempt({
      moduleId: props.moduleId,
      moduleTitle: props.moduleTitle || `Module ${props.moduleId}`,
      score: earnedScore.value,
      totalPoints: maxPoints.value,
      percentage: scorePercentage.value,
      answers: formattedAnswers
    })
    saveSuccess.value = true
  }
}

function handleSaveWithAuth() {
  if (!inlineFirst.value || !inlineLast.value || !inlineEmail.value) {
    alert("Veuillez renseigner votre prénom, nom et email étudiant pour associer votre score à votre dossier.")
    return
  }

  userStore.register(inlineFirst.value, inlineLast.value, inlineEmail.value)

  // Enregistrer le quiz pour ce nouvel utilisateur
  submitQuiz()
}

function retakeQuiz() {
  userAnswers.value = {}
  openSelfScores.value = {}
  isSubmitted.value = false
  showCorrection.value = false
  saveSuccess.value = false
}
</script>

<template>
  <div class="quiz-container">
    <!-- En-tête du Quiz -->
    <div class="quiz-header">
      <div class="quiz-badge-wrap">
        <span class="quiz-chip">📝 ÉVALUATION DIAGNOSTIQUE</span>
        <span class="quiz-chip-module">{{ moduleId }}</span>
      </div>
      <h3 class="quiz-headline">Testez votre compréhension didactique</h3>
      <p class="quiz-intro">
        Vérifiez vos acquis sur cette partie grâce à ce questionnaire combinant questions à choix multiples et réflexion didactique ouverte. Vos résultats sont enregistrés pour suivre votre progression.
      </p>

      <!-- Si déjà complété antérieurement -->
      <div v-if="lastAttempt && !isSubmitted" class="previous-attempt-banner">
        <div class="prev-info">
          <span>Dernier résultat enregistré : <strong>{{ lastAttempt.score }} / {{ lastAttempt.totalPoints }}</strong> ({{ lastAttempt.percentage }}%)</span>
          <span class="prev-date">le {{ lastAttempt.submittedAt }}</span>
        </div>
        <button class="btn-retake-small" @click="retakeQuiz">Recommencer le test</button>
      </div>
    </div>

    <!-- Questions Form -->
    <div class="quiz-body">
      <div 
        v-for="(q, idx) in questions" 
        :key="q.id" 
        class="quiz-card"
        :class="{
          'answered': userAnswers[q.id] !== undefined,
          'correct-card': isSubmitted && q.type === 'qcm' && userAnswers[q.id] === q.correctIndex,
          'incorrect-card': isSubmitted && q.type === 'qcm' && userAnswers[q.id] !== q.correctIndex && userAnswers[q.id] !== undefined
        }"
      >
        <div class="question-header">
          <span class="q-num">Question {{ idx + 1 }}</span>
          <span class="q-points">{{ q.points }} pts</span>
        </div>

        <h4 class="q-title">{{ q.title || `Question ${idx + 1}` }}</h4>
        <p class="q-text">{{ q.text }}</p>

        <!-- TYPE QCM -->
        <div v-if="q.type === 'qcm'" class="q-options">
          <label 
            v-for="(opt, optIdx) in q.options" 
            :key="optIdx" 
            class="q-option-label"
            :class="{
              'selected': userAnswers[q.id] === optIdx,
              'correct-highlight': showCorrection && optIdx === q.correctIndex,
              'wrong-highlight': showCorrection && userAnswers[q.id] === optIdx && optIdx !== q.correctIndex,
              'disabled': isSubmitted
            }"
          >
            <input 
              type="radio" 
              :name="`q_${q.id}`" 
              :value="optIdx" 
              v-model="userAnswers[q.id]"
              :disabled="isSubmitted"
              class="q-radio"
            />
            <span class="opt-text">{{ opt }}</span>
            <span v-if="showCorrection && optIdx === q.correctIndex" class="feedback-icon correct">✓ Bonne réponse</span>
            <span v-else-if="showCorrection && userAnswers[q.id] === optIdx && optIdx !== q.correctIndex" class="feedback-icon wrong">✗ Erreur</span>
          </label>

          <!-- Explication de la correction -->
          <div v-if="showCorrection && q.explanation" class="correction-box">
            <strong>💡 Éclairage didactique :</strong>
            <p>{{ q.explanation }}</p>
          </div>
        </div>

        <!-- TYPE QUESTION OUVERTE -->
        <div v-else-if="q.type === 'open'" class="q-open-wrap">
          <textarea 
            v-model="userAnswers[q.id]" 
            :disabled="isSubmitted"
            placeholder="Rédigez ici votre réflexion pédagogique argumentée..."
            class="open-textarea"
            rows="4"
          ></textarea>

          <!-- Correction & Corrigé type -->
          <div v-if="showCorrection" class="open-correction-box">
            <div class="model-answer-header">
              <span>📋 Éléments attendus du syllabus & Critères d'analyse :</span>
            </div>
            <p class="model-answer-text">{{ q.modelAnswer }}</p>

            <div v-if="q.rubricCriteria" class="rubric-list">
              <span class="rubric-label">Critères de réussite observables :</span>
              <ul>
                <li v-for="(crit, cIdx) in q.rubricCriteria" :key="cIdx">{{ crit }}</li>
              </ul>
            </div>

            <!-- Auto-évaluation du score pour la question ouverte -->
            <div class="self-scoring-zone">
              <span class="self-score-label">Auto-évaluez votre réponse :</span>
              <div class="score-pills">
                <button 
                  v-for="pt in (q.points + 1)" 
                  :key="pt - 1"
                  type="button"
                  class="score-pill"
                  :class="{ 'active': openSelfScores[q.id] === (pt - 1) }"
                  @click="openSelfScores[q.id] = (pt - 1)"
                >
                  {{ pt - 1 }} / {{ q.points }} pt{{ (pt - 1) > 1 ? 's' : '' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action & Résultat final -->
    <div class="quiz-footer">
      <div v-if="!isSubmitted" class="submit-action-zone">
        <button class="btn-validate-quiz" @click="submitQuiz">
          Valider mes réponses & Obtenir le diagnostic
        </button>
      </div>

      <!-- Zone de résultat après validation -->
      <div v-else class="results-panel">
        <div class="score-summary-card">
          <div class="score-circle" :class="diagnosticLevel.badgeClass">
            <span class="score-num">{{ earnedScore }}</span>
            <span class="score-max">/ {{ maxPoints }}</span>
          </div>

          <div class="score-details">
            <div class="diag-header-line">
              <h4 class="diag-title">{{ diagnosticLevel.title }}</h4>
              <span class="score-pct-badge">{{ scorePercentage }}% de réussite</span>
            </div>
            <p class="diag-msg">{{ diagnosticLevel.message }}</p>
          </div>
        </div>

        <!-- Notification de synchronisation ou formulaire d'association -->
        <div v-if="currentUser" class="sync-status success">
          ✓ Vos résultats ont été enregistrés avec succès dans votre dossier étudiant (<strong>{{ currentUser.firstName }} {{ currentUser.lastName }}</strong>). Votre formateur peut les consulter.
        </div>
        <div v-else class="sync-auth-prompt">
          <p class="auth-prompt-msg">
            💡 Vous n'êtes pas connecté. Pour enregistrer cette note sur votre <strong>Espace Membre</strong> et dans le tableau de bord enseignant, renseignez votre identité :
          </p>
          <div class="mini-auth-row">
            <input v-model="inlineFirst" type="text" placeholder="Prénom" class="mini-input" />
            <input v-model="inlineLast" type="text" placeholder="Nom" class="mini-input" />
            <input v-model="inlineEmail" type="email" placeholder="prenom.nom@student.hech.be" class="mini-input" />
            <button class="btn-link-score" @click="handleSaveWithAuth">Enregistrer mon score</button>
          </div>
        </div>

        <!-- Bouton Recommencer -->
        <div class="footer-actions">
          <button class="btn-retake-primary" @click="retakeQuiz">
            🔄 Recommencer ce quiz
          </button>
          <a href="/espace-membre" class="btn-go-dashboard">
            Consulter mes résultats sur mon Espace Membre →
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-container {
  margin: 3rem 0;
  padding: 2rem;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.04);
}

.quiz-badge-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.8rem;
}

.quiz-chip {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.quiz-chip-module {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-weight: 700;
  font-size: 0.75rem;
  padding: 4px 10px;
  border-radius: 6px;
}

.quiz-headline {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 0 0 0.5rem 0;
}

.quiz-intro {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.previous-attempt-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(16, 185, 129, 0.08);
  border-left: 4px solid #10b981;
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.prev-info {
  font-size: 0.9rem;
  color: #065f46;
}

.prev-date {
  font-size: 0.8rem;
  opacity: 0.8;
  margin-left: 8px;
}

.btn-retake-small {
  background: white;
  border: 1px solid #10b981;
  color: #059669;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-retake-small:hover {
  background: #10b981;
  color: white;
}

.quiz-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.quiz-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 1.4rem;
  transition: border-color 0.2s;
}

.quiz-card.answered {
  border-color: rgba(99, 102, 241, 0.4);
}

.quiz-card.correct-card {
  border-left: 5px solid #10b981;
}

.quiz-card.incorrect-card {
  border-left: 5px solid #ef4444;
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.q-num {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.q-points {
  font-size: 0.8rem;
  font-weight: 600;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-2);
  padding: 2px 8px;
  border-radius: 4px;
}

.q-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.4rem 0;
}

.q-text {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1.2rem;
}

.q-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.q-option-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0.85rem 1.1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  cursor: pointer;
  background: var(--vp-c-bg-soft);
  transition: all 0.2s ease;
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
  position: relative;
}

.q-option-label:hover:not(.disabled) {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.q-option-label.selected {
  border-color: var(--vp-c-brand-1);
  background: rgba(99, 102, 241, 0.08);
}

.q-option-label.correct-highlight {
  border-color: #10b981 !important;
  background: rgba(16, 185, 129, 0.1) !important;
}

.q-option-label.wrong-highlight {
  border-color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.1) !important;
}

.feedback-icon {
  margin-left: auto;
  font-size: 0.8rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
}

.feedback-icon.correct {
  background: #10b981;
  color: white;
}

.feedback-icon.wrong {
  background: #ef4444;
  color: white;
}

.correction-box {
  margin-top: 1rem;
  background: rgba(99, 102, 241, 0.06);
  border-left: 4px solid #6366f1;
  padding: 0.9rem 1.2rem;
  border-radius: 0 8px 8px 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

.open-textarea {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.85rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  font-size: 0.92rem;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.2s;
}

.open-textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.open-correction-box {
  margin-top: 1.2rem;
  background: rgba(59, 130, 246, 0.05);
  border-left: 4px solid #3b82f6;
  padding: 1.1rem;
  border-radius: 0 10px 10px 0;
}

.model-answer-header {
  font-weight: 700;
  font-size: 0.92rem;
  color: #1e40af;
  margin-bottom: 0.5rem;
}

.model-answer-text {
  font-size: 0.9rem;
  color: var(--vp-c-text-1);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.rubric-list {
  background: white;
  border: 1px solid rgba(59, 130, 246, 0.2);
  padding: 0.8rem 1.2rem;
  border-radius: 6px;
  margin-bottom: 1rem;
}

.rubric-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #3b82f6;
  text-transform: uppercase;
}

.rubric-list ul {
  margin: 0.4rem 0 0 1.2rem;
  padding: 0;
  font-size: 0.88rem;
  color: var(--vp-c-text-2);
}

.self-scoring-zone {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  padding-top: 0.8rem;
  border-top: 1px dashed rgba(59, 130, 246, 0.3);
}

.self-score-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.score-pills {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.score-pill {
  background: white;
  border: 1px solid var(--vp-c-divider);
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--vp-c-text-2);
}

.score-pill:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.score-pill.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.quiz-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--vp-c-divider);
}

.btn-validate-quiz {
  width: 100%;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(79, 70, 229, 0.25);
  transition: transform 0.2s, box-shadow 0.2s;
}

.btn-validate-quiz:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
}

.results-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.score-summary-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  padding: 1.5rem;
  border-radius: 14px;
}

.score-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.score-circle.diag-expert {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.score-circle.diag-good {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.score-circle.diag-medium {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.score-circle.diag-low {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.score-num {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
}

.score-max {
  font-size: 0.85rem;
  opacity: 0.85;
}

.diag-header-line {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0.4rem;
}

.diag-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 0;
}

.score-pct-badge {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 3px 8px;
  border-radius: 6px;
}

.diag-msg {
  font-size: 0.92rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin: 0;
}

.sync-status.success {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid #10b981;
  color: #065f46;
  padding: 0.9rem 1.2rem;
  border-radius: 8px;
  font-size: 0.92rem;
}

.sync-auth-prompt {
  background: rgba(99, 102, 241, 0.06);
  border: 1px dashed #6366f1;
  padding: 1.2rem;
  border-radius: 10px;
}

.auth-prompt-msg {
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
  margin: 0 0 0.8rem 0;
}

.mini-auth-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mini-input {
  flex: 1;
  min-width: 140px;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.88rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.btn-link-score {
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.88rem;
  cursor: pointer;
}

.footer-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-retake-primary {
  background: var(--vp-c-default-soft);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-retake-primary:hover {
  background: var(--vp-c-bg);
  border-color: var(--vp-c-brand-1);
}

.btn-go-dashboard {
  display: inline-flex;
  align-items: center;
  background: var(--vp-c-brand-1);
  color: white !important;
  text-decoration: none !important;
  padding: 8px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.92rem;
}
</style>

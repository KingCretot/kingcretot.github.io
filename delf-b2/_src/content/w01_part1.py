# KCE DELF B2 - Week 1 content, part 1: meta, welcome, lexicon, grammar.
# Authoring conventions (see /home/claude/delf/SCHEMA.md):
#  - French typography (espaces insecables) is applied by the builder; write normal spaces before ; : ! ? and inside « ».
#  - MCQ options are written CORRECT FIRST; the builder shuffles positions and records "answer".

META = {
    "schemaVersion": 1,
    "course": "delf-b2",
    "id": "w01",
    "week": 1,
    "mode": "week",
    "title": {"fr": "L'information à l'ère de l'IA", "en": "Information in the age of AI"},
    "subtitle": {"fr": "Réseaux sociaux, désinformation, deepfakes", "en": "Social media, disinformation, deepfakes"},
    "audioBase": "audio/week01/",
    "next": {"href": "week02.html", "available": False,
             "label": {"fr": "Semaine 2 : Le travail aujourd'hui", "en": "Week 2: Work today"}},
    "hub": "index.html",
}

WELCOME = {
    "id": "accueil", "type": "welcome", "label": {"fr": "Accueil", "en": "Welcome"},
    "intro": {
        "fr": "Cette semaine, vous travaillez sur un thème au cœur de l'actualité : la façon dont nous nous informons à l'heure des réseaux sociaux et de l'intelligence artificielle. Vous allez vous entraîner aux quatre épreuves du DELF B2 exactement dans le format de l'examen.",
        "en": "This week you work on a theme at the heart of current events: how we get our news in the age of social media and artificial intelligence. You will practice all four DELF B2 papers in exactly the exam format."},
    "objectives": [
        {"fr": "Maîtriser le vocabulaire de l'information, de la désinformation et des réseaux sociaux.", "en": "Master the vocabulary of news, disinformation and social media."},
        {"fr": "Raconter et analyser un événement passé avec le passé composé, l'imparfait et le plus-que-parfait.", "en": "Narrate and analyze a past event with the passé composé, imparfait and plus-que-parfait."},
        {"fr": "Utiliser les pronoms relatifs simples et composés pour construire des phrases complexes.", "en": "Use simple and compound relative pronouns to build complex sentences."},
        {"fr": "Comprendre l'attitude, les intentions et les nuances d'un locuteur ou d'un auteur.", "en": "Understand a speaker's or writer's attitude, intentions and nuances."},
        {"fr": "Rédiger une contribution argumentée à un forum (250 mots minimum).", "en": "Write an argued forum contribution (at least 250 words)."},
        {"fr": "Présenter et défendre un point de vue à l'oral à partir d'un document déclencheur.", "en": "Present and defend a point of view orally based on a trigger document."},
    ],
    "plan": [
        {"fr": "Lexique et exercice", "en": "Vocabulary and practice", "min": 40},
        {"fr": "Outils de langue", "en": "Language tools", "min": 60},
        {"fr": "Compréhension de l'oral (3 exercices + correction)", "en": "Listening (3 exercises + review)", "min": 50},
        {"fr": "Compréhension des écrits (3 exercices + correction)", "en": "Reading (3 exercises + review)", "min": 80},
        {"fr": "Production écrite (60 min + relecture du modèle)", "en": "Writing (60 min + model review)", "min": 80},
        {"fr": "Production orale (30 min de préparation + 20 min de passage)", "en": "Speaking (30 min prep + 20 min test)", "min": 60},
        {"fr": "Bilan", "en": "Review", "min": 15},
    ],
    "strategy": {
        "title": {"fr": "Stratégie : comment fonctionne le DELF B2", "en": "Strategy: how the DELF B2 works"},
        "html": {
            "fr": "<p>Le DELF B2 comporte quatre épreuves notées chacune sur 25 points. Pour obtenir le diplôme, il faut <strong>au moins 50/100</strong> au total <strong>et au moins 5/25 dans chaque épreuve</strong>. Le diplôme est valable à vie. Le dictionnaire est interdit.</p>"
                  "<table class='fmt'><thead><tr><th>Épreuve</th><th>Durée</th><th>Format</th></tr></thead><tbody>"
                  "<tr><td>Compréhension de l'oral</td><td>env. 30 min</td><td>3 exercices, 5 enregistrements, 20 questions à choix multiple (A, B, C)</td></tr>"
                  "<tr><td>Compréhension des écrits</td><td>60 min</td><td>3 exercices, 5 textes, 20 questions à choix multiple</td></tr>"
                  "<tr><td>Production écrite</td><td>60 min</td><td>un texte argumenté de 250 mots minimum</td></tr>"
                  "<tr><td>Production orale</td><td>30 min de préparation, 20 min de passage</td><td>monologue suivi (5 à 7 min) puis débat avec l'examinateur (10 à 13 min)</td></tr>"
                  "</tbody></table>"
                  "<h4>Lire les questions avant d'écouter</h4>"
                  "<ul>"
                  "<li>Utilisez tout le temps de lecture : soulignez mentalement le mot-clé de chaque question (qui ? quoi ? pourquoi ? quelle attitude ?).</li>"
                  "<li>Les questions suivent l'ordre du document : quand vous entendez la réponse à la question 3, la réponse à la question 2 est déjà passée.</li>"
                  "<li>Méfiez-vous de l'option qui reprend exactement un mot entendu : au niveau B2, la bonne réponse est presque toujours une <strong>reformulation</strong>.</li>"
                  "<li>Repérez les questions sur l'attitude ou l'intention (« Que veut montrer… ? », « Comment réagit… ? ») : la réponse dépend du ton et des connecteurs (mais, pourtant, en revanche), pas d'un seul mot.</li>"
                  "<li>Pendant la première écoute, répondez à ce qui est sûr ; pendant la seconde, vérifiez et complétez.</li>"
                  "</ul>"
                  "<p class='small'>Dans ce cours, vous disposez d'une minute de lecture avant les exercices 1 et 2 et de 30 secondes avant chaque document de l'exercice 3. Le jour de l'examen, suivez les consignes et les temps annoncés sur l'enregistrement officiel.</p>",
            "en": "<p>The DELF B2 has four papers, each scored out of 25. To earn the diploma you need <strong>at least 50/100</strong> overall <strong>and at least 5/25 on every paper</strong>. The diploma is valid for life. Dictionaries are not allowed.</p>"
                  "<p>Listening: about 30 minutes, 3 exercises, 5 recordings, 20 multiple-choice items (A, B, C). Reading: 60 minutes, 3 exercises, 5 texts, 20 multiple-choice items. Writing: 60 minutes, one argued text of at least 250 words. Speaking: 30 minutes of preparation, then 20 minutes: a 5–7 minute monologue followed by a 10–13 minute debate with the examiner.</p>"
                  "<p><strong>Reading the questions before listening:</strong> use all of the reading time and spot the key word of each question; questions follow the order of the recording; be wary of an option that repeats a word you hear, because at B2 the right answer is almost always a <strong>rephrasing</strong>; questions about attitude or intention depend on tone and linking words (but, yet, on the other hand), not on a single word; on the first listening answer what you are sure of, and on the second check and complete.</p>"
                  "<p>In this course you get one minute of reading time before Exercises 1 and 2 and 30 seconds before each recording in Exercise 3. On exam day, follow the instructions and timings announced on the official recording.</p>"},
    },
}

LEXICON = {
    "id": "lexique", "type": "lexicon", "label": {"fr": "Lexique", "en": "Vocabulary"},
    "intro": {"fr": "Trente mots et expressions que vous allez retrouver dans tous les documents de la semaine. Lisez chaque exemple à voix haute, puis faites l'exercice.",
              "en": "Thirty words and expressions you will meet in every document this week. Read each example aloud, then do the exercise."},
    "groups": [
        {"title": {"fr": "S'informer", "en": "Getting the news"}, "items": [
            {"fr": "une source fiable", "en": "a reliable source", "ex": "Avant de partager une information, vérifiez qu'elle provient d'une source fiable.", "exEn": "Before sharing a piece of news, check that it comes from a reliable source."},
            {"fr": "le fil d'actualité", "en": "news feed", "ex": "Mon fil d'actualité est rempli de vidéos que je n'ai jamais demandé à voir.", "exEn": "My news feed is full of videos I never asked to see."},
            {"fr": "une rédaction", "en": "a newsroom, editorial team", "ex": "La rédaction a passé deux jours à vérifier ces images.", "exEn": "The newsroom spent two days checking these images."},
            {"fr": "relayer une information", "en": "to pass on, spread a piece of news", "ex": "De nombreux comptes ont relayé l'information sans la vérifier.", "exEn": "Many accounts spread the news without checking it."},
            {"fr": "un démenti / démentir", "en": "a (public) denial / to deny", "ex": "La mairie a publié un démenti le soir même.", "exEn": "City hall issued a denial that same evening."},
            {"fr": "un rectificatif", "en": "a published correction", "ex": "Le journal a publié un rectificatif dans son édition du lendemain.", "exEn": "The paper ran a correction in the next day's edition."},
            {"fr": "la vérification des faits", "en": "fact-checking", "ex": "La vérification des faits prend du temps, alors que les rumeurs vont vite.", "exEn": "Fact-checking takes time, whereas rumors travel fast."},
            {"fr": "recouper ses sources", "en": "to cross-check one's sources", "ex": "Une bonne journaliste recoupe toujours ses sources avant de publier.", "exEn": "A good journalist always cross-checks her sources before publishing."},
        ]},
        {"title": {"fr": "Désinformation et IA", "en": "Disinformation and AI"}, "items": [
            {"fr": "la désinformation", "en": "disinformation", "ex": "La désinformation se nourrit de nos émotions.", "exEn": "Disinformation feeds on our emotions."},
            {"fr": "une infox", "en": "fake news (official French term)", "ex": "Cette infox a été partagée des milliers de fois avant d'être démentie.", "exEn": "This piece of fake news was shared thousands of times before being denied."},
            {"fr": "un hypertrucage (un deepfake)", "en": "a deepfake", "ex": "Grâce à l'IA, un hypertrucage peut être fabriqué en quelques minutes.", "exEn": "Thanks to AI, a deepfake can be made in a few minutes."},
            {"fr": "un contenu généré par l'IA", "en": "AI-generated content", "ex": "Certains pays veulent obliger les plateformes à signaler les contenus générés par l'IA.", "exEn": "Some countries want to require platforms to label AI-generated content."},
            {"fr": "truquer / un trucage", "en": "to doctor, fake / a fake, doctoring", "ex": "La photo avait été truquée pour faire croire à une manifestation géante.", "exEn": "The photo had been doctored to suggest a huge protest."},
            {"fr": "un montage", "en": "an edit, a doctored composite", "ex": "Les experts ont rapidement prouvé que la vidéo était un montage.", "exEn": "Experts quickly proved the video was a doctored edit."},
            {"fr": "manipuler l'opinion", "en": "to manipulate public opinion", "ex": "Ces faux comptes cherchaient à manipuler l'opinion avant les élections.", "exEn": "These fake accounts were trying to manipulate public opinion before the elections."},
            {"fr": "le complotisme / une théorie du complot", "en": "conspiracy thinking / a conspiracy theory", "ex": "Le complotisme prospère quand la confiance dans les institutions recule.", "exEn": "Conspiracy thinking thrives when trust in institutions declines."},
            {"fr": "se faire piéger / se faire avoir (fam.)", "en": "to be fooled, taken in", "ex": "Même des journalistes expérimentés se sont fait piéger par cette image.", "exEn": "Even experienced journalists were fooled by this image."},
            {"fr": "un filigrane", "en": "a watermark", "ex": "Un filigrane invisible pourrait indiquer qu'une image a été créée par une machine.", "exEn": "An invisible watermark could show that an image was created by a machine."},
        ]},
        {"title": {"fr": "Réseaux sociaux", "en": "Social media"}, "items": [
            {"fr": "un algorithme de recommandation", "en": "a recommendation algorithm", "ex": "L'algorithme de recommandation met en avant les vidéos qui font réagir.", "exEn": "The recommendation algorithm promotes videos that get reactions."},
            {"fr": "la bulle de filtres", "en": "the filter bubble", "ex": "Enfermés dans une bulle de filtres, nous ne voyons plus que des avis proches des nôtres.", "exEn": "Trapped in a filter bubble, we only see opinions close to our own."},
            {"fr": "devenir viral / la viralité", "en": "to go viral / virality", "ex": "Sa vidéo est devenue virale en une nuit.", "exEn": "Her video went viral overnight."},
            {"fr": "susciter l'indignation", "en": "to provoke outrage", "ex": "Les contenus qui suscitent l'indignation sont les plus partagés.", "exEn": "Content that provokes outrage is shared the most."},
            {"fr": "la modération des contenus", "en": "content moderation", "ex": "La modération des contenus repose encore beaucoup sur des humains.", "exEn": "Content moderation still relies heavily on people."},
            {"fr": "signaler un contenu", "en": "to report content", "ex": "Si un message vous semble haineux, vous pouvez le signaler à la plateforme.", "exEn": "If a post seems hateful to you, you can report it to the platform."},
            {"fr": "le harcèlement en ligne", "en": "online harassment", "ex": "Le harcèlement en ligne poursuit les victimes jusque chez elles.", "exEn": "Online harassment follows victims all the way into their homes."},
            {"fr": "un internaute / une internaute", "en": "an Internet user", "ex": "Des milliers d'internautes ont commenté la vidéo.", "exEn": "Thousands of Internet users commented on the video."},
        ]},
        {"title": {"fr": "Pour argumenter", "en": "For arguing"}, "items": [
            {"fr": "l'esprit critique", "en": "critical thinking", "ex": "L'école doit aider les élèves à développer leur esprit critique.", "exEn": "School must help students develop their critical thinking."},
            {"fr": "remettre en cause", "en": "to question, challenge", "ex": "Cette étude remet en cause une idée reçue.", "exEn": "This study challenges a common assumption."},
            {"fr": "être à double tranchant", "en": "to be a double-edged sword", "ex": "La rapidité des réseaux sociaux est à double tranchant.", "exEn": "The speed of social media is a double-edged sword."},
            {"fr": "il ne faut pas se faire d'illusions", "en": "let's not kid ourselves, we shouldn't have any illusions", "ex": "Il ne faut pas se faire d'illusions : aucune loi ne fera disparaître les rumeurs.", "exEn": "Let's not kid ourselves: no law will make rumors disappear."},
        ]},
    ],
    "practice": {
        "instructions": {"fr": "Complétez chaque phrase avec l'expression qui convient. Deux expressions de la liste ne servent pas.",
                         "en": "Complete each sentence with the right expression. Two expressions in the list are not used."},
        "bank": ["démenti", "recouper", "hypertrucage", "bulle de filtres", "virale", "signaler", "à double tranchant", "avoir", "rectificatif", "filigrane"],
        "items": [
            {"text": "La mairie a publié un ___ pour préciser que l'école ne fermerait pas.", "en": "City hall issued a ___ to make clear that the school would not close.", "answer": "démenti",
             "explain": {"fr": "Un démenti est une déclaration officielle qui affirme qu'une information est fausse. Un rectificatif corrige une erreur que l'on a soi-même publiée.", "en": "A démenti is an official statement saying a piece of news is false. A rectificatif corrects an error you published yourself."}},
            {"text": "Avant de publier, la journaliste a pris le temps de ___ ses sources.", "en": "Before publishing, the journalist took the time to ___ her sources.", "answer": "recouper",
             "explain": {"fr": "Recouper ses sources, c'est comparer plusieurs sources indépendantes pour confirmer une information.", "en": "Recouper ses sources means comparing several independent sources to confirm a piece of information."}},
            {"text": "Cette vidéo du ministre est un ___ : son visage et sa voix ont été fabriqués par l'IA.", "en": "This video of the minister is a ___: his face and voice were produced by AI.", "answer": "hypertrucage",
             "explain": {"fr": "Hypertrucage est le terme français recommandé pour « deepfake » : une vidéo ou un son fabriqué par l'IA pour imiter une personne réelle.", "en": "Hypertrucage is the recommended French term for deepfake: a video or audio made by AI to imitate a real person."}},
            {"text": "À force de ne voir que des opinions proches des nôtres, on finit enfermé dans une ___.", "en": "By seeing only opinions close to our own, we end up trapped in a ___.", "answer": "bulle de filtres",
             "explain": {"fr": "La bulle de filtres désigne l'isolement créé par les algorithmes qui ne nous montrent que ce qui nous ressemble.", "en": "The filter bubble is the isolation created by algorithms that only show us what resembles us."}},
            {"text": "Ce message choquant a été partagé des milliers de fois : la vidéo est devenue ___ en quelques heures.", "en": "This shocking post was shared thousands of times: the video went ___ in a few hours.", "answer": "virale",
             "explain": {"fr": "Devenir viral : se diffuser très vite et très largement. L'adjectif s'accorde avec « la vidéo » : virale.", "en": "Devenir viral: to spread very fast and very widely. The adjective agrees with la vidéo (feminine): virale."}},
            {"text": "Si vous voyez un contenu haineux, vous pouvez le ___ à la plateforme.", "en": "If you see hateful content, you can ___ it to the platform.", "answer": "signaler",
             "explain": {"fr": "Signaler un contenu, c'est le faire remarquer à la plateforme pour qu'elle l'examine ou le supprime.", "en": "Signaler un contenu means flagging it to the platform so that it reviews or removes it."}},
            {"text": "Les réseaux sociaux sont ___ : ils informent, mais ils peuvent aussi tromper.", "en": "Social media are a ___: they inform, but they can also mislead.", "answer": "à double tranchant",
             "explain": {"fr": "Être à double tranchant : avoir à la fois des effets positifs et négatifs.", "en": "Être à double tranchant: to have both positive and negative effects."}},
            {"text": "J'ai cru à cette fausse annonce de grève : je me suis fait ___ comme un débutant.", "en": "I believed that fake strike announcement: I got ___ like a beginner.", "answer": "avoir",
             "explain": {"fr": "Se faire avoir (familier) : se faire tromper. Ici, l'infinitif « avoir » suit « se faire ».", "en": "Se faire avoir (informal): to be fooled. Here the infinitive avoir follows se faire."}},
        ],
    },
}

GRAMMAR = {
    "id": "outils", "type": "grammar", "label": {"fr": "Outils de langue", "en": "Language tools"},
    "intro": {"fr": "Deux outils indispensables au niveau B2 : raconter un événement passé avec précision et relier vos idées avec les pronoms relatifs. Vous les utiliserez dans la production écrite et à l'oral.",
              "en": "Two essential B2 tools: narrating a past event precisely and linking ideas with relative pronouns. You will use them in the writing and speaking papers."},
    "lessons": [
        {"title": {"fr": "A. Les temps du passé : passé composé, imparfait, plus-que-parfait", "en": "A. Past tenses: passé composé, imparfait, plus-que-parfait"},
         "html": {
            "fr": "<h4>1. Le passé composé : les événements</h4>"
                  "<p>Il présente une action <strong>terminée</strong>, souvent ponctuelle, qui fait avancer le récit, ou une action dont la <strong>durée est délimitée</strong>.</p>"
                  "<p><em>Formation</em> : <strong>avoir</strong> ou <strong>être</strong> au présent + participe passé. Avec <strong>être</strong> (verbes de mouvement comme aller, venir, arriver, partir, tomber, naître, mourir… et tous les verbes pronominaux), le participe s'accorde avec le sujet. Avec <strong>avoir</strong>, il s'accorde avec le complément d'objet direct seulement si celui-ci est placé <strong>avant</strong> le verbe.</p>"
                  "<div class='ex'>La vidéo <strong>est apparue</strong> lundi ; elle <strong>a circulé</strong> pendant trois jours. — Les images qu'ils <strong>ont publiées</strong> étaient fausses (COD « que » = les images, placé avant).</div>"
                  "<h4>2. L'imparfait : le décor, les habitudes, l'action en cours</h4>"
                  "<p>Il décrit une situation, un état, une habitude, ou une action <strong>en cours</strong> qui est interrompue par un événement.</p>"
                  "<p><em>Formation</em> : radical de « nous » au présent + -ais, -ais, -ait, -ions, -iez, -aient (nous lisons → je lisais). Seule exception : être → j'étais.</p>"
                  "<div class='ex'>Autrefois, on <strong>s'informait</strong> surtout par la radio. — Je <strong>lisais</strong> les actualités quand une notification <strong>est arrivée</strong>.</div>"
                  "<h4>3. Le plus-que-parfait : l'antériorité dans le passé</h4>"
                  "<p>Il exprime une action <strong>achevée avant</strong> une autre action passée. C'est le « passé du passé ». On l'emploie aussi dans le discours rapporté au passé et pour un regret (« Si j'avais su… »).</p>"
                  "<p><em>Formation</em> : <strong>avoir</strong> ou <strong>être</strong> à l'imparfait + participe passé (mêmes règles d'accord qu'au passé composé).</p>"
                  "<div class='ex'>Quand le démenti est arrivé, la rumeur <strong>avait déjà fait</strong> le tour du pays. — Elle a expliqué qu'elle <strong>était partie</strong> avant la fin.</div>"
                  "<h4>Repères utiles</h4>"
                  "<ul><li><strong>Passé composé</strong> : soudain, tout à coup, ce jour-là, un matin, pendant trois jours (durée délimitée).</li>"
                  "<li><strong>Imparfait</strong> : autrefois, d'habitude, chaque jour, à l'époque, pendant que, alors que.</li>"
                  "<li><strong>Plus-que-parfait</strong> : déjà, auparavant, la veille, quelques jours plus tôt.</li></ul>"
                  "<p class='small'>Dans la presse écrite et les récits, vous rencontrerez aussi le <strong>passé simple</strong> (il publia, elle fut). Au DELF B2, il suffit de le reconnaître ; à l'écrit, le passé composé est toujours accepté.</p>",
            "en": "<p><strong>Passé composé</strong>: completed events that move the story forward, or actions with a set duration (pendant trois jours). Formed with avoir or être in the present + past participle. With être (movement verbs and all reflexive verbs) the participle agrees with the subject; with avoir it agrees only with a direct object placed before the verb.</p>"
                  "<p><strong>Imparfait</strong>: background, states, habits, and an action in progress that gets interrupted. Formed from the nous stem of the present + -ais, -ais, -ait, -ions, -iez, -aient (only exception: être → j'étais).</p>"
                  "<p><strong>Plus-que-parfait</strong>: an action completed before another past action (the past of the past); also used in reported speech in the past and for regrets (Si j'avais su…). Formed with avoir or être in the imparfait + past participle, with the same agreement rules.</p>"
                  "<p>Signal words: passé composé — soudain, tout à coup, ce jour-là; imparfait — autrefois, d'habitude, chaque jour, pendant que; plus-que-parfait — déjà, auparavant, la veille. You will also see the passé simple in written texts: at B2 you only need to recognize it.</p>"}},
        {"title": {"fr": "B. Les pronoms relatifs simples et composés", "en": "B. Simple and compound relative pronouns"},
         "html": {
            "fr": "<h4>1. Les pronoms simples</h4>"
                  "<ul><li><strong>qui</strong> = sujet du verbe qui suit : <em>un compte <strong>qui</strong> diffuse des infox</em>.</li>"
                  "<li><strong>que / qu'</strong> = complément d'objet direct : <em>la vidéo <strong>que</strong> j'ai vue</em> (attention à l'accord du participe avec « avoir » : COD placé avant).</li>"
                  "<li><strong>où</strong> = lieu ou temps : <em>la ville <strong>où</strong> la rumeur est née ; le jour <strong>où</strong> la vidéo est apparue</em>.</li>"
                  "<li><strong>dont</strong> remplace un complément introduit par <strong>de</strong> : verbe + de (<em>le sujet <strong>dont</strong> on parle</em> ← parler de), adjectif + de (<em>le résultat <strong>dont</strong> elle est fière</em>), nom + de (<em>une chercheuse <strong>dont</strong> les travaux sont cités</em>). Avec « dont », l'ordre reste sujet + verbe + complément : <em>une ville dont je connais le maire</em> (et non « dont je connais son maire »).</li></ul>"
                  "<h4>2. Ce qui, ce que, ce dont (et ce à quoi)</h4>"
                  "<p>Quand l'antécédent n'est pas un nom précis mais une idée (« la chose qui / que »), on ajoute <strong>ce</strong> :</p>"
                  "<ul><li><strong>ce qui</strong> (sujet) : <em><strong>Ce qui</strong> m'inquiète, c'est la vitesse des rumeurs.</em></li>"
                  "<li><strong>ce que</strong> (COD) : <em>Je ne comprends pas <strong>ce que</strong> tu reproches à cet article.</em></li>"
                  "<li><strong>ce dont</strong> (verbe + de) : <em><strong>Ce dont</strong> les jeunes ont besoin, c'est d'esprit critique.</em> (avoir besoin de)</li>"
                  "<li><strong>ce à quoi</strong> (verbe + à) : <em>C'est exactement <strong>ce à quoi</strong> je pensais.</em> (penser à)</li></ul>"
                  "<p>Ces formes servent souvent à la <strong>mise en relief</strong> : « Ce qui / Ce que / Ce dont…, c'est… ». On les trouve aussi après « tout » : <em>tout ce qui brille</em>.</p>"
                  "<h4>3. Les pronoms composés : lequel, laquelle, lesquels, lesquelles</h4>"
                  "<p>Après une <strong>préposition</strong> (avec, pour, sans, dans, sur, par, chez, grâce à…), on utilise <strong>lequel</strong>, qui s'accorde avec l'antécédent : <em>l'outil <strong>avec lequel</strong> on vérifie les images ; les raisons <strong>pour lesquelles</strong> il a démissionné</em>.</p>"
                  "<ul><li><strong>à</strong> + lequel → <strong>auquel</strong>, à laquelle, <strong>auxquels</strong>, <strong>auxquelles</strong> : <em>le colloque <strong>auquel</strong> nous avons assisté</em> (assister à) ; <em>la question <strong>à laquelle</strong> il n'a pas répondu</em>.</li>"
                  "<li><strong>de</strong> + lequel → <strong>duquel</strong>, de laquelle, <strong>desquels</strong>, <strong>desquelles</strong> : on les emploie après une <strong>locution prépositionnelle</strong> qui se termine par « de » (à côté de, près de, au cours de, au milieu de, à cause de…) : <em>l'immeuble <strong>à côté duquel</strong> se trouve la rédaction ; la réunion <strong>au cours de laquelle</strong> la décision a été prise</em>. Dans ce cas, « dont » est impossible.</li></ul>"
                  "<p><strong>Pour une personne</strong>, après une préposition, on emploie le plus souvent <strong>qui</strong> : <em>la chercheuse <strong>avec qui</strong> j'ai travaillé</em> (« avec laquelle » est aussi correct). Exception : après <strong>parmi</strong> et <strong>entre</strong>, on utilise toujours lesquels / lesquelles : <em>les élèves, <strong>parmi lesquels</strong> certains avaient vu la vidéo</em>.</p>",
            "en": "<p><strong>Simple pronouns</strong>: qui = subject; que = direct object (watch participle agreement with avoir); où = place or time (le jour où = the day when); dont replaces a complement introduced by de (parler de, être fier de, les travaux de…). With dont keep normal word order: une ville dont je connais le maire.</p>"
                  "<p><strong>Ce qui / ce que / ce dont / ce à quoi</strong>: used when the antecedent is an idea (\"what\", \"the thing that\"). Ce qui = subject, ce que = object, ce dont = verb + de (avoir besoin de), ce à quoi = verb + à (penser à). Often used for emphasis: Ce qui m'inquiète, c'est…</p>"
                  "<p><strong>Compound pronouns</strong>: after a preposition use lequel / laquelle / lesquels / lesquelles, agreeing with the antecedent. à + lequel → auquel, à laquelle, auxquels, auxquelles (assister à → le colloque auquel). de + lequel → duquel, de laquelle, desquels, desquelles, used after prepositional phrases ending in de (à côté de, au cours de, près de): there dont is impossible.</p>"
                  "<p><strong>For people</strong>, after a preposition qui is usual (avec qui; avec laquelle is also correct). After parmi and entre, always use lesquels / lesquelles.</p>"}},
    ],
    "exercise": {
        "instructions": {"fr": "Complétez chaque phrase. Pour les verbes, conjuguez au temps du passé qui convient. Pour les pronoms, écrivez le pronom relatif (avec « ce » ou la préposition si nécessaire).",
                         "en": "Complete each sentence. For verbs, use the right past tense. For pronouns, write the relative pronoun (with ce or the preposition if needed)."},
        "items": [
            {"before": "Hier soir, pendant que je", "verb": "lire", "after": "les actualités, une notification m'a interrompu.",
             "en": "Last night, while I was reading the news, a notification interrupted me.",
             "accept": ["lisais"],
             "explain": {"fr": "Imparfait : action en cours (« pendant que ») interrompue par un événement au passé composé (« m'a interrompu »).", "en": "Imparfait: an action in progress (pendant que) interrupted by an event in the passé composé."}},
            {"before": "Quand le démenti est arrivé, la rumeur", "verb": "déjà faire", "after": "le tour du pays.",
             "en": "When the denial came, the rumor had already gone around the country.",
             "accept": ["avait déjà fait"],
             "explain": {"fr": "Plus-que-parfait : la rumeur s'est propagée AVANT l'arrivée du démenti. L'adverbe « déjà » se place entre l'auxiliaire et le participe.", "en": "Plus-que-parfait: the rumor spread BEFORE the denial came. The adverb déjà goes between the auxiliary and the participle."}},
            {"before": "La vidéo truquée", "verb": "circuler", "after": "pendant trois jours avant d'être supprimée.",
             "en": "The doctored video circulated for three days before being removed.",
             "accept": ["a circulé", "circula"],
             "explain": {"fr": "Passé composé : action terminée dont la durée est délimitée (« pendant trois jours »). L'imparfait est impossible avec une durée fermée. Le passé simple « circula » est aussi correct à l'écrit.", "en": "Passé composé: a completed action with a set duration (pendant trois jours). The imparfait is not possible with a closed duration. The passé simple circula is also correct in writing."}},
            {"before": "Le journaliste a découvert que quelqu'un", "verb": "modifier", "after": "la photo avant sa publication.",
             "en": "The journalist discovered that someone had altered the photo before it was published.",
             "accept": ["avait modifié"],
             "explain": {"fr": "Plus-que-parfait : la modification a eu lieu avant la découverte (« a découvert »), et « avant sa publication » confirme l'antériorité.", "en": "Plus-que-parfait: the alteration happened before the discovery, and avant sa publication confirms it came earlier."}},
            {"before": "", "blank": True, "after": "m'inquiète le plus, c'est la vitesse à laquelle les rumeurs se propagent.",
             "en": "What worries me most is how fast rumors spread.",
             "accept": ["ce qui"],
             "explain": {"fr": "« Ce qui » : l'antécédent est une idée (« la chose qui ») et le pronom est sujet du verbe « inquiète ».", "en": "Ce qui: the antecedent is an idea (the thing that) and the pronoun is the subject of inquiète."}},
            {"before": "Avant de chercher en ligne, il faut savoir", "blank": True, "after": "on a vraiment besoin.",
             "en": "Before searching online, you need to know what you really need.",
             "accept": ["ce dont"],
             "explain": {"fr": "« Ce dont » : on dit « avoir besoin DE quelque chose », et l'antécédent est une idée, pas un nom précis.", "en": "Ce dont: the verb is avoir besoin DE, and the antecedent is an idea, not a specific noun."}},
            {"before": "Le colloque", "blank": True, "after": "nous avons assisté portait sur les hypertrucages.",
             "en": "The conference we attended was about deepfakes.",
             "accept": ["auquel"],
             "explain": {"fr": "« Auquel » : on dit « assister À un colloque » ; à + lequel = auquel (masculin singulier, comme « le colloque »).", "en": "Auquel: the verb is assister À; à + lequel = auquel (masculine singular, like le colloque)."}},
            {"before": "L'immeuble à côté", "blank": True, "after": "se trouve la rédaction a été rénové.",
             "en": "The building next to which the newsroom is located has been renovated.",
             "accept": ["duquel"],
             "explain": {"fr": "« Duquel » : la locution prépositionnelle « à côté DE » + lequel = à côté duquel. « Dont » est impossible après une locution prépositionnelle.", "en": "Duquel: the prepositional phrase à côté DE + lequel = à côté duquel. Dont is not possible after a prepositional phrase."}},
            {"before": "La chercheuse avec", "blank": True, "after": "j'ai travaillé l'an dernier publie un nouveau livre.",
             "en": "The researcher I worked with last year is publishing a new book.",
             "accept": ["qui", "laquelle"],
             "explain": {"fr": "Pour une personne après une préposition, on emploie généralement « qui » ; « laquelle » est également correct.", "en": "For a person after a preposition, qui is usual; laquelle is also correct."}},
            {"before": "Les comptes anonymes", "blank": True, "after": "je me méfie le plus publient souvent des montages.",
             "en": "The anonymous accounts I distrust most often post doctored content.",
             "accept": ["dont"],
             "explain": {"fr": "« Dont » : on dit « se méfier DE quelque chose », et l'antécédent est un nom précis (« les comptes anonymes »), donc pas de « ce ».", "en": "Dont: the verb is se méfier DE, and the antecedent is a specific noun (les comptes anonymes), so no ce."}},
        ],
    },
}

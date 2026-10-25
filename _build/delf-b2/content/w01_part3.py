# KCE DELF B2 - Week 1 content, part 3: CE, PE, PO, Bilan.

CE1 = {
    "id": "ce1", "type": "ce", "section": "ce", "ex": 1, "label": {"fr": "CE 1", "en": "Reading 1"},
    "title": {"fr": "Compréhension des écrits — Exercice 1", "en": "Reading — Exercise 1"},
    "instructions": {"fr": "Lisez le document puis répondez aux questions en choisissant la bonne réponse.", "en": "Read the document, then answer the questions by choosing the right answer."},
    "timer": {"minutes": 60, "scope": "ce"},
    "doc": {
        "kind": "article",
        "source": {"fr": "D'après L'Écho numérique, magazine en ligne (publication fictive), 2026", "en": "Adapted from L'Écho numérique, online magazine (fictional publication), 2026"},
        "title": ["Assistants d'IA : la nouvelle porte d'entrée vers l'actualité ?", "AI assistants: the new gateway to the news?"],
        "lead": ["Rapides et toujours disponibles, les assistants conversationnels séduisent un public croissant, au point d'inquiéter les rédactions.",
                 "Fast and always available, conversational assistants are winning over a growing audience, to the point of worrying newsrooms."],
        "paras": [
            ["« Qu'est-ce qui s'est passé aujourd'hui ? » Pour un nombre croissant d'internautes, la journée commence désormais par cette question, tapée sur un téléphone avant même le premier café, posée non pas à un journal mais à un assistant d'intelligence artificielle. Selon plusieurs enquêtes récentes, la pratique reste minoritaire, mais elle progresse vite, en particulier chez les moins de vingt-cinq ans. Rapide, gratuit, disponible à toute heure et capable de répondre dans un langage simple : l'outil a de quoi séduire.",
             "\"What happened today?\" For a growing number of Internet users, the day now starts with this question, typed on a phone before the first coffee, put not to a newspaper but to an artificial intelligence assistant. According to several recent surveys, the practice is still a minority one, but it is growing fast, especially among under-25s. Fast, free, available at any hour and able to answer in plain language: the tool has plenty of appeal."],
            ["Les rédactions, elles, observent le phénomène avec un mélange de curiosité et d'inquiétude. Car ces résumés automatiques s'appuient en grande partie sur le travail des journalistes, sans que le lecteur ait besoin de cliquer sur l'article d'origine. « Nous produisons l'information, mais ce sont d'autres qui en récoltent les fruits », résume Laure Amsellem, directrice d'un groupe de presse régional. Certains sites d'information constatent déjà une baisse de leur fréquentation, même si la situation varie fortement d'un titre à l'autre. Pour un secteur dont le modèle économique est déjà fragile, la perte de visites pourrait coûter cher.",
             "Newsrooms are watching the phenomenon with a mix of curiosity and concern. These automatic summaries rely largely on journalists' work, without the reader needing to click through to the original article. \"We produce the news, but others reap the rewards,\" sums up Laure Amsellem, head of a regional press group. Some news sites are already seeing a drop in traffic, although the situation varies widely from one outlet to another. For a sector whose business model is already fragile, the loss of visits could be costly."],
            ["Le problème n'est pas seulement financier. Les chercheurs qui ont testé ces assistants relèvent des erreurs régulières : chiffres approximatifs, citations attribuées à la mauvaise personne, événements anciens présentés comme récents. Lors d'un test, un assistant interrogé sur un fait divers local a ainsi mélangé deux affaires survenues à plusieurs années d'intervalle. Rien d'étonnant, selon eux : ces outils prédisent des phrases plausibles, ils ne vérifient pas des faits. Plus troublant encore, ces erreurs sont formulées avec le même ton assuré que les informations exactes. « Un journal qui se trompe publie un rectificatif. Un assistant, lui, ne prévient personne », note Bastien Ferrand, enseignant en journalisme.",
             "The problem is not only financial. Researchers who have tested these assistants report regular errors: approximate figures, quotes attributed to the wrong person, old events presented as recent. In one test, an assistant asked about a local news story mixed up two cases that had happened several years apart. No surprise, they say: these tools predict plausible sentences; they do not check facts. More troubling still, these errors are stated in the same confident tone as accurate information. \"A newspaper that gets it wrong publishes a correction. An assistant doesn't warn anyone,\" notes Bastien Ferrand, a journalism instructor."],
            ["Faut-il pour autant diaboliser ces outils ? Certains médias ont choisi une autre voie : plutôt que de les combattre, ils négocient avec les entreprises qui les conçoivent. En échange d'une rémunération, leurs articles alimentent les réponses, avec un lien visible vers la source. D'autres refusent toute négociation et ont choisi de saisir la justice. Les accords, eux, divisent la profession : une solution pragmatique, selon leurs défenseurs ; un marché de dupes, selon leurs critiques, qui craignent que la presse ne devienne dépendante de partenaires bien plus puissants qu'elle.",
             "Does that mean these tools should be demonized? Some media outlets have chosen another path: rather than fighting them, they negotiate with the companies that build them. In exchange for payment, their articles feed the answers, with a visible link to the source. Others refuse to negotiate at all and have chosen to go to court. The deals divide the profession: a pragmatic solution, according to their supporters; a fool's bargain, according to their critics, who fear the press will become dependent on partners far more powerful than itself."],
            ["Reste la question du lecteur. Un résumé, aussi bien fait soit-il, ne remplace ni une enquête ni la confrontation de points de vue qu'offre un dossier complet. Les spécialistes de l'éducation aux médias conseillent donc de considérer la réponse d'un assistant comme un point de départ, jamais comme une conclusion. Ils rappellent aussi que choisir ses sources reste un geste citoyen. Car derrière chaque information fiable, il y a encore, le plus souvent, quelqu'un qui est allé la vérifier.",
             "That leaves the question of the reader. A summary, however well done, replaces neither an investigation nor the clash of viewpoints that a full report offers. Media literacy specialists therefore advise treating an assistant's answer as a starting point, never as a conclusion. They also point out that choosing your sources remains a civic act. Because behind every reliable piece of information there is still, most of the time, someone who went and checked it."],
        ],
    },
    "items": [
        {"id": "ce1-1", "w": 1,
         "q": ["D'après l'article, l'usage des assistants d'IA pour s'informer…", "According to the article, using AI assistants to get the news…"],
         "opts": [["concerne encore peu de gens, mais se répand rapidement.", "still concerns few people, but is spreading quickly."],
                  ["est déjà la principale source d'information des jeunes.", "is already young people's main source of news."],
                  ["reste stable depuis plusieurs années.", "has been stable for several years."]],
         "ex": ["Paragraphe 1 : « la pratique reste minoritaire, mais elle progresse vite ». Le texte dit qu'elle progresse « en particulier chez les moins de vingt-cinq ans », pas qu'elle est déjà leur source principale. « Progresse vite » contredit l'idée de stabilité.",
                "Paragraph 1: \"the practice is still a minority one, but it is growing fast\". The text says it is growing \"especially among under-25s\", not that it is already their main source. \"Growing fast\" contradicts the idea of stability."]},
        {"id": "ce1-2", "w": 1.5,
         "q": ["La phrase de Laure Amsellem exprime surtout…", "Laure Amsellem's remark mainly expresses…"],
         "opts": [["le sentiment que d'autres tirent profit du travail des journalistes.", "a feeling that others profit from journalists' work."],
                  ["sa satisfaction de voir l'information circuler plus largement.", "her satisfaction at seeing news circulate more widely."],
                  ["sa volonté de faire payer les utilisateurs des assistants.", "her wish to make assistant users pay."]],
         "ex": ["« Nous produisons l'information, mais ce sont d'autres qui en récoltent les fruits » : l'opposition « mais » souligne que d'autres profitent de leur travail. Le contexte (« inquiétude », « la perte de visites pourrait coûter cher ») exclut la satisfaction. Elle ne parle pas de faire payer les utilisateurs.",
                "\"We produce the news, but others reap the rewards\": the contrast \"but\" stresses that others profit from their work. The context (\"concern\", \"the loss of visits could be costly\") rules out satisfaction. She does not mention charging users."]},
        {"id": "ce1-3", "w": 1.5,
         "q": ["Qu'est-ce qui rend les erreurs des assistants particulièrement préoccupantes ?", "What makes the assistants' errors especially worrying?"],
         "opts": [["Leur ton ne les distingue pas des informations justes.", "Their tone does not set them apart from accurate information."],
                  ["Elles sont plus fréquentes que celles des journaux.", "They are more frequent than newspapers' errors."],
                  ["Elles portent surtout sur l'actualité la plus récente.", "They mainly concern the most recent news."]],
         "ex": ["« Rien d'étonnant, selon eux : ces outils prédisent des phrases plausibles, ils ne vérifient pas des faits. Plus troublant encore, ces erreurs sont formulées avec le même ton assuré que les informations exactes » : on ne peut donc pas les repérer à leur ton. Le texte ne compare pas la fréquence des erreurs avec celle des journaux. Il parle d'événements anciens « présentés comme récents », ce qui ne veut pas dire que les erreurs portent sur l'actualité récente.",
                "\"No surprise, they say: these tools predict plausible sentences; they do not check facts. More troubling still, these errors are stated in the same confident tone as accurate information\", so they cannot be spotted by their tone. The text does not compare error rates with newspapers'. It mentions old events \"presented as recent\", which does not mean the errors are about recent news."]},
        {"id": "ce1-4", "w": 1,
         "q": ["Par sa comparaison, Bastien Ferrand souligne que…", "With his comparison, Bastien Ferrand stresses that…"],
         "opts": [["les assistants ne signalent jamais quand ils se sont trompés.", "assistants never flag when they have been wrong."],
                  ["les journaux se trompent plus souvent que les assistants.", "newspapers make mistakes more often than assistants."],
                  ["les assistants corrigent leurs erreurs plus vite que la presse.", "assistants correct their mistakes faster than the press."]],
         "ex": ["Le journal « publie un rectificatif » ; l'assistant « ne prévient personne » : il ne signale pas ses erreurs. La comparaison porte sur la façon de réagir à une erreur, pas sur leur nombre, et l'assistant ne corrige rien du tout.",
                "The newspaper \"publishes a correction\"; the assistant \"doesn't warn anyone\": it does not flag its mistakes. The comparison is about how each reacts to an error, not how many errors they make, and the assistant corrects nothing at all."]},
        {"id": "ce1-5", "w": 1.5,
         "q": ["Comment l'article présente-t-il les accords entre médias et entreprises d'IA ?", "How does the article present the deals between media outlets and AI companies?"],
         "opts": [["Comme une option dont l'intérêt fait débat.", "As an option whose value is debated."],
                  ["Comme la seule solution réaliste pour sauver la presse.", "As the only realistic way to save the press."],
                  ["Comme une obligation imposée par la loi.", "As a legal obligation."]],
         "ex": ["Le texte donne deux avis opposés. Les accords « divisent la profession » : « une solution pragmatique, selon leurs défenseurs ; un marché de dupes, selon leurs critiques ». L'auteur ne tranche pas. Ce n'est pas la seule solution, puisque d'autres médias « ont choisi de saisir la justice », et ce n'est pas une obligation légale : « certains médias » ont « choisi » cette voie.",
                "The text gives two opposing views. The deals \"divide the profession\": \"a pragmatic solution, according to their supporters; a fool's bargain, according to their critics\". The author does not take sides. It is not the only solution, since other outlets \"have chosen to go to court\", and it is not a legal obligation: \"some media outlets\" have \"chosen\" this path."]},
        {"id": "ce1-6", "w": 1,
         "q": ["Pour les critiques, ces accords sont « un marché de dupes » parce que…", "For the critics, these deals are \"a fool's bargain\" because…"],
         "opts": [["la presse risque de se retrouver à la merci de ses partenaires.", "the press risks ending up at the mercy of its partners."],
                  ["les entreprises d'IA n'en tirent aucun avantage.", "AI companies gain nothing from them."],
                  ["les lecteurs paieront plus cher pour s'informer.", "readers will pay more to get the news."]],
         "ex": ["Un « marché de dupes » est un accord dans lequel une partie est trompée. Les critiques « craignent que la presse ne devienne dépendante de partenaires bien plus puissants qu'elle » : c'est la presse qui serait perdante. Le texte ne dit rien sur l'avantage des entreprises ni sur le prix payé par les lecteurs.",
                "A \"marché de dupes\" is a deal in which one party is cheated. The critics \"fear the press will become dependent on partners far more powerful than itself\": the press would be the loser. The text says nothing about what the companies gain or what readers pay."]},
        {"id": "ce1-7", "w": 1.5,
         "q": ["Quelle est l'idée principale du dernier paragraphe ?", "What is the main idea of the last paragraph?"],
         "opts": [["Le lecteur doit continuer à chercher et à vérifier par lui-même.", "Readers must keep searching and checking for themselves."],
                  ["Les assistants finiront par remplacer le travail d'enquête.", "Assistants will end up replacing investigative work."],
                  ["Seuls des spécialistes peuvent juger de la fiabilité d'une source.", "Only specialists can judge whether a source is reliable."]],
         "ex": ["Le paragraphe conseille de considérer la réponse d'un assistant « comme un point de départ, jamais comme une conclusion », donc de continuer à chercher et à vérifier. Il affirme au contraire qu'un résumé « ne remplace ni une enquête ni la confrontation de points de vue ». Les spécialistes donnent un conseil au lecteur : ils ne se réservent pas ce jugement.",
                "The paragraph advises treating an assistant's answer \"as a starting point, never as a conclusion\", in other words to keep searching and checking. On the contrary, it says a summary \"replaces neither an investigation nor the clash of viewpoints\". The specialists give readers advice; they do not keep that judgment for themselves."]},
    ],
}

CE2 = {
    "id": "ce2", "type": "ce", "section": "ce", "ex": 2, "label": {"fr": "CE 2", "en": "Reading 2"},
    "title": {"fr": "Compréhension des écrits — Exercice 2", "en": "Reading — Exercise 2"},
    "instructions": {"fr": "Lisez le document puis répondez aux questions en choisissant la bonne réponse.", "en": "Read the document, then answer the questions by choosing the right answer."},
    "timer": {"minutes": 60, "scope": "ce"},
    "doc": {
        "kind": "chronique",
        "source": {"fr": "Chronique d'Antoine Rivière, La Gazette du Centre (publication fictive), 2026", "en": "Column by Antoine Rivière, La Gazette du Centre (fictional publication), 2026"},
        "title": ["Et si le problème, c'était notre pouce ?", "What if the problem is our thumb?"],
        "lead": None,
        "paras": [
            ["On aime les coupables bien identifiés. Hier, c'était la télévision qui abrutissait les foules ; aujourd'hui, ce sont les algorithmes et l'intelligence artificielle qui empoisonneraient le débat public. Chaque nouvelle fausse vidéo relance le même procès, avec les mêmes accusés. Les plateformes promettent de mieux modérer, les gouvernements de mieux légiférer, et le public attend le verdict. Je ne nie pas leur culpabilité. Mais on oublie souvent un complice : nous.",
             "We like clearly identified culprits. Yesterday it was television dulling the masses; today it is algorithms and artificial intelligence that are supposedly poisoning public debate. Every new fake video reopens the same trial, with the same defendants. Platforms promise to moderate better, governments to legislate better, and the public awaits the verdict. I don't deny their guilt. But we often forget an accomplice: ourselves."],
            ["Car une fausse information, aussi habile soit-elle, ne voyage pas seule. Il lui faut des millions de petits gestes, des millions de pouces qui appuient sur « partager » sans avoir lu plus loin que le titre. Je le sais d'autant mieux que je l'ai fait moi-même. Il y a quelques mois, j'ai relayé avec indignation une citation scandaleuse attribuée à un ministre. Elle était inventée. Le démenti est tombé une heure plus tard ; j'avais déjà récolté une centaine de réactions enthousiastes. Personne ne m'avait demandé d'où venait cette phrase. Elle confirmait ce que nous pensions tous : cela suffisait.",
             "Because a piece of fake news, however clever, does not travel alone. It needs millions of small gestures, millions of thumbs pressing \"share\" without reading past the headline. I know this all the better because I have done it myself. A few months ago, I indignantly passed on an outrageous quote attributed to a minister. It was made up. The denial came an hour later; I had already collected about a hundred enthusiastic reactions. Nobody had asked me where the sentence came from. It confirmed what we all thought: that was enough."],
            ["C'est là, me semble-t-il, que se situe le cœur du problème. Nous ne partageons pas une information parce qu'elle est vraie, mais parce qu'elle nous ressemble. Une information qui contredit nos convictions, nous la soumettons à un examen sévère ; celle qui les conforte, nous la laissons passer sans contrôle. Les machines n'ont fait qu'industrialiser un penchant très ancien. Exiger des plateformes qu'elles fassent le ménage est légitime, et même nécessaire. Croire que cela suffira relève en revanche de la pensée magique.",
             "That, it seems to me, is the heart of the problem. We don't share a piece of news because it is true, but because it resembles us. A piece of news that contradicts our beliefs gets strict scrutiny; one that confirms them goes through unchecked. Machines have merely industrialized a very old tendency. Demanding that platforms clean up is legitimate, even necessary. Believing that this will be enough, however, is magical thinking."],
            ["Que faire, alors ? Rien de spectaculaire, j'en conviens. Ralentir, d'abord : une information importante le sera encore dans dix minutes ; une rumeur, elle, a besoin de vitesse. Choisir ses sources, ensuite, comme on choisit ce qu'on mange, plutôt que d'avaler tout ce qu'un fil d'actualité nous sert. Accepter, enfin, de ne pas avoir d'avis sur tout, tout de suite. Rien de tout cela ne demande de compétences particulières, seulement un peu de discipline.",
             "So what can we do? Nothing spectacular, I admit. Slow down, first: an important piece of news will still be important in ten minutes; a rumor needs speed. Choose your sources, next, the way you choose what you eat, rather than swallowing everything a news feed serves up. Accept, finally, not having an opinion on everything, right away. None of this requires special skills, just a little discipline."],
            ["On me répondra que je fais la morale aux citoyens pour mieux excuser les géants du numérique. C'est tout l'inverse. Les plateformes ont tout intérêt à ce que nous réagissions vite, et beaucoup. Rendre chacun responsable de ses gestes, ce n'est pas dédouaner ceux qui conçoivent des outils pour que nous agissions sans réfléchir ; c'est refuser de leur abandonner la seule chose qu'ils ne contrôlent pas encore : notre jugement.",
             "People will say I am lecturing citizens in order to excuse the tech giants. It is quite the opposite. Platforms have every interest in our reacting fast, and often. Making everyone responsible for their actions does not let off the hook those who design tools so that we act without thinking; it means refusing to hand over to them the only thing they do not yet control: our judgment."],
            ["L'exercice est moins anodin qu'il n'y paraît. La prochaine fois qu'une vidéo vous fera bondir, posez votre téléphone et comptez jusqu'à dix. Si l'envie de partager est toujours là, cherchez la source. Vous serez surpris du nombre de fois où elle aura disparu en chemin.",
             "The exercise is less trivial than it seems. The next time a video makes you jump out of your seat, put your phone down and count to ten. If the urge to share is still there, look for the source. You will be surprised how often it will have vanished along the way."],
        ],
    },
    "items": [
        {"id": "ce2-1", "w": 1,
         "q": ["Dans le premier paragraphe, l'auteur…", "In the first paragraph, the author…"],
         "opts": [["admet la faute des technologies, mais désigne aussi le public.", "admits technology's fault, but also points to the public."],
                  ["affirme que les algorithmes sont accusés à tort depuis des années.", "claims algorithms have been wrongly accused for years."],
                  ["regrette que la télévision ait perdu son influence.", "regrets that television has lost its influence."]],
         "ex": ["« Je ne nie pas leur culpabilité. Mais on oublie souvent un complice : nous. » Il reconnaît donc la responsabilité des algorithmes et de l'IA ; il ne les dit pas innocents. La télévision n'est citée que comme exemple d'un ancien « coupable » ; il ne regrette rien.",
                "\"I don't deny their guilt. But we often forget an accomplice: ourselves.\" So he acknowledges the responsibility of algorithms and AI; he does not say they are innocent. Television is only cited as an example of an earlier \"culprit\"; he regrets nothing."]},
        {"id": "ce2-2", "w": 1.5,
         "q": ["Pourquoi l'auteur raconte-t-il l'épisode de la citation inventée ?", "Why does the author tell the story of the made-up quote?"],
         "opts": [["Pour montrer qu'il a lui-même commis l'erreur qu'il dénonce.", "To show that he himself made the mistake he criticizes."],
                  ["Pour accuser le ministre d'avoir menti.", "To accuse the minister of lying."],
                  ["Pour montrer que ses contacts sont bien plus naïfs que lui-même.", "To show that his contacts are far more naive than he is."]],
         "ex": ["Il écrit : « Je le sais d'autant mieux que je l'ai fait moi-même » : l'anecdote illustre le geste qu'il critique (partager sans vérifier). La citation était « inventée » et « attribuée » au ministre : le ministre n'a pas menti. Lui-même a été aussi naïf que ses contacts (« ce que nous pensions tous »).",
                "He writes: \"I know this all the better because I have done it myself\": the anecdote illustrates the very gesture he criticizes (sharing without checking). The quote was \"made up\" and \"attributed\" to the minister, so the minister did not lie. He was as naive as his contacts (\"what we all thought\")."]},
        {"id": "ce2-3", "w": 1.5,
         "q": ["Selon l'auteur, pourquoi la citation a-t-elle été si bien accueillie ?", "According to the author, why was the quote so well received?"],
         "opts": [["Parce qu'elle confortait les opinions de ses lecteurs.", "Because it confirmed his readers' opinions."],
                  ["Parce qu'elle provenait d'une source réputée sérieuse.", "Because it came from a source known to be serious."],
                  ["Parce que le démenti n'avait pas encore été publié.", "Because the denial had not yet been published."]],
         "ex": ["« Elle confirmait ce que nous pensions tous : cela suffisait. » Puis : nous partageons une information « parce qu'elle nous ressemble ». Personne n'a demandé « d'où venait cette phrase » : la source n'a joué aucun rôle. Le démenti arrive plus tard, mais l'auteur n'en fait pas la raison du succès de la citation.",
                "\"It confirmed what we all thought: that was enough.\" Then: we share news \"because it resembles us\". Nobody asked \"where the sentence came from\", so the source played no role. The denial came later, but the author does not present that as the reason the quote succeeded."]},
        {"id": "ce2-4", "w": 1,
         "q": ["« Les machines n'ont fait qu'industrialiser un penchant très ancien » signifie que…", "\"Machines have merely industrialized a very old tendency\" means that…"],
         "opts": [["la technologie a amplifié une tendance humaine existante.", "technology has amplified an existing human tendency."],
                  ["les machines ont créé de nouveaux comportements.", "machines have created new behaviors."],
                  ["l'industrie fabrique de fausses informations depuis longtemps.", "industry has been producing false information for a long time."]],
         "ex": ["« Ne… que » signifie « seulement » : les machines ont seulement produit à grande échelle (« industrialiser ») un penchant humain « très ancien », celle de partager ce qui nous ressemble. Elles n'ont donc rien créé de nouveau. « Industrialiser » est employé au sens figuré : il ne s'agit pas de l'industrie.",
                "\"Ne… que\" means \"only\": machines have only produced on a large scale (\"industrialize\") a \"very old\" human tendency, sharing what resembles us. So they created nothing new. \"Industrialize\" is figurative: it is not about industry."]},
        {"id": "ce2-5", "w": 1.5,
         "q": ["Quelle est la position de l'auteur sur l'action des plateformes ?", "What is the author's position on action by the platforms?"],
         "opts": [["Elle est nécessaire, mais insuffisante.", "It is necessary, but not enough."],
                  ["Elle est inutile tant que les citoyens ne changent pas.", "It is pointless as long as citizens do not change."],
                  ["Elle relève de la pensée magique.", "It is magical thinking."]],
         "ex": ["Il écrit qu'exiger leur action « est légitime, et même nécessaire », puis : « Croire que cela suffira relève en revanche de la pensée magique. » C'est la croyance que cela suffira qui est « magique », pas l'action elle-même : attention à l'option qui reprend l'expression du texte. Il ne dit jamais que l'action est inutile.",
                "He writes that demanding their action \"is legitimate, even necessary\", then: \"Believing that this will be enough, however, is magical thinking.\" It is the belief that it will be enough that is \"magical\", not the action itself: beware of the option that reuses the text's expression. He never says the action is pointless."]},
        {"id": "ce2-6", "w": 1,
         "q": ["En comparant le choix des sources au choix de ce qu'on mange, l'auteur invite le lecteur à…", "By comparing choosing sources to choosing what we eat, the author urges readers to…"],
         "opts": [["sélectionner ses informations avec soin.", "select their information carefully."],
                  ["s'informer moins souvent, par exemple pendant les repas.", "get the news less often, for example during meals."],
                  ["ne lire que des sources spécialisées.", "read only specialized sources."]],
         "ex": ["Il oppose « choisir ses sources » à « avaler tout ce qu'un fil d'actualité nous sert » : il faut être sélectif, comme pour son alimentation. Les repas ne sont qu'une image, et il ne recommande pas de se limiter aux sources spécialisées.",
                "He contrasts \"choosing your sources\" with \"swallowing everything a news feed serves up\": we should be selective, as with our diet. Meals are only an image, and he does not recommend limiting oneself to specialized sources."]},
        {"id": "ce2-7", "w": 1.5,
         "q": ["Dans l'avant-dernier paragraphe, l'auteur répond à une critique en expliquant que…", "In the next-to-last paragraph, the author answers a criticism by explaining that…"],
         "opts": [["responsabiliser chacun permet de défendre notre autonomie face aux géants du numérique.", "making everyone responsible helps defend our independence from the tech giants."],
                  ["les géants du numérique ne sont en rien responsables.", "the tech giants bear no responsibility whatsoever."],
                  ["il vaut mieux faire la morale aux citoyens qu'aux grandes entreprises du numérique.", "it is better to lecture citizens than the big tech companies."]],
         "ex": ["À ceux qui l'accusent d'« excuser les géants du numérique », il répond : « C'est tout l'inverse » ; responsabiliser chacun, c'est refuser de leur abandonner « notre jugement ». Il ne les dédouane pas (il dit le contraire). Et il ne dit pas qu'il vaut mieux faire la morale aux citoyens qu'aux entreprises : il dit que responsabiliser chacun ne dédouane pas les plateformes.",
                "To those who accuse him of \"excusing the tech giants\", he replies: \"It is quite the opposite\"; making everyone responsible means refusing to hand over \"our judgment\" to them. He does not let them off the hook (he says the opposite). And he does not say it is better to lecture citizens than companies: he says that making everyone responsible does not let the platforms off the hook."]},
    ],
}

CE3 = {
    "id": "ce3", "type": "ce3", "section": "ce", "ex": 3, "label": {"fr": "CE 3", "en": "Reading 3"}, "submit": True,
    "title": {"fr": "Compréhension des écrits — Exercice 3", "en": "Reading — Exercise 3"},
    "instructions": {"fr": "Lisez la question et les trois opinions. Pour chaque affirmation, indiquez quelle personne l'exprime : A, B ou C.",
                     "en": "Read the question and the three opinions. For each statement, indicate which person expresses it: A, B or C."},
    "timer": {"minutes": 60, "scope": "ce"},
    "doc": {
        "kind": "opinions",
        "source": {"fr": "Rubrique « Le débat » d'un magazine en ligne (fictif)", "en": "\"The debate\" section of an online magazine (fictional)"},
        "question": ["Faut-il obliger les plateformes à signaler tous les contenus créés ou modifiés par l'intelligence artificielle ?",
                     "Should platforms be required to label all content created or altered by artificial intelligence?"],
        "opinions": [
            {"label": "A", "name": "Camille Roussel", "role": ["graphiste indépendante", "freelance graphic designer"],
             "text": ["Je travaille avec ces outils tous les jours, et c'est justement pour ça que je me méfie d'une règle trop large. Aujourd'hui, presque toutes les photos passent par un logiciel qui utilise l'IA, ne serait-ce que pour corriger la lumière. Si on doit tout étiqueter, l'étiquette apparaîtra partout et plus personne n'y prêtera attention. Ce qu'il faut signaler, ce sont les contenus qui montrent des personnes réelles dans des situations inventées, ou qui imitent un document d'information. Une retouche de couleur n'a rien à voir avec une fausse déclaration de ministre. Là, oui, je suis pour une obligation stricte et des sanctions. Pour le reste, faisons confiance au bon sens du public.",
                      "I work with these tools every day, and that is exactly why I am wary of an overly broad rule. Today almost every photo goes through software that uses AI, if only to fix the lighting. If everything has to be labeled, the label will appear everywhere and nobody will pay attention to it anymore. What should be flagged is content that shows real people in made-up situations, or that imitates a news document. A color correction has nothing to do with a fake statement by a minister. There, yes, I am for a strict obligation and penalties. For the rest, let's trust the public's common sense."]},
            {"label": "B", "name": "Yannick Morel", "role": ["juriste spécialisé dans le droit du numérique", "lawyer specializing in digital law"],
             "text": ["Une obligation, c'est bien ; encore faut-il pouvoir la faire respecter. Or les contenus les plus dangereux sont fabriqués par des gens qui se moquent complètement de la loi, souvent depuis l'étranger. L'étiquetage ne concernera donc que les acteurs honnêtes, ceux qui posent le moins de problèmes. Les fraudeurs, eux, continueront à publier sans la moindre mention. Je ne dis pas qu'il ne faut rien faire, mais je crains qu'on vote une loi symbolique pour se donner bonne conscience. À mon sens, l'effort doit porter sur la traçabilité : savoir qui a publié quoi en premier, et pouvoir le retrouver rapidement quand un contenu cause un préjudice. C'est moins visible, mais plus efficace.",
                      "An obligation is fine; you still have to be able to enforce it. Yet the most dangerous content is made by people who don't care at all about the law, often from abroad. Labeling will therefore only affect honest players, the ones who cause the fewest problems. Fraudsters will keep posting without any label at all. I'm not saying nothing should be done, but I fear a symbolic law will be passed to ease people's consciences. In my view, the effort should go into traceability: knowing who posted what first, and being able to track them down quickly when content causes harm. It's less visible, but more effective."]},
            {"label": "C", "name": "Fatou Diallo", "role": ["professeure de lettres en collège", "middle school French teacher"],
             "text": ["Mes élèves ne font plus la différence entre une image prise par un photographe et une image générée en trois secondes. Pour eux, tout se vaut. Je le vois en classe : quand on leur montre qu'une image a été retouchée, ils sont sincèrement surpris. Un étiquetage systématique aurait au moins une vertu pédagogique : rappeler en permanence que ce qu'on voit à l'écran a été fabriqué, d'une manière ou d'une autre. Bien sûr, ça ne réglera pas tout, et certains tricheront. Mais on n'a jamais renoncé au code de la route sous prétexte que des conducteurs le respectent mal. Une règle claire, appliquée partout, c'est un repère, surtout pour les plus jeunes.",
                      "My students no longer tell the difference between a picture taken by a photographer and one generated in three seconds. To them it's all the same. I see it in class: when you show them that an image has been retouched, they are genuinely surprised. Systematic labeling would at least have an educational benefit: a constant reminder that what we see on screen was made, one way or another. Of course it won't solve everything, and some people will cheat. But we never gave up on traffic laws because some drivers don't follow them. A clear rule, applied everywhere, is a benchmark, especially for the youngest."]},
        ],
    },
    "items": [
        {"id": "ce3-1", "w": 1, "answer": 0,
         "q": ["Cette personne pense qu'une mention présente partout perdrait son utilité.", "This person thinks a label shown everywhere would lose its usefulness."],
         "ex": ["Camille Roussel (A) : « Si on doit tout étiqueter, l'étiquette apparaîtra partout et plus personne n'y prêtera attention. » Fatou Diallo (C) souhaite au contraire un étiquetage « systématique ». Yannick Morel (B) critique l'efficacité de la loi pour une autre raison : les fraudeurs ne la respecteront pas.",
                "Camille Roussel (A): \"If everything has to be labeled, the label will appear everywhere and nobody will pay attention to it anymore.\" Fatou Diallo (C), on the contrary, wants \"systematic\" labeling. Yannick Morel (B) questions the law's effectiveness for another reason: fraudsters will not follow it."]},
        {"id": "ce3-2", "w": 1.5, "answer": 1,
         "q": ["Cette personne estime que l'obligation pèserait surtout sur ceux qui respectent déjà les règles.", "This person thinks the obligation would mostly weigh on those who already follow the rules."],
         "ex": ["Yannick Morel (B) : les contenus les plus dangereux sont fabriqués par des gens « qui se moquent complètement de la loi » ; l'étiquetage « ne concernera donc que les acteurs honnêtes ». Les contenus dangereux, eux, échapperont à la règle. Fatou Diallo (C) admet que « certains tricheront », mais elle ne dit pas que la règle pénaliserait les honnêtes gens. Camille Roussel (A) critique une règle trop large parce que l'étiquette perdrait son sens, pas parce qu'elle pèserait sur les gens honnêtes.",
                "Yannick Morel (B): the most dangerous content is made by people \"who don't care at all about the law\"; labeling \"will therefore only affect honest players\". Dangerous content will escape the rule. Fatou Diallo (C) admits \"some people will cheat\", but she does not say the rule would penalize honest people. Camille Roussel (A) criticizes an overly broad rule because the label would lose its meaning, not because it would weigh on honest people."]},
        {"id": "ce3-3", "w": 1, "answer": 2,
         "q": ["Cette personne voit dans l'étiquetage un moyen d'éducation.", "This person sees labeling as a means of education."],
         "ex": ["Fatou Diallo (C) : un étiquetage systématique « aurait au moins une vertu pédagogique ». Camille Roussel (A) préfère faire confiance « au bon sens du public », et Yannick Morel (B) s'intéresse à la traçabilité, pas à l'éducation.",
                "Fatou Diallo (C): systematic labeling \"would at least have an educational benefit\". Camille Roussel (A) prefers to trust \"the public's common sense\", and Yannick Morel (B) focuses on traceability, not education."]},
        {"id": "ce3-4", "w": 1.5, "answer": 1,
         "q": ["Cette personne soupçonne les responsables politiques de vouloir surtout donner l'impression d'agir.", "This person suspects policymakers mainly want to look as if they are taking action."],
         "ex": ["Yannick Morel (B) : « je crains qu'on vote une loi symbolique pour se donner bonne conscience ». Une loi « symbolique » adoptée « pour se donner bonne conscience » sert à montrer qu'on agit plus qu'à agir. Ni A ni C ne mettent en doute les intentions de ceux qui font la loi.",
                "Yannick Morel (B): \"I fear a symbolic law will be passed to ease people's consciences\". A \"symbolic\" law passed \"to ease consciences\" is about showing action rather than acting. Neither A nor C questions lawmakers' intentions."]},
        {"id": "ce3-5", "w": 1, "answer": 2,
         "q": ["Cette personne admet que certains ne respecteront pas la règle, mais veut quand même qu'elle s'applique à tous les contenus.", "This person admits some people will not follow the rule, but still wants it to apply to all content."],
         "ex": ["Fatou Diallo (C) : « certains tricheront. Mais on n'a jamais renoncé au code de la route sous prétexte que des conducteurs le respectent mal. » Elle veut « une règle claire, appliquée partout ». Yannick Morel (B) part du même constat mais en tire la conclusion inverse : la loi serait « symbolique » et l'effort doit porter sur la traçabilité. Camille Roussel (A) refuse justement une règle qui s'applique à tout.",
                "Fatou Diallo (C): \"some people will cheat. But we never gave up on traffic laws because some drivers don't follow them.\" She wants \"a clear rule, applied everywhere\". Yannick Morel (B) starts from the same observation but draws the opposite conclusion: the law would be \"symbolic\" and the effort should go into traceability. Camille Roussel (A) specifically rejects a rule that covers everything."]},
        {"id": "ce3-6", "w": 1, "answer": 0,
         "q": ["Cette personne souhaite que l'obligation ne vise que certains types de contenus.", "This person wants the obligation to apply only to certain types of content."],
         "ex": ["Camille Roussel (A) veut une obligation stricte seulement pour les contenus qui montrent « des personnes réelles dans des situations inventées » ou qui imitent « un document d'information » ; « pour le reste », pas d'obligation. Fatou Diallo (C) veut au contraire une règle « appliquée partout ». Yannick Morel (B) ne fait pas de tri entre les contenus : il propose une autre approche, la traçabilité.",
                "Camille Roussel (A) wants a strict obligation only for content showing \"real people in made-up situations\" or imitating \"a news document\"; \"for the rest\", no obligation. Fatou Diallo (C), on the contrary, wants a rule \"applied everywhere\". Yannick Morel (B) does not sort types of content: he proposes another approach, traceability."]},
    ],
}

PE = {
    "id": "pe", "type": "pe", "section": "pe", "label": {"fr": "Production écrite", "en": "Writing"},
    "promptId": "W01-PE-forum-anonymat",
    "genre": {"fr": "Contribution à un forum", "en": "Forum contribution"},
    "minutes": 60, "minWords": 250, "zeroWords": 124, "warnMinutes": 10,
    "prompt": {
        "fr": "<p>Vous avez lu le message suivant sur le forum d'un magazine en ligne consacré au numérique :</p>"
              "<blockquote><strong>Marc_L :</strong> « Harcèlement, fausses informations, faux comptes… Il est temps de mettre fin à l'anonymat sur les réseaux sociaux. Chaque utilisateur devrait être obligé de s'inscrire avec sa véritable identité. Ceux qui n'ont rien à cacher n'ont rien à craindre ! Qu'en pensez-vous ? »</blockquote>"
              "<p>Vous décidez de participer au débat. Vous rédigez une contribution argumentée dans laquelle vous donnez votre opinion sur cette proposition, en vous appuyant sur des exemples précis.</p>"
              "<p><strong>250 mots minimum.</strong> Indiquez le nombre de mots à la fin de votre texte.</p>",
        "en": "<p>You read the following post on the forum of an online magazine about digital life:</p>"
              "<blockquote><strong>Marc_L:</strong> \"Harassment, fake news, fake accounts… It's time to end anonymity on social media. Every user should have to sign up with their real identity. People with nothing to hide have nothing to fear! What do you think?\"</blockquote>"
              "<p>You decide to join the debate. Write an argued contribution giving your opinion on this proposal, supported by specific examples.</p>"
              "<p><strong>At least 250 words.</strong> Write the word count at the end of your text.</p>"},
    "checklist": [
        {"fr": "Problématique : ma position sur la proposition de Marc_L est claire dès l'introduction.", "en": "Issue: my position on Marc_L's proposal is clear from the introduction."},
        {"fr": "Plan : introduction, deux ou trois arguments illustrés par des exemples précis, conclusion.", "en": "Structure: introduction, two or three arguments with specific examples, conclusion."},
        {"fr": "Connecteurs : j'ai varié les mots de liaison (tout d'abord, de plus, cependant, en revanche, ainsi, en définitive…).", "en": "Linking words: I varied my connectors (tout d'abord, de plus, cependant, en revanche, ainsi, en définitive…)."},
        {"fr": "Registre : je réponds au message (j'interpelle Marc_L ou les autres participants), avec un ton adapté à un forum et une signature.", "en": "Register: I respond to the post (I address Marc_L or the other participants), with a tone suited to a forum and a sign-off."},
        {"fr": "Relecture : j'ai vérifié les accords (sujet-verbe, adjectifs, participes passés), les temps et l'orthographe.", "en": "Proofreading: I checked agreements (subject-verb, adjectives, past participles), tenses and spelling."},
    ],
    "model": {
        "title": "Lever l'anonymat : une fausse bonne idée",
        "paras": [
            "Bonjour à tous,",
            "Je comprends parfaitement l'exaspération de Marc face aux dérives qu'il décrit. Moi-même, j'ai vu une amie se faire harceler pendant des semaines par des comptes anonymes derrière lesquels personne ne savait qui se cachait. Pourtant, je ne pense pas qu'obliger chacun à s'inscrire sous son vrai nom soit la bonne réponse, et ce pour plusieurs raisons.",
            "Tout d'abord, l'anonymat ne protège pas seulement les harceleurs. Il permet aussi à des personnes vulnérables de s'exprimer : une victime de violences conjugales qui cherche de l'aide, un salarié qui dénonce des pratiques illégales dans son entreprise, ou encore un adolescent qui s'interroge sur son identité et n'ose pas en parler à ses proches. Les priver de cette protection, ce serait les réduire au silence.",
            "Ensuite, il est faux de croire que les auteurs de messages haineux se cachent toujours. Beaucoup d'entre eux publient sous leur vrai nom, sans la moindre gêne. Le problème n'est donc pas tant l'anonymat que le sentiment d'impunité, qui vient surtout de la lenteur des sanctions.",
            "Enfin, confier nos papiers d'identité à des entreprises privées dont le modèle économique repose sur l'exploitation des données me paraît risqué. Qui peut garantir que ces informations ne seront jamais piratées ou revendues ? Quant à l'argument selon lequel « ceux qui n'ont rien à cacher n'ont rien à craindre », il oublie que vouloir protéger sa vie privée n'est pas un aveu de culpabilité.",
            "Cela dit, je ne prétends pas qu'il faille rester les bras croisés. Il me semblerait plus efficace de défendre un « pseudonymat responsable » : chacun garderait son pseudonyme, mais la plateforme serait tenue de transmettre à la justice les données permettant d'identifier l'auteur (adresse IP, données de connexion) en cas d'infraction. Il faudrait aussi donner davantage de moyens aux enquêteurs.",
            "En définitive, lutter contre le harcèlement et la désinformation est indispensable, mais pas au prix d'une liberté qui protège d'abord les plus fragiles.",
            "Camille D.",
        ],
        "annotations": [
            {"quote": "Je comprends parfaitement l'exaspération de Marc", "fr": "Adéquation sociolinguistique : on répond directement au message du forum et on reconnaît la légitimité de l'autre avant de le contredire.", "en": "Sociolinguistic fit: the writer answers the forum post directly and acknowledges the other person's point before disagreeing."},
            {"quote": "je ne pense pas qu'obliger chacun à s'inscrire sous son vrai nom soit la bonne réponse", "fr": "Réalisation de la tâche : la position est annoncée dès l'introduction. Morphosyntaxe : subjonctif après une opinion à la forme négative (« je ne pense pas que… soit »).", "en": "Task completion: the position is stated in the introduction. Grammar: subjunctive after a negative opinion verb (je ne pense pas que… soit)."},
            {"quote": "Tout d'abord", "fr": "Cohérence et cohésion : plan clair annoncé par des connecteurs variés (Tout d'abord, Ensuite, Enfin, Cela dit, En définitive).", "en": "Coherence and cohesion: a clear structure signposted by varied connectors."},
            {"quote": "une victime de violences conjugales qui cherche de l'aide", "fr": "Réalisation de la tâche : chaque argument est illustré par des exemples concrets, comme le demande la consigne.", "en": "Task completion: each argument is illustrated with concrete examples, as the prompt requires."},
            {"quote": "Le problème n'est donc pas tant l'anonymat que le sentiment d'impunité", "fr": "Lexique et morphosyntaxe : structure de nuance « ne… pas tant… que… » et vocabulaire précis (sentiment d'impunité, lenteur des sanctions).", "en": "Vocabulary and grammar: the nuancing structure ne… pas tant… que… and precise vocabulary."},
            {"quote": "derrière lesquels personne ne savait qui se cachait", "fr": "Morphosyntaxe : pronom relatif composé après une préposition (« derrière lesquels ») et interrogation indirecte (« qui se cachait »).", "en": "Grammar: a compound relative pronoun after a preposition (derrière lesquels) and an indirect question (qui se cachait)."},
            {"quote": "dont le modèle économique repose sur l'exploitation des données", "fr": "Morphosyntaxe : pronom relatif « dont » (nom + de) ; phrases complexes bien maîtrisées.", "en": "Grammar: the relative pronoun dont (noun + de); well-controlled complex sentences."},
            {"quote": "Quant à l'argument selon lequel", "fr": "Réfutation : l'auteure reprend l'argument de Marc_L et le réfute. Pronom relatif composé « selon lequel ».", "en": "Rebuttal: the writer takes up Marc_L's argument and refutes it. Compound relative pronoun selon lequel."},
            {"quote": "Cela dit, je ne prétends pas qu'il faille rester les bras croisés", "fr": "Concession et contre-proposition : on montre une pensée nuancée. Subjonctif « qu'il faille » ; expression idiomatique « rester les bras croisés ».", "en": "Concession and counter-proposal: a nuanced line of thought. Subjunctive qu'il faille; idiom rester les bras croisés."},
            {"quote": "En définitive", "fr": "Conclusion qui reprend la position sans répéter mot pour mot l'introduction.", "en": "A conclusion that restates the position without repeating the introduction word for word."},
        ],
    },
}

PO = {
    "id": "po", "type": "po", "section": "po", "label": {"fr": "Production orale", "en": "Speaking"},
    "prepMinutes": 30, "monologueMin": 5, "monologueMax": 7,
    "instructions": {"fr": "Choisissez UN des deux documents. Vous avez 30 minutes pour préparer votre exposé. Vous dégagerez le problème soulevé par le document et vous présenterez votre opinion de manière argumentée (monologue de 5 à 7 minutes). Ensuite, vous répondrez aux questions et objections de l'examinateur.",
                     "en": "Choose ONE of the two documents. You have 30 minutes to prepare your talk. Identify the issue raised by the document and present your opinion in an argued way (a 5–7 minute monologue). Then answer the examiner's questions and objections."},
    "structure": {
        "fr": "<ol><li><strong>Introduction (environ 1 min)</strong> : une phrase d'accroche ; présentation du document (source, thème) ; la problématique sous forme de question ; l'annonce de votre plan.</li>"
              "<li><strong>Développement (4 à 5 min)</strong> : deux ou trois parties, chacune avec un argument et un exemple précis (votre expérience, votre pays, l'actualité). Pensez à la nuance : « certes… mais… ».</li>"
              "<li><strong>Conclusion (environ 30 s)</strong> : réponse claire à la problématique et, si possible, une ouverture.</li></ol>"
              "<p class='small'>Ne rédigez pas tout : notez des mots-clés et les connecteurs. Pendant l'exposé, regardez l'examinateur et parlez lentement.</p>",
        "en": "<ol><li><strong>Introduction (about 1 min)</strong>: a hook; present the document (source, topic); the issue as a question; announce your outline.</li>"
              "<li><strong>Body (4–5 min)</strong>: two or three parts, each with an argument and a specific example (your experience, your country, current events). Remember to nuance: certes… mais…</li>"
              "<li><strong>Conclusion (about 30 s)</strong>: a clear answer to the issue and, if possible, a broader opening.</li></ol>"
              "<p class='small'>Don't write everything out: note key words and connectors. During the talk, look at the examiner and speak slowly.</p>"},
    "examinerVoice": "piper:tom",
    "docs": [
        {"id": "A", "title": "Arnaques : des célébrités « clonées » par l'IA pour vendre de faux placements",
         "source": "D'après un article de la presse nationale (fictif), 2026",
         "text": "Le visage d'un présentateur de télévision connu, sa voix, ses expressions… et pourtant, ce n'est pas lui. Depuis plusieurs mois, de fausses publicités fabriquées par intelligence artificielle font parler des personnalités pour vanter des placements financiers « sans risque ». Certaines victimes y ont perdu toutes leurs économies. Les plateformes assurent supprimer ces contenus dès qu'ils leur sont signalés, mais les associations de consommateurs jugent leur réaction trop lente et demandent qu'elles soient tenues pour responsables des publicités qu'elles diffusent. Pour d'autres, la vigilance des internautes reste la meilleure des protections.",
         "en": "The face of a well-known TV host, his voice, his expressions… and yet it isn't him. For several months, fake ads made with artificial intelligence have been putting words in celebrities' mouths to promote \"risk-free\" investments. Some victims have lost all their savings. Platforms say they remove this content as soon as it is reported, but consumer groups find their response too slow and want them held responsible for the ads they run. For others, Internet users' own vigilance remains the best protection.",
         "problem": {"fr": "Qui doit protéger le public contre les arnaques fondées sur les hypertrucages : les plateformes, les pouvoirs publics ou les internautes eux-mêmes ?", "en": "Who should protect the public from scams based on deepfakes: the platforms, the authorities, or Internet users themselves?"},
         "outline": {
             "fr": "<p><strong>Introduction</strong> : « Voir n'est plus croire. » Présentation : article de la presse nationale sur de fausses publicités qui utilisent l'image de célébrités. Problématique : qui doit protéger le public contre ces arnaques ? Plan : la responsabilité des plateformes, celle des pouvoirs publics, puis le rôle de chacun.</p>"
                   "<p><strong>I. Les plateformes en première ligne</strong> : elles diffusent ces publicités et sont payées pour cela ; elles ont les moyens techniques de les repérer avant publication ; retirer un contenu après signalement arrive trop tard pour les victimes.</p>"
                   "<p><strong>II. Le rôle des pouvoirs publics</strong> : encadrer la publicité, sanctionner les plateformes négligentes, coopérer entre pays car les fraudeurs sont souvent à l'étranger ; informer le public (campagnes de prévention).</p>"
                   "<p><strong>III. La vigilance de chacun, indispensable mais insuffisante</strong> : se méfier des promesses de gains « sans risque », vérifier la source ; mais on ne peut pas faire reposer toute la responsabilité sur les victimes, souvent âgées ou isolées.</p>"
                   "<p><strong>Conclusion</strong> : une responsabilité partagée, mais d'abord celle des plateformes qui tirent profit de ces publicités ; ouverture : faudra-t-il un jour protéger juridiquement notre visage et notre voix ?</p>",
             "en": "<p><strong>Introduction</strong>: hook (seeing is no longer believing); present the national press article about fake ads using celebrities' images; issue: who should protect the public from these scams?; outline: platforms, authorities, then everyone's role.</p>"
                   "<p><strong>I. Platforms on the front line</strong>: they run these ads and are paid for them; they have the technical means to detect them before publication; removing content after it is reported is too late for victims.</p>"
                   "<p><strong>II. The role of the authorities</strong>: regulate advertising, penalize negligent platforms, cooperate across countries since fraudsters are often abroad; inform the public (prevention campaigns).</p>"
                   "<p><strong>III. Individual vigilance, essential but not enough</strong>: be wary of \"risk-free\" gains, check the source; but the whole burden cannot be put on victims, who are often elderly or isolated.</p>"
                   "<p><strong>Conclusion</strong>: shared responsibility, but first that of the platforms that profit from these ads; opening: will we one day need legal protection for our own face and voice?</p>"},
         "examiner": [
             {"id": "a1", "fr": "Vous-même, pensez-vous que vous pourriez vous faire piéger par ce genre de publicité ? Pourquoi ?", "en": "Do you think you yourself could be fooled by this kind of ad? Why?"},
             {"id": "a2", "fr": "Les victimes ne sont-elles pas un peu responsables ? Un placement sans risque, ça devrait éveiller les soupçons, non ?", "en": "Aren't the victims partly responsible? A risk-free investment should raise suspicion, shouldn't it?"},
             {"id": "a3", "fr": "Les plateformes disent qu'elles suppriment ces contenus dès qu'on les leur signale. Ce n'est pas suffisant, à votre avis ?", "en": "Platforms say they remove this content as soon as it is reported to them. Isn't that enough, in your opinion?"},
             {"id": "a4", "fr": "Faudrait-il interdire toutes les publicités qui utilisent, grâce à l'intelligence artificielle, l'image d'une personne réelle ?", "en": "Should all ads that use a real person's image through artificial intelligence be banned?"},
             {"id": "a5", "fr": "Certains disent qu'on ne peut rien faire contre des fraudeurs installés à l'étranger. Qu'en pensez-vous ?", "en": "Some say nothing can be done about fraudsters based abroad. What do you think?"},
             {"id": "a6", "fr": "Et dans votre pays, ce genre d'arnaque existe-t-il ? Comment le public est-il prévenu ?", "en": "And in your country, do scams like this exist? How is the public warned?"},
             {"id": "a7", "fr": "Ces technologies ne présentent-elles pas aussi des avantages, par exemple pour le cinéma ou la publicité ?", "en": "Don't these technologies also have advantages, for example for movies or advertising?"},
         ]},
        {"id": "B", "title": "Les jeunes s'informent d'abord sur les réseaux sociaux",
         "source": "D'après un magazine d'actualité (fictif), 2026",
         "text": "Pour une majorité d'adolescents et de jeunes adultes, les réseaux sociaux sont devenus la première porte d'entrée vers l'actualité, loin devant la télévision et la presse. Vidéos courtes, comptes d'influenceurs, extraits partagés par des amis : l'information arrive sans qu'on la cherche. Une évolution qui inquiète une partie des enseignants, pour qui « tout se mélange : l'info, l'opinion et la publicité ». D'autres rappellent que ces jeunes n'ont jamais eu accès à autant de sources différentes. Les plateformes, de leur côté, affirment lutter contre les fausses informations en mettant en avant des sources jugées fiables.",
         "en": "For most teenagers and young adults, social media has become the main gateway to the news, far ahead of television and the press. Short videos, influencer accounts, clips shared by friends: news arrives without being looked for. A trend that worries some teachers, for whom \"everything gets mixed up: news, opinion and advertising\". Others point out that these young people have never had access to so many different sources. Platforms, for their part, say they fight false information by promoting sources deemed reliable.",
         "problem": {"fr": "Les réseaux sociaux peuvent-ils être une source d'information fiable pour les jeunes, et comment les aider à s'y retrouver ?", "en": "Can social media be a reliable source of news for young people, and how can we help them find their way?"},
         "outline": {
             "fr": "<p><strong>Introduction</strong> : « Il y a vingt ans, on attendait le journal de 20 heures ; aujourd'hui, l'actualité arrive dans notre poche. » Présentation : article d'un magazine d'actualité. Problématique : les réseaux sociaux peuvent-ils être une source fiable pour les jeunes, et comment les aider ? Plan : richesse, dangers, solutions.</p>"
                   "<p><strong>I. Une richesse réelle</strong> : diversité des sources, information rapide, voix qu'on n'entend pas dans les médias traditionnels (exemple : témoignages directs lors d'une catastrophe naturelle).</p>"
                   "<p><strong>II. Des dangers bien identifiés</strong> : mélange entre information, opinion et publicité ; algorithmes et bulles de filtres ; rumeurs et hypertrucages.</p>"
                   "<p><strong>III. Des solutions</strong> : éducation aux médias à l'école et en famille ; suivre aussi les comptes de médias sérieux ; réflexe de vérification (recouper ses sources).</p>"
                   "<p><strong>Conclusion</strong> : oui, à condition d'apprendre à trier ; ouverture : les adultes aussi auraient besoin de cette formation.</p>",
             "en": "<p><strong>Introduction</strong>: hook; present the news magazine article; issue: can social media be a reliable source for young people, and how can we help them?; outline: benefits, dangers, solutions.</p>"
                   "<p><strong>I. A real wealth</strong>: diverse sources, fast news, voices rarely heard in traditional media (example: firsthand accounts during a natural disaster).</p>"
                   "<p><strong>II. Well-known dangers</strong>: news, opinion and advertising mixed together; algorithms and filter bubbles; rumors and deepfakes.</p>"
                   "<p><strong>III. Solutions</strong>: media literacy at school and at home; also follow serious news outlets' accounts; the habit of checking (cross-checking sources).</p>"
                   "<p><strong>Conclusion</strong>: yes, provided they learn to sort; opening: adults need this training too.</p>"},
         "examiner": [
             {"id": "b1", "fr": "Et vous, comment est-ce que vous vous informez au quotidien ?", "en": "And you, how do you keep up with the news day to day?"},
             {"id": "b2", "fr": "On critique beaucoup les réseaux sociaux, mais les médias traditionnels ne sont pas toujours neutres non plus, si ?", "en": "Social media gets a lot of criticism, but traditional media aren't always neutral either, are they?"},
             {"id": "b3", "fr": "N'est-ce pas un peu facile d'accuser les jeunes ? Les adultes aussi partagent beaucoup de fausses informations.", "en": "Isn't it a bit too easy to blame young people? Adults share a lot of false information too."},
             {"id": "b4", "fr": "Selon vous, qui devrait apprendre aux jeunes à vérifier une information : l'école ou les parents ?", "en": "In your view, who should teach young people to check information: schools or parents?"},
             {"id": "b5", "fr": "Certains proposent de fermer les comptes des influenceurs qui diffusent de fausses informations. C'est une bonne idée, à votre avis ?", "en": "Some propose shutting down the accounts of influencers who spread false information. Is that a good idea, in your opinion?"},
             {"id": "b6", "fr": "On pourrait aussi voir les choses autrement : les jeunes n'ont jamais été aussi bien informés. Vous n'êtes pas d'accord ?", "en": "You could also see things differently: young people have never been so well informed. Don't you agree?"},
             {"id": "b7", "fr": "Et dans votre pays, la situation ressemble-t-elle à celle que décrit le document ?", "en": "And in your country, does the situation resemble the one the document describes?"},
         ]},
    ],
    "expressions": [
        {"title": {"fr": "Présenter le document", "en": "Presenting the document"},
         "items": ["Ce document, extrait de…, traite de…", "Il s'agit d'un article paru dans…", "Le document soulève la question de savoir si…", "On peut donc se demander si…", "Dans un premier temps, je montrerai que… ; dans un second temps…"]},
        {"title": {"fr": "Donner et nuancer son opinion", "en": "Giving and nuancing your opinion"},
         "items": ["À mon avis, / Selon moi, / Pour ma part,", "Je suis convaincu(e) que… / Je doute que… (+ subjonctif)", "Certes…, mais… / Il est vrai que…, cependant…", "Il ne faut pas pour autant…", "Le problème n'est pas tant… que…", "Prenons l'exemple de…"]},
        {"title": {"fr": "Réagir pendant le débat", "en": "Reacting during the debate"},
         "items": ["C'est une bonne question, laissez-moi réfléchir un instant.", "Je comprends votre point de vue, mais…", "Je ne dirais pas exactement cela. / Je nuancerais un peu.", "Si je vous ai bien compris, vous voulez dire que… ?", "Vous avez raison sur ce point ; en revanche…", "Je maintiens que… / Je reste persuadé(e) que…"]},
    ],
}

BILAN = {"id": "bilan", "type": "bilan", "label": {"fr": "Bilan", "en": "Review"}}

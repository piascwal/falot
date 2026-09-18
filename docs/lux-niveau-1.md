# Étage 1 — « Le bas du puits »

Conception du premier niveau, à la main, non procédural.
Annexe à `docs/lux-falot.md`.

---

## La thèse : ce n'est pas un tutoriel, c'est l'étage 1

La proposition initiale était un **niveau d'introduction optionnel**, avec un
menu demandant si on veut le faire, et des panneaux de texte entre les zones.
La séquence de salles proposée était bonne ; c'est le cadrage qui pose problème.

Depuis une quinzaine d'années le tutoriel séparé a disparu des jeux qui
comptent. Half-Life 2, Portal, la Grande Plaine de *Breath of the Wild*, les
premiers écrans de *Celeste*, *Hollow Knight* : dans tous ces cas **le tutoriel
EST le premier niveau du vrai jeu**, construit pour que sa géographie enseigne.
Personne ne demande au joueur s'il veut apprendre.

Ici la fiction offre la place idéale : les Dessous sont un bâtiment, on en sort
en montant. **L'étage 1 est construit à la main, les étages 2 et au-delà sont
procéduraux.** Rien à cocher, rien à sauter, et la fiction commence à sa place.

### Trois raisons de ne pas poser la question

1. **Le joueur n'a pas de quoi répondre.** On lui demande s'il veut apprendre un
   jeu qu'il n'a pas vu. Celui qui répond « non » et se perd ensuite en voudra au
   jeu, pas à lui-même.
2. **La question avoue la faiblesse.** S'il faut proposer de sauter un passage,
   c'est qu'on le sait ennuyeux. La bonne réponse est de le rendre court et
   jouable, pas facultatif.
3. **Cela coûte le meilleur moment du jeu.** Les trente premières secondes
   doivent être jouées, pas cliquées.

### Ce qu'on fait à la place

Un écran-titre avec **un seul bouton : « Descendre »**.

L'option de saut n'apparaît **qu'une fois l'étage 1 terminé au moins une fois**
(mémorisé dans le navigateur) : un second bouton discret, « Reprendre plus
haut », qui démarre directement à l'étage 2 procédural. C'est exactement le
traitement que les jeux modernes réservent à leur prologue : sautable seulement
par qui l'a déjà vu.

---

## Le récit : où va le texte

La remarque faite plus tôt sur les modales d'évolution — « trop intrusives » —
vaut dix fois plus pour un niveau d'introduction. Un niveau entier ponctué de
panneaux à valider referait la même faute en plus gros.

Trois canaux, par ordre de préférence :

| Canal | Quand | Coût pour le joueur |
|---|---|---|
| Le bandeau passager (existe déjà) | à l'entrée d'une salle, une phrase | aucun, le jeu continue |
| La cage d'escalier (existe déjà) | à la fin de l'étage | un arrêt déjà prévu, autant s'en servir |
| Un écran noir de trois mots | avant la toute première image | le seul arrêt qu'on s'autorise |

Cette dernière exception est standard et vaut la peine : *Inside*, *Limbo*,
*Journey* ouvrent tous sur un écran presque vide. Trois mots, pas de bouton, ça
s'efface tout seul.

### Mais alors, comment raconte-t-on vraiment l'histoire ?

Objection juste : sans un peu de texte, personne ne comprendra les Dessous, les
Éteints ni les Guets. « Pas de panneaux » ne veut pas dire « pas de mots ». Il
faut simplement que les mots ne coûtent jamais un clic.

**Le canal principal : ce que disent les âmes qu'on rallume.**

Quand un Éteint se rallume, il dit **une phrase** au-dessus de sa tête avant de
se mettre à suivre — deux secondes, pas de bouton, pendant qu'on continue à
jouer. C'est le meilleur canal possible pour trois raisons :

- il est **mérité** : on ne l'entend que si on a sauvé quelqu'un, donc il
  récompense le geste central du jeu ;
- il est **diégétique** : ce sont des gens qui parlent, pas un narrateur ;
- il est **inépuisable** : quinze répliques par espèce suffisent à peupler des
  heures, et on découvre le monde par bribes, jamais par exposition.

Exemples de ce que ça donne, sans jamais expliquer la règle :

> — « Je croyais que j'étais éteinte pour de bon. » *(un Frileux)*
> — « Il y en a d'autres. Plus haut. Beaucoup d'autres. » *(un Errant)*
> — « Ne les regarde pas trop longtemps. C'est comme ça qu'on tombe. » *(un
>   Errant — et le joueur comprendra ce que c'est qu'un Guet trois étages plus
>   tard)*

**Le canal de fond : la cage d'escalier.** C'est un arrêt de toute façon ; deux
à quatre phrases y passent sans rien coûter. Sur dix étages, c'est un récit
complet.

**Le canal d'ambiance : les murmures.** Une phrase pâle qui apparaît dans le
décor lui-même quand on passe près de quelque chose — une torche morte, le poste
d'un Guet, une porte. Elle s'efface seule. C'est la méthode de *Dark Souls* et
de *Journey* : de la matière narrative posée exactement là où elle est
pertinente, jamais en travers du chemin.

**Récapitulatif : qui porte quoi.**

| Canal | Ce qu'il raconte | Coût |
|---|---|---|
| Les âmes rallumées | qui sont les Éteints, ce qu'ils ont vécu | aucun |
| La cage d'escalier | où l'on est, ce qu'on a fait, ce qui reste | un arrêt déjà prévu |
| Les murmures | le bâtiment, les Guets, ceux qui sont passés avant | aucun |
| L'écran noir d'ouverture | trois mots | le seul arrêt qu'on s'autorise |

---

## Les salles

Dix intentions, environ six salles, **moins de quatre minutes**. Si ça dépasse,
la salle de la torche est la première à sacrifier.

### 1. Le réveil
Une pièce minuscule, fermée, rien que Falot et son halo.
**Enseigne** : on se déplace, et on ne voit que ce qu'on éclaire.

### 2. Le couloir des lueurs
Trois ou quatre lueurs en enfilade, visibles de loin parce qu'elles brillent.
On les ramasse, le « +4 » monte vers la barre, la barre tressaille.
**Enseigne** : ces petites choses jaunes servent à quelque chose.

> Déplacé plus tôt que dans le croquis d'origine. Il faut savoir ce que sont les
> fragments **avant** que le jeu demande de faire des choix.

### 3. La salle de la torche
Une salle trop grande pour le halo. Une torche au mur ; en passant devant, elle
s'allume et la salle apparaît d'un coup.
**Enseigne** : les torches se rallument, et la lumière révèle le terrain.

### 4. Le premier Guet
Un couloir traversé par un rouge en ronde. Il faut passer.

La première tentative échoue : on est vu, on s'éteint, on se rallume à l'entrée
de la salle — instantanément, sans écran, sans pénalité. **Et c'est à ce
moment-là que le bouton CAILLOU se met à pulser.**

**Enseigne** : le rouge, son cône, le fait que mourir ne coûte presque rien, et
le caillou — dans cet ordre. On ne donne jamais l'outil avant le problème.

Deux solutions valables, et c'est ce qui en fait une bonne salle :
- lancer un caillou pour qu'il aille voir ailleurs ;
- se tenir près de la torche allumée de la salle précédente, car **une torche
  allumée rend invisible** (vérifié dans le code : `abri` coupe la détection).

### 5. Le Frileux qu'on ne peut pas encore aider
Un bleu dans un renfoncement. On approche, il fuit. On l'éclaire, rien ne se
passe — **et c'est exact** : sans faisceau, `propager` sort avant d'éclairer
qui que ce soit, donc personne n'est calmable à la forme Peureux.

Une phrase passagère, pour que l'échec informe au lieu d'inquiéter :
*« Il a trop peur pour te suivre. Tu n'éclaires pas encore assez. »*

**Enseigne** : il existe des gens à sauver, et il te manque quelque chose.

> **Correction apportée au premier jet.** Objection juste : avec un seul
> Frileux, le joueur risque de retenir « on ne peut pas récupérer les gens » et
> de ne jamais découvrir qu'on le peut ; et en inversant l'ordre, il retiendrait
> l'inverse. Il en faut **deux**, et le second après les fragments.

### 6. Le Seuil qui réclame
On atteint le portail. Son anneau est vide : **deux âmes demandées, zéro
livrée.** On ne peut pas partir.

> **C'est ici que je m'écarte le plus du croquis.** L'idée d'une « porte bloquée
> jusqu'à ce qu'on aille chercher le PNJ » introduit une serrure que le reste du
> jeu n'utilise jamais — alors que la règle établie est qu'une porte s'ouvre pour
> quiconque n'est pas un Guet. Un niveau d'introduction doit enseigner les vraies
> règles, pas des exceptions.
>
> Le portail qui réclame une âme produit exactement le même détour, avec une
> règle qui servira toute la partie.

### 7. La montée en confiance
Un passage latéral, assez de lueurs pour atteindre Curieux. Le bouton change de
couleur, pulse, gagne son aura.
**Enseigne** : l'éclat ouvre des formes, et les formes ouvrent le caillou.

### 8. Le second Frileux — la révélation
Dans le couloir qui suit la montée, **un deuxième Frileux**, tout de suite
après les fragments. On l'éclaire, et cette fois **le corps se remplit par le
bas**, du contour sombre au vert plein. Il suit.

**Enseigne** : c'était ça, le faisceau. La mécanique centrale du jeu, découverte
par contraste avec l'échec de la salle 5 — quinze secondes plus tôt on ne
pouvait pas, maintenant on peut.

### 8 bis. Retourner chercher le premier
Le Seuil réclame **deux** âmes. On en a une. Le premier Frileux est toujours là,
en arrière — et on sait désormais quoi faire de lui.

**Enseigne** : le Seuil compte, et **on retourne chercher ceux qu'on a laissés
derrière**. C'est le sujet du jeu tout entier, enseigné par la géographie sans
une ligne de texte.

### 9. Le passage à deux
Un couloir, un rouge, et cette fois un suiveur derrière soi. La jauge du rouge
monte **deux fois plus vite** — mesuré, 0,17 par corps exposé et par
demi-seconde.
**Enseigne** : escorter coûte. C'est l'arbitrage de tout le jeu.

> Un seul rouge, pas deux. Un premier examen doit être réussissable du premier
> coup par quelqu'un qui a compris.

### 10. Le Seuil, rempli
On livre. L'anneau se complète, Falot se vide de sa lumière, la cage d'escalier
s'ouvre pour la première fois — avec le premier vrai texte du récit.

---

## Les points de reprise

À la mort, on repart **à l'entrée de la salle en cours**, immédiatement, sans
écran ni chargement. C'est la norme depuis *Super Meat Boy* et *Celeste* : la
mort doit coûter des secondes, pas de la patience.

Le jeu respawne déjà au départ de la zone ; il suffit d'enregistrer, à l'entrée
de chaque salle, un point de reprise qui remplace `zone.depart`.

---

## L'abri se voit enfin

Une torche allumée coupe la détection, mais **rien ne le disait** : on jouait la
peur au ventre sans savoir qu'on ne risquait plus rien. Une sixième humeur est
donc apparue, **APAISÉ** — sourcils hauts et détendus, œil à demi clos, et le
seul sourire du jeu. Elle passe **avant toutes les autres**, y compris la peur :
un rouge peut hurler à deux pas, si l'on est dans la lumière, le visage le dit.
Quelques motes tièdes montent du corps pour appuyer.

Vérifié : rouge en alerte hors abri → « peur » ; le même rouge en alerte, à la
torche → « apaisé ».

### L'abri protège qui s'y tient

L'asymétrie est tranchée : **ce n'est pas un statut, c'est une position.** Le
joueur et chaque suiveur posent la même question depuis l'endroit où ils se
trouvent. Celui qui est dans la lumière est couvert ; celui qui dépasse reste
prenable — et son visage le dit, puisque l'apaisement s'affiche âme par âme.

Cela transforme un abri en **problème de placement** plutôt qu'en interrupteur :
avec quatre suiveurs et une braise, il faut que tout le monde tienne dedans.
C'est exactement l'arbitrage que le jeu cherche partout ailleurs.

Mesuré sur 60 images, une braise couvrant le joueur et une âme sur deux : l'âme
du dedans est comptée à l'abri 60 fois sur 60 et porte le visage apaisé, celle
du dehors 0 fois et porte la peur, et la sentinelle ne voit **qu'un corps sur
les trois présents**.

---

## Se remettre au travail sans retraverser l'étage 1

Un niveau écrit à la main devient vite pénible à retraverser à chaque essai.
Deux paramètres d'URL, déjà en place :

```
?etage=4                  démarre directement à l'étage 4
?graine=LUX-7001          fixe le plan
?etage=4&graine=LUX-7001  les deux
```

Rien d'autre ne lit l'URL ; sans paramètre, le jeu démarre normalement. Vérifié :
`?etage=4&graine=LUX-7001` ouvre bien la zone 4 sur cette graine.

---

## Le plan, tel qu'il est écrit

Ce n'est plus une intention : c'est la carte que `zoneEcrite` lit au démarrage.
Elle vit dans `poc/lux-paranoia.html`, sous `ETAGES_ECRITS`.

```
#########################
##############.........##     1  la salle de la torche
##...#########.........##
##.@..o.o.o.o.*8.......##     3  le réveil, puis le couloir des lueurs
##.6.#########.........##     4
###%##########.........##     5  la pierre fendue, sous la salle du réveil
##.g.#########...T2....##     6  la niche ; le brandon, et la règle des deux lumières
##################*######
##################=######
############......1....##     9  le Guet nommé, et ce que fait le caillou
############..r........##    10
############...........##    11  la SALLE du Guet : 44 cases, de la place pour lancer
############...........##    12
##################=######
##############....*....##    14  le Frileux qu'on ne peut pas encore aider
##############.......b.##
##############.........##
######.......|.*.......##    17  le couloir calme, et sa porte
######=##################
##....*.########......###
##......##5T####......###    20  l'alcôve de la torche, sur le trajet de l'escorte
##..S...|o.o.or|*.....###    21  le Seuil, les fragments, le Guet de l'escorte
##....4.####..##....b.###    22  le renfoncement de la première âme
##......####.b##......###    23  la seconde âme, au fond de la dernière salle
#########################
```

`#` mur — `@` départ — `S` Seuil — `o` lueur — `g` poche de cailloux —
`T` torche — `b` Frileux — `r` Guet — `%` mur fêlé — `|` et `=` portes —
`*` point de reprise — `1-9` murmure.

**La toute première chose qu'on fait dans ce jeu, désormais, c'est casser un
mur.** La salle du réveil a une pierre fendue dans son plancher de pierre ; un
murmure la désigne, le halo la montre, et le seul objet qu'on possède l'ouvre.
Derrière : une niche et une poche de cailloux. Le caillou n'est plus un bouton
dont on cherche l'usage — il a servi avant qu'on ait vu le moindre ennemi.

**Le parcours.** Réveil, couloir des lueurs, salle de la torche, galerie du
premier Guet, salle d'un Frileux — qu'on ne peut pas encore sauver —, couloir
calme, Seuil qui réclame deux âmes. Puis le couloir des fragments, gardé par le
second Guet. La première âme est dans un renfoncement **sur ce couloir même**,
sous le nez du Guet ; la seconde au fond de la dernière salle. On ramène la
première, **le portail affiche 1/2**, et c'est là seulement qu'on comprend qu'il
se charge. On repart chercher l'autre, et le retour repasse devant le même
Guet.

> **Corrigé deux fois, après essai à la manette.** Les deux âmes étaient
> d'abord aux deux bouts du niveau, pour que le Seuil oblige à revenir chercher
> la première : à la manette ce demi-tour **ne se devine pas**, rien sur le
> chemin ne le demande. Elles ont donc été mises côte à côte dans la dernière
> salle — et là elles étaient trop proches : on les rallumait toutes les deux
> d'un même geste et **on ne voyait jamais le portail se charger**. Elles sont
> maintenant à deux endroits distincts du même secteur : assez écartées pour
> qu'on livre, qu'on lise « 1/2 » et qu'on reparte, assez proches pour que le
> retour ne coûte pas la traversée de l'étage.
>
> Le Frileux de la salle 5 reste ce qu'il est — la démonstration qu'il te
> manque quelque chose — et on n'est jamais obligé d'y retourner.

**L'alcôve** s'est déplacée avec le Guet : elle est maintenant sur le trajet de
l'escorte, et un murmure y dit enfin la règle à voix haute — *« Tant que la
flamme tient, il ne te voit pas. Ni toi, ni ceux qui se serrent contre toi. »*
C'est l'arbitrage du jeu en petit : on ne se met pas à l'abri, on **y met tout
le monde**.

**Les deux Guets sont scellés dans leur quartier** par les portes — 13 cases
pour celui de la galerie, 8 pour celui de l'escorte. Vérifié : ni l'un ni
l'autre n'atteint le Seuil ni le premier Frileux, quoi qu'il arrive.

**Le budget d'éclat est calibré à deux points près** : sept lueurs à 4, soit 28,
pour un seuil de Curieux à 26. La forme s'ouvre donc à la troisième lueur du
passage latéral — exactement là où le niveau en a besoin, et jamais avant.

### Ce qui a été mesuré

| Ce qu'on voulait | Ce qu'on a mesuré |
|---|---|
| Personne n'est récupérable sans faisceau | à la forme Peureux le premier Frileux n'est même pas *éclairé* : `eclaire` reste faux |
| Le faisceau change tout | même position, forme Curieux : calmé et suiveur |
| 28 d'éclat pour un seuil à 26 | 28 exactement, forme 1 atteinte |
| Les Guets restent chez eux | 0 des 2 n'atteint le Seuil ou le premier Frileux, portes fermées |
| Les murmures se déclenchent au passage | 4 sur 4, et 0 avant d'y passer |
| La reprise déplace le départ | mort après un point de reprise → renaissance exactement dessus |
| Le Seuil réclame deux âmes | avec 1 livrée il reste fermé ; avec 2 la vidange part et l'étage 2 se charge |

### Combien de temps ça fait

Un pilote automatique a parcouru l'étage entier, **Guets aveuglés en
permanence** : ce qui reste est la part de trajet, le plancher incompressible du
niveau.

| Moment | Temps |
|---|---|
| Couloir des lueurs | 2,4 s |
| Salle de la torche | 4,7 s |
| Galerie du Guet traversée | 7,7 s |
| Seuil atteint, vide | 17,9 s |
| Fragments ramassés (forme Curieux) | 21,0 s |
| **Première livraison — le portail affiche 1/2** | 28,5 s |
| Seconde livraison, le Seuil s'ouvre, étage 2 chargé | 42,5 s |

**42 secondes de marche pure.** Le reste du temps de jeu, c'est ce qui fait le
jeu — attendre qu'un regard passe, se mettre à l'abri, mourir une fois ou deux.

Une précision honnête : ce pilote ne sait ni lancer un caillou ni se mettre à
l'abri. Guets actifs, il ne franchit pas un couloir gardé — ce qui dit que le
couloir est un vrai obstacle, et rien du temps qu'y mettra quelqu'un qui a
compris. Ce chiffre-là se mesure à la main.

### Ce que le joueur ne comprenait pas

Relevé à la manette, en deux passes. Aucun bug : des règles que le jeu
appliquait sans jamais les dire.

| Ce qui manquait | Ce qui a été fait |
|---|---|
| À quoi sert le caillou | Un murmure dès la première salle, un autre avant la galerie du Guet, le bouton qui bat quand un regard commence à te tenir — et surtout **les murs fêlés** (voir plus bas) |
| Qu'on charge le portail avec des âmes | Le compte est écrit **sur le portail** (« ÂMES — 1 / 2 », « ENTRE » quand il cède), une phrase le dit à la première approche, le murmure du Seuil l'explique |
| Qu'on remplit une jauge qui change de forme | La barre passe de 80 à 148 px, gagne un contour et une légende : **PEUREUX → CURIEUX**. Toute la jauge sursaute au ramassage |
| Que le portail se charge à plusieurs âmes | Les deux âmes sont séparées : on en livre une, on lit « 1/2 », on repart |
| La torche était un abri, et le murmure parlait d'autre chose | Il disait *« d'autres sont passés avant toi »* — fidèle à la bible, mais inutile à cet endroit. Il dit maintenant les deux : *« Quelqu'un est passé avant toi, et a laissé ça allumé. Tant que la flamme tient, les regards glissent sur toi. »* |
| Le bandeau passager jurait avec le reste | Il tenait dans une pastille à bord coloré, sur une ligne, et débordait de l'écran d'un téléphone dès cinq mots. Il a désormais la voix des murmures : de l'écriture sur le noir, calée sous le bandeau d'état, qui passe à la ligne |

### Les murs fêlés

Le vrai remède au caillou n'était pas de mieux l'expliquer : c'était de lui
donner un travail qui ne dépende d'aucune sentinelle. **Certaines pierres sont
fêlées, et seul un caillou les ouvre** — on ne perce pas un mur avec de la
lumière.

- Une fissure est **de la pierre** : elle bloque le pas, arrête la lumière, et
  le parcours en largeur ne la traverse pas. Elle ne devient un couloir qu'une
  fois cassée.
- Elle laisse filtrer un souffle de ce qu'il y a derrière, sinon le halo du
  Peureux s'arrêtait avant elle et la fente n'existait que pour qui savait
  déjà où regarder.
- Une case de tolérance à l'impact : le jet s'arrête toujours *avant* le
  premier mur, donc viser la fente fait tomber le caillou juste à côté.
- **Dans le prologue**, c'est la toute première chose qu'on fait : la salle du
  réveil a une pierre fendue, un murmure la désigne, et derrière il y a une
  poche de cailloux. Le caillou a donc servi avant qu'on ait vu le moindre
  ennemi. La poche ne donne pas d'éclat — le budget du niveau reste calibré au
  point près.
- **En procédural**, une fissure n'est jamais un passage obligé : on ne la pose
  que dans une pierre d'un seul rang séparant deux endroits **déjà
  atteignables mais loin l'un de l'autre**. La casser ouvre un raccourci, elle
  ne débloque jamais rien.

Mesuré sur 90 zones tirées, étages 2 à 7 : **60 en portent au moins une**, 88 au
total, pour un raccourci moyen de **8,6 cases** (de 6 à 28) — et **0 zone
devenue infinissable**, puisque la zone reste entièrement parcourable sans
casser quoi que ce soit.

### Les deux lumières

Trou de fiction relevé à la manette, et il était énorme : **pourquoi ton halo et
ton faisceau te font-ils repérer, alors qu'une torche au mur t'efface ?** Deux
lumières, deux effets contraires, aucune raison donnée.

La règle est dans `docs/lux-falot.md` : *un Guet ne voit pas les corps, il ne
voit que des lampes* — et ce qu'il attend, c'est **une petite lumière seule dans
le noir**, la forme de ce qui est tombé avant lui. Ce que tu portes a exactement
cette forme. Une flamme posée n'en a pas : c'est un morceau de la pièce, et
dedans tu n'es plus qu'une tache un peu plus sombre. *On ne repère pas une
bougie dans un brasier.*

L'étage 1 l'enseigne en deux murmures, dans la salle de la torche : le brandon à
l'entrée, la règle à la flamme. Le texte de la forme Veilleur et le récit du
quatrième étage disent la même chose avec d'autres mots.

**Et le brandon n'est plus « laissé allumé » par quelqu'un** — c'est le joueur
qui le rallume, la première version se contredisait. Ce sont des brandons morts,
accrochés là par ceux qui sont passés avant ; ce qu'il reste de lumière à Falot
suffit à les reprendre.

> **Un réglage au passage.** Le rayon de rallumage était de 0,75 case, et le
> brandon est décalé vers sa paroi : il fallait lui rentrer dedans au pixel
> près. On passait à côté d'un abri sans le reprendre. Il est à 1,15 case, et
> le trajet naturel vers la sortie de la salle l'allume désormais.
>
> C'est ce réglage qui a fait rougir le test de l'abri : le joueur y rallumait
> une torche à 0,66 case de l'âme qu'on voulait laisser dehors, et l'abri
> couvrait tout — correctement. Le jeu avait raison, c'est la mesure qui
> était devenue fausse.

### Ce que le caillou laisse derrière lui

On lançait dans le noir sans jamais voir où ça tombait — or c'est précisément
l'information dont on a besoin pour décider par où passer. Le caillou porte
désormais une petite lueur en vol, et il en laisse une où il tombe, trois
secondes et demie.

Et ça ne contredit pas *« la seule chose ici qui ne brille pas »* : **la pierre
ne brille toujours pas, c'est ce que Falot a laissé dessus qui brille.** Il la
tient dans la main ; un peu de lui reste dedans. Là où elle tombe, ça fait une
**autre petite lumière seule dans le noir** — exactement la chose qu'un Guet
passe son existence à attendre.

Le leurre n'a donc plus besoin d'une règle à lui : c'est la règle des deux
lumières, prise par l'autre bout. Un Guet ne se détourne pas d'un bruit, il se
détourne d'un leurre qui lui ressemble plus que toi.

### Les paroles font la queue

Deux âmes rallumées coup sur coup avaient chacune quelque chose à dire, et on
n'en lisait aucune. Une seule phrase tient l'écran à la fois ; les autres
attendent leur tour (trois au plus, au-delà tant pis). Une réplique **suit
celui qui parle** au lieu de rester figée où il était — sans ça, quand le convoi
avance, on ne sait plus qui a dit quoi. Mesuré : au pire **1** phrase affichée
en même temps.

### Ce qui a été retiré

Le murmure *« Un regard va tout droit, et n'a pas de mains »* justifiait le fait
qu'un Guet ne franchit pas les portes. Cette règle-là est une **commodité de
jeu**, pas une règle du monde : elle donne un abri qui ne coûte pas de lumière,
et on pourra la lever le jour où l'on voudra durcir. Elle n'avait donc rien à
faire dans la bouche du décor. La bible le dit maintenant comme tel.

### Les Guets ont enfin un nom à l'écran

Il était dans la bible depuis le début et **nulle part ailleurs** : on pouvait
jouer des heures sans que les rouges soient nommés. Les deux murmures de la
salle de la torche et de la galerie, les textes des formes Peureux et Solaire,
le bandeau de l'éclat et le récit du quatrième étage disent « un Guet ».

### Ce qui a été corrigé après la troisième manette

| Ce qui clochait | Ce qui a été fait |
|---|---|
| Ça saccadait | Voir ci-dessous : ce n'était aucune fonctionnalité, c'était le nombre de pixels |
| Les fissures brillaient dans le noir | Elles ne s'éclairent plus toutes seules. En échange, **la lumière mord plus profond dans une pierre déjà fendue** (0,95 case au lieu de 0,2) : le réseau entier se lit dès que le halo l'atteint, et rien du tout quand il ne l'atteint pas |
| On tourne autour de la première âme sans comprendre | Elle parle : *« On m'a vidé de ma lumière. Il m'en faudrait un peu de la tienne — mais la tienne est trop petite. »* Une fois, et seulement tant qu'on n'a pas de faisceau, c'est-à-dire tant que c'est vrai |
| Le Guet était dans un croisement : on ne pouvait pas lancer par-dessus un mur | Ce n'est plus un couloir mais une **salle de 44 cases**. Le Guet la balaye en entier sur trois points ; il y a enfin de la place pour envoyer un caillou d'un côté et passer de l'autre |
| On ne voyait pas qu'un Guet avait entendu | Il porte un **point d'interrogation** au-dessus de la tête, et il sort du noir pendant qu'il cherche. Le caillou s'entend désormais à **9 cases** au lieu de 5,5 |

### Ce qui saccadait

Ce n'était aucune fonctionnalité — le corps de la boucle coûte entre 1,1 et
2,9 ms par image. C'était la **surface à remplir**. Plafonner la densité d'écran
à 2 ne suffit pas : sur une tablette, ça fait encore trois millions de pixels.

| Mesuré, manette en main | Avant | Après |
|---|---|---|
| Téléphone 412×915 @3, étage 1 | 1 image sur 300 au-dessus de 20 ms | 1 sur 300 |
| Téléphone, étage 6 forme Solaire | 2 sur 300 | 1 sur 300 |
| **Tablette 1024×1366 @2, étage 6** | **108 sur 300**, médiane 19,4 ms | **7 sur 300**, médiane 16,7 ms |

Le remède est un **budget en pixels** (2,1 millions) dont on déduit la densité :
un téléphone garde toute sa finesse, un grand écran rend un peu moins fin
plutôt que de saccader. La tablette est passée de 1536×2049 à 1255×1674.
Trois réglages l'accompagnent : un palier de repli supplémentaire sous le pixel
d'écran, la surveillance de cadence qui tourne **tout le temps** et plus
seulement le doigt sur le joystick, et une seconde d'observation au lieu d'une
et demie.

> **Comment on l'a trouvé.** L'écart entre deux images ne dit rien tant qu'on est
> calé sur les 60 Hz : il vaut 16,7 ms qu'on ait trois fois trop de marge ou pas
> assez. Le jeu mesure donc maintenant le coût réel du corps de sa boucle
> (`__lux.couts()`), et c'est en comparant ce coût — resté minuscule — à
> l'écart réel qu'on a vu que le temps partait dans la rastérisation.

### Une seule voix

Le bandeau passager et les phrases du décor disaient la même chose, **de deux
couleurs et à deux endroits différents**, et se recouvraient l'une l'autre. Tout
ce qui EXPLIQUE passe maintenant par le bandeau, d'un seul ton. Seules les
répliques des âmes restent dans le monde, attachées à qui parle — là, la couleur
dit *qui*, pas *quoi* : bleu quand elle est encore éteinte, vert quand elle
vient de se rallumer.

Une seule file, donc une seule phrase à l'écran. Mesuré en rallumant toutes les
âmes d'un coup : **au pire 1** texte affiché à la fois, bandeau compris. Et le
texte reste plus longtemps — 4,4 s pour une explication, 5,4 s pour une phrase
du décor, contre 2,8 s avant.

Trois bandeaux ont disparu : l'aide en bas de l'écran, « la pierre cède » (on le
voit) et « le bonus s'éteint » (sa jauge se vide). Le murmure du réveil tient
désormais en une ligne — *« Le mur, juste en dessous, est fendu. Un caillou
suffirait. »* : il débordait sur la tête du personnage, et il n'avait pas besoin
de répéter que le caillou ne brille pas.

Le bonus a quitté sa pastille flottante : même format que la jauge d'évolution,
même largeur, juste en dessous.

### Le bruit passe avant tout

Le caillou ne servait qu'à une sentinelle au repos : dès qu'elle était en
alerte, le jet ne faisait rien — c'est-à-dire précisément au moment où l'on en
a besoin. Un caillou qui tombe à portée **efface tout** : alerte, jauge,
poursuite. Elle lâche, elle se tourne, elle y va, et pendant tout ce temps
**elle ne cherche plus personne**.

Mesuré, sentinelle en pleine poursuite avec le joueur à deux cases dans son
cône : alerte 2,57 → **0**, jauge → **0**, curiosité 4,8 s, et elle se rapproche
du caillou de 4,11 à 3,11 cases en une seconde, le regard à **0,06 radian** de
sa direction de marche.

> **Un bug bien à moi, attrapé par la mesure.** `ecartAngle(a, b)` rend *b moins
> a* ; j'avais écrit `(cible, regard)` au lieu de `(regard, cible)`. La
> sentinelle marchait vers le caillou **en se détournant de lui** — 171 degrés
> à côté. Rien ne l'aurait montré sans mesurer l'écart entre le regard et la
> marche.
>
> Au passage : si le caillou tombe dans un recoin qu'elle ne peut pas atteindre,
> elle y va tout droit au lieu de rester plantée comme si elle n'avait rien
> entendu.

### La scène d'ouverture

L'écran noir dit « Elle tombe » — alors on la voit tomber. Une petite lumière
bleue traverse le plafond de la première salle pendant que les derniers mots
s'effacent, touche le sol, et Falot est là : il gonfle depuis rien, regarde à
gauche, à droite, puis devant lui. Alors seulement il peut partir.

**Avant ça, il n'existe pas.** Ni corps, ni halo : `eclosion` vaut 0 depuis le
clic sur « Descendre », donc même quand le noir s'efface il n'y a rien à voir
que la lumière qui descend. La scène a sa propre branche de boucle : pas de
règles, pas de sentinelles, pas de commandes.

| Moment | Durée |
|---|---|
| Elle tombe, en accélérant | 1,5 s |
| Il apparaît | 0,5 s |
| Il regarde à gauche | 0,8 s |
| Puis à droite | 0,8 s |
| Puis devant lui — et il est libre | 0,45 s |

Mesuré : pendant les deux phrases `eclosion` = 0 ; à mi-chute la lumière est
posée à `t` = 0,55 s et il n'y a toujours personne ; à l'impact `eclosion`
démarre à 0,03 ; une seconde plus tard il regarde à 3,02 radians — à gauche.
Le raccourci `?etage=1` saute la scène.

### Les règles restent lisibles

Une explication qui s'efface au bout de quatre secondes, on ne la lit qu'à
moitié. Le bandeau **ne disparaît plus** : passé son moment il pâlit (42 %) et
il reste, jusqu'à ce qu'une autre phrase le remplace. On peut y revenir quand on
veut, et il ne gêne personne.

Le bonus, lui, est repassé sur **une seule ligne** : son nom à gauche, sa barre
à droite, le tout aligné sur la largeur de la jauge d'évolution. Empilé entre
les deux barres avec 4 px de part et d'autre, il paraissait posé dessus. Le
bandeau d'état est repassé de 83 à 68 px de haut.

### Passer le prologue
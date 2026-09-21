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

**Le canal principal : ce que disent les lumières qu'on rallume.**

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
| Les lumières rallumées | qui sont les Éteints, ce qu'ils ont vécu | aucun |
| La cage d'escalier | où l'on est, ce qu'on a fait, ce qui reste | un arrêt déjà prévu |
| Les murmures | le bâtiment, les Guets, ceux qui sont passés avant | aucun |
| L'écran noir d'ouverture | trois mots | le seul arrêt qu'on s'autorise |

---

## Les salles

Huit intentions, cinq salles, **moins de quatre minutes**. La première salle en
porte quatre à elle seule, et c'est voulu : on apprend en marchant.

### 1. Le réveil — une seule salle, et tout y est
Une salle large, bien trop grande pour un halo d'une case et demie, coupée par
deux blocs de pierre. **Dix torches** : cinq brûlent déjà au plafond, cinq sont
mortes le long du mur du bas et se reprennent en passant devant. Neuf lueurs
traînent entre les deux.
**Enseigne**, dans cet ordre et sans une question posée :
1. on se déplace, et on ne voit que ce qu'on éclaire ;
2. on est dans un bâtiment noir où seule la lumière qu'on allume existe — c'est
   ce que disent les torches, de loin, avant même qu'on les atteigne ;
3. une torche morte se reprend en passant ;
4. les lueurs remplissent quelque chose, et **au bout de la salle on a le
   faisceau** (neuf lueurs, 36 d'éclat, le palier est à 26).

> **Trois salles sont devenues une.** Le réveil était une pièce de trois cases
> avec deux murs fêlés à ouvrir à la pierre, puis un couloir de lueurs, puis
> une salle de torches. En test, personne ne comprenait qu'il fallait casser un
> mur — on demandait une mécanique avant d'avoir appris à marcher — et on
> arrivait devant le premier Guet encore Peureux, c'est-à-dire sans rien à
> essayer. Les fentes ont disparu ; la leçon de la pierre est restée là où elle
> sert, devant un Guet.

> **La main.** Le joystick naît sous le doigt, où qu'on le pose : agréable une
> fois qu'on le sait, indevinable avant. Deux choses le disent maintenant, et
> les deux sont dans la fiction — un murmure au réveil (« Pose ta main sur le
> noir, et tire : il va où tu vas. ») et un fantôme de manche dessiné en bas de
> l'écran, un cercle et un point qui glisse, qui disparaît pour de bon au
> premier mouvement.

### 2. Le premier Guet
Un couloir traversé par un rouge en ronde. Il faut passer.

La première tentative échoue : on est vu, on s'éteint, on se rallume à l'entrée
de la salle — instantanément, sans écran, sans pénalité. **Et c'est à ce
moment-là que le bouton PIERRE se met à pulser.**

**Enseigne** : le rouge, son cône, le fait que mourir ne coûte presque rien, et
la pierre — dans cet ordre. On ne donne jamais l'outil avant le problème.

Deux solutions valables, et c'est ce qui en fait une bonne salle :
- lancer une pierre pour qu'il aille voir ailleurs ;
- se tenir près de la torche allumée de la salle précédente, car **une torche
  allumée rend invisible** (vérifié dans le code : `abri` coupe la détection).

### 3. Le Frileux qu'on ne peut pas encore aider
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

### 4. Le Seuil qui réclame
On atteint le portail. Son anneau est vide : **deux lumières demandées, zéro
livrée.** On ne peut pas partir.

> **C'est ici que je m'écarte le plus du croquis.** L'idée d'une « porte bloquée
> jusqu'à ce qu'on aille chercher le PNJ » introduit une serrure que le reste du
> jeu n'utilise jamais — alors que la règle établie est qu'une porte s'ouvre pour
> quiconque n'est pas un Guet. Un niveau d'introduction doit enseigner les vraies
> règles, pas des exceptions.
>
> Le portail qui réclame une lumière produit exactement le même détour, avec une
> règle qui servira toute la partie.

### 5. La montée en confiance
Un passage latéral, assez de lueurs pour atteindre Curieux. Le bouton change de
couleur, pulse, gagne son aura.
**Enseigne** : l'éclat ouvre des formes, et les formes ouvrent la pierre.

### 6. Le second Frileux — la révélation
Dans le couloir qui suit la montée, **un deuxième Frileux**, tout de suite
après les fragments. On l'éclaire, et cette fois **le corps se remplit par le
bas**, du contour sombre au vert plein. Il suit.

**Enseigne** : c'était ça, le faisceau. La mécanique centrale du jeu, découverte
par contraste avec l'échec de la salle 5 — quinze secondes plus tôt on ne
pouvait pas, maintenant on peut.

### 6 bis. Retourner chercher le premier
Le Seuil réclame **deux** lumières. On en a une. Le premier Frileux est toujours là,
en arrière — et on sait désormais quoi faire de lui.

**Enseigne** : le Seuil compte, et **on retourne chercher ceux qu'on a laissés
derrière**. C'est le sujet du jeu tout entier, enseigné par la géographie sans
une ligne de texte.

### 7. Le passage à deux
Un couloir, un rouge, et cette fois un suiveur derrière soi. La jauge du rouge
monte **deux fois plus vite** — mesuré, 0,17 par corps exposé et par
demi-seconde.
**Enseigne** : escorter coûte. C'est l'arbitrage de tout le jeu.

> Un seul rouge, pas deux. Un premier examen doit être réussissable du premier
> coup par quelqu'un qui a compris.

### 8. Le Seuil, rempli
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
prenable — et son visage le dit, puisque l'apaisement s'affiche sur chacun, une lumière après l'autre.

Cela transforme un abri en **problème de placement** plutôt qu'en interrupteur :
avec quatre suiveurs et une braise, il faut que tout le monde tienne dedans.
C'est exactement l'arbitrage que le jeu cherche partout ailleurs.

Mesuré sur 60 images, une braise couvrant le joueur et un personnage sur deux : la lumière
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
##.t...t...t...t...t...##     1  LA SALLE DU RÉVEIL : cinq torches allumées
##.....##.....##.......##     2  deux blocs de pierre : la vue est coupée
##7@.o.##.o.o.##.o...o.##     3  le réveil, la main, et les lueurs
##.....##.....##.......##     4
##..o.....8o.....o...o.##     5  neuf lueurs : de quoi ouvrir le faisceau
##...T...T...T...T...T.##     6  cinq torches ÉTEINTES, qu'on reprend en passant
##################*######
##################=######     8  entrée de la galerie, colonne 18
############......1....##     9
############.....r.....##    10  la SALLE des deux Guets : 44 cases
############...........##    11
############...r.......##    12  le second garde la sortie
##############=##########    13  SORTIE colonne 14 : elle n'est pas alignée
##############*........##    14  la salle du Frileux qu'on ne peut pas aider
##############.......b.##
##############.........##
######.......|.*.......##    17  le couloir calme, et sa porte
######=##################
##....*.########......###
##......##5T####......###    20  l'alcôve de la torche, au-dessus du couloir
##..S...|o.o..r|o*....###    21  le couloir de l'escorte, ligne du haut
##....4.|......|.b....###    22  sa ligne du bas, et la 2e lumière à sa bouche
##......####.b##......###    23  la 1re lumière, dans sa poche sous le couloir
#########################
```

`#` mur — `@` départ — `S` Seuil — `o` lueur — `g` poche de pierres —
`T` torche — `b` Frileux — `r` Guet — `%` mur fêlé — `|` et `=` portes —
`*` point de reprise — `1-9` murmure.

**La toute première chose qu'on fait dans ce jeu, désormais, c'est casser un
mur.** La salle du réveil a une pierre fendue dans son plancher de pierre ; un
murmure la désigne, le halo la montre, et le seul objet qu'on possède l'ouvre.
Derrière : une niche et une poche de pierres. La pierre n'est plus un bouton
dont on cherche l'usage — il a servi avant qu'on ait vu le moindre ennemi.

**Le parcours.** Réveil, couloir des lueurs, salle de la torche, galerie du
premier Guet, salle d'un Frileux — qu'on ne peut pas encore sauver —, couloir
calme, Seuil qui réclame deux lumières. Puis le couloir des fragments, gardé par le
second Guet. La première lumière est dans un renfoncement **sur ce couloir même**,
sous le nez du Guet ; la seconde au fond de la dernière salle. On ramène la
première, **le portail affiche 1/2**, et c'est là seulement qu'on comprend qu'il
se charge. On repart chercher l'autre, et le retour repasse devant le même
Guet.

> **Corrigé deux fois, après essai à la manette.** Les deux lumières étaient
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
| Le Seuil réclame deux lumières | avec 1 livrée il reste fermé ; avec 2 la vidange part et l'étage 2 se charge |

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

Une précision honnête : ce pilote ne sait ni lancer une pierre ni se mettre à
l'abri. Guets actifs, il ne franchit pas un couloir gardé — ce qui dit que le
couloir est un vrai obstacle, et rien du temps qu'y mettra quelqu'un qui a
compris. Ce chiffre-là se mesure à la main.

### Ce que le joueur ne comprenait pas

Relevé à la manette, en deux passes. Aucun bug : des règles que le jeu
appliquait sans jamais les dire.

| Ce qui manquait | Ce qui a été fait |
|---|---|
| À quoi sert la pierre | Un murmure dès la première salle, un autre avant la galerie du Guet, le bouton qui bat quand un regard commence à te tenir — et surtout **les murs fêlés** (voir plus bas) |
| Qu'on charge le portail avec des lumières | Le compte est écrit **sur le portail** (« LUMIÈRES — 1 / 2 », « ENTRE » quand il cède), une phrase le dit à la première approche, le murmure du Seuil l'explique |
| Qu'on remplit une jauge qui change de forme | La barre passe de 80 à 148 px, gagne un contour et une légende : **PEUREUX → CURIEUX**. Toute la jauge sursaute au ramassage |
| Que le portail se charge à plusieurs lumières | Les deux lumières sont séparées : on en livre une, on lit « 1/2 », on repart |
| La torche était un abri, et le murmure parlait d'autre chose | Il disait *« d'autres sont passés avant toi »* — fidèle à la bible, mais inutile à cet endroit. Il dit maintenant les deux : *« Quelqu'un est passé avant toi, et a laissé ça allumé. Tant que la flamme tient, les regards glissent sur toi. »* |
| Le bandeau passager jurait avec le reste | Il tenait dans une pastille à bord coloré, sur une ligne, et débordait de l'écran d'un téléphone dès cinq mots. Il a désormais la voix des murmures : de l'écriture sur le noir, calée sous le bandeau d'état, qui passe à la ligne |

### Les murs fêlés

Le vrai remède à la pierre n'était pas de mieux l'expliquer : c'était de lui
donner un travail qui ne dépende d'aucune sentinelle. **Certaines pierres sont
fêlées, et seul une pierre les ouvre** — on ne perce pas un mur avec de la
lumière.

- Une fissure est **de la pierre** : elle bloque le pas, arrête la lumière, et
  le parcours en largeur ne la traverse pas. Elle ne devient un couloir qu'une
  fois cassée.
- Elle laisse filtrer un souffle de ce qu'il y a derrière, sinon le halo du
  Peureux s'arrêtait avant elle et la fente n'existait que pour qui savait
  déjà où regarder.
- Une case de tolérance à l'impact : le jet s'arrête toujours *avant* le
  premier mur, donc viser la fente fait tomber la pierre juste à côté.
- **Dans le prologue**, c'est la toute première chose qu'on fait : la salle du
  réveil a une pierre fendue, un murmure la désigne, et derrière il y a une
  poche de pierres. La pierre a donc servi avant qu'on ait vu le moindre
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

L'étage 1 l'enseigne en deux murmures, dans la salle de la torche : la torche à
l'entrée, la règle à la flamme. Le texte de la forme Veilleur et le récit du
quatrième étage disent la même chose avec d'autres mots.

**Et la torche n'est plus « laissé allumé » par quelqu'un** — c'est le joueur
qui la rallume, la première version se contredisait. Ce sont des torches
éteintes, accrochées là par ceux qui sont passés avant ; ce qu'il reste de lumière à Falot
suffit à les reprendre.

> **Un réglage au passage.** Le rayon de rallumage était de 0,75 case, et la
> torche est décalée vers sa paroi : il fallait lui rentrer dedans au pixel
> près. On passait à côté d'un abri sans le reprendre. Il est à 1,15 case, et
> le trajet naturel vers la sortie de la salle l'allume désormais.
>
> C'est ce réglage qui a fait rougir le test de l'abri : le joueur y rallumait
> une torche à 0,66 case de la lumière qu'on voulait laisser dehors, et l'abri
> couvrait tout — correctement. Le jeu avait raison, c'est la mesure qui
> était devenue fausse.

### Ce que la pierre laisse derrière lui

On lançait dans le noir sans jamais voir où ça tombait — or c'est précisément
l'information dont on a besoin pour décider par où passer. La pierre porte
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

Deux lumières rallumées coup sur coup avaient chacune quelque chose à dire, et on
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
| On tourne autour de la première lumière sans comprendre | Elle parle : *« On m'a vidé de ma lumière. Il m'en faudrait un peu de la tienne — mais la tienne est trop petite. »* Une fois, et seulement tant qu'on n'a pas de faisceau, c'est-à-dire tant que c'est vrai |
| Le Guet était dans un croisement : on ne pouvait pas lancer par-dessus un mur | Ce n'est plus un couloir mais une **salle de 44 cases**. Le Guet la balaye en entier sur trois points ; il y a enfin de la place pour envoyer une pierre d'un côté et passer de l'autre |
| On ne voyait pas qu'un Guet avait entendu | Il porte un **point d'interrogation** au-dessus de la tête, et il sort du noir pendant qu'il cherche. La pierre s'entend désormais à **9 cases** au lieu de 5,5 |

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
répliques des lumières restent dans le monde, attachées à qui parle — là, la couleur
dit *qui*, pas *quoi* : bleu quand elle est encore éteinte, vert quand elle
vient de se rallumer.

Une seule file, donc une seule phrase à l'écran. Mesuré en rallumant toutes les
lumières d'un coup : **au pire 1** texte affiché à la fois, bandeau compris. Et le
texte reste plus longtemps — 4,4 s pour une explication, 5,4 s pour une phrase
du décor, contre 2,8 s avant.

Trois bandeaux ont disparu : l'aide en bas de l'écran, « la pierre cède » (on le
voit) et « le bonus s'éteint » (sa jauge se vide). Le murmure du réveil tient
désormais en une ligne — *« Le mur, juste en dessous, est fendu. Une pierre
suffirait. »* : il débordait sur la tête du personnage, et il n'avait pas besoin
de répéter que la pierre ne brille pas.

Le bonus a quitté sa pastille flottante : même format que la jauge d'évolution,
même largeur, juste en dessous.

### Le bruit passe avant tout

La pierre ne servait qu'à une sentinelle au repos : dès qu'elle était en
alerte, le jet ne faisait rien — c'est-à-dire précisément au moment où l'on en
a besoin. Une pierre qui tombe à portée **efface tout** : alerte, jauge,
poursuite. Elle lâche, elle se tourne, elle y va, et pendant tout ce temps
**elle ne cherche plus personne**.

Mesuré, sentinelle en pleine poursuite avec le joueur à deux cases dans son
cône : alerte 2,57 → **0**, jauge → **0**, curiosité 4,8 s, et elle se rapproche
de la pierre de 4,11 à 3,11 cases en une seconde, le regard à **0,06 radian** de
sa direction de marche.

> **Un bug bien à moi, attrapé par la mesure.** `ecartAngle(a, b)` rend *b moins
> a* ; j'avais écrit `(cible, regard)` au lieu de `(regard, cible)`. La
> sentinelle marchait vers la pierre **en se détournant de lui** — 171 degrés
> à côté. Rien ne l'aurait montré sans mesurer l'écart entre le regard et la
> marche.
>
> Au passage : si la pierre tombe dans un recoin qu'elle ne peut pas atteindre,
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
---

## Ce que les tests utilisateurs ont montré (et ce qu'on a mesuré ensuite)

Trois relevés à la manette, par quelqu'un d'autre que l'auteur. Aucun bug : de
la géographie qui enseignait le contraire de ce qu'on voulait.

| Observé | Mesuré ensuite, pilote automatique, 20 essais par moment de ronde |
|---|---|
| « La pierre n'est jamais rentabilisé, on va tout droit » | La galerie se traversait **20/20 en 2,3 s**. Ses deux portes étaient alignées sur la colonne 18 : on descendait une ligne droite de cinq cases. Les 44 cases « pour avoir la place de lancer » n'étaient jamais parcourues |
| « Au deuxième Guet on essaye, on meurt, on recommence, sans comprendre » | Le couloir de l'escorte était **0/20**. Large d'une case, il était *bouché* par le Guet : le toucher tue, et la pierre n'étourdit qu'à partir d'Ardent — hors budget du prologue (plafond 68 d'éclat, Ardent à 88). La pierre ne **pouvait pas** résoudre ce couloir |
| « Après la première lumière, le joueur remonte tout l'étage » | Repartir à l'est chercher la seconde était **0/20, jamais atteinte**. Il n'a pas manqué d'intuition : le niveau punissait la route prévue et récompensait l'autre — au nord c'était connu, sûr, et il y avait un Frileux dont il se souvenait |

**Le diagnostic, en une phrase : le prologue ne contenait aucun endroit où le
pierre était la réponse.** Pas un. Et son seul passage difficile ne pouvait pas
être résolu par l'outil qu'il était censé enseigner.

### Ce qui a été fait

1. **Les deux issues de la première salle sont fêlées.** On ne quitte pas le
   réveil sans casser un mur : la pierre sert dans les quinze premières
   secondes, avant le moindre Guet, et la carte dit enfin ce que ce document
   affirmait déjà. La fente se lit d'elle-même — la lumière mord 0,95 case dans
   une pierre fendue, donc le réseau de fractures s'allume sous le halo, à
   bout portant, sans une phrase.
2. **Les portes de la galerie sont désalignées** : entrée colonne 18, sortie
   colonne 14. Traverser demande de se déplacer dans la ronde du Guet, là où il
   y a la place de lancer.
3. **La dernière lueur est passée à l'est du Guet de l'escorte** (colonne 16) et
   **la seconde lumière à la bouche du couloir** (17,22) : on devient Curieux
   *après* avoir traversé, et les deux lumières sont vues à l'aller. Plus rien
   n'oblige à deviner qu'il en reste une.
4. **Le couloir de l'escorte fait deux cases de haut** sur toute la ronde du
   Guet, et **ses deux battants sont hauts de deux cases**. Sans ce doublement,
   on ne pouvait entrer que par la ligne du haut, c'est-à-dire pile sur le poste
   du Guet ; et une case de porte reste un mur pour lui, battant ouvert ou non,
   donc son quartier est toujours scellé.
5. Le mot **« brandon » a disparu** : ce sont des torches. La fiction qui va
   avec (des torches mortes qu'on reprend) est inchangée, sa formulation
   attendra une passe d'écriture.

### Ce que ça donne

| Passage | Avant | Après |
|---|---|---|
| Galerie, tout droit | 20/20 | **6/20** |
| Galerie, en lançant une pierre et en attendant que le Guet parte | — | **20/20** |
| Couloir de l'escorte, ligne du haut | 0/20 | 0/20 *(inchangé, et voulu)* |
| Couloir de l'escorte, ligne du bas | impossible | **20/20 seul, 18/20 à deux lumières** |
| Retour vers la bouche du couloir | 0/20 | **20/20** |

Foncer n'est plus la stratégie dominante dans la galerie, la pierre l'est. Le
couloir est devenu un choix de voie au lieu d'un mur : la ligne du haut tue
toujours, celle du bas passe, et escorter deux lumières coûte deux essais sur vingt.

**Tout ceci est en tests** — `tests/prologue.test.ts` pilote la vraie
simulation, sans canvas ni navigateur, et chaque intention du niveau y est une
assertion. Si quelqu'un réaligne les portes de la galerie ou remet une lumière au
fond de la salle de droite, la suite le dit.

---

## Deuxième tour de tests utilisateurs

Le prologue a été rejoué par quelqu'un d'autre, après les corrections
précédentes. Trois retours, et un changement de fiction.

### La pierre s'appelle une pierre

« Caillou » est remplacé par « pierre » partout — textes, code, fichiers,
identifiants du DOM. La convention du projet veut que le mot de la fiction et
celui du code soient le même ; ils le sont.

### Les Guets veulent éteindre le monde

L'ancien concept — *un Guet ne voit pas les corps, il cherche une petite lumière
seule dans le noir, exactement la forme que tu as* — n'a pas pris : personne ne
l'a compris en jouant, et il ne plaisait pas. Il est remplacé par :

> **Un Guet veut éteindre le monde, et vider ta lumière. Il n'approche jamais
> d'une flamme plus grande que lui.**

Les conséquences mécaniques ne changent pas d'un pouce — ce qu'on porte expose,
ce qui est posé protège, la pierre détourne — mais la raison est inversée : il
ne reconnaît plus une forme, il vient prendre de la lumière. Les murmures, les
textes des formes et le récit du quatrième étage disent désormais ça. La section
de la bible est marquée comme dépassée, en attendant une passe d'écriture.

### Ce que les Guets font de neuf

1. **Ta lumière les alerte.** Halo ou faisceau qui s'attarde sur un Guet : il
   cesse sa ronde et fouille. Deux garde-fous, et ils ne sont pas décoratifs —
   il faut que la lumière reste sur lui **plus de 0,35 s**, et qu'elle vienne de
   moins de six cases. Sans eux, escorter devenait impossible : le faisceau
   pointe forcément là où l'on va, donc droit sur ce qu'on veut éviter, et le
   couloir tombait à **4 essais sur 20**.
2. **Détecté, il va sur place.** Un corps dans son cône, et il retient
   l'endroit : il cesse de balayer, s'y rend, et c'est au joueur de ne plus y
   être. Avant, il fouillait au hasard dans la direction de son regard — on
   pouvait rester planté à trois cases sans qu'il ne vienne jamais.
   *La lumière alerte, le cône déclenche la traque : les deux sont distincts, et
   les confondre rendait le faisceau suicidaire.*
3. **Un mur cassé est un couloir, pour lui comme pour nous.** C'était déjà vrai
   — une fissure ouverte devient du sol pour tout le monde — c'est maintenant
   vérifié par un test. Seule une porte reste un mur pour un Guet.

### Ce que le prologue devient

| Changement | Pourquoi |
|---|---|
| Deux Guets dans la galerie, un par moitié de salle | Un seul laissait passer 6 essais sur 20 ; l'un barre l'entrée, l'autre la sortie |
| La niche ne donne plus de poche de pierres | « Poche intarissable — lance sans compter » était une phrase de bonus au milieu d'une leçon sur les murs. C'est un cul-de-sac, et ça prouve qu'on casse des murs |
| Deux torches dans la salle des torches, sur deux murs, à sept cases l'une de l'autre | Une seule ne suffisait pas à faire comprendre qu'on les rallume en passant |
| La phrase « Tu te souviendras d'être passé ici » disparaît | Elle ne disait rien de l'histoire, et personne ne voyait le rapport |
| Les torches sont DESSINÉES | Une torche éteinte était un trait vertical de quatorze pixels : un manche, un collier, et au bout une flamme ou un charbon noir. Debout et face à la caméra, comme les visages — couchée sur sa paroi, elle se lisait comme un verre à pied |

**Les rondes de la galerie ont été choisies à la mesure**, pas au jugé : six
configurations essayées, vingt essais chacune, à tous les moments de la ronde.

| Rondes essayées | Tout droit | Avec une pierre |
|---|---|---|
| Bandes horizontales larges | 16/20 | 20/20 |
| Verticales, colonnes 17 et 15 | 4/20 | 19/20 |
| Horizontales serrées, rangs 10 et 12 | 13/20 | 20/20 |
| L'un barre l'entrée, l'autre la sortie | 6/20 | 20/20 |
| Croix : un vertical, un horizontal | 12/20 | 20/20 |
| **Les deux autour de la sortie (retenue)** | **4/20** | **20/20** |

### Ce que ça donne

| Passage | Avant ce tour | Après |
|---|---|---|
| Galerie, tout droit | 6/20 | **4/20** |
| Galerie, en lançant d'abord une pierre | 20/20 | **20/20** |
| Couloir de l'escorte, ligne du haut | 0/20 | 0/20 |
| Couloir, ligne du bas, seul | 20/20 | 16/20 |
| Couloir, ligne du bas, une et deux lumières | 20/20 et 18/20 | **17/20 et 17/20** |
| Retour vers la bouche du couloir | 20/20 | 8/20 |

Le retour a payé la nouvelle règle de traque. C'est assumé : les deux lumières sont
vues à l'aller, donc ce retour n'est plus un passage obligé — et il reste
possible, là où il était mortel il y a deux tours.

## Mourir et changer d'étage

L'animation de mort était une téléportation d'une image à l'autre : on ne
comprenait pas ce qui venait d'arriver. Et franchir un Seuil changeait le décor
sans qu'on voie qu'on montait — alors que c'est le sujet du jeu.

Les deux se ressemblent désormais, parce que c'est la même chose qui se passe :
**la lumière quitte le corps et s'en va vers le haut.**

- **Mourir** : le corps se vide de sa couleur, sa lumière monte (0,6 s), puis il
  revient au point de reprise par une arrivée brève. Une seconde et demie en
  tout, montre comprise — « la mort doit coûter des secondes, pas de la
  patience », et c'est en test.
- **Franchir un Seuil** : la vidange dans le portail (inchangée, 2,2 s), puis
  l'envol (1,1 s, la colonne monte plus haut : il s'en va pour de bon), puis la
  cage d'escalier.
- **Arriver à l'étage suivant** : la lumière vient **du bas** et monte, traîne
  comprise. Au premier étage seulement, elle tombe du plafond — « une lumière
  qui s'éteint ne disparaît pas, elle tombe » — et s'offre le regard à gauche,
  à droite, puis devant. Ailleurs, on a déjà vu la scène : elle va trois fois
  plus vite et ne s'attarde pas.

Le monde est figé pendant ces passages : ni Guets, ni règles. C'est vérifié.

## Troisième tour : rendre les Guets jouables

Les deux premiers tours avaient corrigé le prologue ; celui-ci corrige la
règle. Le reproche était simple et juste : **c'était trop punitif.** Une
lumière qui effleurait un Guet le retournait, et on mourait sans avoir eu le
temps de comprendre qu'on avait été vu.

### L'alerte se fait en deux temps

| Seuil | Ce qui se passe | Pourquoi |
|---|---|---|
| **0,35 s** de lumière sur lui | Il devient rouge **plein** (plus de simple contour), un « ? » s'allume au-dessus de lui, il **s'arrête et balaye à gauche et à droite là où il était** | On sait qu'on a été remarqué, et on a le temps de s'écarter ou de lancer une pierre. Il ne se retourne pas vers nous |
| **1,6 s** sans s'écarter | Il quitte son poste et vient au point où la lumière l'a touché | Rester dans sa lueur doit coûter. C'est un choix du joueur, pas une sanction |

Le cône, lui, n'a pas changé de rôle : être vu **dans** le cône donne toujours
au Guet le point de détection, et c'est au joueur de s'en échapper.

**Une pierre annule tout** : en touchant le sol elle efface le point de
détection et remet le bain de lumière à zéro. Sans cette ligne, le Guet
repartait vers nous sitôt sa curiosité finie — « il est trop obnubilé par le
player ». Et elle vole plus vite (0,28 s + la distance) : une réponse qui
arrive après la mort n'est pas une réponse.

### Le convoi souffle sa lumière

Quand une sentinelle est en alerte ou charge, **les lumières déjà rallumées
soufflent leur lumière** : plus de halo, plus de faisceau, plus de trou dans la
nuit. **Elles gardent leur couleur** — elles sont toujours rallumées, elles se
cachent seulement ; on les voit donc encore, mais dans NOTRE lumière. Elles
rallument la leur dès que la menace retombe.

C'est de la fiction autant que de la règle : une lumière qui a peur cache sa
lumière. Et surtout, **seule la lumière du joueur le trahit encore** — être
détecté parce qu'un PNJ qu'on escorte brille dans notre dos était incompréhensible.
En échange, escorter ne coûte plus rien en discrétion : c'est assumé, la
difficulté de l'escorte est le chemin, pas la lueur.

### Les torches, en plus simple

Les torches dessinées du tour précédent étaient « très jolies mais pas du tout
adaptées au design », qui ne vit que de formes suggérées. Elles sont
maintenant à la manière de Minecraft : **un manche rectangulaire, une tête
carrée** — gris quand elle est morte, orange à cœur blanc quand elle brûle.
Pas un dégradé, pas une flamme.

**La lenteur a été mesurée, pas devinée** : le corps d'une image coûte 0,9 ms au
repos et 2,1 ms avec huit torches allumées et un joueur Solaire — c'est-à-dire
exactement ce que coûte le POC gelé (2,1 ms en médiane lui aussi). Cinq Guets
lancés à nos trousses : 2,2 ms. Le dessin des torches ne coûtait donc rien de
mesurable ; elles ont été simplifiées pour le style, pas pour la vitesse.

### Les portes sont des portes battantes

Un battant tourne sur un gond, et un gond est scellé dans la pierre. Le gond
est désormais choisi quand la grille est lue : du côté où il y a un montant.
Les deux battants d'un passage de deux cases prennent donc appui chacun sur
SON montant, et s'ouvrent en sens inverse — avant, ils s'ouvraient du même
côté et la partie fixe de l'un tenait « à du vent ». Un test le vérifie sur
tous les étages, écrits comme tirés au sort.

## Quatrième tour : se couvrir, et ce qui reste allumé

### Le souffle se recharge entièrement, ou pas du tout

La réserve tenait trois secondes et se refaisait deux fois plus lentement,
mais **rien n'empêchait de resouffler sur une goutte** : on pianotait le
bouton et on traversait tout l'étage par à-coups, ce qui annulait le prix du
geste. Une fois vide, le souffle est désormais **verrouillé jusqu'à la
réserve pleine** (`joueur.souffleBloque`), et le bouton se désactive pendant
ce temps — l'anneau de recharge devient une attente, pas une suggestion.

### Se couvrir, vu du dehors

Deux états, et un seul était visible :

- **dans le noir**, on ne voit plus que **ses yeux** ;
- **dans la lumière de quelqu'un d'autre** — une torche, un faisceau — on le
  voit **en entier mais vidé**, un contour sans couleur, comme une lumière qu'on
  n'a pas encore rallumée.

Le second cas écrasait le premier à cause d'un détail : `estEclaire()` compte
**le halo du joueur lui-même**, et à distance nulle il est toujours vrai. Un
Falot soufflé se croyait donc éclairé par sa propre lumière, qu'il venait
pourtant de couvrir. D'où `eclaireParAutrui()` (`coeur/regles/lumiere.ts`),
qui ne regarde que **les sources extérieures** : les torches et braises
posées, et les faisceaux des lumières déjà rallumées. L'état « deux yeux dans le
noir » existe enfin.

### Une torche reprise ne s'éteint plus

Bug remonté en test : *« en remontant le niveau, des torches que j'avais
allumées étaient éteintes. C'est pas normal. »* C'était exact — elles
brûlaient 26 secondes puis mouraient, si bien que revenir sur ses pas rendait
le chemin au noir.

Une torche **posée** brûle maintenant pour toujours. Seule celle qu'on
**porte** se consume, parce qu'on la vide en la promenant (`regles/fanal.ts`).
Ce n'est pas qu'un confort :

- un abri allumé **reste** un abri, donc un étage se construit ;
- le retour par le même chemin n'est plus une punition ;
- et devant un œil (étage 10), allumer devient une décision qu'on ne reprend
  pas.

### Le compte ne retient que ce qui brûle encore

Le pourcentage de fin d'étage « semblait trop élevé » : il marquait tout ce
que le joueur **avait vu**, halo compris, donc traverser un couloir suffisait
à le déclarer éclairé. Il ne compte plus que **la lumière posée** — torches
reprises et braises laissées — et jamais le halo, le faisceau, ni la torche
qu'on porte. Le chiffre monte plus lentement, ne redescend jamais, et un
100 % se construit torche par torche.

## Cinquième tour : une montée en puissance, pas un autre personnage

### Il ne change plus de couleur

Falot passait de bleu à jaune, à vert, à orange, à blanc, et la jauge annonçait
« PEUREUX → CURIEUX ». On lisait donc **un autre personnage à chaque palier**,
alors qu'il n'y a qu'un petit peureux inquiet qui brille plus fort — et le
jaune, en particulier, « ne va pas du tout » avec le reste.

Les cinq formes partagent maintenant **le même bleu**. Ce qui monte, c'est ce
qu'il **émet** :

- le **halo chaud** est multiplié par un `eclat` propre à chaque palier
  (1 → 1,35 → 1,7 → 2,1 → 2,6), et le faisceau avec lui ;
- une **aura** s'ouvre autour de lui dès le deuxième palier : une couronne qui
  respire, plus large et plus dense à chaque fois.

Dans le bandeau d'état, plus de nom : **cinq losanges** qui s'allument, chacun
plus fort que le précédent, et la barre qui mène au suivant. Le bandeau de
passage ne le renomme plus non plus — il dit *« Ta lumière grandit — la pierre
couve »*, la puissance puis ce qu'elle donne.

### Le regard d'un Guet est une lumière

Un Falot soufflé qui traversait un cône rouge **disparaissait**, alors que ce
cône perce le noir comme une torche : le jeu le dessine ainsi depuis toujours.
S'y tenir, c'est donc être éclairé, même si le Guet n'a rien remarqué —
`eclaireParAutrui()` compte désormais les cônes rouges (et le rayon de l'œil).
On l'y voit **en entier et vidé**, comme dans une torche. Se couvrir n'est pas
devenir invisible dans la lumière.

### La fin, deuxième passe

- **Les fils suivent les cadres.** Ils montaient en courbe à travers les cases
  et passaient par-dessus les scènes sans rien dire. Ils remontent maintenant
  la gouttière centrale, prennent le bras horizontal de la croix, et ne
  quittent le cadre qu'au dernier moment, d'un seul trait perpendiculaire.
- **Une case éteinte est vraiment noire.** Le gris des silhouettes partait
  au-dessus du fond : on voyait les quatre scènes attendre leur lumière, et la
  montée du fil ne révélait plus rien.
- **Le couple est attablé.** Les deux silhouettes étaient dessinées au-dessus
  du plateau : ils avaient l'air posés *dessus*. C'est l'ordre du tracé qui
  fait qu'on est attablé — le corps derrière, le plateau devant — et ils sont
  désormais de part et d'autre, chacun sur sa chaise.
- **La scène de Falot était un cadre où il n'entrait pas.** Elle a tenu une
  version, le temps de comprendre qu'elle ne marcherait jamais : elle demandait
  de saisir une règle au moment où il faudrait seulement être ému. Remplacée
  par l'errance (voir plus bas).

## L'errance — la fin qui n'explique rien

La fin précédente lui faisait retrouver « la sienne » derrière un cadre, et
demandait de comprendre *on n'entre pas dans ce qu'on éclaire* au moment exact
où il faudrait seulement être ému. Ça ne se lisait pas, et une règle qu'il faut
expliquer à la dernière image n'est pas une fin.

À la place, une scène qui se regarde : **il erre dans un monde déjà allumé.**

**Et il faut un décor.** Le premier jet se jouait sur le noir du jeu : on se
croyait encore dans les Dessous, et tout le propos tombait. Les Dessous n'ont
pas de ciel — donc là-haut il en faut un. Il y a maintenant un ciel dégradé
avec des étoiles et un croissant de lune, une ville au fond en parallaxe avec
son phare, des immeubles au premier plan dont **toutes** les fenêtres sont
dessinées (une fenêtre éteinte se voit, sinon une fenêtre allumée flotte dans
le vide et on ne comprend pas qu'il y a une maison derrière), un trottoir, une
bordure, une chaussée et ses pointillés, et des réverbères avec leur cône et
leur flaque au sol. Le trou par lequel il est sorti est une bouche ouverte
**dans le trottoir**.

Mesuré : aucune image perdue sur 120, sur un écran de 900 × 1000.

- Des fenêtres, un réverbère, une bougie, un phare au loin. Il va vers l'une,
  puis une autre, puis une troisième. Chaque fois un fil se tend, chaque fois
  des grains de **sa** lumière partent dans la lampe et n'en reviennent pas.
  Elles ont déjà quelqu'un ; elles n'avaient pas besoin de lui.
- Les fenêtres s'éteignent une à une pendant ce temps. **Pas à cause de lui** :
  le monde va se coucher, c'est tout, et c'est bien pire.
- Il descend à mesure qu'il se vide. Le trou par lequel il est sorti apparaît
  aux deux tiers de la scène : on doit le voir l'attendre.

### Le rouge, et la tête qu'il secoue

Vidé, il commence à **virer au rouge**. C'est la règle du monde appliquée à
lui : une lumière restée éteinte trop longtemps devient un Guet. Il monte à un
cheveu, **il se secoue la tête**, il redevient bleu ; ça remonte plus haut, il
se secoue encore. Il gagne. Et, épuisé d'avoir gagné, il tombe dans le trou.

C'est la seule chose de toute la scène qu'il fasse et qui ne soit pas subie —
donc c'est ce qui reste de lui à la fin : **pas de la lumière, une décision.**

Un détail de fabrication : sa réserve ne descend pas à zéro pendant l'errance,
elle s'arrête à 0,2. Vidé pour de bon, il n'est plus qu'un contour, et un
contour n'a pas de couleur à virer au rouge — on ne verrait rien du moment qui
compte. Le vrai vide a sa propre courbe, et n'arrive qu'après.

### La chute montre ce qu'il a fait

Tout le tunnel qu'il vient de monter défile à l'envers, avec **les petites
lumières qu'il a laissées à chaque palier**. Il tombe en contour, vide — et à
mi-chemin **sa propre lumière revient**. Ce n'est pas une consolation : c'est
la raison pour laquelle il recommence.

## Un timbre de version sur l'écran-titre

GitHub Pages garde `index.html` en cache une dizaine de minutes. On pousse, on
recharge, on voit l'ancienne version, et on croit que le déploiement a échoué —
c'est arrivé une fois de trop. L'écran-titre affiche désormais, tout en bas et
en tout petit, la **date de construction** (`version 2026-09-21 06:54`),
injectée par Vite à la compilation. En développement elle n'existe pas : on ne
se demande jamais si on a la dernière version d'un serveur qui recharge seul.

## De la pierre, enfin

Le sol était un aplat `#1a1a26` et les murs n'étaient **pas dessinés du tout** :
on voyait le fond noir au travers. C'est lisible, et c'est vide.

`src/rendu/tuiles.ts` fabrique maintenant la matière, au chargement et en
quarante millisecondes : des dalles inégales et de travers, des fêlures, du
grain par blocs de deux pixels, et des nappes très larges qui empêchent la
tuile d'être plate. Six variantes, choisies par la position de la case — **la
case est sa propre graine**, sinon la pierre bougerait sous les pieds du
joueur.

Trois choix qui font tout le résultat :

- **Les tuiles sont raccordables.** Chaque caillou est dessiné neuf fois : à sa
  place, et décalé d'une tuile dans les huit directions. Ce qui déborde d'un
  côté rentre de l'autre, et la grille disparaît.
- **Le grain va par blocs de deux pixels.** Pixel par pixel, ça faisait de la
  neige de téléviseur : le détail était plus fin que ce que l'écran montre une
  fois la tuile réduite.
- **Le mur est nettement plus sombre que le sol.** C'est ce qui fait lire
  l'architecture, maintenant que les deux sont dessinés.

Et une ombre de **contact** : là où un sol touche une pierre, le sol
s'assombrit. Ce n'est pas de l'éclairage — elle ne vient d'aucune direction,
elle est la même sur les quatre côtés — c'est de l'occlusion, et sans elle les
cases flottent les unes sur les autres. Elle est cuite une fois par côté :
fabriquer un dégradé par case coûtait une image de temps en temps.

Une pierre enfouie au milieu d'un massif n'est pas dessinée : aucune lumière ne
l'atteint et rien ne la borde.

**Mesuré** : 38 ms de fabrication, une fois, pendant l'écran-titre. Puis 0 à 4
images perdues sur 300 selon les passes — c'est le bruit de mesure d'un
navigateur sans écran, pas une chute.

### La lumière mord enfin la paroi

La pierre était là, et on ne la voyait que par terre : les rayons ne mordaient
le mur que d'**un cinquième de case**, soit un liseré de douze pixels sur une
paroi qui en fait soixante-deux. Et les **cônes** ne la mordaient pas du tout —
ils s'arrêtaient *avant* la pierre, si bien qu'un faisceau braqué sur un mur
laissait ce mur noir, ce qui n'a aucun sens.

Deux changements dans `rendu/lumiere.ts` :

- la morsure passe d'un cinquième à **0,85 case** : le mur qu'on éclaire se
  voit sur presque toute sa profondeur ;
- les cônes empruntent le même parcours que les sources rondes
  (`distanceMur`), au lieu d'avancer par pas fixes. Ils mordent donc comme
  elles — et au passage ils cessent d'enjamber un coin rasé en diagonale, ce
  que le pas fixe faisait.

**Et ça ne fuit pas.** Ce n'est pas une affaire de réglage : le résultat est
borné à la **sortie de la case touchée**, donc un rayon ne peut pas dépasser la
pierre qu'il éclaire, quelle que soit la morsure qu'on lui donne. Comme c'est
désormais la seule chose qui empêche de voir la salle d'à côté gratuitement,
`tests/lumiere.test.ts` la tient : on allume depuis des milliers de positions
sur quatre étages tirés au sort, on suit chaque rayon jusqu'à son bout, et on
vérifie qu'il ne traverse **jamais** plus d'une pierre. Un troisième test tient
l'autre moitié du marché — que la morsure reste franche, sinon on retomberait
dans le liseré sans s'en apercevoir.

## Un mur qui ressemble à un mur

Premier essai raté : le sol et les murs avaient **la même texture**. Il y avait
bien un trait de séparation, mais on confondait une salle, un couloir et un
massif de pierre — et un trait ne suffit pas à dire « ça monte ».

Ce qui le dit, c'est la **structure**, pas la valeur :

- **le sol est lisse** — de grandes dalles à joints fins, peu de contraste. Il
  doit se faire oublier : c'est dessus qu'on marche, pas lui qu'on regarde ;
- **le mur est un tas** — de gros blocs de travers, des éclats, et surtout des
  **joints noirs et épais** entre eux. Personne n'a bâti les Dessous : on y a
  entassé.

Plus une **arête** : un liseré clair sur le bord de la pierre, là où elle
domine le sol. L'ombre de contact dit qu'il y a quelque chose ; l'arête dit que
ce quelque chose est en relief. Elle ne vient d'aucune direction non plus —
c'est la même sur les quatre côtés, comme un angle vif vu de n'importe où.

## La coupure du faisceau suivait la grille

Deuxième défaut, et le plus juste : *« l'ombre du faisceau est calculée pour
chaque tuile de mur, ça n'a aucune cohérence. »*

La morsure était bornée à la sortie de la **première** case touchée. Ça ne
fuyait pas, mais la profondeur éclairée dépendait alors de l'endroit où le
rayon entrait dans la case : un rayon qui entrait près du bord loin mordait à
peine, son voisin mordait tout. La coupure du faisceau sur un mur suivait donc
la grille au lieu de suivre le faisceau, en dents de scie.

Deux corrections :

- **la morsure traverse les pierres contiguës** et s'arrête à la dernière. Elle
  ne ressort jamais dans le vide — c'est ça, et seulement ça, qui empêche de
  voir la salle d'à côté, et le test le tient ;
- **les cônes passent de 12 à 32 rayons.** Douze suffisaient quand le cône
  s'arrêtait *avant* la pierre : la coupure tombait toujours sur une face bien
  droite. Depuis qu'il la mord, deux rayons voisins peuvent s'arrêter à des
  profondeurs très différentes, et le polygone entre eux devient une facette
  grossière en travers du mur.

Les cônes de **second plan** — le relais d'une lumière rallumée, le regard d'un
Guet — en gardent 14 : ils sont dessinés en transparence et personne n'y compte
les facettes. On ne paie la finesse que là où elle se voit.

Et une bêtise trouvée en mesurant : l'arête ouvrait un chemin et le traçait
pour **chaque** case du sol, même celles qui ne touchent aucune pierre — deux
cents appels par image pour rien.

## Le coin noir dans les angles

Signalé en jouant : *« il y a un bug d'éclairage quand on est dans un coin de
mur, la diagonale n'est pas éclairée »*, avec l'hypothèse qu'un bloc manquait à
la construction. Reproduit sur un plan en croix fabriqué exprès, et agrandi
trois fois : le bloc était bien là, et bien dessiné. C'est la **lumière** qui y
creusait un coin noir en V.

La cause : on mordait d'une **profondeur fixe depuis le point d'entrée**. Un
rayon à 45° entre dans la case d'angle par sa pointe, donc sa morsure de 0,85
case s'arrête bien avant d'avoir traversé la diagonale (qui en fait 1,41),
pendant que ses deux voisins filent dans le couloir. Résultat : la case d'angle
éclairée sur ses deux bords et noire en travers, et de loin on croit à un trou.

La règle est maintenant : **une pierre touchée par la lumière est éclairée en
entier.** Le rayon va jusqu'à la face opposée de la case, et s'y arrête. C'est
la même règle quel que soit l'angle d'entrée, donc plus de V — et ça ne fuit
toujours pas, puisqu'il s'arrête *sur* la face, jamais au-delà. Au passage,
`morsure` disparaît : il n'y a plus rien à régler.

Une porte garde son cas à part : c'est un panneau au **milieu** de sa case, et
la lumière doit aller jusqu'à lui.

## Le delta mur/sol, deuxième passe

Toujours trop faible. Le sol monte (`#20202e`, dalles à 34-46), le mur descend
(`#030307`, blocs à 9-25). Avec les joints noirs déjà en place, un couloir ne
se confond plus avec une salle.

## Les torches et la pierre ont de la matière

Même traitement, même règle — de la matière, aucune lumière peinte :

- **la torche** : un manche de bois avec son fil et ses fentes, et un collier
  de fer sous la tête. C'était une barre pleine de six pixels de large ;
- **la tête éteinte** : du charbon, plusieurs éclats sombres, plus un carré
  gris ;
- **la pierre** : un caillou à facettes, une claire et une sombre, qui tourne
  en vol. C'était un rond blanc — et un rond blanc se lit comme une petite
  lumière, ce qui est exactement le contraire de ce qu'elle est.

Ce qui **brûle** reste peint par la scène, pas dans la planche : c'est elle qui
sait ce qu'il reste de flamme, et de la braise ne se dessine pas dans une image
figée.

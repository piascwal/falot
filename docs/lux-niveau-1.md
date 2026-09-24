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
**porte** se consume, parce qu'on la vide en la promenant (`regles/torche portée.ts`).
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

## « L'éclairage se fait tuile par tuile » — et ce n'était pas l'éclairage

Trois allers-retours sur les angles pour rien. Le défaut signalé — *« au lieu
d'avoir une lumière constante, on dirait que chaque tuile s'éclaire toute
seule »* — n'était pas dans le moteur de lumière : il était dans la
**texture**.

Reproduit en posant simplement le sol case par case, sans aucune lumière : la
grille se voyait à l'œil nu. Les six variantes n'avaient **pas la même
luminosité moyenne** — une grande dalle claire ou une nappe sombre décale la
moyenne de toute la case — et côte à côte elles dessinaient un damier. Sous une
lampe, ce damier se lit comme si chaque tuile s'allumait par paliers.

Deux corrections, dans la fabrication des tuiles :

- **on recale chaque variante sur la même moyenne** après l'avoir dessinée. Le
  détail reste (le grain, les joints, les fêlures), la marche disparaît ;
- **les dalles sont petites**. Une dalle qui occupe presque toute la case a son
  bord sur le bord de la case : la grille se redessine toute seule. Quatorze
  petites plutôt que cinq grandes, et la case disparaît dans l'appareillage.
  Même chose pour les blocs des murs.

### Et l'éclairage est revenu en arrière

Les deux tentatives sur les angles (la morsure « toute la case », puis la passe
séparée `percerPierres`) sont **annulées**. La seconde ajoutait un défaut réel :
deux perçages avec deux dégradés différents, donc un cercle qui se lisait,
coupé par chaque case, en petits arcs. Le moteur de lumière est revenu à ce
qu'il était avant qu'on touche aux angles, et il n'y a plus qu'une seule passe.

La leçon, pour la prochaine fois : **reproduire le défaut isolément avant de
corriger.** Trois essais ont porté sur des angles saillants dans un plan en
croix alors que le défaut était ailleurs, et la texture n'a été suspectée qu'en
la regardant seule, sans lumière.

## La version s'affiche en jeu

Elle n'était que sur l'écran-titre, donc jamais visible au moment où on se
demande si le cache a lâché : on joue, on constate un défaut déjà corrigé, et
on ne sait pas si on regarde la dernière version ou celle d'il y a une heure.
Elle est maintenant dans un coin de l'écran de jeu, en tout petit.

## Le mur était bien éclairé, mais on ne voyait rien dessus

Retour de test : *« tu n'éclaires plus du tout le mur, on ne voit plus sa
texture quand on se rapproche. »* Mesuré au pixel, à côté du joueur collé à une
paroi : la pierre est bien allumée sur presque une case, et à une luminosité
comparable au sol. **La lumière était là ; c'est la texture qui ne montrait
rien.**

Deux raisons, toutes les deux introduites en réglant le damier :

- la moyenne du mur avait été recalée à 17 sur 255, ce qui est presque noir ;
- ses blocs avaient été rapetissés ET leur écart de valeur réduit, donc il ne
  restait qu'un bruit sombre uniforme.

Corrigé : la moyenne passe à **26** (le sol est à 38, l'écart reste franc), les
blocs retrouvent leur taille et surtout **beaucoup plus de contraste** — c'est
gratuit, puisque la moyenne est recalée après coup : on peut pousser l'écart
sans éclaircir le mur d'un cran. Et six éclats au lieu de quatorze : les petits
faisaient des confettis, et c'étaient eux qu'on voyait au lieu des blocs.

## Les angles rentrants : deux défauts, l'un dans l'autre

Test demandé : le joueur planté dans le coin d'une salle carrée, le faisceau
braqué en diagonale dans l'angle. Les mesures se font au pixel sur le canevas,
case par case, sur une grille de sous-cases.

**Premier défaut — l'angle ne recevait aucun rayon.** La pierre d'un angle
rentrant est cachée par les deux murs qui l'encadrent : aucun rayon ne la
touche, parce qu'aucun rayon ne peut l'atteindre autrement qu'en diagonale, et
la diagonale est barrée des deux côtés. Mesuré dans une cellule de 3×3 : les
quatre coins lisaient **exactement 10 sur 255, c'est-à-dire le noir du fond**,
pendant que leurs voisins lisaient 13 à 44. Un carré noir franc dans le coin.

Corrigé par `coinsDeSalle()` : on ajoute la pierre des angles rentrants **au
même chemin, sous le même dégradé, en un seul remplissage**. C'est ce point qui
avait été raté deux fois — deux perçages avec deux dégradés séparés, et le halo
se lisait en arcs de cercle découpés case par case. Une seule passe, un seul
dégradé, et la pierre d'angle est mesurée à **27** contre 35 pour les murs qui
l'encadrent, tandis que la deuxième rangée reste à 10 : elle est éclairée, elle
ne fuit pas.

**Deuxième défaut — on éclairait le fond.** Retour de test sur la capture :
*« dans l'angle dans lequel est dirigé le faisceau, il y a une tuile toute
noire. »* Exact, et ce n'était plus la lumière. `dessinerSol` saute les pierres
« enfouies », celles qu'aucun sol ne borde — mais il ne regardait que les
**quatre côtés**. Or la pierre d'un angle rentrant n'a que de la pierre en face
d'elle sur ses quatre côtés : elle passait pour enfouie et n'était pas
dessinée. On éclairait donc le fond noir, ce qui donnait un aplat pâle sans
texture en travers de la case, bordé de droites — exactement ce qu'on voyait.
`borde()` regarde maintenant les **huit** voisins. La case d'angle lit 11 à 76
selon ses sous-cases (de la vraie pierre, avec son contraste) au lieu de 9 à 51
en dégradé plat.

**Un flou d'ambiance, essayé puis retiré.** La lumière s'arrête sur une
frontière de case, et la coupure se lit comme un trait droit en travers du mur.
Un `filter = 'blur(4px)'` au moment de poser le calque d'obscurité l'adoucit
bien — mais il coûte **50 à 80 images perdues sur 300**, contre 0 à 1 sans lui.
Hors de prix pour un bord. Il faudra l'obtenir autrement, ou pas du tout.

## La coupure droite sur les murs, et la pénombre

Le trou percé dans l'obscurité est un polygone à bord dur. Sur du sol ça ne se
voit pas : le dégradé y est déjà à zéro quand on arrive au bout de la portée.
Sur un **mur**, si — la lumière s'arrête à la morsure, bien avant la portée,
donc l'alpha tombe d'un coup d'une valeur encore forte à rien.

Mesuré sur le calque d'obscurité (pas sur l'image composée : ni texture ni
sprite, rien que l'éclairage), joueur sous une paroi droite, faisceau
perpendiculaire :

| | marche la plus forte entre deux pixels voisins |
|---|---|
| avant | **113,8** sur 255 — `255, 141, 43` en deux pixels |
| après | **37** — une rampe sur une quinzaine de pixels de calque |

La correction est un flou de 2 pixels de calque sur le perçage. Deux choses
l'ont rendue possible :

**Où l'appliquer.** Le même flou posé sur le calque entier une fois composé, à
pleine résolution, coûtait **50 à 80 images perdues sur 300**. Appliqué à
chaque perçage, il coûtait encore 13 à 34 — et, contre-intuitivement, le prix
ne suivait pas le rayon (1,5 px : 34 ; 2,5 px : 13, du bruit autour de la même
valeur). Ce qu'un filtre coûte, c'est **une surface temporaire par appel**.
Donc : un seul appel. Les perçages s'accumulent sur un calque à part
(`Ecran.trou`), et on ôte l'ensemble en un coup, flouté. Le résultat est
identique à l'ancien, parce qu'empiler des alphas en `source-over` donne
exactement le complément de les retrancher l'un après l'autre en
`destination-out`. Coût final : **1 à 10 images perdues sur 300, contre 2 à 8
sans le flou** — mesuré à la suite sur la même machine. Gratuit.

**Quel rayon.** Le rayon ne coûte plus rien, donc il se choisit au regard — et
à l'invariant. Un flou étale la lumière au-delà du mur, et la règle du moteur
est que *la lumière ne ressort jamais de l'autre côté* : c'est elle, et elle
seule, qui empêche de voir le plan à travers la pierre. Mesuré sur une cloison
d'**une seule case**, faisceau perpendiculaire, joueur au niveau 4 :

| rayon | face lointaine de la cloison | salle au-delà |
|---|---|---|
| 0 | 255 (noir total) | 255 |
| **2** | **246** | **255 — rien** |
| 3 | 227 | 247 |
| 5 | — | — |

À 2, l'invariant tient exactement. Au-delà, ça commence à passer. Et au-delà
de 3, le cône du faisceau perd sa netteté, qui est une information de jeu : on
doit lire d'un coup d'œil où regarde un Guet.

## Le convoi était intouchable, et personne ne l'avait vu

Retour de test : *« j'ai l'impression que les Guets ne peuvent plus récupérer
les lumières une fois que Falot les a récupérées. »* Vérifié, et c'était pire
que ça : **aucun Guet, d'aucun type, ne pouvait reprendre une âme du convoi.**

Mesuré avec Falot mis hors d'atteinte et une âme épinglée à deux cases d'un
Guet, en plein dans son cône :

```
t=0,0  charge=0,01  alerte=2,8  corps vus=1  éteinte=false
t=0,3  charge=0,00  alerte=2,5  corps vus=0  éteinte=true
…
t=5,7  charge=0,00  alerte=-0,0 corps vus=0  éteinte=false   ← elle se rallume
```

Et ça bouclait indéfiniment. `souffler()` éteignait **tout le convoi** dès
qu'un Guet se doutait de quelque chose — seuil `alerte > 0`, donc dès la
première image où il l'apercevait — et un corps éteint n'apparaissait à
personne : ni au Guet ordinaire (`!éteint && !abri`), ni à l'Œil
(`!éteint || abri`). Je croyais l'Œil capable de les voir ; c'est faux, je l'ai
mesuré.

Conséquence invisible : `paniquer()` n'avait qu'un seul appelant, la ligne où
le front rouge rattrape un membre du convoi, et **cette ligne ne s'exécutait
jamais**. Le commentaire juste au-dessus promettait « on perd la cargaison, pas
la partie » — ça n'arrivait pas. Deux règles du jeu se contredisaient, et c'est
la plus silencieuse qui gagnait.

**La règle tranchée par le test :** le souffle couvre Falot, pas ce qu'il
emmène. Le convoi souffle toujours — ça l'empêche d'être repéré de loin et ça
lui évite d'éclairer la salle — mais **ça ne le sauve plus d'un faisceau**. Une
âme qui entre dans le cône d'un Guet **déjà en alerte** est vue quand même, et
son front rouge la **vide et la reprend** : elle perd sa lumière, elle quitte
le convoi, elle s'enfuit. Elle reste récupérable — il faut retourner la
calmer — parce qu'un échec qui coûte du temps vaut mieux qu'une perte sèche.

Le « déjà en alerte » se lit sur `p.alerte`, qui vaut encore ce qu'il valait à
l'image précédente : c'est bien un Guet que quelque chose avait déjà mis en
éveil, pas celui que cette âme-ci vient d'alerter. D'où deux régimes, mesurés :

| distance de l'âme | Guet calme | Guet déjà en alerte |
|---|---|---|
| 1,2 case | 0,93 s | **0,00 s** |
| 2 cases | 1,60 s | **0,13 s** |
| 3 cases | 2,42 s | 0,93 s |

Un Guet calme doit d'abord remarquer puis charger : on a une à deux secondes
pour tirer le convoi hors du cône. Un Guet déjà en alerte a son front sorti, et
l'âme part tout de suite. C'est exactement l'arbitrage demandé.

## Les quatre scènes, en pixel art

Demande : reproduire le quadriptyque de référence — un enfant et sa veilleuse,
un couple et sa bougie, un piéton sous un lampadaire, un phare et son bateau —
**en enlevant l'éclairage et en l'ajoutant après que l'âme les ait rejointes.**

C'est la bonne occasion pour du vrai pixel art, parce que le jeu en fait déjà :
chaque scène est peinte une fois au chargement dans un canevas de **80 × 96
pixels** (`src/rendu/quatre.ts`), qu'on agrandit au plus proche voisin. Tout est
en coordonnées entières — un rectangle à 0,5 pixel redevient du flou, et le
flou est exactement ce qu'on ne veut pas. Le cadrage est un « cover » à échelle
uniforme : les pixels restent carrés quelle que soit la fenêtre, alors
qu'étirer pour remplir aurait donné des pixels rectangulaires, ce qui n'est
plus du pixel art mais une image déformée.

**La lumière ne s'ajoute pas, elle révèle.** Chaque scène existe en DEUX
exemplaires, éteinte et allumée. Ce n'est pas la même image plus ou moins
transparente : une chambre dans le noir n'est pas une chambre jaune atténuée,
c'est une chambre bleue. On pose la version éteinte, puis on DÉCOUPE la version
allumée dans la forme de sa lumière (`masque`) et on la pose par-dessus. À
mi-chemin, le coin du lit est encore bleu nuit pendant que la table de chevet
est déjà chaude — c'est la lumière qui avance, pas le contraste. Le découpage
se fait en `source-in` sur un canevas de la taille d'une scène : huit mille
pixels par case et par image, c'est-à-dire rien.

Trois choses ne sont PAS dans le bitmap, et c'est voulu :

- **le volume de lumière** — le grand coin jaune du phare, la colonne du
  lampadaire. Le masque ne révèle que ce qui est peint, et au large il n'y a
  rien à peindre : sans ce coin, le phare n'envoyait rien à personne ;
- **la pluie**, parce qu'elle tombe, et parce qu'il pleut AUSSI là où le
  lampadaire n'éclaire pas — c'est même tout l'intérêt ;
- **la floraison** autour de chaque ampoule. Ces trois-là sont lisses et c'est
  voulu : c'est de la lumière, pas de la matière, et seule la matière est en
  pixels.

Erreurs faites et corrigées en regardant les captures, dans l'ordre :

- les scènes étaient **en paysage** (96 × 80) alors qu'une case est en portrait
  (380 × 450) : le « cover » rognait tout sur les côtés et coupait les gens en
  deux. Grille refaite en 80 × 96 ;
- la tête de lit courait d'un montant à l'autre avec des barreaux sur toute la
  longueur : ça ne fait pas un lit, ça fait une **barrière**, et l'enfant avait
  l'air enfermé dedans ;
- les chaises étaient rangées au bord du cadre : deux cages de but, et on ne
  voyait plus sur quoi les deux étaient assis. Elles sont passées **derrière
  les gens** ;
- le rocher du phare montait et descendait à chaque colonne : une rangée de
  **sapins**. C'est une masse arrondie cassée par deux ou trois ressauts ;
- les assises de brique de la tour étaient un damier franc, donc un **escalier
  en zigzag** au lieu d'un mur ;
- le parapluie était dix pixels trop haut : il arrivait à hauteur de la
  lanterne et se perdait dans son halo. On voyait un homme **tête nue sous la
  pluie**, ce qui est exactement le contraire du plan.

Coût mesuré : **0 image perdue sur 300** pendant toute la montée de lumière et
les quatre scènes.

## Le mur ne parlait pas la même langue que le sol

Retour de test : *« les motifs des murs sont trop ressemblants au motif du sol.
J'adore ceux du sol alors ne les touche surtout pas. »*

La cause n'était pas une valeur, c'était un **vocabulaire** : le sol et le mur
appelaient tous les deux `caillou()`, c'est-à-dire des galets épars posés au
hasard. Deux tailles, deux contrastes, le même motif. C'est pour ça qu'un trait
de séparation ne suffisait pas — on ne sépare pas deux choses qui disent la
même chose.

Le sol n'a pas bougé d'un pixel. Ce qui change, c'est la **grammaire** du mur :
un sol est *posé*, un mur est *bâti*. Trois propositions ont été dessinées et
comparées sur planche puis en jeu sous la lampe :

- **A — l'appareil.** De vraies assises : des blocs rectangulaires en rangées
  décalées d'un demi-bloc, du mortier noir entre eux. Les mesures tombent juste
  sur la tuile (quatre assises de T/4, des blocs de T/2), donc les rangées se
  prolongent d'une case à l'autre au lieu de se casser, et l'appareil traverse
  toute une paroi. **Retenu.**
- **B — le cyclopéen.** De grosses pierres polygonales ajustées, chacune d'un
  ton, séparées par un joint épais — un Voronoï à distance bouclée, ce qui le
  rend raccordable sans une ligne de plus. Plus de caractère, un peu moins
  immédiat à lire.
- **C — la paroi taillée.** De la roche creusée, ses strates et ses coups de
  pic. Jolie sur planche, elle **redevenait du bruit** dès qu'on la voyait sous
  la lampe. Écartée sur la capture en jeu, pas sur l'échantillon.

## Les garnitures : ce qui a poussé là-dessus

Une pierre régulière tient debout, mais ne raconte rien. Quatre garnitures se
posent par-dessus les tuiles, sur fond transparent, **selon ce que la case
est** — une plante pousse là où elle peut :

| | où | taux |
|---|---|---|
| lierre | mur vu de face (du sol en dessous) | 13 % |
| suintement | idem | 11 % |
| racines | toute pierre exposée | 6 % |
| mousse | sol contre une pierre, du côté de la pierre | 22 % |

La case est sa propre graine — le lierre ne bouge pas quand on repasse devant —
avec des nombres premiers **différents** de ceux de `variante`, sinon la même
case tirerait ensemble sa pierre et sa garniture et le motif se verrait. Elles
sont posées avant l'ombre de contact : la mousse est dans l'angle, donc l'angle
doit s'assombrir par-dessus elle, sinon elle flotte devant la pierre.

Premier essai invisible, et la raison mérite d'être notée : les feuilles
étaient peintes à la **même valeur que la pierre** (34 sur un mur à 26). Une
teinte seule ne se voit pas à trente sur deux cent cinquante-cinq ; ce qui fait
lire une plante sur un mur, c'est l'**écart de valeur**. Elles sont donc deux à
trois fois plus claires que la pierre — ce n'est pas de la lumière, c'est de
l'albédo : une feuille renvoie plus qu'un caillou. Avec un liseré sombre sous
chaque feuille, sinon elle se fond dans le joint clair d'une assise.

Coût : 4 ms de fabrication au chargement, et **rien de mesurable par image** —
sans garnitures 3/13/16 images perdues sur 300, avec 8/9/14, c'est-à-dire le
même bruit.

## Un essai : l'enfant posé pixel par pixel

Question posée : *« au lieu de faire la scène de façon programmatique, tu peux
pas faire des assets ? »* Réponse honnête d'abord — **il n'y a pas de
générateur d'images ici.** Un asset, dans ces mains-là, c'est un pixel map
écrit caractère par caractère. Ce qui change n'est donc pas la qualité du
dessinateur, c'est le CONTRÔLE : une tête tracée par formules donne une tête
moyenne, et une tête moyenne n'est personne.

Et le ratage précédent ne venait pas du « programmatique » : il venait d'avoir
refait **les quatre panneaux d'un coup** et cassé trois compositions qui
marchaient. L'essai est donc borné à **une seule scène**, la chambre.

Deux changements, et rien d'autre :

- **une grille par scène.** Elles ne grandissent plus toutes ensemble : la
  chambre passe à 160 × 192 parce qu'elle porte un enfant, les trois autres
  restent à 80 × 96 parce qu'un phare et sa mer s'y disent très bien. C'est ce
  qui permet de les reprendre une par une, en regardant ;
- **l'enfant et son bras sont écrits**, pas calculés — trente-neuf lignes de
  lettres, une par nuance. Idem pour l'étoile de l'abat-jour : un tas de
  rectangles empilés faisait une tache, et une tache sur un abat-jour ne dit
  rien.

Mesuré sur la capture avant/après, à six fois la taille : le visage passe de
neuf pixels de côté avec une fente pour œil à deux yeux, une mèche éclairée,
une joue ombrée et une bouche. Le reste du panneau est inchangé — mêmes
meubles, même composition, deux fois plus de pixels.

Coût : **0 image perdue sur 300** pendant toute la cinématique.

Ce qui reste faible et qui n'a pas été touché : le lit est encore une masse
pâle, et le haut du mur est vide. On y reviendra si l'essai est validé — une
scène à la fois.

## Quatre retours d'iPad, et le prologue qu'on traversait sans rien comprendre

**Le jeu défilait, et le bas de la carte était coupé.** Une seule cause : on
lisait `window.innerHeight`, qui est la hauteur de la MISE EN PAGE. Sur iPad
elle compte la bande qui passe sous la barre du navigateur — la mémoire du
canevas était donc plus haute que le morceau qu'on voit. Trois corrections :

- la taille se mesure désormais **sur le canevas lui-même**
  (`clientWidth`/`clientHeight`) : c'est lui que le CSS étire sur la hauteur
  visible, donc c'est lui qui a raison ;
- `html, body` passent en `100dvh` (sous `@supports`, le `100%` reste en
  secours) : `dvh` suit ce qui est réellement affiché ;
- `html, body` passent en `position: fixed; inset: 0`. `overflow: hidden` seul
  ne suffit pas sur iPad — la page reste dans le flux de défilement de Safari
  et on peut la faire glisser. Sortie du flux, il n'y a plus rien à défiler.

Et les retraits d'encoche **s'ajoutent** à la marge au lieu de la remplacer :
avec `max(1.4rem, env(...))`, une encoche de 20 px laissait le bouton à 22 px
du tout bord, donc à moitié sous l'indicateur d'accueil.

Un test le verrouille : à fenêtre de 1180 et canevas affiché de 1024, la
mémoire doit valoir 1024 × la densité, pas 1180. *(Le vrai Safari d'iOS n'est
pas reproductible ici : sur un iPad émulé les deux hauteurs sont égales. C'est
l'invariant qui est testé, pas le navigateur.)*

**La gelée ne marchait que vers la gauche.** `majJelly` écrivait la
déformation avec la vitesse SIGNÉE :

```
cibleX = 1 + vy·k − vx·k
cibleY = 1 + vx·k − vy·k
```

Aller à gauche l'élargissait — étiré dans le sens de la marche, ce qui est
juste. Aller à droite faisait exactement l'inverse : il s'étirait **en
hauteur**, perpendiculairement à sa course. Idem entre le haut et le bas. On a
donc pris l'INTENSITÉ au lieu du signe, par axe. *(Cette première correction
s'est révélée incomplète en jeu : voir « Il ne s'allonge plus » plus bas.)*

**On sortait du prologue sans le faisceau.** Le compte disait pourtant
l'inverse : 36 d'éclat dans la salle du réveil pour un seuil à 26. Mais le
compte mesure ce que la salle CONTIENT, pas ce qu'elle DONNE — et la route
directe vers la porte n'en croisait que trois, soit douze. On sortait donc
Peureux, on tombait sur un Guet sans rien à essayer, et on s'ennuyait avant
d'avoir découvert le faisceau.

Sept lueurs sont maintenant posées **sur la ligne 5**, qui est la route
directe : sept fois quatre, vingt-huit, et le faisceau en demande vingt-six.
Trois autres traînent ailleurs. Pas davantage : le budget d'éclat de tout
l'étage doit rester sous le palier suivant, sinon on apprendrait deux verbes
dans la même salle. Le test ne compte plus les lueurs — il fait **traverser la
salle par un pilote automatique** et vérifie qu'il arrive à la porte avec le
faisceau.

**La flèche quittait le jeu.** Elle renvoyait au hub du site : on sortait de la
page pour revenir choisir un étage. Elle ramène maintenant à l'écran-titre, qui
est le hub du jeu, et repose la grille au passage — on vient peut-être de finir
un étage.

## Il ne s'allonge plus : il se tasse dans les quatre directions

Suite du retour précédent, et cette fois c'est un choix de goût plutôt qu'une
règle de physique. La gelée corrigée prenait l'intensité de la vitesse **par
axe**, ce qui l'étirait dans le sens de sa course : la règle classique du
*squash and stretch*. En jeu, ça donne un Falot qui **s'allonge** en montant et
en descendant, et c'est raté — on le reconnaît à sa silhouette écrasée, et la
perdre une direction sur deux le rend méconnaissable. C'est une lampe qui
court, pas une goutte d'eau.

La déformation ne dépend donc plus que de la VITESSE, jamais de la direction :

```ts
const v = Math.hypot(p.vx, p.vy);
cibleX = clamp(1 + v * 0.00055, 0.84, 1.19); // il s'élargit
cibleY = clamp(1 - v * 0.00055, 0.84, 1.19); // et il se tasse
```

Mesuré en jeu, manche à fond dans les quatre directions, à 222 de vitesse :
`sx 1,12 / sy 0,88` — les quatre fois, au centième près. Deux tests le
verrouillent : « tasse toujours, et jamais n'allonge », et « donne la même
forme dans les quatre directions ».

## La pierre du jeu dans l'interface, et un réveil dans le noir complet

**Le HUD prend les tuiles.** Le bandeau et les boutons étaient des aplats
translucides : une interface d'application posée sur un souterrain. Ils
prennent maintenant la matière du jeu, et le partage suit une règle — **le mur
pour ce qui encadre, le sol pour ce qui reçoit** :

| | tuile |
|---|---|
| le bandeau du haut, la flèche, les boutons ronds | l'appareil du **mur** |
| la barre d'éclat, celle du bonus | le dallage du **sol** |

On ne fabrique rien de plus : `hud.ts` découpe une tuile dans chaque planche et
la donne au CSS en variable (`--pierre-mur`, `--pierre-sol`). Les boutons la
posent en `background-blend-mode: overlay`, ce qui garde le grain sans manger
la teinte que chacun porte — le jaune du pierre, le bleu du souffle. Le bandeau
reçoit un voile à 0,62 et un dégradé de disparition vers le bas : la pierre
doit se deviner sous le texte, pas se lire, et le bandeau ne doit pas poser un
bord franc en travers du jeu.

Coût : deux images de 25 et 27 Ko fabriquées une fois au chargement (rien n'est
téléchargé, rien n'est livré), et **2 à 3 images perdues sur 300** — le bruit
habituel.

**Toutes les torches du prologue sont éteintes à l'arrivée.** La rangée du haut
était allumée, et elle donnait la salle d'un coup : on voyait où aller avant
d'avoir rien fait, et rallumer ne servait plus à rien. Falot se réveille
maintenant dans le noir complet, avec son halo d'une case et demie — c'est LUI
la première lumière, et c'est la seule leçon que cette salle a à donner. Onze
torches, zéro allumée, verrouillé par un test.

À surveiller : une lueur pas encore vue n'a aucune lueur propre au-dessus du
voile — elle n'apparaît que dans le halo. La salle est donc réellement noire
tant qu'on n'a pas rallumé une torche. C'est l'intention, mais si la traversée
se révèle pénible à jouer, le réglage à toucher est l'espacement des lueurs de
la ligne 5 (deux cases, pour un halo d'une case et demie), pas le nombre.

## La cage prend la pierre du jeu, et une âme se remplit vraiment

**La montée entre deux étages était un couloir vide.** Ses parois étaient un
aplat `#12121a` avec un trait, et ses paliers deux traits — le commentaire
disait pourtant « de la pierre, comme partout ailleurs », et c'était faux.
Elles prennent maintenant les VRAIES TUILES : l'appareil du mur sur les côtés,
le dallage du sol sur les dalles qu'on franchit, qui ont enfin une épaisseur.

Deux choses la rendent juste :

- **le motif défile avec la caméra** (`pattern.setTransform`). Collé à l'écran,
  il aurait donné une texture fixe devant laquelle Falot glisse ; calé sur la
  caméra, c'est la paroi qui descend, et c'est ça qui fait qu'on MONTE ;
- **un creux** : un dégradé sombre du bord de l'écran vers le vide. Sans lui la
  paroi est un mur plat collé au bord, et on ne sent pas qu'on est dans un trou.

Et on la remonte à la découpe (×1,28 pour le mur, ×1,5 pour le sol) : la cage
n'a pas de moteur de lumière — elle est dessinée telle quelle, sans voile à
percer — alors qu'une tuile est faite pour être révélée par une lampe, moyenne
26 sur 255. Posée brute, elle ne se voyait pas.

*(Deux essais avant celui-là : le HUD, puis le menu des étages. Ce n'était ni
l'un ni l'autre — c'était cette scène.)*

**Une âme était pleine avant d'être remplie.** Retour de test, et le défaut
était exactement décrit : on voit une âme vide, on met le faisceau dessus, elle
devient pleine d'un coup — et elle se remplit quand même. Trois états pour deux.

La cause tient dans un « ou » : le corps était peint plein dès que
`p.eclaire` était vrai, au même titre que `p.calme`, et le niveau montait
PAR-DESSUS un corps déjà rempli.

Ce qui remplit un corps, c'est d'avoir été rallumé, rien d'autre — donc
`plein = p.calme || repere`. Éclairée sans l'être encore, l'âme reste sombre
avec le contour de sa couleur : on la voit, et on voit qu'il n'y a rien dedans.
Le `repere` reste pour les Guets, qui se remplissent de leur colère quand ils
ont repéré quelque chose ; ça n'a rien à voir avec un rallumage et ça ne bouge
pas. Mesuré sur cinq captures à 0, 30, 60, 90 et 100 % : le vert monte du bas,
et il n'y a plus de saut.

## « Choisir un étage » ne répondait plus, et le verrou de progression saute

**Le bouton s'annulait lui-même après quelques allers-retours.** La flèche du
HUD ramène au menu via `retourAuTitre`, qui rappelait `poserLaGrille` — et
cette fonction **rebranchait un écouteur de clic de plus** sur le bouton
« Choisir un étage » à chaque appel, sans jamais vider `#etages` avant d'y
reconstruire les douze cases. Au bout de quatre retours au menu, cinq
écouteurs coexistaient sur le même bouton et se neutralisaient deux par deux :
un clic sur un nombre pair d'écouteurs ne change rien à l'état visible,
exactement le symptôme rapporté (« ne semble plus fonctionner »). La grille
elle-même grossissait en secret — 60 boutons au lieu de 12 après quatre
retours, mesuré.

Le branchement du bouton de bascule est maintenant fait **une seule fois**,
dans `poserLEcranTitre`, protégé par le même drapeau `branche` qui empêchait
déjà `titre-descendre` et les autres d'être rebranchés deux fois.
`poserLaGrille`, elle, ne fait plus que reconstruire le contenu de `#etages`
(`grille.innerHTML = ''` avant de repeupler) — c'est la seule chose qui doit se
refaire à chaque retour, puisque la progression a pu changer entre-temps.

**Le verrou de progression est retiré.** On pouvait déjà tout ouvrir avec
`?debug` dans l'adresse ; la demande était de le pouvoir sans ce paramètre,
tout le temps. `b.disabled = …` a donc disparu de `poserLaGrille`, avec le
paramètre `tout` qui ne servait plus qu'à ça — retiré de `poserLaGrille`,
`poserLEcranTitre`, `retourAuTitre`, et de leurs deux appels dans `main.ts`
(qui passaient `reglages.has('debug')`). La règle « fait » / « parfait » sur
les cases reste : c'est un tableau de progression, pas un pense-bête vide.

Vérifié en reproduisant le scénario signalé (quatre allers-retours au menu par
la flèche du HUD, avec Playwright) : 12 boutons avant et après, le bouton
bascule normalement, et l'étage 10 se choisit sans jamais l'avoir atteint.

## Falot était doré dans la cage, avec le mauvais visage

Retour de test : *« quand Falot monte de niveau dans l'animation où il est
suivi par les âmes, il est jaune et a une émotion pas bonne. »* Exact —
`dessinerPuits` le peignait en `#ffe9a8`, l'or des lumières qu'il escorte,
avec l'humeur `intrigue`. Deux erreurs de copier-coller probables au moment
d'écrire la cage : sa propre couleur et son propre visage avaient été
remplacés par ceux de ce qu'il porte.

Il reprend son bleu (`#8fd0ff`, la même valeur que dans `fin.ts` — non
exportée de `formes.ts`, donc redéfinie localement comme `fin.ts` le fait déjà)
et son humeur de repos, `inquiet` : la peur au calme, pas la curiosité. C'est
la même règle partout dans le jeu — il ne change jamais de couleur, seule sa
lumière grandit.

Vérifié au pixel dans la cage : `148,210,255`, à trois points près de
`#8fd0ff`.

## Une PWA : installable, et jouable sans réseau

Demande : pouvoir installer le jeu comme une application. Trois pièces, et
aucune ne dépend d'un service extérieur — tout tient dans le dépôt.

**Les icônes sont Falot, pas un logo inventé.** `outils/pwa-icones.mjs`
redessine — en JavaScript brut dans une page Playwright, comme
`atlas-temoin.mjs` le fait déjà pour la planche de sprites — les mêmes
formules que `dessinerTete()` : le même corps aux coins ronds, le même
dégradé, et son visage *inquiet*, celui qu'on voit le plus dans le jeu (« je
n'ai rien demandé à être ici »). Une seule planche maîtresse à 1024 px sert
toutes les tailles ; Falot y tient sur 46 % du cadre, donc son coin le plus
loin n'est qu'à 32 % du centre — largement dans le disque de sécurité des
icônes « maskable » (80 % du cadre, rayon 40 %). Une seule image sert donc
pour les usages `any` et `maskable` à la fois, pas quatre fichiers.

**Le manifeste** (`public/manifest.webmanifest`) déclare le nom, les deux
tailles d'icône, `display: standalone`, et les couleurs du jeu
(`#08080e` partout — pas de flash blanc à l'ouverture). `start_url` et `scope`
sont **relatifs** (`"./"`) : ils se résolvent par rapport à l'URL du manifeste
lui-même, donc ça marche aussi bien à la racine d'un domaine que dans le
sous-dossier de GitHub Pages, comme le reste du projet (`base: './'` dans
`vite.config.ts`).

**Le service worker** (`public/sw.js`) suit une règle unique : **réseau
d'abord**. Vite change le nom des fichiers construits à chaque version (une
empreinte dans `index-XXXXXXXX.js`) — un précache écrit à la main serait faux
dès la prochaine construction. Chaque requête part donc au réseau, se range
dans un tiroir au passage, et le tiroir ne répond que si le réseau a manqué.
Le jeu reste donc aussi à jour qu'une page ordinaire ; il gagne seulement de
continuer à fonctionner sans réseau. Enregistré uniquement en production
(`import.meta.env.PROD`) : en développement, Vite sert des centaines de
petits modules non groupés et les recharge à chaud — un tiroir hors ligne
par-dessus aurait fait chercher des bugs qui n'existaient plus.

Vérifié avec Playwright sur le vrai build (`vite preview`), faute d'un
Lighthouse capable ici d'auditer une PWA (les audits dédiés ont disparu de sa
version 13) :

- le manifeste se charge et pointe vers les bonnes icônes ;
- le service worker s'enregistre, s'active, et prend la main ;
- après un premier chargement, le tiroir contient bien les quatre pièces du
  jeu (page, script, style, police) ;
- **réseau coupé, rechargement complet** : l'écran-titre s'affiche, on clique
  sur Descendre, l'ouverture se joue — le jeu tourne entièrement hors ligne.

## Deux portes au lieu d'une : Histoire, et le Puits sans fin

Demande : remplacer le bouton unique « Descendre » par deux entrées
séparées, chacune ouvrant sa propre sélection d'étages plutôt que de
plonger directement dans le jeu. « Histoire » doit se souvenir d'où on
s'est arrêté, verrouiller ce qui n'est pas encore atteint, et montrer sous
chaque étage joué une note en étoiles ; le Puits sans fin suit le même
principe mais sans verrou — il n'y a pas d'ordre à verrouiller sur
l'infini. Une progression sauvegardée qui grossit indéfiniment inquiète :
il faut un bouton pour tout effacer.

**Un seul écran-titre, trois vues.** `#titre` contenait jusqu'ici un seul
bloc plat ; il en contient maintenant trois (`#vue-accueil`,
`#vue-histoire`, `#vue-infini`), chacune un `<div class="vue">` que
`montrerVue()` bascule en posant `hidden`. Le fondu d'ouverture/fermeture du
menu entier reste réservé à `.titre` elle-même — changer de vue à
l'intérieur ne rejoue pas cette transition, ce n'est pas un nouvel écran,
c'est le même écran qui change de contenu.

**La note : une moyenne à trois termes égaux.** `interface/score.ts` calcule,
pour chaque `Trace` enregistrée (part éclairée, lumières remontées, morts),
une note de 0 à 1 — la moyenne de trois valeurs ramenées entre 0 et 1, dont
la part « jamais pris » vaut `1 / (1 + morts)`, exactement la formule que la
barre « Pris » du bilan affichait déjà. Pas de formule inventée pour
l'occasion : la même question mérite la même réponse partout. Trois paliers
calés à vue (0,8 et 0,5) donnent 1, 2 ou 3 étoiles ; un étage qui a une
`Trace` du tout a été fini, donc jamais zéro étoile. Un passage parfait
(`sansFaute` — déjà le critère du texte « Rien n'est resté dans le noir » du
bilan) affiche une étoile spéciale unique, verte et pulsante plutôt qu'un
nouvel or : `.etages button.parfait` bordait déjà ses cartes de ce vert-là,
c'est la couleur que le jeu utilise déjà pour dire « parfait » à cet endroit
précis.

**Le verrou vit dans la grille, pas dans la donnée.** `dernierDebloque()`
regarde `progression.atteint` et n'autorise que les étages déjà atteints (+1
pour le suivant à découvrir) ; la grille de l'Histoire l'utilise, celle du
Puits sans fin passe `() => false` — rien n'y est jamais verrouillé, et elle
n'affiche de toute façon que les étages qui ont déjà une `Trace` (impossible
d'y afficher « tous les étages possibles », il n'y a pas de fin). Cette
décision revient sur une demande plus tôt dans le projet qui retirait tout
verrou : la dernière consigne l'emporte, et elle ne s'applique qu'à
l'Histoire — un puits sans fin n'a pas d'ordre à respecter.

**Cliquer un étage fait deux choses différentes selon son état.** Un étage
sans `Trace` (le prochain non joué) lance directement la partie. Un étage
déjà fini ouvre son panneau de statistiques à la place — mêmes trois barres
que le bilan en jeu, réécrites en HTML/CSS (`.panneau-stats`), avec un
bouton « Rejouer » pour relancer volontairement. Rejouer un étage déjà fait
ne fait donc jamais perdre le fil par erreur.

**Les barres, plus épaisses partout.** La demande visait d'abord les barres
du bilan en jeu (`rendu/bilan.ts`) : `EPAISSEUR` passe de 3 px à 7 px. Les
barres du nouveau panneau de statistiques en HTML reprennent la même
épaisseur en CSS (`.barre-epaisse`), pour que les deux présentations du même
chiffre se ressemblent.

**Le bilan s'anime : le calcul se voit, il ne s'affiche plus tout fait.**
`ligne()` distinguait déjà `vu` (le texte qui apparaît) — sa barre et son
chiffre grandissaient pourtant dans le même souffle d'une demi-seconde, trop
vite pour qu'on voie autre chose qu'un résultat déjà écrit. Un second
paramètre, `avance`, les détache : une fois le texte apparu, chaque barre
part 0,18 s après la précédente et met 1,1 s à courir jusqu'à sa valeur, en
ease-out (le même cube que le dézoom de la caméra utilise déjà). Le chiffre
au-dessus compte en même temps (`monte()`), sauf « jamais » qui reste
immédiat — il n'y a rien à compter. Le décalage en cascade entre les trois
lignes fait qu'on voit le bilan se calculer ligne par ligne, plutôt qu'un
tableau s'afficher d'un bloc.

**Tout vidable en un geste volontairement lent.** Le lien discret « Effacer
la progression sauvegardée », en bas de l'accueil, ne vide rien au premier
clic : il se transforme en « Confirmer — tout effacer ? », rouge, et se
réarme tout seul après quatre secondes sans confirmation. `localStorage`
est vidé (`oublierLaProgression`, déjà présente mais jusqu'ici jamais
appelée) seulement sur ce second clic — le même principe de sécurité à deux
temps qu'on retrouve ailleurs dans les interfaces qui suppriment quelque
chose sans retour possible.

Vérifié avec Playwright, `localStorage` pré-rempli d'une progression
synthétique (cinq étages joués dont un parfait et un avec une mort, l'étage
6 comme dernier atteint, deux étages du Puits sans fin) : l'accueil affiche
bien les deux boutons et le lien d'effacement ; l'Histoire montre le
« Continuer / Étage 6 », les étoiles attendues sur chaque étage joué
(l'étoile spéciale verte pulsante sur le seul étage parfait), et les
étages 7 à 12 visiblement verrouillés ; cliquer un étage joué ouvre son
panneau avec les bonnes valeurs, les barres épaisses et « Rejouer » ; le
Puits sans fin ne liste que les deux étages joués, sans verrou, avec son
propre panneau de statistiques ; le bouton d'effacement s'arme, se confirme,
et l'Histoire rouverte ensuite reflète bien la remise à zéro. `npm run
verifie` reste à 167 tests, tous verts, et `npm run build` construit sans
erreur.

## Les quatre scènes de la fin sont dessinées, plus peintes en rectangles

Une planche de référence est arrivée : les quatre sujets de la fin — un
garçon au lit, un couple à table, un piéton sous un réverbère, un phare —
dessinés, plus les sources de lumière, les tuiles et les effets, chacun
isolé sur un fond brun uniforme. La question était de savoir si on pouvait
en tirer des assets utilisables.

**Trois mesures avant de décider.** La planche a **41 863 couleurs
distinctes** et aucune grille de pixels (des blocs de 2 × 2 ne sont
uniformes qu'à 51 %, le profil d'une image lisse) : c'est une illustration
en *style* pixel art, pas du pixel art. Posée telle quelle à côté du
tileset des souterrains, ça se verrait. Son fond, en revanche, est très
uniforme — écart-type de 1,8 sur un brun (52, 47, 43) — donc parfaitement
détourable. Et réduits à la grille du jeu puis **quantifiés à 48
couleurs**, les sujets redeviennent du vrai pixel art. C'est cette
troisième mesure qui a débloqué l'affaire.

**Un outil, trois opérations** (`outils/fin-scenes.mjs`, une page Chromium
comme `pwa-icones.mjs`, donc sans importer le TypeScript du jeu) :

1. **Découper.** L'alpha se déduit de l'écart au brun du fond, puis on
   **démate** — on retire du bord la part de brun qui s'y est mélangée.
   Sans ça, chaque sujet garde un liseré marron sur le noir du jeu. Deux
   familles : un meuble a un bord et se détoure ; une flamme n'en a pas,
   elle s'ajoute. Pour les huit sources on garde donc l'excès de lumière
   au-dessus du fond et on les dessine en `lighter` — le brun s'annule
   alors exactement, sur n'importe quel fond. C'était déjà la grammaire du
   jeu : halo, cône et floraison passent tous par `lighter`.
2. **Mettre en scène.** Les sujets sont isolés, les scènes non : chacune se
   compose dans la grille du jeu (160 × 192, celle que la chambre avait
   déjà), fond et sol d'abord, sujets ensuite. La version allumée ajoute sa
   source ; l'éteinte passe la même base par `eteindre()`, la formule du
   jeu — une chambre dans le noir n'est pas une chambre jaune atténuée,
   c'est une chambre bleue.
3. **Quantifier.** Médiane itérative sur les huit scènes **à la fois**,
   donc une seule palette pour les quatre : sinon chacune dérive vers la
   sienne et le quadriptyque ne tient plus ensemble.

**Deux plans ont été remis en scène**, parce que la planche ne les cadrait
pas comme le jeu les racontait. La chambre : le code avait l'enfant *assis,
bras tendu vers une table de chevet* ; la planche a le garçon couché et
aucune table de chevet, donc la veilleuse est posée **à même le plancher**,
devant le pied du lit. Le large : le code avait *une barque au large avec un
marin dedans* ; la planche a une barque vide et un pêcheur debout, donc le
pêcheur est **sur les rochers que le phare balaye**, et la barque est tirée
au sec. Le sens de chaque plan tient — quelqu'un est éclairé sans l'avoir
demandé, et ne saura jamais par qui.

**Trois bugs, dans l'ordre où ils sont tombés.**

Le premier : l'outil ne resserrait pas la boîte de découpe sur son contenu.
Un mât de réverbère de soixante pixels flottait au milieu d'une zone vide de
cent cinquante, et quand on le posait « à quarante-cinq pixels de large »,
c'est la *boîte* qui faisait quarante-cinq — le mât, lui, en faisait dix-sept
et disparaissait. Les quinze zones sont maintenant **mesurées** au pixel, et
resserrées en plus, par sécurité.

Le deuxième : les foyers étaient estimés à l'œil, et faux. Le verre de la
lanterne du réverbère est à **mi-hauteur** de sa tête (y 26..58 sur 196), pas
à son sommet : posé trop haut, le foyer faisait briller le ciel *au-dessus*
de la lampe.

Le troisième, le plus instructif : `dessinerScene` cadre en « cover » — la
scène est agrandie jusqu'à remplir sa case, donc ce qui dépasse est coupé, et
la case fait la moitié de l'écran, dont la forme change du téléphone au
bureau. Mesuré sur les deux extrêmes : un téléphone droit ne laisse voir que
**x 32..128**, un écran 16/9 que **y 51..141**. La première mise en scène
posait la veilleuse à x 128 : sur téléphone elle était hors champ, et la
chambre s'allumait donc sans qu'on voie par quoi. La seconde a mis les deux
lanternes à y 46, et sur écran large elles étaient coupées par le haut. Tout
ce qui porte le sens d'un plan tient désormais dans x 34..126 **et**
y 55..138 ; les fonds, eux, vont jusqu'au bord — c'est même pour ça qu'on
cadre en « cover » plutôt qu'en « contain », qui laisserait la mer s'arrêter
net au milieu du noir.

**Le foyer reste écrit deux fois** — dans l'outil, où la lampe est posée, et
dans `rendu/quatre.ts`, où le masque s'ouvre et où le fil de la lumière se
rend. C'est exactement la dérive que le jeu s'était déjà prise (« écrit deux
fois, ça dérivait dès qu'on déplaçait un lit »). On ne peut pas la supprimer
sans générer du TypeScript ; l'outil **relit donc `quatre.ts` à chaque
fabrication** et refuse de finir en silence si les deux ne sont plus
d'accord.

`rendu/quatre.ts` passe de **759 à 249 lignes** : le nuancier, les quatre
peintres, l'enfant posé pixel par pixel et ses aides de tracé disparaissent.
Il ne garde que ce qui **bouge**, et qu'on ne peut donc pas peindre dans une
image : le masque qui grandit, la pluie qui tombe, et les nombres dont le
faisceau du phare a besoin pour balayer. Le bundle JavaScript passe de
**133,9 à 126,0 ko** (44,7 ko gzippé), et la feuille des huit scènes pèse
**63 ko**.

Elle est chargée **au démarrage** alors qu'elle ne sert qu'à l'étage douze :
douze étages séparent les deux, donc elle est là depuis longtemps quand la
fin s'ouvre, et le service worker (réseau d'abord, sans liste écrite à la
main) la range pour les fois suivantes. Le temps qu'elle arrive, la fin
dessine ses fils et ses halos sur des cases noires — ce qui ne peut se voir
qu'en ouvrant la fin par le raccourci d'essai, sans avoir joué.

Vérifié dans le jeu, au Playwright, sur les deux formes d'écran (430 × 860
et 1280 × 720) : à l'étape du fil, on devine les quatre scènes éteintes
pendant que les lumières remontent ; à l'étape des quatre, chacune est
révélée dans la forme de sa source — la bulle de la veilleuse, celle de la
bougie, la colonne du réverbère avec sa pluie par-dessus, et le faisceau du
phare qui balaye et vient prendre le pêcheur au passage. Les quatre lampes
tiennent dans le cadre sur les deux écrans. `npm run verifie` : 167 tests,
tous verts ; `npm run build` construit sans erreur, image comprise.

Cinq assets de la planche restent inutilisés pour l'instant : les trois
cônes, le grand faisceau et le dégradé d'ambiance. Le jeu trace déjà ses
cônes lui-même (`VOLUME` et `cone()` dans `fin.ts`), et il en a besoin :
celui du phare **balaye**, ce qu'une image ne peut pas faire.

## Des lampes mortes dans les Dessous

La pierre avait du lierre, de la mousse, des racines : de quoi dire que le
lieu est vieux. Rien ne disait que quelqu'un y était venu. D'où ces objets :
une lampe à huile ébréchée au pied d'un mur, un chandelier renversé, une
lanterne couchée, une applique décrochée.

**Toutes éteintes, et ce n'est pas un détail d'habillage.** Ce jeu est un
moteur de lumière. Une lampe de décor qui brillerait serait une *source*,
donc du gameplay — et de la lumière gratuite dans un jeu dont le sujet est
qu'elle manque. Éteinte, elle raconte au contraire exactement ce que sont
les Dessous : l'endroit où tombe ce qui s'est éteint. C'est la phrase
d'ouverture du jeu, posée par terre.

**Un aller-retour raté, et sa leçon.** Premier essai : les dessiner *par
formules*, comme `tuiles.ts` dessine déjà le lierre et la mousse. Résultat
jeté sans être commité — une lampe à huile en primitives lit comme une
taupe, l'ampoule comme une tache, et tout était plat à côté d'un lierre qui,
lui, a du grain. Le projet avait pourtant déjà écrit la règle, à propos des
visages : *« un visage ne se calcule pas… une tête tracée par formules donne
une tête moyenne, et une tête moyenne n'est personne. »* Elle vaut pour tout
objet identifiable. Le procédural est excellent pour de la **matière** —
personne ne reconnaît une mousse de travers — et mauvais pour un **objet**.
Ils viennent donc d'une planche dessinée, comme les scènes de la fin.

**Le découpage** (`outils/decors.mjs`) est plus simple que celui de la fin :
la planche est une grille régulière de 8 × 4 panneaux de 157 px, relevée au
pixel. Deux particularités. Elle a **deux fonds** — la page à (39,37,32) et
l'intérieur des panneaux à (70,63,55) — et c'est le second qu'on retire.
Surtout, chaque objet est posé sur une **ligne de sol dessinée**, à y = 132 :
on coupe trois pixels au-dessus, sinon chaque lampe traînerait un trait
horizontal sous elle dans un jeu qui a déjà son propre sol.

**Trois familles ont été écartées, et c'est le vrai travail.** La planche
promettait huit familles ; elle en a rendu six complètes, une partielle et un
panneau corrompu (un artefact en étoile). Deux de ses étiquettes sont
fausses — on découpe donc par **position**, jamais par légende. Ont été
retirées :

- les **lanternes de table**, dont les quatre panneaux n'étaient pas le même
  objet à quatre états mais une grande lanterne couchée et trois petites
  debout : à hauteur normalisée, quatre objets sans rapport ;
- les **ampoules brisées**, et celle-là a demandé deux essais. Agrandies une
  fois, elles restaient illisibles : à la taille d'une case, un verre pâle
  couché sur la pierre n'a plus de silhouette et se lit comme **un petit
  animal mort** — un contresens franc dans un jeu dont le sujet est d'avoir
  peur de ce qu'on devine dans le noir.

Restent **cinq familles × quatre variantes** : lampe à huile, chandelier,
lanterne (dont la seule vraiment couchée de la planche, pour que la famille
mélange debout et tombé), bougeoir, applique murale.

**La hauteur est réglée famille par famille**, et c'est ce qui donne son
échelle à la salle : un chandelier occupe 62 % de la case, une lampe à huile
40 %. À hauteur égale, la petite lampe aurait la taille d'un candélabre.

**Le placement ne coûte rien**, parce que `sol.ts` savait déjà le faire : la
case est sa propre graine, et les décors se posent *selon ce que la case est*.
Les lampes vont au pied d'un mur **du bas** uniquement — celui qu'on voit de
face. Deux raisons : une lampe au milieu d'une salle n'a aucune raison d'y
être, et contre un mur latéral il faudrait la tourner d'un quart comme on
tourne la mousse, or une lampe tournée n'est plus une lampe posée. Les
appliques vont au mur, posées **après** le lierre pour ne pas lui changer sa
fréquence.

Elles sont **rares** : 13 % des cases de sol adossées à un mur, contre 22 %
pour la mousse. La mousse est de la texture, une lampe est une phrase — une
salle en compte quatre ou cinq, et c'est à ce prix qu'on la remarque.

Vérifié de trois façons, parce qu'à 13 % on ne tombe pas dessus en marchant :
les cinq familles rendues à la taille exacte du jeu sur la vraie pierre du
tileset (elles lisent toutes) ; `dessinerSol` appelé sur une salle entière
avec le code de placement réel, sans le voile d'obscurité (quatre lampes au
pied du mur du bas, une applique sur un pilier) ; et une marche en jeu, qui
confirme surtout que la feuille se charge. La feuille pèse **156 ko**, la
palette fait 40 couleurs et sa luminance va de 10 à 136 — au-dessus de la
pierre (14 à 51), donc lisible, et bien en dessous de ce qui se lirait comme
allumé. `npm run verifie` : 167 tests verts ; `npm run build` sans erreur.

## Les quatre variantes n'en faisaient qu'une

Retour de jeu sur les lampes mortes : trop rares, toutes contre les murs, et
« ça lag ». Trois reproches, trois réponses — dont une qui a exhumé un défaut
bien plus vieux que les lampes.

**Le ralenti ne vient pas d'elles**, mesuré en A/B sur le build de production
(une fois normalement, une fois en bloquant le chargement de la feuille) :
**0,06 ms par image** d'écart, les deux à 60 i/s. Sous frein processeur ×4 —
l'ordre de grandeur d'un téléphone — l'écart monte à 1,33 ms sur 57, soit
2,3 % ; sous frein ×8 il devient *négatif*, c'est-à-dire du bruit.

Le profil dit en revanche où passe le temps : **62 % de travail natif et
17,5 % de `drawImage`**, aucune fonction JavaScript au-dessus de 1 %. Le coût
est dans le dessin du sol — chaque case visible reçoit sa tuile, puis jusqu'à
quatre images d'ombre de contact, soit près d'un millier d'appels par image.
Les lampes en ajoutent une dizaine. Le ralenti est antérieur, et sa correction
est ailleurs : garder le sol immobile dans un canevas hors écran et ne le
redessiner qu'au déplacement de la caméra.

**Elles vont maintenant partout.** Le premier jet ne les posait que contre le
mur du bas, au motif qu'une lampe au milieu d'une salle n'aurait pas de raison
d'y être. C'était faux deux fois : on n'en croisait presque jamais, et surtout
quelqu'un qui traverse une pièce dans le noir pose sa lampe **là où il
s'arrête**. Elles restent plus denses le long des pierres (13 % contre 3,5 %
en plein milieu) — on longe les murs quand on a peur — sans y être confinées.

**Et le vrai défaut, trouvé en cherchant pourquoi toutes les lampes se
ressemblaient.** Le semis tirait :

```
((cx + 1) * A) ^ ((cy + 1) * B) ^ (sel * C)
```

À `sel` près, c'est le MÊME nombre décalé d'un masque constant : les tirages
n'étaient pas indépendants, ils étaient la même valeur vue sous un autre angle.
Chacun paraissait uniforme pris isolément — c'est ce qui a permis au défaut de
vivre si longtemps — mais **filtrer sur un tirage contraint mécaniquement tous
les autres**. Mesuré sur une grille de 300 × 300 :

| Tirage | Sans filtre | Tel que le jeu l'utilise |
|---|---|---|
| Variante du lierre | 22508 / 22508 / 22490 / 22494 | **0 / 0 / 0 / 11702** |
| Variante de la mousse | idem | **19804 / 0 / 0 / 0** |
| Famille de lampe | — | **96 % de lampes à huile** |

Autrement dit : depuis le début, **tout le lierre du jeu portait la même
variante et toute la mousse la sienne.** Les « quatre variantes » annoncées
dans `tuiles.ts` n'en ont jamais fait qu'une. Personne ne l'avait vu, parce que
c'est invisible tant qu'on ne compare pas deux cases voisines.

La correction tient en trois lignes, dans un module à part (`rendu/semis.ts`) :
après avoir mélangé les trois entrées, on passe le tout dans une **avalanche**
(le final de Murmur3), où chaque bit d'entrée influence tous les bits de
sortie. `variante()` du tileset, elle, n'a pas de sel et n'était pas touchée.

Le module est séparé pour une raison précise : **c'est testable sans DOM**, et
cette propriété-là méritait cinq tests (`tests/semis.test.ts`). Ils ne
vérifient pas que le hasard « a l'air uniforme » — la version fautive le
paraissait aussi — mais l'indépendance entre sels : sur les cases retenues par
un tirage, les quatre variantes doivent toutes peser près d'un quart. Avec
l'ancienne formule, trois d'entre elles valaient zéro.

172 tests verts, `npm run build` sans erreur.

## Le sol se peint une fois, et la mousse gagne du terrain

Deux demandes : corriger le ralenti, et laisser la mousse s'étendre au-delà
d'une case. Elles se sont révélées être la même.

**Ce qui coûtait.** Compté par source, image par image, avant ce changement :
**379 `drawImage`** dont **191 tuiles de pierre, 102 images d'ombre de contact
et 52 garnitures** — 345 appels pour une matière qui ne bouge jamais. On la
repeignait soixante fois par seconde.

**Le plancher** (`rendu/plancher.ts`) la peint une fois, par blocs de 4 × 4
cases, dans des canevas hors écran ; chaque image ne fait plus que recopier les
blocs visibles. Après : **50 `drawImage` par image** (le sol n'en fait plus que
16, un par bloc) et **16 `stroke` au lieu de 94**. Ce qui bouge — dalles,
fissures, battants — reste dessiné en direct par-dessus.

Pourquoi des blocs et pas la zone entière : sur téléphone la densité de pixels
monte à 2,5, et une zone de 21 × 28 cases ferait un canevas de 58 Mo. On ne
garde que les blocs visibles, plus une marge.

Trois règles rendent le résultat identique au dessin direct :

- chaque bloc est peint **avec sa couronne** de cases voisines, pour qu'une
  ombre de contact ou un grain de mousse à cheval sur deux blocs soit peint
  dans les deux au même endroit du monde ;
- chaque bloc est recopié **calé sur les pixels de l'écran** — la caméra glisse
  en douceur, et un bloc posé à une position fractionnaire laisserait un fil
  de pixels à moitié transparents à chaque joint ;
- chaque bloc porte une **empreinte des murs** qu'il lit : quand une fissure
  cède, l'empreinte change et le bloc se repeint seul, sans que la simulation
  ait à prévenir le rendu.

**La mousse** n'est plus un tampon dessiné « en bas de case » : c'est un champ
(`rendu/mousse.ts`). Chaque point du sol a une humidité, forte contre la pierre
et nulle à 2,7 cases, rongée par un bruit à grandes taches pour que chaque mur
n'ait pas la même bordure tirée au cordeau. Les grains sont semés case par case
mais leur densité se lit en coordonnées du monde : une tache commencée dans une
case continue dans la suivante. Elle évite le sol brûlé de l'étage 4.

Elle coûte plusieurs milliers de grains par salle — et c'est justement ce que
le plancher rend gratuit : peinte une fois, recopiée ensuite.

**Deux faux pas, mesurés avant d'être corrigés.** La première version était
*plus lente* sous frein processeur, avec des images à 230 ms. Deux causes :

- un bloc pas encore peint était dessiné en direct *avec sa mousse*, à chaque
  image, jusqu'à son tour — une quinzaine à l'entrée d'une zone. Il est
  maintenant dessiné en direct sans elle, et elle apparaît avec le bloc une
  image plus tard ; la mousse elle-même coûte 1,5 ms par bloc au lieu de 3,9,
  grâce à un champ de distances aux murs calculé une fois par zone, aux coins
  des cases, que chaque grain interpole ;
- quand le jeu rame, `ecran.ts` baisse la densité de pixels d'un cran, et le
  cache se vidait entièrement à ce moment-là — tout se repeignait d'un coup,
  pile quand la machine peinait déjà. Les blocs de l'ancienne densité restent
  maintenant affichés, mis à l'échelle, et se repeignent au fil des images.

**Le résultat, en A/B** — l'ancienne version construite à côté, le même
script, les deux en alternance, processeur bridé ×4 (l'ordre d'un téléphone) :

| | Avant | Après |
|---|---|---|
| Immobile, moyenne | ~107 ms (9 i/s) | **~57 ms (17,5 i/s)** |
| En marchant, moyenne | ~110 ms | **~63 ms** |
| Pointes (95ᵉ centile) | 133 à 150 ms | **67 à 83 ms** |

Presque deux fois plus rapide, et plus régulier. Ce qui reste est ailleurs :
l'éclairage fabrique **58 dégradés radiaux et 120 remplissages par image** —
c'est le prochain levier, et il n'a rien à voir avec le sol.

172 tests verts, `npm run build` sans erreur.

## Des lampes vraiment cassées, la mousse par taches, et le bilan du douzième

**Une nouvelle planche, des objets au sol et en morceaux.** La première planche
d'objets montrait des lampes debout, entières : rien ne disait qu'elles étaient
mortes. La planche refaite (`outils/planche-decors-2.png`, prompt réécrit pour
préciser la vue de trois quarts plongeante, l'objet couché au sol et brisé en
deux ou trois morceaux) donne quatre familles au sol — lampe à huile,
chandelier, lanterne, bougeoir — et **l'ampoule revient**, cassée, culot d'un
côté, éclats de verre de l'autre. L'applique murale, elle, reste celle de
l'ancienne planche : la nouvelle n'en avait pas.

`outils/decors.mjs` lit maintenant les deux planches, chacune détourée sur sa
propre couleur de fond. La nouvelle était beaucoup plus claire que la première
(ampoule à 81 de luminance moyenne, quand la pierre du jeu vit entre 14 et 51) :
elle serait sortie du noir comme si elle éclairait, ce qui est exactement ce
qu'une lampe morte ne doit pas faire. Elle est **ternie** à la découpe (×0,72,
×0,6 pour le verre) : toutes les variantes finissent entre 36 et 48. Une case
de l'ampoule portait un filigrane : elle est écartée, on en garde quatre.

Au sol, le barème des familles est de 25 / 21 / 19 / 18 / 17 %, et le test de
`semis.test.ts` vérifie que les cinq familles restent réparties même sur les
seules cases retenues.

**La mousse était partout.** Le champ de la version précédente suivait tous les
murs : un liseré vert autour de chaque pierre, constant, qui ne disait plus
rien. Un troisième bruit, très lent (taches de 4,5 cases), décide maintenant
**où le sol est humide** ; sous un seuil, rien ne pousse, même au pied du mur.
Mesuré sur 640 000 points : **53 % du sol est sec**, 23 % franchement humide,
24 % en transition. Des murs nus, des coins tapissés, et une lisière douce
entre les deux. Rien ne change pour le coût : c'est un tirage de plus par grain,
dans un bloc peint une seule fois.

**Le bug du douzième.** En entrant dans le dernier Seuil, le jeu lançait la fin
directement — et c'était le seul étage à sauter son bilan. Or c'est le bilan qui
porte les chiffres, et c'est lui que `main.ts` range dans la progression : le
douzième restait sans chiffres à l'écran et sans étoiles dans l'Histoire.

Le dernier Seuil pose maintenant le bilan comme les onze autres
(`regles/monde.ts`), et c'est la fin du bilan qui décide de la suite
(`regles/bilan.ts`) : la fin la première fois, la cage d'escalier ensuite.
Vérifié dans le navigateur : bilan « ÉTAGE 12 » affiché, puis « Il les a toutes
remontées. », et la sauvegarde contient `etages[12]` avec `atteint = 13`. Un
test nouveau dans `paliers.test.ts` vérifie les chiffres du bilan ; les trois
tests de la fin passent désormais par lui.

173 tests verts, `npm run build` sans erreur.

## L'éclairage : la nuit posée dans la page, et le flou sans filtre

**D'abord mesurer où ça coûte.** On a coupé tour à tour chaque étape de
l'éclairage, processeur bridé ×4 (l'ordre d'un téléphone), étage 6 :

| Ce qu'on coupe | Image (moy.) | Calcul JS |
|---|---|---|
| Rien | 55 à 65 ms | 24 à 30 ms |
| Le calque d'obscurité entier | **22 ms** | **5 ms** |
| Seulement le flou (`filter: blur`) | 43 à 51 ms | 12 à 15 ms |
| Seulement la lumière additive | 52 à 60 ms | 23 à 27 ms |
| Les perçages (vidés avant le flou) | inchangé | inchangé |

Le calque d'obscurité, c'était **les deux tiers de l'image**. Et pas à cause des
perçages — les polygones de lumière et leurs dégradés, qui ne coûtent presque
rien — mais de ce qu'on en faisait ensuite : le **filtre de flou**, qui coûte la
même chose quel que soit ce qu'il floute, et la **copie** du calque sur
l'image, étirée du double. Le profileur, ligne par ligne, donne cette copie à
elle seule à 22 % du temps processeur. C'est aussi ce calque qui faisait
tomber la finesse de l'écran à 0,8 au bout d'une seconde.

**La nuit n'est plus recopiée : elle est posée dans la page.** Sa toile est un
élément placé exactement sur le canevas du jeu, et c'est le navigateur qui
l'étire en composant la page — sur la carte graphique d'un téléphone, pour
rien. Conséquence : ce qui se dessinait *après* la nuit ne peut plus aller
dans l'image du dessous. Deux calques de plus, dans cet ordre (`ecran.ts`) :

- `lueur`, les lumières additives (halos chauds, balayages rouges, la lumière
  qui quitte le corps), fondu en `mix-blend-mode: plus-lighter` — le `lighter`
  du canevas, mais entre deux éléments de la page (`screen` pour les
  navigateurs qui ne le connaissent pas) ;
- `dessus`, tout ce qui reste visible par-dessus le noir : le fil, les yeux,
  les textes, les jauges, la manche.

Ils ne s'affichent que quand le monde est dessiné : le bilan, la cage et la fin
se dessinent seuls, et la nuit de la dernière image resterait sinon posée sur
eux.

**Le flou sans filtre, deux façons** (`obscurite.ts`) :

- **WebGL**, quand il y a une vraie carte graphique : un flou gaussien en deux
  passes, de même écart type que la `PENOMBRE`, et la nuit calculée dans la
  même passe. La toile WebGL *est* le calque posé dans la page : aucune copie
  entre WebGL et le canevas 2D. Les perçages, eux, restent en Canvas 2D — c'est
  l'identité du jeu, on n'y touche pas ; le calque des trous monte seulement
  comme texture ;
- **la réduction**, sinon : deux réductions exactes de moitié (chacune fait la
  moyenne de quatre pixels), puis un agrandissement bilinéaire. Une boîte de
  quatre suivie d'une tente de quatre : un flou d'écart type 2, la même
  pénombre, pour trois petits `drawImage`.

**Le repli.** WebGL absent, contexte qui ne se crée pas, programme qui ne se
compile pas, contexte perdu en cours de partie (onglet en arrière-plan) : on
bascule sur la réduction, sans rien dire. Et WebGL n'est pas pris quand il est
**émulé sur le processeur** (SwiftShader, llvmpipe…) : mesuré ici même, il
coûtait 50 ms de calcul par image, contre 11 pour la réduction. Un test vérifie
ce tri sur des noms de cartes réels. `?lumiere=webgl`, `?lumiere=reduction` ou
`?lumiere=filtre` forcent un chemin, pour comparer.

**Même image.** Comparé pixel à pixel à l'ancienne version, sur une image
rendue avec une horloge synthétique (le monde avance exactement pareil) :
écart moyen de 0,24 niveau sur 255 pour la réduction, 0,47 pour WebGL, et
0,004 % des pixels à plus de 8 niveaux. Deux vrais écarts trouvés en route et
corrigés : les motes de la vidange, dessinées en `lighter` sur le calque
transparent, ne s'ajoutaient plus à rien (elles vont maintenant sur `lueur`) ;
et `lueur` en demi-résolution éteignait leur cœur blanc d'un pixel (il est
maintenant en pleine résolution).

**Le résultat, en A/B** — l'ancienne version servie à côté, les deux en
alternance, trois passes chacune, processeur bridé ×4 :

| | Avant | Après |
|---|---|---|
| Immobile, image moyenne | 58,6 ms | **45,0 ms** (−23 %) |
| En marchant, image moyenne | 61,0 ms | **51,8 ms** (−15 %) |
| Pointes (95ᵉ centile) | 83 ms | **67 ms** |
| Calcul JS par image, immobile | 25,9 ms | **10,8 ms** (−58 %) |
| Calcul JS par image, en marchant | 27,5 ms | **13,8 ms** (−50 %) |

Ce qui reste entre le calcul et l'image, ici, c'est la composition des calques :
cette machine de mesure n'a pas de carte graphique et la fait au processeur. Sur
un téléphone, c'est précisément le travail que la carte graphique fait sans
qu'on le voie — mais on ne l'a pas mesuré sur un vrai téléphone, et ce chiffre-là
reste à confirmer.

En passant : le piéton au parapluie de la fin marchait au bord du cône du
lampadaire, dans le noir ; il est maintenant dessous, en entier dans la
lumière (`outils/fin-scenes.mjs`).

175 tests verts, `npm run build` sans erreur.

# Le cahier des assets — ce qu'il faut dessiner, et comment

Tout le jeu est tracé à la main, forme par forme. C'est ce qui lui donne sa
cohérence, et c'est aussi son plafond : on ne dessine pas une pierre usée avec
un `roundRect`. Ce document dit **exactement** quoi produire pour le remplacer,
dans quel format, et surtout ce qu'il ne faut **pas** faire.

Le chemin de rendu existe déjà (`src/rendu/atlas.ts`) et il est testé. Il n'y a
rien à réécrire le jour où les fichiers arrivent.

---

## Les trois règles qui décident de tout

### 1. Aucune lumière n'est peinte DANS la tuile

**C'est la règle la plus importante de ce document**, et elle se comprend mal
dite trop vite. Elle ne dit pas que le jeu n'a pas de lumière : il n'a que ça.
Les faisceaux, les torches, le halo du joueur sont recalculés à chaque image,
et c'est **eux** qui révèlent la matière.

Elle dit que la lumière ne doit pas être **cuite dans l'image**. Une tuile de
pierre ne contient pas de soleil imaginaire : pas de face claire en haut et
sombre en bas, pas d'ombre portée d'un caillou, pas de reflet spéculaire.
Parce qu'une torche peut arriver par la droite, et la tuile dirait le
contraire.

> Une tuile, c'est de la **matière en nuances sombres**. C'est le moteur qui
> l'éclaire, à chaque image, depuis la bonne direction.

C'est la différence entre « une pierre » et « une pierre éclairée par la
gauche ». On veut la première.

**Deux exceptions, qui n'en sont pas :**

- **Ce qui émet.** La flamme d'une torche, une braise, les yeux, le cœur d'une
  lueur : c'est un deuxième canal, toujours visible, que le moteur ne touche
  pas. Une torche a donc deux parties : son manche (matière) et sa flamme
  (émission).
- **L'occlusion de contact.** Là où un sol touche une pierre, le sol
  s'assombrit. Ça ne vient d'aucune direction — c'est la même chose sur les
  quatre côtés — donc ça ne ment jamais, et sans elle les cases flottent les
  unes sur les autres. Elle est déjà dans le moteur (`rendu/tuiles.ts`), il ne
  faut pas la redessiner dans les tuiles.

### 2. Les corps sont en niveaux de gris

La couleur d'un personnage est une **donnée du jeu**, pas une décision du
dessinateur : elle change avec l'éclat, elle vire au rouge dans la scène
finale, elle passe au vert quand une lumière est rallumée. Le code teinte le
sprite au chargement (`teinter()` dans `atlas.ts`).

- un corps se dessine **en gris**, du blanc au gris moyen ;
- le blanc pur devient la couleur pleine, le gris moyen sa version sombre ;
- les traits noirs (contours, détails) restent noirs à la teinte : c'est voulu.

Les **visages** ne sont pas teintés : ils sont livrés en noir et blanc, et
posés par-dessus le corps.

### 3. L'échelle est petite, donc c'est du pixel art

Une case du jeu fait **62 px**, un personnage **31 px**. À cette taille, une
illustration perd tout : il n'y a pas la place pour du détail, seulement pour
de la silhouette. Le seul style qui tienne, c'est du **pixel art** — fait à la
main, ou avec un outil spécialisé. Un générateur d'images généraliste rendra
des images jolies en grand et illisibles en petit, et ne tiendra pas la
cohérence d'une image à l'autre dans un cycle d'animation.

On dessine donc à **2×** (un personnage sur 64 px, une case sur 128 px) et le
jeu réduit : c'est net sur un écran à deux pixels par point, qui est la règle
sur téléphone.

---

## Le format

### La planche

Deux fichiers, dans `public/atlas/` :

- `lux.png` — PNG 32 bits, fond **transparent**, sans compression avec perte ;
- `lux.json` — la découpe.

```json
{
  "image": "lux.png",
  "echelle": 2,
  "cases": {
    "corps/falot/allume":  { "x": 0,  "y": 0, "w": 64, "h": 64 },
    "visage/inquiet/0":    { "x": 64, "y": 0, "w": 64, "h": 64 },
    "torche/vive/0":       { "x": 0, "y": 64, "w": 32, "h": 64, "ax": 0.5, "ay": 0 }
  }
}
```

- `echelle` : combien de pixels de la planche valent un pixel de jeu. À 2, un
  sprite de 64 px se dessine sur 32 px.
- `ax` / `ay` : le point du sprite qui se pose sur la position demandée, en
  fraction de sa taille. **Par défaut son centre** (0,5 / 0,5) — c'est la
  convention de tout le jeu. Une torche s'accroche par le haut (`ay: 0`).
- **2 px de marge** entre deux images dans la planche, sinon les bords bavent
  quand le jeu réduit.

### Ce qui se passe si la planche est absente

Le jeu se dessine exactement comme aujourd'hui. C'est la même discipline que
pour la sauvegarde : **un luxe, jamais une dépendance.** On peut donc livrer
les sprites **un par un** — chaque forme qui a son image la prend, les autres
continuent d'être tracées à la main, et le jeu n'est jamais cassé.

### Essayer le chemin sans aucun dessin

```
node outils/atlas-temoin.mjs
```

Ça cuit les formes actuelles dans une planche témoin (`public/atlas/`). Elle
est plus laide que le tracé à la main — ce n'est pas son but : elle prouve que
le placement, la teinte et la composition marchent. Elle n'est jamais livrée.

---

## Ce qu'il faut dessiner

### Lot 1 — les personnages (le plus rentable)

C'est ce qu'on regarde pendant toute la partie, et c'est le plus petit lot.

**Les corps**, 64 × 64, en niveaux de gris, corps plein cadre, ancré au centre.

| Nom | Ce que c'est |
|---|---|
| `corps/falot/allume` | Falot. Un carré arrondi, doux, un peu plus haut que large |
| `corps/falot/vide` | Le même, soufflé : un contour seul, l'intérieur presque noir |
| `corps/frileux/allume` | Un bleu. Éteint par la peur — plus rond, plus tassé |
| `corps/frileux/vide` | Le même, pas encore rallumé |
| `corps/errant/allume` | Un doré. Éteint en s'éloignant — plus élancé |
| `corps/errant/vide` | Le même, pas encore rallumé |
| `corps/guet/allume` | Un Guet. Plus anguleux : ce n'est plus tout à fait quelqu'un |
| `corps/guet/vide` | Le même, aveuglé |

**Les visages**, 64 × 64, noir et blanc, **jamais teintés**, posés par-dessus
le corps et **jamais déformés** — c'est ce qui permet au corps de s'écraser en
courant pendant que les yeux gardent leur taille. C'est une règle du jeu :
*l'œil ne change jamais de taille.* L'humeur passe par les **sourcils**, la
bouche et la pupille.

Six humeurs, deux images chacune (`0` = œil ouvert, `1` = cligné) :

| Humeur | Ce qu'elle dit |
|---|---|
| `peur` | Le vrai danger. Pointes intérieures des sourcils relevées, bouche ouverte qui tremble |
| `inquiet` | La peur au repos. Mêmes sourcils, bouche sage. C'est son visage par défaut |
| `intrigue` | Il avance. Sourcils neutres |
| `acharne` | Il court. Pointes intérieures baissées — le seul moment où il a l'air décidé |
| `visee` | Il ajuste un lancer. Un œil fermé |
| `apaise` | À l'abri. Le seul sourire du jeu |

→ `visage/peur/0`, `visage/peur/1`, `visage/inquiet/0`… **12 images.**

Soit **20 images** pour tout le lot 1.

### Lot 2 — les textures du décor *(déjà là, mais fabriquées)*

Le sol et les murs ne sont plus des aplats : `src/rendu/tuiles.ts` fabrique de
la pierre au chargement — dalles inégales, fêlures, grain, six variantes
choisies par la position de la case. C'est de l'algorithme, pas du dessin,
donc c'est fait. Une planche dessinée à la main peut les remplacer, et devra
alors respecter ceci :

| Nom | Taille | Ce que c'est |
|---|---|---|
| `texture/sol/0..5` | 128 × 128 | Le sol des Dessous. De la pierre entassée, pas taillée |
| `texture/mur/0..5` | 128 × 128 | Les murs, **nettement plus sombres que le sol** : c'est ce qui fait lire l'architecture |
| `texture/cendre/0..5` | 128 × 128 | Le sol brûlé de l'étage 4, plus clair et grumeleux |
| `texture/fissure` | 128 × 128 | Le réseau de fractures d'un mur fêlé, en surcouche |

- **Raccordables** : une tuile posée à côté d'elle-même ne doit montrer aucune
  couture. Le générateur actuel dessine chaque caillou neuf fois — à sa place
  et décalé d'une tuile dans les huit directions — pour que ce qui déborde
  d'un côté rentre de l'autre. Une planche dessinée doit faire pareil.
- **Six variantes**, sinon on voit le damier dès la première salle.
- **Aucune ombre de contact** dans la tuile : le moteur la pose.

### Lot 3 — les objets

| Nom | Taille | Ancrage | Ce que c'est |
|---|---|---|---|
| `torche/morte` | 32 × 64 | haut | Un manche, un collier, un charbon noir |
| `torche/vive/0..2` | 32 × 64 | haut | La même, reprise. Trois images qui tremblent |
| `pierre` | 24 × 24 | centre | La seule chose ici qui ne brille pas |
| `braise/0..3` | 64 × 64 | centre | Là où une pierre est tombée et s'est mise à couver |
| `portail/ferme` | 128 × 128 | centre | Le Seuil, qui réclame ses lumières |
| `portail/ouvert` | 128 × 128 | centre | Le même, qui cède |
| `porte/battant` | 32 × 128 | gauche | Un battant sur son gond |
| `dalle` | 128 × 128 | centre | La pesée de l'étage 9 |

### Lot 4 — la ville de la scène finale (facultatif)

Plus grand, et vu de plus loin : là, une illustration passe.

| Nom | Taille | Ce que c'est |
|---|---|---|
| `ville/immeuble/0..5` | 256 × 512 | Des façades, avec leur grille de fenêtres |
| `ville/reverbere` | 64 × 256 | Mât, potence, lampe |
| `ville/lune` | 64 × 64 | Un croissant |

---

## La palette

Ce sont les couleurs du code. Les corps étant teintés, elles servent surtout de
**repère de valeur** : dessiner en gris en sachant quelle couleur viendra.

| Rôle | Code |
|---|---|
| Falot, et tous ses paliers | `#8fd0ff` |
| Une lumière rallumée | `#a8f0c8` |
| Un Guet | `#ff7a6b` |
| Une lueur à ramasser | `#ffd479` |
| Ce qui brûle (torche, braise, portail) | `#ffd68c` |
| Le noir du fond | `#08080e` |
| Le gris d'un corps éteint | `#23232f` → `#12121a` |

Falot **ne change jamais de couleur** en montant en puissance : ce qui grandit,
c'est ce qu'il émet. Il n'y a donc pas cinq Falot à dessiner, il y en a un.

---

## Par où commencer

Le **lot 1** seul, et rien d'autre. Vingt images, c'est ce qu'on regarde
pendant toute la partie, et ça se livre en une fois. On verra à l'écran si le
style tient avant d'en commander deux cents.

# Du prototype au projet

Le POC — [`reference/poc-2026-09.html`](../reference/poc-2026-09.html), 4 416
lignes en un seul fichier — n'a pas été réécrit : il a été **porté**. Les
formules, les constantes et les commentaires d'équilibrage sont ceux d'origine,
à la ligne près dans la plupart des cas. Ce document liste ce qui, malgré tout,
a changé — parce qu'un port silencieux est un port qu'on ne peut pas vérifier.

## Ce qui a changé dans le comportement

1. **Le pas de temps est fixe** (1/60, `PAS` dans `coeur/partie.ts`). Le POC
   avançait d'un `dt` variable plafonné à 1/30 : le jeu ne se comportait donc
   pas tout à fait pareil sur une machine qui peine, et aucune partie n'était
   rejouable. La boucle accumule maintenant le temps réel et avance par pas
   entiers, trois au plus par image — revenir d'un onglet resté en
   arrière-plan ne doit pas simuler trente secondes d'un coup.

2. **Le hasard du cœur est tiré de la graine** (`partie.hasard()`). Les
   étincelles, les clignements d'yeux et les positions de repli d'une âme
   lâchée passaient par `Math.random()`. C'est invisible en jouant, et ça
   rendait tout rejeu impossible. Le rendu, lui, garde `Math.random()` :
   s'il consommait le hasard de la simulation, dessiner ferait dériver la
   partie.

3. **Le cœur ne touche plus au DOM.** Le bandeau, la cage d'escalier et les
   animations de l'interface étaient appelés depuis les règles du jeu
   (`montrerToast`, `majBoutons`, `montrerCage`, `elCaillou.classList`). Ce
   sont maintenant des **états** (`partie.bandeau`, `partie.cage`) et des
   **compteurs** (`partie.signaux`), que `interface/hud.ts` et
   `interface/cage.ts` observent une fois par image. Le texte affiché et le
   moment où il s'affiche sont donc testables (`tests/voix.test.ts`).

4. **La mémoire des torches et leurs étincelles sont passées du rendu aux
   règles.** Le POC posait `torche.vue = true` et crachait ses braises dans
   `dessiner`. C'est de la mémoire de jeu et un effet de simulation : leur
   place est dans `regles/monde.ts`. À 60 images par seconde, le résultat est
   le même.

5. **La caméra n'est plus appelée par le jeu.** `chargerZone` appelait
   `cadrer(true)` ; elle lève maintenant `partie.recadrer`, que le rendu
   consomme. C'est la même image, sans que le cœur connaisse l'écran.

6. **Le prologue mémorisé est passé dans l'interface.** `localStorage` est une
   affaire de navigateur : le cœur lève `partie.prologueFait`, et
   `interface/ouverture.ts` écrit.

7. **`D` (les dimensions dérivées de la case) est une constante.** Le POC la
   recalculait à chaque redimensionnement, ce qui laissait croire qu'elle
   dépendait de l'écran — elle ne dépend que de `CASE`, et la valeur était
   toujours la même.

8. **L'API de mesure `window.__lux` a fondu.** Elle exposait une quarantaine de
   sondes pour piloter le jeu depuis un navigateur ; les tests unitaires font
   ça mieux et sans navigateur. Il reste `{ partie, ecran, descendre }` — le
   vrai état, utile en console et pour les captures comparées.

## Ce qui a été retiré

- `dejaVues`, un `Set` devenu inutile quand le bandeau modal a été supprimé.
- `majBoutons` et `majInterface` : l'interface lit l'état à chaque image, il n'y
  a plus rien à « mettre à jour » depuis les règles.
- Le paramètre `couleur` de `montrerToast`, déjà ignoré dans le POC depuis que
  la voix est d'un seul ton.

## Ce qui a été gardé exprès

- **Les noms français** du domaine, y compris `portéesCone` et `majPersos` : la
  bible et le code doivent rester greppables l'un depuis l'autre.
- **Les commentaires d'équilibrage**, mot pour mot. Ils valent plus que le code
  qu'ils accompagnent : ils disent quelle valeur a été essayée, mesurée, et
  pourquoi elle a été abandonnée.
- **`evoluer` ne monte que d'un palier par gain.** C'est une bizarrerie du POC,
  gardée telle quelle et désormais documentée par un test : les gains réels
  valent 2, 4, 6 ou 10, et les paliers sont espacés de 26 au moins — sauter deux
  formes d'un coup ne peut pas arriver en jouant.
- **L'ordre des tirages du générateur**, qui est un contrat : le déplacer
  regénère un autre monde pour toutes les graines existantes.
- **Le POC lui-même**, gelé dans `reference/`. Il reste jouable et il sert de
  référence visuelle.

## Ce qui reste à faire

- Brancher la comparaison de captures dans la CI (il faut y installer un
  navigateur : c'est le seul vrai coût).
- Reprendre le contenu : l'étage 1 est écrit, les suivants sont tirés au sort.
  Les quatre questions ouvertes de la bible (« À débattre ») attendent toujours
  une réponse.

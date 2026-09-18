# Falot — *Lux & Paranoïa*

Aventure procédurale dans le noir. Falot est la plus petite lampe des Dessous :
il n'a qu'un caillou, et il escorte des âmes jusqu'au Seuil sans croiser les
regards rouges.

- **La bible narrative** : [`docs/lux-falot.md`](docs/lux-falot.md) — le monde,
  les règles et *pourquoi* chacune existe.
- **L'étage 1**, écrit à la main : [`docs/lux-niveau-1.md`](docs/lux-niveau-1.md).
- **Le prototype d'origine**, gelé :
  [`reference/poc-2026-09.html`](reference/poc-2026-09.html) — un seul fichier,
  ouvrable tel quel, et la cible de comparaison du rendu.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173
```

| Commande | Ce qu'elle fait |
|---|---|
| `npm run dev` | serveur de développement, rechargement à chaud |
| `npm test` | les tests (Vitest) |
| `npm run test:regarde` | les tests en continu |
| `npm run types` | `tsc --noEmit` |
| `npm run lint` / `npm run format` | Biome (lint + format) |
| `npm run verifie` | types + lint + tests, ce que la CI fait |
| `npm run build` | build statique dans `dist/` |
| `npm run comparer` | captures côte à côte du jeu et du POC gelé (voir plus bas) |

Raccourcis de développement dans l'URL : `?etage=4` démarre directement à cet
étage, `?graine=LUX-1234` fixe le plan. À graine égale, plan égal.

## La stack, et pourquoi

- **TypeScript strict**, sans dépendance à l'exécution. Le jeu se construit en
  un bundle statique, déployable comme le POC l'était.
- **Vite** pour le développement et le build.
- **Canvas 2D**, pas de moteur de jeu. Ce n'est pas un choix par défaut : le
  rendu du jeu *est* un raycast percé dans un calque sombre
  ([`src/rendu/lumiere.ts`](src/rendu/lumiere.ts)). Le refaire en masques WebGL,
  c'est refaire la seule chose qu'on veut garder à l'identique — et le coût
  mesuré d'une image est de l'ordre de la milliseconde. Le jour où il faudra du
  bloom ou du grain, une passe de post-traitement WebGL se posera **par-dessus**
  le canvas existant, sans toucher à la logique.
- **Pas de framework d'interface**. Le HUD, c'est une douzaine de nœuds DOM mis
  à jour une fois par image ; React se battrait avec la boucle de rendu pour rien.
- **Vitest** + **fast-check** pour les tests, **Biome** pour le lint et le format.
- **Zéro asset** : tout est dessiné, y compris les visages.

## Le découpage

```
src/
├── coeur/              LE JEU. Aucun DOM, aucun canvas, aucune horloge.
│   ├── partie.ts       l'état complet + avancer(partie, dt)
│   ├── types.ts        ce qu'est une zone, un perso, une partie
│   ├── formes.ts       LES DONNÉES : formes, caillou, bonus, humeurs
│   ├── dimensions.ts   tout se mesure en CASES, jamais en pixels d'écran
│   ├── lectures.ts     les questions qu'on pose sans rien modifier
│   ├── voix.ts textes.ts particules.ts alea.ts geometrie.ts couleurs.ts
│   ├── monde/          grille (BFS, collisions, vue), génération, étages écrits
│   └── regles/         joueur, convoi, persos, portes, caillou, seuil, monde
├── rendu/              CANVAS 2D. Ne décide rien, ne mute rien.
│   ├── ecran.ts        canvas, calque d'obscurité, caméra, budget de pixels
│   ├── lumiere.ts      le rendu signature : cônes et ronds percés dans le noir
│   ├── scene.ts        une image, dans l'ordre
│   └── sol.ts visages.ts vidange.ts gestes.ts texte.ts
├── interface/          DOM : le HUD, la cage d'escalier, l'écran-titre, le CSS
├── entrees/            clavier et pointeur → un objet `Entrees` normalisé
└── main.ts             le câblage, et rien d'autre
```

**La règle qui fait tout tenir** : `coeur/` n'importe jamais rien de `rendu/` ni
de `interface/`. Le rendu lit la partie et n'y écrit que ses caches de rayons.
L'interface lit la partie et n'y touche qu'au travers des entrées. Quand une
règle du jeu doit déclencher une animation, elle incrémente un compteur dans
`partie.signaux` et l'interface le voit changer — c'est ce qui permet de tester
« le jeu signale le caillou la première fois qu'on meurt » sans navigateur.

Une image, c'est trois gestes dans [`src/main.ts`](src/main.ts) : lire les
entrées, avancer la simulation d'un pas **fixe** de 1/60, dessiner l'état obtenu.

## Les tests

`npm test` — une cinquantaine de tests qui portent sur ce qui casse en silence :

- **Le générateur**, par propriétés sur des centaines de graines : zone connexe,
  Seuil et personnages atteignables, quotas d'âmes et de Guets tenus, rien dans
  la pierre, et **déterminisme** (même graine, même plan).
- **L'étage 1 écrit à la main** : finissable sans casser un seul mur, et tout le
  reste atteignable une fois les fentes ouvertes — la règle même de la bible.
- **Les règles** : la jauge d'un Guet qui monte plus vite avec un gros convoi,
  son dos qui ne voit rien, le caillou qui le détourne, la mort qui lâche le
  convoi sans reprendre l'éclat, l'abri qui efface, les paliers de forme.
- **La grille**, sur des plans dessinés : ligne de vue, portes, chemins,
  collisions.
- **Un rejeu** : mêmes graine et mêmes entrées, même partie au bout de 900 pas.

Le rendu, lui, ne s'unit-teste pas. La réponse honnête à « est-ce le même
rendu ? » est une comparaison de captures :

```bash
npm i -D playwright && npx playwright install chromium   # une fois
npx vite --port 8099                                     # dans un terminal
npm run comparer                                         # dans un autre
```

Les images arrivent dans `captures/` : `<scène>-poc.png` et `<scène>-neuf.png`,
même graine, même étage, même pilotage.

## Conventions

- **Le vocabulaire du jeu reste en français**, comme la bible : un `Guet` dans
  `docs/lux-falot.md` se retrouve sous le même nom dans le code. L'anglais est
  réservé à la plomberie technique.
- **Un commentaire dit POURQUOI, le code dit quoi.** Les nombres de
  `formes.ts` et de `dimensions.ts` sont des mesures, pas des goûts : ce qui est
  écrit à côté d'eux raconte l'essai qui a mené là. Les déplacer sans lire, c'est
  refaire une mesure déjà faite.
- Tout se mesure en **cases**, jamais en pixels d'écran.
- Le hasard passe par `partie.hasard()` dans le cœur, et par `Math.random()`
  dans le rendu — sinon le rendu ferait dériver une partie rejouée.

## Mise en ligne

`.github/workflows/ci.yml` vérifie types, lint, tests et build à chaque push.
`.github/workflows/pages.yml` publie le jeu sur GitHub Pages, avec le POC gelé
et la bible. Il faut l'autoriser une fois dans **Settings → Pages → Source :
GitHub Actions** ; tant que ce n'est pas fait, le workflow le constate et
s'arrête sans échouer.

## D'où ça vient

Le POC tenait en un fichier de 4 400 lignes et il marchait très bien. Ce qui a
été porté, ce qui a changé et ce qui a été délibérément laissé tel quel est
listé dans [`docs/portage.md`](docs/portage.md).

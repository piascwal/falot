/**
 * LES LAMPES MORTES — le décor des Dessous, découpé depuis une planche dessinée.
 *
 * Les Dessous sont l'endroit où tombe ce qui s'est éteint. Il manquait de quoi
 * le montrer : la pierre a du lierre et de la mousse, mais rien qui dise que
 * quelqu'un est passé là avec une lampe, et que sa lampe est morte.
 *
 *   node outils/decors.mjs   → public/decors.png (+ planche de contrôle)
 *
 * DEUX PLANCHES (voir `PLANCHES`), chacune une grille relevée au pixel, chacune
 * avec son fond. On retire ce fond, puis on DÉMATTE le bord — sinon chaque
 * objet garde un liseré clair sur la pierre presque noire du jeu, où il se
 * verrait bien plus que sur la planche.
 *
 * LA SORTIE IMITE LES GARNITURES PROCÉDURALES (`rendu/tuiles.ts`) : quatre
 * variantes côte à côte, une famille par rangée, chacune dans la case du jeu.
 * `rendu/decors.ts` n'a donc qu'à découper, et `sol.ts` les pose exactement
 * comme il pose déjà la mousse et le lierre.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

/** La case du jeu, à deux fois sa taille d'écran — la même règle que le
 *  tileset : net sur un écran à deux pixels par point. */
const T = 124;
/** Combien de variantes par famille. `sol.ts` en tire une par position. */
const VARIANTES = 4;
/** Comme pour les scènes de la fin : une seule palette pour toute la planche,
 *  sinon chaque objet dérive vers la sienne et l'étage ne tient plus ensemble. */
const COULEURS = 40;

/**
 * LES DEUX PLANCHES, chacune avec son fond.
 *
 * La première donnait des lampes DEBOUT et entières, sur une ligne de sol
 * dessinée : il n'en reste que les appliques murales, qui étaient justes. La
 * seconde a été demandée avec un prompt corrigé — objets CASSÉS EN MORCEAUX,
 * couchés, sans ligne de sol, une rangée par objet — et elle l'a respecté.
 */
const PLANCHES = {
  murale: { fichier: 'outils/planche-decors.png', fond: [70, 63, 55] },
  cassee: { fichier: 'outils/planche-decors-2.png', fond: [123, 116, 108] },
};

/** La première planche : 8 × 4 panneaux de 157 px, une ligne de sol à y = 132
 *  qu'on laisse sous la découpe. */
const ancienne = (cle) => {
  const COLS = [18, 190, 362, 534, 716, 888, 1060, 1233];
  const RANGS = [30, 218, 406, 593];
  const x = COLS[Number(cle[3]) - 1];
  const y = RANGS[Number(cle[1]) - 1];
  return [x, y, x + 156, y + 129];
};

/**
 * La seconde : une grille de cases séparées par des traits sombres, relevés au
 * pixel. Quatre colonnes sur les rangées 1 à 4, SIX sur la rangée des ampoules
 * — le générateur en a donné plus que demandé. On rentre de quatre pixels dans
 * chaque case pour ne jamais ramasser le trait de la grille avec l'objet.
 */
const RANGEES = [
  [3, 156],
  [161, 309],
  [314, 461],
  [466, 613],
  [618, 764],
];
const QUATRE = [
  [3, 349],
  [354, 701],
  [706, 1053],
  [1058, 1403],
];
const SIX = [
  [3, 232],
  [238, 466],
  [472, 701],
  [706, 935],
  [941, 1169],
  [1175, 1403],
];
const casse = (r, c, colonnes = QUATRE) => {
  const [y0, y1] = RANGEES[r];
  const [x0, x1] = colonnes[c];
  return [x0 + 4, y0 + 4, x1 - 4, y1 - 4];
};

/**
 * CE QU'ON GARDE.
 *
 * `boite` est la place qu'une famille a le droit d'occuper dans sa case, en
 * fraction : largeur, hauteur. Ce sont maintenant des COMPOSITIONS — l'objet
 * tombé et ses morceaux éparpillés à côté — bien plus larges que hautes :
 * caler seulement la hauteur, comme pour la première planche, les faisait
 * déborder de la case. Et l'échelle est UNE PAR FAMILLE, la plus petite qui
 * fasse tenir toutes ses variantes : une lanterne ne change pas de taille
 * selon la façon dont elle s'est brisée.
 *
 * L'ordre des familles est celui des rangées de la feuille, et `rendu/decors.ts`
 * le relit tel quel : si l'un bouge, l'autre suit.
 */
/**
 * TERNIR. La seconde planche est dessinée sur un fond gris clair, et ses objets
 * sortent 40 à 50 % plus clairs que ceux de la première — les ampoules presque
 * deux fois : 81 de luminance moyenne là où les lampes de la première planche
 * tenaient autour de 40, sur une pierre qui vit entre 14 et 51. Posées telles
 * quelles, elles auraient eu l'air allumées. On les ramène dans la même gamme,
 * le verre un peu plus fort que le métal.
 */
const TERNI = 0.72;
const TERNI_VERRE = 0.6;

const FAMILLES = [
  { nom: 'lampeHuile', planche: 'cassee', ternir: TERNI, boite: [0.84, 0.44], mur: false,
    cases: [casse(0, 0), casse(0, 1), casse(0, 2), casse(0, 3)] },
  { nom: 'chandelier', planche: 'cassee', ternir: TERNI, boite: [0.9, 0.56], mur: false,
    cases: [casse(1, 0), casse(1, 1), casse(1, 2), casse(1, 3)] },
  { nom: 'lanterne', planche: 'cassee', ternir: TERNI, boite: [0.92, 0.56], mur: false,
    cases: [casse(2, 0), casse(2, 1), casse(2, 2), casse(2, 3)] },
  { nom: 'bougeoir', planche: 'cassee', ternir: TERNI, boite: [0.88, 0.52], mur: false,
    cases: [casse(3, 0), casse(3, 1), casse(3, 2), casse(3, 3)] },
  // LES AMPOULES REVIENNENT. Elles avaient été retirées de la première planche
  // parce qu'un verre pâle et ovale couché sur la pierre se lisait comme un
  // petit animal mort. Celles-ci ont le culot à pas de vis bien visible et le
  // verre éclaté en pointes : la silhouette dit « ampoule » avant tout le reste.
  // Six variantes données, quatre gardées : la sixième porte l'artefact en
  // étoile que le générateur laisse parfois dans un coin.
  { nom: 'ampoule', planche: 'cassee', ternir: TERNI_VERRE, boite: [0.8, 0.5], mur: false,
    cases: [casse(4, 0, SIX), casse(4, 1, SIX), casse(4, 2, SIX), casse(4, 4, SIX)] },
  { nom: 'applique', planche: 'murale', boite: [0.8, 0.54], mur: true,
    cases: ['L4C1', 'L4C2', 'L4C3', 'L4C4'].map(ancienne) },
];

const sources = {};
for (const [nom, p] of Object.entries(PLANCHES))
  sources[nom] = { donnees: (await readFile(p.fichier)).toString('base64'), fond: p.fond };

const navigateur = await chromium.launch();
const page = await navigateur.newPage();

const { feuille, apercu, lum, couleurs } = await page.evaluate(
  async ({ sources, FAMILLES, T, VARIANTES, COULEURS }) => {
    const toile = (w, h) => {
      const t = document.createElement('canvas');
      t.width = w;
      t.height = h;
      return t;
    };

    const planches = {};
    for (const [nom, s] of Object.entries(sources)) {
      const img = new Image();
      await new Promise((ok) => {
        img.onload = ok;
        img.src = `data:image/png;base64,${s.donnees}`;
      });
      const c = toile(img.width, img.height);
      c.getContext('2d').drawImage(img, 0, 0);
      planches[nom] = { ctx: c.getContext('2d'), fond: s.fond };
    }

    /** Une case, détourée de son fond et resserrée sur son contenu. */
    const decouper = (planche, [x0, y0, x1, y1], ternir = 1) => {
      const { ctx, fond: FOND } = planches[planche];
      const W = x1 - x0;
      const H = y1 - y0;
      const d = ctx.getImageData(x0, y0, W, H);
      const p = d.data;
      let gx = W;
      let gy = H;
      let dx = -1;
      let dy = -1;
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const ecart =
            Math.abs(p[i] - FOND[0]) + Math.abs(p[i + 1] - FOND[1]) + Math.abs(p[i + 2] - FOND[2]);
          const a = Math.max(0, Math.min(1, (ecart - 10) / 22));
          if (a > 0.15) {
            // DÉMATTAGE : couleur = (observé − fond × (1 − a)) / a
            p[i] = Math.max(0, Math.min(255, (p[i] - FOND[0] * (1 - a)) / a));
            p[i + 1] = Math.max(0, Math.min(255, (p[i + 1] - FOND[1] * (1 - a)) / a));
            p[i + 2] = Math.max(0, Math.min(255, (p[i + 2] - FOND[2] * (1 - a)) / a));
          }
          p[i] *= ternir;
          p[i + 1] *= ternir;
          p[i + 2] *= ternir;
          p[i + 3] = Math.round(a * 255);
          if (a > 0.25) {
            if (x < gx) gx = x;
            if (x > dx) dx = x;
            if (y < gy) gy = y;
            if (y > dy) dy = y;
          }
        }
      if (dx < 0) throw new Error(`case vide : ${planche} ${[x0, y0, x1, y1]}`);
      const plein = toile(W, H);
      plein.getContext('2d').putImageData(d, 0, 0);
      const t = toile(dx - gx + 1, dy - gy + 1);
      t.getContext('2d').drawImage(plein, -gx, -gy);
      return t;
    };

    // --- la feuille : quatre variantes par rangée, une famille par rangée ---
    const feuilleT = toile(T * VARIANTES, T * FAMILLES.length);
    const fc = feuilleT.getContext('2d');
    fc.imageSmoothingEnabled = true;
    fc.imageSmoothingQuality = 'high';
    FAMILLES.forEach((f, r) => {
      const objets = f.cases.map((c) => decouper(f.planche, c, f.ternir));
      const [bl, bh] = f.boite;
      const ech = Math.min(...objets.map((o) => Math.min((bl * T) / o.width, (bh * T) / o.height)));
      objets.forEach((o, v) => {
        const w = Math.round(o.width * ech);
        const h = Math.round(o.height * ech);
        const x = v * T + Math.round((T - w) / 2);
        // POSÉ EN BAS DE CASE pour ce qui attend par terre, ACCROCHÉ EN HAUT
        // pour ce qui pend d'une paroi — c'est la même convention que le
        // lierre, et c'est `sol.ts` qui compte dessus.
        const y = f.mur ? r * T + Math.round(T * 0.06) : r * T + (T - h) - Math.round(T * 0.08);
        fc.drawImage(o, x, y, w, h);
      });
    });

    // --- une seule palette pour toute la planche ---
    const d = fc.getImageData(0, 0, feuilleT.width, feuilleT.height);
    const p = d.data;
    const pts = [];
    for (let i = 0; i < p.length; i += 4) if (p[i + 3] > 24) pts.push(i);
    let boites = [pts];
    while (boites.length < COULEURS) {
      let pire = -1;
      let etendue = -1;
      let canal = 0;
      for (let b = 0; b < boites.length; b++) {
        if (boites[b].length < 2) continue;
        for (let ca = 0; ca < 3; ca++) {
          let lo = 255;
          let hi = 0;
          for (const i of boites[b]) {
            const v = p[i + ca];
            if (v < lo) lo = v;
            if (v > hi) hi = v;
          }
          if (hi - lo > etendue) {
            etendue = hi - lo;
            pire = b;
            canal = ca;
          }
        }
      }
      if (pire < 0 || etendue <= 0) break;
      const b = boites[pire].slice().sort((x, y) => p[x + canal] - p[y + canal]);
      const m = b.length >> 1;
      boites.splice(pire, 1, b.slice(0, m), b.slice(m));
    }
    const palette = boites.map((b) => {
      let r = 0;
      let v = 0;
      let bl = 0;
      for (const i of b) {
        r += p[i];
        v += p[i + 1];
        bl += p[i + 2];
      }
      return [
        Math.round(r / b.length),
        Math.round(v / b.length),
        Math.round(bl / b.length),
      ];
    });
    for (const i of pts) {
      let mieux = 0;
      let dist = Infinity;
      for (let k = 0; k < palette.length; k++) {
        const dr = p[i] - palette[k][0];
        const dv = p[i + 1] - palette[k][1];
        const db = p[i + 2] - palette[k][2];
        const q = dr * dr + dv * dv + db * db;
        if (q < dist) {
          dist = q;
          mieux = k;
        }
      }
      p[i] = palette[mieux][0];
      p[i + 1] = palette[mieux][1];
      p[i + 2] = palette[mieux][2];
    }
    fc.putImageData(d, 0, 0);

    // --- le contrôle : posées sur la vraie pierre, à la taille du jeu ---
    const E = 3;
    const ap = toile(T * VARIANTES * E, T * FAMILLES.length * E);
    const ac = ap.getContext('2d');
    ac.fillStyle = '#20202e';
    ac.fillRect(0, 0, ap.width, ap.height);
    ac.imageSmoothingEnabled = false;
    ac.drawImage(feuilleT, 0, 0, ap.width, ap.height);

    // combien de valeurs, et où : c'est le chiffre qui décide si ça se lira
    let lo = 255;
    let hi = 0;
    for (const i of pts) {
      const l = Math.round(0.299 * p[i] + 0.587 * p[i + 1] + 0.114 * p[i + 2]);
      if (l < lo) lo = l;
      if (l > hi) hi = l;
    }
    return {
      feuille: feuilleT.toDataURL('image/png'),
      apercu: ap.toDataURL('image/png'),
      lum: [lo, hi],
      couleurs: palette.length,
    };
  },
  { sources, FAMILLES, T, VARIANTES, COULEURS },
);

await writeFile('public/decors.png', Buffer.from(feuille.split(',')[1], 'base64'));
await writeFile('/tmp/decors-apercu.png', Buffer.from(apercu.split(',')[1], 'base64'));
console.log(
  `écrit : public/decors.png (${T * VARIANTES}×${T * FAMILLES.length}) — ${FAMILLES.length} familles × ${VARIANTES}`,
);
console.log(`contrôle : /tmp/decors-apercu.png`);
console.log(`familles : ${FAMILLES.map((f) => f.nom).join(', ')}`);
console.log(`palette : ${couleurs} couleurs, luminance ${lum[0]}..${lum[1]} sur 255`);

await navigateur.close();

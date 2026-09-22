/**
 * LES LAMPES MORTES — le décor des Dessous, découpé depuis une planche dessinée.
 *
 * Les Dessous sont l'endroit où tombe ce qui s'est éteint. Il manquait de quoi
 * le montrer : la pierre a du lierre et de la mousse, mais rien qui dise que
 * quelqu'un est passé là avec une lampe, et que sa lampe est morte.
 *
 *   node outils/decors.mjs   → public/decors.png (+ planche de contrôle)
 *
 * LA PLANCHE EST UNE GRILLE RÉGULIÈRE de 8 × 4 panneaux de 157 px, relevée au
 * pixel. Chaque panneau porte un objet posé sur une LIGNE DE SOL dessinée, à
 * y = 132 : on coupe au-dessus, sinon le jeu hériterait d'un trait horizontal
 * sous chaque lampe, et son sol à lui est déjà dessiné.
 *
 * DEUX FONDS, contrairement à la planche de la fin : la page est à (39,37,32)
 * et l'intérieur des panneaux à (70,63,55). C'est ce dernier qu'on retire, et
 * on DÉMATTE ensuite le bord — sinon chaque objet garde un liseré brun clair
 * sur la pierre presque noire du jeu, où il se verrait bien plus que sur la
 * planche.
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

/** La grille des panneaux, relevée au pixel sur la planche. */
const COLS = [18, 190, 362, 534, 716, 888, 1060, 1233];
const RANGS = [30, 218, 406, 593];
const PAN = 156; // côté utile d'un panneau
const SOL = 129; // la ligne de sol dessinée est à 132 : on coupe DEUX PIXELS
// au-dessus, sinon son arête supérieure reste collée sous les objets qui la touchent

/**
 * CE QU'ON GARDE, et d'où ça vient.
 *
 * La planche a dérivé en cours de route : elle promettait huit familles, elle
 * en a rendu six complètes, une partielle, et un panneau corrompu (L4C8, un
 * artefact en étoile). Les étiquettes imprimées dessus sont fausses à deux
 * endroits — on découpe donc par POSITION, jamais par légende.
 *
 * `mur` distingue ce qui s'accroche de ce qui se pose : une applique pend d'une
 * paroi, tout le reste attend par terre.
 */
const FAMILLES = [
  { nom: 'lampeHuile', cases: ['L1C1', 'L1C2', 'L1C3', 'L1C4'], mur: false },
  { nom: 'chandelier', cases: ['L2C1', 'L2C2', 'L2C3', 'L2C4'], mur: false },
  // La quatrième est la seule lanterne VRAIMENT couchée de la planche : mise
  // ici, elle donne à la famille le mélange debout/tombé qu'on cherchait.
  { nom: 'lanterne', cases: ['L3C1', 'L3C2', 'L3C3', 'L1C6'], mur: false },
  // Il y avait une famille d'ampoules brisées : supprimée. À la taille d'une
  // case, un verre pâle couché sur la pierre n'a plus de silhouette lisible et
  // se lit comme un petit animal mort — un contresens franc dans un jeu dont le
  // sujet est d'avoir peur de ce qu'on devine dans le noir.
  // Deux modèles seulement, chacun rendu deux fois : on les garde tels quels
  // plutôt que d'en inventer. À une case sur cent, la répétition ne se voit pas.
  { nom: 'bougeoir', cases: ['L1C5', 'L1C7', 'L2C5', 'L2C7'], mur: false },
  // Il y avait une septième famille, des lanternes de table : supprimée. Ses
  // quatre panneaux n'étaient pas le même objet à quatre états — une grande
  // lanterne couchée et trois petites debout — et à hauteur normalisée elles
  // se lisaient comme quatre objets sans rapport.
  { nom: 'applique', cases: ['L4C1', 'L4C2', 'L4C3', 'L4C4'], mur: true },
];

/**
 * LA HAUTEUR DE CHAQUE FAMILLE dans la case, en fraction.
 *
 * Elle n'est pas la même pour toutes, et c'est tout l'intérêt : une ampoule
 * tombée est un petit objet, un chandelier en est un grand. À hauteur égale,
 * l'ampoule aurait la taille d'un candélabre et la salle n'aurait plus
 * d'échelle du tout.
 */
const HAUTEURS = {
  lampeHuile: 0.4,
  chandelier: 0.62,
  lanterne: 0.58,
  bougeoir: 0.6,
  applique: 0.54,
};

const planche = (await readFile('outils/planche-decors.png')).toString('base64');

const navigateur = await chromium.launch();
const page = await navigateur.newPage();

const { feuille, apercu, lum, couleurs } = await page.evaluate(
  async ({ planche, FAMILLES, HAUTEURS, COLS, RANGS, PAN, SOL, T, VARIANTES, COULEURS }) => {
    const FOND = [70, 63, 55]; // l'intérieur d'un panneau

    const img = new Image();
    await new Promise((ok) => {
      img.onload = ok;
      img.src = `data:image/png;base64,${planche}`;
    });
    const src = document.createElement('canvas');
    src.width = img.width;
    src.height = img.height;
    const sc = src.getContext('2d');
    sc.drawImage(img, 0, 0);

    const toile = (w, h) => {
      const t = document.createElement('canvas');
      t.width = w;
      t.height = h;
      return t;
    };

    /** Un panneau, détouré du brun et resserré sur son objet. */
    const decouper = (cle) => {
      const c = Number(cle[3]) - 1;
      const r = Number(cle[1]) - 1;
      const x0 = COLS[c];
      const y0 = RANGS[r];
      const d = sc.getImageData(x0, y0, PAN, SOL); // au-dessus de la ligne de sol
      const p = d.data;
      let gx = PAN;
      let gy = SOL;
      let dx = -1;
      let dy = -1;
      for (let y = 0; y < SOL; y++)
        for (let x = 0; x < PAN; x++) {
          const i = (y * PAN + x) * 4;
          const ecart =
            Math.abs(p[i] - FOND[0]) + Math.abs(p[i + 1] - FOND[1]) + Math.abs(p[i + 2] - FOND[2]);
          const a = Math.max(0, Math.min(1, (ecart - 10) / 22));
          if (a > 0.15) {
            // DÉMATTAGE : couleur = (observé − fond × (1 − a)) / a
            p[i] = Math.max(0, Math.min(255, (p[i] - FOND[0] * (1 - a)) / a));
            p[i + 1] = Math.max(0, Math.min(255, (p[i + 1] - FOND[1] * (1 - a)) / a));
            p[i + 2] = Math.max(0, Math.min(255, (p[i + 2] - FOND[2] * (1 - a)) / a));
          }
          p[i + 3] = Math.round(a * 255);
          if (a > 0.25) {
            if (x < gx) gx = x;
            if (x > dx) dx = x;
            if (y < gy) gy = y;
            if (y > dy) dy = y;
          }
        }
      if (dx < 0) throw new Error(`panneau vide : ${cle}`);
      const plein = toile(PAN, SOL);
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
      f.cases.forEach((cle, v) => {
        const o = decouper(cle);
        const h = Math.round(T * HAUTEURS[f.nom]);
        const w = Math.round((h * o.width) / o.height);
        const x = v * T + Math.round((T - w) / 2);
        // POSÉ EN BAS DE CASE pour ce qui attend par terre, ACCROCHÉ EN HAUT
        // pour ce qui pend d'une paroi — c'est la même convention que le
        // lierre et la mousse, et c'est `sol.ts` qui compte dessus.
        const y = f.mur ? r * T + Math.round(T * 0.06) : r * T + (T - h) - Math.round(T * 0.06);
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
  { planche, FAMILLES, HAUTEURS, COLS, RANGS, PAN, SOL, T, VARIANTES, COULEURS },
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

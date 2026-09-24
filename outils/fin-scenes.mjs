/**
 * LES QUATRE SCÈNES DE LA FIN, fabriquées depuis une planche de PIXEL ART.
 *
 * Elles étaient peintes à la main dans `rendu/quatre.ts`, en rectangles posés
 * un par un ; puis tirées d'une planche d'illustration lisse (`planche-fin.png`,
 * retirée), réduite et ramenée à quarante-huit couleurs — ce qui donnait une
 * bouillie de réduction, du « presque pixel art ». La planche actuelle,
 * `planche-fin-2.png`, est du VRAI pixel art : chaque pixel du dessin y est un
 * bloc de couleur unie, agrandi par le générateur. Il suffit donc de retrouver
 * cette grille pour avoir les sujets à leur taille d'origine, pixel pour pixel,
 * et de les poser SANS JAMAIS LES REDIMENSIONNER.
 *
 *   node outils/fin-scenes.mjs   → public/fin-scenes.png (+ planche de contrôle)
 *
 * QUATRE OPÉRATIONS, dans cet ordre.
 *
 *   0. RETROUVER LA GRILLE. Mesurée une fois pour toutes sur la planche (voir
 *      `GRILLE_PLANCHE`) : un pixel du dessin y mesure 2,93 pixels d'image,
 *      dans les deux sens. Chaque case est lue par la MÉDIANE de son intérieur
 *      — pas son centre seul, qui tombe parfois sur le fondu entre deux cases.
 *
 *   1. DÉCOUPER. Le fond est un brun uniforme ; tout ce qui s'en écarte est le
 *      sujet, et le bord est FRANC : c'est du pixel art, un pixel y est ou n'y
 *      est pas. Un brun de bois ou une ombre peuvent ressembler au fond : on ne
 *      rend donc transparent que le fond RELIÉ AU BORD de la découpe, jamais un
 *      trou au milieu d'un sujet.
 *
 *   2. METTRE EN SCÈNE, à l'échelle 1. Les sujets sont posés dans la grille
 *      du jeu (160 × 192) à des coordonnées entières, sans lissage.
 *
 *   3. ALLUMER, puis QUANTIFIER. La version allumée ne pose pas une image de
 *      lumière par-dessus : elle fait briller ce qui, dans le dessin, est du
 *      verre ou une flamme — le verre de la lanterne, le dôme de la veilleuse
 *      — et y ajoute un halo. Les huit scènes sont ensuite ramenées à une seule
 *      palette, celle de la nuit comprise : `eteindre()` et les halos
 *      fabriquent des couleurs que la planche n'avait pas.
 *
 * Comme `pwa-icones.mjs`, tout se passe dans une page Chromium : c'est un
 * outil de fabrication, il n'importe pas le TypeScript du jeu.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

/** La grille d'une scène, en pixels. Les quatre l'ont identique. */
const LARGE = 160;
const HAUT = 192;

/** Combien de couleurs on garde, pour les huit scènes ensemble. */
const COULEURS = 48;

/**
 * LA GRILLE DE LA PLANCHE : la taille d'un pixel du dessin, en pixels d'image,
 * et où tombe le bord de la première case.
 *
 * Mesurée, pas devinée : la période vient d'une transformée de Fourier de
 * l'énergie des bords colonne par colonne (et ligne par ligne) — un pic net à
 * 2,93 dans les deux sens, vingt fois au-dessus du reste. La phase est celle qui
 * fait tomber le plus d'énergie de bord sur les lignes de la grille.
 */
const GRILLE_PLANCHE = { px: 2.934, fx: 2.15, py: 2.93, fy: 2.75 };

/**
 * OÙ CHAQUE SUJET SE TROUVE, en pixels DU DESSIN (après la grille), relevé sur
 * les composantes connexes de la planche. Les boîtes sont larges d'un pixel :
 * la découpe se resserre ensuite sur le contenu.
 *
 * La planche donnait deux phares et deux barques : on garde le phare le plus
 * haut et la petite barque. Et elle donnait les sources de lumière à part
 * (bougie, ampoule, lanterne, globe), en objets entiers : seule la bougie sert,
 * posée sur la table ; les autres lampes s'allument dans leur propre verre. Le
 * globe portait en plus la marque du générateur.
 */
const ZONES = {
  'garcon-lit': [16, 28, 103, 84],
  'couple-assis': [136, 28, 115, 83],
  'homme-parapluie': [265, 21, 56, 92],
  // retourné : son bras et sa petite lanterne partent vers la gauche, et le
  // piéton peut passer SOUS la grande sans que la petite lui barre la poitrine
  'mat-reverbere': [340, 13, 39, 117, 'miroir'],
  'tour-phare': [387, 17, 38, 113],
  bougie: [442, 15, 16, 33],
  pecheur: [81, 147, 41, 65],
  'rochers-tas': [142, 142, 104, 47],
  'barque-vide': [259, 163, 79, 26],
  veilleuse: [355, 159, 27, 30],
  'texture-paves': [269, 214, 59, 29],
  'eau-vagues': [342, 214, 58, 28],
};

/**
 * LA MISE EN SCÈNE DES QUATRE.
 *
 * `fond` et `sol` posent la pièce ou le dehors ; `pose` place les sujets, à
 * l'échelle 1, de l'arrière vers l'avant. `feu` dit ce qui brille dans la
 * version allumée : un sujet déjà posé, une zone de ce sujet (en pixels du
 * sujet), le seuil de clarté au-dessus duquel un pixel est du verre ou une
 * flamme, et le rayon du halo. `foyer` est le pixel exact où la lumière brûle :
 * c'est lui que le fil vient toucher, et c'est `quatre.ts` qui le relit.
 *
 * LA ZONE SÛRE. `dessinerScene` cadre en « cover » : ce qui dépasse de la case
 * est coupé, et la case change de forme du téléphone au bureau. Mesuré sur les
 * deux extrêmes, un téléphone droit ne laisse voir que x 32..128 et un écran
 * 16/9 que y 51..141. Tout ce qui porte le sens d'un plan — un visage, une
 * lampe, et surtout le FOYER — doit tenir dans x 34..126 ET y 55..138.
 */
const SCENES = [
  {
    nom: 'chambre',
    fond: '#6f5c45', // le mur
    sol: [150, '#4d4030'], // le plancher, à partir de cette ligne
    pose: [
      ['garcon-lit', 4, 68],
      // à même le plancher, au pied du lit : une veilleuse par terre reste
      // une veilleuse, et elle tombe dans la zone sûre
      ['veilleuse', 96, 124],
    ],
    feu: { sujet: 'veilleuse', zone: [0, 0, 27, 17], seuil: 110, halo: 30 },
    foyer: [109, 132],
  },
  {
    nom: 'repas',
    fond: '#6f5c45',
    sol: [150, '#4d4030'],
    pose: [
      ['couple-assis', 22, 68],
      // la bougie, sur la table, entre eux deux
      ['bougie', 72, 74],
    ],
    feu: { sujet: 'bougie', zone: [0, 0, 16, 16], seuil: 120, halo: 26 },
    foyer: [80, 80],
  },
  {
    nom: 'rue',
    fond: '#141b30', // le ciel
    solTuile: [150, 'texture-paves', '#5e5447'], // le trottoir
    pose: [
      // le pied du mât enfoncé dans le trottoir : la lanterne descend ainsi
      // dans la zone sûre au lieu d'être coupée par le haut sur écran large
      ['mat-reverbere', 34, 46],
      // SOUS la lanterne, pas à côté : c'est tout le sujet du plan
      ['homme-parapluie', 58, 70],
    ],
    feu: { sujet: 'mat-reverbere', zone: [17, 0, 20, 26], seuil: 100, halo: 30 },
    foyer: [59, 63],
  },
  {
    nom: 'large',
    fond: '#141b30',
    solTuile: [132, 'eau-vagues', '#2c3552'], // la mer
    pose: [
      ['barque-vide', 84, 150],
      ['rochers-tas', 4, 120],
      ['tour-phare', 30, 40],
      // DEBOUT SUR LES ROCHERS, et le phare le balaye en passant : quelqu'un
      // est éclairé sans l'avoir demandé
      ['pecheur', 86, 88],
    ],
    feu: { sujet: 'tour-phare', zone: [0, 0, 38, 30], seuil: 100, halo: 26 },
    foyer: [50, 58],
  },
];

const planche = (await readFile('outils/planche-fin-2.png')).toString('base64');

const navigateur = await chromium.launch();
const page = await navigateur.newPage();

const { feuille, apercu, sujets, palette, poses } = await page.evaluate(
  async ({ planche, GRILLE_PLANCHE, ZONES, SCENES, LARGE, HAUT, COULEURS }) => {
    const img = new Image();
    await new Promise((ok) => {
      img.onload = ok;
      img.src = `data:image/png;base64,${planche}`;
    });
    const source = document.createElement('canvas');
    source.width = img.width;
    source.height = img.height;
    const sc = source.getContext('2d');
    sc.drawImage(img, 0, 0);
    const brut = sc.getImageData(0, 0, img.width, img.height).data;

    const toile = (w, h) => {
      const t = document.createElement('canvas');
      t.width = w;
      t.height = h;
      return t;
    };

    // --- 0. RETROUVER LA GRILLE ---
    const { px, fx, py, fy } = GRILLE_PLANCHE;
    const NX = Math.floor((img.width - fx) / px);
    const NY = Math.floor((img.height - fy) / py);
    const natif = new Uint8ClampedArray(NX * NY * 4);
    const mediane = (v) => {
      v.sort((a, b) => a - b);
      return v[v.length >> 1];
    };
    for (let j = 0; j < NY; j++)
      for (let i = 0; i < NX; i++) {
        // l'intérieur de la case, sans ses bords fondus
        const x0 = Math.ceil(fx + i * px + 0.4);
        const x1 = Math.floor(fx + (i + 1) * px - 0.4);
        const y0 = Math.ceil(fy + j * py + 0.4);
        const y1 = Math.floor(fy + (j + 1) * py - 0.4);
        const r = [];
        const v = [];
        const b = [];
        for (let y = y0; y < Math.max(y1, y0 + 1); y++)
          for (let x = x0; x < Math.max(x1, x0 + 1); x++) {
            const k = (y * img.width + x) * 4;
            r.push(brut[k]);
            v.push(brut[k + 1]);
            b.push(brut[k + 2]);
          }
        const o = (j * NX + i) * 4;
        natif[o] = mediane(r);
        natif[o + 1] = mediane(v);
        natif[o + 2] = mediane(b);
        natif[o + 3] = 255;
      }
    // le fond : la médiane d'un coin vide
    const coin = [[], [], []];
    for (let y = 0; y < 6; y++)
      for (let x = 0; x < 6; x++)
        for (let c = 0; c < 3; c++) coin[c].push(natif[(y * NX + x) * 4 + c]);
    const FOND = coin.map(mediane);

    // --- 1. DÉCOUPER ---
    const SEUIL = 22;
    const decoupes = {};
    for (const [nom, [zx, zy, zw, zh, miroir]] of Object.entries(ZONES)) {
      const d = new ImageData(zw, zh);
      const p = d.data;
      const fondLike = new Uint8Array(zw * zh);
      for (let y = 0; y < zh; y++)
        for (let x = 0; x < zw; x++) {
          const k = ((zy + y) * NX + zx + x) * 4;
          const o = (y * zw + x) * 4;
          for (let c = 0; c < 4; c++) p[o + c] = natif[k + c];
          const ecart =
            Math.abs(p[o] - FOND[0]) + Math.abs(p[o + 1] - FOND[1]) + Math.abs(p[o + 2] - FOND[2]);
          fondLike[y * zw + x] = ecart <= SEUIL ? 1 : 0;
        }
      // seul le fond RELIÉ AU BORD devient transparent
      const dehors = new Uint8Array(zw * zh);
      const pile = [];
      for (let x = 0; x < zw; x++) pile.push(x, (zh - 1) * zw + x);
      for (let y = 0; y < zh; y++) pile.push(y * zw, y * zw + zw - 1);
      while (pile.length) {
        const q = pile.pop();
        if (dehors[q] || !fondLike[q]) continue;
        dehors[q] = 1;
        const x = q % zw;
        const y = (q - x) / zw;
        if (x > 0) pile.push(q - 1);
        if (x < zw - 1) pile.push(q + 1);
        if (y > 0) pile.push(q - zw);
        if (y < zh - 1) pile.push(q + zw);
      }
      let x0b = zw;
      let y0b = zh;
      let x1b = -1;
      let y1b = -1;
      for (let q = 0; q < zw * zh; q++) {
        if (dehors[q]) {
          p[q * 4 + 3] = 0;
          continue;
        }
        const x = q % zw;
        const y = (q - x) / zw;
        if (x < x0b) x0b = x;
        if (x > x1b) x1b = x;
        if (y < y0b) y0b = y;
        if (y > y1b) y1b = y;
      }
      if (x1b < 0) throw new Error(`zone vide : ${nom}`);
      const plein = toile(zw, zh);
      plein.getContext('2d').putImageData(d, 0, 0);
      const t = toile(x1b - x0b + 1, y1b - y0b + 1);
      const tc = t.getContext('2d');
      if (miroir) {
        tc.translate(t.width, 0);
        tc.scale(-1, 1);
      }
      tc.drawImage(plein, -x0b, -y0b);
      decoupes[nom] = t;
    }

    // --- 2. METTRE EN SCÈNE, à l'échelle 1 ---
    const poser = (c, nom, x, y) => {
      c.imageSmoothingEnabled = false;
      c.drawImage(decoupes[nom], x, y);
    };

    const bases = SCENES.map((s) => {
      const t = toile(LARGE, HAUT);
      const c = t.getContext('2d');
      c.fillStyle = s.fond;
      c.fillRect(0, 0, LARGE, HAUT);
      if (s.sol) {
        c.fillStyle = s.sol[1];
        c.fillRect(0, s.sol[0], LARGE, HAUT - s.sol[0]);
        c.fillStyle = 'rgba(23,18,32,0.85)'; // la ligne du sol
        c.fillRect(0, s.sol[0], LARGE, 1);
      }
      if (s.solTuile) {
        const [y0, nom, plat] = s.solTuile;
        c.fillStyle = plat;
        c.fillRect(0, y0, LARGE, HAUT - y0);
        // on jette le liseré de la tuile : c'est lui qui ferait le joint
        const tu = decoupes[nom];
        const M = 1;
        const tw = tu.width - M * 2;
        const th = tu.height - M * 2;
        c.imageSmoothingEnabled = false;
        let rang = 0;
        for (let y = y0; y < HAUT; y += th, rang++) {
          const dec = (rang % 2) * Math.round(tw / 2);
          for (let x = -dec; x < LARGE; x += tw) c.drawImage(tu, M, M, tw, th, x, y, tw, th);
        }
      }
      for (const [nom, x, y] of s.pose) poser(c, nom, x, y);
      return t;
    });

    /** LA NUIT D'UNE COULEUR, la formule du jeu : tout glisse vers le même
     *  bleu très sombre, en gardant un peu plus de ce qui est déjà clair. */
    const eteindre = (t) => {
      const o = toile(t.width, t.height);
      const oc = o.getContext('2d');
      oc.drawImage(t, 0, 0);
      const d = oc.getImageData(0, 0, t.width, t.height);
      const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const clair = (p[i] + p[i + 1] + p[i + 2]) / 765;
        const k = 0.1 + clair * 0.16;
        p[i] = Math.round(p[i] * k + 17 * (1 - k));
        p[i + 1] = Math.round(p[i + 1] * k + 23 * (1 - k));
        p[i + 2] = Math.round(p[i + 2] * k + 46 * (1 - k));
      }
      oc.putImageData(d, 0, 0);
      return o;
    };

    /**
     * ALLUMER : ce qui est du verre ou une flamme brille, et un halo chaud
     * l'entoure. Le verre de la planche est gris — une lanterne ÉTEINTE, comme
     * demandé — : on garde sa forme et on la rend chaude, d'autant plus que le
     * pixel était clair. Le halo est un dégradé, que la quantification finale
     * ramène en paliers : c'est ainsi que le pixel art dessine une lueur.
     */
    const CHAUD = [255, 196, 118];
    const allumer = (base, s) => {
      const t = toile(LARGE, HAUT);
      const c = t.getContext('2d');
      c.drawImage(base, 0, 0);
      const [, sx, sy] = s.pose.find((q) => q[0] === s.feu.sujet);
      const [zx, zy, zw, zh] = s.feu.zone;
      const [fxx, fyy] = s.foyer;
      c.save();
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(fxx, fyy, 0, fxx, fyy, s.feu.halo);
      g.addColorStop(0, 'rgba(255,196,118,0.34)');
      g.addColorStop(0.5, 'rgba(255,170,90,0.12)');
      g.addColorStop(1, 'rgba(255,160,80,0)');
      c.fillStyle = g;
      c.fillRect(fxx - s.feu.halo, fyy - s.feu.halo, s.feu.halo * 2, s.feu.halo * 2);
      c.restore();
      const d = c.getImageData(0, 0, LARGE, HAUT);
      const p = d.data;
      const sujet = decoupes[s.feu.sujet].getContext('2d').getImageData(zx, zy, zw, zh).data;
      for (let y = 0; y < zh; y++)
        for (let x = 0; x < zw; x++) {
          const q = (y * zw + x) * 4;
          if (sujet[q + 3] < 128) continue;
          const lum = 0.3 * sujet[q] + 0.59 * sujet[q + 1] + 0.11 * sujet[q + 2];
          if (lum < s.feu.seuil) continue;
          const k = Math.min(1, (lum - s.feu.seuil) / (255 - s.feu.seuil) + 0.35);
          const X = sx + zx + x;
          const Y = sy + zy + y;
          if (X < 0 || Y < 0 || X >= LARGE || Y >= HAUT) continue;
          const o = (Y * LARGE + X) * 4;
          for (let ca = 0; ca < 3; ca++)
            p[o + ca] = Math.round(p[o + ca] * (1 - k) + Math.min(255, CHAUD[ca] + 40 * k) * k);
        }
      c.putImageData(d, 0, 0);
      return t;
    };

    const nuits = bases.map(eteindre);
    const jours = bases.map((b, i) => allumer(b, SCENES[i]));

    // --- la feuille : quatre colonnes, la nuit en haut, le jour en bas ---
    const feuilleT = toile(LARGE * 4, HAUT * 2);
    const fc = feuilleT.getContext('2d');
    for (let i = 0; i < 4; i++) {
      fc.drawImage(nuits[i], i * LARGE, 0);
      fc.drawImage(jours[i], i * LARGE, HAUT);
    }

    // --- 3. QUANTIFIER : une seule palette pour les huit scènes ---
    const d = fc.getImageData(0, 0, feuilleT.width, feuilleT.height);
    const p = d.data;
    const pts = [];
    for (let i = 0; i < p.length; i += 4) if (p[i + 3] > 8) pts.push(i);

    // médiane itérative : on coupe toujours la boîte la plus étalée, sur son
    // canal le plus étalé, à sa médiane
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
      return [Math.round(r / b.length), Math.round(v / b.length), Math.round(bl / b.length)];
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

    // --- la planche de contrôle : les huit scènes agrandies, comme en jeu ---
    const E = 3;
    const ap = toile(LARGE * 4 * E, HAUT * 2 * E);
    const ac = ap.getContext('2d');
    ac.imageSmoothingEnabled = false; // au plus proche voisin, comme le jeu
    ac.drawImage(feuilleT, 0, 0, ap.width, ap.height);
    // la zone sûre, et le foyer de chacune
    ac.lineWidth = 1;
    for (let i = 0; i < 4; i++)
      for (const dy of [0, HAUT]) {
        ac.strokeStyle = 'rgba(0,255,120,0.5)';
        ac.strokeRect((i * LARGE + 34) * E, (dy + 55) * E, 92 * E, 83 * E);
        const [fx2, fy2] = SCENES[i].foyer;
        ac.strokeStyle = '#ff00ff';
        ac.beginPath();
        ac.arc((i * LARGE + fx2) * E + E / 2, (dy + fy2) * E + E / 2, 6, 0, Math.PI * 2);
        ac.stroke();
      }

    // les sujets découpés, pour vérifier la découpe
    const larg = Object.values(decoupes).reduce((a, t) => a + t.width + 4, 0);
    const haut = Math.max(...Object.values(decoupes).map((t) => t.height));
    const su = toile(larg * 3, haut * 3);
    const suc = su.getContext('2d');
    suc.fillStyle = '#ff00ff';
    suc.fillRect(0, 0, su.width, su.height);
    suc.imageSmoothingEnabled = false;
    let x = 0;
    const poses = {};
    for (const [nom, t] of Object.entries(decoupes)) {
      suc.drawImage(t, x * 3, 0, t.width * 3, t.height * 3);
      poses[nom] = [t.width, t.height];
      x += t.width + 4;
    }

    return {
      feuille: feuilleT.toDataURL('image/png'),
      apercu: ap.toDataURL('image/png'),
      sujets: su.toDataURL('image/png'),
      palette,
      poses,
    };
  },
  { planche, GRILLE_PLANCHE, ZONES, SCENES, LARGE, HAUT, COULEURS },
);

await writeFile('public/fin-scenes.png', Buffer.from(feuille.split(',')[1], 'base64'));
await writeFile('/tmp/fin-apercu.png', Buffer.from(apercu.split(',')[1], 'base64'));
await writeFile('/tmp/fin-sujets.png', Buffer.from(sujets.split(',')[1], 'base64'));
console.log(`écrit : public/fin-scenes.png (${LARGE * 4}×${HAUT * 2})`);
console.log(`contrôle : /tmp/fin-apercu.png, /tmp/fin-sujets.png — ${palette.length} couleurs`);
console.log(`sujets : ${Object.entries(poses).map(([n, [w, h]]) => `${n} ${w}×${h}`).join(', ')}`);
console.log(`foyers : ${SCENES.map((s) => `${s.nom} ${s.foyer}`).join(', ')}`);

await navigateur.close();

/**
 * LE GARDE-FOU. Le foyer de chaque scène est écrit DEUX FOIS : ici, où la
 * lampe est posée, et dans `rendu/quatre.ts`, où le masque s'ouvre et où le
 * fil de la lumière se rend. C'est précisément la dérive que le jeu s'était
 * déjà prise une fois — « écrit deux fois, ça dérivait dès qu'on déplaçait un
 * lit ». On ne peut pas la supprimer sans générer du TypeScript ; on peut la
 * rendre impossible à rater.
 */
const ts = await readFile('src/rendu/quatre.ts', 'utf8');
const bloc = ts.split('export const FOYER')[1]?.split('];')[0] ?? '';
const lus = [...bloc.matchAll(/\[\s*(\d+)\s*,\s*(\d+)\s*\]/g)].map((m) => [+m[1], +m[2]]);
const dur = SCENES.map((s) => s.foyer);
const pareils =
  lus.length === dur.length && dur.every((f, i) => f[0] === lus[i][0] && f[1] === lus[i][1]);
if (pareils) {
  console.log('foyers : rendu/quatre.ts est d’accord.');
} else {
  console.error(
    `\nATTENTION — rendu/quatre.ts n’est plus d’accord sur les foyers.\n` +
      `  ici            : ${JSON.stringify(dur)}\n` +
      `  dans quatre.ts : ${JSON.stringify(lus)}\n` +
      `Recopie-les dans FOYER, et recale masque() et VOLUME dessus :\n` +
      `sans quoi la lumière s’ouvre à un endroit et la lampe brûle à un autre.`,
  );
  process.exitCode = 1;
}

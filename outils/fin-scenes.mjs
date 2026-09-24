/**
 * LES QUATRE SCÈNES DE LA FIN, fabriquées depuis une planche dessinée.
 *
 * Elles étaient peintes à la main dans `rendu/quatre.ts`, en rectangles posés
 * un par un. C'était la seule façon d'en avoir, mais un lit en rectangles
 * reste un lit en rectangles. La planche `planche-fin.png` donne les mêmes
 * quatre sujets dessinés : un garçon au lit, un couple à table, un piéton sous
 * un réverbère, un phare — plus les sources de lumière, les tuiles et les
 * effets, chacun isolé.
 *
 *   node outils/fin-scenes.mjs   → public/fin-scenes.png (+ planche de contrôle)
 *
 * TROIS OPÉRATIONS, dans cet ordre.
 *
 *   1. DÉCOUPER. Le fond de la planche est un brun uniforme : l'alpha se
 *      déduit de l'écart à ce brun. On DÉMATTE ensuite — on retire du bord la
 *      part de brun qui s'y est mélangée — sinon chaque sujet garde un liseré
 *      marron une fois posé sur le noir du jeu.
 *
 *   2. METTRE EN SCÈNE. Les sujets sont isolés ; les scènes, non. Chacune se
 *      compose ici dans la grille du jeu (160 × 192) : un fond, un sol, puis
 *      les sujets à leur place. La version ALLUMÉE ajoute les sources en
 *      `lighter` ; la version ÉTEINTE passe la même base par `eteindre()`,
 *      la formule du jeu — une chambre dans le noir n'est pas une chambre
 *      jaune atténuée, c'est une chambre bleue.
 *
 *   3. QUANTIFIER. La planche a quarante mille couleurs et aucune grille de
 *      pixels : c'est une illustration lisse, pas du pixel art, et posée
 *      telle quelle à côté du tileset des souterrains ça se voit. Réduites à
 *      la grille du jeu puis ramenées à QUARANTE-HUIT couleurs (médiane
 *      itérative sur les huit scènes À LA FOIS, donc une seule palette pour
 *      les quatre), elles redeviennent du pixel art.
 *
 * Comme `pwa-icones.mjs`, tout se passe dans une page Chromium : c'est un
 * outil de fabrication, il n'importe pas le TypeScript du jeu.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

/** La grille d'une scène, en pixels. Les quatre l'ont maintenant identique :
 *  la chambre était déjà à cette taille, et les sujets dessinés y tombent
 *  presque à l'échelle 1:1, donc sans bouillie de réduction. */
const LARGE = 160;
const HAUT = 192;

/** Combien de couleurs on garde. Quarante-huit : assez pour que le bois reste
 *  du bois, assez peu pour que les aplats se voient. */
const COULEURS = 48;

/**
 * OÙ CHAQUE SUJET SE TROUVE DANS LA PLANCHE, relevé à la main.
 *
 * `additif` distingue deux choses qui ne se découpent pas pareil : un meuble a
 * un bord et se détoure ; une flamme n'a pas de bord, elle s'ajoute à ce qu'il
 * y a derrière. Pour celles-là on garde l'excès de lumière au-dessus du fond
 * et on les dessine en `lighter` — le brun de la planche s'annule alors
 * exactement. C'est déjà la grammaire du jeu : halo, cône et floraison
 * passent tous par `lighter`.
 */
const ZONES = {
  // les sujets « neutres », sans ombrage de lumière directe : c'est la bonne
  // base, celle qu'on peut éteindre OU allumer
  'garcon-lit': [26, 94, 213, 250, 0],
  'couple-assis': [239, 93, 426, 250, 0],
  'homme-parapluie': [474, 55, 578, 250, 0],
  pecheur: [635, 94, 732, 250, 0],
  // le mobilier et les décors
  'mat-reverbere': [513, 356, 574, 552, 0],
  'tour-phare': [643, 360, 709, 552, 0],
  veilleuse: [43, 588, 100, 648, 0],
  'rochers-tas': [269, 578, 446, 665, 0],
  'barque-vide': [465, 600, 629, 652, 0],
  'texture-paves': [655, 590, 737, 655, 0],
  'eau-vagues': [539, 1236, 632, 1334, 0],
  // les sources, additives
  'feu-flamme': [55, 807, 79, 850, 1],
  'feu-ampoule': [117, 782, 222, 870, 1],
  'feu-lanterne-rue': [248, 779, 312, 872, 1],
  'feu-lanterne-phare': [348, 778, 415, 872, 1],
};

/**
 * LA MISE EN SCÈNE DES QUATRE.
 *
 * `fond` et `sol` posent la pièce ou le dehors ; `pose` place les sujets dans
 * l'ordre du tracé, de l'arrière vers l'avant. `feu` est la source, ajoutée
 * seulement à la version allumée, et `foyer` le pixel exact où elle brûle —
 * c'est lui que le fil de la lumière vient toucher, et c'est `quatre.ts` qui
 * le relit. Une seule source de vérité : si on déplace un lit, le fil suit.
 *
 * Les deux scènes que la planche ne cadrait pas comme le jeu les racontait
 * sont REMISES EN SCÈNE avec ce qu'elle donne : le garçon reste couché et sa
 * veilleuse est posée à même le plancher (il n'y a pas de table de chevet
 * dessinée) ; et au large, le pêcheur est DEBOUT SUR LES ROCHERS que le phare
 * balaye, au lieu d'un marin assis dans la barque — la barque est là, vide,
 * tirée au sec. Le sens de chaque plan tient : quelqu'un est éclairé sans
 * l'avoir demandé, et ne saura jamais par qui.
 *
 * LA ZONE SÛRE. `dessinerScene` cadre en « cover » : la scène est agrandie
 * jusqu'à REMPLIR sa case, donc ce qui dépasse est coupé — et la case fait la
 * moitié de l'écran, dont la forme change du téléphone au bureau. Sur un
 * téléphone tenu droit, on perd une trentaine de pixels de chaque CÔTÉ ; sur un
 * écran large, une quarantaine en HAUT et en BAS.
 *
 * Mesuré sur les deux formes extrêmes : un téléphone droit (430 × 860) ne
 * laisse voir que x 32..128, et un écran 16/9 que y 51..141. Tout ce qui porte
 * le sens d'un plan — un visage, une lampe, et surtout le FOYER — doit donc
 * tenir dans x 34..126 ET y 55..138. Les fonds, eux, vont jusqu'au bord :
 * c'est même pour ça qu'on cadre en « cover » plutôt qu'en « contain », qui
 * laisserait la mer s'arrêter net au milieu du noir.
 *
 * Deux versions s'y sont cassées : la première posait la veilleuse à x 128, et
 * sur téléphone elle était hors champ — la chambre s'allumait donc sans qu'on
 * voie par quoi. La seconde plaçait les deux lanternes à y 46, et sur écran
 * large elles étaient coupées par le haut du cadre.
 */
const SCENES = [
  {
    nom: 'chambre',
    fond: '#6f5c45', // le mur
    sol: [150, '#4d4030'], // le plancher, à partir de cette ligne
    pose: [
      ['garcon-lit', 8, 66, 110],
      // à même le plancher, devant le pied du lit : la planche ne dessine pas
      // de table de chevet, et une veilleuse par terre reste une veilleuse
      ['veilleuse', 98, 126, 24],
    ],
    feu: ['feu-ampoule', 93, 120, 34],
    foyer: [110, 134],
  },
  {
    nom: 'repas',
    fond: '#6f5c45',
    sol: [150, '#4d4030'],
    // resserré pour que LES DEUX VISAGES tiennent dans la zone sûre : à
    // pleine largeur, le téléphone coupait un profil sur deux
    pose: [['couple-assis', 15, 49, 130]],
    feu: ['feu-flamme', 74, 70, 14],
    foyer: [81, 82],
  },
  {
    nom: 'rue',
    fond: '#141b30', // le ciel
    solTuile: [150, 'texture-paves', 0.5, '#5e5447'], // le trottoir
    pose: [
      ['mat-reverbere', 82, 24, 45],
      // SOUS la colonne de lumière, pas à côté : c'est tout le sujet du plan
      // — personne ne lui a rien demandé et il ne saura jamais qu'il a été
      // éclairé. À x = 36, il marchait encore au bord du cône, le parapluie
      // dans le noir : on ne lisait que ses jambes. Collé au mât, il est en
      // entier dans la lumière qui tombe.
      ['homme-parapluie', 58, 72, 46],
    ],
    // le verre de la lanterne haute, mesuré dans le sujet : y 26..58 sur 196,
    // donc bien plus bas que le sommet du mât — le foyer posé trop haut
    // faisait briller le ciel au-dessus de la lampe
    feu: ['feu-lanterne-rue', 86, 38, 24],
    foyer: [98, 55],
  },
  {
    nom: 'large',
    fond: '#141b30',
    solTuile: [132, 'eau-vagues', 0.5, '#2c3552'], // la mer
    pose: [
      ['rochers-tas', 6, 96, 118],
      ['tour-phare', 34, 36, 41],
      ['barque-vide', 76, 152, 52],
      // DEBOUT SUR LES ROCHERS, et non assis dans la barque : la planche ne
      // dessine pas de marin embarqué, et un pêcheur que le phare balaye dit
      // la même chose — quelqu'un est éclairé sans l'avoir demandé
      ['pecheur', 92, 88, 32],
    ],
    feu: ['feu-lanterne-phare', 44, 39, 22],
    foyer: [55, 54],
  },
];

const planche = (await readFile('outils/planche-fin.png')).toString('base64');

const navigateur = await chromium.launch();
const page = await navigateur.newPage();

const { feuille, apercu, palette } = await page.evaluate(
  async ({ planche, ZONES, SCENES, LARGE, HAUT, COULEURS }) => {
    const FOND = [51.8, 46.9, 43.0]; // le brun de la planche

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

    const toile = (w, h) => {
      const t = document.createElement('canvas');
      t.width = w;
      t.height = h;
      return t;
    };

    // --- 1. DÉCOUPER ---
    const decoupes = {};
    for (const [nom, [x0, y0, x1, y1, additif]] of Object.entries(ZONES)) {
      const w = x1 - x0;
      const h = y1 - y0;
      const d = sc.getImageData(x0, y0, w, h);
      const p = d.data;
      for (let i = 0; i < p.length; i += 4) {
        const r = p[i];
        const v = p[i + 1];
        const b = p[i + 2];
        if (additif) {
          // la lumière EN TROP par rapport au fond : dessinée en `lighter`,
          // elle retombe juste sur n'importe quel fond
          p[i] = Math.max(0, r - FOND[0]);
          p[i + 1] = Math.max(0, v - FOND[1]);
          p[i + 2] = Math.max(0, b - FOND[2]);
          p[i + 3] = 255;
        } else {
          const ecart =
            Math.abs(r - FOND[0]) + Math.abs(v - FOND[1]) + Math.abs(b - FOND[2]);
          const a = Math.max(0, Math.min(1, (ecart - 12) / 26));
          // DÉMATTAGE : couleur = (observé − fond × (1 − a)) / a
          if (a > 0.15) {
            p[i] = Math.max(0, Math.min(255, (r - FOND[0] * (1 - a)) / a));
            p[i + 1] = Math.max(0, Math.min(255, (v - FOND[1] * (1 - a)) / a));
            p[i + 2] = Math.max(0, Math.min(255, (b - FOND[2] * (1 - a)) / a));
          }
          p[i + 3] = Math.round(a * 255);
        }
      }
      // RESSERRER SUR LE CONTENU. Les zones sont relevées à la main, donc
      // larges : sans ce recadrage, un mât de réverbère de dix-sept pixels
      // flotte au milieu d'une boîte vide de cent cinquante, et quand on le
      // pose « à quarante-cinq pixels de large » c'est la BOÎTE qui fait
      // quarante-cinq — le mât, lui, en fait six et n'est plus visible.
      let x0b = w;
      let y0b = h;
      let x1b = -1;
      let y1b = -1;
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4;
          const vu = additif
            ? Math.max(p[i], p[i + 1], p[i + 2]) > 6
            : p[i + 3] > 16;
          if (!vu) continue;
          if (x < x0b) x0b = x;
          if (x > x1b) x1b = x;
          if (y < y0b) y0b = y;
          if (y > y1b) y1b = y;
        }
      if (x1b < 0) throw new Error(`zone vide : ${nom}`);
      const plein = toile(w, h);
      plein.getContext('2d').putImageData(d, 0, 0);
      const t = toile(x1b - x0b + 1, y1b - y0b + 1);
      t.getContext('2d').drawImage(plein, -x0b, -y0b);
      decoupes[nom] = t;
    }

    // --- 2. METTRE EN SCÈNE ---
    /** Poser un sujet à une largeur voulue, hauteur déduite : on ne déforme
     *  jamais, un sujet étiré n'est plus le même sujet. */
    const poser = (c, nom, x, y, large, mode) => {
      const s = decoupes[nom];
      const h = Math.round((large * s.height) / s.width);
      c.save();
      c.imageSmoothingEnabled = true;
      c.imageSmoothingQuality = 'high';
      if (mode) c.globalCompositeOperation = mode;
      c.drawImage(s, x, y, large, h);
      c.restore();
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
        const [y0, nom, ech, plat] = s.solTuile;
        // un aplat DESSOUS : une tuile qui ne tombe pas juste laisserait
        // voir le ciel entre deux pavés, et un trottoir troué ne se lit plus
        c.fillStyle = plat;
        c.fillRect(0, y0, LARGE, HAUT - y0);
        const tu = decoupes[nom];
        const M = 3; // on jette le bord adouci de la découpe : c'est lui le joint
        const sw = tu.width - M * 2;
        const sh = tu.height - M * 2;
        const tw = Math.max(1, Math.round(sw * ech));
        const th = Math.max(1, Math.round(sh * ech));
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = 'high';
        let rang = 0;
        for (let y = y0; y < HAUT; y += th, rang++) {
          // DÉCALÉ D'UN RANG À L'AUTRE : aligné, le motif se lit comme un
          // damier et on ne voit plus que la répétition
          const dec = (rang % 2) * Math.round(tw / 2);
          for (let x = -dec; x < LARGE; x += tw)
            c.drawImage(tu, M, M, sw, sh, x, y, tw, th);
        }
      }
      for (const [nom, x, y, large] of s.pose) poser(c, nom, x, y, large);
      return t;
    });

    /** LA NUIT D'UNE COULEUR, la formule du jeu : tout glisse vers le même
     *  bleu très sombre, en gardant un peu plus de ce qui est déjà clair —
     *  sinon les draps et le plancher deviennent la même chose. */
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

    const nuits = bases.map(eteindre);
    const jours = bases.map((b, i) => {
      const t = toile(LARGE, HAUT);
      const c = t.getContext('2d');
      c.drawImage(b, 0, 0);
      const [nom, x, y, large] = SCENES[i].feu;
      poser(c, nom, x, y, large, 'lighter');
      return t;
    });

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

    // --- la planche de contrôle : les huit scènes agrandies, comme en jeu ---
    const E = 2;
    const ap = toile(LARGE * 4 * E, HAUT * 2 * E);
    const ac = ap.getContext('2d');
    ac.fillStyle = '#08080e';
    ac.fillRect(0, 0, ap.width, ap.height);
    ac.imageSmoothingEnabled = false; // au plus proche voisin, comme le jeu
    ac.drawImage(feuilleT, 0, 0, ap.width, ap.height);
    // le foyer de chacune, pointé : c'est là que le fil de la lumière arrive
    ac.strokeStyle = '#ff00ff';
    for (let i = 0; i < 4; i++) {
      const [fx, fy] = SCENES[i].foyer;
      for (const dy of [0, HAUT]) {
        ac.beginPath();
        ac.arc((i * LARGE + fx) * E, (dy + fy) * E, 5, 0, Math.PI * 2);
        ac.stroke();
      }
    }

    return {
      feuille: feuilleT.toDataURL('image/png'),
      apercu: ap.toDataURL('image/png'),
      palette,
    };
  },
  { planche, ZONES, SCENES, LARGE, HAUT, COULEURS },
);

await writeFile('public/fin-scenes.png', Buffer.from(feuille.split(',')[1], 'base64'));
await writeFile('/tmp/fin-apercu.png', Buffer.from(apercu.split(',')[1], 'base64'));
console.log(`écrit : public/fin-scenes.png (${LARGE * 4}×${HAUT * 2})`);
console.log(`contrôle : /tmp/fin-apercu.png — ${palette.length} couleurs`);
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

/**
 * LES ICÔNES DE LA PWA.
 *
 * Pas d'image importée : Falot lui-même, dessiné avec les MÊMES formules que
 * `rendu/visages.ts` — le même corps aux coins ronds, le même dégradé, le
 * même visage inquiet, celui qu'on voit le plus dans le jeu (« je n'ai rien
 * demandé à être ici »). L'icône de l'application doit être lui, pas un logo
 * qu'on aurait inventé à côté.
 *
 * Une seule image, taillée à 46 % du cadre : son contour tient largement dans
 * le disque de sécurité des icônes « maskable » (80 % du cadre, donc un rayon
 * de 40 % depuis le centre — son coin le plus loin n'est qu'à 32 %). Une seule
 * planche sert donc pour les deux usages, « any » et « maskable ».
 *
 *   node outils/pwa-icones.mjs   → public/icons/*.png, public/favicon.png
 *
 * Comme `atlas-temoin.mjs`, tout est redessiné ici en JavaScript brut : c'est
 * un outil de fabrication, il n'a pas à importer le TypeScript du jeu.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const FOND = '#08080e'; // le noir du jeu : le même partout, canevas compris
const BLEU = '#8fd0ff'; // Falot ne change jamais de couleur

const navigateur = await chromium.launch();
const page = await navigateur.newPage();

const { maitresse } = await page.evaluate(
  ({ FOND, BLEU }) => {
    const MAITRE = 1024;
    const t = document.createElement('canvas');
    t.width = MAITRE;
    t.height = MAITRE;
    const c = t.getContext('2d');
    const cx = MAITRE / 2,
      cy = MAITRE / 2;

    const melange = (hex, vers, k) => {
      const n = Number.parseInt(hex.slice(1), 16);
      const v = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((x) =>
        Math.round(x + (vers - x) * k),
      );
      return `rgb(${v[0]},${v[1]},${v[2]})`;
    };
    const eclaircir = (hex, k) => melange(hex, 255, k);
    const assombrir = (hex, k) => melange(hex, 0, k);
    const teinteRgb = (() => {
      const n = Number.parseInt(BLEU.slice(1), 16);
      return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
    })();

    const arrondi = (x, y, w, h, r) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    };

    // --- le fond ---
    c.fillStyle = FOND;
    c.fillRect(0, 0, MAITRE, MAITRE);

    // --- le halo : c'est une lampe, elle doit se voir dans le noir ---
    const rHalo = MAITRE * 0.46;
    const gHalo = c.createRadialGradient(cx, cy, 0, cx, cy, rHalo);
    gHalo.addColorStop(0, `rgba(${teinteRgb},0.55)`);
    gHalo.addColorStop(0.55, `rgba(${teinteRgb},0.18)`);
    gHalo.addColorStop(1, `rgba(${teinteRgb},0)`);
    c.fillStyle = gHalo;
    c.beginPath();
    c.arc(cx, cy, rHalo, 0, Math.PI * 2);
    c.fill();

    // --- le corps : mêmes proportions que dessinerTete(), humeur « inquiet » ---
    const taille = MAITRE * 0.46;
    const w = taille,
      h = taille;
    const arr = Math.min(w, h) * 0.32;
    const demi = taille * 0.5;

    c.save();
    c.translate(cx, cy);

    const corps = c.createLinearGradient(0, -h / 2, 0, h / 2);
    corps.addColorStop(0, eclaircir(BLEU, 0.42));
    corps.addColorStop(0.55, BLEU);
    corps.addColorStop(1, assombrir(BLEU, 0.3));
    c.fillStyle = corps;
    arrondi(-w / 2, -h / 2, w, h, arr);
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.7)';
    c.lineWidth = MAITRE * 0.0035;
    c.stroke();

    const reflet = c.createRadialGradient(-w * 0.2, -h * 0.28, 0, -w * 0.2, -h * 0.28, w * 0.42);
    reflet.addColorStop(0, 'rgba(255,255,255,0.45)');
    reflet.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = reflet;
    arrondi(-w / 2, -h / 2, w, h, arr);
    c.fill();

    // --- les yeux : grands ouverts, la peur au repos ---
    const ecart = demi * 0.36;
    const oeilY = -demi * 0.14;
    const rOeil = demi * 0.22;
    const rPupille = rOeil * 0.36; // « peur » : la pupille rétrécit
    for (const dx of [-ecart, ecart]) {
      c.save();
      c.beginPath();
      c.ellipse(dx, oeilY, rOeil, rOeil, 0, 0, Math.PI * 2);
      c.fillStyle = '#ffffff';
      c.fill();
      c.clip();
      c.fillStyle = '#0a0a10';
      c.beginPath();
      // il regarde vers le haut : le même regard que dans la cage d'escalier
      c.arc(dx, oeilY - rOeil * 0.42, rPupille, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // --- les sourcils « inquiet » : pointes intérieures relevées ---
    c.strokeStyle = '#0a0a10';
    c.lineWidth = Math.max(2, demi * 0.12);
    c.lineCap = 'round';
    const lg = rOeil * 1.15;
    const sy = oeilY - rOeil * 1.95;
    for (const cote of [-1, 1]) {
      const dx = ecart * cote;
      c.beginPath();
      c.moveTo(dx + lg * 0.55 * cote, sy + rOeil * 0.42);
      c.quadraticCurveTo(dx, sy - rOeil * 0.1, dx - lg * 0.55 * cote, sy - rOeil * 0.34);
      c.stroke();
    }

    // --- la bouche « inquiet » : courte, franchement tombante ---
    const by = oeilY + rOeil * 2.4;
    const bl = demi * 0.42;
    c.lineWidth = Math.max(1.8, demi * 0.1);
    c.beginPath();
    c.moveTo(-bl * 0.28, by + bl * 0.14);
    c.quadraticCurveTo(0, by - bl * 0.16, bl * 0.28, by + bl * 0.14);
    c.stroke();

    c.restore();
    return { maitresse: t.toDataURL('image/png') };
  },
  { FOND, BLEU },
);

// --- on redécoupe la planche maîtresse à chaque taille demandée ---
const tailles = [
  ['public/icons/icon-512.png', 512],
  ['public/icons/icon-192.png', 192],
  ['public/icons/apple-touch-icon.png', 180],
  ['public/favicon.png', 48],
];

for (const [chemin, taille] of tailles) {
  const png = await page.evaluate(
    ({ maitresse, taille }) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement('canvas');
          c.width = taille;
          c.height = taille;
          const ctx = c.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, taille, taille);
          resolve(c.toDataURL('image/png'));
        };
        img.src = maitresse;
      }),
    { maitresse, taille },
  );
  await mkdir(chemin.split('/').slice(0, -1).join('/') || '.', { recursive: true });
  await writeFile(chemin, Buffer.from(png.split(',')[1], 'base64'));
  console.log(`écrit : ${chemin} (${taille}×${taille})`);
}

await navigateur.close();

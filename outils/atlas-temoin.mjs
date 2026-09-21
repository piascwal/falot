/**
 * LA PLANCHE TÉMOIN.
 *
 * Elle ne sert pas à embellir le jeu : elle sert à PROUVER que le chemin par
 * sprites marche, avant qu'un seul vrai dessin existe. Elle cuit les formes
 * actuelles — les mêmes carrés arrondis, les mêmes visages — dans un PNG, en
 * niveaux de gris pour les corps, et écrit le JSON qui va avec.
 *
 * Le jour où de vrais sprites arrivent, on remplace les deux fichiers et rien
 * d'autre ne bouge. Si le témoin s'affiche correctement, l'intégration est
 * bonne ; si un sprite est décalé, c'est le placement qu'il faut corriger, pas
 * le dessin.
 *
 *   node outils/atlas-temoin.mjs        → public/atlas/lux.png + lux.json
 *
 * Le cahier des charges des vrais assets est dans `docs/lux-assets.md`.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';

const CADRE = 64; // un sprite de corps, côté
const HUMEURS = ['peur', 'inquiet', 'intrigue', 'acharne', 'visee', 'apaise'];
const SUJETS = ['falot', 'frileux', 'errant', 'guet'];

const navigateur = await chromium.launch();
const page = await navigateur.newPage();

const { png, cases } = await page.evaluate(
  ({ CADRE, HUMEURS, SUJETS }) => {
    const cols = 8;
    const lignes = Math.ceil((SUJETS.length * 2 + HUMEURS.length * 2) / cols);
    const t = document.createElement('canvas');
    t.width = cols * CADRE;
    t.height = lignes * CADRE;
    const c = t.getContext('2d');
    const cases = {};
    let n = 0;
    const place = (nom) => {
      const x = (n % cols) * CADRE;
      const y = Math.floor(n / cols) * CADRE;
      cases[nom] = { x, y, w: CADRE, h: CADRE };
      n++;
      return { x, y };
    };
    const arrondi = (x, y, w, h, r) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    };

    // LES CORPS, en niveaux de gris : c'est le code qui les teinte.
    for (const s of SUJETS) {
      for (const etat of ['allume', 'vide']) {
        const { x, y } = place(`corps/${s}/${etat}`);
        const m = CADRE * 0.06; // une marge, pour que le trait ne soit pas rogné
        const g = c.createLinearGradient(0, y + m, 0, y + CADRE - m);
        if (etat === 'allume') {
          g.addColorStop(0, '#ffffff');
          g.addColorStop(0.55, '#c8c8c8');
          g.addColorStop(1, '#8a8a8a');
        } else {
          g.addColorStop(0, '#23232f');
          g.addColorStop(1, '#12121a');
        }
        c.fillStyle = g;
        arrondi(x + m, y + m, CADRE - m * 2, CADRE - m * 2, CADRE * 0.32);
        c.fill();
        c.strokeStyle = etat === 'allume' ? 'rgba(255,255,255,0.7)' : '#ffffff';
        c.lineWidth = etat === 'allume' ? 2 : 1.5;
        c.stroke();
      }
    }

    // LES VISAGES, posés par-dessus et jamais déformés. Deux images : l'œil
    // ouvert, et l'œil fermé.
    for (const h of HUMEURS) {
      for (const ferme of [0, 1]) {
        const { x, y } = place(`visage/${h}/${ferme}`);
        const cx = x + CADRE / 2;
        const cy = y + CADRE / 2;
        const demi = CADRE / 2;
        const ecart = demi * 0.36;
        const oeilY = cy - demi * 0.14;
        const r = demi * 0.22;
        const peur = h === 'peur' || h === 'inquiet';
        if (ferme) {
          c.strokeStyle = '#1b1b24';
          c.lineWidth = 2.4;
          for (const s of [-1, 1]) {
            c.beginPath();
            c.moveTo(cx + s * ecart - r, oeilY);
            c.lineTo(cx + s * ecart + r, oeilY);
            c.stroke();
          }
        } else {
          for (const s of [-1, 1]) {
            c.fillStyle = '#ffffff';
            c.beginPath();
            c.arc(cx + s * ecart, oeilY, r, 0, Math.PI * 2);
            c.fill();
            c.fillStyle = '#12121a';
            c.beginPath();
            c.arc(cx + s * ecart, oeilY + (peur ? r * 0.2 : 0), r * 0.5, 0, Math.PI * 2);
            c.fill();
          }
        }
        // les sourcils : c'est eux qui portent l'humeur
        c.strokeStyle = '#1b1b24';
        c.lineWidth = 2.6;
        const pente = h === 'acharne' || h === 'visee' ? -1 : peur ? 1 : 0;
        for (const s of [-1, 1]) {
          c.beginPath();
          c.moveTo(cx + s * ecart - r, oeilY - r * 1.5 - pente * r * 0.5 * s * s);
          c.lineTo(cx + s * ecart + r, oeilY - r * 1.5 + pente * r * 0.5);
          c.stroke();
        }
        // la bouche
        c.beginPath();
        const by = cy + demi * 0.42;
        if (h === 'apaise') c.arc(cx, by - r * 0.6, r * 0.8, 0.2, Math.PI - 0.2);
        else if (peur) c.arc(cx, by + r * 0.6, r * 0.7, Math.PI + 0.3, -0.3);
        else {
          c.moveTo(cx - r * 0.7, by);
          c.lineTo(cx + r * 0.7, by);
        }
        c.stroke();
      }
    }
    return { png: t.toDataURL('image/png'), cases };
  },
  { CADRE, HUMEURS, SUJETS },
);

await navigateur.close();
await mkdir('public/atlas', { recursive: true });
await writeFile('public/atlas/lux.png', Buffer.from(png.split(',')[1], 'base64'));
await writeFile(
  'public/atlas/lux.json',
  `${JSON.stringify({ image: 'lux.png', echelle: 2, cases }, null, 2)}\n`,
);
console.log(`planche témoin écrite : ${Object.keys(cases).length} images`);

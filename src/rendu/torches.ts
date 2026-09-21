/**
 * LES TORCHES.
 *
 * Le jeu ne dessine que des formes simples — des carrés arrondis, des barres,
 * des ronds — et suggère le reste par la lumière. Une torche doit suivre cette
 * règle : un manche, une tête, et c'est tout. La première version avait une
 * flamme en trois dégradés : jolie, et étrangère au reste du jeu.
 *
 * Éteinte, la tête est grise. Allumée, elle est claire et le décor s'en charge
 * (la lueur chaude au sol est peinte par la scène, pas ici).
 */

import { CASE } from '../coeur/dimensions.js';
import { clamp } from '../coeur/geometrie.js';
import type { Torche } from '../coeur/types.js';
import type { Ecran } from './ecran.js';
import { tuiles } from './tuiles.js';

const HAUT = CASE * 0.42; // hauteur du manche
const LARGE = CASE * 0.1; // largeur du manche
const TETE = CASE * 0.17; // côté de la tête

/**
 * `vive` : ce qu'il reste de flamme, de 0 (éteinte) à 1. `temps` sert au
 * battement de la tête allumée — le seul mouvement qu'on s'autorise.
 */
export function dessinerTorche(ecran: Ecran, t: Torche, vive: number, temps: number): void {
  const { ctx, cam } = ecran;
  const x = t.x - cam.x;
  const y = t.y - cam.y;
  const v = clamp(vive, 0, 1);

  const t2 = tuiles();
  // --- le manche : du bois et un collier, dessinés dans la planche ---
  ctx.save();
  ctx.globalAlpha = v > 0 ? 1 : 0.85; // morte, elle se fait discrète
  ctx.drawImage(t2.torche, x - LARGE / 2, y - HAUT * 0.35, LARGE, HAUT);
  ctx.restore();

  // --- la tête : du charbon quand elle est morte, du feu quand elle brûle ---
  const bat = v > 0 ? 1 + Math.sin(temps * 9 + t.phase) * 0.08 : 1;
  const cote = TETE * bat;
  const ty = y - HAUT * 0.35 - cote * 0.55;
  if (v > 0) {
    // Le feu, lui, reste peint ici : c'est la scène qui sait ce qu'il en
    // reste, et de la braise ne se dessine pas dans une planche figée.
    ctx.fillStyle = `rgba(255,186,96,${0.55 + v * 0.45})`;
    ctx.fillRect(x - cote / 2, ty - cote / 2, cote, cote);
    const coeur = cote * 0.45;
    ctx.fillStyle = `rgba(255,250,228,${0.75 + v * 0.25})`;
    ctx.fillRect(x - coeur / 2, ty - coeur / 2, coeur, coeur);
  } else {
    ctx.drawImage(t2.charbon, x - cote / 2, ty - cote / 2, cote, cote);
  }
}

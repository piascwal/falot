/**
 * Qui éclaire quoi.
 *
 * Deux lumières, deux effets contraires, et la bible en donne la raison
 * (`docs/lux-falot.md`, « Les deux lumières ») : un Guet ne voit pas les corps,
 * il ne voit que des lampes. Ce qu'on PORTE trahit ; ce qui est POSÉ efface.
 */

import { D } from '../dimensions.js';
import { EMOTIONS } from '../formes.js';
import { coneFaisceau, porteeFaisceau, rayonHalo } from '../lectures.js';
import { dansLeCone, vueLibre } from '../monde/grille.js';
import type { Partie, Perso, Torche, Zone } from '../types.js';

/**
 * LE CONVOI SOUFFLE SA LUMIÈRE. Dès qu'un Guet se doute de quelque chose, les
 * âmes rallumées s'éteignent : elles n'éclairent plus, et on ne les voit plus.
 * Il ne reste que ce que Falot porte — c'est lui qui se fait prendre, pas ceux
 * qu'il emmène.
 *
 * Ça se décide AVANT la propagation de la lumière, sinon le convoi éclaire
 * encore pendant l'image où il vient de s'éteindre.
 */
export function souffler(partie: Partie): void {
  const { zone } = partie;
  const menace = zone.persos.some(
    (q) =>
      q.emotion === EMOTIONS.COLERE &&
      !q.livre &&
      q.aveugle <= 0 &&
      (q.alerte > 0 || q.charge > 0.04),
  );
  for (const q of zone.persos) q.eteint = q.calme && !q.livre && menace;
}

/**
 * Relais : ton faisceau réveille un bonhomme, qui éclaire à son tour dans la
 * direction de son regard. Ça ne décide de rien — ça sert à voir plus loin.
 */
export function propager(partie: Partie): Set<Perso> {
  const { zone, joueur } = partie;
  const eclaires = new Set<Perso>();
  // un calmé brille tout seul, faisceau ou pas
  for (const q of zone.persos) if (q.calme && !q.livre && !q.eteint) eclaires.add(q);
  const portee = porteeFaisceau(joueur);
  if (!portee) return eclaires;
  const cone = coneFaisceau(joueur);

  for (const q of zone.persos) {
    if (q.emotion === EMOTIONS.COLERE) continue;
    if (!dansLeCone(joueur.x, joueur.y, joueur.regard, q.x, q.y, portee, cone)) continue;
    if (!vueLibre(zone, joueur.x, joueur.y, q.x, q.y)) continue;
    eclaires.add(q);
  }
  for (let tour = 0; tour < 4; tour++) {
    let ajout = false;
    for (const src of [...eclaires]) {
      for (const cible of zone.persos) {
        if (cible === src || eclaires.has(cible)) continue;
        if (cible.emotion === EMOTIONS.COLERE) continue;
        if (!dansLeCone(src.x, src.y, src.regard, cible.x, cible.y, D.portee * 5, D.cone))
          continue;
        if (!vueLibre(zone, src.x, src.y, cible.x, cible.y)) continue;
        eclaires.add(cible);
        ajout = true;
      }
    }
    if (!ajout) break;
  }
  return eclaires;
}

/** Une braise tient les rouges à distance : c'est ce qui en fait un abri et pas
 *  seulement un lampadaire. */
export const prochedUneBraise = (z: Zone, x: number, y: number, marge = 1): boolean =>
  z.braises.some((b) => Math.hypot(b.x - x, b.y - y) < b.r * marge);

/**
 * Une torche POSÉE met à l'abri ; celle qu'on porte, non. C'est toute la
 * règle des deux lumières, et c'est ce qui empêche le fanal d'être gratuit :
 * il éloigne les Guets, il ne te cache pas d'eux.
 */
export const procheDuneTorche = (
  z: Zone,
  x: number,
  y: number,
  portee?: Torche | null,
): boolean =>
  z.torches.some((t) => t !== portee && t.reste > 0 && Math.hypot(t.x - x, t.y - y) < t.r);

/**
 * L'abri protège QUI S'Y TIENT, pas un statut. Le joueur et chaque suiveur
 * posent donc la même question depuis leur propre position : celui qui est dans
 * la lumière est couvert, celui qui traîne dehors reste attrapable.
 */
export const aLAbri = (z: Zone, x: number, y: number, portee?: Torche | null): boolean =>
  prochedUneBraise(z, x, y) || procheDuneTorche(z, x, y, portee);

/** « Est-ce que ce point est actuellement éclairé » — sert à la mémoire des objets. */
export function estEclaire(partie: Partie, x: number, y: number): boolean {
  const { zone, joueur } = partie;
  if (Math.hypot(x - joueur.x, y - joueur.y) < rayonHalo(partie)) return true;
  const portee = porteeFaisceau(joueur);
  if (
    portee &&
    dansLeCone(joueur.x, joueur.y, joueur.regard, x, y, portee, coneFaisceau(joueur)) &&
    vueLibre(zone, joueur.x, joueur.y, x, y)
  )
    return true;
  if (aLAbri(zone, x, y)) return true;
  // un calmé éclaire en permanence : ce qu'il vise est visible pour toujours
  return zone.persos.some(
    (q) =>
      q.calme &&
      !q.eteint &&
      dansLeCone(q.x, q.y, q.regard, x, y, D.portee * 5, D.cone) &&
      vueLibre(zone, q.x, q.y, x, y),
  );
}

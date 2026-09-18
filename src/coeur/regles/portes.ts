/**
 * Les portes, et l'éboulement d'un mur fêlé.
 *
 * Une porte s'ouvre pour QUI QUE CE SOIT — joueur comme âme — et se referme
 * seule. C'est ce qui en fait un objet de tension et pas un verrou : s'en
 * approcher ouvre le couloir au regard d'en face, exactement au moment où on
 * voudrait rester caché. Un Guet, lui, n'en pousse jamais aucune : c'est la
 * commodité de jeu assumée dans `docs/lux-falot.md`.
 */

import { CASE } from '../dimensions.js';
import { EMOTIONS } from '../formes.js';
import { clamp } from '../geometrie.js';
import { emettre } from '../particules.js';
import type { Partie, Point } from '../types.js';

export function majPortes(partie: Partie, dt: number): void {
  const { joueur, zone } = partie;
  // l'éboulement d'un mur fêlé : la pierre s'efface en un tiers de seconde
  for (const f of zone.fissures) {
    if (f.casse > 0 && f.casse < 1) f.casse = Math.min(1, f.casse + dt * 3);
  }
  for (const pt of zone.portes) {
    // on retient QUI ouvre, et pas seulement qu'on ouvre : le battant doit
    // s'écarter de celui qui pousse
    // Un objet plutôt que deux variables : TypeScript ne suit pas une
    // affectation faite dans une fermeture, et croirait `plusProche.qui` toujours nul.
    const plusProche: { qui: Point | null; d: number } = { qui: null, d: CASE * 0.95 };
    const tester = (q: Point) => {
      const d = Math.hypot(q.x - pt.x, q.y - pt.y);
      if (d < plusProche.d) {
        plusProche.d = d;
        plusProche.qui = q;
      }
    };
    tester(joueur);
    // Un rouge ne pousse aucune porte : ni pour la franchir, ni même pour
    // l'entrouvrir et voir au travers.
    for (const q of zone.persos) if (!q.livre && q.emotion !== EMOTIONS.COLERE) tester(q);

    // Le sens est figé au moment où la porte s'entrouvre, et gardé jusqu'à ce
    // qu'elle soit refermée : sans ça le battant claquerait d'un côté à
    // l'autre pendant qu'on la traverse.
    if (plusProche.qui && pt.ouverte <= 0.02) {
      const ecart = pt.verticale ? plusProche.qui.x - pt.x : pt.y - plusProche.qui.y;
      pt.sens = ecart >= 0 ? 1 : -1;
    }
    const proche = !!plusProche.qui;
    const avant = pt.ouverte;
    pt.ouverte = clamp(pt.ouverte + (proche ? 3.2 : -1.3) * dt, 0, 1);
    // franchir le seuil change ce qui est solide : les ombres portées des
    // torches et des braises doivent être recalculées
    if (avant < 0.5 !== pt.ouverte < 0.5) zone.versionPortes++;
    if (avant < 0.5 && pt.ouverte >= 0.5) emettre(partie, pt.x, pt.y, '#c8b088', 5, 40);
  }
}

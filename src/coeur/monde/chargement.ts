/**
 * Charger un étage, et tout ce que ça remet à zéro.
 *
 * On redevient Peureux à chaque nouvelle zone : c'est le prix du Seuil, et tout
 * se regagne sur place. Ce qui survit d'un étage à l'autre tient en une ligne —
 * `partie.montee`, les âmes remontées derrière soi — et c'est exactement le
 * propos du jeu.
 */

import { FORMES, PIERRE } from '../formes.js';
import { SOUFFLE_MAX } from '../regles/joueur.js';
import type { Partie } from '../types.js';
import { ETAGES_ECRITS, zoneEcrite } from './ecrits.js';
import { genererZone } from './generation.js';
import { pouvoirs } from './paliers.js';

export function chargerZone(partie: Partie, numero: number): void {
  const { joueur } = partie;
  // Les lueurs spéciales ne dépendent plus de la forme courante — elle repart
  // à zéro à chaque zone — mais du NUMÉRO de zone : la variété s'ouvre au fil
  // de l'aventure, la puissance se regagne à chaque fois.
  // Un étage écrit à la main passe avant le générateur. Il n'y en a qu'un
  // aujourd'hui — le premier — et c'est voulu : la fiction commence à sa
  // place, et tout ce qui suit est tiré au sort.
  const z = ETAGES_ECRITS[numero]
    ? zoneEcrite(numero)
    : genererZone(partie.grain, numero, Math.min(FORMES.length - 1, numero));
  if (!z) return;
  partie.zone = z;
  // Ce dont il se souvient à cet étage. Le Seuil lui prend sa lumière, pas ses
  // gestes : un pouvoir acquis ne se reperd plus.
  partie.pouvoirs = pouvoirs(numero);
  const zone = z;
  if (numero === 1) partie.montee = []; // nouvelle aventure, nouvelle cage
  partie.numeroZone = numero;
  partie.priseCount = 0;
  partie.premieres.seuil = false; // chaque Seuil redit ce qu'il attend
  partie.chute = null;
  partie.eclosion = 1;
  partie.particules = [];
  partie.ondes = [];
  partie.pierres = [];
  partie.traces = [];
  partie.flottants = [];
  partie.filVoix = [];
  partie.voixT = 0;
  partie.bandeau.visible = false;
  partie.bandeau.pale = false;
  partie.fil = [];
  // On redevient peureux à chaque nouvelle zone : tout se regagne sur place.
  joueur.eclat = 0;
  joueur.sommet = 0;
  joueur.niveau = 0;
  joueur.bonus = null;
  joueur.bonusT = 0;
  joueur.souffle = 1;
  // L'air s'épaissit à l'étage du voile : la lumière y porte deux fois moins
  // loin, et les torches cessent d'être un confort pour devenir la carte.
  joueur.air = zone.traits.includes('voile') ? 0.55 : 1;
  joueur.fanal = null; // une torche ne franchit pas un Seuil
  joueur.souffleReste = SOUFFLE_MAX; // on repart avec tout son souffle
  joueur.repit = 0;
  joueur.pierres = PIERRE[0].reserve;
  joueur.pierreDispo = 0;
  joueur.x = zone.depart.x;
  joueur.y = zone.depart.y;
  joueur.vx = joueur.vy = 0;
  partie.filDernier = { x: joueur.x, y: joueur.y };
  // la caméra se recale d'un coup : le rendu consomme ce drapeau
  partie.recadrer = true;
}

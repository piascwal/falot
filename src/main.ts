/**
 * LE CÂBLAGE, et rien d'autre.
 *
 * C'est le seul fichier qui connaisse à la fois la partie, l'écran, le DOM et
 * l'horloge. Tout ce qu'il fait tient en trois gestes : lire les entrées,
 * avancer la simulation d'un pas fixe, dessiner l'état obtenu.
 */

import { avancer, creerPartie, PAS, PAS_MAX_PAR_IMAGE } from './coeur/partie.js';
import { montrerToast } from './coeur/voix.js';
import { brancherClavier } from './entrees/clavier.js';
import { brancherFanal, brancherPointeur, brancherSouffle } from './entrees/pointeur.js';
import { creerHud } from './interface/hud.js';
import { descendre, poserLEcranTitre, retenirPrologue } from './interface/ouverture.js';
import { retenirBilan, retenirLaFin } from './interface/sauvegarde.js';
import { chargerAtlas, poserLAtlas } from './rendu/atlas.js';
import {
  cadrer,
  creerEcran,
  redimensionner,
  surveillerCadence,
  veillerSurLEcran,
} from './rendu/ecran.js';
import { dessiner } from './rendu/scene.js';
import { tuiles } from './rendu/tuiles.js';

const canvas = document.getElementById('jeu') as HTMLCanvasElement | null;
if (!canvas) throw new Error('Pas de canvas « jeu » dans la page');

// Raccourci de développement : ?etage=4 démarre directement à cet étage,
// ?graine=LUX-1234 fixe le plan. Sans ça il faudrait retraverser tout le début
// à chaque essai. Rien d'autre ne lit l'URL.
const reglages = new URLSearchParams(location.search);
const demande = Number.parseInt(reglages.get('etage') ?? '', 10);
const etage = Math.max(1, Math.min(99, demande || 1));

const partie = creerPartie({
  grain: reglages.get('graine') ?? 'LUX-1042',
  etage,
});
const ecran = creerEcran(canvas);
const hud = creerHud();

brancherPointeur(canvas, hud.pierre, partie);
brancherSouffle(hud.souffle, partie);
brancherFanal(hud.fanal, partie);
brancherClavier(partie);

// L'horloge de la boucle. Déclarée ici parce que `replanter` la remet à zéro :
// revenir d'une autre application ne doit pas donner plusieurs secondes de
// retard à rattraper d'un coup.
let dernier = performance.now();
let reste = 0;

function replanter(): void {
  redimensionner(ecran);
  cadrer(ecran, partie, true);
  // On revient d'ailleurs : l'horloge a sauté. Sans cette remise à zéro, le
  // premier pas d'après vaut plusieurs secondes de retard à rattraper.
  dernier = performance.now();
  reste = 0;
}

window.addEventListener('resize', replanter);
window.addEventListener('orientationchange', replanter);
// Revenir d'une autre application, ou d'un onglet mis en cache par le
// navigateur : dans les deux cas le canevas peut avoir été vidé pendant qu'on
// n'était pas là (voir `veillerSurLEcran`).
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) replanter();
});
window.addEventListener('pageshow', replanter);
// Le navigateur a repris la mémoire du canevas et la rend : tout est à refaire.
canvas.addEventListener('contextrestored', replanter);

if (demande) {
  // on saute l'écran-titre, sinon il faudrait le cliquer à chaque essai
  montrerToast(partie, etage > 1 ? `Départ direct à l'étage ${etage}` : 'Départ direct');
  cadrer(ecran, partie, true);
} else {
  // `?debug` ouvre tous les étages dans la grille de l'écran-titre
  poserLEcranTitre(partie, reglages.has('debug'));
}

// Le prologue franchi est la seule chose que le jeu retient d'une session à
// l'autre. Le cœur ne fait que lever le drapeau ; l'écriture est ici.
let prologueRetenu = false;
let bilanRetenu = 0;
let finRetenue = false;

function boucle(maintenant: number): void {
  requestAnimationFrame(boucle);
  const t0 = performance.now();
  try {
    corpsBoucle(maintenant);
  } finally {
    ecran.coutsImage.push(performance.now() - t0);
    if (ecran.coutsImage.length > 240) ecran.coutsImage.shift();
  }
}

function corpsBoucle(maintenant: number): void {
  const ecart = Math.min((maintenant - dernier) / 1000, 0.25);
  dernier = maintenant;
  surveillerCadence(ecran, ecart);

  // PAS FIXE. On accumule le temps réel et on avance par pas de 1/60 : le jeu
  // se comporte donc pareil sur une machine qui peine, et une partie rejouée
  // donne exactement le même résultat. Au-delà de trois pas d'un coup on laisse
  // filer — revenir d'un onglet resté en arrière-plan ne doit pas simuler
  // trente secondes en une image.
  reste += ecart;
  let pas = 0;
  while (reste >= PAS && pas < PAS_MAX_PAR_IMAGE) {
    avancer(partie, PAS);
    reste -= PAS;
    pas++;
  }
  if (reste > PAS) reste = 0;

  if (partie.prologueFait && !prologueRetenu) {
    prologueRetenu = true;
    retenirPrologue();
  }

  // LA PROGRESSION. Le cœur ne connaît pas le stockage : il pose un bilan, et
  // c'est ici qu'on le range. Un bilan par étage traversé, jamais deux fois.
  if (partie.bilan && partie.bilan.etage !== bilanRetenu) {
    bilanRetenu = partie.bilan.etage;
    const b = partie.bilan;
    retenirBilan(
      b.etage,
      {
        lumiere: b.lumiere,
        lumieres: b.lumieres,
        lumieresTotal: b.lumieresTotal,
        morts: b.morts,
      },
      b.suivante,
    );
  }
  if (partie.finVue && !finRetenue) {
    finRetenue = true;
    retenirLaFin();
  }

  // L'écran a-t-il bougé sans nous le dire ? (téléphone mis de côté, barre
  // d'adresse qui se replie, rotation faite ailleurs.)
  if (veillerSurLEcran(ecran)) partie.recadrer = true;
  cadrer(ecran, partie, partie.recadrer);
  partie.recadrer = false;
  hud.maj(partie);
  dessiner(ecran, partie, maintenant / 1000);
}

// LA PIERRE, fabriquée avant la première image. Quarante millisecondes une
// fois pour toutes : on les passe pendant l'écran-titre, pas au milieu d'un
// pas de course.
tuiles();

requestAnimationFrame(boucle);

// LA PLANCHE DE SPRITES, si elle existe. On ne l'attend pas : le jeu démarre
// dessiné à la main, et chaque forme qui a une image la prend dès qu'elle est
// arrivée. Absente, personne ne s'en aperçoit — c'est la même discipline que
// pour la sauvegarde, un luxe et jamais une dépendance.
chargerAtlas().then(poserLAtlas);

// De quoi piloter le jeu depuis la console ou depuis un test de capture
// d'écran : c'est le VRAI état, pas une copie.
declare global {
  interface Window {
    __lux?: {
      partie: typeof partie;
      ecran: typeof ecran;
      descendre: (etage: number) => void;
    };
  }
}
window.__lux = { partie, ecran, descendre: (n) => descendre(partie, n) };

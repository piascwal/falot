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
import { brancherPointeur, brancherSouffle } from './entrees/pointeur.js';
import { creerHud } from './interface/hud.js';
import { descendre, poserLEcranTitre, retenirPrologue } from './interface/ouverture.js';
import { cadrer, creerEcran, redimensionner, surveillerCadence } from './rendu/ecran.js';
import { dessiner } from './rendu/scene.js';

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
brancherClavier(partie);

window.addEventListener('resize', () => {
  redimensionner(ecran);
  cadrer(ecran, partie, true);
});

if (demande) {
  // on saute l'écran-titre, sinon il faudrait le cliquer à chaque essai
  montrerToast(partie, etage > 1 ? `Départ direct à l'étage ${etage}` : 'Départ direct');
  cadrer(ecran, partie, true);
} else {
  poserLEcranTitre(partie);
}

// Le prologue franchi est la seule chose que le jeu retient d'une session à
// l'autre. Le cœur ne fait que lever le drapeau ; l'écriture est ici.
let prologueRetenu = false;

let dernier = performance.now();
let reste = 0;

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

  cadrer(ecran, partie, partie.recadrer);
  partie.recadrer = false;
  hud.maj(partie);
  dessiner(ecran, partie, maintenant / 1000);
}

requestAnimationFrame(boucle);

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

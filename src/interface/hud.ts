/**
 * L'interface du haut : la zone, les pastilles de lumières, la jauge de confiance,
 * le bandeau, et le bouton pierre.
 *
 * Elle ne fait que REFLÉTER la partie, une fois par image. Aucune règle du jeu
 * ne vit ici, et le cœur n'appelle jamais le DOM : quand une animation doit
 * partir (le bouton qui bat, la jauge qui tressaille), le cœur incrémente un
 * compteur dans `partie.signaux` et c'est ce fichier qui le voit changer.
 */

import { rgba } from '../coeur/couleurs.js';
import { BONUS, FORMES } from '../coeur/formes.js';
import { clamp } from '../coeur/geometrie.js';
import { forme, rangPierre } from '../coeur/lectures.js';
import { SOUFFLE_MAX } from '../coeur/regles/joueur.js';
import { torcheSousLaMain } from '../coeur/regles/torche.js';
import type { Partie } from '../coeur/types.js';
import { tuiles } from '../rendu/tuiles.js';

const el = <T extends HTMLElement>(id: string): T => {
  const e = document.getElementById(id);
  if (!e) throw new Error(`Élément « ${id} » absent de la page`);
  return e as T;
};

/** Rejoue une animation CSS : la retirer, forcer un calcul, la remettre. */
function rejouer(e: HTMLElement, classe: string): void {
  e.classList.remove(classe);
  void e.offsetWidth;
  e.classList.add(classe);
}

export interface Hud {
  maj(partie: Partie): void;
  /** Le bouton pierre, dont les entrées ont besoin pour la visée. */
  pierre: HTMLButtonElement;
  /** Le bouton souffle, tenu tant qu'on veut rester couvert. */
  souffle: HTMLButtonElement;
  /** Le bouton torche : décrocher une torche, ou la reposer. */
  torche: HTMLButtonElement;
}

/**
 * LA MATIÈRE DU JEU DANS L'INTERFACE.
 *
 * Le bandeau et les boutons étaient des aplats translucides : une interface
 * d'application posée sur un souterrain. Ils prennent maintenant la PIERRE du
 * jeu — la même planche que les murs pour ce qui encadre, le même dallage que
 * le sol pour ce qui se remplit. On ne fabrique rien de plus : on découpe une
 * tuile de chaque planche et on la donne au CSS en image de fond.
 *
 * Les tuiles sont sombres (moyenne 26 pour le mur, 38 pour le sol), donc elles
 * se lisent comme un grain sous le texte et non comme une couleur : le HUD
 * reste lisible, et il a l'air taillé dans le même bloc que le décor.
 */
function poserLaPierre(): void {
  const t = tuiles();
  const decouper = (planche: HTMLCanvasElement, v: number): string => {
    const une = document.createElement('canvas');
    une.width = t.taille;
    une.height = t.taille;
    const c = une.getContext('2d');
    if (!c) return '';
    c.drawImage(planche, v * t.taille, 0, t.taille, t.taille, 0, 0, t.taille, t.taille);
    return `url("${une.toDataURL('image/png')}")`;
  };
  const r = document.documentElement.style;
  r.setProperty('--pierre-mur', decouper(t.mur, 2));
  r.setProperty('--pierre-sol', decouper(t.sol, 4));
}

/** Montre ou cache, sans rien écrire si c'est déjà le cas. */
function cacher(e: HTMLElement, cache: boolean): void {
  if (e.hidden !== cache) e.hidden = cache;
}

/**
 * Remplit une barre de `k` (0 à 1) en la faisant glisser, au demi-pour-cent
 * près : une jauge qui fond pendant dix secondes change ainsi deux cents fois,
 * et non six cents.
 */
function glisser<C extends string>(
  e: HTMLElement,
  k: number,
  vu: Record<C, number>,
  cle: C,
): void {
  const q = Math.round(k * 200) / 200;
  if (vu[cle] === q) return;
  vu[cle] = q;
  e.style.transform = `translateX(${((q - 1) * 100).toFixed(1)}%)`;
}

export function creerHud(): Hud {
  poserLaPierre();
  const elZone = el('zone');
  const elRangs = el('rangs');
  // Cinq losanges, posés une fois pour toutes : on ne reconstruit pas du DOM
  // soixante fois par seconde pour cinq nœuds qui ne bougent jamais.
  const rangs = FORMES.map(() => {
    const i = document.createElement('i');
    elRangs.append(i);
    return i;
  });
  const elBarre = el('barre');
  const elBarreBoite = document.querySelector<HTMLElement>('.barre');
  const elJauge = el('jauge');
  const elLumieres = el('lumieres');
  const elToast = el('toast');
  const elPierre = el<HTMLButtonElement>('pierre');
  const elSouffle = el<HTMLButtonElement>('souffle');
  const elTorche = el<HTMLButtonElement>('torche');
  const elActions = el('actions');
  const elHud = el('hud');
  const elPierreN = el('pierre-n');
  const elBonus = el('bonus');
  const elBonusNom = el('bonus-nom');
  const elBonusJauge = el('bonus-jauge');

  // Ce que l'interface a déjà montré : on ne touche au DOM que si ça a bougé.
  const vu = {
    niveau: -1,
    barre: -1,
    couleur: '',
    zone: -1,
    bonus: '',
    bonusJauge: -1,
    enMontee: false,
    pierre: 0,
    jauge: 0,
    forme: 0,
    pierres: -1,
    recharge: -1,
    souffle: -1,
    bandeau: '',
  };

  return {
    pierre: elPierre,
    souffle: elSouffle,
    torche: elTorche,
    maj(partie: Partie): void {
      const { joueur, zone } = partie;
      const f = forme(joueur);
      const suivant = FORMES[joueur.niveau + 1];

      // --- la jauge de confiance ---
      const bas = f.seuil;
      const haut = suivant ? suivant.seuil : f.seuil + 60;
      // LA MONTÉE EN PUISSANCE, et rien d'autre. Chaque palier allume un
      // losange de plus, et le dernier allumé brille plus fort que le premier :
      // c'est ce qu'on ressent en jouant — pas un autre personnage, le même en
      // plus fort.
      //
      // RIEN N'EST ÉCRIT DANS LA PAGE S'IL N'A PAS CHANGÉ. Chaque écriture —
      // même d'un texte identique — fait remettre en page et repeindre le
      // bandeau, et ce travail-là ne se voit pas dans le temps de calcul : il
      // vient après. Sur un téléphone il coûtait plus que tout le jeu.
      if (vu.niveau !== joueur.niveau) {
        vu.niveau = joueur.niveau;
        for (let i = 0; i < rangs.length; i++) {
          const pleine = i <= joueur.niveau;
          rangs[i].classList.toggle('pleine', pleine);
          rangs[i].style.boxShadow = pleine
            ? `0 0 ${4 + i * 2.5}px rgba(143,208,255,${0.5 + i * 0.12})`
            : 'none';
        }
      }
      glisser(elBarre, clamp((joueur.eclat - bas) / (haut - bas), 0, 1), vu, 'barre');
      if (vu.couleur !== f.couleur) {
        vu.couleur = f.couleur;
        elBarre.style.background = f.couleur;
      }
      if (vu.zone !== zone.numero) {
        vu.zone = zone.numero;
        elZone.textContent = `ZONE ${zone.numero}`;
      }

      // Pendant la montée, il n'y a rien à lancer ni à souffler, et la jauge
      // d'un étage qu'on vient de quitter ne veut plus rien dire : l'écran se
      // vide, il ne reste que la cage. C'est le contraire exact de l'ancienne
      // modale — on ne montre pas un bilan, on monte.
      const enMontee =
        partie.puits !== null || partie.fin !== null || partie.bilan !== null;
      if (vu.enMontee !== enMontee) {
        vu.enMontee = enMontee;
        elActions.hidden = enMontee;
        elHud.hidden = enMontee;
        // Le bandeau vit hors du HUD : sans cette ligne, la phrase de l'étage
        // qu'on vient de quitter se posait en travers du récit de la montée.
        elToast.hidden = enMontee;
      }
      if (enMontee) return;

      // Le souffle n'existe que depuis que Falot s'en est souvenu. Un bouton
      // grisé aurait promis quelque chose sans le donner : il n'est pas là.
      cacher(elSouffle, !partie.pouvoirs.souffle);
      elSouffle.classList.toggle('tenu', joueur.eteint);
      // Trois secondes, pas une de plus : l'anneau les montre fondre, et se
      // refaire. Sans lui on souffle jusqu'à la panne sans comprendre.
      const reste = Math.round((joueur.souffleReste / SOUFFLE_MAX) * 100) / 100;
      if (vu.souffle !== reste) {
        vu.souffle = reste;
        elSouffle.style.setProperty('--recharge', reste.toFixed(2));
        // Tant que la réserve n'est pas PLEINE, le bouton reste coupé :
        // l'anneau montre alors ce qu'il reste à attendre.
        elSouffle.disabled = joueur.souffleBloque;
      }

      // Le bouton n'apparaît que s'il y a quelque chose à décrocher, ou qu'on
      // tient déjà une torche.
      cacher(elTorche, !joueur.torche && !torcheSousLaMain(partie));
      elTorche.classList.toggle('tenu', joueur.torche !== null);

      // --- les pastilles de lumières : on ne les reconstruit que si le compte bouge ---
      const etat = `${zone.sortie.lumieres}/${zone.requis}`;
      if (elLumieres.dataset.etat !== etat) {
        elLumieres.dataset.etat = etat;
        elLumieres.innerHTML = '';
        for (let i = 0; i < zone.requis; i++) {
          const pastille = document.createElement('i');
          if (i < zone.sortie.lumieres) pastille.className = 'pleine';
          elLumieres.appendChild(pastille);
        }
      }

      // --- le bonus en cours ---
      if (joueur.bonus && joueur.bonusT > 0) {
        const b = BONUS[joueur.bonus];
        if (vu.bonus !== joueur.bonus) {
          vu.bonus = joueur.bonus;
          elBonus.classList.add('on');
          elBonusNom.style.color = b.couleur;
          elBonusJauge.style.background = b.couleur;
          elBonusNom.textContent = b.nom;
        }
        glisser(elBonusJauge, clamp(joueur.bonusT / b.duree, 0, 1), vu, 'bonusJauge');
      } else if (vu.bonus !== '') {
        vu.bonus = '';
        elBonus.classList.remove('on');
      }

      // --- le bouton pierre : le compte, et l'anneau de recharge ---
      const rang = rangPierre(joueur);
      const plein = joueur.pierres >= rang.reserve;
      const recharge = plein ? 1 : Math.round(joueur.pierreDispo * 100) / 100;
      if (vu.pierres !== joueur.pierres) {
        vu.pierres = joueur.pierres;
        elPierre.disabled = joueur.pierres <= 0;
        elPierreN.textContent = String(joueur.pierres);
      }
      if (vu.recharge !== recharge) {
        vu.recharge = recharge;
        elPierre.style.setProperty('--recharge', recharge.toFixed(2));
      }

      // --- le bandeau : il ne disparaît pas, il pâlit et il reste ---
      const ligne = `${partie.bandeau.visible ? 1 : 0}${partie.bandeau.pale ? 1 : 0}${partie.bandeau.texte}`;
      if (vu.bandeau !== ligne) {
        vu.bandeau = ligne;
        elToast.textContent = partie.bandeau.texte;
        elToast.classList.toggle('on', partie.bandeau.visible);
        elToast.classList.toggle('pale', partie.bandeau.pale);
      }

      // --- les signaux : des animations, jamais des décisions ---
      if (vu.forme !== partie.signaux.forme) {
        vu.forme = partie.signaux.forme;
        elPierre.style.color = f.couleur;
        elPierre.style.borderColor = rgba(f.couleur, 0.75);
        elPierre.style.setProperty('--aura', `${6 + joueur.niveau * 5}px`);
      }
      if (vu.pierre !== partie.signaux.pierre) {
        vu.pierre = partie.signaux.pierre;
        rejouer(elPierre, 'evolue');
      }
      if (vu.jauge !== partie.signaux.jauge) {
        vu.jauge = partie.signaux.jauge;
        if (elBarreBoite) rejouer(elBarreBoite, 'pulse');
        rejouer(elJauge, 'pulse');
      }
    },
  };
}

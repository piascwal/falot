/**
 * L'interface du haut : la zone, les pastilles d'âmes, la jauge de confiance,
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
import { torcheSousLaMain } from '../coeur/regles/fanal.js';
import { SOUFFLE_MAX } from '../coeur/regles/joueur.js';
import type { Partie } from '../coeur/types.js';

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
  /** Le bouton fanal : décrocher une torche, ou la reposer. */
  fanal: HTMLButtonElement;
}

export function creerHud(): Hud {
  const elZone = el('zone');
  const elForme = el('forme');
  const elFormeSuite = el('forme-suite');
  const elBarre = el('barre');
  const elBarreBoite = document.querySelector<HTMLElement>('.barre');
  const elJauge = el('jauge');
  const elAmes = el('ames');
  const elToast = el('toast');
  const elPierre = el<HTMLButtonElement>('pierre');
  const elSouffle = el<HTMLButtonElement>('souffle');
  const elFanal = el<HTMLButtonElement>('fanal');
  const elActions = el('actions');
  const elHud = el('hud');
  const elPierreN = el('pierre-n');
  const elBonus = el('bonus');
  const elBonusNom = el('bonus-nom');
  const elBonusJauge = el('bonus-jauge');

  // Ce que l'interface a déjà montré : on ne touche au DOM que si ça a bougé.
  const vu = {
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
    fanal: elFanal,
    maj(partie: Partie): void {
      const { joueur, zone } = partie;
      const f = forme(joueur);
      const suivant = FORMES[joueur.niveau + 1];

      // --- la jauge de confiance ---
      const bas = f.seuil;
      const haut = suivant ? suivant.seuil : f.seuil + 60;
      elForme.textContent = f.nom;
      elForme.style.color = f.couleur;
      // vers quoi cette barre mène : sans ça elle se remplit sans rien promettre
      elFormeSuite.textContent = suivant ? `→ ${suivant.nom}` : '';
      elBarre.style.width = `${clamp((joueur.eclat - bas) / (haut - bas), 0, 1) * 100}%`;
      elBarre.style.background = f.couleur;
      elZone.textContent = `ZONE ${zone.numero}`;

      // Pendant la montée, il n'y a rien à lancer ni à souffler, et la jauge
      // d'un étage qu'on vient de quitter ne veut plus rien dire : l'écran se
      // vide, il ne reste que la cage. C'est le contraire exact de l'ancienne
      // modale — on ne montre pas un bilan, on monte.
      const enMontee =
        partie.puits !== null || partie.fin !== null || partie.bilan !== null;
      elActions.hidden = enMontee;
      elHud.hidden = enMontee;
      // Le bandeau vit hors du HUD : sans cette ligne, la phrase de l'étage
      // qu'on vient de quitter se posait en travers du récit de la montée.
      elToast.hidden = enMontee;
      if (enMontee) return;

      // Le souffle n'existe que depuis que Falot s'en est souvenu. Un bouton
      // grisé aurait promis quelque chose sans le donner : il n'est pas là.
      elSouffle.hidden = !partie.pouvoirs.souffle;
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

      // Le fanal n'apparaît que s'il y a quelque chose à décrocher, ou qu'on
      // tient déjà une torche.
      elFanal.hidden = !joueur.fanal && !torcheSousLaMain(partie);
      elFanal.classList.toggle('tenu', joueur.fanal !== null);

      // --- les pastilles d'âmes : on ne les reconstruit que si le compte bouge ---
      const etat = `${zone.sortie.ames}/${zone.requis}`;
      if (elAmes.dataset.etat !== etat) {
        elAmes.dataset.etat = etat;
        elAmes.innerHTML = '';
        for (let i = 0; i < zone.requis; i++) {
          const pastille = document.createElement('i');
          if (i < zone.sortie.ames) pastille.className = 'pleine';
          elAmes.appendChild(pastille);
        }
      }

      // --- le bonus en cours ---
      if (joueur.bonus && joueur.bonusT > 0) {
        const b = BONUS[joueur.bonus];
        elBonus.classList.add('on');
        elBonusNom.style.color = b.couleur;
        elBonusJauge.style.background = b.couleur;
        elBonusNom.textContent = b.nom;
        elBonusJauge.style.width = `${clamp(joueur.bonusT / b.duree, 0, 1) * 100}%`;
      } else {
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

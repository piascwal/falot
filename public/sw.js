/**
 * LE SERVICE WORKER — juste assez pour être une application.
 *
 * Deux choses, rien de plus :
 *   — il rend le jeu INSTALLABLE (un manifeste seul ne suffit pas partout) ;
 *   — il le rend JOUABLE HORS LIGNE, une fois qu'on l'a ouvert une première
 *     fois — dans le métro, en avion, ou simplement avec une connexion qui
 *     lâche en plein Guet.
 *
 * PAS DE LISTE DE FICHIERS À JOUR. Vite construit des noms de fichiers
 * différents à chaque version (l'empreinte dans `index-XXXXXXXX.js`) : un
 * précache écrit ici à la main serait faux dès la prochaine construction. La
 * stratégie est donc RÉSEAU D'ABORD : on demande toujours la dernière version
 * en ligne, on la range au passage, et on ne sert le tiroir que si le réseau
 * ne répond pas. Le jeu reste donc aussi à jour qu'une page ordinaire — il
 * gagne seulement de pouvoir continuer sans réseau.
 *
 * Le nom du tiroir est fixe : on ne le vide jamais tant que cette stratégie
 * ne change pas elle-même. Vider un cache réseau-d'abord à chaque déploiement
 * ferait perdre la dernière version jouable hors ligne pile au moment où on
 * en a besoin.
 */

const TIROIR = 'lux-hors-ligne-v1';

self.addEventListener('install', (evt) => {
  // Prendre la main tout de suite, sans attendre qu'on ferme les onglets
  // ouverts : une PWA qui reste sur son ancienne version jusqu'au prochain
  // redémarrage du navigateur, personne ne comprend pourquoi.
  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    (async () => {
      // On efface les tiroirs d'une stratégie révolue, jamais celui-ci.
      const noms = await caches.keys();
      await Promise.all(
        noms.filter((n) => n !== TIROIR && n.startsWith('lux-')).map((n) => caches.delete(n)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (evt) => {
  // On ne touche qu'aux requêtes GET du jeu lui-même : jamais une requête
  // vers un autre site, jamais un POST — un tiroir qui rejouerait une
  // requête qui modifie quelque chose serait un bug, pas une commodité.
  if (evt.request.method !== 'GET') return;
  const url = new URL(evt.request.url);
  if (url.origin !== self.location.origin) return;

  evt.respondWith(
    (async () => {
      try {
        const reponse = await fetch(evt.request);
        // On range une COPIE : une réponse ne se lit qu'une fois, et le
        // navigateur attend encore la vraie pendant qu'on la range.
        const tiroir = await caches.open(TIROIR);
        tiroir.put(evt.request, reponse.clone());
        return reponse;
      } catch {
        // Le réseau a manqué : c'est le seul moment où le tiroir répond.
        const depose = await caches.match(evt.request);
        if (depose) return depose;
        // Rien en réserve pour cette requête précise (une première visite
        // hors ligne, par exemple) : on laisse l'échec remonter tel quel.
        throw new Error('hors ligne, et rien en réserve pour cette requête');
      }
    })(),
  );
});

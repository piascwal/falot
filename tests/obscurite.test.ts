/**
 * L'OBSCURITÉ — voir `rendu/obscurite.ts`.
 *
 * Le flou de la nuit se fait sur la carte graphique quand il y en a une, et par
 * réduction sinon. Le piège est le WebGL ÉMULÉ : il existe, il répond, et il
 * est quatre fois plus lent que la réduction. C'est la seule décision de ce
 * fichier qui se teste sans navigateur, et c'est celle qui coûterait cher.
 */

import { describe, expect, it } from 'vitest';
import { estEmule } from '../src/rendu/obscurite.js';

describe("le choix du flou de l'obscurité", () => {
  it('écarte les WebGL qui tournent sur le processeur', () => {
    for (const nom of [
      'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)',
      'Google SwiftShader',
      'llvmpipe (LLVM 15.0.7, 256 bits)',
      'Microsoft Basic Render Driver',
      'Software Rasterizer',
    ])
      expect(estEmule(nom), nom).toBe(true);
  });

  it('garde les vraies cartes graphiques', () => {
    for (const nom of [
      'Apple GPU',
      'ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)',
      'Adreno (TM) 640',
      'Mali-G78',
      'ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)',
      'PowerVR Rogue GE8320',
    ])
      expect(estEmule(nom), nom).toBe(false);
  });
});

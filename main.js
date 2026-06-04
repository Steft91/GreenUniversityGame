import Phaser from 'phaser';
import MenuPrincipal from './src/scenes/MenuPrincipal.js';
import Nivel1_Parque from './src/scenes/Nivel1_Parque.js';
import Nivel1_Oceano from './src/scenes/Nivel1_Oceano.js';
import Nivel2_EnergiasRenovables from './src/scenes/Nivel2_EnergiasRenovables.js';
import Nivel3_ProblemaSolucion from './src/scenes/Nivel3_ProblemaSolucion.js';
import PantallaDecision from './src/scenes/PantallaDecision.js';
import NivelExtra_FindAndSort from './src/scenes/NivelExtra_FindAndSort.js';
import ResultadoFinal from './src/scenes/ResultadoFinal.js';

const config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#1a3a1a',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [
    MenuPrincipal,
    Nivel1_Parque,
    Nivel1_Oceano,
    Nivel2_EnergiasRenovables,
    Nivel3_ProblemaSolucion,
    PantallaDecision,
    NivelExtra_FindAndSort,
    ResultadoFinal
  ]
};

new Phaser.Game(config);

/**
 * UI_IndiceVerde
 * Componente reutilizable que puede lanzarse como escena paralela
 * para mostrar el Índice Verde, puntaje y vidas en cualquier nivel.
 *
 * Uso en cualquier escena:
 *   this.scene.launch('UI_IndiceVerde', { puntaje: 0, vidas: 3, indiceVerde: 0 });
 *   this.scene.bringToTop('UI_IndiceVerde');
 *
 * Para actualizar desde otra escena:
 *   const ui = this.scene.get('UI_IndiceVerde');
 *   ui.actualizar({ puntaje: 50, vidas: 2, indiceVerde: 30 });
 */
export default class UI_IndiceVerde extends Phaser.Scene {
  constructor() {
    super({ key: 'UI_IndiceVerde' });
  }

  init(data) {
    this.puntaje = data.puntaje || 0;
    this.vidas = data.vidas || 3;
    this.indiceVerde = data.indiceVerde || 0;
  }

  create() {
    const W = this.scale.width;

    // Panel HUD superior
    const hud = this.add.graphics();
    hud.fillStyle(0x000000, 0.55);
    hud.fillRect(0, 0, W, 44);
    hud.lineStyle(1, 0x2ecc71, 0.3);
    hud.lineBetween(0, 44, W, 44);

    // Ícono hoja
    this.add.text(14, 22, '🌿', { fontSize: '18px' }).setOrigin(0, 0.5);

    // Puntaje
    this.txtPuntaje = this.add.text(45, 22, `Puntaje: ${this.puntaje}`, {
      fontSize: '15px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Índice verde
    this.txtIndice = this.add.text(220, 22, `Índice Verde: ${this.indiceVerde}%`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#2ecc71'
    }).setOrigin(0, 0.5);

    // Vidas (corazones)
    this.txtVidas = this.add.text(W - 20, 22, this.renderVidas(this.vidas), {
      fontSize: '18px'
    }).setOrigin(1, 0.5);
  }

  renderVidas(n) {
    return '❤️'.repeat(Math.max(0, n)) + '🖤'.repeat(Math.max(0, 3 - n));
  }

  actualizar(data) {
    if (data.puntaje !== undefined) {
      this.puntaje = data.puntaje;
      this.txtPuntaje.setText(`Puntaje: ${this.puntaje}`);
    }
    if (data.indiceVerde !== undefined) {
      this.indiceVerde = data.indiceVerde;
      this.txtIndice.setText(`Índice Verde: ${this.indiceVerde}%`);
    }
    if (data.vidas !== undefined) {
      this.vidas = data.vidas;
      this.txtVidas.setText(this.renderVidas(this.vidas));
    }
  }
}

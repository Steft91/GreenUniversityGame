export default class PantallaDecision extends Phaser.Scene {
  constructor() {
    super({ key: 'PantallaDecision' });
  }

  init(data) {
    this.puntaje = data.puntaje || 0;
    this.vidas = data.vidas || 3;
    this.indiceVerde = data.indiceVerde || 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Fondo
    const fondo = this.add.graphics();
    fondo.fillGradientStyle(0x0d1f0d, 0x0d1f0d, 0x1a3a1a, 0x1a3a1a, 1);
    fondo.fillRect(0, 0, W, H);

    // Panel
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.5);
    panel.fillRoundedRect(W / 2 - 300, H / 2 - 190, 600, 380, 20);
    panel.lineStyle(2, 0xf1c40f, 0.8);
    panel.strokeRoundedRect(W / 2 - 300, H / 2 - 190, 600, 380, 20);

    this.add.text(W / 2, H / 2 - 155, '🎯 RETO EXTRA', {
      fontSize: '30px', fontFamily: 'Georgia, serif',
      color: '#f1c40f', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 105, `Puntaje actual: ${this.puntaje}`, {
      fontSize: '20px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 55,
      '¿Quieres intentar el reto opcional?\nArrastra los escudos al departamento correcto en 40 segundos.\nCada acierto suma bonus y cada error resta 3 segundos.',
      {
        fontSize: '15px', color: '#d4f5d4',
        align: 'center', lineSpacing: 8
      }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 20,
      'Si el tiempo termina, conservas el bonus que hayas ganado.', {
        fontSize: '13px', color: '#a8e6a3', fontStyle: 'italic'
      }).setOrigin(0.5);

    // Botón SÍ
    this.crearBoton(W / 2 - 110, H / 2 + 100, '✅  SÍ, acepto el reto', 0x27ae60, 0x1e8449, () => {
      this.scene.start('NivelExtra_FindAndSort', {
        puntaje: this.puntaje,
        vidas: this.vidas,
        indiceVerde: this.indiceVerde
      });
    });

    // Botón NO
    this.crearBoton(W / 2 + 110, H / 2 + 100, '❌  No, terminar juego', 0x922b21, 0x7b241c, () => {
      this.scene.start('ResultadoFinal', {
        puntaje: this.puntaje,
        vidas: this.vidas,
        indiceVerde: this.indiceVerde,
        nivelExtraCompletado: false
      });
    });
  }

  crearBoton(x, y, texto, colorBase, colorHover, cb) {
    const ancho = 200;
    const alto = 44;

    const bg = this.add.graphics();
    bg.fillStyle(colorBase, 1);
    bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);

    const label = this.add.text(x, y, texto, {
      fontSize: '13px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold',
      align: 'center', wordWrap: { width: ancho - 10 }
    }).setOrigin(0.5);

    const zona = this.add.zone(x, y, ancho, alto).setInteractive({ useHandCursor: true });
    zona.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(colorHover, 1);
      bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);
    });
    zona.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(colorBase, 1);
      bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);
    });
    zona.on('pointerdown', cb);
  }
}

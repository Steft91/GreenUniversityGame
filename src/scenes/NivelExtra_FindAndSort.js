export default class NivelExtra_FindAndSort extends Phaser.Scene {
  constructor() {
    super({ key: 'NivelExtra_FindAndSort' });
  }

  init(data) {
    this.puntaje = data.puntaje || 0;
    this.vidas = data.vidas || 3;
    this.indiceVerde = data.indiceVerde || 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add.rectangle(W / 2, H / 2, W, H, 0x3b1f00);

    this.add.text(W / 2, H / 2 - 60, '🔍 NIVEL EXTRA: FIND & SORT', {
      fontSize: '26px', fontFamily: 'Georgia, serif',
      color: '#f1c40f', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2, `Puntaje en juego: ${this.puntaje} → posible: ${this.puntaje * 2}`, {
      fontSize: '16px', color: '#ffe0a0'
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 + 40, '[ Escena en construcción ]', {
      fontSize: '14px', color: '#ffe0a0', fontStyle: 'italic'
    }).setOrigin(0.5);

    // Simular éxito o fallo para pruebas
    this.crearBotonTemp(W / 2 - 120, H / 2 + 120, '✅ Completé el reto', 0x27ae60, () => {
      this.scene.start('ResultadoFinal', {
        puntaje: this.puntaje * 2,
        vidas: this.vidas,
        indiceVerde: this.indiceVerde,
        nivelExtraCompletado: true
      });
    });

    this.crearBotonTemp(W / 2 + 120, H / 2 + 120, '❌ Fallé el reto', 0x922b21, () => {
      this.scene.start('ResultadoFinal', {
        puntaje: this.puntaje,
        vidas: this.vidas,
        indiceVerde: this.indiceVerde,
        nivelExtraCompletado: false
      });
    });
  }

  crearBotonTemp(x, y, texto, color, cb) {
    const bg = this.add.graphics();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - 105, y - 20, 210, 40, 8);
    this.add.text(x, y, texto, { fontSize: '13px', color: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.zone(x, y, 210, 40).setInteractive({ useHandCursor: true }).on('pointerdown', cb);
  }
}

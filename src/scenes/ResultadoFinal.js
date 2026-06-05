import progresoCampus from '../data/progresoCampus.json';

export default class ResultadoFinal extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultadoFinal' });
  }

  init(data) {
    this.puntaje = data.puntaje || 0;
    this.vidas = data.vidas || 0;
    this.indiceVerde = data.indiceVerde || 0;
    this.nivelExtraCompletado = data.nivelExtraCompletado || false;

    // Puntaje máximo posible sin nivel extra
    this.puntajeMaximo = 400;
    this.porcentaje = Math.min(100, Math.round((this.puntaje / this.puntajeMaximo) * 100));
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Obtener estado según porcentaje
    const estado = progresoCampus.find(e =>
      this.porcentaje >= e.porcentajeMinimo && this.porcentaje <= e.porcentajeMaximo
    ) || progresoCampus[0];

    // Fondo
    const fondo = this.add.graphics();
    fondo.fillGradientStyle(0x061206, 0x061206, 0x0d2b0d, 0x0d2b0d, 1);
    fondo.fillRect(0, 0, W, H);

    // Estrellas de fondo
    for (let i = 0; i < 30; i++) {
      const star = this.add.graphics();
      star.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.1, 0.4));
      star.fillCircle(
        Phaser.Math.Between(0, W),
        Phaser.Math.Between(0, H),
        Phaser.Math.FloatBetween(1, 2.5)
      );
    }

    // Panel principal
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.55);
    panel.fillRoundedRect(W / 2 - 340, 30, 680, H - 60, 20);
    panel.lineStyle(2, Phaser.Display.Color.HexStringToColor(estado.color).color, 0.9);
    panel.strokeRoundedRect(W / 2 - 340, 30, 680, H - 60, 20);

    // Título del nivel alcanzado
    this.add.text(W / 2, 75, estado.titulo.toUpperCase(), {
      fontSize: '34px', fontFamily: 'Georgia, serif',
      color: estado.color, fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 4
    }).setOrigin(0.5);

    // Animación de entrada del título
    this.cameras.main.setAlpha(0);
    this.tweens.add({ targets: this.cameras.main, alpha: 1, duration: 600, ease: 'Power2' });

    // Separador
    const sep = this.add.graphics();
    sep.lineStyle(1, 0x2ecc71, 0.3);
    sep.lineBetween(W / 2 - 280, 105, W / 2 + 280, 105);

    // Puntaje grande
    this.add.text(W / 2, 145, `${this.puntaje} puntos`, {
      fontSize: '48px', fontFamily: 'Georgia, serif',
      color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(W / 2, 190, `${this.porcentaje}% del puntaje máximo`, {
      fontSize: '16px', color: '#a8e6a3'
    }).setOrigin(0.5);

    // Barra de progreso
    this.dibujarBarraProgreso(W / 2, 225, 500, 20, this.porcentaje / 100,
      Phaser.Display.Color.HexStringToColor(estado.color).color);

    // Stats
    this.dibujarStats(W / 2, 290);

    // Nivel extra
    if (this.nivelExtraCompletado) {
      this.add.text(W / 2, 340, '🎯 ¡Nivel extra completado! Puntaje duplicado', {
        fontSize: '14px', color: '#f1c40f', fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    // Mensaje del estado
    this.add.text(W / 2, 375, estado.mensaje, {
      fontSize: '15px', color: '#d4f5d4',
      align: 'center', wordWrap: { width: 560 }, lineSpacing: 6
    }).setOrigin(0.5);

    // Separador
    const sep2 = this.add.graphics();
    sep2.lineStyle(1, 0x2ecc71, 0.2);
    sep2.lineBetween(W / 2 - 280, 415, W / 2 + 280, 415);

    // Botones
    this.crearBoton(W / 2 - 130, 460, '🔄  JUGAR DE NUEVO', 0x27ae60, 0x1e8449, () => {
      this.scene.start('Nivel1_Oceano', { puntaje: 0, vidas: 3, indiceVerde: 0 });
    });

    this.crearBoton(W / 2 + 130, 460, '🏠  MENÚ PRINCIPAL', 0x1a5276, 0x154360, () => {
      this.scene.start('MenuPrincipal');
    });

    // Compartir puntaje (decorativo)
    this.add.text(W / 2, 510, `🌿 Campus Verde: Misión Green University`, {
      fontSize: '12px', color: '#4a7a4a', fontStyle: 'italic'
    }).setOrigin(0.5);
  }

  dibujarBarraProgreso(x, y, ancho, alto, progreso, color) {
    const g = this.add.graphics();
    // Fondo
    g.fillStyle(0x1a1a1a, 1);
    g.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, alto / 2);
    // Relleno
    const relleno = Math.max(alto, progreso * ancho);
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - ancho / 2, y - alto / 2, relleno, alto, alto / 2);
    // Borde
    g.lineStyle(1, 0xffffff, 0.2);
    g.strokeRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, alto / 2);

    // Animar la barra
    const barraAnim = this.add.graphics();
    let progActual = 0;
    this.tweens.addCounter({
      from: 0,
      to: progreso,
      duration: 1000,
      ease: 'Power2',
      onUpdate: (tween) => {
        progActual = tween.getValue();
        barraAnim.clear();
        barraAnim.fillStyle(color, 1);
        const w = Math.max(alto, progActual * ancho);
        barraAnim.fillRoundedRect(x - ancho / 2, y - alto / 2, w, alto, alto / 2);
      }
    });

    // Texto del porcentaje sobre la barra
    this.add.text(x, y, `${Math.round(progreso * 100)}%`, {
      fontSize: '12px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(10);
  }

  dibujarStats(x, y) {
    const stats = [
      { label: 'Puntaje final', valor: `${this.puntaje} pts` },
      { label: 'Vidas restantes', valor: `${'❤️'.repeat(Math.max(0, this.vidas))} (${this.vidas})` },
      { label: 'Nivel extra', valor: this.nivelExtraCompletado ? '✅ Completado' : '—' }
    ];

    stats.forEach((stat, i) => {
      const sx = x - 200 + i * 200;
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, 0.05);
      bg.fillRoundedRect(sx - 85, y - 20, 170, 44, 8);

      this.add.text(sx, y - 8, stat.label, {
        fontSize: '11px', color: '#7dcea0'
      }).setOrigin(0.5);
      this.add.text(sx, y + 10, stat.valor, {
        fontSize: '14px', color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);
    });
  }

  crearBoton(x, y, texto, colorBase, colorHover, cb) {
    const ancho = 220;
    const alto = 44;

    const bg = this.add.graphics();
    bg.fillStyle(colorBase, 1);
    bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);

    const label = this.add.text(x, y, texto, {
      fontSize: '14px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold'
    }).setOrigin(0.5);

    const zona = this.add.zone(x, y, ancho, alto).setInteractive({ useHandCursor: true });
    zona.on('pointerover', () => {
      bg.clear(); bg.fillStyle(colorHover, 1);
      bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);
    });
    zona.on('pointerout', () => {
      bg.clear(); bg.fillStyle(colorBase, 1);
      bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);
    });
    zona.on('pointerdown', cb);
  }
}

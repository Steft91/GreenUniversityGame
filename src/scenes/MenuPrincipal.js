export default class MenuPrincipal extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuPrincipal' });
  }

  preload() {
    this.load.image('logo_institucional', 'assets/escenarios/image.png');
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // --- FONDO degradado con rectángulos (placeholder hasta tener assets) ---
    const fondo = this.add.graphics();
    fondo.fillGradientStyle(0x0d2b0d, 0x0d2b0d, 0x1a5c1a, 0x1a5c1a, 1);
    fondo.fillRect(0, 0, W, H);

    // Círculos decorativos de fondo
    for (let i = 0; i < 6; i++) {
      const circ = this.add.graphics();
      circ.lineStyle(1, 0x2ecc71, 0.15);
      circ.strokeCircle(
        Phaser.Math.Between(50, W - 50),
        Phaser.Math.Between(50, H - 50),
        Phaser.Math.Between(40, 120)
      );
    }

    this.dibujarLogoInstitucional(W);

    // --- PANEL CENTRAL ---
    const panel = this.add.graphics();
    panel.fillStyle(0x000000, 0.45);
    panel.fillRoundedRect(W / 2 - 320, H / 2 - 220, 640, 440, 20);
    panel.lineStyle(2, 0x2ecc71, 0.6);
    panel.strokeRoundedRect(W / 2 - 320, H / 2 - 220, 640, 440, 20);

    // --- ÍCONO hoja (placeholder: círculo verde) ---
    const hoja = this.add.graphics();
    hoja.fillStyle(0x27ae60, 1);
    hoja.fillCircle(W / 2, H / 2 - 165, 28);
    hoja.fillStyle(0x2ecc71, 1);
    hoja.fillCircle(W / 2, H / 2 - 165, 18);

    // --- TÍTULO ---
    this.add.text(W / 2, H / 2 - 120, 'CAMPUS VERDE', {
      fontSize: '42px',
      fontFamily: 'Georgia, serif',
      color: '#2ecc71',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 75, 'Misión Green University', {
      fontSize: '20px',
      fontFamily: 'Georgia, serif',
      color: '#a8e6a3',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Línea separadora
    const linea = this.add.graphics();
    linea.lineStyle(1, 0x2ecc71, 0.4);
    linea.lineBetween(W / 2 - 200, H / 2 - 50, W / 2 + 200, H / 2 - 50);

    // --- DESCRIPCIÓN ---
    this.add.text(W / 2, H / 2 - 15, 'Ayuda a transformar la universidad\nen un campus sostenible.', {
      fontSize: '15px',
      fontFamily: 'Arial, sans-serif',
      color: '#d4f5d4',
      align: 'center',
      lineSpacing: 6
    }).setOrigin(0.5);

    // --- BOTONES ---
    this.crearBoton(W / 2, H / 2 + 65, '🌿  JUGAR', 0x27ae60, 0x1e8449, () => {
      this.scene.start('Nivel1_Parque', { puntaje: 0, vidas: 3, indiceVerde: 0 });
    });

    this.crearBoton(W / 2, H / 2 + 125, '📖  INSTRUCCIONES', 0x1a5276, 0x154360, () => {
      this.mostrarInstrucciones();
    });

    this.crearBoton(W / 2, H / 2 + 185, '🏆  CRÉDITOS', 0x4a235a, 0x3b1a47, () => {
      this.mostrarCreditos();
    });

    // --- VERSIÓN ---
    this.add.text(W - 10, H - 10, 'v1.0', {
      fontSize: '11px',
      color: '#4a7a4a'
    }).setOrigin(1, 1);

    // Animación sutil de entrada
    this.cameras.main.setAlpha(0);
    this.tweens.add({
      targets: this.cameras.main,
      alpha: 1,
      duration: 800,
      ease: 'Power2'
    });
  }

  dibujarLogoInstitucional(W) {
    this.add.image(W / 2, 42, 'logo_institucional').setDisplaySize(360, 55);
  }

  crearBoton(x, y, texto, colorBase, colorHover, callback) {
    const ancho = 260;
    const alto = 44;

    const bg = this.add.graphics();
    bg.fillStyle(colorBase, 1);
    bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);

    const label = this.add.text(x, y, texto, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Zona interactiva
    const zona = this.add.zone(x, y, ancho, alto).setInteractive({ useHandCursor: true });

    zona.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(colorHover, 1);
      bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);
      this.tweens.add({ targets: label, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });

    zona.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(colorBase, 1);
      bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);
      this.tweens.add({ targets: label, scaleX: 1, scaleY: 1, duration: 100 });
    });

    zona.on('pointerdown', () => {
      this.tweens.add({
        targets: [bg, label],
        alpha: 0.7,
        duration: 80,
        yoyo: true,
        onComplete: callback
      });
    });
  }

  mostrarInstrucciones() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Overlay oscuro
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, W, H);
    overlay.setInteractive(); // bloquea clics al fondo
    const elementosModal = [overlay];

    const panel = this.add.graphics();
    panel.fillStyle(0x0d2b0d, 1);
    panel.fillRoundedRect(W / 2 - 300, H / 2 - 210, 600, 420, 16);
    panel.lineStyle(2, 0x2ecc71, 0.8);
    panel.strokeRoundedRect(W / 2 - 300, H / 2 - 210, 600, 420, 16);
    elementosModal.push(panel);

    const titulo = this.add.text(W / 2, H / 2 - 175, '📖 INSTRUCCIONES', {
      fontSize: '22px', fontFamily: 'Georgia, serif',
      color: '#2ecc71', fontStyle: 'bold'
    }).setOrigin(0.5);
    elementosModal.push(titulo);

    const instrucciones = [
      '🌿 Nivel 1 — Parque y Océano',
      '   Arrastra cada residuo al basurero correcto.',
      '   Tienes 3 vidas. Cada error te quita 1.',
      '',
      '⚡ Nivel 2 — Energías Renovables',
      '   Arrastra el recurso natural a su tecnología.',
      '',
      '🧩 Nivel 3 — Problema y Solución',
      '   Encuentra los pares de cartas correctos.',
      '',
      '🎯 Nivel Extra (opcional)',
      '   Encuentra y clasifica 5 objetos a tiempo.',
      '   Si lo logras, ¡duplicas tu puntaje!'
    ];

    instrucciones.forEach((linea, i) => {
      const texto = this.add.text(W / 2 - 250, H / 2 - 135 + i * 22, linea, {
        fontSize: '13px', fontFamily: 'Arial, sans-serif',
        color: linea.startsWith('   ') ? '#a8e6a3' : '#ffffff'
      });
      elementosModal.push(texto);
    });

    // Botón cerrar
    this.crearBotonCerrar(W / 2, H / 2 + 175, elementosModal);
  }

  mostrarCreditos() {
    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, W, H);
    overlay.setInteractive();
    const elementosModal = [overlay];

    const panel = this.add.graphics();
    panel.fillStyle(0x0d2b0d, 1);
    panel.fillRoundedRect(W / 2 - 250, H / 2 - 160, 500, 320, 16);
    panel.lineStyle(2, 0x2ecc71, 0.8);
    panel.strokeRoundedRect(W / 2 - 250, H / 2 - 160, 500, 320, 16);
    elementosModal.push(panel);

    const titulo = this.add.text(W / 2, H / 2 - 130, '🏆 CRÉDITOS', {
      fontSize: '22px', fontFamily: 'Georgia, serif',
      color: '#2ecc71', fontStyle: 'bold'
    }).setOrigin(0.5);
    elementosModal.push(titulo);

    const creditos = [
      'Campus Verde: Misión Green University',
      '',
      'Diseño y concepto: Stefany Díaz',
      'Desarrollo: Phaser 3 + Vite',
      '',
      'Un proyecto de educación ambiental',
      'para transformar universidades',
      'en espacios sostenibles y concientizar.'
    ];

    creditos.forEach((linea, i) => {
      const texto = this.add.text(W / 2, H / 2 - 75 + i * 24, linea, {
        fontSize: '14px', fontFamily: 'Arial, sans-serif',
        color: i === 0 ? '#2ecc71' : '#d4f5d4',
        fontStyle: i === 0 ? 'bold' : 'normal'
      }).setOrigin(0.5);
      elementosModal.push(texto);
    });

    this.crearBotonCerrar(W / 2, H / 2 + 135, elementosModal);
  }

  crearBotonCerrar(x, y, elementosModal = []) {
    const bg = this.add.graphics();
    bg.fillStyle(0x7f1d1d, 1);
    bg.fillRoundedRect(x - 70, y - 18, 140, 36, 8);

    const label = this.add.text(x, y, '✕  CERRAR', {
      fontSize: '14px', fontFamily: 'Arial, sans-serif',
      color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    const zona = this.add.zone(x, y, 140, 36).setInteractive({ useHandCursor: true });
    elementosModal.push(bg, label, zona);

    zona.on('pointerdown', () => {
      elementosModal.forEach(e => e.destroy());
    });
  }
}

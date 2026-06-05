import departamentosData from '../data/departamentos.json';

export default class NivelExtra_FindAndSort extends Phaser.Scene {
  constructor() {
    super({ key: 'NivelExtra_FindAndSort' });
  }

  init(data) {
    this.puntaje = data.puntaje ?? 0;
    this.vidas = data.vidas ?? 3;
    this.indiceVerde = data.indiceVerde ?? 0;

    this.tiempoRestante = 40;
    this.bonus = 0;
    this.aciertos = 0;
    this.escudoActivo = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.nivelTerminado = false;
  }

  preload() {
    this.load.image('fondo_departamentos', 'assets/escenarios/fondo_departamentos.png');
    this.load.image('temporizador', 'assets/ui/temporizador.png');
    this.load.image('popup_correcto', 'assets/ui/popup_correcto.png');
    this.load.image('popup_error', 'assets/ui/popup_error.png');

    departamentosData.forEach(dep => {
      this.load.image(dep.sprite, `assets/departamentos/${dep.sprite}.png`);
    });

    this.load.on('loaderror', (file) => {
      console.warn(`No se pudo cargar: ${file.key} (${file.url})`);
    });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    const fondo = this.add.image(W / 2, H / 2, 'fondo_departamentos');
    fondo.setDisplaySize(W, H);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x0b1020, 0.36);
    overlay.fillRect(0, 44, W, H - 44);

    this.dibujarHUD();
    this.dibujarZonasDepartamentos();
    this.crearEscudos();
    this.configurarDragGlobal();
    this.mostrarIntro();
  }

  dibujarHUD() {
    const W = this.scale.width;

    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x111827, 0.92);
    hudBg.fillRect(0, 0, W, 44);
    hudBg.lineStyle(1, 0xf1c40f, 0.55);
    hudBg.lineBetween(0, 44, W, 44);

    this.add.text(14, 22, 'RETO OPCIONAL: RECONOCE LOS DEPARTAMENTOS', {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.add.image(405, 22, 'temporizador').setDisplaySize(24, 24);

    this.txtTiempo = this.add.text(425, 22, `Tiempo: ${this.tiempoRestante}s`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.txtBonus = this.add.text(580, 22, `Puntaje bonus: ${this.bonus}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#d4f5d4',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.txtAciertos = this.add.text(W - 15, 22, `Aciertos: ${this.aciertos}/${departamentosData.length}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(1, 0.5);
  }

  actualizarHUD() {
    this.txtTiempo.setText(`Tiempo: ${this.tiempoRestante}s`);
    this.txtBonus.setText(`Puntaje bonus: ${this.bonus}`);
    this.txtAciertos.setText(`Aciertos: ${this.aciertos}/${departamentosData.length}`);

    if (this.tiempoRestante <= 10) {
      this.txtTiempo.setColor('#ff7675');
    }
  }

  dibujarZonasDepartamentos() {
    this.add.text(this.scale.width / 2, 388, 'ARRASTRA CADA ESCUDO AL DEPARTAMENTO CORRECTO', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#f8f9fa',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const posiciones = [
      { x: 95, y: 435 }, { x: 270, y: 435 }, { x: 445, y: 435 }, { x: 620, y: 435 }, { x: 795, y: 435 },
      { x: 95, y: 520 }, { x: 270, y: 520 }, { x: 445, y: 520 }, { x: 620, y: 520 }, { x: 795, y: 520 },
    ];

    this.zonasDepartamento = departamentosData.map((dep, i) => {
      const pos = posiciones[i];
      const zona = new Phaser.Geom.Rectangle(pos.x - 78, pos.y - 28, 156, 58);

      const bg = this.add.graphics();
      bg.fillStyle(0x111827, 0.72);
      bg.fillRoundedRect(zona.x, zona.y, zona.width, zona.height, 10);
      bg.lineStyle(1.5, 0xffffff, 0.35);
      bg.strokeRoundedRect(zona.x, zona.y, zona.width, zona.height, 10);

      const txt = this.add.text(pos.x, pos.y, dep.nombre, {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
        fontStyle: 'bold',
        wordWrap: { width: 140 }
      }).setOrigin(0.5);

      return {
        id: dep.id,
        nombre: dep.nombre,
        zona,
        x: pos.x,
        y: pos.y,
        bg,
        txt,
        ocupado: false
      };
    });
  }

  crearEscudos() {
    const posiciones = [
      { x: 190, y: 105 }, { x: 330, y: 105 }, { x: 470, y: 105 }, { x: 610, y: 105 },
      { x: 190, y: 205 }, { x: 330, y: 205 }, { x: 470, y: 205 }, { x: 610, y: 205 },
      { x: 330, y: 305 }, { x: 470, y: 305 },
    ];

    const departamentos = Phaser.Utils.Array.Shuffle([...departamentosData]);

    this.escudos = departamentos.map((dep, i) => {
      const pos = posiciones[i];

      const soporte = this.add.graphics();
      soporte.fillStyle(0xdfe6e9, 0.58);
      soporte.fillRoundedRect(pos.x - 43, pos.y - 43, 86, 86, 14);
      soporte.lineStyle(1.5, 0xffffff, 0.45);
      soporte.strokeRoundedRect(pos.x - 43, pos.y - 43, 86, 86, 14);

      const img = this.add.image(pos.x, pos.y, dep.sprite);
      img.setDisplaySize(68, 68);
      img.setInteractive({ useHandCursor: true });
      img.setDepth(6);

      soporte.setDepth(5);

      img.datosDepartamento = dep;
      img.soporte = soporte;
      img.posOriginal = { x: pos.x, y: pos.y };
      img.escalaOriginal = { x: img.scaleX, y: img.scaleY };
      img.bloqueado = false;

      img.on('pointerdown', (pointer) => {
        if (this.nivelTerminado || img.bloqueado) return;
        this.tweens.killTweensOf(img);
        this.escudoActivo = img;
        this.offsetX = img.x - pointer.x;
        this.offsetY = img.y - pointer.y;
        img.setDepth(20);
        img.soporte.setDepth(19);
      });

      return img;
    });
  }

  configurarDragGlobal() {
    this.input.on('pointermove', (pointer) => {
      if (!this.escudoActivo) return;

      const x = pointer.x + this.offsetX;
      const y = pointer.y + this.offsetY;

      this.escudoActivo.x = x;
      this.escudoActivo.y = y;
      this.moverSoporte(this.escudoActivo, x, y);
    });

    this.input.on('pointerup', (pointer) => {
      if (!this.escudoActivo) return;

      const escudo = this.escudoActivo;
      this.escudoActivo = null;

      const destino = this.zonasDepartamento.find(zona =>
        zona.zona.contains(pointer.x, pointer.y)
      );

      if (destino) {
        this.evaluarDrop(escudo, destino);
      } else {
        this.devolverEscudo(escudo);
      }
    });
  }

  moverSoporte(escudo, x, y) {
    escudo.soporte.clear();
    escudo.soporte.fillStyle(0xdfe6e9, 0.58);
    escudo.soporte.fillRoundedRect(x - 43, y - 43, 86, 86, 14);
    escudo.soporte.lineStyle(1.5, 0xffffff, 0.45);
    escudo.soporte.strokeRoundedRect(x - 43, y - 43, 86, 86, 14);
  }

  evaluarDrop(escudo, destino) {
    const correcto = escudo.datosDepartamento.id === destino.id;

    if (correcto) {
      this.bloquearEscudo(escudo, destino);
      this.bonus += escudo.datosDepartamento.puntos;
      this.aciertos++;
      this.indiceVerde = Math.min(100, this.indiceVerde + 3);
      destino.ocupado = true;
      this.actualizarHUD();
      this.flashZona(destino, 0x2ecc71);
      this.mostrarFeedback(true, `Correcto: ${destino.nombre}`);
      this.verificarFinNivel();
      return;
    }

    this.tiempoRestante = Math.max(0, this.tiempoRestante - 3);
    this.actualizarHUD();
    this.flashZona(destino, 0xe74c3c);
    this.cameras.main.shake(220, 0.005);
    this.mostrarFeedback(false, 'No coincide. Pierdes 3 segundos.');
    this.devolverEscudo(escudo);

    if (this.tiempoRestante <= 0) {
      this.finNivel(false);
    }
  }

  bloquearEscudo(escudo, destino) {
    escudo.bloqueado = true;
    escudo.disableInteractive();
    escudo.setDepth(16);
    escudo.soporte.setDepth(15);

    this.tweens.add({
      targets: escudo,
      x: destino.x - 58,
      y: destino.y,
      scaleX: escudo.escalaOriginal.x * 0.52,
      scaleY: escudo.escalaOriginal.y * 0.52,
      duration: 260,
      ease: 'Power2',
      onUpdate: () => this.moverSoportePequeno(escudo),
      onComplete: () => this.moverSoportePequeno(escudo)
    });
  }

  moverSoportePequeno(escudo) {
    escudo.soporte.clear();
    escudo.soporte.fillStyle(0xdfe6e9, 0.44);
    escudo.soporte.fillRoundedRect(escudo.x - 21, escudo.y - 21, 42, 42, 8);
    escudo.soporte.lineStyle(1, 0xffffff, 0.35);
    escudo.soporte.strokeRoundedRect(escudo.x - 21, escudo.y - 21, 42, 42, 8);
  }

  devolverEscudo(escudo) {
    escudo.setDepth(6);
    escudo.soporte.setDepth(5);
    this.tweens.add({
      targets: escudo,
      x: escudo.posOriginal.x,
      y: escudo.posOriginal.y,
      scaleX: escudo.escalaOriginal.x,
      scaleY: escudo.escalaOriginal.y,
      duration: 280,
      ease: 'Back.easeOut',
      onUpdate: () => this.moverSoporte(escudo, escudo.x, escudo.y),
      onComplete: () => this.moverSoporte(escudo, escudo.x, escudo.y)
    });
  }

  iniciarTemporizador() {
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        if (this.nivelTerminado) return;
        this.tiempoRestante--;
        this.actualizarHUD();

        if (this.tiempoRestante <= 0) {
          this.finNivel(false);
        }
      }
    });
  }

  flashZona(destino, color) {
    const flash = this.add.graphics().setDepth(14);
    flash.fillStyle(color, 0.42);
    flash.fillRoundedRect(destino.zona.x, destino.zona.y, destino.zona.width, destino.zona.height, 10);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 450,
      onComplete: () => flash.destroy()
    });
  }

  mostrarFeedback(correcto, mensaje) {
    if (this.feedbackActual) {
      this.feedbackActual.forEach(el => el.destroy());
      this.feedbackActual = null;
    }

    const W = this.scale.width;
    const y = 372;
    const ancho = 430;

    const bg = this.add.graphics().setDepth(30);
    bg.fillStyle(correcto ? 0x0d3b2a : 0x3b1414, 0.92);
    bg.fillRoundedRect(W / 2 - ancho / 2, y - 24, ancho, 48, 10);
    bg.lineStyle(2, correcto ? 0x2ecc71 : 0xe74c3c, 0.85);
    bg.strokeRoundedRect(W / 2 - ancho / 2, y - 24, ancho, 48, 10);

    const icono = this.add.image(W / 2 - ancho / 2 + 28, y, correcto ? 'popup_correcto' : 'popup_error')
      .setDisplaySize(30, 30)
      .setDepth(31);

    const txt = this.add.text(W / 2 + 18, y, mensaje, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: ancho - 80 }
    }).setOrigin(0.5).setDepth(31);

    this.feedbackActual = [bg, icono, txt];
    this.time.delayedCall(1300, () => {
      if (this.feedbackActual?.[0] === bg) {
        this.feedbackActual.forEach(el => el.destroy());
        this.feedbackActual = null;
      }
    });
  }

  mostrarIntro() {
    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.graphics().setDepth(40);
    overlay.fillStyle(0x000000, 0.66);
    overlay.fillRect(0, 0, W, H);

    const panel = this.add.graphics().setDepth(41);
    panel.fillStyle(0x111827, 1);
    panel.fillRoundedRect(W / 2 - 300, H / 2 - 120, 600, 240, 16);
    panel.lineStyle(2, 0xf1c40f, 0.9);
    panel.strokeRoundedRect(W / 2 - 300, H / 2 - 120, 600, 240, 16);

    const t1 = this.add.text(W / 2, H / 2 - 84, 'RETO OPCIONAL: RECONOCE LOS DEPARTAMENTOS', {
      fontSize: '22px',
      fontFamily: 'Georgia, serif',
      color: '#f1c40f',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(42);

    const t2 = this.add.text(W / 2, H / 2 - 24,
      'Arrastra cada escudo hacia el nombre de su departamento.\nTienes 40 segundos. Cada error resta 3 segundos.', {
        fontSize: '15px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8
      }).setOrigin(0.5).setDepth(42);

    const t3 = this.add.text(W / 2, H / 2 + 36,
      'Los aciertos suman puntaje bonus para tu resultado final.', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#d4f5d4',
        fontStyle: 'italic'
      }).setOrigin(0.5).setDepth(42);

    const btnBg = this.add.graphics().setDepth(42);
    btnBg.fillStyle(0x27ae60, 1);
    btnBg.fillRoundedRect(W / 2 - 92, H / 2 + 72, 184, 42, 10);

    const btnTxt = this.add.text(W / 2, H / 2 + 93, 'COMENZAR', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(43);

    const btnZona = this.add.zone(W / 2, H / 2 + 93, 184, 42)
      .setInteractive({ useHandCursor: true })
      .setDepth(44);

    btnZona.on('pointerdown', () => {
      [overlay, panel, t1, t2, t3, btnBg, btnTxt, btnZona].forEach(e => e.destroy());
      this.iniciarTemporizador();
    });
  }

  verificarFinNivel() {
    if (this.aciertos >= departamentosData.length && !this.nivelTerminado) {
      this.finNivel(true);
    }
  }

  finNivel(completado) {
    if (this.nivelTerminado) return;
    this.nivelTerminado = true;
    this.escudoActivo = null;

    if (this.timerEvent) {
      this.timerEvent.remove(false);
    }

    const puntajeFinal = this.puntaje + this.bonus;
    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.graphics().setDepth(50);
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(0, 0, W, H);

    const panel = this.add.graphics().setDepth(51);
    panel.fillStyle(completado ? 0x10291a : 0x2f1d12, 1);
    panel.fillRoundedRect(W / 2 - 260, H / 2 - 125, 520, 250, 16);
    panel.lineStyle(2, completado ? 0x2ecc71 : 0xf1c40f, 0.9);
    panel.strokeRoundedRect(W / 2 - 260, H / 2 - 125, 520, 250, 16);

    this.add.text(W / 2, H / 2 - 88,
      completado ? 'Reto completado' : 'Tiempo terminado', {
        fontSize: '28px',
        fontFamily: 'Georgia, serif',
        color: completado ? '#2ecc71' : '#f1c40f',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(52);

    this.add.text(W / 2, H / 2 - 35,
      `Aciertos: ${this.aciertos}/${departamentosData.length}\nBonus ganado: ${this.bonus} pts`, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8
      }).setOrigin(0.5).setDepth(52);

    this.add.text(W / 2, H / 2 + 22,
      `Puntaje final: ${puntajeFinal} pts`, {
        fontSize: '15px',
        fontFamily: 'Arial',
        color: '#d4f5d4',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(52);

    this.crearBotonFin(W / 2, H / 2 + 78, 'Ver resultado final', 0x1a5276, () => {
      this.scene.start('ResultadoFinal', {
        puntaje: puntajeFinal,
        vidas: this.vidas,
        indiceVerde: this.indiceVerde,
        nivelExtraCompletado: completado
      });
    });
  }

  crearBotonFin(x, y, texto, color, cb) {
    const ancho = 210;
    const alto = 42;

    const bg = this.add.graphics().setDepth(52);
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);

    this.add.text(x, y, texto, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(53);

    this.add.zone(x, y, ancho, alto)
      .setInteractive({ useHandCursor: true })
      .setDepth(54)
      .on('pointerdown', cb);
  }
}

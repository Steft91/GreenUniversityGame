import energiasData from '../data/energias.json';

export default class Nivel2_EnergiasRenovables extends Phaser.Scene {
  constructor() {
    super({ key: 'Nivel2_EnergiasRenovables' });
  }

  init(data) {
    this.puntaje = data.puntaje ?? 0;
    this.vidas = data.vidas ?? 3;
    this.indiceVerde = data.indiceVerde ?? 0;

    this.recursoActivo = null;
    this.offsetX = 0;
    this.offsetY = 0;
    this.popupActivo = false;
    this.nivelTerminado = false;
    this.recursosPendientes = [];
    this.recursosEnPantalla = 0;
  }

  preload() {
    this.load.image('energias_fondo', 'assets/escenarios/energias_fondo.png');

    energiasData.forEach(item => {
      this.load.image(item.recurso.sprite, `assets/energias/${item.recurso.sprite}.png`);
      this.load.image(item.tecnologia.sprite, `assets/energias/${item.tecnologia.sprite}.png`);
    });

    this.load.on('loaderror', (file) => {
      console.warn(`No se pudo cargar: ${file.key} (${file.url})`);
    });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    const fondo = this.add.image(W / 2, H / 2, 'energias_fondo');
    fondo.setDisplaySize(W, H);

    const overlay = this.add.graphics();
    overlay.fillStyle(0xffffff, 0.12);
    overlay.fillRect(0, 44, W, H - 44);

    this.dibujarHUD();
    this.dibujarTecnologias();

    this.recursosPendientes = Phaser.Utils.Array.Shuffle([...energiasData]);
    this.recursosRestantes = this.recursosPendientes.length;
    this.actualizarHUD();

    this.configurarDragGlobal();
    this.mostrarIntro();
  }

  dibujarHUD() {
    const W = this.scale.width;

    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x12324a, 0.9);
    hudBg.fillRect(0, 0, W, 44);
    hudBg.lineStyle(1, 0xffd166, 0.55);
    hudBg.lineBetween(0, 44, W, 44);

    this.add.text(14, 22, 'ENERGIAS', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffd166',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.txtPuntaje = this.add.text(165, 22, `Puntaje: ${this.puntaje}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    this.txtRestantes = this.add.text(330, 22, 'Recursos: 0', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#fff3bf'
    }).setOrigin(0, 0.5);

    this.txtVidas = this.add.text(W - 15, 22, this.renderVidas(), {
      fontSize: '18px'
    }).setOrigin(1, 0.5);
  }

  renderVidas() {
    return '❤️'.repeat(Math.max(0, this.vidas)) + '🖤'.repeat(Math.max(0, 3 - this.vidas));
  }

  actualizarHUD() {
    this.txtPuntaje.setText(`Puntaje: ${this.puntaje}`);
    this.txtRestantes.setText(`Recursos: ${this.recursosRestantes}`);
    this.txtVidas.setText(this.renderVidas());
  }

  dibujarTecnologias() {
    const H = this.scale.height;
    const posicionesX = [120, 285, 450, 615, 780];

    this.tecnologiasConfig = energiasData.map((item, i) => {
      const x = posicionesX[i];
      const y = H - 82;
      const zona = new Phaser.Geom.Rectangle(x - 65, y - 70, 130, 128);

      const marco = this.add.graphics();
      marco.fillStyle(0x0b2d42, 0.62);
      marco.fillRoundedRect(zona.x, zona.y, zona.width, zona.height, 10);
      marco.lineStyle(1.5, 0xffffff, 0.35);
      marco.strokeRoundedRect(zona.x, zona.y, zona.width, zona.height, 10);

      const img = this.add.image(x, y - 22, item.tecnologia.sprite);
      const tam = this.obtenerTamanoTecnologia(item.tecnologia.sprite);
      img.setDisplaySize(tam.w, tam.h);

      this.add.text(x, y + 44, item.tecnologia.nombre, {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: 102 }
      }).setOrigin(0.5);

      return {
        idEnergia: item.id,
        nombre: item.tecnologia.nombre,
        zona,
        cx: x,
        cy: y - 22,
        marco
      };
    });
  }

  obtenerTamanoTecnologia(sprite) {
    const tamanos = {
      panel_solar: { w: 72, h: 80 },
      aerogenerador: { w: 72, h: 84 },
      represa: { w: 92, h: 72 },
      planta_biomasa: { w: 96, h: 66 },
      planta_geotermica: { w: 96, h: 66 },
    };
    return tamanos[sprite] ?? { w: 68, h: 58 };
  }

  obtenerTamanoRecurso(sprite) {
    const tamanos = {
      sol: { w: 58, h: 58 },
      viento: { w: 62, h: 62 },
      agua_corriente: { w: 58, h: 58 },
      biomasa: { w: 66, h: 50 },
      vapor_geotermico: { w: 58, h: 58 },
      marea: { w: 58, h: 58 },
      olas: { w: 68, h: 48 },
    };
    return tamanos[sprite] ?? { w: 58, h: 58 };
  }

  configurarDragGlobal() {
    this.input.on('pointermove', (pointer) => {
      if (!this.recursoActivo) return;
      this.recursoActivo.x = pointer.x + this.offsetX;
      this.recursoActivo.y = pointer.y + this.offsetY;
    });

    this.input.on('pointerup', (pointer) => {
      if (!this.recursoActivo) return;

      const sprite = this.recursoActivo;
      this.recursoActivo = null;
      sprite.estaArrastrado = false;
      this.quitarResaltado();

      const destino = this.tecnologiasConfig.find(cfg =>
        cfg.zona.contains(pointer.x, pointer.y)
      );

      if (destino) {
        this.evaluarDrop(sprite, destino);
      } else {
        this.reanudarCaida(sprite);
      }
    });
  }

  iniciarLluviaRecursos() {
    this.time.delayedCall(500, () => this.lanzarSiguienteRecurso());
  }

  lanzarSiguienteRecurso() {
    if (this.nivelTerminado || this.popupActivo) return;
    if (this.recursosPendientes.length === 0) return;

    const item = this.recursosPendientes.shift();
    const x = Phaser.Math.Between(70, this.scale.width - 70);
    const sprite = this.add.image(x, -45, item.recurso.sprite);
    const tam = this.obtenerTamanoRecurso(item.recurso.sprite);
    sprite.setDisplaySize(tam.w, tam.h);
    sprite.setInteractive({ useHandCursor: true });
    sprite.setDepth(8);
    sprite.escalaOriginal = { x: sprite.scaleX, y: sprite.scaleY };
    sprite.datosEnergia = item;
    sprite.estaArrastrado = false;
    this.recursosEnPantalla++;

    sprite.on('pointerover', () => this.mostrarTooltip(sprite, item.recurso.nombre));
    sprite.on('pointerout', () => {
      if (!sprite.estaArrastrado) this.ocultarTooltip();
    });
    sprite.on('pointerdown', (pointer) => {
      if (this.popupActivo || this.nivelTerminado) return;
      this.ocultarTooltip();
      this.tweens.killTweensOf(sprite);
      sprite.estaArrastrado = true;
      this.recursoActivo = sprite;
      this.offsetX = sprite.x - pointer.x;
      this.offsetY = sprite.y - pointer.y;
      sprite.setDepth(15);
      this.resaltarTecnologia(item.id);
    });

    this.animarCaida(sprite);
  }

  animarCaida(sprite) {
    const limiteY = this.scale.height - 170;
    const distancia = Math.max(40, limiteY - sprite.y);
    const duracion = distancia * 14;

    this.tweens.add({
      targets: sprite,
      y: limiteY,
      duration: duracion,
      ease: 'Linear',
      onComplete: () => {
        if (!sprite.active || sprite.estaArrastrado || this.nivelTerminado) return;
        this.perderRecurso(sprite);
      }
    });
  }

  reanudarCaida(sprite) {
    sprite.setDepth(8);
    sprite.setScale(sprite.escalaOriginal.x, sprite.escalaOriginal.y);
    this.animarCaida(sprite);
  }

  evaluarDrop(sprite, destino) {
    const datos = sprite.datosEnergia;
    const correcto = datos.id === destino.idEnergia;

    if (correcto) {
      this.puntaje += datos.puntos;
      this.indiceVerde = Math.min(100, this.indiceVerde + 6);
      this.recursosRestantes--;
      this.actualizarHUD();

      this.tweens.add({
        targets: sprite,
        x: destino.cx,
        y: destino.cy,
        scaleX: sprite.escalaOriginal.x * 0.35,
        scaleY: sprite.escalaOriginal.y * 0.35,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          sprite.destroy();
          this.recursosEnPantalla--;
          this.mostrarFeedback(true, datos.explicacion);
          this.verificarContinuacion();
        }
      });

      this.flashTecnologia(destino, 0x2ecc71);
    } else {
      this.vidas--;
      this.actualizarHUD();
      this.flashTecnologia(destino, 0xe74c3c);
      this.cameras.main.shake(240, 0.006);
      this.mostrarFeedback(false, `${datos.recurso.nombre} debe ir con ${datos.tecnologia.nombre}.`);
      this.reubicarTrasError(sprite);

      if (this.vidas <= 0) {
        this.time.delayedCall(900, () => this.finNivel(false));
      }
    }
  }

  reubicarTrasError(sprite) {
    this.tweens.killTweensOf(sprite);
    sprite.setDepth(8);
    this.tweens.add({
      targets: sprite,
      x: Phaser.Math.Between(70, this.scale.width - 70),
      y: -45,
      scaleX: sprite.escalaOriginal.x,
      scaleY: sprite.escalaOriginal.y,
      duration: 260,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (sprite.active && !this.nivelTerminado) this.animarCaida(sprite);
      }
    });
  }

  perderRecurso(sprite) {
    this.vidas--;
    this.actualizarHUD();
    this.mostrarFeedback(false, `Se escapó ${sprite.datosEnergia.recurso.nombre}. Intenta arrastrarlo antes.`);
    this.recursosEnPantalla--;
    sprite.destroy();

    if (this.vidas <= 0) {
      this.time.delayedCall(900, () => this.finNivel(false));
      return;
    }

    this.recursosPendientes.push(sprite.datosEnergia);
    this.time.delayedCall(600, () => this.lanzarSiguienteRecurso());
  }

  verificarContinuacion() {
    if (this.recursosRestantes <= 0 && !this.nivelTerminado) {
      this.nivelTerminado = true;
      this.time.delayedCall(900, () => this.finNivel(true));
      return;
    }

    this.time.delayedCall(600, () => this.lanzarSiguienteRecurso());
  }

  resaltarTecnologia(idEnergia) {
    this.tecnologiasConfig.forEach(cfg => {
      if (cfg.resaltado) cfg.resaltado.destroy();
      if (cfg.idEnergia === idEnergia) {
        const g = this.add.graphics();
        g.lineStyle(3, 0xffd166, 0.95);
        g.strokeRoundedRect(cfg.zona.x, cfg.zona.y, cfg.zona.width, cfg.zona.height, 10);
        cfg.resaltado = g;
        this.tweens.add({ targets: g, alpha: 0.35, yoyo: true, repeat: -1, duration: 420 });
      }
    });
  }

  quitarResaltado() {
    this.tecnologiasConfig.forEach(cfg => {
      if (cfg.resaltado) {
        cfg.resaltado.destroy();
        cfg.resaltado = null;
      }
    });
  }

  flashTecnologia(destino, color) {
    const flash = this.add.graphics();
    flash.fillStyle(color, 0.38);
    flash.fillRoundedRect(destino.zona.x, destino.zona.y, destino.zona.width, destino.zona.height, 10);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 450,
      onComplete: () => flash.destroy()
    });
  }

  mostrarTooltip(sprite, nombre) {
    this.ocultarTooltip();

    const tx = Math.min(sprite.x + 42, this.scale.width - 150);
    const ty = Math.max(sprite.y - 34, 58);
    const ancho = nombre.length * 7 + 16;

    const bg = this.add.graphics().setDepth(25);
    bg.fillStyle(0x000000, 0.75);
    bg.fillRoundedRect(tx - 8, ty - 14, ancho, 26, 6);

    const txt = this.add.text(tx, ty - 1, nombre, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0, 0.5).setDepth(26);

    this.tooltip = { bg, txt };
  }

  ocultarTooltip() {
    if (!this.tooltip) return;
    this.tooltip.bg.destroy();
    this.tooltip.txt.destroy();
    this.tooltip = null;
  }

  mostrarFeedback(correcto, mensaje) {
    if (this.feedbackActual) {
      this.feedbackActual.bg.destroy();
      this.feedbackActual.txt.destroy();
    }

    const W = this.scale.width;
    const px = W / 2;
    const py = 78;
    const ancho = 600;
    const emoji = correcto ? 'OK' : 'X';

    const bg = this.add.graphics().setDepth(28);
    bg.fillStyle(correcto ? 0x0b3d2e : 0x4a1515, 0.92);
    bg.fillRoundedRect(px - ancho / 2, py - 26, ancho, 52, 12);
    bg.lineStyle(2, correcto ? 0x2ecc71 : 0xe74c3c, 0.85);
    bg.strokeRoundedRect(px - ancho / 2, py - 26, ancho, 52, 12);

    const txt = this.add.text(px, py, `${emoji}: ${mensaje}`, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: ancho - 24 }
    }).setOrigin(0.5).setDepth(29);

    this.feedbackActual = { bg, txt };
    this.time.delayedCall(1800, () => {
      if (this.feedbackActual?.bg === bg) {
        bg.destroy();
        txt.destroy();
        this.feedbackActual = null;
      }
    });
  }

  mostrarIntro() {
    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.graphics().setDepth(30);
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(0, 0, W, H);

    const panel = this.add.graphics().setDepth(31);
    panel.fillStyle(0x12324a, 1);
    panel.fillRoundedRect(W / 2 - 290, H / 2 - 118, 580, 236, 16);
    panel.lineStyle(2, 0xffd166, 0.85);
    panel.strokeRoundedRect(W / 2 - 290, H / 2 - 118, 580, 236, 16);

    const t1 = this.add.text(W / 2, H / 2 - 84, 'NIVEL 2 - ENERGIAS RENOVABLES', {
      fontSize: '23px',
      fontFamily: 'Georgia, serif',
      color: '#ffd166',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(32);

    const t2 = this.add.text(W / 2, H / 2 - 30,
      'Arrastra cada recurso natural hacia la tecnologia que lo aprovecha.\nCompleta las 5 energias para avanzar.', {
        fontSize: '15px',
        fontFamily: 'Arial',
        color: '#f8f9fa',
        align: 'center',
        lineSpacing: 8
      }).setOrigin(0.5).setDepth(32);

    const t3 = this.add.text(W / 2, H / 2 + 32,
      'Ejemplo: el sol va al panel solar, el viento al aerogenerador.', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#fff3bf',
        align: 'center',
        fontStyle: 'italic'
      }).setOrigin(0.5).setDepth(32);

    const btnBg = this.add.graphics().setDepth(32);
    btnBg.fillStyle(0xd4850a, 1);
    btnBg.fillRoundedRect(W / 2 - 90, H / 2 + 72, 180, 42, 10);

    const btnTxt = this.add.text(W / 2, H / 2 + 93, 'COMENZAR', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(33);

    const btnZona = this.add.zone(W / 2, H / 2 + 93, 180, 42)
      .setInteractive({ useHandCursor: true })
      .setDepth(34);

    btnZona.on('pointerdown', () => {
      [overlay, panel, t1, t2, t3, btnBg, btnTxt, btnZona].forEach(e => e.destroy());
      this.iniciarLluviaRecursos();
    });
  }

  finNivel(exito) {
    if (this.nivelTerminado && !exito) return;
    this.nivelTerminado = true;
    this.recursoActivo = null;

    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.graphics().setDepth(40);
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(0, 0, W, H);

    const panel = this.add.graphics().setDepth(41);
    panel.fillStyle(exito ? 0x12324a : 0x3b1414, 1);
    panel.fillRoundedRect(W / 2 - 245, H / 2 - 122, 490, 244, 16);
    panel.lineStyle(2, exito ? 0xffd166 : 0xe74c3c, 0.9);
    panel.strokeRoundedRect(W / 2 - 245, H / 2 - 122, 490, 244, 16);

    this.add.text(W / 2, H / 2 - 88,
      exito ? 'Energia bien aprovechada' : 'Sin vidas', {
        fontSize: '26px',
        fontFamily: 'Georgia, serif',
        color: exito ? '#ffd166' : '#e74c3c',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(42);

    this.add.text(W / 2, H / 2 - 38,
      `Puntaje: ${this.puntaje} pts\nVidas restantes: ${this.vidas}`, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8
      }).setOrigin(0.5).setDepth(42);

    this.add.text(W / 2, H / 2 + 16,
      exito ? 'Ahora resuelve problemas ambientales con sus soluciones.' : 'Reintenta el nivel para completar las asociaciones.', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#fff3bf',
        align: 'center',
        fontStyle: 'italic'
      }).setOrigin(0.5).setDepth(42);

    if (exito) {
      this.crearBotonFin(W / 2, H / 2 + 70, 'Ir a Nivel 3', 0xd4850a, () => {
        this.scene.start('Nivel3_ProblemaSolucion', {
          puntaje: this.puntaje,
          vidas: this.vidas,
          indiceVerde: this.indiceVerde
        });
      });
    } else {
      this.crearBotonFin(W / 2 - 110, H / 2 + 70, 'Reintentar', 0x27ae60, () => {
        this.scene.start('Nivel2_EnergiasRenovables', {
          puntaje: this.puntaje,
          vidas: 3,
          indiceVerde: this.indiceVerde
        });
      });
      this.crearBotonFin(W / 2 + 110, H / 2 + 70, 'Menu', 0x1a5276, () => {
        this.scene.start('MenuPrincipal');
      });
    }
  }

  crearBotonFin(x, y, texto, color, cb) {
    const ancho = 190;
    const alto = 42;
    const bg = this.add.graphics().setDepth(42);
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);

    this.add.text(x, y, texto, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(43);

    this.add.zone(x, y, ancho, alto)
      .setInteractive({ useHandCursor: true })
      .setDepth(44)
      .on('pointerdown', cb);
  }
}

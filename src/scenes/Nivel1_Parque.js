import residuosData from '../data/residuos_parque.json';

export default class Nivel1_Parque extends Phaser.Scene {
  constructor() {
    super({ key: 'Nivel1_Parque' });
  }

  init(data) {
    this.puntaje     = data.puntaje     ?? 0;
    this.vidas       = data.vidas       ?? 3;
    this.indiceVerde = data.indiceVerde ?? 0;

    // Estado interno del nivel
    this.residuosPendientes = 0;
    this.residuoActivo      = null;   // sprite que se está arrastrando
    this.offsetX            = 0;
    this.offsetY            = 0;
    this.popupActivo        = false;
    this.nivelTerminado     = false;
  }

  preload() {
    this.load.image('parque_fondo', 'assets/escenarios/parque_fondo.png');

    const spritesParque = [
      'botella_plastica', 'papel', 'cascara',
      'lata', 'vidrio', 'bateria'
    ];
    spritesParque.forEach(id => {
      this.load.image(id, `assets/residuos/${id}.png`);
    });

    const basureros = [
      'basurero_organico', 'basurero_plastico',
      'basurero_papel_carton', 'basurero_vidrio', 'basurero_peligroso'
    ];
    basureros.forEach(id => {
      this.load.image(id, `assets/basureros/${id}.png`);
    });

    this.load.on('loaderror', (file) => {
      console.warn(`No se pudo cargar: ${file.key} (${file.url})`);
    });
  }

  create() {
    const W = this.scale.width;   // 900
    const H = this.scale.height;  // 600

    // ── FONDO ────────────────────────────────────────────────────────────────
    const fondo = this.add.image(W / 2, H / 2, 'parque_fondo');
    fondo.setDisplaySize(W, H);

    // Overlay semitransparente solo en zona de juego para legibilidad
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.15);
    overlay.fillRect(0, 44, W - 200, H - 44);

    // ── HUD SUPERIOR ─────────────────────────────────────────────────────────
    this.dibujarHUD();

    // ── PANEL DERECHO: BASUREROS ──────────────────────────────────────────────
    this.dibujarPanelBasureros();

    // ── RESIDUOS EN EL PARQUE ────────────────────────────────────────────────
    // Filtrar solo los residuos que tienen sprite disponible
    const spritesDisponibles = ['botella_plastica','papel','cascara','lata','vidrio','bateria'];
    this.residuosActivos = residuosData.filter(r => spritesDisponibles.includes(r.sprite));

    this.residuosPendientes = this.residuosActivos.length;
    this.crearResiduos();

    // ── TEXTO INTRO ───────────────────────────────────────────────────────────
    this.mostrarIntro();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HUD
  // ═══════════════════════════════════════════════════════════════════════════
  dibujarHUD() {
    const W = this.scale.width;

    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x0a1a0a, 0.85);
    hudBg.fillRect(0, 0, W, 44);
    hudBg.lineStyle(1, 0x2ecc71, 0.4);
    hudBg.lineBetween(0, 44, W, 44);

    // Ícono nivel
    this.add.text(14, 22, '🌳 PARQUE', {
      fontSize: '14px', fontFamily: 'Arial',
      color: '#2ecc71', fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    // Puntaje
    this.txtPuntaje = this.add.text(180, 22, `Puntaje: ${this.puntaje}`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#ffffff'
    }).setOrigin(0, 0.5);

    // Residuos restantes
    this.txtRestantes = this.add.text(360, 22, `Residuos: ${this.residuosPendientes}`, {
      fontSize: '14px', fontFamily: 'Arial', color: '#a8e6a3'
    }).setOrigin(0, 0.5);

    // Vidas
    this.txtVidas = this.add.text(W - 15, 22, this.renderVidas(), {
      fontSize: '18px'
    }).setOrigin(1, 0.5);
  }

  renderVidas() {
    return '❤️'.repeat(Math.max(0, this.vidas)) + '🖤'.repeat(Math.max(0, 3 - this.vidas));
  }

  actualizarHUD() {
    this.txtPuntaje.setText(`Puntaje: ${this.puntaje}`);
    this.txtRestantes.setText(`Residuos: ${this.residuosPendientes}`);
    this.txtVidas.setText(this.renderVidas());
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PANEL DE BASUREROS (derecha)
  // ═══════════════════════════════════════════════════════════════════════════
  dibujarPanelBasureros() {
    const W = this.scale.width;
    const H = this.scale.height;
    const panelX = W - 190;

    // Fondo panel
    const panel = this.add.graphics();
    panel.fillStyle(0x0a1a0a, 0.80);
    panel.fillRoundedRect(panelX - 10, 50, 200, H - 60, 12);
    panel.lineStyle(1, 0x2ecc71, 0.35);
    panel.strokeRoundedRect(panelX - 10, 50, 200, H - 60, 12);

    this.add.text(panelX + 85, 68, 'CONTENEDORES', {
      fontSize: '11px', fontFamily: 'Arial',
      color: '#7dcea0', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Definición de basureros con etiqueta y color
    this.basurerosConfig = [
      { id: 'basurero_organico',    label: 'Orgánico',       color: 0x27ae60, cat: 'organico'    },
      { id: 'basurero_plastico',    label: 'Reciclables',    color: 0xe74c3c, cat: 'plastico'    },
      { id: 'basurero_papel_carton',label: 'Papel/Cartón',   color: 0x3498db, cat: 'papel_carton'},
      { id: 'basurero_vidrio',      label: 'Vidrio',         color: 0x1abc9c, cat: 'vidrio'      },
      { id: 'basurero_peligroso',   label: 'Peligroso',      color: 0xf39c12, cat: 'peligroso'   },
    ];

    const startY = 95;
    const step   = (H - startY - 60) / this.basurerosConfig.length;

    this.basurerosConfig.forEach((cfg, i) => {
      const bx = panelX + 85;
      const by = startY + step * i + step / 2;

      // Zona de drop con color de fondo
      const dropBg = this.add.graphics();
      dropBg.fillStyle(cfg.color, 0.18);
      dropBg.fillRoundedRect(bx - 75, by - 44, 150, 88, 8);
      dropBg.lineStyle(1.5, cfg.color, 0.5);
      dropBg.strokeRoundedRect(bx - 75, by - 44, 150, 88, 8);

      // Imagen del basurero
      const img = this.add.image(bx, by - 8, cfg.id);
      img.setDisplaySize(54, 68);

      // Etiqueta
      this.add.text(bx, by + 36, cfg.label, {
        fontSize: '11px', fontFamily: 'Arial',
        color: '#ffffff', fontStyle: 'bold'
      }).setOrigin(0.5);

      // Guardar zona de drop para detección
      cfg.zona = new Phaser.Geom.Rectangle(bx - 75, by - 44, 150, 88);
      cfg.cx   = bx;
      cfg.cy   = by - 8;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RESIDUOS — crear sprites draggables
  // ═══════════════════════════════════════════════════════════════════════════
  crearResiduos() {
    // Posiciones dispersas en zona del parque (izquierda)
    const posiciones = [
      { x: 80,  y: 160 }, { x: 220, y: 120 }, { x: 380, y: 200 },
      { x: 120, y: 320 }, { x: 290, y: 390 }, { x: 500, y: 150 },
      { x: 450, y: 350 }, { x: 160, y: 480 }, { x: 350, y: 490 },
    ];

    this.residuosActivos.forEach((datos, i) => {
      const pos = posiciones[i % posiciones.length];
      // Pequeña variación aleatoria para que no estén exactamente ahí
      const x = pos.x + Phaser.Math.Between(-20, 20);
      const y = pos.y + Phaser.Math.Between(-15, 15);

      const sprite = this.add.image(x, y, datos.sprite);
      sprite.setDisplaySize(72, 72);
      sprite.setInteractive({ useHandCursor: true });
      sprite.escalaOriginal = { x: sprite.scaleX, y: sprite.scaleY };

      // Sombra suave debajo del objeto
      const sombra = this.add.graphics();
      sombra.fillStyle(0x000000, 0.2);
      sombra.fillEllipse(x, y + 36, 60, 14);
      // Guardar referencia para mover la sombra
      sprite.sombra = sombra;

      // Datos del residuo pegados al sprite
      sprite.datosResiduos = datos;
      sprite.posOriginal   = { x, y };
      sprite.estaArrastrado = false;

      // ── EVENTOS DE DRAG ──────────────────────────────────────────────────
      sprite.on('pointerover', () => {
        if (!sprite.estaArrastrado) {
          this.mostrarTooltip(sprite, datos.nombre);
        }
      });

      sprite.on('pointerout', () => {
        if (!sprite.estaArrastrado) {
          this.ocultarTooltip();
        }
      });

      sprite.on('pointerdown', (pointer) => {
        if (this.popupActivo || this.nivelTerminado) return;
        this.ocultarTooltip();
        this.tweens.killTweensOf(sprite);
        sprite.estaArrastrado  = true;
        this.residuoActivo     = sprite;
        this.offsetX = sprite.x - pointer.x;
        this.offsetY = sprite.y - pointer.y;
        sprite.setDepth(10);
        sprite.sombra.setDepth(9);
      });
    });

    // ── MOVIMIENTO GLOBAL ─────────────────────────────────────────────────
    this.input.on('pointermove', (pointer) => {
      if (!this.residuoActivo) return;
      const nx = pointer.x + this.offsetX;
      const ny = pointer.y + this.offsetY;
      this.residuoActivo.x = nx;
      this.residuoActivo.y = ny;
      // Mover sombra
      this.residuoActivo.sombra.clear();
      this.residuoActivo.sombra.fillStyle(0x000000, 0.15);
      this.residuoActivo.sombra.fillEllipse(nx, ny + 38, 60, 14);
    });

    this.input.on('pointerup', (pointer) => {
      if (!this.residuoActivo) return;
      const sprite = this.residuoActivo;
      this.residuoActivo = null;
      sprite.estaArrastrado = false;

      // ¿Cayó en algún basurero?
      const destino = this.basurerosConfig.find(cfg =>
        cfg.zona.contains(pointer.x, pointer.y)
      );

      if (destino) {
        this.evaluarDrop(sprite, destino);
      } else {
        // Volver a posición original
        this.devolverResiduoAOrigen(sprite);
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LÓGICA DE CLASIFICACIÓN
  // ═══════════════════════════════════════════════════════════════════════════
  evaluarDrop(sprite, destino) {
    const datos = sprite.datosResiduos;
    const correcto = datos.categoriaCorrecta === destino.cat;

    if (correcto) {
      this.puntaje += datos.puntos;
      this.indiceVerde = Math.min(100, this.indiceVerde + 5);
      this.residuosPendientes--;
      this.actualizarHUD();

      // Animación de éxito: volar al basurero y desaparecer
      this.tweens.add({
        targets: sprite,
        x: destino.cx, y: destino.cy,
        scaleX: sprite.escalaOriginal.x * 0.3,
        scaleY: sprite.escalaOriginal.y * 0.3,
        alpha: 0,
        duration: 350,
        ease: 'Power2',
        onComplete: () => {
          sprite.sombra.destroy();
          sprite.destroy();
          this.mostrarFeedback(true, datos.feedbackCorrecto, destino.cx, destino.cy);
          this.verificarFinNivel();
        }
      });

      // Flash verde en el basurero
      this.flashBasurero(destino, 0x2ecc71);

    } else {
      // Error: restar vida y devolver
      this.vidas--;
      this.actualizarHUD();
      this.flashBasurero(destino, 0xe74c3c);
      this.camaraShake();
      this.devolverResiduoAOrigen(sprite);
      this.mostrarFeedback(false, datos.feedbackError, sprite.x, sprite.y);

      if (this.vidas <= 0) {
        this.time.delayedCall(1200, () => this.finNivel(false));
      }
    }
  }

  devolverResiduoAOrigen(sprite) {
    this.tweens.add({
      targets: sprite,
      x: sprite.posOriginal.x,
      y: sprite.posOriginal.y,
      scaleX: sprite.escalaOriginal.x,
      scaleY: sprite.escalaOriginal.y,
      duration: 280,
      ease: 'Back.easeOut',
      onUpdate: () => {
        sprite.sombra.clear();
        sprite.sombra.fillStyle(0x000000, 0.2);
        sprite.sombra.fillEllipse(sprite.x, sprite.y + 36, 60, 14);
      }
    });
    sprite.setDepth(0);
    sprite.sombra.setDepth(0);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // EFECTOS VISUALES
  // ═══════════════════════════════════════════════════════════════════════════
  resaltarBasureros(categoriaCorrecta) {
    this.basurerosConfig.forEach(cfg => {
      if (cfg.esElCorrecto) cfg.esElCorrecto.destroy();
      if (cfg.cat === categoriaCorrecta) {
        const g = this.add.graphics();
        g.lineStyle(3, 0xf1c40f, 0.9);
        g.strokeRoundedRect(cfg.zona.x, cfg.zona.y, cfg.zona.width, cfg.zona.height, 8);
        cfg.esElCorrecto = g;
        // Pulso
        this.tweens.add({
          targets: g, alpha: 0.3, yoyo: true, repeat: -1, duration: 400
        });
      }
    });
  }

  quitarResaltado() {
    this.basurerosConfig.forEach(cfg => {
      if (cfg.esElCorrecto) {
        cfg.esElCorrecto.destroy();
        cfg.esElCorrecto = null;
      }
    });
  }

  flashBasurero(destino, color) {
    const flash = this.add.graphics();
    flash.fillStyle(color, 0.45);
    flash.fillRoundedRect(destino.zona.x, destino.zona.y, destino.zona.width, destino.zona.height, 8);
    this.tweens.add({
      targets: flash, alpha: 0, duration: 500,
      onComplete: () => flash.destroy()
    });
  }

  camaraShake() {
    this.cameras.main.shake(250, 0.006);
  }

  mostrarTooltip(sprite, nombre) {
    this.ocultarTooltip();
    const tx = Math.min(sprite.x + 50, this.scale.width - 120);
    const ty = sprite.y - 50;

    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.75);
    bg.fillRoundedRect(tx - 5, ty - 14, nombre.length * 7 + 10, 24, 6);

    const txt = this.add.text(tx, ty - 2, nombre, {
      fontSize: '12px', fontFamily: 'Arial', color: '#ffffff'
    }).setOrigin(0, 0.5);

    this.tooltip = { bg, txt };
  }

  ocultarTooltip() {
    if (this.tooltip) {
      this.tooltip.bg.destroy();
      this.tooltip.txt.destroy();
      this.tooltip = null;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // POPUP DE FEEDBACK
  // ═══════════════════════════════════════════════════════════════════════════
  mostrarFeedback(correcto, mensaje, x, y) {
    if (this.popupActivo) return;
    this.popupActivo = true;

    const color  = correcto ? '#27ae60' : '#e74c3c';
    const emoji  = correcto ? '✅' : '❌';
    const W      = this.scale.width;

    // Panel centrado en la parte inferior
    const px = W / 2;
    const py = this.scale.height - 70;
    const ancho = 540;

    const bg = this.add.graphics();
    bg.fillStyle(correcto ? 0x0d3b0d : 0x3b0d0d, 0.92);
    bg.fillRoundedRect(px - ancho / 2, py - 28, ancho, 56, 12);
    bg.lineStyle(2, correcto ? 0x2ecc71 : 0xe74c3c, 0.9);
    bg.strokeRoundedRect(px - ancho / 2, py - 28, ancho, 56, 12);

    const txt = this.add.text(px, py, `${emoji}  ${mensaje}`, {
      fontSize: '13px', fontFamily: 'Arial', color: '#ffffff',
      align: 'center', wordWrap: { width: ancho - 20 }
    }).setOrigin(0.5);

    // Auto-cerrar
    this.time.delayedCall(2000, () => {
      bg.destroy();
      txt.destroy();
      this.popupActivo = false;
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INTRO
  // ═══════════════════════════════════════════════════════════════════════════
  mostrarIntro() {
    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.65);
    overlay.fillRect(0, 0, W, H);
    overlay.setDepth(20);

    const panel = this.add.graphics().setDepth(21);
    panel.fillStyle(0x0a2a0a, 1);
    panel.fillRoundedRect(W / 2 - 280, H / 2 - 110, 560, 220, 16);
    panel.lineStyle(2, 0x2ecc71, 0.8);
    panel.strokeRoundedRect(W / 2 - 280, H / 2 - 110, 560, 220, 16);

    const t1 = this.add.text(W / 2, H / 2 - 80, '🌳 NIVEL 1 — PARQUE', {
      fontSize: '24px', fontFamily: 'Georgia, serif',
      color: '#2ecc71', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(22);

    const t2 = this.add.text(W / 2, H / 2 - 30,
      'Arrastra cada residuo al contenedor correcto.\nTienes 3 vidas. Cada error te quita una.', {
        fontSize: '15px', fontFamily: 'Arial', color: '#d4f5d4',
        align: 'center', lineSpacing: 8
      }).setOrigin(0.5).setDepth(22);

    const t3 = this.add.text(W / 2, H / 2 + 30,
      '💡 Cuando arrastres un residuo, el contenedor correcto\nse iluminará en amarillo.', {
        fontSize: '13px', fontFamily: 'Arial', color: '#a8e6a3',
        align: 'center', lineSpacing: 6, fontStyle: 'italic'
      }).setOrigin(0.5).setDepth(22);

    // Botón comenzar
    const btnBg = this.add.graphics().setDepth(22);
    btnBg.fillStyle(0x27ae60, 1);
    btnBg.fillRoundedRect(W / 2 - 90, H / 2 + 70, 180, 42, 10);

    const btnTxt = this.add.text(W / 2, H / 2 + 91, '¡ COMENZAR !', {
      fontSize: '16px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(23);

    const btnZona = this.add.zone(W / 2, H / 2 + 91, 180, 42)
      .setInteractive({ useHandCursor: true }).setDepth(24);

    btnZona.on('pointerdown', () => {
      [overlay, panel, t1, t2, t3, btnBg, btnTxt, btnZona].forEach(e => e.destroy());
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FIN DE NIVEL
  // ═══════════════════════════════════════════════════════════════════════════
  verificarFinNivel() {
    if (this.residuosPendientes <= 0 && !this.nivelTerminado) {
      this.nivelTerminado = true;
      this.time.delayedCall(800, () => this.finNivel(true));
    }
  }

  finNivel(exito) {
    this.nivelTerminado = true;
    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.graphics().setDepth(30);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, W, H);

    const panel = this.add.graphics().setDepth(31);
    panel.fillStyle(exito ? 0x0a2a0a : 0x2a0a0a, 1);
    panel.fillRoundedRect(W / 2 - 240, H / 2 - 120, 480, 240, 16);
    panel.lineStyle(2, exito ? 0x2ecc71 : 0xe74c3c, 0.9);
    panel.strokeRoundedRect(W / 2 - 240, H / 2 - 120, 480, 240, 16);

    this.add.text(W / 2, H / 2 - 88,
      exito ? '🎉 ¡Parque limpio!' : '💔 Sin vidas', {
        fontSize: '28px', fontFamily: 'Georgia, serif',
        color: exito ? '#2ecc71' : '#e74c3c', fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(32);

    this.add.text(W / 2, H / 2 - 40,
      `Puntaje obtenido: ${this.puntaje} pts\nVidas restantes: ${this.vidas}`, {
        fontSize: '16px', fontFamily: 'Arial', color: '#ffffff',
        align: 'center', lineSpacing: 8
      }).setOrigin(0.5).setDepth(32);

    const msgSig = exito
      ? '¡Excelente! Ahora sigues con energías renovables.'
      : 'El parque necesita más ayuda. ¿Lo intentas de nuevo?';

    this.add.text(W / 2, H / 2 + 15, msgSig, {
      fontSize: '13px', fontFamily: 'Arial',
      color: '#a8e6a3', fontStyle: 'italic'
    }).setOrigin(0.5).setDepth(32);

    // Botones
    if (exito) {
      this.crearBotonFin(W / 2, H / 2 + 68, 'Ir a Energías', 0x1a6b8a, () => {
        this.scene.start('Nivel2_EnergiasRenovables', {
          puntaje: this.puntaje,
          vidas: this.vidas,
          indiceVerde: this.indiceVerde
        });
      });
    } else {
      this.crearBotonFin(W / 2 - 110, H / 2 + 68, '🔄 Reintentar', 0x27ae60, () => {
        this.scene.start('Nivel1_Parque', { puntaje: 0, vidas: 3, indiceVerde: 0 });
      });
      this.crearBotonFin(W / 2 + 110, H / 2 + 68, '🏠 Menú', 0x1a5276, () => {
        this.scene.start('MenuPrincipal');
      });
    }
  }

  crearBotonFin(x, y, texto, color, cb) {
    const ancho = 190, alto = 42;
    const bg = this.add.graphics().setDepth(32);
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(x - ancho / 2, y - alto / 2, ancho, alto, 10);

    this.add.text(x, y, texto, {
      fontSize: '14px', fontFamily: 'Arial', color: '#fff', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(33);

    this.add.zone(x, y, ancho, alto)
      .setInteractive({ useHandCursor: true })
      .setDepth(34)
      .on('pointerdown', cb);
  }
}

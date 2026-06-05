import cartasData from '../data/cartas_problema_solucion.json';

export default class Nivel3_ProblemaSolucion extends Phaser.Scene {
  constructor() {
    super({ key: 'Nivel3_ProblemaSolucion' });
  }

  init(data) {
    this.puntaje = data.puntaje ?? 0;
    this.vidas = data.vidas ?? 3;
    this.indiceVerde = data.indiceVerde ?? 0;

    this.cartasSeleccionadas = [];
    this.paresEncontrados = 0;
    this.paresNivel = cartasData.slice(0, 4);
    this.bloqueado = true;
    this.nivelTerminado = false;
  }

  preload() {
    this.load.image('fondo_nivel3', 'assets/escenarios/fondo_nivel3.png');
    this.load.image('carta_reverso', 'assets/cartas/carta_reverso.png');
    this.load.image('carta_frente', 'assets/cartas/carta_frente.png');
    this.load.image('popup_correcto', 'assets/ui/popup_correcto.png');
    this.load.image('popup_error', 'assets/ui/popup_error.png');

    this.load.on('loaderror', (file) => {
      console.warn(`No se pudo cargar: ${file.key} (${file.url})`);
    });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    const fondo = this.add.image(W / 2, H / 2, 'fondo_nivel3');
    fondo.setDisplaySize(W, H);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x0b1026, 0.42);
    overlay.fillRect(0, 44, W, H - 44);

    this.dibujarHUD();
    this.dibujarEncabezados();
    this.crearCartas();
    this.mostrarIntro();
  }

  dibujarHUD() {
    const W = this.scale.width;

    const hudBg = this.add.graphics();
    hudBg.fillStyle(0x151936, 0.92);
    hudBg.fillRect(0, 0, W, 44);
    hudBg.lineStyle(1, 0xb8a1ff, 0.55);
    hudBg.lineBetween(0, 44, W, 44);

    this.add.text(14, 22, 'NIVEL 3: PROBLEMA - SOLUCION', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#d6c7ff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    this.txtPuntaje = this.add.text(280, 22, `Puntaje: ${this.puntaje}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#ffffff'
    }).setOrigin(0, 0.5);

    this.txtPares = this.add.text(455, 22, `Pares: ${this.paresEncontrados}/${this.paresNivel.length}`, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#efe7ff'
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
    this.txtPares.setText(`Pares: ${this.paresEncontrados}/${this.paresNivel.length}`);
    this.txtVidas.setText(this.renderVidas());
  }

  dibujarEncabezados() {
    this.crearTituloColumna(240, 78, 'PROBLEMAS', 0xffc857);
    this.crearTituloColumna(660, 78, 'SOLUCIONES', 0x8ee4af);
  }

  crearTituloColumna(x, y, texto, color) {
    const bg = this.add.graphics();
    bg.fillStyle(0x151936, 0.74);
    bg.fillRoundedRect(x - 150, y - 20, 300, 40, 10);
    bg.lineStyle(1.5, color, 0.65);
    bg.strokeRoundedRect(x - 150, y - 20, 300, 40, 10);

    this.add.text(x, y, texto, {
      fontSize: '17px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }

  crearCartas() {
    const problemas = this.paresNivel.map(par => ({
      parId: par.id,
      tipo: 'problema',
      titulo: par.problema.titulo,
      descripcion: par.problema.descripcion,
      explicacion: par.explicacion,
      puntos: par.puntos
    }));

    const soluciones = Phaser.Utils.Array.Shuffle(this.paresNivel.map(par => ({
      parId: par.id,
      tipo: 'solucion',
      titulo: par.solucion.titulo,
      descripcion: par.solucion.descripcion,
      explicacion: par.explicacion,
      puntos: par.puntos
    })));

    const posicionesProblemas = [
      { x: 170, y: 205 },
      { x: 320, y: 205 },
      { x: 170, y: 435 },
      { x: 320, y: 435 },
    ];
    const posicionesSoluciones = [
      { x: 580, y: 205 },
      { x: 730, y: 205 },
      { x: 580, y: 435 },
      { x: 730, y: 435 },
    ];

    this.cartas = [];

    problemas.forEach((datos, i) => {
      const pos = posicionesProblemas[i];
      this.cartas.push(this.crearCarta(pos.x, pos.y, datos));
    });

    soluciones.forEach((datos, i) => {
      const pos = posicionesSoluciones[i];
      this.cartas.push(this.crearCarta(pos.x, pos.y, datos));
    });
  }

  crearCarta(x, y, datos) {
    const carta = {
      datos,
      volteada: false,
      emparejada: false,
      marcoSeleccion: null,
      elementosFrente: []
    };

    const sombra = this.add.graphics();
    sombra.fillStyle(0x000000, 0.22);
    sombra.fillRoundedRect(x - 69, y - 112, 138, 234, 14);

    const img = this.add.image(x, y, 'carta_reverso');
    img.setDisplaySize(130, 230);
    img.setInteractive({ useHandCursor: true });
    img.escalaOriginal = { x: img.scaleX, y: img.scaleY };

    carta.img = img;
    carta.sombra = sombra;

    img.on('pointerdown', () => this.seleccionarCarta(carta));

    return carta;
  }

  seleccionarCarta(carta) {
    if (this.bloqueado || this.nivelTerminado || !carta.volteada || carta.emparejada) return;

    const yaHayMismoTipo = this.cartasSeleccionadas.some(sel => sel.datos.tipo === carta.datos.tipo);
    if (yaHayMismoTipo) {
      this.mostrarFeedback(false, 'Selecciona una carta de la otra columna.');
      return;
    }

    this.marcarSeleccion(carta);
    this.cartasSeleccionadas.push(carta);

    if (this.cartasSeleccionadas.length === 2) {
      this.evaluarSeleccion();
    }
  }

  animarVolteoInicial() {
    this.cartas.forEach((carta, i) => {
      this.time.delayedCall(i * 90, () => {
        this.tweens.add({
          targets: carta.img,
          scaleX: 0,
          duration: 120,
          ease: 'Sine.easeIn',
          onComplete: () => {
            this.voltearCarta(carta, true);
            this.tweens.add({
              targets: carta.img,
              scaleX: carta.img.escalaOriginal.x,
              duration: 140,
              ease: 'Sine.easeOut',
              onComplete: () => {
                if (i === this.cartas.length - 1) this.bloqueado = false;
              }
            });
          }
        });
      });
    });
  }

  voltearCarta(carta, mostrarFrente) {
    carta.volteada = mostrarFrente;
    carta.img.setTexture(mostrarFrente ? 'carta_frente' : 'carta_reverso');

    carta.elementosFrente.forEach(el => el.destroy());
    carta.elementosFrente = [];

    if (!mostrarFrente) {
      return;
    }

    const { x, y } = carta.img;

    const titulo = this.add.text(x, y + 10, carta.datos.titulo, {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#17202a',
      fontStyle: 'bold',
      align: 'center',
      lineSpacing: 1,
      wordWrap: { width: 88 }
    }).setOrigin(0.5);

    carta.elementosFrente.push(titulo);
  }

  recortarTexto(texto, max) {
    if (texto.length <= max) return texto;
    return `${texto.slice(0, max - 3).trim()}...`;
  }

  marcarSeleccion(carta) {
    this.quitarMarcoSeleccion(carta);

    const g = this.add.graphics();
    g.lineStyle(4, 0xf1c40f, 0.95);
    g.strokeRoundedRect(carta.img.x - 69, carta.img.y - 116, 138, 232, 12);
    g.setDepth(20);
    carta.marcoSeleccion = g;

    carta.elementosFrente.forEach(el => el.setDepth(21));
  }

  quitarMarcoSeleccion(carta) {
    if (!carta.marcoSeleccion) return;
    carta.marcoSeleccion.destroy();
    carta.marcoSeleccion = null;
  }

  limpiarSeleccionActual() {
    this.cartasSeleccionadas.forEach(carta => this.quitarMarcoSeleccion(carta));
    this.cartasSeleccionadas = [];
  }

  evaluarSeleccion() {
    this.bloqueado = true;
    const [a, b] = this.cartasSeleccionadas;
    const correcto = a.datos.parId === b.datos.parId && a.datos.tipo !== b.datos.tipo;

    if (correcto) {
      this.puntaje += a.datos.puntos;
      this.indiceVerde = Math.min(100, this.indiceVerde + 7);
      this.paresEncontrados++;
      a.emparejada = true;
      b.emparejada = true;
      this.quitarMarcoSeleccion(a);
      this.quitarMarcoSeleccion(b);
      this.marcarParCorrecto(a);
      this.marcarParCorrecto(b);
      this.actualizarHUD();
      this.mostrarFeedback(true, a.datos.explicacion);

      this.time.delayedCall(900, () => {
        this.limpiarSeleccionActual();
        this.bloqueado = false;
        this.verificarFinNivel();
      });
      return;
    }

    this.vidas--;
    this.actualizarHUD();
    this.mostrarFeedback(false, 'Ese problema no corresponde con esa solucion.');
    this.cameras.main.shake(220, 0.005);

    if (this.vidas <= 0) {
      this.time.delayedCall(900, () => this.finNivel(false));
      return;
    }

    this.time.delayedCall(1100, () => {
      this.limpiarSeleccionActual();
      this.bloqueado = false;
    });
  }

  marcarParCorrecto(carta) {
    carta.img.disableInteractive();
    carta.img.setAlpha(0.82);

    const marco = this.add.graphics();
    marco.lineStyle(3, 0x2ecc71, 0.95);
    marco.strokeRoundedRect(carta.img.x - 69, carta.img.y - 116, 138, 232, 12);
    carta.elementosFrente.push(marco);

    const check = this.add.text(carta.img.x + 46, carta.img.y - 64, 'OK', {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#1e8449',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    carta.elementosFrente.push(check);
  }

  mostrarFeedback(correcto, mensaje) {
    if (this.feedbackActual) {
      this.feedbackActual.forEach(el => el.destroy());
      this.feedbackActual = null;
    }

    const W = this.scale.width;
    const y = this.scale.height - 42;
    const ancho = 650;
    const bg = this.add.graphics().setDepth(30);
    bg.fillStyle(correcto ? 0x0d3b2a : 0x3b1414, 0.94);
    bg.fillRoundedRect(W / 2 - ancho / 2, y - 29, ancho, 58, 12);
    bg.lineStyle(2, correcto ? 0x2ecc71 : 0xe74c3c, 0.9);
    bg.strokeRoundedRect(W / 2 - ancho / 2, y - 29, ancho, 58, 12);

    const icono = this.add.image(W / 2 - ancho / 2 + 34, y, correcto ? 'popup_correcto' : 'popup_error')
      .setDisplaySize(34, 34)
      .setDepth(31);

    const txt = this.add.text(W / 2 + 20, y, mensaje, {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: ancho - 92 }
    }).setOrigin(0.5).setDepth(31);

    this.feedbackActual = [bg, icono, txt];
    this.time.delayedCall(2300, () => {
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
    panel.fillStyle(0x151936, 1);
    panel.fillRoundedRect(W / 2 - 290, H / 2 - 118, 580, 236, 16);
    panel.lineStyle(2, 0xb8a1ff, 0.85);
    panel.strokeRoundedRect(W / 2 - 290, H / 2 - 118, 580, 236, 16);

    const t1 = this.add.text(W / 2, H / 2 - 84, 'NIVEL 3 - PROBLEMA Y SOLUCION', {
      fontSize: '23px',
      fontFamily: 'Georgia, serif',
      color: '#d6c7ff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(42);

    const t2 = this.add.text(W / 2, H / 2 - 26,
      'Primero se mostrarán todas las cartas.\nLuego elige un problema y su solución correspondiente.', {
        fontSize: '15px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8
      }).setOrigin(0.5).setDepth(42);

    const t3 = this.add.text(W / 2, H / 2 + 34,
      'Cada error resta una vida. Completa los 4 pares para avanzar.', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#efe7ff',
        fontStyle: 'italic'
      }).setOrigin(0.5).setDepth(42);

    const btnBg = this.add.graphics().setDepth(42);
    btnBg.fillStyle(0x7b2fbe, 1);
    btnBg.fillRoundedRect(W / 2 - 90, H / 2 + 72, 180, 42, 10);

    const btnTxt = this.add.text(W / 2, H / 2 + 93, 'COMENZAR', {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(43);

    const btnZona = this.add.zone(W / 2, H / 2 + 93, 180, 42)
      .setInteractive({ useHandCursor: true })
      .setDepth(44);

    btnZona.on('pointerdown', () => {
      [overlay, panel, t1, t2, t3, btnBg, btnTxt, btnZona].forEach(e => e.destroy());
      this.animarVolteoInicial();
    });
  }

  verificarFinNivel() {
    if (this.paresEncontrados >= this.paresNivel.length && !this.nivelTerminado) {
      this.nivelTerminado = true;
      this.time.delayedCall(900, () => this.finNivel(true));
    }
  }

  finNivel(exito) {
    this.nivelTerminado = true;
    this.bloqueado = true;

    const W = this.scale.width;
    const H = this.scale.height;

    const overlay = this.add.graphics().setDepth(50);
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(0, 0, W, H);

    const panel = this.add.graphics().setDepth(51);
    panel.fillStyle(exito ? 0x151936 : 0x3b1414, 1);
    panel.fillRoundedRect(W / 2 - 245, H / 2 - 122, 490, 244, 16);
    panel.lineStyle(2, exito ? 0xb8a1ff : 0xe74c3c, 0.9);
    panel.strokeRoundedRect(W / 2 - 245, H / 2 - 122, 490, 244, 16);

    this.add.text(W / 2, H / 2 - 88,
      exito ? 'Pares completados' : 'Sin vidas', {
        fontSize: '27px',
        fontFamily: 'Georgia, serif',
        color: exito ? '#d6c7ff' : '#e74c3c',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(52);

    this.add.text(W / 2, H / 2 - 38,
      `Puntaje: ${this.puntaje} pts\nVidas restantes: ${this.vidas}`, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8
      }).setOrigin(0.5).setDepth(52);

    this.add.text(W / 2, H / 2 + 16,
      exito ? 'Ahora puedes decidir si aceptas el reto extra.' : 'Vuelve a intentarlo para completar las soluciones.', {
        fontSize: '13px',
        fontFamily: 'Arial',
        color: '#efe7ff',
        align: 'center',
        fontStyle: 'italic'
      }).setOrigin(0.5).setDepth(52);

    if (exito) {
      this.crearBotonFin(W / 2, H / 2 + 70, 'Continuar', 0x7b2fbe, () => {
        this.scene.start('PantallaDecision', {
          puntaje: this.puntaje,
          vidas: this.vidas,
          indiceVerde: this.indiceVerde
        });
      });
    } else {
      this.crearBotonFin(W / 2 - 110, H / 2 + 70, 'Reintentar', 0x27ae60, () => {
        this.scene.start('Nivel3_ProblemaSolucion', {
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

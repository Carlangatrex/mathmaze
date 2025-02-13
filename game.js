// Configuración del juego
const CONFIG = {
  IMAGES: {
    SCIENTIST: "assets/images/scientist.svg",
    HEART: "assets/images/heart.svg",
    BACKGROUND: "assets/images/piso.jpg",
    // ... resto de imágenes
  },
  SOUNDS: {
    CORRECT: "assets/sounds/correct.mp3",
    WRONG: "assets/sounds/wrong.mp3",
    // ... resto de sonidos
  },
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 800
  }
};

// Clase para manejar recursos
class ResourceLoader {
  constructor() {
    this.images = {};
    this.sounds = {};
  }

  async loadAll() {
    try {
      await Promise.all([
        this.loadImages(),
        this.loadSounds()
      ]);
      return true;
    } catch (error) {
      console.error('Error loading resources:', error);
      this.showErrorMessage();
      return false;
    }
  }

  async loadImages() {
    const imagePromises = Object.entries(CONFIG.IMAGES).map(([key, path]) => {
      return new Promise((resolve, reject) => {
        loadImage(path, 
          img => {
            this.images[key] = img;
            resolve();
          },
          () => {
            console.error(`Failed to load image: ${path}`);
            reject(new Error(`Failed to load image: ${path}`));
          }
        );
      });
    });
    return Promise.all(imagePromises);
  }

  async loadSounds() {
    const soundPromises = Object.entries(CONFIG.SOUNDS).map(([key, path]) => {
      return new Promise((resolve, reject) => {
        loadSound(path,
          sound => {
            this.sounds[key] = sound;
            resolve();
          },
          () => reject(new Error(`Failed to load sound: ${path}`))
        );
      });
    });
    return Promise.all(soundPromises);
  }

  showErrorMessage() {
    const messageDiv = createDiv("Error: No se pudieron cargar algunos recursos del juego. Por favor, actualice la página.");
    messageDiv.class('error-message');
  }
}

// Clase principal del juego
class Game {
  constructor() {
    this.resources = new ResourceLoader();
    this.isRunning = false;
    this.setupEventListeners();
  }

  async initialize() {
    const resourcesLoaded = await this.resources.loadAll();
    if (!resourcesLoaded) return false;
    
    createCanvas(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    this.setupUI();
    return true;
  }

  setupEventListeners() {
    // Manejar el video de fondo
    const backgroundVideo = document.getElementById('background-video');
    if (backgroundVideo) {
      backgroundVideo.addEventListener('click', () => {
        backgroundVideo.play().catch(error => {
          console.error('Error playing video:', error);
        });
      });
    }

    // Manejar el botón de inicio
    const startButton = document.getElementById('start-button');
    if (startButton) {
      startButton.addEventListener('click', () => this.startGame());
    }
  }

  setupUI() {
    this.messageDiv = createDiv("");
    this.messageDiv.class('game-message');
  }

  startGame() {
    if (this.isRunning) return;
    
    const coverPage = document.getElementById('cover-page');
    const gameContainer = document.getElementById('game-container');
    const backgroundVideo = document.getElementById('background-video');

    if (backgroundVideo) backgroundVideo.pause();
    if (coverPage) coverPage.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'block';

    // Iniciar música de fondo con manejo de errores
    try {
      if (this.resources.sounds.BACKGROUND) {
        this.resources.sounds.BACKGROUND.loop();
      }
    } catch (error) {
      console.error('Error playing background music:', error);
    }

    this.isRunning = true;
    // Aquí iría la lógica principal del juego
  }
}

// Inicialización
let game;

function setup() {
  game = new Game();
  game.initialize();
}

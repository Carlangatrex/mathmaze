// Variables del juego
let messageDiv;
let villainImg = {};

// Variables globales
let canvas, ctx;
let score = 0;
let level = 1;
let player;
let lives = 3; // Número de vidas
let equations = []; // Array para almacenar las ecuaciones
let doors = []; // Array para almacenar las puertas
let currentEquation = ''; // Almacena la ecuación actual

// Laberintos para cada nivel (8x8)
const mazes = {
    1: [
        [0, 1, 0, 0, 0, 1, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1], // Puerta en (1, 3)
        [0, 1, 0, 1, 2, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 0, 1], // Otra puerta en (3, 3)
        [2, 1, 2, 1, 0, 1, 0, 1],
        [0, 1, 0, 1, 0, 1, 2, 1],
        [0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0]
    ],
    2: [
        [0, 0, 0, 0, 1, 0, 0, 0],
        [1, 1, 1, 0, 1, 0, 1, 1],
        [0, 0, 0, 0, 1, 0, 0, 1],
        [0, 1, 1, 1, 1, 1, 0, 1],
        [0, 0, 0, 0, 0, 1, 0, 1],
        [0, 1, 1, 1, 0, 1, 0, 1],
        [0, 1, 1, 1, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 1]
    ],
    3: [
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 1, 1, 0, 0, 1],
        [1, 0, 1, 0, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 0]
    ],
    4: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 0, 0, 0, 0, 0, 0]
    ]
};

// Cargar imágenes
const images = {
    player: new Image(),
    villain: new Image(),
    prize: new Image(),
    background: new Image(),
    suma: new Image(),
    resta: new Image(),
    multi: new Image(),
    divi: new Image(),
};

images.player.src = 'assets/images/scientist.svg'; // Cambia a scientist.svg
images.suma.src = 'assets/images/suma.png';
images.resta.src = 'assets/images/resta.png';
images.multi.src = 'assets/images/multi.png';
images.divi.src = 'assets/images/divi.png';
images.prize.src = 'assets/images/calculator.png';
images.background.src = 'assets/images/piso.jpg'; // Cargar la imagen de fondo

// Cargar sonidos usando el objeto Audio
const correctSound = new Audio('assets/sounds/correct.mp3');
const wrongSound = new Audio('assets/sounds/wrong.mp3');
const treasureSound = new Audio('assets/sounds/treasure.mp3');
const bossFightSound = new Audio('assets/sounds/bossfight.mp3');
const backgroundSound = new Audio('assets/sounds/background.mp3');
backgroundSound.loop = true; // Habilitar el bucle para la música de fondo

// Función para iniciar el AudioContext
function startAudio() {
    console.log("Iniciando audio..."); // Mensaje de depuración
    backgroundSound.play(); // Reproduce la música de fondo
}

// Ejemplo: Reproducir un sonido
function playCorrectSound() {
    correctSound.play(); // Para reproducir el sonido correcto
}

// Clase para el jugador
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100; // Aumenta el ancho del jugador
        this.height = 100; // Aumenta la altura del jugador
        this.image = images.player; // Cargar la imagen del jugador
    }

    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
}

// Inicializar el juego
function init() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    canvas.width = 700; // Tamaño del canvas (640x640 píxeles)
    canvas.height = 700;

    player = new Player(40, 40); // Posición inicial del jugador
    gameLoop(); // Inicia el bucle del juego
}

// Bucle del juego
function gameLoop() {
    drawGame(); // Dibuja el juego
    requestAnimationFrame(gameLoop); // Llama a la siguiente iteración del bucle
}

// Dibujar el juego
function drawGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height); // Dibuja el fondo
    drawMaze(); // Dibuja el laberinto
    player.draw(); // Dibuja al jugador
    updateScore(); // Actualiza el puntaje
}

// Función para actualizar el puntaje
function updateScore() {
    document.getElementById('score').innerText = score; // Actualiza el puntaje en la interfaz
}

// Función para dibujar el laberinto
function drawMaze() {
    const maze = mazes[level]; // Obtiene el laberinto del nivel actual
    const cellSize = 100; // Tamaño de cada celda (100x100 píxeles)

    for (let i = 0; i < maze.length; i++) {
        for (let j = 0; j < maze[i].length; j++) {
            if (maze[i][j] === 1) {
                ctx.fillStyle = 'black'; // Color de las paredes
                ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize); // Dibuja la pared
            } else if (maze[i][j] === 2) {
                const doorImg = new Image();
                doorImg.src = 'assets/images/madera.jpg'; // Ruta a la imagen de la puerta
                ctx.drawImage(doorImg, j * cellSize, i * cellSize, cellSize, cellSize); // Dibuja la puerta
            }
        }
    }
}

// Manejar las teclas
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            if (player.y > 0 && mazes[level][Math.floor((player.y - 40) / 100)][Math.floor(player.x / 100)] === 0) {
                player.y -= 40; // Mueve al jugador hacia arriba
            }
            break;
        case 'ArrowDown':
            if (player.y < canvas.height - player.height && mazes[level][Math.floor((player.y + 40) / 100)][Math.floor(player.x / 100)] === 0) {
                player.y += 40; // Mueve al jugador hacia abajo
            }
            break;
        case 'ArrowLeft':
            if (player.x > 0 && mazes[level][Math.floor(player.y / 100)][Math.floor((player.x - 40) / 100)] === 0) {
                player.x -= 40; // Mueve al jugador hacia la izquierda
            }
            break;
        case 'ArrowRight':
            if (player.x < canvas.width - player.width && mazes[level][Math.floor(player.y / 100)][Math.floor((player.x + 40) / 100)] === 0) {
                player.x += 40; // Mueve al jugador hacia la derecha
            }
            break;
    }
});

// Función para actualizar las vidas en el contenedor
function updateLives() {
    const livesContainer = document.getElementById('lives-container');
    livesContainer.innerHTML = ''; // Limpia el contenedor antes de agregar los corazones

    for (let i = 0; i < lives; i++) {
        const heartImg = document.createElement('img');
        heartImg.src = 'assets/images/heart.svg'; // Ruta al archivo de corazón
        heartImg.alt = 'Corazón'; // Texto alternativo
        livesContainer.appendChild(heartImg); // Agrega el corazón al contenedor
    }
}

// Función para generar ecuaciones según el nivel
function generateEquations() {
    equations = []; // Limpia las ecuaciones anteriores
    switch (level) {
        case 1: // Sumas
            for (let i = 0; i < 5; i++) {
                const num1 = Math.floor(Math.random() * 10) + 1; // Números entre 1 y 10
                const num2 = Math.floor(Math.random() * 10) + 1;
                equations.push(`${num1} + ${num2} = ?`);
            }
            break;
        case 2: // Restas
            for (let i = 0; i < 5; i++) {
                const num1 = Math.floor(Math.random() * 10) + 1;
                const num2 = Math.floor(Math.random() * num1) + 1; // Asegura que num2 sea menor que num1
                equations.push(`${num1} - ${num2} = ?`);
            }
            break;
        case 3: // Multiplicaciones
            for (let i = 0; i < 5; i++) {
                const num1 = Math.floor(Math.random() * 10) + 1;
                const num2 = Math.floor(Math.random() * 10) + 1;
                equations.push(`${num1} * ${num2} = ?`);
            }
            break;
        case 4: // Divisiones
            for (let i = 0; i < 5; i++) {
                const num1 = Math.floor(Math.random() * 10) + 1;
                const num2 = Math.floor(Math.random() * num1) + 1; // Asegura que num2 sea menor que num1
                equations.push(`${num1} / ${num2} = ?`);
            }
            break;
    }
}

// Función para mostrar las ecuaciones en el contenedor
function displayEquations() {
    const equationBox = document.getElementById('equation-box');
    equationBox.innerHTML = ''; // Limpia el contenedor antes de agregar nuevas ecuaciones
    equations.forEach(equation => {
        const equationElement = document.createElement('div');
        equationElement.textContent = equation; // Agrega la ecuación al contenedor
        equationBox.appendChild(equationElement);
    });
}

// Función para inicializar las puertas
function initDoors() {
    for (let i = 0; i < mazes[level].length; i++) {
        for (let j = 0; j < mazes[level][i].length; j++) {
            if (mazes[level][i][j] === 2) { // Si hay una puerta
                doors.push({ x: j * 100, y: i * 100, open: false }); // Almacena la posición de la puerta
            }
        }
    }
}

// Función para verificar si el jugador está cerca de una puerta
function checkDoors() {
    doors.forEach(door => {
        if (!door.open && player.x < door.x + 40 && player.x + player.width > door.x && player.y < door.y + 40 && player.y + player.height > door.y) {
            // Si el jugador está cerca de la puerta
            currentEquation = generateEquation(); // Genera una ecuación
            document.getElementById('equation-box').textContent = `Resuelve la ecuación: ${currentEquation}`; // Muestra la ecuación
            document.getElementById('user-answer').style.display = 'block'; // Muestra el cuadro de texto
            document.getElementById('submit-answer').style.display = 'block'; // Muestra el botón de respuesta
        }
    });
}

// Evento para manejar el envío de la respuesta
document.getElementById('submit-answer').addEventListener('click', () => {
    const userAnswer = parseInt(document.getElementById('user-answer').value); // Obtiene la respuesta del usuario
    if (userAnswer === eval(currentEquation.replace('=', ''))) { // Verifica la respuesta
        doors.forEach(door => {
            if (!door.open && player.x < door.x + 40 && player.x + player.width > door.x && player.y < door.y + 40 && player.y + player.height > door.y) {
                door.open = true; // Abre la puerta
                alert("¡Puerta abierta!"); // Mensaje de éxito
                document.getElementById('equation-box').textContent = ''; // Limpia la ecuación
                document.getElementById('user-answer').style.display = 'none'; // Oculta el cuadro de texto
                document.getElementById('submit-answer').style.display = 'none'; // Oculta el botón de respuesta
            }
        });
    } else {
        alert("Respuesta incorrecta. Intenta de nuevo."); // Mensaje de error
    }
});

// Función para generar una ecuación aleatoria
function generateEquation() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return `${num1} + ${num2} = ?`; // Cambia esto según el nivel
}

// Llama a initDoors(), updateLives(), generateEquations() y displayEquations() después de inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    init();
    initDoors(); // Inicializa las puertas
    updateLives(); // Muestra los corazones al iniciar el juego
    generateEquations(); // Genera las ecuaciones al iniciar el juego
    displayEquations(); // Muestra las ecuaciones en el contenedor
    document.getElementById('start-button').addEventListener('click', () => {
        startAudio(); // Inicia el audio al hacer clic en el botón
        document.getElementById('cover-page').style.display = 'none'; // Oculta la pantalla de inicio
        document.getElementById('game-container').style.display = 'block'; // Muestra el contenedor del juego

        // Detener el video
        const video = document.getElementById('background-video');
        video.pause(); // Detiene el video
        video.currentTime = 0; // Reinicia el video al inicio (opcional)
    });
});

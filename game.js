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
    wall: new Image(),
};

images.player.src = 'assets/images/scientist.svg'; // Cambia a scientist.svg
images.suma.src = 'assets/images/suma.png';
images.resta.src = 'assets/images/resta.png';
images.multi.src = 'assets/images/multi.png';
images.divi.src = 'assets/images/divi.png';
images.prize.src = 'assets/images/calculator.png';
images.background.src = 'assets/images/piso.jpg'; // Cargar la imagen de fondo
images.wall.src = 'assets/images/concreto.jpg'; // Cargar la imagen de pared

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
    drawMaze();
    player.draw(); // Dibuja al jugador
    checkDoors(); // Verifica si el jugador está cerca de una puerta
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
                // Dibujar la pared (cuadro negro)
                // ctx.fillStyle = 'black';
                // ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                // Usar la imagen de pared en lugar de un cuadro negro
                if (images.wall) {
                    ctx.drawImage(images.wall, j * cellSize, i * cellSize, cellSize, cellSize);
                } else { // Si la imagen de pared no se ha cargado (por si acaso), dibuja un cuadro negro como respaldo
                    ctx.fillStyle = 'black';
                    ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
                }
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
                doors.push({ x: j * 100, y: i * 100, open: false, equationActive: false }); // Almacena la posición de la puerta y el estado de la ecuación
            }
        }
    }
}

// Función para verificar si el jugador está cerca de una puerta
function checkDoors() {
    console.log("🚪 checkDoors() INICIO - Puertas totales:", doors.length);
    doors.forEach((door, index) => {
        console.log(`🚪 Puerta ${index} - Detalles completos:`);
        console.log(`   Coordenadas: (${door.x}, ${door.y})`);
        console.log(`   Estado abierta: ${door.open}`);
        console.log(`   Ecuación activa: ${door.equationActive}`);

        // Verificar proximidad del jugador
        const isNearDoor =
            player.x < door.x + 50 &&
            player.x + player.width > door.x - 50 &&
            player.y < door.y + 50 &&
            player.y + player.height > door.y - 50;

        console.log(`   ¿Jugador cerca?: ${isNearDoor}`);
        console.log(`   Posición jugador: (${player.x}, ${player.y})`);
        console.log(`   Dimensiones jugador: width=${player.width}, height=${player.height}`);

        if (!door.open && !door.equationActive && isNearDoor) {
            console.log(`🔓 Activando ecuación para puerta ${index}`);
            currentEquation = generateEquation(); // Genera una ecuación
            displayCurrentEquation(); // Muestra la ecuación en el cuadro de ecuaciones
            document.getElementById('user-answer').style.display = 'block'; // Muestra el cuadro de texto de respuesta
            document.getElementById('submit-answer').style.display = 'block'; // Muestra el botón de respuesta
            door.equationActive = true; // Establecer equationActive a true
        }
    });
}

// Evento para manejar el envío de la respuesta
document.getElementById('submit-answer').addEventListener('click', () => {
    console.log("🔍 INICIO - Botón de enviar respuesta clickeado");
    console.log("Ecuación actual:", currentEquation);

    // Obtener el valor del input
    const userAnswerInput = document.getElementById('user-answer');
    const userAnswer = parseInt(userAnswerInput.value);

    console.log("Respuesta del usuario:", userAnswer);
    console.log("Puertas existentes:", doors.length);

    // Verificar si la respuesta está vacía
    if (isNaN(userAnswer)) {
        displayMessage("Por favor, ingresa una respuesta válida");
        console.warn("⚠️ Respuesta vacía o inválida");
        return;
    }

    // Calcular respuesta correcta
    const correctAnswer = eval(currentEquation.replace('= ?', '').trim());

    console.log("Respuesta correcta:", correctAnswer);
    console.log("Posición del jugador:", player.x, player.y);

    // Comparar respuestas
    if (userAnswer === correctAnswer) {
        console.log("✅ RESPUESTA CORRECTA");

        // Lógica para abrir puertas
        let doorsUnlocked = 0;
        doors.forEach((door, index) => {
            console.log(`🚪 Puerta ${index}:`);
            console.log(`Coordenadas: (${door.x}, ${door.y})`);
            console.log(`Estado actual: open=${door.open}, equationActive=${door.equationActive}`);

            // Condiciones más detalladas para verificar proximidad
            const isNearDoor =
                player.x < door.x + 50 &&
                player.x + player.width > door.x - 50 &&
                player.y < door.y + 50 &&
                player.y + player.height > door.y - 50;

            console.log(`¿Está cerca de la puerta? ${isNearDoor}`);

            if (!door.open && isNearDoor) {
                door.open = true;
                door.equationActive = false;
                doorsUnlocked++;

                console.log(`🔓 Puerta ${index} desbloqueada`);

                // Calcular fila y columna de la puerta en el laberinto
                const doorRow = Math.floor(door.y / 100);
                const doorCol = Math.floor(door.x / 100);

                // Cambiar el valor en la matriz del laberinto
                mazes[level][doorRow][doorCol] = 0;
                console.log(`Matriz del laberinto actualizada en (${doorRow}, ${doorCol})`);
            }
        });

        // Limpiar input y ocultar elementos si se desbloqueó al menos una puerta
        if (doorsUnlocked > 0) {
            userAnswerInput.value = '';
            userAnswerInput.style.display = 'none';
            document.getElementById('submit-answer').style.display = 'none';

            // Mensaje con número de puertas
            displayMessage(`¡Respuesta correcta! ${doorsUnlocked} puerta(s) desbloqueada(s).`);
        }
    } else {
        console.log("❌ Respuesta INCORRECTA");
        displayMessage(`Respuesta incorrecta. La respuesta correcta era ${correctAnswer}. ¡Inténtalo de nuevo!`);
    }

    // Limpiar ecuación actual
    currentEquation = '';
    displayCurrentEquation();
});

console.log("Event listener for submit-answer button attached!"); // Debugging: Confirm event listener attachment

// Función para generar una ecuación aleatoria
function generateEquation() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    return `${num1} + ${num2} = ?`; // Ecuaciones dinámicas
}

// Función para mostrar la ecuación actual en el cuadro de ecuaciones
function displayCurrentEquation() {
    console.log("displayCurrentEquation() is called, currentEquation:", currentEquation); // Debugging message
    const equationBox = document.getElementById('equation-box');
    equationBox.textContent = currentEquation ? `Resuelve: ${currentEquation}` : ''; // Muestra la ecuación o limpia el cuadro
}

// Función para mostrar mensajes en el cuadro de mensajes
function displayMessage(message) {
    // Crear un div para el mensaje si no existe
    let messageDiv = document.getElementById('game-message');

    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.id = 'game-message';
        messageDiv.style.position = 'fixed';
        messageDiv.style.top = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
        messageDiv.style.color = 'white';
        messageDiv.style.padding = '10px 20px';
        messageDiv.style.borderRadius = '5px';
        messageDiv.style.zIndex = '1000';
        messageDiv.style.textAlign = 'center';
        messageDiv.style.fontSize = '16px';

        document.body.appendChild(messageDiv);
    }

    // Mostrar el mensaje
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';

    // Ocultar después de 3 segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);

    // Log adicional en consola
    console.log(message);
}

// Llama a initDoors(), updateLives(), generateEquations() y displayEquations() después de inicializar el juego
document.addEventListener('DOMContentLoaded', () => {
    init();
    initDoors(); // Inicializa las puertas
    updateLives(); // Muestra los corazones al iniciar el juego
    document.getElementById('start-button').addEventListener('click', () => {
        startAudio(); // Inicia el audio al hacer clic en el botón
        document.getElementById('cover-page').style.display = 'none'; // Oculta la pantalla de inicio
        document.getElementById('game-container').style.display = 'flex'; // Muestra el contenedor del juego
        displayCurrentEquation(); // Clear equation box when game starts

        // Detener el video
        const video = document.getElementById('background-video');
        video.pause(); // Detiene el video
        video.currentTime = 0; // Reinicia el video al inicio (opcional)
    });
});

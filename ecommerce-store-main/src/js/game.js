let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let ship = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    speed: 5
};

let bullets = [];
let meteors = [];
let stars = [];
let selectedShip = "";
let score = 0; // Переменная для отслеживания количества подобранных звездочек
let gameover = false;

// Функция для сохранения очков в localStorage
function saveScore(score) {
    localStorage.setItem('score', score);
}

// Функция для загрузки очков из localStorage
function loadScore() {
    let savedScore = localStorage.getItem('score');
    if (savedScore) {
        return parseInt(savedScore);
    } else {
        return 0;
    }
}

// Функция для создания пули
function createBullet() {
    bullets.push({
        x: ship.x + ship.width / 2,
        y: ship.y,
        radius: 5,
        speed: 7
    });
}

// Функция для создания метеорита
function createMeteor() {
    meteors.push({
        x: Math.random() * canvas.width,
        y: -50,
        radius: Math.random() * 25 + 15,
        speed: Math.random() * 3 + 1
    });
}

// Функция для создания звездочки
function createStar() {
    stars.push({
        x: Math.random() * canvas.width,
        y: -50,
        radius: Math.random() * 3 + 1,
        speed: Math.random() * 2 + 1
    });
}

// Функция для движения корабля
function moveShip() {
    if (37 in keysDown && ship.x > 0) {
        ship.x -= ship.speed;
    }
    if (39 in keysDown && ship.x + ship.width < canvas.width) {
        ship.x += ship.speed;
    }
}

// Функция для обновления положения пуль
function updateBullets() {
    bullets.forEach(function(bullet) {
        bullet.y -= bullet.speed;
    });
    bullets = bullets.filter(bullet => bullet.y > 0);
}

// Функция для обновления положения метеоритов
function updateMeteors() {
    meteors.forEach(function(meteor, index) {
        meteor.y += meteor.speed;

        // Проверяем столкновение метеорита с кораблем
        if (!gameover && meteor.y + meteor.radius > ship.y &&
            meteor.x + meteor.radius > ship.x &&
            meteor.x - meteor.radius < ship.x + ship.width &&
            ship.y + ship.height > 0) {
            gameover = true;
            endGame();
        }

        // Проверяем столкновение пули с метеоритом
        bullets.forEach(function(bullet, bulletIndex) {
            if (bullet.x + bullet.radius > meteor.x - meteor.radius &&
                bullet.x - bullet.radius < meteor.x + meteor.radius &&
                bullet.y + bullet.radius > meteor.y - meteor.radius &&
                bullet.y - bullet.radius < meteor.y + meteor.radius) {
                // Удаляем пулю и метеорит при столкновении
                bullets.splice(bulletIndex, 1);
                meteors.splice(index, 1);
                score += 10; // Увеличиваем счет за уничтожение метеорита
            }
        });
    });
    meteors = meteors.filter(meteor => meteor.y < canvas.height);
}

// Функция для обновления положения звездочек
function updateStars() {
    stars.forEach(function(star, index) {
        star.y += star.speed;

        // Проверяем столкновение звездочки с кораблем
        if (star.y + star.radius > ship.y &&
            star.x + star.radius > ship.x &&
            star.x - star.radius < ship.x + ship.width) {
            stars.splice(index, 1); // Удаляем звездочку из массива
            score++; // Увеличиваем счет за подобранную звездочку
        }
    });
    stars = stars.filter(star => star.y < canvas.height);
}

// Функция для отрисовки корабля
function drawShip() {
    ctx.drawImage(selectedShip, ship.x, ship.y, ship.width, ship.height);
}

// Функция для отрисовки пуль
function drawBullets() {
    bullets.forEach(function(bullet) {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, Math.PI * 2);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
    });
}

// Функция для отрисовки метеоритов
function drawMeteors() {
    meteors.forEach(function(meteor) {
        ctx.beginPath();
        ctx.arc(meteor.x, meteor.y, meteor.radius, 0, Math.PI * 2);
        ctx.fillStyle = "gray";
        ctx.fill();
        ctx.closePath();
    });
}

// Функция для отрисовки звездочек
function drawStars() {
    stars.forEach(function(star) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.closePath();
    });
}

// Функция для отрисовки счета
function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("Score: " + score, 10, 20);
}

// Функция для обновления игры
function update() {
    if (!gameover) {
        moveShip();
        updateBullets();
        updateMeteors();
        updateStars();
    }
}

// Функция для отрисовки игры
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShip();
    drawBullets();
    drawMeteors();
    drawStars();
    drawScore();
}

// Функция для завершения игры
function endGame() {
    saveScore(score); // Сохраняем текущий счет
    alert("Игра окончена! Ваш счет: " + score);
    document.location.reload(); // Перезагружаем страницу для новой игры
}

// Обработчики клавиш для управления кораблем и стрельбы
let keysDown = {};
addEventListener("keydown", function(event) {
    keysDown[event.keyCode] = true;
    if (event.keyCode === 32) { // Пробел для стрельбы
        createBullet();
    }
});

addEventListener("keyup", function(event) {
    delete keysDown[event.keyCode];
});

// Обработчик клика по изображению корабля
document.querySelectorAll('.ship-option').forEach(ship => {
    ship.addEventListener('click', function() {
        // Убираем выделение со всех кораблей
        document.querySelectorAll('.ship-option').forEach(ship => {
            ship.classList.remove('selected');
        });

        // Выделяем выбранный корабль
        this.classList.add('selected');

        // Загружаем изображение выбранного корабля
        selectedShip = new Image();
        selectedShip.src = this.getAttribute('data-ship');
    });
});

// Обработчик клика по кнопке "Начать игру"
document.getElementById('start-game').addEventListener('click', function() {
    if (!selectedShip) {
        alert('Выберите корабль перед началом игры!');
        return;
    }

    // Скрываем секцию с выбором корабля, показываем игровое поле
    document.getElementById('ship-selection').style.display = 'none';
    document.getElementById('game').style.display = 'block';

    // Загружаем последний счет из localStorage
    score = loadScore();

    // Запускаем игру
    setInterval(function() {
        update();
        draw();
    }, 1000 / 60);

    // Генерируем метеориты и звездочки
    setInterval(function() {
        createMeteor();
        createStar();
    }, 2000);
});

// Начальная загрузка игры
window.onload = function() {
    // Предварительно загружаем все изображения кораблей
    document.querySelectorAll('.ship-option').forEach(ship => {
        let image = new Image();
        image.src = ship.getAttribute('data-ship');
    });
};
document.addEventListener('DOMContentLoaded', function() {
    const shipOptions = document.querySelectorAll('.ship-option');
    const startGameButton = document.getElementById('start-game');
    const shipSelectionSection = document.getElementById('ship-selection');
    const gameSection = document.getElementById('game');
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    
    let selectedShip = null;
    let score = 0;

    shipOptions.forEach(option => {
        option.addEventListener('click', function() {
            shipOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedShip = this.dataset.ship;
        });
    });

    startGameButton.addEventListener('click', function() {
        if (!selectedShip) {
            alert('Пожалуйста, выберите корабль.');
            return;
        }

        score = 0; // Обнулить очки при начале новой игры
        updateScore();

        shipSelectionSection.style.display = 'none';
        gameSection.style.display = 'block';

        startGame();
    });

    function updateScore() {
        // Обновите отображение очков на экране (если необходимо)
        console.log('Очки: ', score);
    }

    function startGame() {
        // Ваш игровой код для запуска игры
        // Например, вы можете нарисовать выбранный корабль на canvas
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height); // Очистить canvas
        let img = new Image();
        img.src = selectedShip;
        img.onload = function() {
            ctx.drawImage(img, gameCanvas.width / 2 - img.width / 2, gameCanvas.height - img.height - 10);
        };

        // Пример логики игры (здесь вы можете добавить вашу игровую механику)
        gameLoop();
    }

    function gameLoop() {
        // Основной игровой цикл (здесь вы можете добавить свою игровую механику)
        // Для демонстрации используем requestAnimationFrame
        requestAnimationFrame(gameLoop);

        // Обновите очки (для демонстрации просто увеличиваем на 1 каждую итерацию)
        score++;
        updateScore();
    }
});


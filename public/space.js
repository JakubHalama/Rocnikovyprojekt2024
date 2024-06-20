// Velikost jednoho políčka herního plánu
let tileSize = 32;

// Počet řádků a sloupců herního plánu
let rows = 16;
let columns = 16;

// Deklarace proměnných pro herní plán
let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;

// Nastavení vlastností hráčovy lodi
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

// Objekt reprezentující hráčovu loď
let ship = {
    x: shipX,
    y: shipY,
    width: shipWidth,
    height: shipHeight
};

// Obrázek hráčovy lodi
let shipImg;

// Rychlost pohybu hráčovy lodi
let shipVelocityX = tileSize;

// Pole pro vetřelce (aliens)
let alienArray = [];

// Vlastnosti vetřelce (alien)
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;

// Obrázek vetřelce
let alienImg;

// Počet řádků a sloupců vetřelců
let alienRows = 2;
let alienColumns = 3;

// Počet živých vetřelců
let alienCount = 0;

// Rychlost pohybu vetřelců
let alienVelocityX = 1;

// Pole pro střely
let bulletArray = [];

// Rychlost střelby
let bulletVelocityY = -10;

// Skóre a stav hry
let score = 0;
let gameOver = false;

// Funkce, která se spustí po načtení okna
window.onload = function() {
    // Nastavení herního plánu
    board = document.getElementById("board");
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d");

    // Načtení obrázku hráčovy lodi
    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    };

    // Načtení obrázku vetřelce
    alienImg = new Image();
    alienImg.src = "./alien.png";

    // Vytvoření počátečních vetřelců
    createAliens();

    // Spuštění herní smyčky
    requestAnimationFrame(update);

    // Naslouchání událostem klávesnice
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
};

// Funkce pro aktualizaci hry
function update() {
    requestAnimationFrame(update);

    // Pokud je hra ukončena, ukončí se i aktualizace
    if (gameOver) {
        return;
    }

    // Vymazání plátna
    context.clearRect(0, 0, board.width, board.height);

    // Vykreslení hráčovy lodi
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // Aktualizace a vykreslení vetřelců
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                alien.x += alienVelocityX * 2;
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            // Kontrola, zda vetřelec dosáhl hráčovy lodi
            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    // Aktualizace a vykreslení střel
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            // Detekce kolize mezi střelou a vetřelcem
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    // Odstranění použitých střel z pole
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift();
    }

    // Pokud jsou všichni vetřelci zničeni, aktualizace hry
    if (alienCount == 0) {
        score += alienColumns * alienRows * 100;
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2);
        alienRows = Math.min(alienRows + 1, rows - 4);
        if (alienVelocityX > 0) {
            alienVelocityX += 0.2;
        } else {
            alienVelocityX -= 0.2;
        }
        alienArray = [];
        bulletArray = [];
        createAliens();
    }

    // Vykreslení skóre
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}

// Funkce pro pohyb hráčovy lodi
function moveShip(e) {
    if (gameOver) {
        return;
    }

    // Pohyb vlevo
    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
        ship.x -= shipVelocityX;
    }
    // Pohyb vpravo
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX;
    }
}

// Funkce pro vytvoření počátečních vetřelců
function createAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img: alienImg,
                x: alienX + c * alienWidth,
                y: alienY + r * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            };
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

// Funkce pro střelbu
function shoot(e) {
    if (gameOver) {
        return;
    }

    // Střelba po stisku mezerníku
    if (e.code == "Space") {
        let bullet = {
            x: ship.x + shipWidth * 15 / 32,
            y: ship.y,
            width: tileSize / 8,
            height: tileSize / 2,
            used: false
        };
        bulletArray.push(bullet);
    }
}

// Funkce pro detekci kolize mezi objekty a, b
function detectCollision(a, b) {
    return a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y;
}

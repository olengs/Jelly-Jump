//board consts
const boardHeight = 600;
const boardWidth = 1200;
const playerWidth = 90;
const playerHeight = 95;
const playerPosX = 50;
const obstructionHeight = 100;
const gravity = 1000;
let obstructionSpeed = 600;
const rockWidth1 = 34;
const rockWidth2 = 69;
const rockWidth3 = 102;
const playerJumpStrength = 800;
const airResistance = 1200;

class Object {
    constructor (x=0, y=0, width=0, height=0, velX=0, velY=0, img) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.velX = velX;
        this.velY = velY;
        this.img = img;
    }

    draw (context) {
        context.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    update (dt) {
        this.x += this.velX * dt
    }

    checkCollision(other) {
        return this.x < other.x + other.width &&
            this.x + this.width > other.x &&
            this.y < other.y + other.height &&
            this.y + this.height > other.y;
    }
}

class Player extends Object{
    constructor(img){
        super(playerPosX, boardHeight - playerHeight, playerWidth, playerHeight, 0, 0, img)
        this.move = this.move.bind(this);
        this.accX = 0;
        this.accY = 0;
    }

    move (e) {
        if ((e.code == "Space" || e.code == "ArrowUp") && this.y == boardHeight - playerHeight) {
            //console.log("Jump");
            this.accY = airResistance;
            this.velY = -playerJumpStrength;
        }
    }

    update(dt) {
        super.update(dt);
        this.accY += gravity * dt;
        this.velY += this.accY * dt;
        this.y = Math.min(boardHeight - playerHeight, + this.y + this.velY * dt); //apply gravity to player, but makes sure it doesn't go underground
        //console.log(player.y);
    }
}

class Obstruction extends Object{
    constructor(width, img_src){
        super(boardWidth, boardHeight - obstructionHeight, width, obstructionHeight, -obstructionSpeed, 0, img_src)
    }
}

let player;
let board;
let context;
let obstructions = [];
let gameOver = false;
let score = 0;
let playerImage;
let rockImage1, rockImage2, rockImage3, bgImage;
let prevtime;
let bgx = 0;
let bgx_speed = 120;

window.onload = function() {
    let scale = 1.0;
    board = document.getElementById("board");
    //keep resolution, scale linearly
    board.height = boardHeight * scale;
    board.width = boardWidth * scale;

    context = board.getContext("2d");

    bgImage = new Image();
    bgImage.src = "/game/img/gamebg.png";

    playerImage = new Image();
    playerImage.src = "/game/img/jelly0.png";
    
    rockImage1 = new Image();
    rockImage1.src = "/game/img/rock0.png";

    rockImage2 = new Image();
    rockImage2.src = "/game/img/rock1.png";

    rockImage3 = new Image();
    rockImage3.src = "/game/img/rock2.png";

    player = new Player(playerImage);
    prevtime = this.performance.now();

    this.requestAnimationFrame(update);
    this.setInterval(spawnRock, 1500);
    this.document.addEventListener("keydown", player.move);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) return;

    let dt = (performance.now() - prevtime) / 1000;

    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);
    context.globalAlpha = 0.5
    context.drawImage(bgImage, bgx, 0, board.width, board.height);
    context.drawImage(bgImage, board.width + bgx - 5, 0, board.width, board.height);
    context.globalAlpha = 1;

    obstructionSpeed += dt * 5;
    bgx = (bgx - obstructionSpeed * dt) % board.width;

    prevtime = performance.now();
    player.update(dt);
    player.draw(context);

    for (let i = 0; i < obstructions.length; ++i) {
        let rock = obstructions[i];
        rock.update(dt);
        rock.draw(context);

        if (player.checkCollision(rock)) {
            //console.log(player.x, player.y, player.width, player.height);
            //console.log(rock.x, rock.y, rock.width, rock.height);
            gameOverEvent();
            return;
        }
    }

    context.fillStyle = "white";
    context.font = "20px courier";
    score++;
    context.fillText(`Score: ${score}`, 5, 20);
}

function spawnRock() {
    if (gameOver) return;

    let obj;
    let typeChance = Math.random();

    if (typeChance < 0.15) {
        obj = new Obstruction(rockWidth3, rockImage3);
    } else if (typeChance < 0.45) {
        obj = new Obstruction(rockWidth2, rockImage2);
    } else {
        obj = new Obstruction(rockWidth1, rockImage1);
    }
    obstructions.push(obj);

    if (obstructions.length > 10) {
        obstructions.shift();
    }
}

function gameOverEvent() {
    gameOver = true
    obstructions = [];

    //redraw bg
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);
    context.globalAlpha = 0.2
    context.drawImage(bgImage, bgx, 0, board.width, board.height);
    context.drawImage(bgImage, board.width + bgx - 5, 0, board.width, board.height);
    context.globalAlpha = 1;

    context.fillStyle = "white";
    context.font = "20px courier";
    context.fillText(`Game Over`, board.width * 0.45, board.height * 0.5);
    context.fillText(`Score: ${score}`, board.width * 0.45, board.height * 0.5 + 20);

    // 
    updateHighscore(score);
}

async function updateHighscore(highscore) {
    try {
        let userId = document.getElementById("userId").value;
        const data = JSON.stringify({userId, highscore, gameEndTime: Date.now()});
        let resp = await fetch(`/game/endgame`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: data,
        });
        if (!resp.ok) {
            throw new Error(`Network response error: ${resp.Error}`);
        }
        let respjson = await resp.json();
        if (respjson.Error) {
            throw new Error(`Update highscore error: ${resp.Error}`);
        }
    } catch (error) {
        console.log(error);
    }
}

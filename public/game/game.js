//board consts
const boardHeight = 600;
const boardWidth = 1200;
const scale = 1.0;
const floorHeight = 75;
const playerWidth = 90;
const playerHeight = 95;
const playerPosX = 50;
const obstructionHeight = 100;
const gravity = 1400;
const rockWidth1 = 50;
const rockWidth2 = 170;
const rockWidth3 = 200;
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
        super(playerPosX, boardHeight - playerHeight - floorHeight, playerWidth, playerHeight, 0, 0, img)
        this.move = this.move.bind(this);
        this.accX = 0;
        this.accY = 0;
        this.jumpCounter = 0;
    }

    move (e) {
        if ((e.code == "Space" || e.code == "ArrowUp") && this.y == boardHeight - playerHeight - floorHeight) {
            //console.log("Jump");
            this.accY = airResistance;
            this.velY = -playerJumpStrength;
            this.jumpCounter += 1;
        }
    }

    update(dt) {
        super.update(dt);
        this.accY += gravity * dt;
        this.velY += this.accY * dt;
        this.y = Math.min(boardHeight - playerHeight - floorHeight, + this.y + this.velY * dt); //apply gravity to player, but makes sure it doesn't go underground
        //console.log(player.y);
    }
}

class Obstruction extends Object{
    constructor(width, img_src){
        super(boardWidth, boardHeight - obstructionHeight - floorHeight, width, obstructionHeight, -obstructionSpeed, 0, img_src)
    }
}

class Spawner {
    constructor() {
        this.timeToSpawn = 0;
    }

    checkSpawn(dt) {
        this.timeToSpawn -= dt;
        console.log(this.timeToSpawn);
        if (this.timeToSpawn <= 0) {
            this.timeToSpawn = Math.random() * 2 + 0.8;
            return true;
        }
        return false;
    }

    spawn() {
        let obj;
        let typeChance = Math.random();

        if (typeChance < 0.15) {
            obj = new Obstruction(rockWidth3, rockImage3);
        } else if (typeChance < 0.45) {
            obj = new Obstruction(rockWidth2, rockImage2);
        } else {
            obj = new Obstruction(rockWidth1, rockImage1);
        }

        return obj;
    }
}

let player;
let board;
let context;
let obstructions;
let gameOver;
let playerImage;
let rockImage1, rockImage2, rockImage3, bgImage;

let prevtime;
let score;
let bgx;
let bgx_speed;
let midbutton;
let obstructionSpeed;
let interval;
let spawner;

window.onload = () => {
    board = document.getElementById("board");

    //keep resolution, scale linearly

    context = board.getContext("2d");

    board.height = boardHeight * scale;
    board.width = boardWidth * scale;
}

let start = () => {
    midbutton = document.getElementById("startbutton");
    midbutton.hidden = true;

    score = 0;
    gameOver = false;
    bgx = 0;
    obstructions = [];
    bgx_speed = 120;
    obstructionSpeed = 800;

    spawner = new Spawner();
    
    const character = this.document.getElementById("character").value;

    bgImage = new Image();
    bgImage.src = "/game/img/bg.png";

    playerImage = new Image();
    playerImage.src = `/game/img/jelly${character}.png`;
    
    rockImage1 = new Image();
    rockImage1.src = "/game/img/rock0.png";

    rockImage2 = new Image();
    rockImage2.src = "/game/img/rock1.png";

    rockImage3 = new Image();
    rockImage3.src = "/game/img/rock2.png";

    player = new Player(playerImage);
    prevtime = this.performance.now();

    this.requestAnimationFrame(update);
    this.document.addEventListener("keydown", player.move);
}

let update = () => {
    requestAnimationFrame(update);
    if (gameOver) return;

    let dt = (performance.now() - prevtime) / 1000;

    if (spawner.checkSpawn(dt)) {
        obstructions.push(spawner.spawn());

        if (obstructions.length > 10) {
            obstructions.shift();
        }
    }

    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);
    context.globalAlpha = 0.4
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
            gameOverEvent(player);
            return;
        }
    }

    context.fillStyle = "white";
    context.font = "20px courier";
    score++;
    context.fillText(`Score: ${score}`, 5, 20);
}

let gameOverEvent = (player) => {
    gameOver = true
    if (interval) clearInterval(interval);
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

    updateHighscore(score, player.jumpCounter);

    midbutton.hidden = false;
    midbutton.textContent = "Restart";
}

let updateHighscore = async (highscore, jumps) => {
    let playerId = document.getElementById("playerId").value;
    const character = this.document.getElementById("character").value;
    const data = JSON.stringify({playerId, highscore, gameEndTime: Date.now(), character, jumps});
    try {
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

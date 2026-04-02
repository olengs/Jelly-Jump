const boardHeight = 600;
const boardWidth = 1200;
const scale = 1.0;
const cardWidth = 80;
const cardHeight = 120;
let board;
let context;
let draw1button;
let draw10button;
let jellyImgs;

class Card{
    constructor(obj) {
        this.type = obj.type;
        this.value = obj.value;
        this.fillStyle = obj.type == "currency" ? "purple" : "gold";
    }

    draw(context, x, y){
        let prevFillStyle = context.fillStyle;
        context.fillStyle = this.fillStyle;
        context.fillRect(x, y, cardWidth, cardHeight);
        if (this.type == "currency") {
            context.fillStyle = "white";
            context.fillText(`${this.value} blobs`, x + cardWidth * 0.25, y + cardHeight * 0.5, cardWidth);
        } else {
            let widthShift = Math.floor(0.05 * cardWidth);
            let heightShift = Math.floor(0.05 * cardHeight);
            context.drawImage(jellyImgs[this.value], x + widthShift, y + heightShift, cardWidth - widthShift * 2, cardHeight - heightShift * 2);
        }
        context.fillStyle = prevFillStyle;
    }
}

window.onload = () => {
    board = document.getElementById("board");

    //keep resolution, scale linearly
    context = board.getContext("2d");

    board.height = boardHeight * scale;
    board.width = boardWidth * scale;

    draw1button = document.getElementById("draw1button");
    draw10button = document.getElementById("draw10button");

    jellyImgs = Array.from({length: 12}, (_, i) => {
        let img = new Image();
        img.src = `/game/img/jelly${i}.png`;
        return img;
    });
}

let refreshBoard = () => {
    context.clearRect(0, 0, board.width, board.height);
    context.fillStyle = "black";
    context.fillRect(0, 0, board.width, board.height);
}

let draw1 = async () => {
    let {results} = await draw(1);
    console.log(results);
    let x = Math.floor(boardWidth * 0.5 - cardWidth * 0.5);
    let y = Math.floor(boardHeight * 0.5 - cardHeight * 0.5);
    ret = new Card(results[0]);
    ret.draw(context, x, y);
}

let draw10 = async () => {
    let {results} = await draw(10);
    console.log(results);
    for (let i = 0; i < 2; ++i) {
        for (let j = 0; j < 5; ++j) {
            let x = Math.floor(boardWidth * (0.13 + 0.18 * j) - cardWidth * 0.5);
            let y = Math.floor(boardHeight * (0.33 + 0.33 * i) - cardHeight * 0.5);
            console.log(x, y);
            ret = new Card(results[i * 2 + j]);
            ret.draw(context, x, y);
        }
    }
}

let draw = async (count) => {
    draw1button.hidden = true;
    draw10button.hidden = true;
    let playerId = document.getElementById("playerId").value;
    const data = JSON.stringify({playerId, pullCount: count});
    refreshBoard();
    try {
        let resp = await fetch(`/game/pull`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: data,
        });
        if (!resp.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        let respjson = await resp.json();
        if (respjson.Error) {
            throw new Error(`Gacha pull error: ${JSON.stringify(respjson.Error, null, 2)}`);
        }
        draw1button.hidden = false;
        draw10button.hidden = false;
        const coupon_count_elem = document.getElementById("coupon_count");
        const remainder = Number(coupon_count_elem.textContent) - Number(count);
        coupon_count_elem.textContent = remainder;
        if (remainder < 1) draw1button.disabled = true;
        if (remainder < 10) draw10button.disabled = true;
        return respjson;
    } catch (error) {
        console.log(error);
        return null;
    }
}
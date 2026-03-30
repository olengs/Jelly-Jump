let draw1 = async () => {
    let results = await draw(1);
}

let draw10 = async () => {
    let results = await draw(1);
}

let draw = async (count) => {
    let playerId = document.getElementById("playerId").value;
    const data = JSON.stringify({playerId, count});
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
            throw new Error(`Gacha pull error: ${resp.Error || "Unknown Error"}`);
        }
        return respjson;
    } catch (error) {
        console.log(error);
        return null;
    }
}
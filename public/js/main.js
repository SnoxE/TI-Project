function drawPitch(ctx)
{
    //trawa
    ctx.fillStyle = "green";
    ctx.fillRect(0, canvas.height - 15, canvas.width, 15);

    //linia srodkowa
    ctx.fillStyle = "white";
    ctx.fillRect(canvas.width / 2 - 1, canvas.height - 15, 2, 15); 

    //srodkowy okrag
    ctx.strokeStyle = "white"
    ctx.beginPath();    
    ctx.arc(canvas.width / 2, canvas.height - 15 / 2, 5, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.closePath();

    //bramki    
    let x1 = 5;
    let y1 = canvas.height - 15 - 50;
    ctx.fillRect(x1, y1, 5, 50);

    let x2 = canvas.width - 10;
    let y2 = canvas.height - 15 - 50;
    ctx.fillRect(x2, y2, 5, 50);
}

function createCanvas() {
    let text = `<canvas id = "canvas" width = "900" height = "500"></canvas>`;
    document.getElementById("game-running").innerHTML = text;

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    let v0 = document.getElementById('speed').value;
    let angle = document.getElementById('angle').value;

    v0 = v0 * 10 / 36;

    let angleRad = angle * Math.PI / 180;
    let v0x = v0 * Math.cos(angleRad) * 2;
    let v0y = v0 * Math.sin(angleRad) * 2;

    
    let x1 = 5 + canvas.width * 5 / 100;
    let xstart = x1;
    let y1 = canvas.height - 15;
    let time = 0.0001;

    drawPitch(ctx);
    draw(ctx, v0x, v0y, xstart, x1 + 10, y1, canvas, time, angle, v0);
}


function draw(ctx, vx, vy, xstart, x1, y1, canvas, time, angle, v0) {

    let g = 9.81;

    let x = x1 + vx * time;
    let y = y1 + vy * time - g * time * time / 2;
    vy = vy - g * time;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(x1, canvas.height - y1 + 470);
    ctx.lineTo(x, canvas.height - y + 470);
    ctx.stroke();
    time += 0.0001;

    let req;
    req = window.requestAnimationFrame(function () 
    {
        draw(ctx, vx, vy, xstart, x, y, canvas, time, angle, v0);
    });

    let distance = (x - xstart) * 100 / (canvas.width - 20);
    distance = distance.toFixed(2);

    if (y < 485)
    {
        cancelAnimationFrame(req);
        let text = `<div id = "attempt">Piłka poleciała na dystans ${distance} metrów.</div>`;
        document.getElementById('game-end').innerHTML = text;
        let urlParameters = new URLSearchParams(window.location.search);

        let username = urlParameters.get('username');
        let password = urlParameters.get('password');

        if (username != null && password != null)
        {
            getData(parseFloat(angle), parseFloat(document.getElementById('speed').value), parseFloat(distance));
        }
    }
}

function getData(angle, speed, distance) {
    let data = {angle: angle, speed: speed, distance: distance}
    console.log(data)

    fetch("/", { 
        headers:
        {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(data)
    }).then((response) => {
        response.json().then(function (data) {
            let result = JSON.parse(data);
            console.log(result)
        });
    }).catch((e) => {
        console.log(e)
    });
}
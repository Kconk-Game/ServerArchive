const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketio = require("socket.io");
const io = new socketio.Server(server);
const CANNON = require("./cannon-es.js");


const world = new CANNON.World();
world.gravity.set(0, -14, 0);
const potato = new CANNON.Material({ friction: 0.05, restitution: 0 });

function platformify(x1, z1, y1, x2, z2, y2, rx=0, ry=0, rz=0) {
    const width = 0.3 * Math.abs(x2 - x1);
    const height = 0.3 * Math.abs(y2 - y1);
    const length = 0.3 * Math.abs(z2 - z1);


    const centerPos = {
        x: 0.15 * (x1 + x2),
        y: 0.15 * (y1 + y2),
        z: 0.15 * (z1 + z2)
    };


    const physics = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(width * 0.5, height * 0.5, length * 0.5)), material: potato });
    physics.position.x = centerPos.x;
    physics.position.y = centerPos.y;
    physics.position.z = centerPos.z;
    physics.quaternion.setFromEuler(rx, ry, rz);
    world.addBody(physics);


    return physics;
}

const map = [
    [ // misc
        platformify(0, 0, 0, 50, 100, 2),
        platformify(-30, -40, 0, 5, -36, 20, 0, 0.25 * Math.PI, 0),
        platformify(-5, -40, 0, 30, -36, 20, 0, -0.25 * Math.PI, 0),
        platformify(-20, -20, -5, 20, -50, 0)
    ],
    [ // path 1
        platformify(38, 114.4, 0, 61, 131.8, 2), // first jump
        platformify(26.2, 145.8, 0, 53.2, 180.2, 2), // second jump, right path
        platformify(74.2, 128.6, 0, 92, 170.2, 2), // second jump, left path
        platformify(74.2, 180.6, 0, 82, 190.2, 4), // second jump, left path (extra platform)
        platformify(57.4, 190, -2, 70.5, 209.2, 0), // third jump (really small one)
        platformify(11.7, 221.3, -2, 81.9, 251.1, 0), // L-shaped platform, long piece
        platformify(11.7, 251.1, -2, 41.5, 280.7, 0), // L-shaped platform, short piece
        platformify(49, 270, 0, 114.2, 312, 3), // fourth jump (first one after L)
        platformify(79.6, 324.5, 0, 94.9, 339.8, 3), // fifth jump, right path
        platformify(111.4, 322.7, 0, 135.43, 335.3, 4), // fifth jump, left path
        platformify(89, 355.6, 0, 100.5, 379.5, 5), // sixth jump, right path
        platformify(120, 340, -4, 140, 350, -2), // jump 5.5, left path
        platformify(115.3, 357, 0, 151.4, 370, 4), // sixth jump, left path
        platformify(91.7, 404.1, 0, 103.4, 421.3, 8), // walljump section, right path
        platformify(147.1, 370, 0, 174.3, 443, 12, -0.3, -0.3, 0), // walljump section, left path: platform 2
        platformify(108.6, 432.3, 0, 125.5, 441.2, 12), // walljump section, back platform
        platformify(118.3, 383.1, 0, 132.8, 421.9, 20) // path 1: final platform (item)
    ]
];

app.get("/", function(req, res) {
    console.log("Page requested");
    res.sendFile(__dirname + "/index.html");
});

app.use(express.static("static"));

function pronounceableCode() {
    const v = "aeiouy"; // vowels
    const c = "bcdfgklmnprstvxzhwjr"; // consonants without Q
    return c[Math.floor(Math.random() * 19)] + v[Math.floor(Math.random() * 6)] + c[Math.floor(Math.random() * 19)] + v[Math.floor(Math.random() * 6)] + c[Math.floor(Math.random() * 15)];
}


const speed = 5;
const accel = 0.2;
const punchPower = 5;
const punchRange = 6;
const jumpHeight = 10;
const walljumpHeight = 8;
const walljumpSpeed = 5;


let players = [];


io.on("connection", (socket) => {
    console.log("socket! hello!");
    let player = {index: players.length, ball: new CANNON.Body({ mass: 0.1, shape: new CANNON.Sphere(1), fixedRotation: true, material: potato, linearDamping: 0.4 }), name: "GUEST•" + pronounceableCode(), movement: {x: 0, y: 0}, jump: true, iframes: 20};
    players.push(player);
    player.ball.position.x = 2.5;
    player.ball.position.y = 5;
    player.ball.position.z = 5;
    world.addBody(player.ball);
    console.log(player.name + " connected! Index " + player.index.toString());
    socket.emit("index", player.index);
    socket.on("update", function(direction, space) {
        if (direction.x !== 0 && direction.x / direction.x !== 1) return;
        if (direction.z !== 0 && direction.z / direction.z !== 1) return;
        const length = Math.sqrt(direction.x ** 2 + direction.z ** 2);
        if (length) {
            direction.x /= length;
            direction.z /= length;
        }
        player.movement.x = direction.x;
        player.movement.z = direction.z;
        if (space) player.jump = true;
        else player.jump = false;
    });
    socket.on("boop", function(target) {
        if (!players[target] || player.index === target) return;
        let difference = {
            x: players[target].ball.position.x - player.ball.position.x,
            y: players[target].ball.position.y - player.ball.position.y,
            z: players[target].ball.position.z - player.ball.position.z
        };
        const length = Math.sqrt(difference.x ** 2 + difference.y ** 2 + difference.z ** 2);
        if (!players[target].iframes && length > 0 && length < punchRange) {
            players[target].ball.velocity.x += punchPower * difference.x / length;
            players[target].ball.velocity.y += punchPower * difference.y / length;
            players[target].ball.velocity.z += punchPower * difference.z / length;
            players[target].iframes = 15;
        }
    });
    socket.on("disconnect", () => {
        world.removeBody(player.ball);
        console.log(player.name + " left.");
        players[player.index] = null;
    });
});


setInterval(function() {
    players.forEach(function(player) {
        if (player === null) return;
        if (player.movement.x > 0 && player.ball.velocity.x < player.movement.x * speed || player.movement.x < 0 && player.ball.velocity.x > player.movement.x * speed) {
            player.ball.velocity.x += player.movement.x * accel;
        }
        if (player.movement.z > 0 && player.ball.velocity.z < player.movement.z * speed || player.movement.z < 0 && player.ball.velocity.z > player.movement.z * speed) {
            player.ball.velocity.z += player.movement.z * accel;
        }
        if (player.jump) {
            let walljump = -1;
            let walljumpCV;
            let contactVector = null;
            for (let i = 0; i < world.contacts.length; i++) {
                let contactVector = null;
                if (world.contacts[i].bj === player.ball) contactVector = world.contacts[i].rj.negate();
                else if (world.contacts[i].bi !== player.ball) continue;
                if (contactVector === null) contactVector = world.contacts[i].ri.negate();


                if (contactVector.y > 0.3) {
                    if (player.ball.velocity.y < jumpHeight) player.ball.velocity.y = jumpHeight;
                    break;
                }
                else if (contactVector.y > -0.3) {
                    walljump = i;
                    walljumpCV = contactVector;
                }
            }
            if (walljump !== -1) {
                if (player.ball.velocity.y < 2) player.ball.velocity.y = walljumpHeight;
                player.ball.velocity.x += walljumpCV.x * walljumpSpeed;
                player.ball.velocity.z += walljumpCV.z * walljumpSpeed;
            }
        }
        if (player.iframes) player.iframes--;
    });
    world.fixedStep();


    let playerData = [];
    for (let i = 0; i < players.length; i++) {
        if (players[i]) {
            playerData[i] = {
              position: players[i].ball.position,
              name: players[i].name
            }
        }
        else {
            playerData[i] = null;
        }
    }
    io.emit("update", playerData);
}, 20);

server.listen(3000, ()=> {
    console.log("new server code: 2/17/2023");
});

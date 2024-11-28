const express = require("express");
const app = express();
const server = require("http").createServer(app);
const socketio = require("socket.io");
const io = new socketio.Server(server);
const CANNON = require("./cannon-es.js");
global.FOUR = CANNON;

// add sound effects ✅
// okay but like change the happyboi face it's disgusting
// prevent players from doing anything when their question attribute is nonnull
// after every 5 ticks, reset the player movement
// Bind RShift to be equivalent to left click, and add user-customizable controls while you're at it
// bug that's now a feature: arrow keys are still slow on player selection, but fast ingame
// add zoom ✅


const world = new CANNON.World();
global.world = world;
world.gravity.set(0, -14, 0);

const physicsMaterial = new CANNON.Material({ friction: 0.05, restitution: 0 });


// include map file:
let map = require("./map.js")(physicsMaterial);


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


// load global.settings:
require("./server-config.js");


let sockets = [];

let players = {};
let dataArray = [];
let survivingPlayers = [];

const skinsList = ["default", "sire", "striped", "glass", "flat", "pixelated", "xenon", "toon", "unicorn", "gold"];
const facesList = ["default", "quag", "original", "pixelated", "happyboi", "uwu", "krez", "angy", "eyes", "$$"];

let stfu = true;
let gameID = -1;
let playersCheckerID = -1;

function startGame(checkPlayers=true) {
    if (checkPlayers) {
        playersCheckerID = setInterval(function() {
            if ([null, ...sockets].reduce((n,e)=>n+(e?1:0)) >= 2) { // if the amount of players is 2 or more, start the game
                startGame(false);                                   // ("players" being defined as non-falsy sockets)
                clearInterval(playersCheckerID);                    // (the [null, ...sockets] format is because of Array.prototype.reduce weirdness)
            }                                                       // you won't need to actually touch this specific part of my code, I hope
        }, 6969);
        return;
    }

    console.log("game starting!");

    players = {};
    dataArray = [];
    survivingPlayers = [];

    stfu = true;

    sockets.forEach(function(e, i) {
        if (e) {
            players[e.data.name] = e.player = {
                s: { // data sent over socket.io
                    skin: e.data.skin,
                    face: e.data.face,
                    name: e.data.name,
                    hue: e.data.hue,
                    facing: {
                        x: 0, // up-and-down
                        y: 0  // side-to-side (counterintuitive, ik)
                    },
                    index: dataArray.length,
                    position: null,
                    kcoins: 0
                },
                ball: new CANNON.Body({
                    mass: 0.1,
                    shape: new CANNON.Sphere(1),
                    fixedRotation: true,
                    material: physicsMaterial,
                    linearDamping: 0.4
                }),
                movement: {
                    offsetAngle: 0,
                    speed: 0
                },
                space: false,
                hitCooldown: 20,
                iframes: 10,
                question: null,
                info: e
            }
            world.addBody(e.player.ball);
            dataArray.push(e.player.s);
            survivingPlayers.push(e.player.s.name);

            e.player.info.socket.emit("index", e.player.s.index);

            e.player.ball.position.set(4 + 7 * Math.random(), 5 + 10 * Math.random(), 4 + 22 * Math.random()); // spawn in a random position
        }
    });

    function endGame(winner) {
        console.log(`${winner} wins the round.`);
        clearInterval(gameID);
        world.removeBody(players[winner].ball);
        players[winner].info.player = null;
        dataArray[players[winner].s.index] = null;
        io.emit("stop", winner);
        startGame();
    }

    gameID = setInterval(tick, 1000 / global.settings.tps);
    function tick() {
        //____math and preparations____\\

        stfu = true; // make variable updates over socket.io stfu

        world.fixedStep(); // placed before the math to serve as a buffer for stfu lag

        for (let i = 0; i < dataArray.length; i++) {    //
            const data = dataArray[i];                  // iterate through dataArray (array of player.s values)
            if (!data) continue;                        // if null (or otherwise falsy, though that shouldn't happen), skip the dead spot
            const player = players[data.name];          //
            /*
            if (player.ball.position.y < -50) {
                player.ball.position.set(4 + 7 * Math.random(), 5 + 10 * Math.random(), 4 + 22 * Math.random());
            }
            */

            const direction = player.movement.offsetAngle - data.facing.y; // cw relative to -z axis, data.facing.y is subtracted bc it's ccw
            player.movement.speed = Math.max(0, Math.min(1, player.movement.speed));
            xAccel = Math.sin(direction) * player.movement.speed;
            zAccel = -Math.cos(direction) * player.movement.speed;

            if (xAccel > 0 && player.ball.velocity.x < xAccel * global.settings.speed || xAccel < 0 && player.ball.velocity.x > xAccel * global.settings.speed) {
                player.ball.velocity.x += xAccel * global.settings.accel;
                // although players should have their own speed
            }
            if (zAccel > 0 && player.ball.velocity.z < zAccel * global.settings.speed || zAccel < 0 && player.ball.velocity.z > zAccel * global.settings.speed) {
                player.ball.velocity.z += zAccel * global.settings.accel;
            }

            if (player.space) {
                let walljump = -1;
                let walljumpCV;
                let contactVector = null;
                for (let i = 0; i < world.contacts.length; i++) {
                    let contactVector = null;
                    if (world.contacts[i].bj === player.ball) contactVector = world.contacts[i].rj.negate();
                    else if (world.contacts[i].bi !== player.ball) continue;
                    if (contactVector === null) contactVector = world.contacts[i].ri.negate();


                    if (contactVector.y > 0.3) {
                        if (player.ball.velocity.y < global.settings.jumpHeight) player.ball.velocity.y = global.settings.jumpHeight;
                        break;
                    }
                    else if (contactVector.y > -0.3) {
                        walljump = i;
                        walljumpCV = contactVector;
                    }
                }
                if (walljump !== -1) {
                    if (player.ball.velocity.y < 2) player.ball.velocity.y = global.settings.walljumpHeight;
                    player.ball.velocity.x += walljumpCV.x * global.settings.walljumpSpeed;
                    player.ball.velocity.z += walljumpCV.z * global.settings.walljumpSpeed;
                }
            }

            if ((player.ball.position.x - coin.x) ** 2 + (player.ball.position.y - coin.y) ** 2 + (player.ball.position.z - coin.z) ** 2 < 2.25) {
                if (player.question === null) {
                    coin = coinSpawns[Math.floor(Math.random() * coinSpawns.length)];
                    io.emit("coin", coin);
                    question(player.s.name);
                }
            }

            if (player.iframes) player.iframes--;

            if (player.ball.position.y < -50) {
                console.log(`${player.s.name} died :(`);

                world.removeBody(player.ball);
                player.info.player = null;
                dataArray[player.s.index] = null; // do not splice. this is a dangerous trap to fall prey to
                survivingPlayers = survivingPlayers.filter(name => name !== player.s.name);
                console.log(`Surviving players: [${survivingPlayers}]`);
                players[player.s.name] = null;

                if (survivingPlayers.length == 1) {
                    endGame(survivingPlayers[0]);
                    break;
                }
            }
        }

        // update send:
        dataArray.forEach(function(data) {
            if (data) {
                data.position = {
                    x: players[data.name].ball.position.x,
                    y: players[data.name].ball.position.y,
                    z: players[data.name].ball.position.z
                };
            }
        });
        sockets.forEach(function(info) {
            if (info) info.socket.emit("update", dataArray);
        });
        stfu = false;
    }
}

const coinSpawns = [
    {x: 14.85, y: 1.1, z: 36.93},
    {x: 11.91, y: 1.1, z: 48.9},
    {x: 24.93, y: 1.1, z: 44.82},
    {x: 23.43, y: 1.7, z: 55.62},
    {x: 19.185, y: 0.5, z: 59.88},
    {x: 14.04, y: 0.5, z: 70.86},
    {x: 7.98, y: 0.5, z: 79.77},
    {x: 24.48, y: 1.4, z: 87.3},
    {x: 26.175, y: 1.4, z: 99.645},
    {x: 37.0245, y: 1.7, z: 98.7},
    {x: 28.425, y: 2, z: 110.265},
    {x: 39, y: -0.1, z: 103.5},
    {x: 40.005, y: 1.7, z: 109.05},
    {x: 29.265, y: 2.9, z: 123.81},
    {x: 48.21, y: 4.1, z: 121.95},
    {x: 35.115, y: 4.1, z: 131.025},
    {x: 37.665, y: 6.5, z: 120.75}
];
let coin = coinSpawns[16];

const questions = [
    /*{
        question: "q1.png",
        answers: ["a1_1.png", "a1_2.png"],
        correct: 0
    },*/
    {
        question: "q2.png",
        answers: ["a2_1.png", "a2_2.png"],
        correct: 0
    },
    {
        question: "sowersdemo/q1.png",
        answers: ["sowersdemo/a1_1.png", "sowersdemo/a1_2.png", "sowersdemo/a1_3.png", "sowersdemo/a1_4.png"],
        correct: 1
    },
    {
        question: "sowersdemo/q2.png",
        answers: ["sowersdemo/a2_1.png", "sowersdemo/a2_2.png", "sowersdemo/a2_3.png", "sowersdemo/a2_4.png"],
        correct: 3
    },
    {
        question: "sowersdemo/q3.png",
        answers: ["sowersdemo/a3_1.png", "sowersdemo/a3_2.png", "sowersdemo/a3_3.png", "sowersdemo/a3_4.png"],
        correct: 2
    },
    {
        question: "sowersdemo/q4.png",
        answers: ["sowersdemo/a4_1.png", "sowersdemo/a4_2.webp", "sowersdemo/a4_3.png", "sowersdemo/a4_4.png", "sowersdemo/a4_5.png"],
        correct: 4
    },
    {
        question: "kana/q1.png",
        answers: ["kana/a1_1.png", "kana/a1_2.png", "kana/a1_3.png", "kana/a1_4.png"],
        correct: 3
    }
];
function question(playerName) {
    const info = players[playerName].info;
    const qData = questions[Math.floor(Math.random() * questions.length)];
    players[playerName].question = qData.correct;
    console.log(`${playerName} was asked the question [${qData.question}]`);
    info.socket.emit("question", qData.question, qData.answers);
}

io.on("connection", (socket) => {
    let me = {
        data: {
            skin: "default",
            face: "default",
            name: "GUEST•" + pronounceableCode(),
            hue: 180
        },
        index: sockets.length,
        player: null,
        socket: socket
    };
    console.log(`hello, socket ${me.index}!`);
    sockets.push(me);

    io.emit("coin", coin);

    socket.on("style", function(skin, face, name, color) {
        if (skinsList.includes(skin)) me.data.skin = skin;
        if (facesList.includes(face)) me.data.face = face;

        let hue = parseInt(color);
        if (typeof hue !== "number" || !isFinite(hue) || hue >= 360 || hue < 0) hue = 69;
        me.data.hue = hue;

        name = name.replace(/^ */, "").replace(/ *$/, "").replace(/[^ -~]/g, "�"); // remove leading/trailing whitespace, obfuscate unknown characters
        if (typeof name === "string" && name.length < 33 && name.length > 2) me.data.name = name; // only go through with rename if length is at least 3 and no more than 32 characters long

        let names = sockets.map(function(socket) {
            if (socket && socket !== me) return socket.data.name;
        });
        let duplicateNumber = 0;
        while (names.includes(me.data.name)) {
            me.data.name = name + (++duplicateNumber);
        }

        console.log(`Socket ${me.index} renamed ${me.data.name} [${me.data.face}${me.data.skin}]`);
        names[me.index] = me.data.name;
        console.log(`names array: ${names}`);
    });

    // or maybe use a temporary object as a buffer for fx/fy/mvDir/mvMag/space which can be edited at update's leisure, but copy the buffer to the player object only once per tick at a given point?
    socket.on("update", function(fx, fy, mvDir, mvMag, space) {
        if (me.player && !stfu) {
            if (typeof fx !== "number" || !isFinite(fx) || typeof fy !== "number" || !isFinite(fy) || typeof mvDir !== "number" || !isFinite(mvDir) || typeof mvMag !== "number" || !isFinite(mvMag)) return;
            me.player.s.facing = {x: fx, y: fy};
            me.player.movement = {offsetAngle: mvDir, speed: mvMag};
            me.player.space = space ? true : false;
        }
    });

    socket.on("boop", function(target) {
        if (me.player && !stfu && dataArray[target]) {
            let targetPlayer = players[dataArray[target].name];
            if (me.player.index === target) return;
            let difference = {
                x: targetPlayer.ball.position.x - me.player.ball.position.x,
                y: targetPlayer.ball.position.y - me.player.ball.position.y,
                z: targetPlayer.ball.position.z - me.player.ball.position.z
            };
            const length = Math.sqrt(difference.x ** 2 + difference.y ** 2 + difference.z ** 2);
            if (!targetPlayer.iframes && length > 0 && length < global.settings.punchRange) {
                targetPlayer.ball.velocity.x += (global.settings.punchPower + me.player.s.kcoins) * difference.x / length;
                targetPlayer.ball.velocity.y += (global.settings.punchPower + me.player.s.kcoins) * difference.y / length;
                targetPlayer.ball.velocity.z += (global.settings.punchPower + me.player.s.kcoins) * difference.z / length;
                targetPlayer.iframes = 10;
            }
            else {
                console.log("out of range, or target is invincible");
            }
        }
    });

    socket.on("answer", function(index) { // When an answer to a player's current coin/item (add a .reward attribute to disambiguate) question is received:
        if (me.player) { // short-circuit evaluation continues to be ignored in a somewhat disgusting fashion
            if (me.player.question !== null) {
                if (index === me.player.question) {
                    console.log(me.player.s.name + " answered a question correctly!");
                    me.player.s.kcoins++;
                    socket.emit("correct?", true);
                }
                else {
                    console.log(me.player.s.name + " is not a real one.");
                    socket.emit("correct?", false);
                }
                me.player.question = null;
            }
            else {
                console.log(me.player.s.name + ", who asked? no literally, no question was asked--");
                socket.emit("correct?", null);
            }
        }
    });

    socket.on("disconnect", function() {
        console.log(`${me.data.name} left.`);
        sockets[me.index] = null;
    });
});

startGame();

server.listen(3000, ()=> {
    console.log("the ✨mild refactor✨ of 6/20/2023");
});

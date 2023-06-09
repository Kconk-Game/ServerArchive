// WIP changes this commit
// fixed ghost player glitch for good
// added faces and outlines

/*const uris = {
    _x: "https://cdn.glitch.global/afa0ee46-ed1b-472a-a99e-312507295cd0/-x.jpg?v=1674528304111",
    x: "https://cdn.glitch.global/afa0ee46-ed1b-472a-a99e-312507295cd0/x.jpg?v=1674528293122",
    y: "https://cdn.glitch.global/afa0ee46-ed1b-472a-a99e-312507295cd0/y.jpg?v=1674528289211",
    _y: "https://cdn.glitch.global/afa0ee46-ed1b-472a-a99e-312507295cd0/-y.jpg?v=1674528301039",
    _z: "https://cdn.glitch.global/afa0ee46-ed1b-472a-a99e-312507295cd0/-z.jpg?v=1674528296225",
    z: "https://cdn.glitch.global/afa0ee46-ed1b-472a-a99e-312507295cd0/z.jpg?v=1674528240380",
    player: "https://cdn.glitch.global/afa0ee46-ed1b-472a-a99e-312507295cd0/Untitled.png?v=1674528311795",
    grass: "https://cdn.glitch.global/afa0ee46-ed1b-472a-a99e-312507295cd0/giphy.gif?v=1674528309117"
};*/

const materialToTouch = new THREE.MeshStandardMaterial({ map: tl.load(uris.grass) });
function platformify(x1, z1, y1, x2, z2, y2, material=materialToTouch, rx=0, ry=0, rz=0) {
    const width = 0.3 * Math.abs(x2 - x1);
    const height = 0.3 * Math.abs(y2 - y1);
    const length = 0.3 * Math.abs(z2 - z1);


    const centerPos = {
        x: 0.15 * (x1 + x2),
        y: 0.15 * (y1 + y2),
        z: 0.15 * (z1 + z2)
    };


    const geometry = new THREE.BoxGeometry(width, height, length);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = centerPos.x;
    mesh.position.y = centerPos.y;
    mesh.position.z = centerPos.z;
    mesh.rotation.x = rx;
    mesh.rotation.y = ry;
    mesh.rotation.z = rz;
    scene.add(mesh);


    return mesh;
}


const map = [
    [ // misc
        platformify(0, 0, 0, 50, 100, 2),
        platformify(-30, -40, 0, 5, -36, 20, new THREE.MeshNormalMaterial(), 0, 0.25 * Math.PI, 0),
        platformify(-5, -40, 0, 30, -36, 20, new THREE.MeshNormalMaterial(), 0, -0.25 * Math.PI, 0),
        platformify(-20, -20, -5, 20, -50, 0, new THREE.MeshStandardMaterial({ color: 0xffea00, roughness: 1, metalness: 0 }))
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
        platformify(147.1, 370, 0, 174.3, 443, 12, materialToTouch, -0.3, -0.3, 0), // walljump section, left path: platform 2
        platformify(108.6, 432.3, 0, 125.5, 441.2, 12), // walljump section, back platform
        platformify(118.3, 383.1, 0, 132.8, 421.9, 20) // path 1: final platform (item)
    ]
]




camera.rotation.x = 1.7 * Math.PI;


window.keys = {
    forward: false,
    left: false,
    back: false,
    right: false,
    jump: false,
    camUp: false,
    camDown: false,
    camLeft: false,
    camRight: false,
    lookBack: false,
    thirdPerson: false
};
let thirdPersonView = false;


//
// IMPORTANT!!!
// only enable movement and looking around (and other controls) when screen is focused (not necessarily locked)
//


window.addEventListener("keydown", function(e) {
    switch (e.code) {
        case "KeyW":
            keys.forward = true;
            break;
        case "KeyA":
            keys.left = true;
            break;
        case "KeyS":
            keys.back = true;
            break;
        case "KeyD":
            keys.right = true;
            break;
        case "Space":
            keys.jump = true;
            break;
        case "ArrowUp":
            keys.camUp = true;
            break;
        case "ArrowDown":
            keys.camDown = true;
            break;
        case "ArrowLeft":
            keys.camLeft = true;
            break;
        case "ArrowRight":
            keys.camRight = true;
            break;
        case "KeyR":
            keys.lookBack = true;
            break;
        case "KeyV":
            if (!keys.thirdPerson) thirdPersonView = !thirdPersonView;
            keys.thirdPerson = true;
            break;
    }
});
window.addEventListener("keyup", function(e) {
    switch (e.code) {
        case "KeyW":
            keys.forward = false;
            break;
        case "KeyA":
            keys.left = false;
            break;
        case "KeyS":
            keys.back = false;
            break;
        case "KeyD":
            keys.right = false;
            break;
        case "Space":
            keys.jump = false;
            break;
        case "ArrowUp":
            keys.camUp = false;
            break;
        case "ArrowDown":
            keys.camDown = false;
            break;
        case "ArrowLeft":
            keys.camLeft = false;
            break;
        case "ArrowRight":
            keys.camRight = false;
            break;
        case "KeyR":
            keys.lookBack = false;
            break;
        case "KeyV":
            keys.thirdPerson = false;
            break;
    }
});


window.rotationBuffer = {x: 0, y: 0};


let playerMeshes = [];
let myIndex;


let socket = io();
const raycaster = new THREE.Raycaster();
raycaster.far = 6;
let point;
let selectedPlayer = null;


function render() {
    camera.position.copy(playerMeshes[myIndex].position);
    if (keys.camUp) rotationBuffer.y -= 10;
    if (keys.camDown) rotationBuffer.y += 10;
    if (keys.camLeft) rotationBuffer.x -= 10;
    if (keys.camRight) rotationBuffer.x += 10;
    controls.rotate(rotationBuffer.x, rotationBuffer.y);
    rotationBuffer.x = 0;
    rotationBuffer.y = 0;
    playerMeshes[myIndex].face.quaternion.copy(camera.quaternion);
    playerMeshes[myIndex].rotate();

    if (keys.lookBack) camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
    playerMeshes[myIndex].hide();
    if (thirdPersonView) {
        playerMeshes[myIndex].show();
        camera.position.addScaledVector(controls.getDirection(new THREE.Vector3()), -5);
    }

    raycaster.set(playerMeshes[myIndex].face.position, new THREE.Vector3(0, 0, -1).applyQuaternion(playerMeshes[myIndex].face.quaternion));
    point = raycaster.intersectObjects(playerMeshes.filter(player => (player && player !== playerMeshes[myIndex])).map(player => player.ball))[0];
    selectedPlayer = null;
    for (let i = 0; i < playerMeshes.length; i++) {
        if (playerMeshes[i]) {
            if (playerMeshes[i].outlineStyle !== "hit") playerMeshes[i].setOutline("hide");
            if (point && playerMeshes[i].ball === point.object) {
                selectedPlayer = i;
                if (playerMeshes[i].outlineStyle != "hit") playerMeshes[i].setOutline("highlight");
            }
        }
    }

    renderer.render(scene, camera); // try making it vr one day with new renderer
    camera.quaternion.copy(playerMeshes[myIndex].face.quaternion);
    requestAnimationFrame(render);
}

let firstUpdate = true;
let angle = new THREE.Euler(0, 0, 0, "YXZ");

socket.on("index", function(index) {
    myIndex = index;
    socket.emit("style", mySkin, myFace, myName);
});


let playerList;
socket.on("update", function(playerData) {
    playerList = "";
    for (let i = 0; i < Math.max(playerData.length, playerMeshes.length); i++) {
        if (!playerData[i]) {
            if (playerMeshes[i]) {
                scene.remove(playerMeshes[i].ball, playerMeshes[i].face, playerMeshes[i].outline);
                playerMeshes[i] = null;
            }
            continue;
        }
        const position = playerData[i].position;
        if (!playerMeshes[i]) {
            playerMeshes[i] = new Player(myFace, mySkin);
        }
        playerMeshes[i].setPosition(position.x, position.y, position.z);
        playerList += `<span class="player-name"${i === myIndex ? ' style="color:green">' : ">"}${playerData[i].name}</span><br>`;
    }
    f3Field.innerHTML = playerList;
    if (firstUpdate) {
        render();
        firstUpdate = false;
    }
    let movement = new THREE.Vector3(0, 0, 0);
    if (keys.forward) movement.z--;
    if (keys.left) movement.x--;
    if (keys.back) movement.z++;
    if (keys.right) movement.x++;
    angle.setFromQuaternion(playerMeshes[myIndex].face.quaternion);
    angle.x = 0;
    angle.z = 0;
    movement.applyEuler(angle);
    socket.emit("update", {x: movement.x, z: movement.z}, keys.jump);
});

renderer.domElement.addEventListener("mousedown", function(e) {
    if (e.button === 0 && controls.isLocked && selectedPlayer !== null) {
        let spmo = playerMeshes[selectedPlayer];
        socket.emit("boop", selectedPlayer);
        spmo.setOutline("hit");
        setTimeout(function() {
            spmo.outlineStyle = null;
        }, 250);
    }
});

/*const joistique = document.createElement("script");
joistique.src = "joistique.js";
document.body.appendChild(joistique);*/

document.getElementById("loading-cover").style.display = "none";

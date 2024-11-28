const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1600, 900);
renderer.setClearColor(0x33aaff, 1);
document.body.appendChild(renderer.domElement);

window.keys = {
    camUp: false,
    camDown: false,
    camLeft: false,
    camRight: false,
    mouseDown: false,
    mouseDownRisingEdge: false,
    mouseDownFallingEdge: false,
    lookBack: false,
    forward: false,
    left: false,
    back: false,
    right: false,
    jump: false,
    thirdPerson: false,
    thirdPersonToggle: false,
    zoom: false
};
renderer.domElement.addEventListener("keydown", function(e) {
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
	        if (!keys.thirdPerson) keys.thirdPersonToggle = !keys.thirdPersonToggle;
	        keys.thirdPerson = true;
	        break;
        case "KeyC":
            keys.zoom = true;
            break;
    }
});
renderer.domElement.addEventListener("keyup", function(e) {
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
        case "KeyC":
            keys.zoom = false;
            break;
    }
});
function mouseDown(ℰ) {
    if (ℰ.button === 0) {
        if (controls.isLocked) {
            keys.mouseDownRisingEdge = true;
            keys.mouseDown = true;
            keys.mouseDownFallingEdge = false;
        }
        else {
            controls.lock();
        }
    }
}
renderer.domElement.addEventListener("mousedown", mouseDown);

function mouseUp(ℰ) {
    if (ℰ.button === 0) {
        keys.mouseDownRisingEdge = false;
        keys.mouseDownFallingEdge = true;
        keys.mouseDown = false;
    }
}
window.addEventListener("mouseup", mouseUp);



window.uris = {
    _x: "textures/-x.jpg",
    x: "textures/x.jpg",
    y: "textures/y.jpg",
    _y: "textures/-y.jpg",
    _z: "textures/-z.jpg",
    z: "textures/z.jpg",
    grass: "textures/giphy.gif"
};

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    90,
    1600 / 900,
    0.1,
    10000
);

//const renderer = new THREE.WebGLRenderer({ antialias: true });
//renderer.setSize(1600, 900);
//renderer.setClearColor(0x33aaff, 1);
//document.body.appendChild(renderer.domElement);
renderer.domElement.setAttribute("tabindex", -1);
renderer.domElement.style.position = "fixed";

const f3Field = document.getElementById("debug");
const leftSidebar = document.getElementById("left-sidebar");
const rightSidebar = document.getElementById("right-sidebar");
const crosshair = document.getElementById("crosshair");

crosshair.addEventListener("mousedown", mouseDown); // no idea why the original violates causality but i guess i have to move it down now??

let rect;
function resizeCanvas() {
    if (window.innerWidth / window.innerHeight > 1600 / 900) { // too thicc
        renderer.domElement.style.width = `${window.innerHeight * 1600 / 900}px`;
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.left = `${0.5 * (window.innerWidth - window.innerHeight * 1600 / 900)}px`;
        renderer.domElement.style.top = 0;
    }
    else {
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = `${window.innerWidth * 0.5625}px`;
        renderer.domElement.style.left = 0;
        renderer.domElement.style.top = `${0.5 * (window.innerHeight - window.innerWidth * 0.5625)}px`;
    }
    rect = renderer.domElement.getBoundingClientRect();

    leftSidebar.style.left = `${rect.left}px`;
    leftSidebar.style.top = `${rect.top}px`;
    leftSidebar.style.width = `${0.2 * rect.width}px`;
    leftSidebar.style.height = `${rect.height}px`;

    f3Field.style.fontSize = `${0.05 * rect.height}px`;

    rightSidebar.style.right = `${rect.left}px`;
    rightSidebar.style.top = `${rect.top}px`;
    rightSidebar.style.width = `${0.2 * rect.width}px`;
    rightSidebar.style.height = `${rect.height}px`;
    rightSidebar.style.fontSize = `${0.03 * rect.height}px`;

    crosshair.style.left = `${rect.left + rect.width * 0.5 - rect.height * 0.02}px`;
    crosshair.style.top = `${rect.top + rect.height * 0.48}px`;
    crosshair.style.width = `${rect.height * 0.04}px`;
    crosshair.style.height = `${rect.height * 0.04}px`;
};
resizeCanvas();
window.addEventListener("resize", resizeCanvas);


const controls = new PointerLockControls(camera, renderer.domElement);
const bgm = document.getElementById("music");

const bgmSourceList = ["music/bonneton.mp3", "music/cloudworld.mp3", "music/dkjungle.mp3", "music/luncheon.mp3", "music/pyramid.mp3", "music/undertale83.mp3", /*"music/wooded.mp3"*/"music/Sherm.mp3", "music/:).mp3", "music/mission2.mp3", "music/monke.mp3"];

function randomizeBGM() {
    bgm.src = bgmSourceList[Math.floor(Math.random() * bgmSourceList.length)];
}
randomizeBGM();

bgm.onended = function() {
    randomizeBGM();
    bgm.play();
};

controls.addEventListener("lock", function() {
    bgm.play();
});
controls.addEventListener("unlock", function() {
    bgm.pause();
});

let qqq = 0;
window.addEventListener("keyup", function(e) {
    if (e.key === "Q") {
        if (++qqq === 3) { // I know about short-circuit evaluation but I think a double-if reads clearer
            qqq = 0;
            bgm.src = bgmSourceList[prompt(`Welcome to the Secret Music Selection screen, accessed by pressing Shift-QQQ!\nSelect by typing a number:\n0: Bonneton (Cap Kingdom) - Super Mario Odyssey\n1: Cloud World (World 6, I think) - New Super Mario Bros. Wii\n2: DK Jungle - Mario Kart 8 Deluxe\n3: Mount Volbono (Luncheon Kingdom) - Super Mario Odyssey\n4: Ruins/Inside the Inverted Pyramid - Super Mario Odyssey\n5: #83 Here We Are - Undertale\n6: Steam Gardens (Wooded Kingdom) [Sherm] - Super Mario Odyssey\n7: Colon Close Bracket Type Music - Xerm\n8: Underwater Neon (Mission 2) - Splatoon 3\n9: Sensei's Power - Advance Wars: Reboot Camp`)];
            bgm.currentTime = 0;
        }
        else {
            setTimeout(()=>{qqq = 0;}, 6969);
        }
    }
});

const tl = new THREE.TextureLoader();
const skybox = new THREE.Mesh(
    new THREE.BoxGeometry(10000, 10000, 10000),
    [
        new THREE.MeshBasicMaterial({ map: tl.load(uris._x), side: 1 }),
        new THREE.MeshBasicMaterial({ map: tl.load(uris.x), side: 1 }),
        new THREE.MeshBasicMaterial({ map: tl.load(uris.y), side: 1 }),
        new THREE.MeshBasicMaterial({ map: tl.load(uris._y), side: 1 }),
        new THREE.MeshBasicMaterial({ map: tl.load(uris._z), side: 1 }),
        new THREE.MeshBasicMaterial({ map: tl.load(uris.z), side: 1 })
    ]
);
scene.add(skybox);

const light = new THREE.AmbientLight(0xffffff);
scene.add(light);
const deadlyLazer = new THREE.DirectionalLight(0xeeffee);
scene.add(deadlyLazer);

window.rotationBuffer = {x: 0, y: 0};

const playerGeom = new THREE.SphereGeometry(1, 60, 30);
const faceGeom = new THREE.SphereGeometry(1.0069, 40, 20);
const outlineGeom = new THREE.SphereGeometry(1.1337, 40, 20);

const faces = {
    default: tl.load("textures/face/default.png"),
    quag: tl.load("textures/face/quag.png"),
    original: tl.load("textures/face/original.png"),
    pixelated: tl.load("textures/face/pixelated.png"),
    happyboi: tl.load("textures/face/happyboi.png"),
    uwu: tl.load("textures/face/uwu.png"),
    krez: tl.load("textures/face/xermic-retribution.png"),
    angy: tl.load("textures/face/angy.png"),
    eyes: tl.load("textures/face/eyes.png"),
    $$: tl.load("textures/face/im-rich.png")
};
const facesEnum = ["default", "quag", "original", "pixelated", "happyboi", "uwu", "krez", "angy", "eyes", "$$"];

const gradientMap = new THREE.DataTexture(new Uint8Array([32, 64, 96]), 3, 1, (renderer.capabilities.isWebGL2) ? THREE.RedFormat : THREE.LuminanceFormat);
gradientMap.needsUpdate = true;

const skins = {
    default: new THREE.MeshLambertMaterial({ color: "hsl(205, 100%, 36%)" }),
    sire: new THREE.MeshLambertMaterial({ map: tl.load("textures/sire.png") }),
    striped: new THREE.MeshLambertMaterial({ map: tl.load("textures/striped.png") }),
    glass: new THREE.MeshPhongMaterial({ color: "hsl(205, 100%, 36%)", transparent: true, opacity: 0.42, shininess: 100 }),
    flat: new THREE.MeshBasicMaterial({ color: "hsl(205, 100%, 36%)" }),
    pixelated: new THREE.MeshPhongMaterial({ color: "hsl(205, 100%, 36%)", flatShading: true, shininess: 50 }),
    xenon: new THREE.MeshLambertMaterial({ color: "#ffffff", transparent: true, map: tl.load("textures/xenon.png"), alphaMap: tl.load("textures/xenonAlpha.png"), side: THREE.DoubleSide }),
    toon: new THREE.MeshToonMaterial({ color: "hsl(205, 100%, 36%)", gradientMap: gradientMap }),
    unicorn: new THREE.MeshNormalMaterial(),
    gold: new THREE.MeshStandardMaterial({ color: "#ffd700", roughness: 0.3, metalness: 0.5 })
};
const skinsEnum = ["default", "sire", "striped", "glass", "flat", "pixelated", "xenon", "toon", "unicorn", "gold"];



function rgbify(sh) {
    sh = (sh < 0) ? sh + 1 : (sh >= 1) ? sh - 1 : sh;
    if (sh * 6 < 1) return sh * 6;       // [ 0,   1/6 )
    if (sh < 0.5) return 1;              // [ 1/6, 1/2 )
    if (sh * 3 < 2) return 4 - 6 * sh;   // [ 1/2, 2/3 )
    return 0;                            // [ 2/3, 1   )
}
class Text {
    constructor(text="") {
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");

        this.setText(text)
    }
    setText(text) {
        this.text = text;
        this.ctx.font = "100px Jost";
        this.textWidth = 0.01 * this.ctx.measureText(this.text).width;
    }
    draw(style="black", maxWidth=null, maxHeight=null, cursor=false) {
        if (maxHeight === null) maxHeight = 100;
        if (maxWidth === null) maxWidth = this.textWidth * maxHeight;
        this.canvas.width = maxWidth;
        this.canvas.height = maxHeight;

        this.ctx.clearRect(0, 0, maxWidth, maxHeight);

        if (this.text) {
            this.ctx.fillStyle = style === "white" ? "#ffffff" : style === "orange" ? "#ff8000" : style === "gray" ? "#808080" : "#000000";

            this.rect = {};
            if (maxWidth / maxHeight > this.textWidth) {
                this.rect.width = maxHeight * this.textWidth;
                this.rect.height = maxHeight;
                this.rect.x1 = 0.5 * (maxWidth - this.rect.width);
                this.rect.y1 = 0;
                this.rect.x2 = 0.5 * (maxWidth + this.rect.width);
                this.rect.y2 = maxHeight;

            }
            else {
                this.rect.width = maxWidth;
                this.rect.height = maxWidth / this.textWidth;
                this.rect.x1 = 0;
                this.rect.y1 = 0.5 * (maxHeight - maxWidth / this.textWidth);
                this.rect.x2 = maxWidth;
                this.rect.y2 = 0.5 * (maxHeight + maxWidth / this.textWidth);
            }

            this.rect.width = Math.floor(this.rect.width);
            this.rect.height = Math.floor(this.rect.height);
            this.rect.x1 = Math.floor(this.rect.x1);
            this.rect.y1 = Math.floor(this.rect.y1);
            this.rect.x2 = Math.floor(this.rect.x2);
            this.rect.y2 = Math.floor(this.rect.y2);

            this.ctx.font = `${this.rect.height}px Jost`;
            this.ctx.textBaseline = "bottom";
            this.ctx.fillText(this.text, this.rect.x1, this.rect.y2);

            if (style === "rainbow") {
                let pixels = this.ctx.getImageData(this.rect.x1, this.rect.y1, this.rect.width, this.rect.height);
                for (let y = 0; y < this.rect.height; y++) {
                    for (let x = 0; x < this.rect.width; x++) {
                        if (pixels.data[4 * (x + y * this.rect.width) + 3]) {
                            let hue = x / this.rect.width;
                            pixels.data[4 * (x + y * this.rect.width)] = Math.floor(rgbify(hue + 1/3) * 256);
                            pixels.data[4 * (x + y * this.rect.width) + 1] = Math.floor(rgbify(hue) * 256);
                            pixels.data[4 * (x + y * this.rect.width) + 2] = Math.floor(rgbify(hue - 1/3) * 256);
                        }
                    }
                }
                this.ctx.putImageData(pixels, this.rect.x1, this.rect.y1);
            }
            if (typeof cursor === "number") {
                this.ctx.fillRect(this.rect.x1 + this.ctx.measureText(this.text.substring(0, cursor)).width, this.rect.y1, 5, this.rect.height);
            }
        }
        else if (cursor) {
            console.log(`(${maxWidth * 0.5}, 0, 5, ${maxHeight})`);
            this.ctx.fillRect(maxWidth * 0.5, 0, 5, maxHeight);
        }

        return this.canvas;
    }
}

class Ball {
    constructor(face, skin, x=0, y=-100000, z=0, hue=280) {
        this.outline = new THREE.Mesh(outlineGeom, new THREE.MeshBasicMaterial({ color: 0, side: THREE.BackSide }));
        this.permanentOutline = false;
        this.setOutline("hide");

        this.ball = new THREE.Mesh(playerGeom, skins.flat);
        this.setSkin(skin, hue);

        this.face = new THREE.Mesh(faceGeom, new THREE.MeshBasicMaterial({ transparent: true }));
        this.face.renderOrder = 1;
        this.setFace(face);

        this.setPosition(x, y, z);

        scene.add(this.outline);
        scene.add(this.ball);
        scene.add(this.face);
    }
    setOutline(style) {
        this.outlineStyle = style;
        if (!this.hidden) {
            switch (style) {
                case "hide":
                    this.outline.material.color.setHex(0);
                    this.outline.visible = this.permanentOutline;
                    break;
                case "highlight":
                    this.outline.material.color.setHex(0xffffff);
                    this.outline.visible = true;
                    break;
                case "select":
                    this.outline.material.color.setHex(128);
                    this.outline.visible = true;
                    break;
                case "hit":
                    this.outline.material.color.setHex(0xed4a4a);
                    this.outline.visible = true;
                    break;
                default:
                    console.error("Nonexistent outline style!");
                    break;
            }
        }
    }
    setSkin(skinName, hue) {
        this.skin = skinName;
        this.ball.material = skins[skinName];

        this.permanentOutline = false;

        switch (skinName) {
            case "toon":
                this.permanentOutline = true;
                // no break
            case "default":case "glass":case "flat":case "pixelated":
                this.ball.material = this.ball.material.clone();
                this.setHue(hue);
                break;
            case "sire":case "striped":case "xenon":case "unicorn":case "gold":
                break;
            default:
                console.error(`how in the name of the Flying Spaghetti Monster is "${skinName}" a skin name`);
        }

        this.setOutline(this.outlineStyle);
    }
    setHue(hue) {
        this.hue = hue;
        this.ball.material.color.setHSL(hue / 360, 1, 0.36);
    }
    setFace(faceName) {
        this.faceName = faceName;
        this.face.material.map = faces[faceName];
    }
    setPosition(x, y, z) {
        this.position = new THREE.Vector3(x, y, z);
        this.ball.position.copy(this.position);
        this.face.position.copy(this.position);
        this.outline.position.copy(this.position);
    }
    hide() {
        this.hidden = true;
        this.outline.visible = false;
        this.ball.visible = false;
        this.face.visible = false;
    }
    show() {
        this.hidden = false;
        this.setOutline(this.outlineStyle);
        this.ball.visible = true;
        this.face.visible = true;
    }
    rotate() {
        this.ball.quaternion.copy(this.face.quaternion);
    }
}

class Player extends Ball {
    constructor(face, skin, name, hue) {
        super(face, skin, 0, -100000, 0, hue);

        const nameText = new Text(name);
        // names[names.length - 1].draw(i === myIndex ? "orange" : playerData[i].name.substring(0, 6) === "GUEST•" ? "gray" : "black", rect.width * 0.2, rect.width * 0.05);
        this.img = nameText.draw("rainbow");
        this.nametag = new THREE.Sprite(new THREE.SpriteMaterial({map: new THREE.Texture(this.img)}));
	    this.nametag.scale.set(0.6 * this.img.width / this.img.height, 0.6, 1);
	    this.nametag.material.map.needsUpdate = true;

        this.setPosition(0, -100000, 0);
        scene.add(this.nametag);

        this.row = {
            tr: document.createElement("tr"),
            prefix: document.createElement("td"),
            name: document.createElement("td"),
            score: document.createElement("td")
        }

        this.row.prefix.className = "prefix";
        this.row.prefix.innerText = "[TEST]";
        this.row.tr.appendChild(this.row.prefix);

        this.row.name.className = "name";
        this.row.name.innerText = name;
        this.row.tr.appendChild(this.row.name);

        this.row.score.className = "score";
        // innerText not necessary because it is set in script.js
        this.row.tr.appendChild(this.row.score);
    }
    setPosition(x, y, z) {
        this.position = new THREE.Vector3(x, y, z);
        this.ball.position.copy(this.position);
        this.face.position.copy(this.position);
        this.outline.position.copy(this.position);
        if (this.nametag) this.nametag.position.set(x, y + 1.4, z);
    }
    selfDestruct() {
        scene.remove(this.ball, this.face, this.outline, this.nametag);
        this.row.tr.remove();
    }
}



// THIS IS LITERALLY THE ENTIRE PLAYER SELECTION NOW
window.mySkin = "pixelated";
window.myFace = "pixelated";
window.myName = "no";
window.myHue = Math.floor(Math.random() * 360);



const sfxElements = {
    hit: document.createElement("audio"),
    miss: document.createElement("audio"),
    death: document.createElement("audio"),
    coin: document.createElement("audio")
};
sfxElements.hit.src = "sfx/punch.wav";
sfxElements.miss.src = "sfx/whoosh.wav";
sfxElements.death.src = "sfx/bang-bang.mp3";
sfxElements.coin.src = "sfx/coin.wav";

window.playSound = function(name) {
    const e = sfxElements[name];
    if (!e) return 1;
    e.currentTime = 0;
    e.play();
};



const materialToTouch = new THREE.MeshStandardMaterial({ map: tl.load(uris.grass) });
class Platform {
    constructor(x1, z1, y1, x2, z2, y2, material=materialToTouch, rx=0, ry=0, rz=0) {
        const width = 0.3 * Math.abs(x2 - x1);
        const height = 0.3 * Math.abs(y2 - y1);
        const length = 0.3 * Math.abs(z2 - z1);


        const centerPos = {
            x: 0.15 * (x1 + x2),
            y: 0.15 * (y1 + y2),
            z: 0.15 * (z1 + z2)
        };


        const geometry = new THREE.BoxGeometry(width - 1, height, length - 1);
        this.mesh = new THREE.Mesh(geometry, material);
        this.hitboxMesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible: true }));
        this.mesh.position.x = this.hitboxMesh.position.x = centerPos.x;
        this.mesh.position.y = this.hitboxMesh.position.y = centerPos.y;
        this.mesh.position.z = this.hitboxMesh.position.z = centerPos.z;
        this.mesh.rotation.x = this.hitboxMesh.rotation.x = rx;
        this.mesh.rotation.y = this.hitboxMesh.rotation.y = ry;
        this.mesh.rotation.z = this.hitboxMesh.rotation.z = rz;
        scene.add(this.mesh);
        // scene.add(this.hitboxMesh);
    }
};

let map = [
    [ // misc
        new Platform(0, 0, 0, 50, 100, 2).mesh,
        /*new Platform(-30, -40, 0, 5, -36, 20, new THREE.MeshNormalMaterial(), 0, 0.25 * Math.PI, 0),
        new Platform(-5, -40, 0, 30, -36, 20, new THREE.MeshNormalMaterial(), 0, -0.25 * Math.PI, 0),
        new Platform(-20, -20, -5, 20, -50, 0, new THREE.MeshStandardMaterial({ color: 0xffea00, roughness: 1, metalness: 0 }))*/
    ],
    [ // path 1
        new Platform(38, 114.4, 0, 61, 131.8, 2).mesh, // first jump
        new Platform(26.2, 145.8, 0, 53.2, 180.2, 2).mesh, // second jump, right path
        new Platform(74.2, 128.6, 0, 92, 170.2, 2).mesh, // second jump, left path
        new Platform(74.2, 180.6, 0, 82, 190.2, 4).mesh, // second jump, left path (extra platform)
        new Platform(57.4, 190, -2, 70.5, 209.2, 0).mesh, // third jump (really small one)
        new Platform(11.7, 221.3, -2, 81.9, 251.1, 0).mesh, // L-shaped platform, long piece
        new Platform(11.7, 251.1, -2, 41.5, 280.7, 0).mesh, // L-shaped platform, short piece
        new Platform(49, 270, 0, 114.2, 312, 3).mesh, // fourth jump (first one after L)
        new Platform(79.6, 324.5, 0, 94.9, 339.8, 3).mesh, // fifth jump, right path
        new Platform(111.4, 322.7, 0, 135.43, 335.3, 4).mesh, // fifth jump, left path
        new Platform(89, 355.6, 0, 100.5, 379.5, 5).mesh, // sixth jump, right path
        new Platform(120, 340, -4, 140, 350, -2).mesh, // jump 5.5, left path
        new Platform(115.3, 357, 0, 151.4, 370, 4).mesh, // sixth jump, left path
        new Platform(91.7, 404.1, 0, 103.4, 421.3, 8).mesh, // walljump section, right path
        new Platform(147.1, 370, 0, 174.3, 443, 12, materialToTouch, -0.3, -0.3, 0).mesh, // walljump section, left path: platform 2
        new Platform(108.6, 432.3, 0, 125.5, 441.2, 12).mesh, // walljump section, back platform
        new Platform(118.3, 383.1, 0, 132.8, 421.9, 20).mesh // final platform (item)
    ]
];


// todo:
// make a cooldown for punching as well, not just *being* hit

// U+200C: Zero-Width Non-Joiner
// U+FEFF: Zero-Width Non-Breaking Space
// U+FFFD: Replacement Character

// camera.rotation.x = 1.7 * Math.PI;

//
// IMPORTANT!!!
// only enable movement and looking around (and other controls) when screen is focused (not necessarily locked)
//

window.rotationBuffer = {x: 0, y: 0};

let playerMeshes = [];
let myIndex = null;

let socket = io();
const raycaster = new THREE.Raycaster();
raycaster.far = 6;
const cameraRaycaster = new THREE.Raycaster();
cameraRaycaster.far = 5.2; // 5 range, 0.2 bonus because camera wallclip protection subtracts 0.2
let point;
let selectedPlayer = null;


function render() {
    if (firstUpdate === 1) {
        stop();
        console.log("hammertime");
    }
    if (myIndex !== null) {
        camera.position.copy(playerMeshes[myIndex].position);
    }
    else {
        let avg = new THREE.Vector3();
        let n = 0;
        playerMeshes.forEach(function(e, i) {
            if (e) {
                avg.add(e.position);
                n++;
            }
        });
        avg.divideScalar(n);
        avg.y = 20;
        camera.position.copy(avg);
    }
    if (myIndex !== null && keys.mouseDownRisingEdge) {
        if (selectedPlayer !== null) {
            const spmo = playerMeshes[selectedPlayer];
            socket.emit("boop", selectedPlayer);
            spmo.setOutline("hit");
            setTimeout(function() {
                spmo.outlineStyle = null;
            }, 250);
            playSound("hit");
        }
        else {
            playSound("miss");
        }
    }
    keys.mouseDownRisingEdge = false;
    keys.mouseDownFallingEdge = false;

    if (keys.camUp) rotationBuffer.y -= 15;
    if (keys.camDown) rotationBuffer.y += 15;
    if (keys.camLeft) rotationBuffer.x -= 20;
    if (keys.camRight) rotationBuffer.x += 20;
    controls.rotate(rotationBuffer.x, rotationBuffer.y);

    if (keys.zoom && camera.fov > 16) {
        camera.fov = Math.sqrt(camera.fov) * 4;
        camera.updateProjectionMatrix();
    }
    if (!keys.zoom && camera.fov < 90) {
        camera.fov = Math.min(90, camera.fov * 1.5);
        camera.updateProjectionMatrix();
    }
    keys.zoomRisingEdge = false;
    keys.zoomFallingEdge = false;

    rotationBuffer.x = 0;
    rotationBuffer.y = 0;
    if (myIndex !== null) {
        playerMeshes[myIndex].face.quaternion.copy(camera.quaternion);
        playerMeshes[myIndex].rotate();
    }

    if (keys.lookBack) camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
    if (myIndex !== null) {
        playerMeshes[myIndex].hide();
        if (keys.thirdPersonToggle) {
            cameraRaycaster.set(playerMeshes[myIndex].face.position, new THREE.Vector3(0, 0, 1).applyQuaternion(camera.quaternion));
            let cameraDistance = cameraRaycaster.intersectObjects([...map[0], ...map[1]])[0];
            cameraDistance = (cameraDistance === undefined) ? -5 : 0.2 -cameraDistance.distance;
            camera.position.addScaledVector(controls.getDirection(new THREE.Vector3(0, 0, 1)), cameraDistance);
            playerMeshes[myIndex].show(); // after the cast because otherwise the mesh would block the ray
        }
    }

    if (myIndex !== null) {
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
    }

    renderer.render(scene, camera); // try making it vr one day with new renderer (update: THREE.js has official VR)
    if (keys.lookBack) camera.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI);
    if (firstUpdate !== 1) {
        requestAnimationFrame(render);
    }
    else {
        console.log("stopped rendering");
        setTimeout(function() {
            firstUpdate = true;
        }, 500);
    }
}

let firstUpdate = true;
let angle = new THREE.Euler(0, 0, 0, "YXZ");

socket.on("index", function(index) {
    myIndex = index;
});
socket.emit("style", mySkin, myFace, myName, myHue);

f3Field.innerHTML = '<table class="undertable"><thead><tr><th colspan="2" class="name">Name</th><th class="score">Score</th></tr></thead><tbody id="player-list"></tbody></table>';
const playerTable = document.getElementById("player-list");

socket.on("update", function(playerData) {
    for (let i = 0; i < Math.max(playerData.length, playerMeshes.length); i++) {
        if (!playerData[i]) {
            if (playerMeshes[i]) { // used to be for disconnection, now it's for death and/or a restart on the same client
                console.log(`Removing playerMeshes[${i}].row.tr (${playerMeshes[i].row.name.innerText})`);
		        playerMeshes[i].selfDestruct();
                playerMeshes[i] = null;

                if (i === myIndex) {
                    myIndex = null; // cratulations, you died :3
                    console.log("ded 💀");
                }
                playSound("death");
            }
            continue;
        }

        if (!playerMeshes[i]) {
            playerMeshes[i] = new Player(playerData[i].face, playerData[i].skin, playerData[i].name, playerData[i].hue)

            playerTable.appendChild(playerMeshes[i].row.tr);
            console.log(`Added playerMeshes[${i}].row.tr (${playerData[i].name})`);

            if (i === myIndex) {
                playerMeshes[i].nametag.visible = false;
            }
        }

        if (i !== myIndex) {
            playerMeshes[i].face.setRotationFromEuler(new THREE.Euler(playerData[i].facing.x, playerData[i].facing.y, 0, "YXZ"));
            playerMeshes[i].rotate(); // Updates ball rotation to be the same as face rotation
        }

        const position = playerData[i].position;
        playerMeshes[i].setPosition(position.x, position.y, position.z);

        playerMeshes[i].row.score.innerText = playerData[i].kcoins + '🪙';
    }

    playerTable.parentElement.style.transform = `scale(${leftSidebar.clientWidth / playerTable.parentElement.clientWidth})`;

    if (firstUpdate === true) {
        render();
        console.log("began rendering");
        firstUpdate = false;
        document.getElementById("loading-cover").style.display = "none";
    }

    if (myIndex !== null) {
        angle.setFromQuaternion(playerMeshes[myIndex].face.quaternion);
        angle.z = 0;
        let movement = {
            x: keys.right - keys.left, // works because true and false automatically convert to 1 and 0 (typical JSBS)
            z: keys.back - keys.forward,
            direction: 0,
            magnitude: 1
        };

        switch (`${movement.x}/${movement.z}`) {
            case "-1/-1":
                movement.direction = -0.25 * Math.PI;
                break;
            case "-1/0":
                movement.direction = -0.5 * Math.PI;
                break;
            case "-1/1":
                movement.direction = -0.75 * Math.PI;
                break;
            case "0/-1":
                break;
            case "0/0":
                movement.magnitude = 0;
                break;
            case "0/1":
                movement.direction = Math.PI;
                break;
            case "1/-1":
                movement.direction = 0.25 * Math.PI;
                break;
            case "1/0":
                movement.direction = 0.5 * Math.PI;
                break;
            case "1/1":
                movement.direction = 0.75 * Math.PI;
                break;
        }

        socket.emit("update", angle.x, angle.y, movement.direction, movement.magnitude, keys.jump);
    }
});
const coinGeometry = new THREE.SphereGeometry(0.5, 30, 15);
const coinMesh = new THREE.Mesh(coinGeometry, skins.gold);
coinMesh.position.set(37.665, 6.5, 120.75);
scene.add(coinMesh);
socket.on("coin", function(newPos) {
    coinMesh.position.copy(newPos);
});

const qo = document.getElementById("question-overlay");
const popup = document.getElementById("popup-text");
function answer(index) {
    console.log("answered!");
    qo.innerHTML = "Checking answer...";
    socket.emit("answer", index);
}

socket.on("question", function(question, answers) {
    console.log(`New question: ${question}!`);
    qo.innerHTML = `<img src="quest_ions/${question}" /><br>`;
    answers.forEach(function(e, i) {
        qo.innerHTML += `<img class="qimg" src="quest_ions/${e}" onclick="answer(${i});" />`;
    });
    qo.style.display = "block";
    document.exitPointerLock(); // this is absolutely not an okay fix for the long term, you need to DISABLE movement inputs and reset it all to zero (like dead players)
});
socket.on("correct?", function(correct) {
    qo.style.display = "none";
    qo.innerHTML = "Question unloaded";
    switch (correct) {
        case true: popup.innerHTML = "Correct! +1🪙 and +1 kconk!"; playSound("coin"); break;
        case false: popup.innerHTML = "Incorrect answer."; break;
        case null: popup.innerHTML = "Error: The server was not expecting to grade a question."; break;
        default: popup.innerHTML = "A mysterious and deeply concerning error has occurred.";
    }
    popup.style.display = "block";
    setTimeout(function() {
        popup.style.display = "none";
    }, 3456);
});

socket.on("stop", function(winner) {
    document.getElementById("loading-cover").innerText = winner + " wins!";
    document.getElementById("loading-cover").style.backgroundColor = (winner === myName) ? "orange" : "darkslategray";
    document.getElementById("loading-cover").style.display = "block";
    firstUpdate = 1;
    myIndex = null;
});
function stop() {
    playerMeshes.forEach(function(mesh, i) {
        if (mesh) {
            console.log(`Removing playerMeshes[${i}].row.tr (${playerMeshes[i].row.name.innerText}) with the janky method (stop())`);
            mesh.selfDestruct();
        }
    });
    playerMeshes = [];
}

document.getElementById("loading-cover").innerHTML = "Connecting...";
document.getElementById("loading-cover").style.backgroundColor = "#369";

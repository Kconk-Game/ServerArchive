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

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(1600, 900);
renderer.setClearColor(0x33aaff, 1);
document.body.appendChild(renderer.domElement);
renderer.domElement.setAttribute("tabindex", -1);

const f3Field = document.getElementById("debug");
const leftSidebar = document.getElementById("left-sidebar");
const rightSidebar = document.getElementById("right-sidebar");
const crosshair = document.getElementById("crosshair");

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
    const rect = renderer.domElement.getBoundingClientRect();

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

const bgmSourceList = ["music/bonneton.mp3", "music/cloudworld.mp3", "music/dkjungle.mp3", "music/luncheon.mp3", "music/pyramid.mp3", "music/undertale83.mp3", "music/wooded.mp3", "music/:).mp3"];

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

window.keys = {
    camUp: false,
    camDown: false,
    camLeft: false,
    camRight: false,
    mouseDown: false,
    mouseDownRisingEdge: false,
    mouseDownFallingEdge: false
};
renderer.domElement.addEventListener("keydown", function(e) {
    switch (e.code) {
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
    }
});
renderer.domElement.addEventListener("keyup", function(e) {
    switch (e.code) {
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
crosshair.addEventListener("mousedown", mouseDown);
function mouseUp(ℰ) {
    if (ℰ.button === 0) {
        keys.mouseDownRisingEdge = false;
        keys.mouseDownFallingEdge = keys.mouseDown;
        keys.mouseDown = false;
    }
}
window.addEventListener("mouseup", mouseUp);

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

window.onload = function() {
    let textScript = document.createElement("script");
    textScript.src = "text-rendering.js";
    document.body.appendChild(textScript);
}

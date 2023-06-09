class Player {
    constructor(face, skin, x=0, y=-100000, z=0) {
        this.outline = new THREE.Mesh(outlineGeom, new THREE.MeshBasicMaterial({ color: 0, side: THREE.BackSide }));
        this.permanentOutline = false;
        this.setOutline("hide");

        this.ball = new THREE.Mesh(playerGeom, skins.default);
        this.setSkin(skin);

        this.face = new THREE.Mesh(faceGeom, new THREE.MeshBasicMaterial({ transparent: true, map: faces.default }));
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
    setSkin(skinName) {
        this.skin = skinName;
        this.ball.material = skins[skinName];

        this.permanentOutline = skinName === "toon";
        this.setOutline(this.outlineStyle);
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
if (location.href.includes("skin=")) {
    window.mySkin = location.href.indexOf("skin=");
    window.myFace = location.href.indexOf("face=");
    window.myName = location.href.indexOf("name=");
    if (mySkin < 0 || myFace < 0 || myName < 0) location.href = location.origin;

    mySkin = decodeURIComponent(location.href.substring(mySkin + 5, myFace - 1));
    myFace = decodeURIComponent(location.href.substring(myFace + 5, myName - 1));
    myName = decodeURIComponent(location.href.substring(myName + 5));
    if (!confirm(`skin: ${mySkin}, face: ${myFace}, name: ${myName}\n\nsettings ok?`)) location.href = location.origin;

    const mainScript = document.createElement("script");
    mainScript.src = "script.js";
    document.body.appendChild(mainScript);
}
else {
    const previews = [
        new Player("default", "default", -6, 1.5, -5),
        new Player("default", "sire", -3, 1.5, -5),
        new Player("default", "striped", 0, 1.5, -5),
        new Player("default", "glass", 3, 1.5, -5),
        new Player("default", "flat", 6, 1.5, -5),
        new Player("default", "pixelated", -6, -1.5, -5),
        new Player("default", "xenon", -3, -1.5, -5),
        new Player("default", "toon", 0, -1.5, -5),
        new Player("default", "unicorn", 3, -1.5, -5),
        new Player("default", "gold", 6, -1.5, -5)
    ];

    const raycaster = new THREE.Raycaster();
    let raycast;
    let menuData = {
        menu: "skin",
        skin: null,
        face: null,
        name: "",
        cursorPosition: 0
    };

    const nameInput = new THREE.Mesh(
        new THREE.BoxGeometry(6, 1, 0.5),
        new THREE.MeshBasicMaterial()
    );
    nameInput.position.set(0, 3.5, -5);
    scene.add(nameInput);

    const nameTexture = new Text("click to enter name");
    nameTexture.draw("rainbow", 1000);
    const nameInputDisplay = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 0.6),
        new THREE.MeshBasicMaterial({ transparent: true, map: new THREE.CanvasTexture(nameTexture.canvas) })
    );
    nameInputDisplay.position.set(0, 3.5, -4.74);
    scene.add(nameInputDisplay);

    const nameInputOutline = new THREE.Mesh(
        new THREE.BoxGeometry(6.2, 1.2, 0.499),
        new THREE.MeshBasicMaterial({ color: 0 })
    );
    nameInputOutline.position.set(0, 3.5, -5);
    scene.add(nameInputOutline);

    const submitButton = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1, 0.5),
        new THREE.MeshBasicMaterial({ map: tl.load("textures/submit text.png") })
    );
    submitButton.position.set(4.4, 3.5, -5);
    scene.add(submitButton);

    const submitButtonOutline = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.2, 0.499),
        new THREE.MeshBasicMaterial({ color: 0 })
    );
    submitButtonOutline.position.set(4.4, 3.5, -5);
    scene.add(submitButtonOutline);

    nameInputOutline.visible = false;
    nameInput.visible = false;
    nameInputDisplay.visible = false;
    submitButton.visible = false;
    submitButtonOutline.visible = false;

    function updateText() {
        nameTexture.setText(menuData.name);
        nameTexture.draw("rainbow", 1000, 100, menuData.cursorPosition);
        nameInputDisplay.material.map.needsUpdate = true;
    }

    let inputFocused = false;

    function focusName() {
        if (inputFocused) return;
        inputFocused = true;
        window.addEventListener("keydown", typingListener);
        controls.addEventListener("unlock", unfocusName);
        updateText();
    }
    function unfocusName() {
        if (!inputFocused) return;
        inputFocused = false;
        window.removeEventListener("keydown", typingListener);
        controls.removeEventListener("unlock", unfocusName);
        nameTexture.draw("rainbow", 1000);
        nameInputDisplay.material.map.needsUpdate = true;
    }

    function submit() {
        location.href += `?skin=${menuData.skin}&face=${menuData.face}&name=${encodeURIComponent(menuData.name)}`;
    }

    function typingListener(e) {
        if ("{sphinx(ofblackquartz),judgemyvow.~ SPHINX[OFBLACK'QUARTZ?]:JUDGEMYVOW!|_+=123456-7890;`@#$%^&*</\\\">}".includes(e.key)) {
            if (menuData.name.length < 32) {
                menuData.name = menuData.name.slice(0, menuData.cursorPosition) + e.key + menuData.name.slice(menuData.cursorPosition);
                menuData.cursorPosition++;
                updateText();
            }
        }
        else if (e.key === "ArrowUp") {
            menuData.cursorPosition = 0;
            updateText();
        } else if (e.key === "ArrowDown") {
            menuData.cursorPosition = menuData.name.length;
            updateText();
        } else if (e.key === "ArrowLeft") {
            if (menuData.cursorPosition) {
                menuData.cursorPosition--;
                updateText();
            }
        } else if (e.key === "ArrowRight") {
            if (menuData.cursorPosition < menuData.name.length) {
                menuData.cursorPosition++;
                updateText();
            }
        }
        else if (e.key === "Backspace") {
            if (menuData.cursorPosition) menuData.name = menuData.name.slice(0, menuData.cursorPosition - 1) + menuData.name.slice(menuData.cursorPosition--);
            updateText();
        }
        else if (e.key === "Enter") {
            submit();
        }
        else {
            console.log(`Key ${e.key} ignored`);
        }
    }

    function render() {
        if (!inputFocused) {
            if (keys.camUp) {
                rotationBuffer.y -= 10;
            }
            if (keys.camDown) {
                rotationBuffer.y += 10;
            }
            if (keys.camLeft) {
                rotationBuffer.x -= 10;
            }
            if (keys.camRight) {
                rotationBuffer.x += 10;
            }
        }
        controls.rotate(rotationBuffer.x, rotationBuffer.y);

        rotationBuffer.x = 0;
        rotationBuffer.y = 0;
        if (menuData.menu === "skin" || menuData.menu === "name") {
            previews.forEach(function(item) {
                item.face.rotation.y += 0.03;
                item.rotate();
            });
        }
        raycaster.set(camera.position, new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion));
        if (menuData.menu === "skin" || menuData.menu === "face") {
            raycast = raycaster.intersectObjects(previews.map(item => item.ball))[0];
            previews.forEach(function(item) {
                if (raycast && raycast.object === item.ball) {
                    item.setOutline(keys.mouseDown ? "select" : "highlight")
                    if (keys.mouseDownFallingEdge) {
                        if (menuData.menu === "skin") {
                            menuData.menu = "face";
                            menuData.skin = item.skin;
                            previews.forEach(function(item_, i) {
                                item_.setSkin(menuData.skin);
                                item_.setFace(facesEnum[i]);
                                item_.ball.rotation.y = item_.face.rotation.y = Math.PI;
                            });
                        }
                        else if (menuData.menu === "face") {
                            menuData.menu = "name";
                            menuData.face = item.faceName;
                            previews.forEach(function(item_) {
                                if (item_ === item) {
                                    item_.setPosition(0, 0, -5);
                                }
                                else {
                                    item_.hide();
                                }
                                item_.setOutline("hide");
                            });
                            nameInputOutline.visible = true;
                            nameInput.visible = true;
                            nameInputDisplay.visible = true;
                            submitButton.visible = true;
                            submitButtonOutline.visible = true;
                        }
                        else {
                            console.error("Invalid menu type on ball click");
                        }
                    }
                }
                else {
                    item.setOutline("hide");
                }
            });
        }
        else if (menuData.menu === "name") {
            raycast = raycaster.intersectObjects([nameInputOutline, submitButtonOutline])[0];
            if (keys.mouseDownFallingEdge) {
                if (raycast) {
                    if (raycast.object === nameInputOutline) focusName();
                    else if (raycast.object === submitButtonOutline) submit();
                    else console.error("Invalid raycast object (falling edge)");
                }
                else {
                    unfocusName();
                }
            }
            else {
                submitButtonOutline.material.color.setHex((raycast && raycast.object === submitButtonOutline) ? (keys.mouseDown ? 128 : 0) : 0x3f3f3f);
                nameInputOutline.material.color.setHex((raycast && raycast.object === nameInputOutline) ? (keys.mouseDown ? 128 : 0) : 0x3f3f3f);
            }
        }
        else {
            console.error("Invalid menu type");
        }
        keys.mouseDownRisingEdge = false;
        keys.mouseDownFallingEdge = false;

        renderer.render(scene, camera); // try making it vr one day with new renderer
        requestAnimationFrame(render);
    }
    render();
    document.getElementById("loading-cover").style.display = "none";
}

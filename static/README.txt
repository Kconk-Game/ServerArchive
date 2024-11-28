If you're wondering what the heck is going on with the file structure in this, here's how the js files load:

1. index.html loads socket.io.js
This allows communication with the server via socket.io (not my code)

2. index.html loads three.min.js
This is 3D rendering stuff (also not my code)

3. index.html loads PointerLockControls.js
This is a camera control script for threejs (not my code, but I could probably write it myself without much difficulty, plus like 20% is my patch of it anyway)

4. index.html loads controls.js
This sets up controls and creates window.keys, which is used in player-class.js and script.js.

5. index.html loads setup.js
This assists CSS, loads music, creates a threejs scene, and loads skins.

6. setup.js loads text-rendering.js
This is some fairly ugly code that renders nametags (i WISH i could say it's not my code)

7. text-rendering.js loads player-class.js
This defines the Ball and Player classes, to ✨make balls with ease✨

8. player-class.js loads player-selection.js
This is the player selection menu code. After selecting your style, it reloads with a GET parameter.
The above process happens again, and if valid GET parameters are found (with JS, they aren't actually processed server-side)...

9. player-selection.js loads sfx.js
This creates audio elements and defines the playSound function used in script.js

10. sfx.js loads map.js
This adds platforms to the threejs scene and also stores them in an array called map.

11. map.js loads script.js
This is the last point of this convoluted process, where the main loop happens. It's hard to describe script.js as anything but "everything else".

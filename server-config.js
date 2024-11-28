/************************************************************************************************************************\
|                                                                                                                        |
| This is the server configuration file, change the values below in global.settings to alter handling and other settings |
|                                                                                                                        |
\************************************************************************************************************************/

global.settings = {

    speed: 5,           // Default top speed of player movement
    accel: 0.2,         // Per-tick acceleration of the player

    punchPower: 5,      // How much force a punch applies
    punchRange: 6,      // Reach

    jumpHeight: 10,     // What y-velocity a player jumps at
    walljumpHeight: 8,  // What y-velocity a player WALLjumps at
    walljumpSpeed: 5,   // The horizontal velocity walljumps apply (the former(?) default value I set below, 5, is obscenely high and i need to do something about how walljumps handle in general)

    tps: 50             // ticks per second (like an FPS limit but for the server)
}

// Settings as of June 15, 2023:

// const speed = 5;
// const accel = 0.2;
// const punchPower = 5;
// const punchRange = 6;
// const jumpHeight = 10;
// const walljumpHeight = 8;
// const walljumpSpeed = 5;

// const tps = 50;

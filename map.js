class Platform {
    constructor(x1, z1, y1, x2, z2, y2, material, rx=0, ry=0, rz=0) {
        const width = 0.3 * Math.abs(x2 - x1);
        const height = 0.3 * Math.abs(y2 - y1);
        const length = 0.3 * Math.abs(z2 - z1);


        const centerPos = {
            x: 0.15 * (x1 + x2),
            y: 0.15 * (y1 + y2),
            z: 0.15 * (z1 + z2)
        };


        this.physics = new global.FOUR.Body({ // global.FOUR = CANNON
            mass: 0,
            shape: new global.FOUR.Box(new global.FOUR.Vec3(
                width * 0.5,    //
                height * 0.5,   // additionally multiplied by 0.5 because CANNON.Box uses half-dimensions
                length * 0.5    //
            )),
            material: material
        });

        this.physics.position.x = centerPos.x;
        this.physics.position.y = centerPos.y;
        this.physics.position.z = centerPos.z;
        this.physics.quaternion.setFromEuler(rx, ry, rz);

        global.world.addBody(this.physics);
    }
}
module.exports = function(physicsMaterial) {
    // potentially link map between client and server?
    return [
        [ // center
            new Platform(0, 0, 0, 50, 100, 2, physicsMaterial).physics // spawn platform
        ],
        [ // path 1
            new Platform(38, 114.4, 0, 61, 131.8, 2, physicsMaterial).physics, // first jump
            new Platform(26.2, 145.8, 0, 53.2, 180.2, 2, physicsMaterial).physics, // second jump, right path
            new Platform(74.2, 128.6, 0, 92, 170.2, 2, physicsMaterial).physics, // second jump, left path
            new Platform(74.2, 180.6, 0, 82, 190.2, 4, physicsMaterial).physics, // second jump, left path (extra platform)
            new Platform(57.4, 190, -2, 70.5, 209.2, 0, physicsMaterial).physics, // third jump (really small one)
            new Platform(11.7, 221.3, -2, 81.9, 251.1, 0, physicsMaterial).physics, // L-shaped platform, long piece
            new Platform(11.7, 251.1, -2, 41.5, 280.7, 0, physicsMaterial).physics, // L-shaped platform, short piece
            new Platform(49, 270, 0, 114.2, 312, 3, physicsMaterial).physics, // fourth jump (first one after L)
            new Platform(79.6, 324.5, 0, 94.9, 339.8, 3, physicsMaterial).physics, // fifth jump, right path
            new Platform(111.4, 322.7, 0, 135.43, 335.3, 4, physicsMaterial).physics, // fifth jump, left path
            new Platform(89, 355.6, 0, 100.5, 379.5, 5, physicsMaterial).physics, // sixth jump, right path
            new Platform(120, 340, -4, 140, 350, -2, physicsMaterial).physics, // jump 5.5, left path
            new Platform(115.3, 357, 0, 151.4, 370, 4, physicsMaterial).physics, // sixth jump, left path
            new Platform(91.7, 404.1, 0, 103.4, 421.3, 8, physicsMaterial).physics, // walljump section, right path
            new Platform(147.1, 370, 0, 174.3, 443, 12, physicsMaterial, -0.3, -0.3, 0).physics, // walljump section, left path: platform 2
            new Platform(108.6, 432.3, 0, 125.5, 441.2, 12, physicsMaterial).physics, // walljump section, back platform
            new Platform(118.3, 383.1, 0, 132.8, 421.9, 20, physicsMaterial).physics // path 1: final platform (item)
        ]
    ];
};

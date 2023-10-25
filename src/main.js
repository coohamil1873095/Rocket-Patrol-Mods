//-----------------------------------------------------------------------------
// 
// Connor Hamilton 
// (mod title)
// (approx time)
// Tracking High Score - 1
// FIRE UI from Original - 1
// Move while firing - 1
// Time Remaining - 3
// Adds time for hits - 5
//
//-----------------------------------------------------------------------------

let config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    scene: [ Menu, Play ]
}
let game = new Phaser.Game(config);

// set UI sizes
let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;

// reserve keyboard vars
let keyF, keyR, keyLEFT, keyRIGHT;

let highScore = 0;

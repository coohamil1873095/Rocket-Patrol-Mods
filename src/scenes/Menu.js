class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    create() {
        this.scene.start("playScene");
        this.add.text(20, 20, "Rocket Patrol Menu");
    }
}
class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // load images/tile sprites
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');

        // load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});

        // load image for particle emitter
        this.load.image('yellow', './assets/yellow.png');
      }

    create() {
        // place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);
        // green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        // white border
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0, 0);
        
        // add rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);
        // define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        
        // add spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0);
        
        // animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', {start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        // initialize score
        this.p1Score = 0;
        // display score
        this.scoreConfig = {
            fontFamily: 'Courier',
            fontSize: '28px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'right',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        this.scoreLeft = this.add.text(borderUISize + borderPadding, borderUISize + borderPadding*2, this.p1Score, this.scoreConfig);
        
        // display high score
        this.highScoreText = this.add.text(borderUISize + borderPadding*43, borderUISize + borderPadding*2, highScore, this.scoreConfig);

        // make hidden fire text
        this.fireText = this.add.text(borderUISize + borderPadding*15, borderUISize + borderPadding*2, 'FIRE', this.scoreConfig);

        // make timer
        this.timeLeft = game.settings.gameTimer / 1000;
        this.timerText = this.add.text(borderUISize + borderPadding*30, borderUISize + borderPadding*2, game.settings.gameTimer / 1000, this.scoreConfig);
        this.timer = 0;
        this.addTime = false;
        
        // GAME OVER flag
        this.gameOver = false;

        this.speedClock = this.time.delayedCall(30000, () => {
            this.ship01.moveSpeed += 2;
            this.ship02.moveSpeed += 2;
            this.ship03.moveSpeed += 2;
        });
        
        
    }

    update(time, delta) {
        // check the time left
        if (!this.gameOver && this.timeLeft <= 0) {
            this.scoreConfig.fixedWidth = 0;
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', this.scoreConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or <- for Menu', this.scoreConfig).setOrigin(0.5);
            this.timerText.text = 0;
            this.gameOver = true;
            if (this.p1Score > highScore) {
                highScore = this.p1Score;
            }
        }
        

        // Set visibility to false
        this.fireText.visible = false;

        // Update timer every second
        this.timer += delta;
        while (!this.gameOver && this.timer > 1000) {
            this.timeLeft -= 1;
            this.timer -= 1000;
            this.timerText.text = this.timeLeft;
        }
        
                
        // check key input for restart
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }
        if (this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start('menuScene');
        }
        
        this.starfield.tilePositionX -= 4;
        
        if (!this.gameOver) {
            this.p1Rocket.update();
            this.ship01.update();               // update spaceships (x3)
            this.ship02.update();
            this.ship03.update();
        }
        

        // check collisions
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }
        // Show fire text
        if (this.p1Rocket.isFiring) {
            this.fireText.visible = true;
        }
    }

    checkCollision(rocket, ship) {
        // simple Axis-Aligned Bounding Boxes (AABB) checking
        if (rocket.x < ship.x + ship.width && rocket.x + rocket.width > ship.x && rocket.y < ship.y + ship.height && rocket.height + rocket.y > ship. y) {
            return true;
        } 
        else {
            return false;
        }
    }

    // particle emitter function
    emitParticles(ship) {
        let particles = this.add.particles(ship.x+10, ship.y+10, 'yellow', {
            speed: 100,
            lifespan: 300,
            scale: { start: 0.70, end: 0, ease: 'sine.out' },
            gravityY: 100
        });
        particles.explode(20);
    }

    shipExplode(ship) {
        // temporarily hide ship
        ship.alpha = 0;
        // create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');
        boom.on('animationcomplete', () => {
            ship.reset();
            ship.alpha = 1;
            boom.destroy();
        });

        this.emitParticles(ship);

        // score add and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;

        // add time left depending on ship point value
        this.addTime = true;
        this.timeLeft += (ship.points / 10) + 1;

        // generate random number and play designated sfx
        let rand = Phaser.Math.Between(1, 5);
        if (rand == 1) {
            this.sound.play('sfx_explosion_1');
        }
        else if (rand == 2) {
            this.sound.play('sfx_explosion_2');
        }
        else if (rand == 3) {
            this.sound.play('sfx_explosion_3');
        }
        else if (rand == 4) {
            this.sound.play('sfx_explosion_4');
        }
        else if (rand == 5) {
            this.sound.play('sfx_explosion_5');
        }
        
    }
}

namespace SpriteKind {
    //% isKind
    export const Ball = SpriteKind.create()
    //% isKind
    export const Booth = SpriteKind.create()
    //% isKind
    export const Mouse = SpriteKind.create()
}

enum winTypes {
    //% block="win game"
    Win,
    //% block="lose game"
    Lose,
    //% block="high score"
    Score,
    //% block="multiplayer"
    Multi,
     //% block="seconds passed"
    Seconds
}

enum speeds {
    //% block="fast"
    Fast,
    //% block="medium"
    Med,
    //% block="slow"
    Slow
}

enum areas {
    //% block="top"
    Top,
    //% block="middle"
    Mid,
    //% block="bottom"
    Bottom
}

enum tracers {
    //% block="full"
    Full,
    //% block="crosshair"
    Cross,
    //% block="arrow"
    Arrow,
    //% block="off"
    Off
}

let textSprite: TextSprite = null
//let fanfare: effects.BackgroundEffect = undefined;
//let winStyle = winTypes.Score



namespace scene {
    /**
    * Adds text to the top, middle, or bottom
    * of screen as defined by circuis games
    */
    //% color="#4b6584"
    //% blockId=add_label_to
    //% block="add label $myLabel to $myPosition of window || $myColor"
    //% myLabel.defl="Whack-the-Mole"
    //% myColor.shadow="colorindexpicker"
    //% myColor.defl=4
    //% myPosition.defl=areas.Bottom
    //% inlineInputMode=inline
    export function add_label_to(myLabel: string, myPosition: areas, myColor?: number) {
        if (!myColor)
            myColor = 4;

        textSprite = textsprite.create(myLabel, 0, myColor)
        if (myPosition == areas.Bottom) textSprite.setPosition(80, 110);
        if (myPosition == areas.Mid) textSprite.setPosition(80, 50);
        if (myPosition == areas.Top) textSprite.setPosition(80, 20);
    }
}


namespace info {
    let countdownInitialized = false;
    /**
     * Adds game end style to countdown
     */
    //% color="#cf6a87"
    //% group=countdown
    //% blockId=start_countdown_game
    //% block="start countdown $myTime (s) and game over $winType || effect $winEffect"
    //% myTime.defl=15
    //% winType.defl=winTypes.Score
    //% winEffect.defl=effects.confetti
    //% inlineInputMode=inline
    export function startCountdownGame(myTime: number, winType: winTypes, winEffect?: effects.BackgroundEffect) {
        if (!winType)
            winType = winTypes.Win;
        if (!winEffect && winType != winTypes.Lose) {
            winEffect = effects.confetti;
        }
        else { winEffect = effects.melt; }
        init(winType, winEffect);
        info.startCountdown(myTime)

    }

    export function newGameOver(winStyle: winTypes, fanfare: effects.BackgroundEffect) {

        // Prep default variables for different win types
        let winnerNumber = 1;
        let thisHigh = 0;
        let newBest = false;
        let highScore = info.highScore();


        // Save number of seconds passed during game
        const timeElapsed = game.runtime();

        // Save all scores as relevant to the game.
        //info.saveAllScores();

        // collect the scores before popping the scenes
        const scoreInfo1 = info.player1.getState();
        const scoreInfo2 = info.player2.getState();
        const scoreInfo3 = info.player3.getState();
        const scoreInfo4 = info.player4.getState();
        const allScores = [scoreInfo1.score, scoreInfo2.score, scoreInfo3.score, scoreInfo4.score];


        // Find player with highest score in Multi
        for (let i = 0; i < 4; i++) {
            if (allScores[i] > thisHigh) {
                thisHigh = allScores[i];
                winnerNumber = i + 1;
            }
        }

        //Check if working with seconds or points
        if (winStyle !== winTypes.Seconds) {
            // If highest score is higher than saved high, replace
            if (thisHigh > highScore) {
                newBest = true;
                info.saveHighScore();
            } 
        } else {  // Best time for Seconds mode

            // For this mode, overwrite score with time elapsed
            thisHigh = Math.floor(game.runtime() / 1000);
            info.setScore(thisHigh);

            /*
            // For time, highSore needs to be initialized high
            if (highScore <= 0) { highScore = 1000000;} 
            */

            // Best time is least # of seconds in this mode
            if (thisHigh < highScore || highScore <= 0) {
                newBest = true;
                info.saveHighScore();
            }
        
        }


        // releasing memory and clear fibers. Do not add anything that releases the fiber until background is set below,
        // or screen will be cleared on the new frame and will not appear as background in the game over screen.
        game.popScene();
        game.pushScene();
        scene.setBackgroundImage(screen.clone());

        music.powerUp.play();

        fanfare.startScreenEffect();

        pause(400);

        const overDialog = new GameOverDialog(true, thisHigh, highScore, newBest, winnerNumber, winStyle, timeElapsed);
        scene.createRenderable(scene.HUD_Z, target => {
            overDialog.update();
            target.drawTransparentImage(
                overDialog.image,
                0,
                (screen.height - overDialog.image.height) >> 1
            );
        });
        pause(500); // wait for users to stop pressing keys
        overDialog.displayCursor();
        game.waitAnyButton();
        control.reset();

    }

    function init(winStyle: winTypes, fanfare: effects.BackgroundEffect) {
        if (countdownInitialized) return;
        countdownInitialized = true;

        info.onCountdownEnd(function () {
            
            //Handling manually to include number of seconds passed
            /*
            if (winStyle == winTypes.Win) {
                game.over(true, fanfare)
            } else */ if (winStyle == winTypes.Lose) {
                game.over(false, fanfare)
            } else { 
                newGameOver(winStyle, fanfare);
            }
        })
    }

    export class GameOverDialog extends game.BaseDialog {
        protected cursorOn: boolean;
        protected isNewHighScore: boolean;

        constructor(
            protected win: boolean,
            protected score?: number,
            protected highScore?: number,
            protected newHighScore?: boolean,
            protected winnerNum?: number,
            protected winStyle?: winTypes,
            protected numSeconds?: number
        ) {
            super(screen.width, 46, img`
        1 1 1
        f f f
        1 1 1
        `);
            this.cursorOn = false;
            
            /* Since best time is lower, need to do this elsewhere
            this.isNewHighScore = this.score > this.highScore;
            */
        }

        displayCursor() {
            this.cursorOn = true;
        }

        update() {
            this.clearInterior();
            this.drawTextCore();

            if (this.cursorOn) {
                this.drawCursorRow();
            }
        }

        drawTextCore() {
            const titleHeight = 8;
            
            if (this.winStyle == winTypes.Win) {
                this.image.printCenter(
                    "You Win!",
                    titleHeight,
                    screen.isMono ? 1 : 5,
                    image.font8
                );
            } else if (this.winStyle == winTypes.Multi) {
                this.image.printCenter(
                    "Player " + this.winnerNum + " wins!",
                    titleHeight,
                    screen.isMono ? 1 : 5,
                    image.font8
                );
            } else if (this.winStyle == winTypes.Seconds) {
                if (this.numSeconds !== undefined) {
                    this.image.printCenter(
                        "Finished in " + this.score + " seconds!",
                        titleHeight,
                        screen.isMono ? 1 : 5,
                        image.font8
                    );
                }
            } else {
                this.image.printCenter(
                    "Great Job!",
                    titleHeight,
                    screen.isMono ? 1 : 5,
                    image.font8
                );
            }

            if (this.score !== undefined) {
                const scoreHeight = 23;
                const highScoreHeight = 34;
                const scoreColor = screen.isMono ? 1 : 2;

                this.image.printCenter(
                    "Score:" + this.score,
                    scoreHeight,
                    scoreColor,
                    image.font8
                );

                if (this.newHighScore == true) {
                    this.image.printCenter(
                        "New Best Score!",
                        highScoreHeight,
                        scoreColor,
                        image.font5
                    );
                } else {
                    this.image.printCenter(
                        "Best:" + this.highScore,
                        highScoreHeight,
                        scoreColor,
                        image.font8
                    );
                }
            } 
        }
    }
}

namespace game {
    /**
     * Adds additional end game styles
     */
    //% color="#8854d0"
    //% group=Gameplay
    //% blockId=on_game_over_expanded
    //% block="game over $winStyle || add effect $winEffect"
    //% winType.defl=winTypes.Win
    //% winEffect.defl=effects.confetti
    //% inlineInputMode=inline
    export function onGameOverExpanded(winStyle: winTypes, winEffect?: effects.BackgroundEffect) {
        if (!winStyle)
            winStyle = winTypes.Score;
        if (!winEffect && winStyle != winTypes.Lose) {
            winEffect = effects.confetti;
        }
        else { winEffect = effects.melt; }

        if (winStyle ==  winTypes.Lose) {
            game.over(false, winEffect)
        } else {
            info.newGameOver(winStyle, winEffect);
        }
    }
}

/**
* A throwable with path prediction
*/
//% weight=100 color=#6699CC icon="\uf140"
//% groups='["Create", "Actions", "Properties"]'
namespace ball {
    /**
     * Creates a new throwable from an image and kind
     * @param img the image for the sprite
     * @param kind the kind to make the throwable
     * @param x optional initial x position, eg: 10
     * @param y optional initial y position, eg: 110
     */
    //% blockId=throwCreate block="ball %img=screen_image_picker of kind %kind=spritekind || at x %x y %y"
    //% expandableArgumentMode=toggle
    //% inlineInputMode=inline
    //% blockSetVariable=myBall
    //% weight=100
    //% group="Create"
    export function create(img: Image,
        kind: number,
        x: number = 10,
        y: number = 110): Ball {
        return new Ball(img, kind, x, y);
    }



    /**
   * Create a new ball with a given speed that starts from the location of another sprite.
   * The sprite auto-destroys when it leaves the screen. You can modify position after it's created.
   */
    //% group="Projectiles"
    //% blockId=spritescreateprojectileballfromsprite block="ball %img=screen_image_picker from %parentBall=variables_get(myBall)"
    //% weight=99
    //% blockSetVariable=projectile
    //% inlineInputMode=inline
    export function createProjectileBallFromSprite(img: Image, parentBall: Ball): Sprite {
        let vx = ball.xComponent(parentBall.angle, parentBall.pow);
        let vy = ball.yComponent(parentBall.angle, parentBall.pow);
        let ay = parentBall.gravity;
        let ax = parentBall.wind;
        let p = parentBall.pow;
        return createProjectileBall(img, vx, vy, ax, ay, p, SpriteKind.Projectile, parentBall);
    }

    /**
     * Create a new sprite with given speed, and place it at the edge of the screen so it moves towards the middle.
     * The sprite auto-destroys when it leaves the screen. You can modify position after it's created.
     */
    //% group="Projectiles"
    //% blockId=spritescreateprojectile block="projectile %img=screen_image_picker vx %vx vy %vy of kind %kind=spritekind||from sprite %parentBall=variables_get(myBall)"
    //% weight=99 help=sprites/create-projectile
    //% blockSetVariable=projectile
    //% inlineInputMode=inline
    //% expandableArgumentMode=toggle
    //% deprecated=true blockHidden=true
    export function createProjectileBall(img: Image, vx: number, vy: number, ax: number, ay: number, power:number, kind?: number, parentBall?: Ball) {
        const s = ball.create(img, kind || SpriteKind.Projectile);
        const sc = game.currentScene();

        if (parentBall) {
            s.setPosition(parentBall.x, parentBall.y);
            s.vx = ball.xComponent(parentBall.angle, parentBall.pow);
            s.vy = ball.yComponent(parentBall.angle, parentBall.pow);
            s.ay = parentBall.gravity;
            s.ax = parentBall.wind;
            s.pow = parentBall.pow;
        } else {
            // put it at the edge of the screen so that it moves towards the middle
            // If the scene has a tile map, place the sprite fully on the screen
            const xOff = sc.tileMap ? -(s.width >> 1) : (s.width >> 1) - 1;
            const yOff = sc.tileMap ? -(s.height >> 1) : (s.height >> 1) - 1;
            const cam = game.currentScene().camera;

            let initialX = cam.offsetX;
            let initialY = cam.offsetY;

            if (vx < 0) {
                initialX += screen.width + xOff;
            } else if (vx > 0) {
                initialX += -xOff;
            }

            if (vy < 0) {
                initialY += screen.height + yOff;
            } else if (vy > 0) {
                initialY += -yOff;
            }

            s.setPosition(initialX, initialY);
        }

        s.flags |= sprites.Flag.AutoDestroy | sprites.Flag.DestroyOnWall;

        return s;
    }











    /**
     * Convert degrees to radians
     * @param degree to convert
     * @return converted value in radians
     */
    export function degreeToRadian(degree: number): number {
        return degree * Math.PI / 180;
    }

    /**
     * Evaluate the x component of a given vector
     * @param degree angle of vector
     * @param magnitude magnitude of vector
     * @return x component of vector
     */
    export function xComponent(degree: number, magnitude: number): number {
        return magnitude * Math.cos(degreeToRadian(degree));
    }

    /**
     * Evaluate the y component of a given vector
     * @param degree angle of vector
     * @param magnitude magnitude of vector
     * @return y component of vector
     */
    export function yComponent(degree: number, magnitude: number): number {
        return -magnitude * Math.sin(degreeToRadian(degree));
    }
}

/**
 * A throwable
 **/
//% blockNamespace=ball color="#6699CC" blockGap=8
class Ball extends sprites.ExtendableSprite {
    private renderable: scene.Renderable;

    private controlKeys: boolean;
    private trace: boolean;

    //% group="Properties" blockSetVariable="myBall"
    //% blockCombine block="angle"
    //% weight=8
    public angle: number;
    //% group="Properties" blockSetVariable="myBall"
    //% blockCombine block="power"
    //% weight=8
    public pow: number;
    //% group="Properties" blockSetVariable="myBall"
    //% blockCombine block="tracing time (seconds)"
    //% weight=8
    public iter: number;
    //% group="Properties" blockSetVariable="myBall"
    //% blockCombine block="trace color"
    //% weight=8
    public traceColor: number;
    //% group="Properties" blockSetVariable="myBall"
    //% blockCombine block="gravity"
    //% weight=8
    public gravity: number;
    //% group="Properties" blockSetVariable="myBall"
    //% blockCombine block="wind"
    //% weight=8
    public wind: number;
    //% group="Properties" blockSetVariable="myBall"
    //% blockCombine block="angle adjust rate"
    //% weight=8
    public angleRate: number;
    //% group="Properties" blockSetVariable="myBall"
    //% blockCombine block="wind"
    //% weight=8
    public powerRate: number;

    public constructor(img: Image,
        kind: number,
        x: number,
        y: number) {
        super(img);
        this.setKind(kind);
        this.x = x;
        this.y = y;

        this.gravity = 20;
        this.pow = 50;
        this.angle = 10;
        this.angleRate = 1;
        this.powerRate = 1;
        this.iter = 3;
        this.wind = 0;

        this.renderable = scene.createRenderable(-0.5, (target, camera) => {
            let xComp = ball.xComponent(this.angle, this.pow);
            let yComp = ball.yComponent(this.angle, this.pow);
            let xOffset = camera.offsetX;
            let yOffset = camera.offsetY;

            for (let i: number = 0.1; i < this.iter; i += i / 5) {
                let x = this.x + i * xComp + (i ** 2) * this.wind / 2;
                let y = this.y + i * yComp + (i ** 2) * this.gravity / 2;
                target.setPixel(
                    x - xOffset,
                    y - yOffset,
                    this.traceColor
                );
            }
        }, () => !this.ay && this.trace);

        this.controlKeys = false;
        this.trace = false;
        this.traceColor = 1;
    }

    /**
     * Gets the throwables's sprite
     */
    //% group="Properties"
    //% blockId=throwSprite block="%ball(myBall) sprite"
    //% weight=8
    get sprite(): Sprite {
        return this;
    }

    /**
     * Set whether to show the trace for the estimated path
     * @param on whether to turn on or off this feature, eg: true
     */
    //% blockId=setTrace block="trace %ball(myBall) path estimate || %on=toggleOnOff"
    //% weight=50
    //% group="Actions"
    public setTrace(on: boolean = true): void {
        this.trace = on;
    }

    /**
     * Throw the throwable with the current settings
     */
    //% blockId=throwIt block="ball %ball(myBall)"
    //% weight=50
    //% group="Actions"
    public throwIt(): void {
        this.vx = ball.xComponent(this.angle, this.pow);
        this.vy = ball.yComponent(this.angle, this.pow);
        this.ay = this.gravity;
        this.ax = this.wind;
    }

    /**
     * Stop the throwable at the current location
     */
    //% blockId=stopIt block="stop %ball(myBall)"
    //% weight=50
    //% group="Actions"
    public stopIt(): void {
        this.ay = 0;
        this.ax = 0;
        this.vx = 0;
        this.vy = 0;
    }

    /**
     * Set whether to control the throwable with the arrow keys; left and right
     * to adjust the angle, and up and down to increase / decrease power
     * @param on whether to turn on or off this feature, eg: true
     */
    //% blockId=controlKeys block="control %ball(myBall) with arrow keys || %on=toggleOnOff"
    //% weight=50
    //% group="Actions"
    public controlWithArrowKeys(on: boolean = true): void {
        this.controlKeys = on;

        game.onUpdate(() => {
            if (this.controlKeys) {
                this.angle -= controller.dx() * this.angleRate / 5;
                this.pow -= controller.dy() * this.powerRate / 5;
            }
        })
    }

    destroy(effect?: effects.ParticleEffect, duration?: number) {
        super.destroy(effect, duration);
        this.renderable.destroy();
    }

    /**
     * NO LONGER NECESSARY as this uses renderables now to draw onto the background.
     */
    //% blockId=updateBackground block="change %ball(myBall) background to image %img=background_image_picker"
    //% weight=15
    //% group="Properties"
    //% deprecated=true
    public updateBackground(img: Image): void {
        scene.setBackgroundImage(img);
    }
}
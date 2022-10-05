controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    info.player2.setScore(5);
    info.player3.setScore(20);
    info.player4.setScore(5);
    info.player1.setScore(30);

    game.onGameOverExpanded(winTypes.Win)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    let throwBall = ball.createProjectileBallFromSprite(assets.image`ball0`, myBall)
    throwBall.setTrace()
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Booth, function (sprite, otherSprite) {
    info.changeScoreBy(-1)
    sprite.destroy()
})
function reset_ball () {
    myBall.stopIt()
    myBall.setPosition(80, 90)
    myBall.pow = randint(50, 300)
}
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    otherSprite.destroy()
    sprite.destroy()
    info.changeScoreBy(1)
    music.baDing.play()
})
let theTarget: Sprite = null
let myBall: Ball = null
scene.setBackgroundImage(assets.image`wildWest1`)
myBall = ball.create(assets.image`ball`, SpriteKind.Player)
myBall.setPosition(80, 90)
myBall.controlWithArrowKeys(true)
let myBooth = sprites.create(assets.image`boundaries`, SpriteKind.Booth)
myBooth.z = 100
info.player2.setScore(5);
info.startCountdownGame(20, winTypes.Score)
myBall.setTrace(false)
forever(function () {
    theTarget = sprites.createProjectileFromSide(assets.image`target2`, 50, 0)
    theTarget.bottom = 56
    theTarget.setKind(SpriteKind.Enemy)
    pause(randint(500, 2000))
})

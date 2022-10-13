controller.up.onEvent(ControllerButtonEvent.Pressed, function () {
    info.startTimer()
})
// game.onGameOverExpanded(winTypes.Multi)
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    info.player2.setScore(0)
    info.player1.setScore(10)
    // game.onGameOverExpanded(winTypes.Timed)
    game.customGameOverExpanded("Spooky!", effects.confetti, music.magicWand, scoreTypes.HTime, 0)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    throwBall = ball.createProjectileBallFromSprite(assets.image`ball-blue`, myBall)
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Booth, function (sprite, otherSprite) {
    info.changeScoreBy(-1)
    sprite.destroy()
})
sprites.onOverlap(SpriteKind.Projectile, SpriteKind.Enemy, function (sprite, otherSprite) {
    otherSprite.destroy()
    sprite.destroy()
    info.changeScoreBy(1)
    music.baDing.play()
})
let theTarget: Sprite = null
let throwBall: Ball = null
let myBall: Ball = null
scene.setBackgroundImage(assets.image`wildWest`)
myBall = ball.create(assets.image`ball-yellow`, SpriteKind.Player)
myBall.setPosition(80, 90)
myBall.controlWithArrowKeys(true)
let statusbar = statusbars.create(120, 6, StatusBarKind.Health)
statusbar.setColor(5, 10)
statusbar.setBarBorder(1, 1)
statusbar.setPosition(80, 113)
let myBooth = sprites.create(assets.image`booth`, SpriteKind.Booth)
myBall.setIter(10)
myBall.variablePower(statusbar, 50, 100)
myBall.setTraceMulti(tracers.Cross)
info.startTimer()
forever(function () {
    theTarget = sprites.createProjectileFromSide(assets.image`target`, 50, 0)
    theTarget.bottom = 56
    theTarget.setKind(SpriteKind.Enemy)
    pause(randint(500, 2000))
})

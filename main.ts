// game.onGameOverExpanded(winTypes.Multi)
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    game.customGameOverExpanded("Great Job!", effects.confetti, scoreTypes.None)
})
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    throwBall = ball.createProjectileBallFromSprite(assets.image`ball0`, myBall)
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
scene.setBackgroundImage(assets.image`wildWest1`)
myBall = ball.create(assets.image`ball`, SpriteKind.Player)
myBall.setPosition(80, 90)
myBall.controlWithArrowKeys(true)
let myBooth = sprites.create(assets.image`boundaries`, SpriteKind.Booth)
myBooth.z = 100
myBall.setTrace(true)
info.startCountdownGame(20, winTypes.Score)
forever(function () {
    theTarget = sprites.createProjectileFromSide(assets.image`target2`, 50, 0)
    theTarget.bottom = 56
    theTarget.setKind(SpriteKind.Enemy)
    pause(randint(500, 2000))
})

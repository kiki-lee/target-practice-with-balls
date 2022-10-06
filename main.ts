
function throw_power() {
    statusbar = statusbars.create(120, 6, StatusBarKind.Health)
    statusbar.setColor(5, 10)
    statusbar.setBarBorder(1, 1)
    statusbar.setPosition(80, 113)
}
// game.onGameOverExpanded(winTypes.Multi)
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    game.customGameOverExpanded("Great Job!", effects.confetti, music.powerUp, scoreTypes.HScore)
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
let statusbar: StatusBarSprite = null
let myBall: Ball = null
scene.setBackgroundImage(assets.image`wildWest`)

myBall = ball.create(assets.image`ball-yellow`, SpriteKind.Player)
myBall.setPosition(80, 90)
myBall.controlWithArrowKeys(true)
let myBooth = sprites.create(assets.image`booth`, SpriteKind.Booth)
myBall.setTrace(myBall, tracers.Cross)
info.startCountdownGame(20, winTypes.Score)
throw_power()
myBall.setIter(10)
game.onUpdate(function () {
    statusbar.value = 50 + Math.sin(game.runtime() / 300) * 50
    myBall.pow = statusbar.value
    myBall.update_crosshair()
})
forever(function () {
    theTarget = sprites.createProjectileFromSide(assets.image`target`, 50, 0)
    theTarget.bottom = 56
    theTarget.setKind(SpriteKind.Enemy)
    pause(randint(500, 2000))
})

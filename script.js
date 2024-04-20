let canvas = document.querySelector("canvas")
let ctx = canvas.getContext("2d")
let width = innerWidth
let height = width / 16 * 9
let speed = 10
let playerSpeed = 5
let colours = ["orange", "green", "darkblue", "purple", "yellow", "white", "orange"]
let cars = []
let bars = []
let moveUp = false
let moveDown = false
let continueGame = true

canvas.width = width
canvas.height = height

player = {
    x: 100,
    y: 100,
    color: "red",
    width: 100,
    height: 50
}

document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "w", "W"].includes(e.key)) moveUp = true
    if (["ArrowDown", "s", 'S'].includes(e.key)) moveDown = true
})

document.addEventListener("keyup", (e) => {
    if (["ArrowUp", "w", "W"].includes(e.key)) moveUp = false
    if (["ArrowDown", "s", 'S'].includes(e.key)) moveDown = false
})

function nextFrame() {
    if (!continueGame) return
    if (moveUp) player.y -= playerSpeed
    if (moveDown) player.y += playerSpeed
    ctx.clearRect(0, 0, width, height)
    for (let bar of bars) {
        bar.x -= speed
        drawBars(bar.x)
    }
    drawCar(player)
    for (const car of cars) {
        car.x -= speed
        drawCar(car)
    }
    cars = cars.filter(c => {return c.x + c.width > 0})
    bars = bars.filter(c => {return c.x + 60> 0})
    if (cars.some(c => {return checkCollison(c, player)})) endGame()
    window.requestAnimationFrame(nextFrame)
}

function drawCar(car) {
    ctx.fillStyle = car.color
    ctx.fillRect(car.x, car.y, car.width, car.height)
    ctx.fillStyle = "lightblue"
    ctx.fillRect(car.x + car.width - 20, car.y + car.height - 20, 20, 20)
    ctx.fillRect(car.x + car.width - 20, car.y, 20, 20)
}

function drawBars(x) {
    ctx.fillStyle = "white"
    ctx.fillRect(x, height / 2 - 10, 60, 20)
}

function checkCollison(c, player) {
    return ((c.x <= player.x && c.x + c.width >= player.x) || (c.x <= player.x + player.width && c.x + c.width >= player.x + player.width)) && 
            ((c.y <= player.y && c.y + c.height >= player.y) || (c.y <= player.y + player.height && c.y + c.height >= player.y + player.height))
}

function endGame() {
    continueGame = false
}

setInterval(() => {
    let w = Math.random() * 100 + 100
    let car = {
        width: w,
        height: 50,
        x: width + w,
        y: Math.random() * (height - 50),
        color: colours[Math.round(Math.random() * (colours.length - 1))]
    }
    cars.push(car)
}, 1000)

setInterval(() => {
    bars.push({x: width})
}, 500)

window.requestAnimationFrame(nextFrame)

let canvas = document.querySelector("canvas")
let ctx = canvas.getContext("2d")
let width = window.innerWidth
let height = canvas.getBoundingClientRect().height
let speed = scaleWidth(1)
let playerSpeed = scaleHeight(0.5)
let colours = ["orange", "green", "darkblue", "purple", "yellow", "white", "orange"]
let cars = []
let bars = []
let moveUp = false
let moveDown = false
let continueGame = false
let carWidth = 140
let deltaTime = Date.now()
let button = document.querySelector(".button")
let carDelay = deltaTime
let barDelay = deltaTime
let pauseTime = 0

canvas.width = width
canvas.height = height

let player = {
    x: scaleWidth(100),
    y: height / 2 - scaleHeight(40),
    color: "red",
    width: scaleWidth(carWidth),
    height: scaleHeight(80)
}

document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "w", "W"].includes(e.key)) moveUp = true
    if (["ArrowDown", "s", 'S'].includes(e.key)) moveDown = true
})

document.addEventListener("keyup", (e) => {
    if (["ArrowUp", "w", "W"].includes(e.key)) moveUp = false
    if (["ArrowDown", "s", 'S'].includes(e.key)) moveDown = false
})

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState != "visible" && continueGame) pause()
})

canvas.addEventListener("pointerdown", e => {
    if (e.clientX <= width / 2) moveUp = true
    else moveDown = true
})

canvas.addEventListener("pointerup", e => {
    if (e.clientX <= width / 2) moveUp = false
    else moveDown = false
})

canvas.addEventListener("pointercancel", () => {
    moveUp = moveDown = false
})


button.addEventListener("click", start)

function nextFrame() {
    if (!continueGame) return
    let currentTime = Date.now()

    if (moveUp) player.y -= playerSpeed * (currentTime - deltaTime)
    if (moveDown) player.y += playerSpeed * (currentTime - deltaTime)
    if (player.y < 0) player.y = 0
    if (player.y + player.height > height) player.y = height - player.height

    ctx.clearRect(0, 0, width, height)

    for (let bar of bars) {
        bar.x -= (currentTime - deltaTime) * speed * 1.2
        drawBars(bar.x)
    }
    drawCar(player)
    for (const car of cars) {
        car.x -= (currentTime - deltaTime) * speed
        drawCar(car)
    }
    cars = cars.filter(c => {return c.x + c.width > 0})
    bars = bars.filter(c => {return c.x + scaleWidth(60)> 0})
    if (currentTime - carDelay >= 1000) {
        addCar()
        carDelay = currentTime
    }
    if (currentTime - barDelay >= 500) {
        addBar()
        barDelay = currentTime
    }
    deltaTime = currentTime
    if (cars.some(c => {return checkCollison(c, player)})) endGame()
    window.requestAnimationFrame(nextFrame)
}

function drawCar(car) {
    let headlights = 30
    ctx.fillStyle = car.color
    ctx.fillRect(car.x, car.y, car.width, car.height)
    ctx.fillStyle = "lightblue"
    ctx.fillRect(car.x + car.width - scaleWidth(headlights), car.y + car.height - scaleHeight(headlights), scaleWidth(headlights), scaleHeight(headlights))
    ctx.fillRect(car.x + car.width - scaleWidth(headlights), car.y, scaleWidth(headlights), scaleHeight(headlights))
}

function drawBars(x) {
    ctx.fillStyle = "white"
    ctx.fillRect(x, height / 2 - 10, scaleWidth(60), scaleHeight(20))
}

function checkCollison(c, player) {
    return ((c.x <= player.x && c.x + c.width >= player.x) || (c.x <= player.x + player.width && c.x + c.width >= player.x + player.width)) && 
            ((c.y <= player.y && c.y + c.height >= player.y) || (c.y <= player.y + player.height && c.y + c.height >= player.y + player.height))
}

function endGame() {
    continueGame = false
    button.removeEventListener("click", resume)
    button.addEventListener("click", start)
    button.innerText = "Restart"
    button.classList.add("display")
}

function scaleWidth(val) {
    return val / 1024 * width
}

function scaleHeight(val) {
    return val / 576 * height
}

function pause() {
    pauseTime = Date.now()
    continueGame = false
    button.classList.add("display")
}

function resume() {
    carDelay += Date.now() - pauseTime
    barDelay += Date.now() - pauseTime
    continueGame = true
    button.classList.remove("display")
    deltaTime = Date.now()
    window.requestAnimationFrame(nextFrame)
}

function addCar() {
    let w = Math.random() * carWidth + carWidth
    let car = {
        width: scaleWidth(w),
        height: scaleHeight(80),
        x: width + w,
        y: Math.random() * (height - scaleHeight(80)),
        color: colours[Math.round(Math.random() * (colours.length - 1))],
        time:  Date.now()
    }
    cars.push(car)
}

function addBar() {
    bars.push({
        x: width,
        time: Date.now()
    })
}

function start() {
    button.removeEventListener("click", start)
    button.addEventListener("click", resume)
    button.innerText = "Resume"
    button.classList.remove("display")
    continueGame = true

    bars = []
    cars = []
    player.y = height / 2 - scaleHeight(40)
    
    for (let i = 0; i < 5; i++) {
        bars.push({
            x: width - 500 * i * speed * 1.2,
            time: Date.now()
        })
        
    }
    canvas.requestFullscreen()
    window.requestAnimationFrame(nextFrame)
}

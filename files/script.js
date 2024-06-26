let canvas = document.querySelector("canvas")
let ctx = canvas.getContext("2d")
let width = Math.max(window.innerWidth, 1024)
let height = Math.max(canvas.getBoundingClientRect().height, 576)
let speed = 1
let originalSpeed = speed
let playerSpeed = 0.5
let colours = ["orange", "green", "darkblue", "purple", "yellow", "white", "orange"]
let cars = []
let bars = []
let moveUp = false
let moveDown = false
let continueGame = false
let carWidth = 140
let deltaTime = Date.now()
let button = document.querySelector(".button")
let scoreDiv = document.querySelector(".score")
let highScoreDiv = document.querySelector(".high-score")
let carDelay = deltaTime
let barDelay = deltaTime
let scoreDelay = deltaTime
let speedDelay = deltaTime + 10000
let pauseTime = 0
let score = 0
let highScore = 0
canvas.width = width
canvas.height = height
ctx.font = "40px arcade"

let player = {
    x: 100,
    y: height / 2 - 40,
    color: "red",
    width: carWidth,
    height: 80
}

document.addEventListener("keydown", (e) => {
    if (["ArrowUp", "w", "W"].includes(e.key)) moveUp = true
    if (["ArrowDown", "s", 'S'].includes(e.key)) moveDown = true
    if (e.key == "Enter" && button.classList.contains("display")) button.click()
})

document.addEventListener("keyup", (e) => {
    if (["ArrowUp", "w", "W"].includes(e.key)) moveUp = false
    if (["ArrowDown", "s", 'S'].includes(e.key)) moveDown = false
})

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState != "visible" && continueGame) pause()
})

document.addEventListener("pointerdown", e => {
    if (e.clientX <= window.innerWidth / 2) moveUp = true
    else moveDown = true
})

document.addEventListener("pointerup", e => {
    if (e.clientX <= window.innerWidth / 2) moveUp = false
    else moveDown = false
})

document.addEventListener("pointercancel", () => {
    moveUp = moveDown = false
})

window.addEventListener("resize", () => {
    if (window.innerWidth / 16 * 9 > window.innerHeight) {
        canvas.classList.add("follow-height")
        scoreDiv.classList.add("follow-height")
        highScoreDiv.classList.add("follow-height")
    }
    else {
        canvas.classList.remove("follow-height")
        scoreDiv.classList.remove("follow-height")
        highScoreDiv.classList.remove("follow-height")
    }
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
        bar.x -= (currentTime - deltaTime) * speed * (speed + 0.2) / originalSpeed
        drawBars(bar.x)
    }
    drawCar(player)
    for (const car of cars) {
        car.x -= (currentTime - deltaTime) * speed
        drawCar(car)
    }
    ctx.fillStyle = "black"
    ctx.fillText((speed / originalSpeed).toFixed(1) + "x", 50, 50)
    cars = cars.filter(c => {return c.x + c.width > 0})
    bars = bars.filter(c => {return c.x + 60 > 0})
    if (currentTime - carDelay >= 1000) {
        addCar()
        carDelay = currentTime
    }
    if (currentTime - barDelay >= 500 / (speed + 0.2) * originalSpeed) {
        addBar()
        barDelay = currentTime
    }
    if (currentTime - scoreDelay >= 100) {
        score+= 10 * speed / originalSpeed
        scoreDiv.innerText = score
        scoreDelay = currentTime
    }
    if (currentTime - speedDelay >= 5000) {
        speed = parseFloat((speed + 0.2).toFixed(2))
        playerSpeed = parseFloat((playerSpeed + 0.1).toFixed(2))
        speedDelay = currentTime
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
    ctx.fillRect(car.x + car.width - headlights, car.y + car.height - headlights, headlights, headlights)
    ctx.fillRect(car.x + car.width - headlights, car.y, headlights, headlights)
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
    if (highScore < score) {
        highScore = score
        highScoreDiv.innerText = highScore
    }
    button.removeEventListener("click", resume)
    button.addEventListener("click", start)
    button.innerText = "Restart"
    button.classList.add("display")
}

function pause() {
    pauseTime = Date.now()
    continueGame = false
    button.classList.add("display")
}

function resume() {
    carDelay += Date.now() - pauseTime
    barDelay += Date.now() - pauseTime
    scoreDelay += Date.now() - pauseTime
    speedDelay += Date.now() - pauseTime
    continueGame = true
    button.classList.remove("display")
    deltaTime = Date.now()
    window.requestAnimationFrame(nextFrame)
}

function addCar() {
    let w = Math.random() * carWidth + carWidth
    let car = {
        width: w,
        height: 80,
        x: width + w,
        y: Math.random() * (height - 80),
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
    speed = 1
    score = 0
    playerSpeed = 0.5
    deltaTime = Date.now()
    carDelay = deltaTime
    barDelay = deltaTime
    scoreDelay = deltaTime
    speedDelay = deltaTime

    bars = []
    cars = []
    player.y = height / 2 - 40
    
    for (let i = 0; i < 5; i++) {
        bars.push({
            x: width - 500 * i * speed * 1.2,
            time: Date.now()
        })
        
    }
    document.body.requestFullscreen()
    window.requestAnimationFrame(nextFrame)
}

scoreDiv.innerText = 0
if (window.innerWidth / 16 * 9 > window.innerHeight) {
    canvas.classList.add("follow-height")
    scoreDiv.classList.add("follow-height")
    highScoreDiv.classList.add("follow-height")
}
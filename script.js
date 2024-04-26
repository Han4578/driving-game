let express = require("express")
let {Server} = require("socket.io")
let http = require("http")
let app = express()
let server = http.createServer(app)
let io = new Server(server)
let sqlite3 = require("sqlite3").verbose()
let fs = require("fs")

if (process.env.NEED_DOTENV != "NO") require("dotenv").config()

let db = new sqlite3.Database(process.env.DBFILE)

if (!fs.existsSync()) db.run("CREATE TABLE SCORES (id VARCHAR(36) PRIMARY KEY NOT NULL, score INT NOT NULL)")

app.use(express.static(__dirname + "/files"))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/files/index.html")
})

app.get("/scores/:id", (req, res) => {
    db.get("SELECT score FROM SCORES WHERE id = ?", [req.params.id], (err, row) => {
        if (err) throw err
        else res.send(row)
    })
})

io.on("high-score", (id, score) => {
    db.get("SELECT COUNT(*) FROM SCORES WHERE id = ?", [id], (err, row) => {
        if (err) throw err
        if (row == 1) db.run(`UPDATE TABLE SCORES SET score = ${score} WHERE id = ${id}`)
        else db.run(`INSERT INTO SCORES VALUES (${id}, ${score})`)
    })
})

server.listen(process.env.PORT)
let express = require("express")
let {Server} = require("socket.io")
let http = require("http")
let app = express()
let server = http.createServer(app)
let io = new Server(server)
let sqlite3 = require("sqlite3").verbose()
let fs = require("fs")

let db = new sqlite3.Database(process.env.DBFILE)

if (!fs.existsSync(process.env.DBFILE)) db.run("CREATE TABLE SCORES (id VARCHAR(36) PRIMARY KEY NOT NULL, score INT NOT NULL, username VARCHAR(255) NOT NULL)")

app.use(express.static(__dirname + "/files"))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/files/index.html")
})

app.get("/scores/:id", (req, res) => {
    db.get(`SELECT score FROM SCORES WHERE id = "${req.params.id}"`, (err, row) => {
        if (err) throw err
        else res.send(row)
    })
})

app.get("/leaderboard", (req, res) => {
    db.all(`SELECT username, score FROM SCORES ORDER BY score DESC`, (err, row) => {
        if (err) throw err
        else res.send(row)
    })
})

io.on("connect", socket => {
  socket.on("high-score", (id, score) => {
    db.get(`SELECT COUNT(*) AS count FROM SCORES WHERE id = "${id}"`, (err, row) => {
        if (err) throw err
        if (row.count == 1) db.run(`UPDATE SCORES SET score = ${score} WHERE id = "${id}"`)
        else db.run(`INSERT INTO SCORES VALUES ("${id}", ${score})`)
    })
  })
})

server.listen(process.env.PORT)
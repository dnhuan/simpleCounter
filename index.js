const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
const bodyParser = require("body-parser")
const cors = require("cors");
const path = require("path");

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter)

db.defaults({ count: 0 }).write()

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'assets')));

app.set('view engine', 'ejs');

app.get('/', (req,res)=>{
    res.render(__dirname + "/index", {count: getCount()});
});

app.get('/count', (req,res)=>{
    res.send(getCount())
});

app.all('/update', (req,res)=>{
    let data = parseInt(req.body.d)
    let count = parseInt(db.get('count').value()) + data
    db.set('count', count).write();
    io.emit('count', count);
    res.send(count.toString());
});

app.all('/reset', (req,res)=>{
    db.set('count', 0).write();
    res.sendStatus(200)
});

setInterval(()=>{
    io.emit('count', getCount())
}, 1000);

httpServer.listen(process.env.PORT || 3000, () => {
    console.log("Listening on port", process.env.PORT || 3000);
});

function getCount(){
    return db.get('count').value().toString();
}
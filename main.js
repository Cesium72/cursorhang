const http = require("http");
const fs = require("fs");
const crypto = require("crypto")

var users = [];

function serve(req,res) {
    res.setHeader("Content-type","text/html");
    res.statusCode = 200;
    switch(req.url.split("/")[1]) {
        case "": {
            res.write(fs.readFileSync("index.html"));
            break;
        }
        case "room": {
            res.write(fs.readFileSync("room.html"));
            break;
        }
        case "send": {
            try{
            res.setHeader("Content-type","text/json")
            users[users.map(a => a.session).indexOf(req.url.split("/")[2])].x = req.url.split("/")[3];
            users[users.map(a => a.session).indexOf(req.url.split("/")[2])].y = req.url.split("/")[4];
            users[users.map(a => a.session).indexOf(req.url.split("/")[2])].timeout = 10;
            
            res.write(JSON.stringify(users.filter(a => a.room == users[users.map(a => a.session).indexOf(req.url.split("/")[2])].room)))}
            catch {res.write("[]")}
            break;
        }
        case "join": {
            let temp = crypto.randomBytes(4).toString("hex");
            users.push({
                "name":decodeURIComponent(req.url.split("/")[2])[0].toUpperCase(),
                "room":decodeURIComponent(req.url.split("/")[3]),
                "color":decodeURIComponent(req.url.split("/")[4]),
                "session":temp,
                "timeout":20,
                "x":"50",
                "y":"50"
            });
            if(users.slice(0,-1).filter(a => a.room == users[users.length - 1].room).map(a => a.name).includes(users[users.length - 1].name)) {
                res.write("Sorry, that name is already used in this room");
                users.pop()
            } else if(users.filter(a => a.room == users[users.length - 1].room).length == 16) {
                res.write("Sorry, this room is full.");
                users.pop()
            } else 
                res.write(temp);
            break;
        }
        case "expired": {
            res.write(fs.readFileSync("expired.html"));
            break;
        }
        default: {
            res.statusCode = 404;
            res.write(fs.readFileSync("404.html"));
        }
    }
    res.end();
}

const server = http.createServer(serve);
server.listen(2011);

setInterval(() => {
    for(var i = 0; i < users.length; i++)
        users[i].timeout--;
    users = users.filter((e) => e.timeout >= 0)
},1000)
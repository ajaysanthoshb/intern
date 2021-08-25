const express = require('express')
const app = express()
const uuid = require('uuid')
var port = process.env.PORT || 3000
var room_id;
var sockets = {};
app.set('view engine','hbs')
app.set('views',__dirname+'/static_files')

app.get('/',(req,res)=>{
    res.redirect(`${uuid.v4()}`)
})
app.use(express.static(__dirname+'/static_files'))
app.get('/:room_id',(req,res)=>{
    room_id = req.params.room_id
    res.render('index')
})

const server = require('http').createServer(app)
const io = require('socket.io')(server)

io.on('connection',(socket)=>{
    //If connection happens accessing clients socket
    socket.emit('send_room_id',room_id)
    socket.on('join-room',(roomID,userID)=>{
        socket.userID = userID
        socket.roomID = roomID
        socket.join(socket.roomID)
        socket.broadcast.to(socket.roomID).emit('user-connected',socket.userID)
    })
    socket.on('disconnect',()=>{
        console.log("USERID: " + socket.userID + "ROOMID: " + socket.roomID)
        socket.broadcast.to(socket.roomID).emit('user-disconnected',socket.userID)
    })
    socket.on('message',(msg,ROOMIE)=>{
        //Send this clients msg to remaining clients
        socket.broadcast.to(socket.roomID).emit('broadcast_msg',msg,ROOMIE)
    })
    socket.on('status',(person,one_user)=>{
        socket.broadcast.to(socket.roomID).emit('broadcast_status',person,one_user)
    })

    socket.on('remaining_status',(u,p1,p2)=>{
        socket.broadcast.to(socket.roomID).emit('receive_status',u,p1,p2);
    })
})

server.listen(port)
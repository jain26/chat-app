const express=require('express')
const path=require('path')
const app=express()
const http=require('http')
const socketio=require('socket.io')
const Filter=require('bad-words')
const { generateMessage,generateLocationMessage } = require('./utils/message-generator')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')

const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 3000

const publicDir=path.join(__dirname,'../public')
app.use(express.static(publicDir))

io.on('connection',(socket)=>{
    console.log('new websocket connection')

    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})
        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Admin','Welcome'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined the room`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('You cannot send profane words in messages')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })
    socket.on('sendLocation',(coords,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitute},${coords.longitute}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left the Chatroom`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
        
    })

})

server.listen(port,()=>{
    console.log(`server is listening on port ${port}`)
})
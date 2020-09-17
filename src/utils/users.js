const users=[]

const addUser=({id,username,room})=>{
    // clean the data
    username=username.trim().toLowerCase()
    room=room.trim().toLowerCase()

    //check if username and room values are provided
    if(!username||!room){
        return{
            error:'Username and Room could not be empty'
        }
    }

    //check for existing users in the room
    const existingUser=users.find((user)=>{
        return user.username===username&&user.room===room
    })

    if(existingUser){
        return{
            error:`Username ${username} is already taken in this room`
        }
    }

    const user={id,username,room}
    users.push(user)
    return {user}
}

const removeUser=(id)=>{
    const index=users.findIndex((user)=>user.id===id)
    if(index!=-1){
       return users.splice(index,1)[0]
    }
}
const getUser=(id)=>{
    return users.find((user)=>user.id===id)
}
const getUsersInRoom=(room)=>{
    room=room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
const socketIo=(io)=>{
    //store connected users with their room information using socket.id as their key
    const connectedUsers=new Map()
    //handle new socket connection
    io.on("connection",(socket)=>{
      //get user from authentication
      const user = socket.handshake.auth.user;
      console.log("user connected: ", user?.username);

      //!START: join room handler
      socket.on("join room",(groupId)=>{
        //add socket to the specified room
        socket.join(groupId); //room
        //store user and room info in connectedUsers map
        connectedUsers.set(socket.id,{user,room:groupId});
        //get list of all users currently in the room
        const userInRoom=Array.from(connectedUsers.values()).filter((u)=>u.room === groupId).map((u)=>u.user);
        //emit updated users list to all clients in the room
        io.in(groupId).emit("users in room",userInRoom)
        //broadcast join notification to all other users in the room
        socket.to(groupId).emit("notification",{
          type:"USER_JOINED",
          message:`${user?.username} has joined`,
          user:user,
        })
      })
      //!END: join room handler

      //!START: leave room handler
      //triggered when user manually leaves a room
      socket.on("leave room",(groupId)=>{
        console.log(`${user?.username} leaving room: `,groupId);
      //remove socket from the room
      socket.leave(groupId);
      if(connectedUsers.has(socket.id)){
        connectedUsers.delete(socket.id);
        socket.to(groupId).emit("user left",user?._id);
      }
        
      })
      //!END: leave room handler

      //!START: new message handler
      //triggered when user sends a new message
      socket.on("new message",(message)=>{
        //broadcast message to all other users in the room
        socket.io(message.groupId).emit("message received",message)
      })
      //!END: new message handler

      //!START: disconnect handler
      //triggered when user closes the connection
      socket.on("disconnect",()=>{
        console.log(`${user?.username} disconnected`);
        if(connectedUsers.has(socket.id)){
          //get user's room info before removing
          const userData=connectedUsers.get(socket.id);
          //notify others in the room about user's departure
          socket.to(userData.room).emit("user left",user?._id)
          //remove user from connected users
          connectedUsers.delete(socket.id)
        }
      })
      //!END: disconnect handler

      //!START: typing indicator handler
      //triggered when user starts typing
      socket.on("typing",({groupId,username})=>{
        //broadcast typing status to other users in the room
        socket.to(groupId).emit("user typing",{username});
      })

      //triggered when user stops typing
      socket.on("stop typing", (groupId) => {
        //broadcast typing status to other users in the room
        socket.to(groupId).emit("user stop typing", { username:user?.username });
      });
      //!END: typing indicator handler
    })
}

module.exports=socketIo
require("dotenv").config()
const express=require("express");
const cors=require("cors");
const cookieParser=require("cookie-parser")
const morgan=require("morgan")
const http=require("http");
const socketio=require("socket.io");
const socketIo = require("./socketIo");

const MongoStore=require("connect-mongo")
const session=require("express-session")

//db connection
const pool=require("./configs/db")
pool()

//Routers
const userRouter=require("./routes/userRoutes");
const groupRouter=require("./routes/groupRoutes");
const chatRouter=require("./routes/chatRoutes");

const app=express()
const server=http.createServer(app)
const io=socketio(server,{
    cors:{
        origin:["https://localstorage:5173"],
        methods:["GET","POST"],
        credentials:true,
    }
})

//middlewares
app.use(cors())
app.use(express.json())
app.use(morgan("dev"))
app.use(cookieParser())

// //?session middleware
// app.use(session({
//     secret:process.env.SESSION_SECRET || "anykey",
//     resave:false,
//     saveUninitialized:false,
//     cookie:{
//         maxAge:3*24*60*60*1000, //3days
//     },
//     store:MongoStore.create({
//         mongoUrl:process.env.MONGODB_URL
//     })
// }))

//Initialize
socketIo(io)



//routes
app.use("/users",userRouter);
app.use("/groups",groupRouter);
app.use("/chat",chatRouter)


//start the server
const PORT=process.env.PORT || 5000;

server.listen(PORT,console.log("Server is up and running on port: ",PORT))

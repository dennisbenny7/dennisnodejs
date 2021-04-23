const cors = require('cors');
const ytdl = require('ytdl-core');


const { Socket } = require("dgram")
const express=require("express");
const app=express();
const bodyparser=require("body-parser");
const exphbs =require("express-handlebars");
var http = require("http").createServer(app)
var io = require("socket.io")(http)
const bcrypt=require('bcrypt')
const MongoClient= require("mongodb").MongoClient;
const { resolve } = require("path");
var session=require("express-session")
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const formatMessag = require('./utils/chatMessage');
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');


const dbname = 'chatApp';
const chatCollection = 'chats'; //collection to store all chats
const userCollection = 'onlineUsers'; //collection to maintain list of currently online users
const database = 'mongodb+srv://dennis:den-mhack1@cluster0.ps4hn.mongodb.net/chatApp?retryWrites=true&w=majority';



app.use(session({secret:"key",cookie:{maxAge:600000000000000}}))





app.use(bodyparser.urlencoded({extended:true}));


app.use(express.static(__dirname + "/public" ));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));

app.set("view engine","hbs");
app.engine("hbs",exphbs({
    extname:"hbs",defaultLayout:"index",layoutsDir:__dirname + "/views/layouts",partialsDir: + "/views/partials",
}));

var hai=""





http.listen(process.env.PORT || 5000)
console.log("server connnected");

app.get("/",(req,res)=>{
   let user=req.session.user
   hai=req.session.user
   
    res.render("main",{user});

})
app.use(function (req,result,next) {
result.setHeader("Access-Control-Allow-Origin","*")
    next();
})
app.get("/login",(req,res)=>{
    if(req.session.loggedIn){
        res.redirect("/")
    }else{
    res.render("login",{"loginerr":req.session.loginerr})
    req.session.loginerr=false
    }
})
app.get("/signup",(req,res)=>{
    if(req.session.loggedIn){
        res.redirect("/")
    }else{
        res.render("signup")
    }
  
})
app.post("/signup",(req,res)=>{
    
    
bcrypt.hash(req.body.psw,10).then((res)=>{
    req.body.psw=res
     
    const connection_string="mongodb+srv://dennis:den-mhack1@cluster0.ps4hn.mongodb.net/data?retryWrites=true&w=majority"
    MongoClient.connect(connection_string,{useUnifiedTopology:true},function(err,client){
    if(err)throw err;
    console.log("connected to mongo db")
    var db = client.db("data")
    db.collection("users").insertOne(req.body,(err,res)=>{
        if (err) throw err;
        console.log(res.ops[0])
       
    })
    
        
})



}) 
res.redirect("/login")
 
})
app.post("/login",(req,res)=>{
    

const connection_string="mongodb+srv://dennis:den-mhack1@cluster0.ps4hn.mongodb.net/data?retryWrites=true&w=majority"
    MongoClient.connect(connection_string,{useUnifiedTopology:true},function(err,client){
    if(err)throw err;
    console.log("connected to mongo db")
    var db = client.db("data")
    
    var responce ={}
   
    
    let email=req.body.uname
  db.collection("users").findOne({email:email}).then((user)=>{
    if(user){
        bcrypt.compare(req.body.psw,user.psw).then((stutus)=>{
            if(stutus){
                console.log("login susses")
                responce.user=user
                responce.stutus=true
                req.session.loggedIn=true
        req.session.user=user
        
        res.redirect("/")
        
        

            }else{
                req.session.loginerr=true
                console.log("login faild")
               res.redirect("/login")
            }

        })
    }else{
        console.log("loginfaild")
       res.redirect("/login")
    }
  
 })

})
    
})
app.get("/logout",(req,res)=>{
    req.session.destroy()
    res.redirect("/")
})
app.post("/getusr",(req,res)=>{
    var user=req.body
    

    const connection_string="mongodb+srv://dennis:den-mhack1@cluster0.ps4hn.mongodb.net/data?retryWrites=true&w=majority"
 
MongoClient.connect(connection_string,{useUnifiedTopology:true},function(err,client){
    if(err)throw err;
    console.log("connected to mongo db")
    var db = client.db("data")
  db.collection("users").findOne({email:user.usern}).then((data)=>{
      if(data){
          var user="username alredy taken, try a new username and navigate to password section,then  err will go "
          
          
          
          res.end(user)

      }else{
          
          res.end()
      }
      

})
})

})
////////////////////////////////////////////////

app.post("/getgrmsgs",(req,res)=>{


    const connection_string="mongodb+srv://dennis:den-mhack1@cluster0.ps4hn.mongodb.net/data?retryWrites=true&w=majority"
    MongoClient.connect(connection_string,{useUnifiedTopology:true},function(err,client){
    if(err)throw err;
    console.log("connected to mongo db")
    var db = client.db("data") 
    
    
    
  
    db.collection("group").find().project({sender:1,_id:0,message:1}).toArray(function (err,result) {
        if (err) throw err;
        
        res.end(JSON.stringify(result)); 
  
        client.close();
      
    })
   
    
    })    
    
  })
  app.get("/cha",(req,res)=>{
    if(req.session.loggedIn){
      let user=req.session.user
    
      res.render("index1",{user});
  }else{
  res.redirect("/")
  }
  
 
  
  })
  app.get("/chat",(req,res)=>{
    
      if(req.session.loggedIn){
        let user=req.session.user
    
        res.render("chat",{user});
    

          }else{
    res.redirect("/")
    }
    

   
    
  })
  
  const botName = 'klc team';
  
  // Run when client connects
  io.of("/iopublic").on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
      const user = userJoin(socket.id, username, room);
  
      socket.join(user.room);
  
      // Welcome current user
      socket.emit('message', formatMessage(botName, 'Welcome to klc public chat!'));
  
      // Broadcast when a user connects
      socket.broadcast
        .to(user.room)
        .emit(
          'message',
          formatMessage(botName, `${user.username} has joined the chat`)
        );
  
      // Send users and room info
      io.of("/iopublic").to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    });
  
    // Listen for chatMessage
    socket.on('chatMessage', msg => {
      const user = getCurrentUser(socket.id);
  
  
      const connection_string="mongodb+srv://dennis:den-mhack1@cluster0.ps4hn.mongodb.net/data?retryWrites=true&w=majority"
              MongoClient.connect(connection_string,{useUnifiedTopology:true},function(err,client){
              if(err)throw err;
              console.log("connected to mongo db")
              var db = client.db("data")
              db.collection("group").insertOne({
                sender:user.username,
                
                message:msg
  
            },function(err,res){
                if (err) throw err
                console.log("document incerted")
                client.close();
            })
              })
      io.of("/iopublic").to(user.room).emit('message', formatMessage(user.username, msg));
    });
  
    // Runs when client disconnects
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
  
      if (user) {
        io.of("/iopublic").to(user.room).emit(
          'message',
          formatMessage(botName, `${user.username} has left the chat`)
        );
  
        // Send users and room info
        io.of("/iopublic").to(user.room).emit('roomUsers', {
          room: user.room,
          users: getRoomUsers(user.room)
        });
      }
    });
  });
  app.post("/getusername",(req,res)=>{

 let user=req.session.user
 res.end(JSON.stringify(user)); 
 
    
    console.log(user)
   
})
////////////////////////////////////////
//////////////////////////////////////
app.get("/pri",(req,res)=>{

  
  if(req.session.loggedIn){
    let user=req.session.user
    
    res.render("privatechat",{user});
        
  


    
      }else{
res.redirect("/")
}
  
    
       
    

})

const fellers = [];
var feller=[];
io.of("/ioprivate").on('connection', (socket) => {
  console.log('New User Logged In with ID '+socket.id);
  
   socket.on("onlineusers",(username)=>{
      var room="klc"
      const user = userJoi(socket.id, username, room);
console.log(room)
      socket.join(user.room);
       
         
      io. of("/ioprivate").to(user.room).emit('roomUsers', {
        
          users: getRoomUse(user.room)
        });
  
   })  
   
  
   function getRoomUse(room) {
     return fellers.filter(user => user.room === room);
   }


// Join user to chat
function userJoi(id, username, room) {
const user = { id, username, room };

fellers.push(user);

return user;
}
function userLeav(id,) {
  const index = fellers.findIndex(user => user.id === id);

  if (index !== -1) {
    return fellers.splice(index, 1)[0];
    
  }
}



  
  
  //Collect message and insert into database
  socket.on('chatMessage', (data) =>{ //recieves message from client-end along with sender's and reciever's details
      var dataElement = formatMessag(data);
      var id=feller[data.toUser]
      io.of("ioprivate").to(id).emit('message',dataElement);
      

      MongoClient.connect(database, (err,db) => {
          if (err)
              throw err;
          else {
              var onlineUsers = db.db(dbname).collection(userCollection);
              var chat = db.db(dbname).collection(chatCollection);
              chat.insertOne(dataElement, (err,res) => { //inserts message to into the database
                  if(err) throw err;
                  socket.emit('message',dataElement); //emits message back to the user for display
              });
              onlineUsers.findOne({"name":data.toUser}, (err,res) => { //checks if the recipient of the message is online
                  if(err) throw err;
                  //if(res!=null) //if the recipient is found online, the message is emmitted to him/her
                    //  socket.to(res.ID).emit('message',dataElement);
              });
          }
          db.close();
      });

  });

  socket.on('userDetails',(data) => { //checks if a new user has logged in and recieves the established chat details
      MongoClient.connect(database, (err,db) => {
          if(err)
              throw err;
          else {
             
              var onlineUser = { //forms JSON object for the user details
                  "ID":socket.id,
                  "name":data.fromUser

              };
              feller[data.fromUser]=socket.id;

             
              var currentCollection = db.db(dbname).collection(chatCollection);
              var online = db.db(dbname).collection(userCollection);
              online.insertOne(onlineUser,(err,res) =>{ //inserts the logged in user to the collection of online users
                  if(err) throw err;
                  console.log(onlineUser.name + " is online...");
                 var online=onlineUser.name
                  socket.emit("online",online)
                
              });
              currentCollection.find({ //finds the entire chat history between the two people
                  "from" : { "$in": [data.fromUser, data.toUser] },
                  "to" : { "$in": [data.fromUser, data.toUser] }
              },{projection: {_id:0}}).toArray((err,res) => {
                  if(err)
                      throw err;
                  else {
                      //console.log(res);
                      socket.emit('output',res); //emits the entire chat history to client
                  }
              });
          }
          db.close();
      });   
  });  
  var userID = socket.id;
  socket.on('disconnect', () => {
      const user = userLeav(socket.id);
      var roo="klc"
      io.of("/ioprivate").to(roo).emit('roomUsers', {
      
          users: getRoomUse(roo)
        });
      MongoClient.connect(database, function(err, db) {
          if (err) throw err;
          var onlineUsers = db.db(dbname).collection(userCollection);
          var myquery = {"ID":userID};
          onlineUsers.deleteOne(myquery, function(err, res) { //if a user has disconnected, he/she is removed from the online users' collection
            if (err) throw err;
            console.log("User " + userID + "went offline...");
            db.close(); 
          });
        });
  });
});
app.post("/getusername1",(req,res)=>{

  let user=req.session.user
  res.end(JSON.stringify(user)); 
  
     
     console.log(user)
    
 })
 app.post("/mongo",(req,res)=>{

  
  const connection_string="mongodb+srv://dennis:den-mhack1@cluster0.ps4hn.mongodb.net/data?retryWrites=true&w=majority"
  MongoClient.connect(connection_string,{useUnifiedTopology:true},function(err,client){
  if(err)throw err;
  console.log("connected to mongo db")
  var db = client.db("data")
  db.collection("users").find({}).toArray((err,result)=>{
    if (err) throw err
    
    res.end(JSON.stringify(result)); 
    client.close()
  })

  
})
     
 
    
 })

 //////////////////////////////////
 //////////////////////////////////
 //youtu be
 app.get('/youtube', (req, res) => {
  res.sendFile('youtube.html', { root: './' });
})

app.get('/download', (req, res) => {
  var url = req.query.url;
  res.header("Content-Disposition", 'attachment; filename="Video.mp4');
  ytdl(url, {format: 'mp4'}).pipe(res);
});
//////////////////////////////////


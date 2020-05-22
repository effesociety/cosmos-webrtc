const express = require('express')
const app = express();
const mongoServer = require('./utils/db');
const auth = require("./routes/auth");
const cookie = require('cookie')
const path = require('path')
const dotenv = require('dotenv')
const Helpers = require('./utils/helpers')

//Importing functions
const getSocket = Helpers.getSocket;
const checkUser = Helpers.checkUser;
const checkReservation = Helpers.checkReservation;
const checkFreeRoom = Helpers.checkFreeRoom;
const nextUserEnter = Helpers.nextUserEnter;
const destroyRooms = Helpers.destroyRooms;

dotenv.config()


console.log("NODE_ENV: ", process.env.NODE_ENV)

const server = app.listen(process.env.PORT,()=>{
	console.log("App running on port ", process.env.PORT)
});
const io = require('socket.io').listen(server);

/************************************
*				STATIC SERVE
************************************/
if(process.env.NODE_ENV === "production"){
	const CLIENT_BUILD_PATH = path.join(__dirname, "../frontend/build");

	// Static files
	app.use(express.static(CLIENT_BUILD_PATH));

	// Server React Client

	app.get("/", function(req, res) {
	res.sendFile(path.join(CLIENT_BUILD_PATH , "index.html"));
	});
}
/************************************
*					AUTHENTICATION
************************************/
mongoServer(); //Start Mongo

app.use("/user", auth); //API for Login/Signup

/************************************
*		REVERSE PROXY FOR JANUS
************************************/
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/janus',createProxyMiddleware({target: process.env.JANUS_PROXY}))

/************************************
*					JANUS SETUP
************************************/
const JanusAdminAPI = require('./janus/janus-admin-api');
var janusAdmin = new JanusAdminAPI();
janusAdmin.addToken(process.env.JANUS_TOKEN)
const JanusAPI = require('./janus/janus-api');
var janusSession = new JanusAPI()//create Janus session
const janus =  Helpers.commonEmitter;
/************************************
*					QUEUE SETUP
************************************/
var queue = []
var activeUsers = {}
var connecting = {}
var cosmosStatus = "disabled"

if(process.env.JANUS_RELAY === "true"){
	const janusRelay = require('./janus/janus-event-handler-relay')
	janusRelay()
}
else{
	const events = require("./routes/events");
	app.use("/events", events); //API for Janus Event Handler
}

/********************************************************************/
io.on('connection',(socket) => {
	console.log('A user connected. Socket ID: ',socket.id)

	socket.on('map', () => {
		console.log("Received map")
    	const cookies = cookie.parse(socket.request.headers.cookie || '')
		checkUser(cookies,socket).then(user =>{
			if(user){			
				socket.emit('cosmosStatus',cosmosStatus)
				if(cosmosStatus === 'enabled'){
					checkFreeRoom(janusSession)
					.then(room => {
						if(!room){
							socket.emit('queueStatus','occupied')
						}
						else{
							socket.emit('queueStatus','empty')
						}
					})
				}
				socket.username = user.username
				checkReservation(queue,io,socket.username,socket.id)
				socket.emit('identityChecked',socket.username, user.role)
			}
		})
  })

	socket.on('identify', () => {
    console.log("Received identify")
    const cookies = cookie.parse(socket.request.headers.cookie || '')
    checkUser(cookies,socket).then(user =>{
			if(user){
				socket.emit('cosmosStatus',cosmosStatus)
				if(cosmosStatus === 'enabled'){
					checkFreeRoom(janusSession)
					.then(room => {
						if(!room){
							socket.emit('queueStatus','occupied')
						}
						else{
							socket.emit('queueStatus','empty')
						}
					})
				}				
				socket.username = user.username
				socket.emit('identityChecked',socket.username, user.role)
				console.log("identityChecked emitted")
				checkReservation(queue,io,socket.username, socket.id)
			}
			else {
				console.log("User not identified")
				socket.emit('identityChecked',undefined)
			}
		})
  })

	//Admin enable/disable Cosmos
	socket.on('changeCosmosStatus', (cmd) => {
		console.log("Received changeCosmosStatus request")
		const cookies = cookie.parse(socket.request.headers.cookie || '')
		checkUser(cookies,socket).then(user =>{
			if(user){
				socket.username = user.username
				if(user.role === 'admin'){
					if(cmd === 'enable' && cosmosStatus === 'disabled'){
						console.log("Emitted cosmosStatusChanged [ENABLE]")
						io.emit('cosmosStatus','enabled')
						io.emit('queueStatus','occupied')
						cosmosStatus = "enabled"

						//Janus setup on Cosmos enable
						janusAdmin.addToken(process.env.JANUS_TOKEN)
						janusSession.init()
						.then(() =>{
							destroyRooms(janusSession)
						})
						
					}
					else if(cmd === 'disable' && cosmosStatus === 'enabled'){
						console.log("Emitted cosmosStatusChanged [DISABLE]")
						io.emit('cosmosStatus','disabled')
						cosmosStatus = "disabled"
						destroyRooms(janusSession)
						queue = []
						activeUsers = {}
						connecting = {}
						janusSession.destroySession()
					}
				}
			}
		})
	})

	//On user's reservation
	socket.on('enqueue', (friend) =>{
    console.log("Received enqueue request")
    const cookies = cookie.parse(socket.request.headers.cookie || '')
		checkUser(cookies,socket).then(user =>{
			if(user){
				if(user.role === "employee" || user.role === "admin"){
					return
				}
				else if(user.role === 'user' && cosmosStatus === 'enabled'){
					var tokenJanus = Math.random().toString(36).substring(2) //generate random Token
					janusAdmin.addToken(tokenJanus)

					console.log("[DEBUG] Enqueue completed, sending reservation position: ",queue.length)
					socket.emit('enqueueCompleted',queue.length)
					
					if(friend){
						console.log("There is a friend with him!")
						friendlySocket = getSocket(io,friend)
						console.log("Printing socketID:", friendlySocket.id)
						friendlyToken = Math.random().toString(36).substring(2) //generate random Token
						janusAdmin.addToken(friendlyToken)
					}

					checkFreeRoom(janusSession)
					.then(room => {
						if(!room){
							if(!friend){
								queue.push(
									[{
										username: user.username,
										socket: socket,
										token: tokenJanus,
									}]
								)
							}
							else{
								queue.push(
									[{
										username: user.username,
										socket: socket,
										token: tokenJanus,
									},
									{
										username: friend,
										socket: friendlySocket,
										token: friendlyToken
									}]
								)								
							}
							console.log("Rooms occupied")
							io.emit('queueStatus','occupied')
						}
						else{
							socket.emit('enter',tokenJanus,room)
							connecting[user.username] = {
								room: room,
								token: tokenJanus,
								socket: socket
							}
							if(friend && friendlySocket){
								friendlySocket.emit('enter',friendlyToken, room)
								connecting[friend] = {
									room: room,
									token: friendlyToken,
									socket: friendlySocket
								}
							}
							
							console.log("[DEBUG] User enter in room-",room)
						}
					})
				}
			}
		})
	})

  socket.on('createRoom', () => {
    console.log("Received createRoom request")
    const cookies = cookie.parse(socket.request.headers.cookie || '')
    checkUser(cookies,socket).then(user =>{
			if(user){
				if((user.role === "employee" || user.role === "admin") && cosmosStatus === 'enabled'){
					janusSession.createRoom()
					.then((room) => {
						var janusToken = Math.random().toString(36).substring(2)
						janusAdmin.addToken(janusToken)
						socket.emit('enter',janusToken,room)
						connecting[user.username] = {
							room: room,
							token: janusToken,
							socket: socket
						}
						if(queue.length > 0){
							nextUserEnter(queue,connecting,io,room)
						}
						else{
							io.emit('queueStatus','empty')
						}
					})
				}
			}
		})
  })

	socket.on('joined', (id) => {
		//a user entered, we have to find him in the queue,
		//copy all the information and then remove it from the queue
		const cookies = cookie.parse(socket.request.headers.cookie || '')
		checkUser(cookies,socket).then(user =>{
			if(user && cosmosStatus === 'enabled'){
				activeUsers[id].role = user.role
				activeUsers[id].socketID = socket.id
				activeUsers[id].username = user.username
				activeUsers[id].room = connecting[user.username].room
								
				if(user.role === 'admin' || user.role === 'employee'){
					activeUsers[id].token = process.env.JANUS_TOKEN //just for now
				}
				else{
					activeUsers[id].token = connecting[user.username].token
				}
				
				console.log("New active user")
				console.log(activeUsers[id])
				console.log("Removing this user from 'connecting' data structure")
				
				delete connecting[user.username]
				
				checkFreeRoom(janusSession)
				.then(room =>{
					if(!room){
						io.emit('queueStatus','occupied')
					}
				})
				
			}
		})
	})

	//On disconnect handler
	socket.on('disconnect',() => {
		console.log("A user disconnected with id: ",socket.id);
		for(let i=0;i<queue.length;i++){
			for(let j=0;j<queue[i].length;j++){
				if(queue[i][j].socket.id === socket.id){
					queue[i][j].socket = null
				}
			}
		}
	})
})

janus.on('joined', data => {
  console.log("************EVENT JOINED**************")
  console.log(data)

	activeUsers[data.id] = {
		"room": data.room
	}

	//setTimeout of 5 seconds and if only room is set
	//deactivate all tokens that are not matched with activeUsers
	//kick from room and remove from activeUsers
})

janus.on('leaving', data => {
  console.log("************EVENT LEAVING**************")
  console.log(data)
	janusSession.listParticipants(data.room)
	.then(participants => {
		var active = participants.length
		console.log("Numbers of participants room-", data.room, ": ", active)
		if(active>0){
			var workerOnline = false
			participants.forEach( participant => {
				if(activeUsers[participant.id].role === "admin" || activeUsers[participant.id].role === "employee"){
					workerOnline = true
				}
			})
			if(!workerOnline){
				//There is someone but no admin/employee -> destry room
				console.log("No admin/employee in room " + data.room + "! Destroying...")
				janusSession.destroyRoom(data.room)
				if(queue.length>0){
					io.emit('queueStatus','occupied')
				}
			}
			else if(workerOnline && active === 1){
				//Only the admin/employee is in the room, next user should enter
				const expiredToken = activeUsers[data.id].token
				janusAdmin.removeToken(expiredToken)
				delete activeUsers[data.id]
				if(queue.length>0){
					nextUserEnter(queue,connecting,io,data.room)
				}
				else{
					io.emit('queueStatus','empty')
				}
			}
		}
		else{ //delete room if everyone left
			console.log("No one left in room " + data.room + "! Destroying...")
			janusSession.destroyRoom(data.room)
		}
	})
})

/********************************************************************/

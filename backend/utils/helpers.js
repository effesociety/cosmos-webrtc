const jwt = require("jsonwebtoken");
const schema = require('../model/schema')

function getSocket(io, username){
	var sockets = io.sockets.sockets;
	for(var socketId in sockets) {
		if(sockets[socketId].username === username){
			return sockets[socketId]
		}			
	}
}

async function checkUser(cookies,socket){
  var token = cookies.token
  if(token){
    try{
		var decoded = jwt.verify(token,process.env.JWT_SECRET)
		var username = decoded.user.username
		var user = await schema.findOne({username})
		return user
    }
    catch(err){
		console.log(err)
		socket.emit('identityChecked',undefined)
    }
  }
	else{
		socket.emit('identityChecked',undefined)
	}
}

//Check if a user has a reservation in the queue
function checkReservation(queue,io,username,socketID){
  queue.forEach((queueElement,index)=> {
    queueElement.forEach(user => {
      if(user.username == username){
        console.log("User had a reservation number:",index)
        io.to(socketID).emit('updateQueue',index)
      }
    })
  })
}

async function checkFreeRoom(janusSession){
  const list = await janusSession.listRooms()
  for (const element of list){
    var participants = await janusSession.listParticipants(element.room)
    console.log("participants:",participants)
      if(participants.length === 1){
          return element.room
      }
  }
}

function nextUserEnter(queue,connecting,io,room){
	console.log("The next user may enter, sending 'enter' message...")
	//check if queue[0] is/are connected
	var clientConnected = false
	while(!clientConnected){
		if(queue[0]){
			queue[0].forEach(user =>{
				if(user.socket !== null){
					clientConnected = true
				}
			})
			
			if(!clientConnected){
				queue.splice(0,1)
			}
		}
		else{
			return
		}
	}
	if(queue.length>0){		
		queue[0].forEach(user =>{
			io.to(user.socket.id).emit('enter',user.token,room)
			//Saving user in 'connecting' data structure
			connecting[user.username] = {
				room: room,
				token: user.token,
				socket: user.socket
			}
		})
		//Now I can remove this element from the queue
		queue.splice(0,1)
		//Send updates to every other user in the queue
		queue.forEach((queueElement,index) => {
			queueElement.forEach(user => {
				console.log("Sending 'updateQueue' to the users with position: ",index)
				io.to(user.socket.id).emit('updateQueue',index)
			})
		})
	}
}

function destroyRooms(janusSession){
	janusSession.listRooms()
	.then(list =>{
		list.forEach(element => {
			janusSession.destroyRoom(element.room);
		})
	})
}


const EventEmitter = require('events');
const commonEmitter = new EventEmitter();

exports.getSocket = getSocket;
exports.checkUser = checkUser;
exports.checkReservation = checkReservation;
exports.checkFreeRoom = checkFreeRoom;
exports.nextUserEnter = nextUserEnter;
exports.destroyRooms = destroyRooms;
exports.commonEmitter = commonEmitter;

import io from "socket.io-client";

var endpoint
if(process.env.NODE_ENV==='development'){
	endpoint = 'http://localhost:3001/';
}
else{
	endpoint = ''
}

export var socket = io(endpoint);

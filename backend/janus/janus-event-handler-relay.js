/*
This file is just for testing and developing in localhost environment using
also the features provided by the plugin Event Handler.
A simple Node.js app is published on Heroku and it has the task to relay all events
received from Janus to all sockets connected and authenticated.
Then, in localhost, a POST request has to be made to simulate the event coming directly from Janus.
*/
const io = require('socket.io-client');
const socket = io(process.env.EVENT_HANDLER_RELAY_URI)
const axios = require('axios');
const Helpers = require('../utils/helpers')
const commonEmitter = Helpers.commonEmitter

const janusRelay = () => {
	socket.emit('identify', process.env.EVENT_HANDLER_SECRET, process.env.JANUS_SERVER_NAME);

	socket.on('janusEvent',(body) => {
		console.log("[JANUS-EVENT-HANDLER-RELAY] Relay received a body of an event...Emitting event");

		if(body.event && body.event.data){
		  console.log("Well well")
		  console.log(body.event.data.event)
		  let data = body.event.data; //We suppose the plugin is 'janus.plugin.videoroom' because it's the only one we use (for now)
		  commonEmitter.emit(data.event,data);
		}	
	})
}

module.exports = janusRelay;
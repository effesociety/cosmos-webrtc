const axios = require('axios');

module.exports = class JanusSession{

  constructor(){
    //Just to clarify the data structure we will use
    this.sessionID = null;
    this.pluginID = null;
    this.rooms = null;
    this.createSession();
  }

  //Create a Janus Session and issue endless Long Poll request loop
  createSession(){
    axios.post(process.env.JANUS_HOSTNAME, {
      janus: 'create',
      transaction: Math.random().toString(36).substring(2),
      token: process.env.JANUS_TOKEN
    })
    .then(res => {
      console.log("Result from create Janus session request")
      console.log(res.data)
      this.sessionID = res.data.data.id
    })
    .then(() =>{
      console.log("Got SessionID:" + this.sessionID)
      this.longPollRequest()
      this.attachToPlugin()
    })
    .catch(error => {
      console.error(error)
    })
  }

  //Long Poll request, after the Promise is resolved it calls another Long Poll Request
  longPollRequest(){
    console.log("Long poll request")
    axios.get(process.env.JANUS_HOSTNAME+this.sessionID+"?rid="+new Date().getTime()+"&maxev=9999&token="+process.env.JANUS_TOKEN)
    /*.then(res => {
  		res.data.forEach(event => {
  			console.log(event)
  			if(event.plugindata != undefined && (event.plugindata.data.leaving != undefined || event.plugindata.data.unpublished != undefined)){
  				console.log("Someone left the room")
  			}
  		});
  	})*/
  	.then(() => this.longPollRequest())
    .catch(err => {
      console.log(err)
    })
  }
  //Attach to VideoRoom Plugin
  attachToPlugin(){
    console.log("Attaching to VideoRoom plugin")
    axios.post(process.env.JANUS_HOSTNAME+this.sessionID,{
      janus:"attach",
      transaction: Math.random().toString(36).substring(2),
      plugin:"janus.plugin.videoroom",
      opaque_id:"node_backend",
      token: process.env.JANUS_TOKEN
    })
    .then(res => {
      console.log("Result from Janus plugin attaching request")
      console.log(res.data)
      this.pluginID = res.data.data.id;
    })
    .catch(err => {
      console.log(err)
    })
  }

  listParticipants(room){
    console.log("Get a list of the participants in a specific room")
    return axios.post(process.env.JANUS_HOSTNAME+this.sessionID+'/'+this.pluginID,{
      janus: "message",
      transaction: Math.random().toString(36).substring(2),
      body: {
        request: "listparticipants",
        room: room,
      },
      token: process.env.JANUS_TOKEN
    })
    .then(res => {
      return res.data.plugindata.data.participants
      })
    .catch(err => {
      console.log(err)
    })
  }

  createRoom(){
    console.log("Create a new room")
    return axios.post(process.env.JANUS_HOSTNAME+this.sessionID+'/'+this.pluginID,{
      janus: "message",
      transaction: Math.random().toString(36).substring(2),
      body: {
        request: "create",
        room: Math.floor(Math.random()*10000),
        admin_key: process.env.JANUS_VIDEOROOM_KEY,
        max_publishers: 4,
        notify_joining: false,
        permanent: false,
        bitrate: 128000,
        fir_freq: 10
      },
      token: process.env.JANUS_TOKEN
    })
    .then(res => {
      console.log("Created room -",res.data.plugindata.data.room)
      return res.data.plugindata.data.room
    })
		.catch(err => {
			console.log("[ERROR] Room NOT created")
			console.log(err)
		})
  }

  destroyRoom(room){
    console.log("Destroy a room")
    axios.post(process.env.JANUS_HOSTNAME+this.sessionID+'/'+this.pluginID,{
      janus: "message",
      transaction: Math.random().toString(36).substring(2),
      body: {
        request: "destroy",
        room: room,
        admin_key: process.env.JANUS_VIDEOROOM_KEY,
        permanent: false
      },
      token: process.env.JANUS_TOKEN
    })
    .then(res => {
      //console.log(res.data)
      console.log("Destroyed room -",res.data.plugindata.data.room)
    })
  }

  listRooms(){
    console.log("List of available rooms")
    return axios.post(process.env.JANUS_HOSTNAME+this.sessionID+'/'+this.pluginID,{
      janus: "message",
      transaction: Math.random().toString(36).substring(2),
      body: {
        request: "list"
      },
      token: process.env.JANUS_TOKEN
    })
    .then(res => {
      //console.log(res.data.plugindata.data.list)
      return res.data.plugindata.data.list
    })
  }
}

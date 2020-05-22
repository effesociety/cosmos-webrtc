import React from 'react'
import { Janus } from 'janus-gateway';
import update from 'react-addons-update';
import CustomSnackbar from './CustomSnackbar'
import { Box } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import Videocam from '@material-ui/icons/Videocam';
import VideocamOff from '@material-ui/icons/VideocamOff';
import VolumeUp from '@material-ui/icons/VolumeUp';
import VolumeOff from '@material-ui/icons/VolumeOff';
import IconButton from '@material-ui/core/IconButton';

const styles = {
	largeVideoContainer: {
		position: "fixed",
		width: "100%",
		height: "100%",
		zIndex: "99",
		overflow: "hidden",
	},
	largeVideoBox: {
		minWidth: "100%",
		minHeight: "100%",
		position: "absolute",
		backgroundColor: "#272c34"
	},
	largeVideo: {
		minWidth: "100%",
		minHeight: "100%",
		position: "absolute",
		zIndex: "2"
	},
	smallVideoBox: {
		width: "267px",
		height: "150px",
		float: "left",
		backgroundColor: "#272c34",
		position: "relative",
		display: "flex",
		top: "calc(100% - 150px)",
		zIndex: "3"
	},
	displayLetterSmall: {
		width: "100%",
		position: "absolute",
		textTransform: "uppercase",
		textAlign: "center",
		zIndex: "1",
		color: "white"
	},
	displayLetterLarge: {
		width: "100%",
		position: "absolute",
		textTransform: "uppercase",
		textAlign: "center",
		zIndex: "1",
		color: "white",
		fontSize: "8rem",
		top: "calc(50% - 9rem)"
	},
	smallVideo:{
		zIndex: "2",
		width: "267px",
		height: "150px"
	},
	iconsContainerSmall: {
		width: "100%",
		textAlign: "center",
		position: "absolute",
		top:"70%",
		zIndex: "3"
	},
	iconsContainerLarge: {
		position: "absolute",
		top:"35px",
		left: "20px",
		zIndex: "3",
		fontSize: "3.3rem"
	},
	iconSmall: {
		backgroundColor: "rgb(0,0,0,0.8)",
		borderRadius: "100%",
		color: "white",
		fontSize: "2.2rem",
		margin: "0 7px",
		padding: "7px"
	},
	iconLarge: {
		backgroundColor: "rgb(0,0,0,0.8)",
		borderRadius: "100%",
		color: "white",
		fontSize: "3.2rem",
		margin: "0 7px",
		padding: "7px"
	},
	hide:{
		display: "none"
	},
	close:{
		position: "fixed",
		top: "20px",
		right: "20px",
		color: "rgb(255, 255, 255, 0.6)",
		zIndex: "100"
	}

}

var serverURI
if(process.env.REACT_APP_JANUS){
	serverURI = process.env.REACT_APP_JANUS
}
else{
	serverURI = "wss://janus.conf.meetecho.com/ws" //Change this as you please in development
}


class VideoRoom extends React.Component{
	constructor(props){
		super(props)
		this.state = ({
			server: "/janus",
			janus : null,
			sfutest : null,
			opaqueId : "videoroomtest-"+Janus.randomString(12),
			myroom: '',
			myusername : this.props.username,
			myid : null,
			mystream : null,
			mypvtid: null, //We use this other ID just to map our subscriptions to us
			feeds: [],
			bitrateTimer: [],
			//Now just some state for the snackbar
			openSnackbar: false,
			msgSnackbar: "",
			severitySnackbar: "", //choose between 'error', 'warning', 'info', 'success'

			//Fix for publishOwnFeed
			useAudio: undefined,

			//For the players (quote)
			activeCall: false,
			localFullscreen: false,
			publishVideo: true,
			publishAudio: true
		})

		//handlers for errors and warnings
		this.handleError = this.handleError.bind(this)
		this.handleWarning = this.handleWarning.bind(this)

		//handlers for new Janus()
		this.handleEnter = this.handleEnter.bind(this)
		this.handleCloseSnackbar = this.handleCloseSnackbar.bind(this)
		this.createSession = this.createSession.bind(this)
		this.pluginAttach = this.pluginAttach.bind(this)
		this.handleSessionDestroyed = this.handleSessionDestroyed.bind(this)
		//handlers for janus.attach
		this.handleAttachSuccess = this.handleAttachSuccess.bind(this)
		this.handleConsentDialog = this.handleConsentDialog.bind(this)
		this.handleMediaState = this.handleMediaState.bind(this)
		this.handleWebRTCState = this.handleWebRTCState.bind(this)
		this.handleOnMessage = this.handleOnMessage.bind(this)
		this.handleOnLocalStream = this.handleOnLocalStream.bind(this)
		this.handleOnCleanup = this.handleOnCleanup.bind(this)

		//handlers for utils functions
		this.registerUsername = this.registerUsername.bind(this)
		this.publishOwnFeed = this.publishOwnFeed.bind(this)
		this.unpublishOwnFeed = this.unpublishOwnFeed.bind(this)
		this.newRemoteFeed = this.newRemoteFeed.bind(this)

		//Cannot use this.satate.sfutest.send inside this.state.sfutest.createOffer
		this.handleCreateOfferSuccess = this.handleCreateOfferSuccess.bind(this)
		this.handleCreateOfferError = this.handleCreateOfferError.bind(this)

		//To close video call
		this.handleClickClose = this.handleClickClose.bind(this)

		//Fegatelli
		this.configureAudio = this.configureAudio.bind(this)
		this.configureVideo = this.configureVideo.bind(this)
		this.configureRemoteAudio = this.configureRemoteAudio.bind(this)
		this.configureRemoteVideo = this.configureRemoteVideo.bind(this)
		this.handleChangeFullVideo = this.handleChangeFullVideo.bind(this)
	}

	componentDidMount(){
		this.props.socket.on('enter',this.handleEnter)
	}

	handleCloseSnackbar(){
		this.setState({
			openSnackbar: false,
			msgSnackbar: "",
			severitySnackbar: ""
		})
	}

	handleEnter(janusToken,room){
		Janus.init({debug:'all',callback: () => {
			console.log("I got a token")
			console.log(janusToken)
			if(!Janus.isWebrtcSupported()){
				//Opening snackbar
				this.setState({
					openSnackbar: true,
					msgSnackbar: "No WebRTC support",
					severitySnackbar: "error"
				})
			}
			else{
				this.setState({
					myroom: room
				})
				this.createSession(janusToken)
			}
		}})
	}

	createSession(janusToken){	
		console.log("Creating Janus session")
		this.setState({
			janus: new Janus({
					server: this.state.server,
					token: janusToken,
					success: this.pluginAttach,
					error: this.handleError,
					destroyed: this.handleSessionDestroyed
			})
		})
	}

	pluginAttach(){
		console.log("Executing plugin attach")
		this.state.janus.attach({
				plugin: "janus.plugin.videoroom",
				opaqueId: this.state.opaqueId,
				success: this.handleAttachSuccess,
				error: () => {
						this.handleError("You need to press 'Allow' in order to use Cosmos")
				},
				consentDialog: this.handleConsentDialog,
				mediaState: this.handleMediaState,
				webrtcState: this.handleWebRTCState,
				onmessage: this.handleOnMessage,
				onlocalstream: this.handleOnLocalStream,
				onremotestream: stream => {
					//The publisher is sendonly, we don't expect anything here
				},
				oncleanup: this.handleOnCleanup
		})
	}

	handleError(error){
		//Janus.error(error)
		console.log(error)
		//Opening snackbar
		this.setState({
			openSnackbar: true,
			msgSnackbar: error,
			severitySnackbar: "error"
		})
	}

	handleWarning(warning){
		//Opening snackbar
		this.setState({
			openSnackbar: true,
			msgSnackbar: warning,
			severitySnackbar: "warning"
		})
	}

	handleSessionDestroyed(){
		/*
		this.setState({
			activeCall: false
		})
		this.props.handleToggleScroll()
		this.state.sfutest.hangup()
		*/
		window.location.reload();
	}

	handleAttachSuccess(pluginHandle){
			//Mostro il player
			this.setState({
				sfutest: pluginHandle
			})

			Janus.log("Plugin attached! (" + this.state.sfutest.getPlugin() + ", id = " + this.state.sfutest.getId() + ")")
			Janus.log(" -- This is a publisher/manager -- ")
			//We have to register the username
			this.registerUsername()
	}

	handleConsentDialog(on){
		Janus.debug("Consent dialog should be " + (on ? "on" : "off") + " now");
		//They darken the screen
	}

	handleMediaState(medium, on){
		Janus.log("Janus " + (on ? "started" : "stopped") + " receiving our " + medium);
	}

	handleWebRTCState(on){
		Janus.log("Janus says our WebRTC PeerConnection is " + (on ? "up" : "down") + "now")
		if(!on)
			return

		//add some code to let the user cap the bandwidth
		if(this.state.bitrate === 0){
			Janus.log("Not limiting bandwidth via REMB")
		}
		else{
			Janus.log("Capping bandwidth to " + this.state.bitrate + " via REMB");
		}
		//sfutest.send({message: {request: "configure, bitrate: bitrate}})
		return false
	}

	handleOnMessage(msg, jsep){
		Janus.debug(" ::: Got a message (publisher) :::")
		Janus.debug(msg)
		let event = msg["videoroom"]
		Janus.debug("Event:" + event)

		if(event !== undefined && event !== null){
			if(event==='joined'){
				//Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
				this.setState({
					myid: msg["id"],
					mypvtid: msg["private_id"],
				})
				Janus.log("Successfully joined room " + msg["room"] + " with ID " + this.state.myid)
				this.props.socket.emit('joined',this.state.myid)
				this.publishOwnFeed(true)
				//Any new feed to attach to?
				if(msg["publishers"] !== undefined && msg["publishers"] !== null){
					let list = msg["publishers"]
					Janus.debug("Got a list of available publishers/feeds:")
					Janus.debug(list)
					list.forEach((item,i) => {
						let id = list[i]["id"]
						let display = list[i]["display"]
						let audio = list[i]["audio_codec"]
						let video = list[i]["video_codec"]
						Janus.debug(" >>[" + id + "] " + display + "(audio: " + audio + ", video: " + video + ")")
						this.newRemoteFeed(id,display,audio,video)
					})
				}
			}
			else if(event === 'destroyed'){
				//The room has been destroyed
				Janus.warn("The room ha been destroyed")
				this.handleError("The room has been destroyed")
				//TO-DO: remove video player or reload page
			}
			else if(event === 'event'){
				//Any new feed to attach to?
				if(msg["publishers"] !== undefined && msg["publishers"] !== null){
					let list = msg["publishers"]
					Janus.debug("Got a list of available publishers/feeds:")
					Janus.debug(list)
					list.forEach((item,i) => {
						let id = list[i]["id"]
						let display = list[i]["display"]
						let audio = list[i]["audio_codec"]
						let video = list[i]["video_codec"]
						Janus.debug(" >>[" + id + "] " + display + "(audio: " + audio + ", video: " + video + ")")
						this.newRemoteFeed(id,display,audio,video)
					})
				}
				else if(msg["leaving"] !== undefined && msg["leaving"] !== null){
					//One of the publishers has gone away?
					let leaving = msg["leaving"]
					Janus.log("Publisher left: " + leaving)
					let remoteFeed = null
					for(let i=0; i<42; i++){
						if(this.state.feeds[i] !== null && this.state.feeds[i] !== undefined && this.state.feeds[i].rfid === leaving){
							remoteFeed = this.state.feeds[i]
							break
						}
					}
					if(remoteFeed !== null){
						Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching")
						//TO-DO appendere il suo div
						this.setState(update(this.state,{
							feeds: {
								[remoteFeed.rfindex]: {
									$set: null
								}
							}
						}))
						//Do not mutate state directly
						//this.state.feeds[remoteFeed.rfindex] = null
						remoteFeed.detach()
					}
				}
				else if(msg["unpublished"] !== undefined && msg["unpublished"] !== null){
					//One of the publishers has unpublished?
					var unpublished = msg["unpublished"]
					Janus.log("Publisher left: " + unpublished)
					if(unpublished === "ok"){
						//That's us
						this.state.sfutest.hangup()
						return
					}
					var remoteFeed = null
					for(let i=0; i<42; i++){
						if(this.state.feeds[i] !== null && this.state.feeds[i] !== undefined && this.state.feeds[i].rfid === unpublished){
							remoteFeed = this.state.feeds[i]
							break
						}
					}
					if(remoteFeed != null){
						Janus.debug("Feed " + remoteFeed.rfid + " (" + remoteFeed.rfdisplay + ") has left the room, detaching")
						//TO-DO appendere il suo div
						this.setState(update(this.state,{
							feeds: {
								[remoteFeed.rfindex]: {
									$set: null
								}
							}
						}))
						//Do not mutate state directly
						//this.state.feeds[remoteFeed.rfindex] = null
						remoteFeed.detach()
					}
				}
				else if(msg["error"] !== undefined && msg["error"] !== null){
					if(msg["error_code"] === 426){
						//This is a "no such room" error
						this.handleError("There has been an error")//TO-DO: give a better description
					}
					else{
						this.handleError(msg["error"])
					}
				}
			}
		}

		if(jsep !== undefined && jsep !== null){
			Janus.debug("Handling SDP as well...")
			Janus.debug(jsep)
			this.state.sfutest.handleRemoteJsep({jsep: jsep})
			//Check if any of the media we wante to publish
			//has been rejected (e.g. wrong or unsupported codec)
			var audio = msg["audio_codec"]
			if(this.state.mystream && this.state.mystream.getAudioTracks() && this.state.mystream.getAudioTracks().length > 0 && !audio){
				//Audio has been rejected
				this.handleWarning("Our audio stream has been rejected, viewers wont' hear us")
			}
			var video = msg["video_codec"]
			if(this.state.mystream && this.state.mystream.getVideoTracks() && this.state.mystream.getVideoTracks().length > 0 && !video)
			//Video has been rejected
			this.handleWarning("Our video stream has been rejected, viewers won't see us")
			//TO-DO: hide my on video camera
		}
	}

	handleOnLocalStream(stream){
		Janus.debug(" ::: Got a local stream :::")
		this.setState({
			mystream: stream,
			activeCall: true
		})
		this.props.handleToggleScroll()
		Janus.debug(stream)
		//TO-DO: Binding tra il div e lo stream
		//Usare la funzione Janus.attachMediaStream (e.g. Janus.attachMediaStream($('#myvideo').get(0),stream))
		Janus.attachMediaStream(document.getElementById('myvideo'),stream)
		//fare anche il binding co tutti i belli bottoncini eccetera

		if(this.state.sfutest.webrtcStuff.pc.iceConnectionState !== "completed" && this.state.sfutest.webrtcStuff.pc.iceConnectionState !== "connected"){
					//TO-DO: mostrare la scritta "Publishing"
		}
		var videoTracks = stream.getVideoTracks()
		if(videoTracks === null || videoTracks === undefined || videoTracks.length === 0){
			//No webcam
			//TO-DO: Non mostrare il mio riguadro perchè non ho la webcam
		}
	}

	handleOnCleanup(){
		Janus.log(" ::: Got a cleanup notification: we are unpublished now :::")
		this.setState({
			mystream: null
		})
	}

	registerUsername(){
		var register = {
			request: "join",
			room: this.state.myroom,
			ptype: "publisher",
			display: this.props.username
		}
		this.state.sfutest.send({
			message: register
		})
	}

	publishOwnFeed(useAudio){
		//Publish our stream
		this.setState({
			useAudio: useAudio
		})
		this.state.sfutest.createOffer({
			media: {audioRecv: false, videoRecv: false, audioSend: this.state.useAudio, videoSend: true}, //Publishers are sendonly
			success: this.handleCreateOfferSuccess,
			error : this.handleCreateOfferError
		})
	}

	handleCreateOfferSuccess(jsep){
		Janus.debug("Got publisher SDP")
		Janus.debug(jsep)
		let publish = {request: "configure", audio: this.state.useAudio, video: true}
		//You can also force a codec --> publish["audiocodec"]="opus" OR publish["videocodec"]="vp9"
		this.state.sfutest.send({message: publish, jsep : jsep})
	}

	handleCreateOfferError(error){
		Janus.error("WebRTC error:", error)
		console.log(error)
		if(this.state.useAudio){
			this.publishOwnFeed(false)
		}
		else{
			this.setState({
				useAudio: undefined
			})
			this.handleError("WebRTC error")
		}
	}

	configureAudio(audio){
		Janus.log((audio ? "Unmuting" : "Muting") + " local stream...")
		if(audio)
			this.state.sfutest.unmuteAudio()
		else
			this.state.sfutest.muteAudio()

		this.setState({
			publishAudio: audio
		})
	}

	configureVideo(video){
		Janus.log((video ? "Unmuting" : "Muting") + " local stream...")
		if(video)
			this.state.sfutest.unmuteVideo()
		else
			this.state.sfutest.muteVideo()

		this.setState({
			publishVideo: video
		})
	}

	configureRemoteAudio(index,audio){
		var configure = {request: "configure", audio: audio}
		this.state.feeds[index].send({message: configure})

		this.setState(update(this.state,{
			feeds: {
				[index]: {
					isAudioActive: {
						$set: audio
					}
				}
			}
		}))
	}

	configureRemoteVideo(index,video){
		var configure = {request: "configure", video: video}
		this.state.feeds[index].send({message: configure})

		this.setState(update(this.state,{
			feeds: {
				[index]: {
					isVideoActive: {
						$set: video
					}
				}
			}
		}))
	}

	unpublishOwnFeed(){
		//unpublish our stream
		var unpublish = {request: "unpublish"}
		this.state.sfutest.send({message: unpublish})
	}

	newRemoteFeed(id,display,audio,video){
		//A new feed has been published, create a new plugin handle and attach to it as a subscriber
		var remoteFeed = null
		this.state.janus.attach({
			plugin: "janus.plugin.videoroom",
			success: pluginHandle => {
				remoteFeed = pluginHandle
				remoteFeed.simulcastStarted = false
				Janus.log("Plugin attached! (" + remoteFeed.getPlugin() + ", id =" + remoteFeed.getId() + ")")
				Janus.log(" -- This is a subscriber --")
				//We wait for the plugin to send us an offer
				var subscribe = {request: "join", room: this.state.myroom, ptype: "subscriber", feed:id, privat_id: this.state.mypvtid}
				//To disable audio or video just use subscribe["offer_video"] = false
				//For example if the publisher is VP8 and this is Safari, let's avoid video
				if(Janus.webRTCAdapter.browserDetails.browser === 'safari' && (video === 'vp9' || (video === 'vp8' && !Janus.safariVp8))){
					if(video){
						video = video.toUppercase()
					}
					this.handleWarning("Publisher is using " + video + ", but Safari doesn't support it: disabling video")
					subscribe["offer_video"] = false
				}
				remoteFeed.videoCodec = video
				remoteFeed.send({message: subscribe})
			},
			error: this.handleError,
			onmessage: (msg, jsep) => {
				Janus.debug("::: Got a message (subscriber) :::")
				Janus.debug(msg)
				var event = msg["videoroom"]
				Janus.debug("Event:" + event)
				if(msg["error"] !== undefined && msg["error"] !== null){
					this.handleWarning(msg["error"])
				}
				else if(event !== undefined && event !== null){
					if(event === "attached"){
						console.log(" ::: SUBSCRIBER CREATED AND ATTACHED :::")
						//Subscriber created and attached
						for(let i=0; i<42; i++){
							if(this.state.feeds[i] === undefined || this.state.feeds[i] === null){
								this.setState(update(this.state,{
									feeds: {
										[i]: {
											$set: remoteFeed
										}
									}
								}))
								remoteFeed.rfindex = i
								break
							}
						}
						remoteFeed.rfid = msg["id"]
						remoteFeed.rfdisplay = msg["display"]
						Janus.log("Successfully attached to feed " + remoteFeed.rfid + "(" + remoteFeed.rfdisplay + ") in room " + msg["room"])
					}
					else{
						console.log(event)
						//What has just happened?
					}
				}

				if(jsep !== undefined && jsep !== null){
					Janus.debug("Handling SDP as well...")
					Janus.debug(jsep)
					//Answer and attach
					remoteFeed.createAnswer({
						jsep: jsep,
						media: {audioSend: false, videoSend: false}, //we want recvonly audio/video
						success: jsep => {
							Janus.debug("Got SDP!")
							Janus.debug(jsep)
							let body = {request: "start", room: this.state.myroom}
							remoteFeed.send({message: body, jsep: jsep})
						},
						error: error => {
							Janus.error("WebRTC error", error)
							this.handleError("WebRTC error..." + JSON.stringify(error))
						}
					})
				}
			},
			webrtcState: on => {
				Janus.log("Janus says this WebRTC PeerConnection (feed #" + remoteFeed.rfindex + ") is " + (on ? "up" : "down") + " now")
			},
			onlocalstream: stream => {
				//The subscriber stream is recvonly, we don't expect anything here
			},
			onremotestream: stream => {
				console.log("****************PRINTING ONREMOTESTREAM NEW REMOTE FEED***************************")
				Janus.debug("Remote feed # " +  remoteFeed.rfindex)
				//TO-DO: mostrare il video nel riquadro
				//effettuare l'attach in un <div> --> Janus.attachMediaStream(div,stream)
				Janus.attachMediaStream(document.getElementById('remote-'+remoteFeed.rfindex),stream)
				//document.getElementById('remote-'+remoteFeed.rfindex).srcObject = stream
			},
			oncleanup: () => {
				Janus.log("::: Got a cleanup notification (remote feed " + id + ") :::")
				if(remoteFeed.spinner !== undefined && remoteFeed.spinner !== null){
					remoteFeed.spinner.stop()
				}
				remoteFeed.spinner = null
				//TO-DO: rimuovere il riquadro del remote feed
				if(this.state.bitrateTimer[remoteFeed.rfindex] !== null && this.state.bitrateTimer[remoteFeed.rfindex] !== null){
					clearInterval(this.state.bitrateTimer[remoteFeed.rfindex])
				}
				this.setState(update(this.state,{
					bitrateTimer: {
						[remoteFeed.rfindex]: {
							$set: null
						}
					}
				}))
				remoteFeed.simulcastStarted = false
			}
		})
	}

	handleClickClose(){
		this.state.janus.destroy()
	}

	handleChangeFullVideo(index){
		if(index === -1){
			this.setState({
				localFullscreen: true
			})
			for(let i=0; i<this.state.feeds.length; i++){
				if(this.state.feeds[i] !== null && this.state.feeds[i] !== undefined && this.state.feeds[i].isFullScreen){
					this.setState(update(this.state,{
						feeds: {
							[i]: {
								isFullScreen: {
									$set: false
								}
							}
						}
					}))
					break
				}
			}
		}
		else{
			this.setState(update(this.state,{
				localFullscreen: {
					$set: false
				},
				feeds: {
					[index]: {
						isFullScreen: {
							$set: true
						}
					}
				}
			}))
		}
	}

	render(){

		//To hide or not to hide
		var videoroom
		if(this.state.activeCall){
			videoroom = styles.largeVideoContainer
		}
		else{
			videoroom = styles.hide
		}

		//Define local stream styles
		var localStream = {}
		//Setting up remotes stream styles
		var maxUsers = 4
		var remoteStream = []

		var fullScreenIndex = -1
		var backupFullScreenIndex = -1
		var activeFeeds = 0

		//Find index for fullscreen remote box
		for(let i=0;i<this.state.feeds.length; i++){
			if(this.state.feeds[i] !== null && this.state.feeds[i].isFullScreen !== undefined && this.state.feeds[i].isFullScreen === true){
				fullScreenIndex = i
			}
			if(this.state.feeds[i] !== null && backupFullScreenIndex===-1){
				backupFullScreenIndex = i
			}
			if(this.state.feeds[i] !== null && this.state.feeds[i] !== undefined){
				activeFeeds += 1
			}
		}

		var index = Math.max(fullScreenIndex,backupFullScreenIndex)


		if(this.state.localFullscreen || activeFeeds === 0){
			localStream = {
				boxStyle: styles.largeVideoBox,
				videoStyle: styles.largeVideo,
				iconContainerStyle: styles.iconsContainerLarge,
				displayLetterStyle: styles.displayLetterLarge
			}
			if(this.state.publishAudio){
				localStream['volume'] = (<VolumeUp style={styles.iconLarge} onClick={() => {this.configureAudio(false)}}/>)
			}
			else{
				localStream['volume'] = (<VolumeOff style={styles.iconLarge} onClick={() => {this.configureAudio(true)}}/>)
			}

			if(this.state.publishVideo){
				localStream['cam'] = (<Videocam style={styles.iconLarge} onClick={() => {this.configureVideo(false)}}/>)
			}
			else{
				localStream['cam'] = (<VideocamOff style={styles.iconLarge} onClick={() => {this.configureVideo(true)}}/>)
				localStream['videoStyle'] = styles.hide
			}

			if(this.props.username){
				localStream['username'] = this.props.username.substr(0,1)
			}
			else{
				localStream['username'] = ""
			}
		}
		else{
			localStream = {
				boxStyle: styles.smallVideoBox,
				videoStyle: styles.smallVideo,
				iconContainerStyle: styles.iconsContainerSmall,
				displayLetterStyle: styles.displayLetterSmall
			}
			if(this.state.publishAudio){
				localStream['volume'] = (<VolumeUp style={styles.iconSmall} onClick={() => {this.configureAudio(false)}}/>)
			}
			else{
				localStream['volume'] = (<VolumeOff style={styles.iconSmall} onClick={() => {this.configureAudio(true)}}/>)
			}

			if(this.state.publishVideo){
				localStream['cam'] = (<Videocam style={styles.iconSmall} onClick={() => {this.configureVideo(false)}}/>)
			}
			else{
				localStream['cam'] = (<VideocamOff style={styles.iconSmall} onClick={() => {this.configureVideo(true)}}/>)
				localStream['videoStyle'] = styles.hide
			}

			if(this.props.username){
				localStream['username'] = this.props.username.substr(0,1)
			}
			else{
				localStream['username'] = ""
			}
		}

		//Define styles for active feeds
		for(let i=0;i<maxUsers; i++){
			if(i===index && !this.state.localFullscreen){
				remoteStream[i] = {
					boxStyle: styles.largeVideoBox,
					videoStyle: styles.largeVideo,
					iconContainerStyle: styles.iconsContainerLarge,
					displayLetterStyle: styles.displayLetterLarge,
				}
				if(this.state.feeds[i].isAudioActive === undefined || this.state.feeds[i].isAudioActive === true){
					remoteStream[i]['volume'] = (<VolumeUp style={styles.iconLarge} onClick={() => {this.configureRemoteAudio(i,false)}}/>)
				}
				else{
					remoteStream[i]['volume'] = (<VolumeOff style={styles.iconLarge} onClick={() => {this.configureRemoteAudio(i,true)}}/>)
				}
				//Define Volume Icon
				if(this.state.feeds[i].isVideoActive === undefined || this.state.feeds[i].isVideoActive === true){
					remoteStream[i]['cam'] = (<Videocam style={styles.iconLarge} onClick={() => {this.configureRemoteVideo(i,false)}}/>)
				}
				else{
					remoteStream[i]['cam'] = (<VideocamOff style={styles.iconLarge} onClick={() => {this.configureRemoteVideo(i,true)}}/>)
					remoteStream[i]['videoStyle'] = styles.hide
				}

				if(this.state.feeds[i].rfdisplay){
					remoteStream[i]['username'] = this.state.feeds[i].rfdisplay.substr(0,1)
				}
				else{
					remoteStream[i]['username'] = ""
				}
			}
			else if(this.state.feeds[i] !== undefined && this.state.feeds[i] !== null){
				remoteStream[i] = {
					boxStyle: styles.smallVideoBox,
					videoStyle: styles.smallVideo,
					iconContainerStyle: styles.iconsContainerSmall,
					displayLetterStyle: styles.displayLetterSmall,
				}
				if(this.state.feeds[i].isAudioActive === undefined || this.state.feeds[i].isAudioActive === true){
					remoteStream[i]['volume'] = (<VolumeUp style={styles.iconSmall} onClick={() => {this.configureRemoteAudio(i,false)}}/>)
				}
				else{
					remoteStream[i]['volume'] = (<VolumeOff style={styles.iconSmall} onClick={() => {this.configureRemoteAudio(i,true)}}/>)
				}
				//Define Volume Icon
				if(this.state.feeds[i].isVideoActive === undefined || this.state.feeds[i].isVideoActive === true){
					remoteStream[i]['cam'] = (<Videocam style={styles.iconSmall} onClick={() => {this.configureRemoteVideo(i,false)}}/>)
				}
				else{
					remoteStream[i]['cam'] = (<VideocamOff style={styles.iconSmall} onClick={() => {this.configureRemoteVideo(i,true)}}/>)
					remoteStream[i]['videoStyle'] = styles.hide
				}

				if(this.state.feeds[i].rfdisplay){
					remoteStream[i]['username'] = this.state.feeds[i].rfdisplay.substr(0,1)
				}
				else{
					remoteStream[i]['username'] = ""
				}
			}
			else{
				remoteStream[i] = {
					boxStyle: styles.hide,
					videoStyle: styles.hide,
					iconContainerStyle: styles.iconsContainerSmall,
					displayLetterStyle: styles.displayLetterSmall,
					username: "",
					volume: (<VolumeUp style={styles.iconSmall} onClick={() => {this.configureRemoteAudio(i,false)}}/>),
					cam: (<Videocam style={styles.iconSmall} onClick={() => {this.configureRemoteVideo(i,false)}}/>)
				}
			}
		}

		return(
			<Box>
				<CustomSnackbar open={this.state.openSnackbar} msg={this.state.msgSnackbar} severity={this.state.severitySnackbar} closeSnackbar={this.handleCloseSnackbar}/>
				<div style={videoroom}>
					<IconButton aria-label="close" color="primary" style={styles.close} onClick={this.handleClickClose}>
						<CloseIcon style={{fontSize:"4rem"}}/>
					</IconButton>

					<div style={localStream['boxStyle']}>
						<h1 style={localStream['displayLetterStyle']}>{localStream['username']}</h1>
						<video id="myvideo" style={localStream['videoStyle']} autoPlay playsInline muted="muted" onClick={() => {this.handleChangeFullVideo(-1)}}/>
						<div style={localStream['iconContainerStyle']}>
							{localStream['volume']}
							{localStream['cam']}
						</div>
					</div>

					<div style={remoteStream[0]['boxStyle']}>
						<h1 style={remoteStream[0]['displayLetterStyle']}>{remoteStream[0]['username']}</h1>
						<video style={remoteStream[0]['videoStyle']} id="remote-0" autoPlay playsInline onClick={() => {this.handleChangeFullVideo(0)}}/>
						<div style={remoteStream[0]['iconContainerStyle']}>
							{remoteStream[0]['volume']}
							{remoteStream[0]['cam']}
						</div>
					</div>

					<div style={remoteStream[1]['boxStyle']}>
						<h1 style={remoteStream[1]['displayLetterStyle']}>{remoteStream[1]['username']}</h1>
						<video style={remoteStream[1]['videoStyle']} id="remote-1" autoPlay playsInline onClick={() => {this.handleChangeFullVideo(1)}}/>
						<div style={remoteStream[1]['iconContainerStyle']}>
							{remoteStream[1]['volume']}
							{remoteStream[1]['cam']}
						</div>
					</div>

					<div style={remoteStream[2]['boxStyle']}>
						<h1 style={remoteStream[2]['displayLetterStyle']}>{remoteStream[2]['username']}</h1>
						<video style={remoteStream[2]['videoStyle']} id="remote-2" autoPlay playsInline onClick={() => {this.handleChangeFullVideo(2)}}/>
						<div style={remoteStream[2]['iconContainerStyle']}>
							{remoteStream[2]['volume']}
							{remoteStream[2]['cam']}
						</div>
					</div>

					<div style={remoteStream[3]['boxStyle']}>
						<h1 style={remoteStream[3]['displayLetterStyle']}>{remoteStream[3]['username']}</h1>
						<video style={remoteStream[3]['videoStyle']} id="remote-3" autoPlay playsInline onClick={() => {this.handleChangeFullVideo(3)}}/>
						<div style={remoteStream[3]['iconContainerStyle']}>
							{remoteStream[3]['volume']}
							{remoteStream[3]['cam']}
						</div>
					</div>
				</div>
			</Box>
		)
	}


}

export default VideoRoom

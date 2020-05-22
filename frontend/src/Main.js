import React from 'react'
import { Box, Container, Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import OfficeHours from './resources/office-hours.jpg'
import PanToolIcon from '@material-ui/icons/PanTool';
import ThumbUpAltIcon from '@material-ui/icons/ThumbUpAlt';
import PersonalVideoIcon from '@material-ui/icons/PersonalVideo';
import SupervisorAccountIcon from '@material-ui/icons/SupervisorAccount';
import PowerOffIcon from '@material-ui/icons/PowerOff';

const styles = {
  officeHoursImg:{
    width: "100%",
    borderRadius: "10px"
  },
  queueBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%"
  }
};

class Main extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      queueStatus: 'empty',
    }
    this.handleQueueStatus = this.handleQueueStatus.bind(this);
    this.enqueue = this.enqueue.bind(this)
    this.handleEnqueueCompleted = this.handleEnqueueCompleted.bind(this)
    this.handleUpdateQueue = this.handleUpdateQueue.bind(this)
    this.handleEnter = this.handleEnter.bind(this)
    this.hostRoom = this.hostRoom.bind(this)
    this.enableCosmos = this.enableCosmos.bind(this)
    this.disableCosmos = this.disableCosmos.bind(this)
		
		this.helloFriend = React.createRef()
  }

  componentDidMount(){
    this.props.socket.on('queueStatus',this.handleQueueStatus)
    this.props.socket.on('enqueueCompleted',this.handleEnqueueCompleted)//Define what happens when the Enqueue is completed
    this.props.socket.on('updateQueue',this.handleUpdateQueue)//Define what happens when the Queue changes (e.g. a user leaves the room)
    this.props.socket.on('enter',this.handleEnter)//Define what happens when the Queue changes (e.g. a user leaves the room)
  }

  handleEnter(janusToken){
    console.log("*****Received 'enter' message from backend***********")
    this.setState({
      janusToken: janusToken
    })
  }

  handleQueueStatus(queueStatus) {
    console.log("*****EXECUTING handleQueueStatus************")
    console.log("[DEBUG] Got queueStatus: ",queueStatus)
    this.setState({
      queueStatus: queueStatus
    })
  }

  //Define what happens when the Queue number changes
  handleUpdateQueue(queueNumber){
    console.log("*****EXECUTING updateQueue handler************")
    console.log("[DEBUG] Received 'updateQueue' message with reservation position: ",queueNumber)
    this.setState({
      queueNumber: queueNumber
    })
  }

  //Define what happens when the 'enqueue' is completed
  handleEnqueueCompleted(queueNumber){
    console.log("*****EXECUTING enqueueCompleted handler************")
    console.log("[DEBUG] Received 'enqueueCompleted' message with reservation position: ",queueNumber)
    this.setState({
      queueNumber: queueNumber
    })
  }

  enqueue(){
		const friend = this.helloFriend.current.value;
		if(friend.length>0){
			console.log("There is a friend: ",friend)
			this.props.socket.emit('enqueue',friend)			
    }
		else{
			console.log("I feel so lonely")
			this.props.socket.emit('enqueue')
		}
		
		console.log("'enqueue' emitted")
  }

  hostRoom(){
    const username = this.props.username || ""
    const role = this.props.role || ""
    this.props.socket.emit('createRoom',username,role)
    console.log("'createRoom' emitted")
  }
  
  enableCosmos(){
	this.props.socket.emit('changeCosmosStatus','enable')
	console.log("changeCosmosStatus with enable payload emitted")  
  }
  
  disableCosmos(){
	this.props.socket.emit('changeCosmosStatus','disable')
	console.log("changeCosmosStatus with disable payload emitted")  	
  }



  render(){
    var queueTxt;
    var janusToken = this.state.janusToken ? this.state.janusToken : ""

    //if not logged
    if(this.props.status === 'anonymous'){
      console.log("[DEBUG] Status not logged")
      queueTxt = (
        <Box style={styles.queueBox}>
          <Box>
            <Typography variant="body1">
              In order to try out this demo you have to login first. We already provided
              a couple of users that you may use (<i>username</i> - <i>password</i>).<br/>
            </Typography>
            <Typography variant="body1" align="center">
              With <strong>Admin privileges</strong>:
            </Typography>
            <ul style={{textAlign:"center"}}>
              <li>elliot - alderson</li>
            </ul>
            <Typography variant="body1" align="center">
              With <strong>Employee privileges</strong>:
            </Typography>
            <ul style={{textAlign:"center"}}>
              <li>tyrell - wellick</li>
              <li>darlene - alderson</li>
            </ul>
            <Typography variant="body1" align="center">
              With <strong>User privileges</strong>:
            </Typography>
            <ul style={{textAlign:"center"}}>
              <li>angela - moss</li>
              <li>joanna - wellick</li>
              <li>dominique - dipierro</li>
              <li>krista - gordon</li>
            </ul>
          </Box>
        </Box>
      )
    }

	//if logged as an admin and Cosmos is disabled
	else if(this.props.status === 'logged' && this.props.role !== undefined && this.props.role === 'admin' && this.props.cosmos === 'disabled'){
      queueTxt = (
        <Box style={styles.queueBox}>
          <Box align="center">
            <PowerOffIcon style={{fontSize:"4.5rem",marginBottom:"1.5rem"}}/>
            <Typography variant="h4" align="center" gutterBottom paragraph>
              We're closed now... But you are an admin and you can
            </Typography>		
            <Button variant="contained" color="secondary" onClick={this.enableCosmos}>
              Enable Cosmos
            </Button>				
          </Box>
        </Box>
      )				
	}
	
	//if logged as an admin and Cosmos is enabled
	else if(this.props.status === 'logged' && this.props.role !== undefined && this.props.role === 'admin' && this.props.cosmos === 'enabled'){
      queueTxt = (
        <Box style={styles.queueBox}>
          <Box align="center">
            <SupervisorAccountIcon style={{fontSize:"4.5rem",marginBottom:"1.5rem"}}/>
            <Typography variant="h4" align="center" gutterBottom paragraph>
              As an admin you can
            </Typography>
            <Button variant="contained" color="secondary" onClick={this.hostRoom}>
              Host a room
            </Button>
            <Typography variant="h4" align="center" gutterBottom paragraph>
              But you can also
            </Typography>
            <Button variant="contained" color="secondary" onClick={this.disableCosmos}>
              Disable Cosmos
            </Button>			
          </Box>
        </Box>
      )		
	}
	
	//if logged NOT as an admin and Cosmos is disabled
	else if(this.props.status === 'logged' && this.props.role !== undefined && this.props.role !== 'admin' && this.props.cosmos === 'disabled'){
      queueTxt = (
        <Box style={styles.queueBox}>
          <Box align="center">
            <PowerOffIcon style={{fontSize:"4.5rem",marginBottom:"1.5rem"}}/>
            <Typography variant="h4" align="center" gutterBottom paragraph>
              We're closed now!
            </Typography>		
          </Box>
        </Box>
      )				
	}
	
    //if logged as an employee and Cosmos is enabled
    else if(this.props.status === 'logged' && this.props.role !== undefined && this.props.role === 'employee' && this.props.cosmos === 'enabled'){
      queueTxt = (
        <Box style={styles.queueBox}>
          <Box align="center">
            <PersonalVideoIcon style={{fontSize:"4.5rem",marginBottom:"1.5rem"}}/>
            <Typography variant="h4" align="center" gutterBottom paragraph>
              Hello dear, probably it's time to...
            </Typography>
            <Button variant="contained" color="secondary" onClick={this.hostRoom}>
              Host a room
            </Button>
          </Box>
        </Box>
      )
    }

    //if logged and queueNumber is set (user enqueued)
    else if(this.props.status === 'logged' && this.state.queueNumber !== undefined && this.props.cosmos === 'enabled'){
      console.log("[DEBUG] Status logged")
      console.log("[DEBUG] 'queueNumber is set'")
      //This code is just to deal with singular/plurals
      var queueLenTxt
      //Just to show a more friendly message before the Janus connection is made
      if(this.state.queueNumber===0){
        queueLenTxt = (
          <Typography variant="body1">
            You are the next!<br/>
          </Typography>
        )
      }
      else if(this.state.queueNumber===1){
        queueLenTxt = (
          <Typography variant="body1">
          <Box display="inline" fontSize="4rem">{this.state.queueNumber}</Box>
          <Box> person ahead of you</Box>
          </Typography>
        )
      }
      else{
        queueLenTxt = (
          <Typography variant="body1">
          <Box display="inline" fontSize="4rem">{this.state.queueNumber}</Box>
          <Box> people ahead of you</Box>
          </Typography>
        )
      }

      queueTxt = (
        <Box style={styles.queueBox}>
          <Box align="center">
            <ThumbUpAltIcon style={{fontSize:"4.5rem",marginBottom:"1.5rem"}}/>
            <Typography variant="h4" align="center" gutterBottom paragraph>
              Okay, your reservation went fine!
            </Typography>
            {queueLenTxt}
          </Box>
        </Box>
      )
    }

    //if logged, queueNumber is not set (user not enqueued) and the queue is empty
    else if(this.props.status === 'logged' && this.state.queueNumber === undefined && this.state.queueStatus === 'empty' && this.props.cosmos === 'enabled'){
      console.log("[DEBUG] Logged and 'queueNumber' not set")
      queueTxt = (
        <Box style={styles.queueBox}>
          <Box align="center">
            <ThumbUpAltIcon style={{fontSize:"4.5rem",marginBottom:"1.5rem"}}/>
            <Typography variant="h4" align="center" gutterBottom paragraph>
              Hey, the VideoRoom is empty!
            </Typography>
            <Typography variant="h5" align="center" gutterBottom paragraph>
              You can also invite a friend:
            </Typography>
						<Box align="center" style={{marginBottom: "20px"}}> 
							<TextField id="outlined-basic" label="Username" inputRef={this.helloFriend} variant="outlined" />								
						</Box>
            <Button variant="contained" color="secondary" onClick={this.enqueue}>
              Enter
            </Button>
          </Box>
        </Box>
      )
    }

    //if logged, queueNumber is not set (user not enqueued) and the queue is NOT empty
    else if(this.props.status === 'logged' && this.state.queueNumber === undefined && this.state.queueStatus === 'occupied' && this.props.cosmos === 'enabled'){
      queueTxt = (
        <Box style={styles.queueBox}>
          <Box align="center">
            <PanToolIcon style={{fontSize:"4.5rem",marginBottom:"1.5rem"}}/>
            <Typography variant="h4" align="center" gutterBottom paragraph>
              Whoops, the VideoRoom is occupied!
            </Typography>
            <Typography variant="h5" align="center" gutterBottom paragraph>
              You can also invite a friend:
            </Typography>			
						<Box align="center"  style={{marginBottom: "20px"}}>
							<TextField id="outlined-basic" label="Username" inputRef={this.helloFriend} variant="outlined" />								
						</Box>				
            <Button variant="contained" color="secondary" onClick={this.enqueue}>
              Make a Reservation
            </Button>
          </Box>
        </Box>
      )
    }

    return (
      <main>
        <Box marginTop="30px" marginBottom="30px">
          <Container>
            <Grid container spacing={4}>
              <Grid item xs={12} >
                <Typography variant="h2" align="center">
                  This is a Demo
                </Typography>
                <Typography variant="h5" color="textSecondary" align="center" gutterBottom paragraph>
                  You may join a room as a client, create a session as an admin or host a room as an employee
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <img src={OfficeHours} style={styles.officeHoursImg} alt="Office Hours"/>
              </Grid>
              <Grid item xs={12} md={6}>
                {queueTxt}
              </Grid>
            </Grid>
          </Container>
        </Box>
      </main>
    )
  }

}

export default Main;

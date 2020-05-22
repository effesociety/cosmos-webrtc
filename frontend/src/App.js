import React from 'react';
import Header from './Header';
import Main from './Main';
import Info from './Info';
import Footer from './Footer';
import {socket} from './services/socket'
import FullBackdrop from './Backdrop'
import VideoRoom from './VideoRoom'
const styles = {
  root: {
    backgroundColor: "#edebeb"
  },
  noScroll: {
    overflow: "hidden"
  }
};

class App extends React.Component{
  constructor(){
    super()
    this.state = {
      status: 'anonymous',
      backdrop: true,
      scrollEnabled: true,
	    cosmos: 'disabled'
    }
    this.changeStatus = this.changeStatus.bind(this)
    this.cosmosStatus = this.cosmosStatus.bind(this)
    this.handleIdentityChecked = this.handleIdentityChecked.bind(this)
    this.toggleScroll = this.toggleScroll.bind(this)
  }

  componentDidMount(){
    console.log("Emitting identify")
    socket.emit('identify')
    socket.on('identityChecked',this.handleIdentityChecked)
    socket.on('cosmosStatus',this.cosmosStatus)
  }

  handleIdentityChecked(username,role){
    console.log("handleidentityChecked received")
    if(username){
      this.setState({
        status: 'logged',
        username: username,
        role: role,
        backdrop: false,
      })
    }
    else{
      this.setState({
        status: 'anonymous',
        backdrop: false,
      })
    }
  }

  changeStatus(status,username){
    this.setState({
      status: status,
      username: username
    })

    //Just a little trick
    socket.disconnect()
    socket.connect()
    if(this.state.status==='logged'){
      socket.emit('map')
    }
  }

  cosmosStatus(cosmos){
	console.debug("Received 'cosmosStatus'")
  	this.setState({
  	  cosmos: cosmos
  	})
  }

  toggleScroll(){
    var scrollEnabled = this.state.scrollEnabled ? false : true
    this.setState({
      scrollEnabled: scrollEnabled
    })
  }

  render(){
    if(this.state.scrollEnabled){
      document.body.style.overflow="auto"
    }
    else{
      document.body.style.overflow="hidden"
    }



    return(
      <div style={styles.root}>
        <FullBackdrop backdrop={this.state.backdrop}/>
        <VideoRoom username={this.state.username} socket={socket} handleToggleScroll={this.toggleScroll}/>
        <Header status={this.state.status} username={this.state.username} liftStatusChange={this.changeStatus}/>
        <Main status={this.state.status} socket={socket} role={this.state.role} cosmos={this.state.cosmos}/>
        <Info />
        <Footer />
      </div>
    )
  }
}

export default App

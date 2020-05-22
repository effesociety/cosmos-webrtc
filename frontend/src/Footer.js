import React from 'react'
import { Box, Link } from '@material-ui/core';
import Favorite from '@material-ui/icons/Favorite';
import GitHub from '@material-ui/icons/GitHub';
import Typography from '@material-ui/core/Typography';

class Footer extends React.Component{
  constructor(){
    super();
    this.state = {
      opacity: "0.5"
    }
    this.toggleGithub = this.toggleGithub.bind(this);
  }

  toggleGithub(){
    let opacity = this.state.opacity === "0.5" ? "1" : "0.5";
    this.setState({
      opacity: opacity
    })
  }

  render(){
    return(
      <footer style={{paddingBottom: "20px"}}>
        <Box align="center" marginBottom="10px">
          <Link href="http://github.com/the-licato/cosmos-webrtc/" color="inherit">
            <GitHub onMouseEnter={this.toggleGithub} onMouseLeave={this.toggleGithub} style={{opacity: this.state.opacity, fontSize:"50px",transition: "all 0.15s linear 0s"}}/>
          </Link>
        </Box>
        <Typography variant="subtitle1" align="center" noWrap style={{fontSize:"1.2rem"}}>
          Made with <Favorite fontSize="small" color="secondary" /> by Capone Daniele & Delicato Angelo
        </Typography>
      </footer>
    )
  }
}

export default Footer

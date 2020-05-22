import React from 'react';
import { Container, CssBaseline, Grid } from '@material-ui/core';
import {ReactComponent as CosmosLogo} from './resources/logo.svg'
import Conference from './resources/conference.jpg'
import LoginDialog from './LoginDialog'
import {HeaderCard} from './HeaderCard'

const styles = {
  header: {
    backgroundImage: 'url('+Conference+')',
  },
  logo: {
    fill:'white',
		width: '100%'
  },
  container: {
    alignItems: 'center',
    paddingTop: '100px',
    paddingBottom: '100px'
  }
};

class Header extends React.Component{
  constructor(props){
    super(props)
    this.onStatusChange = this.onStatusChange.bind(this)
  }

  onStatusChange(status, username){
    this.props.liftStatusChange(status, username)
  }

  render(){
    return (
      <header style={styles.header}>
        <CssBaseline/>
        <Container>
          <LoginDialog status={this.props.status} username={this.props.username} onStatusChange={this.onStatusChange}/>
        </Container>
        <Container style={styles.container}>
          <Grid container spacing={3}>
            <Grid item sm={12} md={5}>
              <CosmosLogo style={styles.logo}/>
            </Grid>
            <Grid item sm={12} md={3}>
            </Grid>
            <Grid item sm={12} md={4}>
              <HeaderCard/>
            </Grid>
          </Grid>
        </Container>
      </header>
    )
  }
}

export default Header;

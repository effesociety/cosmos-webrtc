import React from 'react';
import { Box } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOpenOutlined';
import Container from '@material-ui/core/Container';


/****************************************************************************
*                            STYLES FOR THE FORM
****************************************************************************/
const styles = {
  divLogin: {
    paddingTop: "25px"
  },
  paper: {
    marginTop: "64px",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  login:{
    color: "#f50057",
    fontSize: "1.2rem"
  },
  avatar: {
    margin: "8px",
    backgroundColor: "#f50057",
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: "8px",
  },
  submit: {
    margin: "24px 0 16px",
  },
  btnLeft:{
    width: 'calc(50% - 6px)',
  },
  btnRight:{
    width: 'calc(50% - 6px)',
    marginLeft: '12px'
  }
}

class LoginDialog extends React.Component{
  constructor(props){
    super(props)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleSignin = this.handleSignin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.handleCloseDialog = this.handleCloseDialog.bind(this)
    this.handleOpenDialog = this.handleOpenDialog.bind(this)
    this.handleErrorMsg = this.handleErrorMsg.bind(this)
    this.usernameTextField = React.createRef()
    this.passwordTextField = React.createRef()
    this.state = {
      open: false,
      errorMsg: ""
    }
  }

  handleOpenDialog(){
    this.setState({
      open: true
    })
  }

  handleCloseDialog(){
      this.setState({
        open: false
      })
    }

  handleErrorMsg(msg){
    this.setState({
      errorMsg: msg
    })
  }

  /****************************************************************************
  *                 HANDLERS FOR LOGIN AND SIGNUP
  ****************************************************************************/

  handleLogin(){
    const username = this.usernameTextField.current.value;
    const password = this.passwordTextField.current.value;
    console.log(username)
    console.log(password)
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username, password: password })
    };
    fetch('/user/login', requestOptions)
    .then(response => {
      if(response.status===200){
        console.log("Executing this.props.onStatusChange")
        this.props.changeStatus('logged',username)
        this.handleCloseDialog()
        //window.location.reload()
      }else{
        this.handleErrorMsg("Something is wrong!")
      }
    })
  }

  handleSignin(){
    const username = this.usernameTextField.current.value;
    const password = this.passwordTextField.current.value;
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: username, password: password })
    };
    fetch('/user/signup', requestOptions)
    .then(response => {
      if(response.status === 200){
        console.log("Executing this.props.onStatusChange")
        this.props.changeStatus('logged',username)
        this.handleCloseDialog()
        //window.location.reload()
      }else{
        this.handleErrorMsg("Something is wrong!")
      }
    })
  }

  handleLogout(){
    const requestOptions = {
      method: "DELETE",
      headers: { "Content-Type": "application/json"},
      credentials: "include"
    }
    fetch('/user/logout', requestOptions)
    .then(response => {
      if(response.status === 200){
        this.props.changeStatus('anonymous',null);
      }
    })
  }

  render(){
    var userInfo;
    const status = this.props.status
    const username = this.props.username
    if(status==='logged' && username !== undefined){
        userInfo = (
          <Box align="right">
          <Typography style={styles.login} variant="subtitle2" align="right" gutterBottom>
            Hi, {username}!
          </Typography>
          <Button variant="contained" color="secondary" onClick={this.handleLogout}>  
            Logout
          </Button>
          </Box>
        )
    }else{
      userInfo = (
        <Typography style={styles.login} variant="subtitle2" align="right" gutterBottom>
          <Button variant="contained" color="secondary" onClick={this.handleOpenDialog}>
            Login
          </Button>
        </Typography>
      )
    }

    return (
      <Box style={styles.divLogin}>
        {userInfo}
        <Dialog open={this.state.open} onClose={this.handleCloseDialog} aria-labelledby="form-dialog-title">
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div style={styles.paper}>
              <Avatar style={styles.avatar}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Welcome
              </Typography>
              <Typography variant="h6" color="secondary" align="center">
                {this.state.errorMsg}
              </Typography>
              <form style={styles.form} noValidate>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  inputRef={this.usernameTextField}
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  inputRef={this.passwordTextField}
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />

                <Grid container>
                  <Grid item style={styles.btnLeft}>
                    <Button
                      onClick={this.handleLogin}
                      fullWidth
                      variant="contained"
                      color="secondary"
                      style={styles.submit}
                    >
                      Login
                    </Button>
                  </Grid>
                  <Grid item style={styles.btnRight}>
                    <Button
                      onClick={this.handleSignin}
                      fullWidth
                      variant="contained"
                      color="secondary"
                      style={styles.submit}
                    >
                      Sign Up
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </div>
          </Container>
        </Dialog>
      </Box>
    );
  }
}

export default LoginDialog;

import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const styles ={
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: "8px",
    },
  },
}

class CustomSnackbar extends React.Component{
  constructor(props){
    super(props)
    this.handleClose = this.handleClose.bind(this)
  }

  handleClose() {
    this.props.closeSnackbar()
  }

  render(){

    return(
      <div style={styles.root}>
        <Snackbar open={this.props.open} autoHideDuration={6000} onClose={this.handleClose}>
          <Alert onClose={this.handleClose} severity={this.props.severity}>
            {this.props.msg}
          </Alert>
        </Snackbar>
      </div>
    )
  }
}

export default CustomSnackbar

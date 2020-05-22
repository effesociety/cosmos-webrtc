import React from 'react';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = {
  backdrop: {
    zIndex: "999",
    color: '#fff',
    backgroundColor: "#000",
    opacity: "0.8"
  },
}

class FullBackdrop extends React.Component{
  render(){
    return(
      <div>
        <Backdrop style={styles.backdrop} open={this.props.backdrop}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    )
  }
}

export default FullBackdrop

import React from 'react'
import { Box, Container, Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

class Info extends React.Component{
  render(){
    return (
      <section>
        <Box marginBottom="30px">
          <Container>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Typography variant="h2" align="center" gutterBottom>
                  Some info
                </Typography>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      How to setup Cosmos for demo usage
                    </Typography>
                    <Typography variant="body1" gutterBottom paragraph>
                      Ok, if you managed to reach this page it means that you
                      correctly built the <strong>React</strong> frontend and the
                      <strong> Node</strong> backend.<br/>
                      <strong>Please be aware</strong> that this demo application can work only
                      if you setup correctly <strong>MongoDB</strong> and <strong>Janus</strong>.
                      For the first one you just need to start it and then configure correctly the address in these files:
                    </Typography>
                    <ul>
                      <li>/backend/utils.js</li>
                    </ul>
                    <Typography variant="body1" gutterBottom paragraph>
                      Regarding Janus you need to:
                    </Typography>
                    <ul>
                      <li>enable <strong>Stored token based authentication mechanism</strong></li>
                      <li>enable <strong>Admin API</strong></li>
                      <li>enable VideoRoom plugin (it's the only one used...for now)</li>
                      <li>configure correctly the addresses in the file /backend/utils.js</li>
                    </ul>
                    <Typography variant="body1" gutterBottom paragraph>
                      Ooooooook, so from now on we are supposing you made all of these things before reading any further.<br/>
                    </Typography>
                    <Typography variant="h5" gutterBottom>
                      What you can do with Cosmos
                    </Typography>
                    <Typography variant="body1" gutterBottom paragraph>
                      With these demo web application you can:
                    </Typography>
                    <ul>
                      <li>Create a session (<strong>admin</strong> privilege)</li>
                      <li>Host a session(<strong>employee</strong> privilege)</li>
                      <li>Join a session (<strong>user</strong> privilege)</li>
                    </ul>
                    <Typography variant="body1" gutterBottom paragraph>
                      Mmmmmm, what does it mean? Yeah maybe these <i>vocabulary choices</i> are a little
                      bit confusing. Let me explain this with a practical example.
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      Let's suppose I run a contact center
                    </Typography>
                    <Typography variant="body1" gutterBottom paragraph>
                      The goal in this example is to provide an online contact center to the customers.<br/>
                      Let's suppose that this contact center is open from 8am to 6pm. Only in the <strong>working
                      hours</strong> the customer can visit the page and use the service (because during the closing hours the employees are home).
                      So:
                    </Typography>
                    <ul>
                      <li>The <strong>admin</strong> can setup the working hours and some other options (well maybe in the future) ==>
                      <strong> CREATE A SESSION</strong></li>
                      <li>Every <strong>employee</strong> can provide the same service to every customer ==>
                      <strong> HOST A SESSION</strong></li>
                      <li>The <strong>user</strong> can interact with the contact center just clicking a button</li>
                    </ul>
                    <Typography variant="body1" gutterBottom paragraph>
                      So the interesting thing is that the client will be connected to the first employees that becomes free (a <strong>human load balancing</strong>).<br/>
                      You may use <strong>Cosmos</strong> also if you are a <strong>University Teacher</strong>.
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      Let's suppose I am a University Teacher
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      The goal in this example is to provide an ordered online office hours service to the students.<br/>
                      In this case we can totally forgot about the <i>employees</i> because there are just the students and the teacher.
                      For this reason an admin has also the ability to <strong>host a session</strong>.
                      <br/><br/>
                      Game. Set. Match. Enjoy!
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </section>
    )
  }

}

export default Info;

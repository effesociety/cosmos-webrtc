import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

export const HeaderCard = () => {
  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
            What is it?
          </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          A <strong>WebRTC application</strong> built on top of <strong>Janus</strong>. The goal is to provide a web
          application which can <i>manage a queue of users</i> waiting for their turn with
          the "host" of the video streaming. For example:
        </Typography>
        <ul style={{color: "rgba(0, 0, 0, 0.54)"}}>
          <li>A contact center</li>
          <li>An online front office</li>
          <li>Online Office Hours</li>
        </ul>
      </CardContent>
    </Card>
  );
}

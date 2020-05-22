## Cosmos - React frontend

![Cosmos frontend](../documentation/images/Cosmos.png)

This folder contains the frontend of Cosmos. It is **higly coupled** with the Node.js backend, which makes it difficult for someone to use the backend without this particular fronted. An important thing to say is that we had to do a couple **magic tricks** in order to use **janus.js** as a module. In particular we had to manually configure the **webpack.config.js**. This is the reason why you see this file in this folder. After **npm install** you need to copy that file in the **/node_modules/react-scripts/config/** folder in order to avoid errors.

Except this little trick there isn't anything else you need to do to make it work!
As we said before you may try it out using [this link](https://cosmos-webrtc.herokuapp.com)
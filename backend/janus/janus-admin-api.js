const axios = require('axios')

module.exports = class JanusAdminSession{

  addToken(token){
    axios.post(process.env.JANUS_ADMIN_HOSTNAME,{
      janus: "add_token",
      token: token,
      plugins: ["janus.plugin.videoroom"],
      transaction: Math.random().toString(36).substring(2),
      admin_secret: process.env.JANUS_ADMIN_SECRET
    })
    .then(res => {
      console.log("Result from Janus Add Token request")
      console.log(res.data)
    })
    .catch(err => {
      console.log(err)
    })
  }

  removeToken(token){
    axios.post(process.env.JANUS_ADMIN_HOSTNAME,{
      janus: "remove_token",
      token: token,
      plugins: ["janus.plugin.videoroom"],
      transaction: Math.random().toString(36).substring(2),
      admin_secret: process.env.JANUS_ADMIN_SECRET
    })
    .then(res => {
      console.log("Result from Janus Remove Token request")
      console.log(res.data)
    })
    .catch(err => {
      console.log(err)
    })
  }

  listTokens(){
    axios.post(process.env.JANUS_ADMIN_HOSTNAME,{
      janus: "list_tokens",
      transaction: Math.random().toString(36).substring(2),
      admin_secret: process.env.JANUS_ADMIN_SECRET
    })
    .then(res => {
      console.log("Result from Janus List Tokens request")
      console.log(res.data)
    })
    .catch(err => {
      console.log(err)
    })
  }
}

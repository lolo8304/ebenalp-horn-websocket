/* global openWebSockets */
var WebSocketServer = require("ws").Server
var express = require('express');
var fs      = require('fs');
var bodyParser = require('body-parser')
var qr = require('qr-image');

var app = express()

var ipaddress = process.env.OPENSHIFT_NODEJS_IP;
var port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

var server = app.listen(port, ipaddress, null , function () {
  console.log('Ready');
})
var content = require('./content.json');

app.use(bodyParser.json())

//Start the Server
console.log("HTTP Server Listening on Port: %d", port)

//Serve Static HTML
app.use(express.static(__dirname + "/"))

//Start the WebSocketServer
var wss = new WebSocketServer({server: server})
console.log("Websocket Server Started on port 8000")

//Create an empty object to store the Open WebSockets
openWebSockets = {}

var logoutConnectionCount = function() {
  console.log("Open Connections: " + Object.keys(openWebSockets).length)
};

wss.on("connection", function(ws) {
  ws.on('message', function(message) {
    var deviceAlias = null
    var rawAlias = JSON.parse(message)["device_alias"]
    if (rawAlias === undefined) { 
      //Send back a message that the device_alias wasn't found
      ws.send(JSON.stringify("No Device Alias set, Connection not stored."))
      logoutConnectionCount();
      deviceAlias = null
    } else {
      //decode the base64 encoded device_alias param
      deviceAlias = new Buffer(rawAlias, 'base64').toString('ascii').replace("\n", "")
      console.log("Alias: " + deviceAlias)
      //Add ws to openWebSockets object keyed off the device_alias
      openWebSockets[deviceAlias] = ws
      //send back welcome content
      ws.send(JSON.stringify(content["welcome"]))
      logoutConnectionCount();
    }
  });

  ws.on("close", function() {
    //Remove the Open WebSocket
    if (deviceAlias === null) {
      console.log("No open socket")
    } else {
      delete openWebSockets[deviceAlias]
      console.log("Disconnected Device " + deviceAlias)
      logoutConnectionCount();
    }
  })
})


//POST endpoint where the webhooks will be received
app.post('/webhook', function(request, response) { 
  //Send back 200
  response.json(200, {})

  //grab device_alias from the params
  var deviceAlias = request.param('device_alias')
  console.log("Webhook Device Alias " + deviceAlias)
  //find the websocket related to that device_alias
  logoutConnectionCount();
  var deviceSocket = openWebSockets[deviceAlias]
  if (deviceSocket === undefined) { 
    //that websocket was closed or never existed
    console.log("Webhook sent for Device with no Connection")
  } else { 
    //THIS IS WHERE YOU FIND THE CONTENT YOU WANT TO SEND BACK
    console.log(request.body)
    //send back the request body for display
    deviceSocket.send(JSON.stringify(request.body))
    console.log("Webhook pushed to : " + deviceAlias)
  }
})

/* http://blog.nodejitsu.com/npmawesome-qr-codes/ */

app.get('/qr', function(req, res) {  
  var code = qr.image(new Date().toString(), { type: 'svg' });
  res.type('svg');
  code.pipe(res);
});

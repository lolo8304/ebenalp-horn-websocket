#ROXIMITY Node.js/WebSockets Example Application

[http://rox-websockets-example.herokuapp.com](http://rox-websockets-example.herokuapp.com/)

###Summary 
This is a basic example of a 'tour' flow just using Safari with WebSockets. 

###### Step 1: Launch the Browser

An initial request to [http://rox-websockets-example.herokuapp.com](http://rox-websockets-example.herokuapp.com/) with base64 encoded device_alias in the query_string
will open a websocket with the server tied to that device_alias. If no device_alias is sent, no connection is created. 

###### Step 2: Push new Content

A subsequent POST to http://rox-websockets-example.herokuapp.com/webhook with device_alias in the params will find the related Websocket and 
send back the entire request body and display it on the page. 

#### Testing with ROXIMITY Beacons

##### Step 1: Setup a Request Action to Launch the Browser

Create a Request Message with all the relavent information and the URL set to http://rox-websockets-example.herokuapp.com.
This will fire for the Beacons that match the tags you specified with the message as the text of the modal or banner notification on the device. 
If the user clicks OK, the browser will launch the specified URL with the additional information (including device_alias) in the query_string. 

###### Request Action Query String
```
  action_id - unique identifier of action, in this case the request message
  lat - latitude, base64 encoded
  lon - longitude, base64 encoded
  device_alias - alias set in ROXIMITY SDK, base 64 encoded
  name - beacon name that triggered the url, base 64 encoded
  tags - tags assigned to that beacon in the dashboard, base 64 encoded
  trigger_id - unique identifier of trigger, in this case a beacon
  ts - timestamp of request in double seconds since epoch
```

##### Step 2: Setup a Webhook Action to change the content
Create a Webhook with the URL set to http://rox-websockets-example.herokuapp.com/webhook. 
This will fire the Webhook for the Beacons that match the tags you specified with the payload shown in the API docs. 
In this demo, the body of the POST will be sent back to the browser and displayed, but this is where you would find the content you want to return to the browser.

#### Testing without Beacons

##### Step 1: Visit URL in Broswer

* base64 encode your device_alias 
```
echo 'SAMPLEDEVICEALIAS' | openssl base64
U0FNUExFREVWSUNFQUxJQVMK
```
* Go to http://rox-websockets-example.herokuapp.com?device_alias=U0FNUExFREVWSUNFQUxJQVMK

##### Step 2: Simulate Webhook with CURL
Note: Webhook params are NOT base64 encoded.
```
curl -i -H "Content-Type: application/json" -d '{"device_alias" : "SAMPLEDEVICEALIAS" }' http://rox-websockets-example.herokuapp.com/webhook 
```

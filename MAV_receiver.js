// Hole punch and forward received packets to 14550 on the local machine (demo connection to mission planner)
// based on http://www.bford.info/pub/net/p2pnat/index.html

//networking libraries required
var dgram = require('dgram');
var socket = dgram.createSocket('udp4');

// This is the IP address of the hole punch server. These are allocated at server startup, and servers are not free (cents per hour), so the server will only be started 

var MAV_client;
//Until contacted by server, offer mavlink connection to local machine.
var received_remote_address = false;
socket.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port);
    //Check if the hole punch server is telling us who the remote client is.
    if (atoi(remote.address) == atoi(serverHost) && remote.port == serverPort){
	    try{
	    	MAV_client = JSON.parse(message);
	    	console.log(message);
	    	console.log('Received address of remote client, starting MAVLink forwarding');
	    	received_remote_address = true;
	    }catch(err) {}
	    return;
	}
	if (received_remote_address) {
		if (atoi(remote.address) == atoi(MAV_client.address) && remote.port == MAV_client.port) {
			socket.send(message, 0, message.length, 14550, '0.0.0.0');
		}
		if (atoi(remote.address) == atoi('0.0.0.0') && remote.port == 14550) {
			socket.send(message, 0, message.length, MAV_client.port, MAV_client.address);
		}
	}
});

//Contacts the public server.
var serverPort = 33333;
var serverHost = '13.211.162.168';
function sendMessageToS () {

	var message = new Buffer.from('B');
	socket.send(message, 0, message.length, serverPort, serverHost, function (err, nrOfBytesSent) {
	    if (err) return console.log(err);
	    console.log('UDP message sent to ' + serverHost +':'+ serverPort);
	    // socket.close();
	});
}

//convert IP address to integer
var atoi = function atoi(addr) {
  var parts = addr.split('.').map(function(str) {
    return parseInt(str); 
  });

  return (parts[0] ? parts[0] << 24 : 0) +
         (parts[1] ? parts[1] << 16 : 0) +
         (parts[2] ? parts[2] << 8  : 0) +
          parts[3];
};

//get things started.
sendMessageToS();

play.scoutcraft.com.au
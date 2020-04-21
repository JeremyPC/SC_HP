// Hole punch and forward serial port to remote client.
// based on http://www.bford.info/pub/net/p2pnat/index.html

var dgram = require('dgram');
var sp = require('serialport');
var mavPort = new sp('COM4',{baudRate: 115200});

var socket = dgram.createSocket('udp4');

var remote_client;
//Until contacted by server, offer mavlink connection to local machine.
var received_remote_address = false;
socket.on('message', function (message, remote) {
    // console.log(remote.address + ':' + remote.port +' - ' + message);
    //Check if the hole punch server is telling us who the remote client is.
    if (atoi(remote.address) == atoi(serverHost) && remote.port == serverPort){
	    try{
	    	remote_client = JSON.parse(message);
	    	console.log(message);
	    	console.log('Received address of remote client, starting USB forwarding');
	    	received_remote_address = true;
			// setInterval(socket.send(message, 0, message.length, remote_client.port, remote_client.address),500);
	    }catch(err) {}
	    return;
	}
	mavPort.write(message);
});

mavPort.on('data',function(data) {
	// console.log('Data: ', data);
	if (received_remote_address) {
		socket.send(data, 0, data.length, remote_client.port, remote_client.address);
		console.log(remote_client.address + ':' + remote_client.port);
	} else {
		socket.send(data, 0, data.length, 14550, '0.0.0.0');
	}
})

//Contacts the public server.
var serverPort = 33333;
var serverHost = '13.211.162.168';
function sendMessageToS () {

	var message = new Buffer.from('A');
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
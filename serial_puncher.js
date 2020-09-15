// Hole punch and forward serial port to remote client.
// based on http://www.bford.info/pub/net/p2pnat/index.html

var dgram = require('dgram');
var sp = require('serialport');
// var mavPort = new sp('COM6',{baudRate: 115200});

var onboard_Rx = dgram.createSocket('udp4');
onboard_Rx.bind(15550);
var onboard_debug = dgram.createSocket('udp4');
onboard_debug.bind(15549);
onboard_debug.on('message',function(message,remote) {
	console.log(message);
})

var onboard_client_address;
var onboard_client_port;

//Startup hole punch
var remote_Rx = dgram.createSocket('udp4');
var remote_client;
//Flags
var received_remote_address = false; // flag to indicate whether address of remote end is known yet. If not, then connection will be offered to the local machine.
var received_onboard_address = false; // flag to indicate whether the onboard address is known (if anything has been received yet from the onboard receiver).

//When we receive a message
remote_Rx.on('message', function (message, remote) {
    // console.log(remote.address + ':' + remote.port +' - ' + message);
    //Check if the hole punch server is telling us who the remote client is.
    if (atoi(remote.address) == atoi(serverHost) && remote.port == serverPort){
	    try{
	    	remote_client = JSON.parse(message);
	    	console.log(message);
	    	console.log('Received address of remote client, starting USB forwarding');
	    	received_remote_address = true;
			// setInterval(remote_Rx.send(message, 0, message.length, remote_client.port, remote_client.address),500);
	    }catch(err) {}
	    return;
	}
	if (received_onboard_address) {
		onboard_Rx.send(message,0,message.length,onboard_client_port,onboard_client_address);
		// console.log(message);
	}
	// mavPort.write(message);
});

onboard_Rx.on('message',function(message,remote) {
	// console.log('Data: ', data);
	if (!received_onboard_address) {
		onboard_client_address = remote.address;
		onboard_client_port = remote.port;
		received_onboard_address = true;
		console.log('heard onboard telem');
		console.log(onboard_client_address);
		console.log(onboard_client_port);
	}
	if (received_remote_address) {
		remote_Rx.send(message, 0, message.length, remote_client.port, remote_client.address);
		console.log(message);
	}
	remote_Rx.send(message, 0, message.length, 14552, '127.0.0.1'); // always send to local port as well
	// console.log("blah");
})

// mavPort.on('data',function(data) {
// 	// console.log('Data: ', data);
// 	if (received_remote_address) {
// 		remote_Rx.send(data, 0, data.length, remote_client.port, remote_client.address);
// 		console.log(remote_client.address + ':' + remote_client.port);
// 	} else {
// 		remote_Rx.send(data, 0, data.length, 14550, '0.0.0.0');
// 	}
// })

//Contacts the public server.
var serverPort = 33333;
var serverHost = '3.25.50.34';
function sendMessageToS () {

	var message = new Buffer.from('A');
	remote_Rx.send(message, 0, message.length, serverPort, serverHost, function (err, nrOfBytesSent) {
	    if (err) return console.log(err);
	    console.log('UDP message sent to ' + serverHost +':'+ serverPort);
	    // remote_Rx.close();
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

//Read up on VPNs
//Flight ready for Friday 9am
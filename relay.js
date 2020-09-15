// super simple node.js udp packet forwarder (to be used on AWS server in between TAMU and Sydney)

const dgram = require('dgram');


var remote_addr1 = '127.0.0.1';
var remote_port1 = 14550;
const Rx_Port1 = 15550;

var remote_addr2 = '127.0.0.1';
var remote_port2 = 14551;
const Rx_Port2 = 15551;

//code for receiving from 1
var socket1 = dgram.createSocket({ type: "udp4", reuseAddr: true });
socket1.bind(Rx_Port1);
socket1.on('listening', function() {
	socket1.on('message', function(message,info) {
		remote_addr1 = info.address;
		remote_port1 = info.port;
		console.log('Heard from remote1');
		console.log(remote_addr1);
		console.log(remote_port1);
		console.log(message);
		socket2.send(message,0,message.length,remote_port2,remote_addr2); // send from socket 2 to remote2
	});
	const address = socket1.address();
	console.log(
    `UDP socket listening on ${address.address}:${address.port}`
	);
})

//code for receiving from 1
var socket2 = dgram.createSocket({ type: "udp4", reuseAddr: true });
socket2.bind(Rx_Port2);
socket2.on('listening', function() {
	socket2.on('message', function(message,info) {
		remote_addr2 = info.address;
		remote_port2 = info.port;
		console.log('Heard from remote2');
		console.log(remote_addr2);
		console.log(remote_port2);
		console.log(message);
		socket1.send(message,0,message.length,remote_port2,remote_addr2); // send from socket1 to remote1
	});
	const address = socket2.address();
	console.log(
    `UDP socket listening on ${address.address}:${address.port}`
	);
})
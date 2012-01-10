require("./lib/comm/debug");
require("./lib/comm/util");

var EventEmitter = require("events").EventEmitter;
module.exports = new EventEmitter();

var net = require('net');
var message = require("./lib/comm/message")
	,handlers = require("./message_handler").handlers;

var host="127.0.0.1", port=10086;

var client = net.connect(port, host, connect);
client.data = "";
client.mq=[];

client.sendMessage = function(msg){
	client.write(message.pack(msg));
}

client.on("error", function(err){
	DBG_LOG("e", "Cannot connect to server.");
});

function connect(){
	DBG_LOG("i", "connected");
	client.setEncoding("utf8");
	client.on("data", receiveMessage);
	client.on("close", cleanupSession);
	client.on("error", handleSocketError);
	// begin to connect
	sendMessage(message.new("CONNECT"));
}

// send message function
function sendMessage(msg){
	try{
		var ret = client.write(message.pack(msg), function(){
			DBG_LOG("i", "write ok");
		});
	}
	catch(e){
		return false;
	}
	return true;
}

//
function receiveMessage(data){
	DBG_LOG("i", "receive message");
	client.data += data;
	client.data = client.data.slice(message.parseMessage(client.data, client.mq));
	processMessage();
}

//
function cleanupSession(){
	DBG_LOG("i", "disconnected.");
}

//
function handleSocketError(){
	DBG_LOG("i", "socket error");
}

// dispatch message
function processMessage(){
	DBG_LOG("i", "process message");
	if( client.mq.length > 0){
		while( client.mq.length>0){
			var msg = client.mq.shift();
			var fname = "f_" + msg.cmd.toLowerCase();
			if( handlers.hasOwnProperty(fname)  && typeof(handlers[fname]) == "function" ){
				handlers[fname](client, msg);
			}
			else{
				handlers["f_default"](client, msg);
			}
		}
	}
}

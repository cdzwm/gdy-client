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
client.prompt = "Cmd>";

client.sendMessage = sendMessage;

client.on("error", function(err){
	DBG_LOG("e", "Cannot connect to server.");
});

function connect(){
	client.setEncoding("utf8");
	client.on("data", receiveMessage);
	client.on("close", cleanupSession);
	client.on("error", handleSocketError);
	// begin to connect
	sendMessage(message.new("CONNECT"));
	process.stdin.on("data", function(trunck){
		if( trunck.length > 2){
			if(client.sendMessage(message.new(trunck.substr(0, trunck.length-2)))){
				// TODO: 发送信息错误处理。
			}
		}
		process.stdout.write(client.prompt);
	});
	process.stdin.setEncoding("utf8");
	process.stdin.resume();
	process.stdout.setEncoding("utf8");
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

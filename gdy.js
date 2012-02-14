require("./lib/comm/debug");
require("./lib/comm/util");

var EventEmitter = require("events").EventEmitter;
module.exports = new EventEmitter();
var readline = require("readline"), cli;

global.session = {};
var net = require('net');
var message = require("./lib/comm/message")
	,handlers = require("./message_handler").handlers;

var host="127.0.0.1", port=10086;
var client = net.connect(port, host, connect);

client.on("error", function(err){
	DBG_LOG("e", "Cannot connect to server.");
});

session.end = function(){
	client.end();
}
session.data = "";
session.mq=[];
session.pro = "Cmd>";
session.state = "";
session.sendMessage = sendMessage;
session.prompt = function(){
	cli.prompt();
}

session.shutDown = function(){
	client.end();
	process.exit(0);
}

function processCmd(trunck){
	if( trunck.length > 0){
		if(session.sendMessage(message.new(trunck))){
			// TODO: 发送信息错误处理。
		}
	}
	else{
		cli.prompt();
	}
}

cli = readline.createInterface(process.stdin, process.stdout);
cli.setPrompt(session.pro, session.pro.length);
cli.on('line', processCmd);

function connect(){
	client.setEncoding("utf8");
	client.on("data", receiveMessage);
	client.on("close", cleanupSession);
	client.on("error", handleSocketError);

	// begin to connect
	session.sendMessage(message.new("CONNECT"));
	session.state = "CONNECT";
	process.stdin.setEncoding("utf8");
	process.stdout.setEncoding("utf8");
}

// send message function
function sendMessage(msg){
	try{
		var ret = client.write(message.pack(msg), function(){
		});
	}
	catch(e){
		return false;
	}
	return true;
}

//
function receiveMessage(data){
	session.data += data;
	session.data = session.data.slice(message.parseMessage(session.data, session.mq));
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
	if( session.mq.length > 0){
		while( session.mq.length>0){
			var msg = session.mq.shift();
			var fname = "f_" + msg.cmd.toLowerCase();
			if( handlers.hasOwnProperty(fname)  && typeof(handlers[fname]) == "function" ){
				handlers[fname](msg);
			}
			else{
				handlers["f_default"](msg);
			}
		}
	}
}

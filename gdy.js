require("./lib/comm/debug"); // for debug
require("./lib/comm/util"); // Add some util functions.

var EventEmitter = require("events").EventEmitter;
module.exports = new EventEmitter();

var readline = require("readline")
	,cli; // command line interface variable

var net = require('net');
var message = require("./lib/comm/message")
	,handlers = require("./message_handler").handlers;

var host="127.0.0.1", port=10086;
var client = net.connect(port, host, connect);

client.on("error", function(err){
	DBG_LOG("e", "Cannot connect to server.");
	session.shutDown();
});

global.session = {}; // declare global session object

session.data = "";
session.mq=[];
session.state = "";
session.p = "Cmd>"; // command prompt

// send message function
session.sendMessage = function(msg){
	try{
		var ret = client.write(message.pack(msg), function(){
		});
	}
	catch(e){
		return false;
	}
	return true;
}

// print command prompt
session.prompt = function(){
	cli.prompt();
}

session.end = function(){
	client.end();
}

session.shutDown = function(){
	client.end();
	process.exit(0);
}

function processCmd(cmd){
	if( cmd.length > 0){
		// parse command

		if(!session.sendMessage(message.new(cmd))){
			// TODO: 发送信息错误处理。
		}
	}
	else{
		cli.prompt();
	}
}

cli = readline.createInterface(process.stdin, process.stdout);
cli.setPrompt(session.p, session.p.length);
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

//
function receiveMessage(data){
	session.data += data;
	session.data = session.data.slice(message.parseMessage(session.data, session.mq));
	processMessage();
}

//
function cleanupSession(){
	DBG_LOG("i", "disconnected.");
	session.shutDown();
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

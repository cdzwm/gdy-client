require("./lib/comm/debug"); // for debug
require("./lib/comm/util"); // Add some util functions.

var EventEmitter = require("events").EventEmitter;
module.exports = new EventEmitter();

var readline = require("readline")
	,cli; // command line interface variable

var net = require('net');
var message = require("./lib/comm/message")
	,handlers = require("./message_handler").handlers;

process.stdin.setEncoding("utf8");
process.stdout.setEncoding("utf8");

var host="127.0.0.1", port=10086;
var client = net.connect(port, host);
client.setEncoding("utf8");

client.on("connect", connect);
client.on("data", onData);
client.on("error", onError);
client.on("close", onClose);

global.session = {}; // declare global session object
session.data = "";
session.mq=[];
session.state = "";
session.p = "gdy>"; // command prompt
session.timer = null;

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

// display command prompt
session.prompt = function(){
	cli.prompt();
}

// end session
session.end = function(){
	client.end();
}

// connect to server
function connect(){
	session.state = "CONNECT";
	session.timer = setTimeout(function (){
		session.end();
	}, 5000);
	session.sendMessage(message.new("CONNECT"));
}

// receive data
function onData(data){
	session.data += data;
	session.data = session.data.slice(message.parseMessage(session.data, session.mq));
	processMessage();
}

function onClose(){
	DBG_LOG("i", "socket closed.");
	process.exit(0);
}

// handle connection error
function onError(err){
	if( err.errno == 'ECONNREFUSED' ){
		console.log("Cannot connect to server.");
	}else{
		console.log("Unknow network error. ");
	}
	client.destroy();
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

// handle command line
cli = readline.createInterface(process.stdin, process.stdout);
cli.setPrompt(session.p, session.p.length);
cli.on('line', processCmd);

function processCmd(cmd){
	if( cmd.length > 0){
		if(!session.sendMessage(message.new(cmd))){
			console.log("Disconnected from server.")
		}
	}
	else{
		cli.prompt();
	}
}

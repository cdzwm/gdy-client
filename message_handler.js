// project dependences
var message = require("./lib/comm/message");

var callbacks={}; // message handle callback functions

// Set message handle callback functions

// default message handle function
callbacks["f_default"] = function(client, msg){
	DBG_LOG("i", msg.cmd);
	console.log(msg.cmd);
	process.stdout.write("Cmd>");
}

callbacks["f_connect_ok"] = function(client, msg){
	var mymsg = message.new("LOGIN");
	mymsg.username="player1";
	mymsg.password="password";
	client.sendMessage( mymsg);
}

callbacks["f_login_ok"] = function(client, msg){
	DBG_LOG("i", msg.cmd);
	process.stdout.write("Cmd>");
}

callbacks["f_hello"] = function(client, msg){
	var mymsg = message.new("HELLO_RESP");
	client.sendMessage(mymsg);
}

callbacks["f_get_name_resp"] = function(client, msg){
	console.log("Your name is: " + msg.name);
}

module.exports.handlers = callbacks;

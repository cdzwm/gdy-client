// project dependences
var message = require("./lib/comm/message");

var callbacks={}; // message handle callback functions

// Set message handle callback functions

// default message handle function
callbacks["f_default"] = function(client, msg){
	DBG_LOG("i", msg.cmd);
}

callbacks["f_connect_ok"] = function(client, msg){
	DBG_LOG("i", "Begin connect");
	var mymsg = message.new("LOGIN");
	mymsg.username="player1";
	mymsg.password="password";
	client.sendMessage( mymsg);
}

callbacks["f_login_ok"] = function(client, msg){
	DBG_LOG("i", msg.cmd);
}

callbacks["f_hello"] = function(client, msg){
	var mymsg = message.new("HELLO_RESP");
	client.sendMessage(mymsg);
}

module.exports.handlers = callbacks;

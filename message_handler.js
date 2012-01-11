// project dependences
var message = require("./lib/comm/message");

var callbacks={}; // message handle callback functions

// Set message handle callback functions

// default message handle function
callbacks["f_default"] = function(client, msg){
	DBG_LOG("i", msg.cmd);
	console.log(msg.cmd);
	process.stdout.write(client.prompt);
}

callbacks["f_connect_ok"] = function(client, msg){
	var mymsg = message.new("LOGIN");
	mymsg.username="player1";
	mymsg.password="password";
	client.sendMessage( mymsg);
}

callbacks["f_login_ok"] = function(client, msg){
	DBG_LOG("i", msg.cmd);
	process.stdout.write(client.prompt);
}

callbacks["f_hello"] = function(client, msg){
	var mymsg = message.new("HELLO_RESP");
	client.sendMessage(mymsg);
}

callbacks["f_get_name_resp"] = function(client, msg){
	console.log("id: " + msg.playerid);
	console.log("name: " + msg.name);
	console.log("nickname: " + msg.nickname);
	console.log("description: " + msg.description);
	process.stdout.write(client.prompt);
}

module.exports.handlers = callbacks;

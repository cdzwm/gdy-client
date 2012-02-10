// project dependences
var message = require("./lib/comm/message");

var callbacks={}; // message handle callback functions

// Set message handle callback functions

// default message handle function
callbacks["f_default"] = function(msg){
	DBG_LOG("i", msg.cmd);
	if( session.state != "LOGINED" ){
		session.end();
	}
	process.stdout.write(session.prompt);
}

callbacks["f_connect_ok"] = function(msg){
	var mymsg = message.new("LOGIN");
	mymsg.username="player1";
	mymsg.password="password";
	session.sendMessage( mymsg);
}

callbacks["f_login_ok"] = function(msg){
	DBG_LOG("i", msg.cmd);
	session.state = "LOGINED";
	process.stdout.write(session.prompt);
}

callbacks["f_hello"] = function(msg){
	var mymsg = message.new("HELLO_RESP");
	session.sendMessage(mymsg);
}

callbacks["f_get_name_resp"] = function(msg){
	console.log("id: " + msg.id);
	console.log("name: " + msg.name);
	console.log("nickname: " + msg.nickname);
	console.log("description: " + msg.description);
	process.stdout.write(session.prompt);
}

callbacks["f_who_resp"] = function(msg){
	console.log(msg.name);
	process.stdout.write(session.prompt);
}

module.exports.handlers = callbacks;

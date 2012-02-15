// project dependences
var message = require("./lib/comm/message");

var callbacks={}; // message handle callback functions

// Set message handle callback functions

// default message handle function
callbacks["f_default"] = function(msg){
	DBG_LOG("i", msg.cmd);
	if( session.state != "LOGINED" ){
		session.shutDown();
	}
	session.prompt();
}

callbacks["f_connect_ok"] = function(msg){
	var mymsg = message.new("LOGIN");
	mymsg.username="canw";
	mymsg.password="password";
	session.sendMessage( mymsg);
}

callbacks["f_login_ok"] = function(msg){
	DBG_LOG("i", msg.cmd);
	session.state = "LOGINED";
	session.prompt();
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
	session.prompt();
}

callbacks["f_who_resp"] = function(msg){
	console.log(msg.name);
	console.log(msg.age);
	session.prompt();
}

callbacks["f_quit_resp"] = function(msg){
	console.log('Bye.');
	session.shutDown();
}

callbacks["f_list_room_resp"] = function(msg){
	for(var r in msg.rooms){
		console.log(msg.rooms[r].name);
	}
	session.prompt();
}

module.exports.handlers = callbacks;

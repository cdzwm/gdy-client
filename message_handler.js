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
	session.prompt();
}

callbacks["f_connect_ok"] = function(msg){
	clearTimeout(session.timer);
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
	console.log(msg.u);
	session.prompt();
}

callbacks["f_quit_resp"] = function(msg){
	console.log('Bye.');
	session.end();
}

callbacks["f_list_room_resp"] = function(msg){
	console.log("\tList of game rooms\n");
	for(var r in msg.rooms){
		console.log("\t\t" + msg.rooms[r].id + "." + msg.rooms[r].name);
	}
	session.prompt();
}

callbacks["f_count_resp"] = function(msg){
	console.log(msg.count);
	session.prompt();
}

callbacks['f_server_name_resp'] = function(msg){
	console.log(msg.server_name);
	session.prompt();
}

module.exports.handlers = callbacks;

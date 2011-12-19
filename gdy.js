global.DEBUG = (process.env.GDY_DEBUG || false) == 1;
var net = require('net');
var message = require("./lib/message");

var msg_begin = "GDY_MSG_BEGIN{";
var msg_end="}GDY_MSG_END";

var hello_msg = {"cmd": "MSG"};

var t
	,client = net.connect(10086, '127.0.0.1', function(){
	setTimeout(hello, 500);

//	setTimeout(hello, 3000);

	t = setTimeout(sendMessage, 1000);
	client.setEncoding('utf8');
	client.on("close", function(){
		clearTimeout(t);
		console.log("Server is timeout.");
	});
	client.on('data', onReceiveMessage);
});

client.on("error", function(err){
	if( err.code == "ECONNREFUSED")
		console.log("无法连接服务器");
});
function hello(){
	hello_msg.cmd =  "CONNECT";
	client.write(msg_begin + JSON.stringify(hello_msg) + msg_end);
}
function onReceiveMessage(data){
	var mq = [];
	message.parseMessage(data, mq);
	if( mq[0].cmd == "CONNECT_OK" ){
		login_msg = {cmd: "LOGIN", username:"gdy", password:"gdypassword"};
		client.write(msg_begin + JSON.stringify(login_msg) + msg_end);
		if( DEBUG )
			console.log("LOGIN");
	}
	else {
		console.log(mq[0].cmd);
		if( mq[0].cmd == "HELLO" ){
			client.write(message.newMessage("HELLO_OK"));
		}
	}
}

function sendMessage(){
	hello_msg.cmd =  "MSG";
	var s = msg_begin + JSON.stringify(hello_msg) + msg_end;
	for(var i=0;i<1;i++)
	client.write(s);
	t = setTimeout(sendMessage, Math.round(Math.random() * 1000));
}

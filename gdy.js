require("./lib/comm/debug");
var net = require('net');
var message = require("./lib/comm/message");

var t;
var client = net.connect(10086, '133.109.55.198', function(){
	setTimeout(hello, 500);
	t = setTimeout(sendMessage, 30000);
	client.setEncoding('utf8');
	client.on("close", function(){
		clearTimeout(t);
		DBG_LOG("i", "Server is timeout.");
	});
	client.on('data', onReceiveMessage);
});

client.on("error", function(err){
	if( err.code == "ECONNREFUSED")
		DBG_LOG("e", "无法连接服务器");
});

function hello(){
	client.write(message.packMessage(message.newMessage("CONNECT")));
}
function onReceiveMessage(data){
	var mq = [];
	message.parseMessage(data, mq);
	if( mq[0].cmd == "CONNECT_OK" ){

		login_msg = {cmd: "LOGIN", username:"player1", password:"password"};
		client.write(message.msgBegin() + JSON.stringify(login_msg) + message.msgEnd());
		if( DEBUG )
			DBG_LOG("i", "LOGIN");
	}
	else {
		DBG_LOG("i", mq[0].cmd);
		if( mq[0].cmd == "HELLO" ){
			client.write(message.packMessage(message.newMessage("HELLO_OK")));
		}
	}
}

function sendMessage(){
	for(var i=0;i<10;i++)
		client.write(message.packMessage(message.newMessage("MSG")));
	DBG_LOG("i", "MSG");
	t = setTimeout(sendMessage, Math.round(Math.random() * 2000));
}

require("./lib/comm/debug");
var net = require('net');
var message = require("./lib/comm/message");

var t;
var client = net.connect(10086, '127.0.0.1', function(){
	setTimeout(connect, 500);
	t = setTimeout(sendMessage, 5000);
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

function connect(){
	client.write(message.pack(message.new("CONNECT")));
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
		if( mq[0].cmd == "HELLO" ){
			client.write(message.pack(message.new("HELLO_OK")));
		}
	}
}

function sendMessage(){
	for(var i=0;i<1;i++)
		client.write(message.pack(message.new("MSG")));
	t = setTimeout(sendMessage, 1000 + Math.round(Math.random() * 2000));
}

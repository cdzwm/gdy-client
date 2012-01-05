require("./lib/comm/debug");
require("./lib/comm/util");
var session = require("./lib/session");
var host="127.0.0.1", port=10086;
var client = session.newSession(host, port);

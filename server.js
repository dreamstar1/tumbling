var sys = require("sys");
http = require("http");

PORT = 31365;

MIME_TYPES ={
	'.html': 'text/html',
	'.js': 	'text/javascript',
	'.txt': 'text/plain'
};

http.createServer(function(req, res) {
}).listen(PORT);

console.log('Server running at http://127.0.0.1:' + PORT +'/');

var http = require("http");

http.createServer(function(request, response) {
	response.writeHead(200, {'Content-Type': 'text/plain'});

	// TODO: Load units from files.
	// TODO: Load nodes from files.
	// TODO: Write simulation cycle.
	// TODO: Log every simulation round into file.

	response.end('Hello world!\n');
}).listen(8000);

console.log('Server running at localhost:8000');

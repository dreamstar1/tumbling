var sys = require("sys");
var tumblr = require('./node-v0.8.18-linux-x86/bin/node_modules/tumblr').Tumblr;
http = require("http");

PORT = 0;

MIME_TYPES ={
	'.html': 'text/html',
	'.js': 	'text/javascript',
	'.txt': 'text/plain'
};

//handling tumblr
var KEY = 'VdAQkUPDY46fUmqRVGqRCY3ncJvrx6SDKAl5bQN7Tw2xZgxeY9';

// Handling Database
var _mysql = require("mysql");
var _HOST = "dbsrv1.cdf.toronto.edu";
var _PORT = "3306"; // standard sql PORT
var _USER = "{cdf_user_name}";
var _PASS = "{assigned_password}";
var DATABASE = "csc309h_{cdf_user_name}"; // this database? or a2.sql we created? 
											/* we'll have to run a2.sql just 
											 * once on csc309h_{cdf_user_name} to create the tables */

var mysql = _mysql.createClient({
	host: _HOST,
	port: _PORT,
	user: _USER,
	password: _PASS,
});
mysql.query('use ' + DATABASE);

function database(cmd, data) {
	// what will be the type of 'data' parameter? JSON?
	// depends on how we retrieve data from tumblr.
	
	// Inserting into the database.
	// How will the data be inserted? one by one? or rearrange the data so that we can insert at once
	if (cmd == "INSERT") {
		mysql.query('insert into ' + TABLENAME + ' values ' + ORGANIZED_DATA, 
		function selectCb(err, results, fields) {
			if (err) throw err;
			else console.log("successfully inserted into database");
		});
	// Retrieving data from the database.
	// How wil this be done? Select which query we will use
	} else if (cmd == "GET") {
		mysql.query('select ' + SQL_QUERY), function (err, result, fields) {
			if (err) throw err;
			else {
				// do something with the result and return to the main server.
			}
		}
	}
}
// Server that will handle each events
http.createServer(function(req, res) {
	if (req.method == 'POST') {
		if (req.url == '/blog') {
			// parameter: blog
			//            a string indicating a new blog to track by its {base-hostname}
			// RESPONSE: HTTP status 200 if accepted.
			
			// How do we retrieve data from a blog by {base-hostname}?
			// what is {base-hostname}? given to us?
			
			// data to retrieve...
			// 	URL, DATE, IMAGE or TEXT (something that describes the post), NOTE_COUNT
			
			// we need to keep track of increments per hour, which is done by time_stamp table.
			
			// note to Allen: if we have primary key for url in image table... how are we taking care of multiple images in one url?
				/* I got rid of that table since the prof posted: 
				 * "How you describe those posts is up to you"...
				 * and "You will have to return an image and a text". 
				 * I understand this to mean we need to just return one image and we pick which one */
			
			// retrieve info about the posts that this blogger 'liked' or 'reblogged'
			// /like tumblr API will help us with this step.
			
			databse("INSERT", data); // template
			
			res.writeHead(200);
			res.end();
		}
	} else if (req.method == 'GET') {
		// parameter: limit (optional)
		//	      the maximum number of results to return.
		// parameter: order
		//	      "Trending" or "Recent" indicating how to order JSON
		//	      "Trending" - posts that have the largest increments in note_count in the last hour
		//            "Recent" - most recent posts regardless of  their popularity.
		// RESPONSE: JSON including trend, or recent info
		if (req.url == '/blogs/trends') {
			// return from all information in the database
		} else {
			// return from database with host {base-hostname}
		}
	}
}).listen(PORT);

console.log('Server running at http://127.0.0.1:' + PORT +'/');

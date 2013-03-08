var sys = require("sys");
var request = require('./node-v0.8.18-linux-x86/bin/node_modules/request');
http = require("http");

PORT = 31355;

MIME_TYPES ={
	'.html': 'text/html',
	'.js': 	'text/javascript',
	'.txt': 'text/plain'
};

//handling tumblr
var KEY = 'VdAQkUPDY46fUmqRVGqRCY3ncJvrx6SDKAl5bQN7Tw2xZgxeY9';

// Handling Database
var _mysql = require("./node-v0.8.18-linux-x86/bin/node_modules/mysql");
var _HOST = "dbsrv1.cdf.toronto.edu";
var _PORT = "3306"; // standard sql PORT
var _USER = "g1sigal";
var _PASS = "lohbiari";
var DATABASE = "csc309h_g1sigal"; // this database? or a2.sql we created? 
											/* we'll have to run a2.sql just 
											 * once on csc309h_{cdf_user_name} to create the tables */
// db tables
var BLOG_TBL = "blog";
var POST_TBL = "post";
var IMAGE_TBL = "image";
var TMSTMP_TBL = "time_stamp";

var mysql = _mysql.createConnection({
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

function insertBlog(hostname) {
	insertIntoDB(BLOG_TBL, "url", hostname);
}

/*
 * Insert into database information in the form of:
 * (table name, field name, value to insert)
 */
function insertIntoDB(tbl, field, value) {
	console.log("about to insert");
	mysql.query("insert into " + tbl + " (" + field + ") values ('" + value + "')", function selectCb(error, results, fields) {
      if (error) {
          console.log('GetData Error: ' + error.message);
          mysql.end();
          return;
      }
 });
console.log("inserted");
}

function getInfoFromDB(tbl, field, value) {
	mysql.query('select ');
}

/*
 * Return true if value exists in db table under field
 */
function exists_in_db(tbl, field, value) {
  //TODO: implement me
}

/*
 * Insert into db info about liked posts of a blog specified by 'hostname'
 * TODO: figure out what is 'text' and how to handle images
 */
function insertLikes(hostname) {
	request.get({url:'http://api.tumblr.com/v2/blog/'+hostname+'/likes?api_key='+KEY, json:true}, function (error, response, body) {
		if (!error) {
			var post;
			for (var i=0; i<JSON.stringify(body.response.liked_count); i++) {
				post = body.response.liked_posts[i];
				var post_url = JSON.stringify(post.post_url);
				insertIntoDB(POST_TBL, "url", "test");
				//if(!exists_in_db(POST_TBL, "url", post_url)) {
				  // insert into 'post' table all relavent info
				insertIntoDB(POST_TBL, "url", JSON.stringify(post.post_url)); // insert url
				  // insert text
				  // insert image
				insertIntoDB(POST_TBL, "date", JSON.stringify(post.date)); // insert date
				
			}
		}
	}) 
}

// Server that will handle each events
http.createServer(function(req, res) {
	if (req.method == 'POST') {
		if (req.url == '/blog') {
			// parameter: blog
			//            a string indicating a new blog to track by its {base-hostname}
			// RESPONSE: HTTP status 200 if accepted.
			
			// How do we retrieve data from a blog by {base-hostname}?
				/* see insertLikes function */
			// what is {base-hostname}? given to us?
				/* i think it's safe to assume it's given to us in the request */
			// data to retrieve...
			// 	URL, DATE, IMAGE or TEXT (something that describes the post), NOTE_COUNT
			
			// we need to keep track of increments per hour, which is done by time_stamp table.
			
			// note to Allen: if we have primary key for url in image table... how are we taking care of multiple images in one url?
				/* changed so that it's no longer a primary key */
			
			// retrieve info about the posts that this blogger 'liked' or 'reblogged'
			// /like tumblr API will help us with this step.
			
			//databse("INSERT", data); // template
			mysql.connect();
			console.log("about to insert likes");
			insertLikes("noalglais.tumblr.com");
			console.log("inserted likes");
			mysql.end();
			
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

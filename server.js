var sys = require("sys");
var request = require('./node-v0.8.18-linux-x86/bin/node_modules/request');
http = require("http");
qs = require("querystring");
PORT = 31355;

MIME_TYPES ={
	'.html': 'text/html',
	'.js': 	'text/javascript',
	'.txt': 'text/plain'
};

//handling tumblr
var KEY = 'VdAQkUPDY46fUmqRVGqRCY3ncJvrx6SDKAl5bQN7Tw2xZgxeY9';
//timeout
var timeout;
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

mysql.connect(function(error, results) {
	if(error) {
		console.log('Connection Error: ' + error.message);
		return;
	}
	console.log('Connected to database');
});


/*************************** FUNCTION FOR DATABASE INTERACTION ***************************/

function database(cmd, tbl, field, value, post_url) {
	
	if (cmd == "INSERT") {
		mysql.query("insert into " + tbl + " (" + field + ") values ('" + value + "')", 
					function (error, results, fields) {
			if (error) {
				console.log('Insert Error: ' + error.message);
				mysql.end();
				return;
			}
			console.log("inserted " + value);
		});

	} else if (cmd == "GET") {
		mysql.query("select * from " + tbl + " where " + field + "=" + value, function (error, results, fields) {
			if (error) {
				console.log('Select Error: ' + error.message);
				mysql.end();
				return;
			}
			if (results.length > 0) {
				mysql.callback(results);
			}
		});
	}
	else if (cmd == "EXISTS") {
		mysql.query("select exists(select * from " + tbl + " where " + field + " = '" + value + "')", function (error, results, fields) {
			if (error) {
				console.log('Exists Error: ' + error.message);
				mysql.end();
				return;
			}
			else if (results[0] == 1) {
				console.log(mysql.callback(results[0]));
				return true;
			}
			else {
				console.log(mysql.callback(results[0]));
				return false;
			}
		});
	}
	else if (cmd == "UPDATE") {
		mysql.query("update "+tbl+" set "+field+"=? where url=?", [value, post_url], function (error, results, fields) {
			if (error) {
				console.log('Update Error: ' + error.message);
				mysql.end();
				return;
			}
		});
	}
}


/*************************** POST METHOD FUNCTIONS ***************************/

/*
 * Insert a blog URL into database
 */
function insertBlog(hostname) {
	console.log("inserting");
	database("INSERT", BLOG_TBL, "url", hostname, "");
	console.log("inserted");
}

function insertLikesHelper(hostname, count) {
	var off;
	for (off = 0; off < count+50; off+=50) {
		request.get({url:'http://api.tumblr.com/v2/blog/'+hostname+'/likes?api_key='+KEY+'&limit=50&offset='+off, json:true}, function (error, response, body) {
			if (!error) {
				var post;
					console.log(body.response.liked_count);
				for (var i=0; i<body.response.liked_count; i++) {
					post = body.response.liked_posts[i];
					if (post) {
						database("INSERT", POST_TBL, 'url', post.post_url,"");
						console.log(i);
					}
	// 				database("INSERT", POST_TBL, 'dt', post.date);
					
					//if(!database("EXISTS", POST_TBL, "url", JSON.stringify(post.post_url))) {
					    //insert into 'post' table all relavent info
					  //  database("INSERT", POST_TBL, "url", JSON.stringify(post.post_url)); // insert url
					    //insert text
					    //insert image
						//database("INSERT", POST_TBL, "dt", JSON.stringify(post.date)); // insert date
					//}
				}
			}
		}) 
	}
}
/*
 * Insert into db info about liked posts of a blog specified by 'hostname'
 * TODO: figure out what is 'text' and how to handle images
 */
function insertLikes(hostname) {
	request.get({url:'http://api.tumblr.com/v2/blog/'+hostname+'/likes?api_key='+KEY+'&limit=51', json:true}, function (error, response, body) {
		if (!error) {
			insertLikesHelper(hostname, body.response.liked_count);
		  
		  /*
			var post;
				console.log(body.response.liked_count);
 			for (var i=0; i<body.response.liked_count; i++) {
 				post = body.response.liked_posts[i];
				if (post) {
					database("INSERT", POST_TBL, 'url', post.post_url,"");
					console.log(i);
				}
// 				database("INSERT", POST_TBL, 'dt', post.date);
				
				//if(!database("EXISTS", POST_TBL, "url", JSON.stringify(post.post_url))) {
				    //insert into 'post' table all relavent info
				  //  database("INSERT", POST_TBL, "url", JSON.stringify(post.post_url)); // insert url
				    //insert text
				    //insert image
					//database("INSERT", POST_TBL, "dt", JSON.stringify(post.date)); // insert date
				//}
 			}*/
		}
	}) 
}
/*
	url varchar(50) primary key,
	blog_url varchar(50) not null,
	txt varchar(50),
	img varchar(50),
	dt timestamp not null,
	last_track date not null,
	note_count integer not null*/
/*************************** GET METHODS FUNCTIONS ***************************/
/*** GET /blog/{base-hostname}/trends is method_type 1 ***/
/*** GET /blog/{base-hostname}/trends IS method_type 2 ***/

/*
 * Return post information in JSON format
 */
function getPostInfo(post_url) {

	var trending = { "url": "", "text": "", "image": "", "date": "", "last_track": "", "last_count": 0, "tracking": []};
	
	// get the posts associated with hostname
	var post = database("GET", POST_TBL, "url", post_url);
		
	trending.url = post[0].url;
	trending.text = post[0].txt;
	trending.image = post[0].img;
	trending.date = post[0].dt;
	trending.last_track = post[0].last_track;
	trending.last_count = post[0].last_count;
	
	// get the trackings associated with the post
	var tracking = database("GET", TMSTMP_TBL, "url", post_url);
	for (var i=0; i<tracking.length; i++) {
		var track = {"timestamp": "", "sequence": 0, "increment": 0, "count": 0 }
			
		track.timestamp = tracking[i].ts;
		track.sequence = tracking[i].seq;
		track.increment = tracking[i].inc;
		track.count = tracking[i].cnt;
			
		trending.tracking.push(track);
	}

	return trending;
}

/*
 * Return trend information specified by a basename in JSON format
 */
function getTrendInfo(basename, order, limit, method_type) {
	var trends = {"trending": [], "order" : order, "limit" : limit};
	
	var posts = new Array();
	if (method_type == 1) { // method is GET /blog/{base-hostname}/trends
		// get post urls that are related to a specific basename (blog)
		posts = database("GET", POST_TBL, "blog_url", basename);
	
	} else { // method is  GET /blog/trends 
		// get all posts that exist in the database
		posts = database("GET", POST_TBL, "url", POST_TBL);
	}
	
	// when we get to figuring out order we're gonna need this
	/*
	var filteredPosts = new Array();
	if (order == "Trending") {
		filteredPosts = filterByTrending(posts);
	} else {
		filteredPosts = filterByRecent(posts);
	}*/
	
	// change 'posts' to filteredPosts after filtering functions are implemented
	for (var i=0; i<posts.length; i++) {
		var post = getPostInfo(posts[i].url);
		trends.trending.push(post);
	}
	
	return trends;
}

/*************************** SERVER THAT WILL HANDLE EACH EVENT ***************************/

// QUESTION: how do we get the parameters and how are they formatted?
//curl -X POST -d blog=fastcompany.tumblr.com http://localhost:31355/blog
//node-v0.8.18-linux-x86/bin/node server.js
// mysql -p -h dbsrv1 -u g1sigal csc309h_g1sigal

http.createServer(function(req, res) {
	if (req.url == '/') {
		//insertLikes("noalglais.tumblr.com");
		res.writeHead(200);
		res.end();
// mysql -p -h dbsrv1 -u g1sigal csc309h_g1sigal
	}
	if (req.method == 'POST') {
		if (req.url == '/blog') {
		console.log(req.url);
		 
		var id = "";
		// Load reply info.
		req.on('data', function(buf){
			id += buf.toString();
		});
		
		req.on('end', function() {
			var hostname = qs.parse(id).blog;
			insertBlog(hostname);
			insertLikes(hostname);
			res.writeHead(200);
			res.end();
		});
		
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
		//insertBlog(hostname); // insert blog to host
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
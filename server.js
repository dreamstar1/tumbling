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
// Handling Database
var _mysql = require("./node-v0.8.18-linux-x86/bin/node_modules/mysql");
var _HOST = "dbsrv1.cdf.toronto.edu";
var _PORT = "3306"; // standard sql PORT
var _USER = "g2junhee";
var _PASS = "eebiepic";
var _DATABASE = "csc309h_g2junhee"; // this database? or a2.sql we created? 
											/* we'll have to run a2.sql just 
											 * once on csc309h_{cdf_user_name} to create the tables */
// db tables
var BLOG_TBL = "blog";
var POST_TBL = "post";
var IMAGE_TBL = "image";
var TMSTMP_TBL = "time_stamp";
var LIKES_TBL = "likes";

// mysql -p -h dbsrv1 -u g2_junhee -p eebiepic csc309h_g2junhee
var mysql = _mysql.createConnection({
	host: _HOST,
	port: _PORT,
	user: _USER,
	password: _PASS,
	database: _DATABASE
});


mysql.connect(function(error, results) {
	if(error) {
		console.log('Connection Error: ' + error.message);
		return;
	}
	console.log('Connected to database');
});

/*************************** FUNCTION FOR DATABASE INTERACTION ***************************/
function extractData(basename, order, limit, onSuccess, onErr) {
	if (basename == "") {
		if (order == "Trending") {
			mysql.query("select * " + 
				    "from (select ts, url, inc, cnt, max(seq) from time_stamp group by url) T, post P "+
				    "where T.url = P.url order by inc DESC LIMIT 0, "+ limit ,function (error, results) {
			if (error) {
				console.log('Select Error: ' + error.message);
				mysql.end();
				onErr();
			}
				onSuccess(results);
			});
		}
		else if (order == "Recent") {
			mysql.query("select * from post order by dt DESC LIMIT 0, "+ limit ,function (error, results) {
			if (error) {
				console.log('Select Error: ' + error.message);
				mysql.end();
				onErr();
			}
				onSuccess(results);
			});
		}
	}
	else if (basename) {
		if (order == "Trending") {
			mysql.query("select * " + 
				    "from (select ts, url, inc, cnt, max(seq) from time_stamp group by url) T, post P "+
				    "where T.url = P.url and P.blog_url = '"+ basename +"' order by inc DESC LIMIT 0, "+ limit ,function (error, results) {
			if (error) {
				console.log('Select Error: ' + error.message);
				mysql.end();
				onErr();
			}
				onSuccess(results);
			});
			
		}
		else if (order == "Recent") {
			mysql.query("select * from post where blog_url = '"+ basename + "'"+ "order by dt DESC LIMIT 0, "+ limit ,function (error, results) {
				if (error) {
					console.log('Select Error: ' + error.message);
					mysql.end();
					onErr();
				}
				
			});
		  
		}
	}
}

function insertDB(tbl, data, hostname, onSuccess, onErr) {
	if (tbl == BLOG_TBL) {
		existsInDB(tbl, "url", data, "", function (exists) {
			if (!exists) {
				console.log(data + " is inserted into table " + tbl);
				mysql.query("insert into blog values ('"+data+"')", function (err, results, fields) {
					if (err) {
						console.log('Insert Error: ' + error.message);
						mysql.end();
					}
				});
			}
		});
	}
	else if (tbl == POST_TBL) {
		existsInDB(tbl, "url", data.post_url, "", function (exists) {
			if (!exists) {
				var cols = "url, txt, img, dt";
				var img = "";
				if (data.image_permalink) {
					img = data.image_permalink;
				}
				var vals = data.post_url + "', " 
				 + "'" + data.slug + "', "
				 + "'" + img + "', "
				 + "'" + data.date;
				 
				mysql.query("insert into " + tbl + " (" + cols + ") values ('" + vals + "')", function (err, results, fields) {
					if (err) {
						console.log('Insert Error: ' + error.message);
						mysql.end();
					}
				});
				console.log("insert into " + LIKES_TBL + " values ('"+data.post_url+"', '"+hostname+"')");
				mysql.query("insert into " + LIKES_TBL + " values ('"+data.post_url+"', '"+hostname+"')", function(err, results, fields) {
					if (err) {
						console.log('Insert Error: ' + error.message);
						mysql.end();
					}
				});
			} else {
				mysql.query("insert into " + LIKES_TBL + " values ('"+data.post_url+", "+hostname+"')", function(err, results, fields) {
					if (err) {
						console.log('Insert Error: ' + error.message);
						mysql.end();
					}
				});
			}
		});
	}
	else if (tbl == TMSTMP_TBL) {
		existsInDB(tbl, "url", data.post_url, "", function (exists) {
			if (!exists) {
				var cols = "ts, url, seq, inc, cnt";
				var vals = getTime() + "', '"
					 + data.post_url + "', '"
					 + "0', '0', '" + data.note_count;
					 
				mysql.query("insert into " + tbl + " (" + cols +") values ('" + vals + "')", function (err, results, fields) {
					if (err) {
						console.log('Insert Error: ' + error.message);
						mysql.end();
					}
				});
			}
		});
	}
}
// 		posts = database("GET", POST_TBL, "", "*", "");
function existsInDB(tbl, field, value, key, onSuccess, onErr) {
	mysql.query("select exists(select * from " + tbl + " where " + field + " = '" + value + "') exist", function (error, results, fields) {
		if (error) {
			console.log('Exists Error: ' + error.message);
			mysql.end();
			onErr();
		}
		onSuccess(results[0].exist);
	});
	
}


/*************************** POST METHOD FUNCTIONS ***************************/

/*
 * Insert a blog URL into database
 */
function insertBlog(hostname) {
	// Url of a blogger that we are tracking.
	console.log("insertBlog("+hostname+")");
	insertDB(BLOG_TBL, hostname);
}

/*
 * Returns the current time in this format Last Track: 2013-03-11 23:45:57
 */
function getTime(){
  var currentdate = new Date();
  var datetime = currentdate.getFullYear() + "-" + checknumber(currentdate.getMonth()+1) + "-" + checknumber(currentdate.getDate()) + " "
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds() + "EST";
  return datetime;
}

/*
 * Adds an 0 to the number if it is smaller than 10
 */
function checknumber(time){
	 return (time < 10) ? ("0" + time) : time;  
}

function insertLikesHelper(hostname, count) {
	var off;
	for (off = 0; off < count+50; off+=50) {
		request.get({url:'http://api.tumblr.com/v2/blog/'+hostname+'/likes?api_key='+KEY+'&limit=50&offset='+off, json:true}, function (error, response, body) {
			if (!error) {
				var post;
				var vals;
				var pcols = "url, blog_url, txt, img, dt";
				var tcols = "ts, url, seq, inc, cnt";
				for (var i=0; i<body.response.liked_count; i++) {
					post = body.response.liked_posts[i];
					if (post) {
						insertDB(POST_TBL, post, hostname);
						insertDB(TMSTMP_TBL, post, hostname);
					}
				}
			}
		}); 
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
		}
		else{console.log("error in insertlikes"); }
	}) 
}

function insertTracking(post_url, count) {
	var cols = "ts, url, seq, inc, cnt";
	var vals;

	var ts = getTime();
	var url = post_url;
	var cnt = count;

	var note_count = database("GET", POST_TBL, "note_count", post_url, "");
	var inc = cnt - note_count[0].note_count;
	var seq;
	if (!database("EXISTS", TMSTMP_TBL, "url", post_url)) {
		vals = ts + "', "
		+ "'" + url + "', "
		+ "'" + seq + "', "
		+ "'" + inc + "', "
		+ "'" + cnt;
		seq = 1;
	} else {
		seq = mysql.query("select max(seq) as max_seq from time_stamp where url = 'post_url'", function (error, results, fields) {
		if (error) {
		  console.log('Select MAX Error: ' + error.message);
		  mysql.end();
		  return;
		}
		return results;
		});
		seq = seq[0].max_seq;
		vals = ts + "', "
		+ "'" + url + "', "
		+ "'" + seq + "', "
		+ "'" + inc + "', "
		+ "'" + cnt;
	}
	database("INSERT", TMSTMP_TBL, cols, vals);
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
/*** GET /blog/trends is method_type 2 ***/

/*
 * Return post information in JSON format
 */
function getPostInfo(post_url) {

	var trending = { "url": "", "text": "", "image": "", "date": "", "last_track": "", "last_count": 0, "tracking": []};
	
	// database param cmd, tbl, field, value, key
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
	if (method_type == 1) { // method is GET /blog/{base-hostname}/trends
		// get post urls that are related to a specific basename (blog)
// 		//database("GET", POST_TBL, "blog_url", "*", basename);

		extractData(basename, order, limit, 
			    function(posts) { console.log(posts); }, function() { console.log("ERROR!"); });
	} else { // method is GET /blog/trends
		// get all posts that exist in the database
		console.log("we are in getTrendInfo with method_type 1, getting trends thank you. " + basename);
		extractData(basename, order, limit, 
			    function(posts) { console.log(posts); }, function() { console.log("ERROR!"); });

	return trends;
	}
}

function updateDB(){
	//cron to count to 1 hour
	
	//if new like in read from API -> update DB 
	//if like in DB not in API -> delete column
	
	//what if someone deletes a post? not a problem cuz API will know
	//post a new post? not a problem
	//new blog created? not a problem
	

	// database param cmd, tbl, field, value, key	
	var blogs = database("GET", BLOG_TBL, "url", "*");
	//get all, return in array??? Need to be tested
	for (var i = 0; i<blogs.length; i++){
	    var blog = blogs[i].url;
	    insertLikes(blog);
	}
	
	
	//note to Simon: haven't worked on deletion in DB
}
/*************************** SERVER THAT WILL HANDLE EACH EVENT ***************************/




http.createServer(function(req, res) {
	if (req.url == '/') {
		res.writeHead(200);
		res.end();
	}
	if (req.method == 'POST') {
		// parameter: blog
		//            a string indicating a new blog to track by its {base-hostname}
		if (req.url == '/blog') {
			console.log(req.url);
			
			var rawData = "";
			
			// Load {base-hostname}.
			req.on('data', function(buf){
				rawData += buf.toString();
			});
			
			req.on('end', function() {
				var hostname = qs.parse(rawData).blog;
				insertBlog(hostname); // tracking blogs
 				insertLikes(hostname); // post liked by our tracking blogs.
				// RESPONSE: HTTP status 200 if accepted.
				res.writeHead(200);
				res.end();
			});
		}
	} else if (req.method == 'GET') {
		console.log(req.url);
		if (req.url == '/blogs/trends') {
			var data = "";
			var order = "";
			var limit = "";
			
			req.on('data', function(buf){
				data += buf.toString();
			});
			
			var order = "";
			var limit = 20;
			req.on('end', function() {
				var param = qs.parse(data);
				order = param.order; // order is always presented
				if (param.length > 1) {
				      limit = param.limit; // find limit if exists
				}
				console.log("Order = " + order);
				console.log("Limit = " + limit);
				var trendinfo = getTrendInfo("", order, limit, 2);
				console.log("trendinfo = " + trendinfo);
				res.writeHead(200);
				res.end();
			});
		}
		// parameter: order as 1st argument of -d in curl
		//	      "Trending" or "Recent" indicating how to order JSON
		//	      "Trending" - posts that have the largest increments in note_count in the last hour
		//            "Recent" - most recent posts regardless of  their popularity.
		// parameter: limit (optional) as 2nd argument of -d in curl
		//	      the maximum number of results to return.
		// RESPONSE: JSON including trend, or recent info
		var split_url = req.url.split("/");
// 		if (req.url == '/blogs/trends') {
// 			req.on('data', function(buf){
// 				var curl_data = buf.toString();
// 				var order = curl_data.split(" ")[0]; //first argument of -d as order
// 				if (curl_data.split(" ")[1] != undefined){
// 					var limit = curl_data.split(" ")[1]; //second argument of -d as limit
// 				}
// 			});
// 	
// 		}

		//return the ordered posts of the specified hostname's likes
// 		console.log(split_url[1]);
// 		console.log(split_url[split_url.length-1]);
// 		console.log(split_url[2]);
		// _ / blog / hostname/ trends
		// 0     1        2        3
		if (split_url.length == 4) {
			var bt = split_url[1]+"/"+split_url[3];
			if (bt == "blog/trends") {
				var hostname = split_url[2];
				existsInDB(BLOG_TBL, "url", hostname, "", function(exist) {
				  //if the hostname already exist in DB
					//TODO: implement code to find trend with the hostname
 					var param;
 					var data;
 					req.on('data', function(buf) {
 						data += buf;
 					});
 					var order = "";
 					var limit = "";
 					req.on('end', function() {
 						param = qs.parse(data);
 						order = param.order; // order is always presented
 						if (param.length > 1) {
 						      limit = param.limit; // find limit if exists
 						}
 					});
 					var trendinfo = getTrendInfo(POST_TBL, order, limit, 1);
					
					
					res.writeHead(200);
					res.end();
					}, function(err) 
					//if hostname doesn't exist in DB
					{console.log("NOPE it doesn't exist");});	  
			}
		}
	}
}).listen(PORT);

console.log('Server running at http://127.0.0.1:' + PORT +'/');

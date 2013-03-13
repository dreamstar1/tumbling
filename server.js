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
			mysql.query("SELECT P.url, P.txt, P.img, P.dt, T.ts, T.seq, T.inc, T.cnt  FROM time_stamp T, post P WHERE T.ts > "+getTime(1)+" and T.url=P.url ORDER BY inc DESC LIMIT 0, " + limit, function (error, results) {
			if (error) {
				console.log('Select Error: ' + error.message);
				mysql.end();
				onErr();
			}
				onSuccess(results);
			});
		}
		else if (order == "Recent") {
			mysql.query("select * from time_stamp T, (select * from post order by dt DESC limit 0, "+limit+") P where T.url=P.url order by dt desc, seq desc" ,function (error, results) {
			if (error) {
				console.log('Select Error: ' + error.message);
				mysql.end();
				onErr();
			}
				console.log(results);
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
			mysql.query("select * " + 
				    "from time_stamp T, (select P.url, P.txt, P.img, P.dt from blog B, post P, likes L where L.person=B.url and L.url=P.url and B.url="+basename +" order by dt DESC limit 0, "+limit+") D " +
				    "where T.url=D.url order by dt desc, seq desc" ,function (error, results) {
				if (error) {
					console.log('Select Error: ' + error.message);
					mysql.end();
					onErr();
				}
				onSuccess(results);
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
	insertDB(BLOG_TBL, hostname);
}

/*
 * Returns the current time in this format Last Track: 2013-03-11 23:45:57
 */
function getTime(lastHour){
	var currentdate = new Date();
	if (lastHour) {
		currentdate.setHours(currentdate.getHours() - 1);
	}
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
function trendJSON(data, order, limit, onSuccess) {
	var trends = {"order" : order, "limit" : limit, "trending": []};
	trends.order = order;
	trends.limit = limit;
	var tempTrend = [];
	var i = 0;
	while (i < data.length) {
		var trend = { "url": "", "text": "", "image": "", "date": "", "last_track": "", "last_count": 0, "tracking": []};
		if (data[i].seq > 0) {
			post = data[i];
			trend.url = post.url;
			trend.text = post.txt;
			trend.image = post.img;
			trend.date = post.dt;
			trend.last_track = post.ts;
			trend.last_count = post.cnt;
			var j = post.seq;
			while (j > 0) {
				track = {"timestamp": "", "sequence": 0, "increment": 0, "count": 0};
				post = data[i];
				track.timestamp = post.ts;
				track.sequence = post.seq;
				track.increment = post.inc;
				track.count = post.cnt;
				trend.tracking.push(track);
				i++;
				j--;
			}
			tempTrend.push(trend);
			i++;
		} else {
			post = data[i];
			trend.url = post.url;
			trend.text = post.txt;
			trend.image = post.img;
			trend.date = post.dt;
			trend.last_track = post.ts;
			trend.last_count = post.cnt;
			tempTrend.push(trend);
			i++;
		}
	}
	trends.trending = tempTrend;
	onSuccess(trends);
}

/*
* Return trend information specified by a basename in JSON format
*/
function getTrendInfo(basename, order, limit, method_type , onSuccess) {
	if (method_type == 1) { // method is GET /blog/{base-hostname}/trends
		// get post urls that are related to a specific basename (blog)
// 		//database("GET", POST_TBL, "blog_url", "*", basename);

		extractData(basename, order, limit, 
			function(posts) {
				trendJSON(posts, order, limit, function(json) {
					onSuccess(json);
				});
			}, function() { console.log("ERROR!"); });
	} else { // method is GET /blog/trends
		// get all posts that exist in the database
		extractData(basename, order, limit, 
			function(posts) { 
				trendJSON(posts, order, limit, function(json) {
					onSuccess(json);
				});
			}, function() { console.log("ERROR!"); });
	}
}

function updateDB(){
	
}
/*************************** SERVER THAT WILL HANDLE EACH EVENT ***************************/




http.createServer(function(req, res) {
	if (req.url == '/') {
		time = {"last": getTime(1), "current": getTime()};
		res.writeHead(200);
		res.end(JSON.stringify(time));
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
		// parameter: order as 1st argument of -d in curl
		//	      "Trending" or "Recent" indicating how to order JSON
		//	      "Trending" - posts that have the largest increments in note_count in the last hour
		//            "Recent" - most recent posts regardless of  their popularity.
		// parameter: limit (optional) as 2nd argument of -d in curl
		//	      the maximum number of results to return.
		// RESPONSE: JSON including trend, or recent info
		console.log(req.url);
		var split_url = req.url.split("/");
		if (req.url == '/blogs/trends') {
			var data = "";
			
			req.on('data', function(buf){
				data += buf.toString();
			});
			
			var order = "Recent";
			var limit = 20;
			req.on('end', function() {
				var param = qs.parse(data);
				if (param.order) {
					order = param.order; // order is always presented
				  
				}
				if (param.limit) {
				      limit = param.limit; // find limit if exists
				}
				getTrendInfo("", order, limit, 2, function(trendinfo) {
// 					res.end(JSON.stringify(trendinfo));
					res.writeHead(200);
//    					console.log(trendinfo);
					res.end();
				});
			});
		}
		//return the ordered posts of the specified hostname's likes
		// _ / blog / hostname/ trends
		// 0     1        2        3
		else if (split_url.length == 4) {
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

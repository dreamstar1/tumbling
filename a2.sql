-- blogs we are tracking
create table blog (
	url varchar(50) primary key
);

-- posts we are tracking
create table post (
	url varchar(50) primary key,
	blog_url varchar(50) not null,
	txt varchar(50),
	img varchar(50),
	dt timestamp not null,
	last_track timestamp not null,
	note_count integer not null
);

-- store image and post associated with it
create table image (
  url varchar(50),
  post varchar(50) references post(url)
);

-- time stamp associated with posts
create table time_stamp (
  id integer auto_increment primary key, 
  ts timestamp,
  url varchar(50) references post(url),
  seq integer,
  inc integer,
  cnt integer
);



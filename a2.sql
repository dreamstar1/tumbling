-- blogs we are tracking
create table blog (
	url varchar(50) primary key
);

-- posts we are tracking
create table post (
	url varchar(50) primary key,
	txt varchar(50),
	dt date not null,
	last_track date not null,
	last_count integer not null
);

-- images associated with posts
create table image (
  url varchar primary key,
  post foreign key references post(url)
);

-- time stamp assiciated with posts
create table time_stamp (
  id integer auto_increment primary key, 
  url varchar(50) references post(url),
  seq integer,
  inc integer,
  cnt integer
);



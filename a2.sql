-- blogs we are tracking
create table blog (
	url varchar(500) primary key
);

-- posts we are tracking
create table post (
	url varchar(500) primary key,
	txt varchar(500),
	img varchar(500),
	dt timestamp not null
);

-- store image and post associated with it
create table image (
	url varchar(500),
	post varchar(500) references post(url)
);

-- time stamp associated with posts
create table time_stamp (
	id integer auto_increment primary key, 
	ts timestamp,
	url varchar(500) references post(url),
	seq integer,
	inc integer,
	cnt integer
);

create table likes (
	url varchar(500) not null,
	person varchar(500) not null,
	primary key(url, person),
	foreign key(url) references post(url),
	foreign key(person) references blog(url)
);


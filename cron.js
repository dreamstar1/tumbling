var sys = require("sys");
http = require('http');
fs = require('fs');
path = require('path');
var request = require('./node-v0.8.18-linux-x86/bin/node_modules/request');
var KEY = 'VdAQkUPDY46fUmqRVGqRCY3ncJvrx6SDKAl5bQN7Tw2xZgxeY9';
var PORT = 31160;


var cronJob = require('./node-v0.8.18-linux-x86/bin/node_modules/cron').CronJob; //need to install cron by running npm install cron
var job = new cronJob({
  cronTime: '0 * * * * *', //minute hour day month day-of-week
  onTick: function() {
    //the function will be ran every hour 
    console.log('hello!');
  },
  start: true, //or use job.start() outside
});
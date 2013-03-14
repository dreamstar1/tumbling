
var cronJob = require('./node-v0.8.18-linux-x86/bin/node_modules/cron').CronJob; //need to install cron by running npm install cron

var job = new cronJob({
  cronTime: '0 * * * *', //minute hour day month day-of-week
  onTick: function() {
    //the function will be ran every hour 
    console.log('hello!');
  },
  start: true, //or use job.start() outside
});
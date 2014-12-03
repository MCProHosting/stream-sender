var fs   = require('fs');
var path = require('path');

var config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/config.js')));

var WHMCSListReader      = require('./lib/whmcslistreader')
var Sender          = require('./lib/sender');
var listReader      = new WHMCSListReader(config);


listReader.readEmailList(function(list) {
    var sender = new Sender(config, list);
    sender.send(function(emailsSent, executionTime) {
        setTimeout(function() {
            console.log("E-Mail sending complete! Sent a total of " + emailsSent + " emails over the course of " + executionTime + " seconds.");
            process.exit();
        }, 1500);
    });
});
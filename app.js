var fs                  = require('fs');
var path                = require('path');
var WHMCSListReader     = require('./lib/whmcslistreader')
var StaticReader     = require('./lib/staticreader')
var Sender              = require('./lib/sender');
var config              = require('./config/config.js');

var ListReader = require('./lib/' + config.reader);
var listReader = new ListReader(config);

listReader.readEmailList(function(list) {
    var sender = new Sender(config, list);
    sender.send(function(emailsSent, executionTime) {
        setTimeout(function() {
            console.log("E-Mail sending complete! Sent a total of " + emailsSent + " emails over the course of " + executionTime + " seconds.");
            process.exit();
        }, 1500);
    });
});

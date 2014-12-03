var fs         = require('fs');
var path       = require('path');
var nodemailer = require('nodemailer');
var ejs        = require('ejs');
var async      = require('async');

function Sender(config, list) {
    this.config     = config;
    this.list       = list
    this.mailer     = nodemailer.createTransport(this.config.smtp);
}

Sender.prototype.buildTemplate = function(firstname, lastname) {
    var context = {
        firstname: firstname,
        lastname: lastname
    }

    var path = this.config.email.templatePath;
    var template = fs.readFileSync(path, 'utf-8');
    return ejs.render(template, context);
}

Sender.prototype.sendMailToUser = function(email, firstname, lastname) {
    var html = this.buildTemplate(firstname, lastname);
    var mailOptions = {
        from:       this.config.email.from,
        to:         email,
        subject:    this.config.email.subject,
        html:       html
    };

    if (this.config.readonly) {
        console.log("READ ONLY: Not sending E-Mail to: " + email);
        return;
    }

    this.mailer.sendMail(mailOptions, function(err, info) {
        if (!err) {
            console.log("Successfully sent to " + email + " " + info.response);
        } else {
            console.error("Error sending to: " + email + " " + err);
        }
    });
}

Sender.prototype.send = function(cb) {
    var self = this;

    var startTime = Date.now();
    async.forEachSeries(this.list, function(e, cb) {
        setTimeout(function() {
            self.sendMailToUser(e.email, e.firstname, e.lastname);
            cb();
        }, (self.config.throttle.interval*1000))
    }, function(err) {
        if (err) {
            console.error(err);
        } else {
            var endTime = Date.now();
            var executionTime = (endTime-startTime)/1000;
            cb(self.list.length, executionTime);
        }
    });
}

module.exports = Sender;
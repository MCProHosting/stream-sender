var fs         = require('fs');
var path       = require('path');
var nodemailer = require('nodemailer');
var ejs        = require('ejs');
var async      = require('async');

function Sender(config, list) {
    this.config     = config;
    this.list       = list;
    this.id         = 'TID-' + Date.now();
    this.mailer     = nodemailer.createTransport(this.config.smtp);

    fs.appendFileSync('sendlog.txt', (new Date()).toISOString() + ' ' + this.id + ' ' + this.config.email.templatePath);
}

Sender.prototype.buildTemplate = function(context) {
    var path = this.config.email.templatePath;
    var template = fs.readFileSync(path, 'utf-8');
    return ejs.render(template, context);
}

Sender.prototype.sendMailToUser = function(context) {
    var email = context.email.trim();
    if(email.length < 1) return;

    var html = this.buildTemplate(context);
    var mailOptions = {
        from:       this.config.email.from,
        to:         email,
        subject:    this.config.email.subject,
        html:       html,
        headers: {
            'X-StreamSender-ID': this.id
        }
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
            self.sendMailToUser(e);
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

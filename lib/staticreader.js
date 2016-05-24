var fs = require('fs');

function StaticReader(config) {
    this.config = {
        filename: config.filename
    };
}

StaticReader.prototype.init = function() {

}

StaticReader.prototype.readEmailList = function(cb) {
    fs.readFile(this.config.filename, function(err, file) {
        if (!err) {
            var emails = [];
            file.toString().replace(/[\r\n]+/g, "\n").trim().split('\n').forEach(function(line) {
                line = line.trim().split(',');
                emails.push({email: line[2], firstname: line[0], lastname: line[1], unsublink: line[3], id: 312659});
            });
            cb(emails);
        } else {
            console.error(err);
        }
    });
}

module.exports = StaticReader;

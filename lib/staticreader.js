var fs = require('fs');

function StaticReader(config) {

}

StaticReader.prototype.init = function() {

}

StaticReader.prototype.readEmailList = function(cb) {
    fs.readFile('emails.txt', function(err, file) {
        if (!err) {
            var emails = [];
            file.toString().replace(/[\r\n]+/g, "\n").trim().split('\n').forEach(function(line) {
		line = line.trim().split(',');
                emails.push({firstname: line[2], lastname: line[1], email: line[0], id: 312659});
            });
            cb(emails);
        } else {
            console.error(err);
        }
    });
}

module.exports = StaticReader;

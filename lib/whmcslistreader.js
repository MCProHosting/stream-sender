var mysql = require('mysql');

function WHMCSListReader(config) {
    this.config = {
        marketing:  config.email.marketing,
        host:       config.db.host,
        user:       config.db.user,
        password:   config.db.password,
        database:   config.db.database
    }
}

WHMCSListReader.prototype.init = function() {
    var connection = mysql.createConnection(this.config);
    this.connection = connection;

    connection.connect();
    return connection;
}

WHMCSListReader.prototype.readEmailList = function(cb) {
    var connection = this.init(this.config);
    var query = 'SELECT firstname,lastname,email FROM tblclients';

    if (this.config.marketing) {
        query += ' WHERE emailoptout=0';
    }

    this.connection.query(query, function(err, results) {
        if (!err) {
            cb(results);
        } else {
            console.error(err);
        }
    });

    connection.end();
}

module.exports = WHMCSListReader;

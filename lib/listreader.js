var mysql = require('mysql');

function ListReader(config) {
    this.config = {
        marketing:  config.email.marketing,
        host:       config.db.host,
        user:       config.db.user,
        password:   config.db.password,
        database:   config.db.database
    }

    this.init(this.config);
}

ListReader.prototype.init = function() {
    var connection = mysql.createConnection(this.config);
    this.connection = connection;

    connection.connect();
    return connection;
}

ListReader.prototype.readEmailList = function(cb) {
    var emails = {};

    if (this.config.marketing) {
        var query = 'SELECT firstname,lastname,email FROM tblclients WHERE emailoptout=0';
    } else {
        var query = 'SELECT firstname,lastname,email FROM tblclients';
    }

    this.connection.query(query, function(err, results) {
        if (!err) {
            cb(results);
        } else {
            console.error(err);
        }
    });
}

module.exports = ListReader;
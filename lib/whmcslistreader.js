var mysql = require('mysql');
var crypto = require('crypto');

function WHMCSListReader(config) {
    this.config = {
        marketing:  config.email.marketing,
        demo:       config.demo,
        host:       config.db.host,
        user:       config.db.user,
        password:   config.db.password,
        database:   config.db.whmcs_database,
        cc_encryption_hash: config.cc_encryption_hash,
	addquery:   config.addquery,
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
    var query = 'SELECT id,firstname,lastname,email FROM tblclients WHERE 1=1 ';

    var self = this;

    if(this.config.demo) {
// mark = 524508, luca = 524744, x, x
//        query += 'AND id IN (524508, 2481, 182180) '; //Use IN() for multiple
        query += 'AND id = 524508 '; //Use IN() for multiple
    } else if (this.config.marketing) {
        query += 'AND emailoptout=0 ';
    }

    if(this.config.addquery) {
	query += 'AND (' + this.config.addquery + ')';
    }


    this.connection.query(query, function(err, results) {
        if (!err) {
            for(var i in results) {
                var result = results[i];
                results[i].unsublink = 'https://clients.mcprohosting.com/unsubscribe.php?email='+encodeURIComponent(result.email)+'&key='+crypto.createHash('sha1').update(result.email).update(''+result.id).update(self.config.cc_encryption_hash).digest('hex');
            }
            cb(results);
        } else {
            console.error(err);
        }
    });

    connection.end();
}

module.exports = WHMCSListReader;

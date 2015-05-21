var mysql = require('mysql');
var crypto = require('crypto');

function MulticraftReader(config) {
    this.config = {
        marketing:  config.email.marketing,
        demo:       config.demo,
        host:       config.db.host,
        user:       config.db.user,
        password:   config.db.password,
        database:   config.db.database, // WHMCS
        multicraft_daemon_database: config.db.multicraft_daemon_database,
        cc_encryption_hash: config.cc_encryption_hash,
        affected_nodes: config.affected_nodes.join(',')
    }
}

MulticraftReader.prototype.init = function() {
    var connection = mysql.createConnection(this.config);
    this.connection = connection;

    connection.connect();
    return connection;
}

MulticraftReader.prototype.readEmailList = function(cb) {
    var connection = this.init(this.config);
    var query = 'SELECT tblclients.id AS id, tblclients.firstname AS firstname, tblclients.lastname AS lastname, tblclients.email AS email FROM tblclients
    				WHERE tblclients.id IN (SELECT userid FROM tblhosting WHERE domainstatus = "Active" AND domain IN (SELECT id FROM '+this.config.multicraft_daemon_database+'.server WHERE daemon_id IN ('+this.config.affected_nodes+')))';

    var self = this;

    if (this.config.marketing) {
        query += ' WHERE tblclients.emailoptout=0';
    }


    this.connection.query(query, function(err, results) {
        if (!err) {
        	if(this.config.marketing) {
	            for(var i in results) {
					var result = results[i];
	                results[i].unsublink = 'https://clients.mcprohosting.com/unsubscribe.php?email='+encodeURIComponent(result.email)+'&key='+crypto.createHash('sha1').update(result.email).update(''+result.id).update(self.config.cc_encryption_hash).digest('hex');
	            }
        	}
            cb(results);
        } else {
            console.error(err);
        }
    });

    connection.end();
}

module.exports = MulticraftReader;

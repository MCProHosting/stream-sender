var mysql = require('mysql');
var crypto = require('crypto');

function MulticraftReader(config) {
    this.config = {
        marketing:  config.email.marketing,
        demo:       config.demo,
        host:       config.db.host,
        user:       config.db.user,
        password:   config.db.password,
        database:   config.db.whmcs_database, // WHMCS
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
    var query = 'SELECT 
                    tblclients.id AS id, tblclients.firstname AS firstname, tblclients.lastname AS lastname, tblclients.email AS email,
                    server.id AS server_id, server.ip AS server_ip, server.port AS server_port,
                    server.daemon_id AS node
                FROM tblclients
                LEFT JOIN tblhosting ON tblhosting.userid = tblclients.id
                LEFT JOIN '+this.config.multicraft_daemon_database+'.server AS server ON tblhosting.domain = server.id
                WHERE server.daemon_id IN ('+this.config.affected_nodes+') AND tblhosting.domainstatus = "Active"';

    var self = this;

    if(this.config.demo) {
        query += ' AND tblclients.id IN (207112, 2481, 182180)';
    } else if (this.config.marketing) {
        query += ' AND tblclients.emailoptout=0';
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

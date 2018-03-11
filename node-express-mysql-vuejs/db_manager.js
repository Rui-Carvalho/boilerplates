const mysql          = require('mysql'),
	  HOST_QA        = '<host_qa>',
      HOST_PROD      = '<host_prod>',
      HOST_LOCAL     = 'localhost',
      MODE_TEST      = 'mode_test',
      MODE_EFFECTIVE = 'mode_production';

// ========== CREATING 2 DB CONNECTIONS (LOCAL AND QA) ==========
const conLocal = mysql.createConnection({
  host:     HOST_LOCAL,
  user:     '<user_local>',
  password: '<password_local>',
  database: '<database_local>'
});

const conQA = mysql.createConnection({
  host:     HOST_QA,
  user:     '<user_qa>',
  password: '<password_qa>',
  database: '<database_qa>'
});

const connectDBs = function() {
	console.log('\n\n');
	conLocal.connect((err) => {
	  if(err){
	    console.log('Error connecting to Local DB');
	    return;
	  }
	  console.log('Connection established with Local DB');
	});

	conQA.connect((err) => {
	  if(err){
	    console.log('Error connecting to QA DB');
	    return;
	  }
	  console.log('Connection established with QA DB');
	});
};

const endDBConnections = (connections) => {
	console.log("closing DB connections...");
	// ========== ENDING DB CONNECTIONS ==========
	conLocal.end((err) => {
	  // The connection is terminated gracefully
	  // Ensures all previously enqueued queries are still
	  // before sending a COM_QUIT packet to the MySQL server.
	});

	conQA.end((err) => {
	  // The connection is terminated gracefully
	  // Ensures all previously enqueued queries are still
	  // before sending a COM_QUIT packet to the MySQL server.
	});
};

const runQuery = (connection, sql) => {
    return new Promise((resolve, reject) => {
        try {
            let result = connection.query( sql, (error, rows, fields) => {
                    if (error) throw error;
                    //rows.forEach( (row) => { results.push(JSON.stringify(row));});
                    resolve(rows);
                }
            );
            console.log('Query executed');
        } catch (err) {
            console.log('Error occurred', err);
            reject(err);
        }
    });
};

module.exports = {
	MODE_TEST:        MODE_TEST,
    MODE_EFFECTIVE:   MODE_EFFECTIVE,
	conLocal:         conLocal,
	conQA:            conQA,
	runQuery:         runQuery,
	connectDBs:       connectDBs,
	endDBConnections: endDBConnections
};
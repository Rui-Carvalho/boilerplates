const db = require('./db_manager');

const method1 = (connection) => {
    return db.runQuery(connection, 'query 1');
};

const method2 = (connection) => {
    return db.runQuery(connection, 'query 2');
};

const method3 = (connection, currency_id) => {
    return db.runQuery(connection,
        'query 3',
        [parameter1]
    );
};

module.exports = {
    method1: method1,
    method2: method2,
    method3: method3
};
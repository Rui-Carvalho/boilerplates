// ------------ CONFIGURATION ------------
require('dotenv').config();
const express     = require('express');
const app         = express();
const path        = require('path');
const server      = require('http').createServer(app);
const axios       = require('axios');
const bodyParser  = require('body-parser');
const querystring = require('querystring');
const config      = require('./config');
const cookie      = require('cookie-parser');
const url         = require('url');

const db          = require('./db_manager');
const logic       = require('./logic');

db.connectDBs();

const ajax = axios.create({
    baseURL: 'https://api.imgur.com/3/',
    headers: { 'Authorization': 'Client-ID ' + process.env.IMGUR_CLIENT_ID }
});

app.use( bodyParser.json() );

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Add a cookie parsing functionality to our Express app
app.use(cookie());

// Parse JSON body and store result in req.body
app.use(bodyParser.json());

// ------------ EXPRESS ROUTES ------------
require('./routes')(app, path, logic, db);

// ------------ STATIC RESOURCES ------------
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// if (process.env.NODE_ENV !== 'production') {
//     require('reload')(server, app);
// }

// ------------ STARTING THE SERVER ------------
server.listen(process.env.PORT, function () {
    console.log('Listening on port '.concat(process.env.PORT))
});

// ------------ CLOSING UP ------------
process.on('SIGINT', handle);
process.on('SIGTERM', handle);

// Using a single function to handle multiple signals
async function handle(signal) {
    console.log("\nExiting...");
    await db.endDBConnections();
    process.exit(0);
}
// ------------------------------------

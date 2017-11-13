/*
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
*/

//'use strict';


var r = require('rethinkdb');
var config = require('config');
//rethinkdbdash
var rdash = require('rethinkdbdash')({
  servers: [
    {host: config.get('rethinkdb.host'), port: config.get('rethinkdb.port')}
  ],
  user: "admin",
  db: config.get('rethinkdb.database'), 
  password: config.get("rethinkdb.password")
});
//job queues 
const Queue = require('rethinkdb-job-queue');
const QueuecxnOptions = {
  host: config.get('rethinkdb.host'),
  port: config.get('rethinkdb.port'),
  user: "admin",
  password: config.get("rethinkdb.password"),
  db: 'JobQueue' // The name of the database in RethinkDB
}
/*
var queueNewAccountEmail = new Queue(QueuecxnOptions, {
  name: 'NewAccountEmail', // The queue and table name
  masterInterval: 310000, // Database review period in milliseconds
  changeFeed: true, // Enables events from the database table
  concurrency: 100,
  removeFinishedJobs: true, // true, false, or number of milliseconds
});
queueNewAccountEmail.jobOptions = {
  priority: 'normal',
  timeout: 300000,
  retryMax: 3, // Four attempts, first then three retries
  retryDelay: 600000 // Time in milliseconds to delay retries
}*/

/*var queueActivateEmail = new Queue(QueuecxnOptions, {
  name: 'ActivateEmail', // The queue and table name
  masterInterval: 310000, // Database review period in milliseconds
  changeFeed: true, // Enables events from the database table
  concurrency: 100,
  removeFinishedJobs: true, // true, false, or number of milliseconds
});
queueActivateEmail.jobOptions = {
  priority: 'normal',
  timeout: 300000,
  retryMax: 3, // Four attempts, first then three retries
  retryDelay: 600000 // Time in milliseconds to delay retries
}*/


//Brute Store 
const BruteRethinkdb = require('brute-rethinkdb')
let bruteStore = new BruteRethinkdb(rdash, {table: 'brute'});

var connection = null;


exports.setup = function(noDefaultDB) {
        return new Promise(function(resolve, reject) {
            var connOpt = {};
            if(!noDefaultDB) {
                connOpt.db = config.get('rethinkdb.database');
            }
            connOpt.host = config.get('rethinkdb.host');
            connOpt.port = config.get('rethinkdb.port');
            connOpt.password = config.get("rethinkdb.password");
            r.connect(connOpt, function(err, conn) {
                if (err) {
                    throw err;
                }
                console.log("DB Connected")
                connection = conn;
                resolve(conn);
            });
        }) 
}

exports.get = function() {
        return r;
}
exports.dash = function() {
    return rdash;
}
exports.conn = function() {
    return connection;
}

//queues 
exports.queue = {};
/*
exports.queue.newAccountEmail = function() {
    return queueNewAccountEmail
}*/
exports.queue.activateEmail = () => {
  return queueActivateEmail;
}


//brute
exports.brute = () => {
  return bruteStore;
}

//return module.exports
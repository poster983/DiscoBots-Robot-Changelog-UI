
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var checkAuth = require('connect-ensure-login');
var mustacheExpress = require('mustache-express');
var socket_io    = require( "socket.io" );
var cowsay = require("cowsay");
var config = require('config');
var fortuneSource = require('fortune-tweetable');
var r = require('rethinkdb');

require('./modules/auth/index.js')(passport);// auth config
require('./modules/db/index.js').setup();

//Routes 
var auth = require('./routes/auth');


//TODO: Check if process.env.COLLECTION is empty, and if it is, roll to production.

var app = express();


// Socket.io
var io           = socket_io();
app.io           = io;





app.engine('mustache', mustacheExpress());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'mustache');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public/images', 'favicon.ico')));


//config 
//app.use(require('morgan')('combined'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(require('express-session')({ secret: config.get('local.secrets.sessionKey'), resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());// persistent login sessions
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: false
}));
app.use(express.static(path.jo in(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use('/bower_components', express.static(path.join(__dirname, 'custom_polymer_components')));

/*
// socket.io events
io.on( "connection", function( socket )
{
    console.log( "A user connected" );


    //Send all relevant changes      ).sort({ date: 1 }).exec(

    socket.on('load changes', function(bot){
      mdb.collection(defaultMongodColl).find({}).sort({ date: 1 }).toArray(function(err, docs) {
        console.log(docs)
        socket.emit('full changelog', docs);
      });
    });

    socket.on('sent new changelog', function(jsonArr){
      console.log('Recieved a new changelog: ' + jsonArr);
       mdb.collection(defaultMongodColl).insert(jsonArr, function(err, records) {
          if (err) {
            socket.emit('save error', "Error saving your change.");
            throw err;
          } else {
            socket.broadcast.emit('new change', records.ops[0]);
            socket.emit('new change user', records.ops[0]._id);
          }
          console.log(records);
          console.log("Record added as "+records.ops[0]._id);
        });
       /*
       db.insert(jsonArr, function (err, newDoc) {   // Callback is optional
          // newDoc is the newly inserted document, including its _id
          // newDoc has no key called notToBeSaved since its value was undefined

          if(err) {
            console.error(err);
            socket.emit('save error', "Error saving your change.");
          } else {
            socket.broadcast.emit('new change', newDoc);
            socket.emit('new change user', newDoc._id);


          }
        });*/
    });

    socket.on('update changelog', function(jsonArr){
      var serID = jsonArr._id;
      delete jsonArr._id
      console.log('Recieved a request to update a changelog: ' + jsonArr.short);
      console.log(jsonArr);
      console.log(ObjectId(serID));
      mdb.collection(defaultMongodColl).update({_id: ObjectId(serID)}, jsonArr, { upsert: false }, function(err, count){
        console.log("run update. " + count + "docs changed.");
        if (err) {
          throw err;
            socket.emit('save error', "Error saving your change.");
            
        } else {
          jsonArr._id = serID;
          socket.broadcast.emit('new updated change', jsonArr);
        }
      })
      /*
       db.update({_id: jsonArr._id}, jsonArr, {}, function (err) {   // Callback is optional
          // newDoc is the newly inserted document, including its _id
          // newDoc has no key called notToBeSaved since its value was undefined
          console.error(err);
          if(err) {
            console.error(err);
            socket.emit('save error', "Error saving your change.");
          } else {
            socket.broadcast.emit('new updated change', jsonArr);
          }
        });*/
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});
*/
app.use('/auth', auth);

// TOP LEVEL ROUTE
app.get('*', checkAuth.ensureLoggedIn('/auth'), function(req, res, next) { //
  var cowsaid = cowsay.say({
    text : fortuneSource.fortune(),
    e : "oo"
  });
  console.log("USER:");
  console.log(req.user);
    res.render('index', { cows: unescape(cowsaid)});
    //res.sendFile('./public/index.html', {root: '.'}); 
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});




// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

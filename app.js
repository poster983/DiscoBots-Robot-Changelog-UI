
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mustacheExpress = require('mustache-express');
var socket_io    = require( "socket.io" );

var Datastore = require('nedb')
  , db = new Datastore({ filename: 'datastores/changes.db', autoload: true });


var app = express();


// Socket.io
var io           = socket_io();
app.io           = io;


// socket.io events
io.on( "connection", function( socket )
{
    console.log( "A user connected" );

    socket.on('chat message', function(msg){
      console.log('message: ' + msg);
       io.emit('chat message', msg);
    });

    socket.on('sent changelog', function(jsonArr){
      console.log('Recieved a new changelog: ' + jsonArr);
       db.insert(jsonArr, function (err, newDoc) {   // Callback is optional
          // newDoc is the newly inserted document, including its _id
          // newDoc has no key called notToBeSaved since its value was undefined

          if(err) {
            console.error(err);
            socket.emit('save error', "Error saving your change.");
          } else {
            socket.broadcast.emit('new change', newDoc);
            
            
          }
        });
    });

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});


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
app.use(require('node-sass-middleware')({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: false,
  sourceMap: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components')));
app.use('/bower_components', express.static(path.join(__dirname, 'custom_polymer_components')));
// TOP LEVEL ROUTE
app.get('*', function(req, res) {
    res.sendFile('./public/index.html', {root: '.'}); 
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

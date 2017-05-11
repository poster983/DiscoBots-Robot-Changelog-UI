var express = require('express');
var config = require('config');
var router = express.Router();
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var checkAuth = require('connect-ensure-login');

var MongoClient = require('mongodb').MongoClient
  , assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var mongoURI = config.get('database.MONGODB_URI');
var accountsColl = config.get('database.accountsCOLLECTION');


//Connect to mongodb
var mdb;
MongoClient.connect(mongoURI, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  mdb = db; 
  //db.close();
});

// used to serialize the user for the session

    passport.serializeUser(function(user, done) {
    	console.log("serializeUser");
        done(null, user._id);
    });
    
    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
    	console.log("deserializeUser");
    	/*
        User.findById(id, function(err, user) {
            done(err, user);
        });*/
        mdb.collection(accountsColl).findOne({"_id": id}, function(err, docs) {
        	done(err, docs);
        });
    });


passport.use('google-signin', new GoogleStrategy({
    clientID: config.get('local.secrets.googleClientID'),
    clientSecret: config.get('local.secrets.googleClientSECRET'),
    callbackURL: config.get('server.url') + "/auth/google/callback/login"
  },
  function(accessToken, refreshToken, profile, done) {
  /*  User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });*/
    mdb.collection(accountsColl).findOne({"_id": profile.id}, function(err, docs) {
    	if (err) {
            return done(err);
       	} 
       	if (docs == null) {
       		//No account
       		done(null, false);
       	} 
       	if(docs) {
       		console.log(docs);
       		done(null, docs);
       	}
        	
       	});
  }
));



passport.use('google-signup', new GoogleStrategy({
    clientID: config.get('local.secrets.googleClientID'),
    clientSecret: config.get('local.secrets.googleClientSECRET'),
    callbackURL: config.get('server.url') + "/auth/google/callback/signup"
  },
  function(accessToken, refreshToken, profile, done) {
  	console.log(profile.id);
  mdb.collection(accountsColl).findOne({"_id": profile.id}, function(err, docs) {
  		if (err) {
            return done(err);
       	} 
       	if (docs == null) {
       		console.log("Making New Account");
       		

       		//Construct JSON object with relevent vals 

       		var newProfile = {};
       		newProfile._id = profile.id;
       		newProfile.name = profile.name;
       		newProfile.avatar = profile._json.image.url;
       		newProfile.provider = profile.provider;
       		//fallback
       		newProfile.email = profile.emails[0].value;
       		//Get Account Email
       		profile.emails.forEach(function(currVal, index) {
       			if(currVal.type == "account") {
       				newProfile.email = profile.emails[index].value;
       			}
       		});


       		//Make a new Account
       		mdb.collection(accountsColl).insert(newProfile, function(err, records) {
	          if (err) {
	            return done(err);
	          } else {
	          	console.log(records.ops[0]);
	            return done(null, records.ops[0]);
	          }
	          
	          
	        });

       	}
       	if (docs) {
       		console.log("Has Values");
       		return done(null, false ); //req.flash('signupMessageGoogle', 'You already have an account.')
       	}
      });

  }
));


router.get('/',function(req, res, next) {
	console.log(req.get('host'));
	res.send('Logging in...');

	//console.log(config.get('test.hello'));
});
// Google Auth Button link
router.get('/google/signin',
  passport.authenticate('google-signin', { scope: ['profile'] }));

//Signup Link
router.get('/google/signup',
  passport.authenticate('google-signup', { scope: ['profile', 'email'] }));

//callback links
router.get('/google/callback/signup', 
  passport.authenticate('google-signup', { failureRedirect: '/auth',  failureFlash : true}),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("Successful Signup");
    res.redirect('/');
  });


router.get('/google/callback/login', 
  passport.authenticate('google-signin', { failureRedirect: '/auth',  failureFlash : true}),
  function(req, res) {
    // Successful authentication, redirect home.
    console.log("Successful Login");
    res.redirect('/');
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/auth');
});



module.exports = router;
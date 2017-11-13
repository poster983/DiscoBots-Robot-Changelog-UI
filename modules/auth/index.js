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

var LocalStrategy   = require('passport-local').Strategy;
var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var config = require('config');
var r = require("rethinkdb");
var db = require("../auth/index.js");

module.exports = function(passport) { // takes the passportjs object and a rethinkdb object


passport.serializeUser(function(user, done) {
  if(Array.isArray(user)) {
    done(null, user[0].id);
  } else {
    done(null, user.id);
  }
  //console.log(user);
});

passport.deserializeUser(function(id, done) {
     r.table("accounts").get(id).run(db.conn(), function(err, user) {
    done(err, user);
    //console.log("deserializeUser");

  });

});



/*Local  PASSPORT.js auth*/
/*passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    //session: true,
    passReqToCallback: true
    },
  function(req, email, password, done) {

    r.table("accounts").filter({
        "email": email
    }).run(connection, function(err, cursor){
      if (err) {
        return done(err)
      }
        cursor.toArray(function(errs, user) {
            if (err) {
              console.log(errs)
              return done(errs); 
            }
            //console.log(JSON.stringify(user, null, 2));
        
      //console.log(JSON.stringify(user.id));

      
         if (err) { 
            return done(err); 
          }
         if(user.length < 1) { // if no users are returned in the array 
            console.log("Wrong email");
            //req.session.failedLoginAttempts++;
            return done(null, false);// , req.flash('loginMessage', 'Incorrect Email or Password')
          }
          bcrypt.compare(password, user[0].password, function(err, res) {
            if(err) {
              return done(err); 
            }
            if(!res) {
              console.log("Wrong Pwd");
              return done(null, false); // , req.flash('loginMessage', 'Incorrect Email or Password')
            } else {
              return done(null, user);
            }
          });
          
          
      });
    });
  }
));*/


/**
  Google OAuth 2.0
**/

passport.use(new GoogleStrategy({
    clientID:     config.get("secrets.OAuth.google.clientID"),
    clientSecret: config.get("secrets.OAuth.google.clientSecret"),
    callbackURL: config.get("server.domain") + "/api/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log(profile, "profile");
    console.log(accessToken, "accessToken");
    console.log(refreshToken, "refreshToken");
    console.log(request.session.permissionKey, "permissionkey")

    /*
    if(profile.emails.length <1) {
      var err = new Error("No email attached to account")
      err.status = 412;
      return done(err);
      
    }
    var prom = new Promise(function(resolve, reject) {
      for(var x = 0; x < profile.emails.length; x++) {
        if(profile.emails[x].type == "account") {
          return resolve(profile.emails[x].value);
        }
        if(x >= profile.emails.length -1) {
          var err = new Error("No account email attached to google account");
          err.status = 412;
          return reject(err);
        }
      }
    });
    prom.then(function(googleEmail) {
      //find the oauth key if any
      r.table("accounts").filter({
          "integrations": {
            "google": {
              "id": profile.id
            }
          }
      }).run(connection, function(err, cursor){
        if (err) {
          return done(err)
        }
        cursor.toArray(function(err, accounts) {
          if(err) {
            return done(err);
          }
          if(accounts.length < 1) {
            //check if google email fits any existing accounts 
            //console.log("NO ID ")
            r.table("accounts").filter({
                "email": googleEmail
            }).run(connection, function(err, eCursor){
              if(err) {

                return done(err);
              }
              eCursor.toArray(function(err, emailAccounts) {
                if(err) {

                  return done(err);
                }
                //console.log(emailAccounts)
                if(emailAccounts.length < 1) { 
                  //NO ACCOUNT FOUND 
                  return done(null, false);
                }

                if(emailAccounts.length > 1) {
                  //console.log("Email Conflict ")
                  var err = new Error("Email Conflict")
                  err.status = 409;
                  return done(err);
                }
                if(emailAccounts.length == 1) {
                  console.log("Linking Account ")
                  r.table("accounts").get(emailAccounts[0].id).update({integrations: {google: {id: profile.id}}}).run(connection, function(err, stat) {
                    if(err) {
                      return done(err);
                    }
                    if(stat.replaced == 1) {
                      return done(null, Object.assign({}, emailAccounts[0], {integrations: {google: {id: profile.id}}}));
                    } else {
                      var err = new Error("Server Error")
                      err.status = 500;
                      return done(err);
                    }
                  })
                  
                }

              });
            });
          }
          if(accounts.length > 1) {
            var err = new Error("Account Conflict")
            err.status = 409;
            return done(err);
          }
          if(accounts.length == 1) {
            return done(null, accounts[0]);
          }
        })
      });
    }, function(err) {
      return done(err);
    })
    */

  }
));

/**
  JSON Web Token Auth for API 
**/

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeader(); // Header: "Authorization"
opts.secretOrKey = config.get('secrets.api-secret-key');
//opts.issuer = "localhost";
//opts.audience = "localhost";

//TODO: Reissue a new JWT if it has been 10 min from last reissuing 
passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  //console.log("HELLOO");
  //console.log(jwt_payload.id);
  //console.log(jwt_payload);
  //Get account by ID and then upt it into req.user by calling done(null, doc);
  r.table('accounts').get(jwt_payload.id).run(connection, function(err, doc) {
    if (err) {
      return done(err); 
    } else if(doc) {
      return done(null, utils.cleanUser(doc));
    } else {
      return done(null, false);
    }
    
  });
}));



}
// for all private keys and other things that should not be published to github.
// THis file does not have to be published under the AGPL licence.
// For convience, this file is tracked by github by default so you can use heroku with env variables.

//var fs = require('fs');

module.exports = {
	userGroups: {
		default: { //donot change. non authed users and non verified users by an admin will be set tho this.
			permissions: {
				db: {
					read: true;
					write: false;
				},
				dashboards: [""]
			}
		}
	},
	teams: ["kappa", "gamma", "solar"],
	server: {
		// EX: "https://www.example.com" OR "localhost:5000"
		url: process.env.url
	},
	rethinkdb: {
		host: "localhost",
		port: 28015,
		database: "DBchangeLog",
		password: "" //Dont Change.  Use local.json
	},
  	local: {
  		secrets: {
  			googleClientID: process.env.googleClientID,  //Get from google developer console 
  			googleClientSECRET: process.env.googleClientSECRET, //Get from google developer console 
  			sessionKey: process.env.sessionKey //your UNIQUE session key.
  		}
  	}

} 

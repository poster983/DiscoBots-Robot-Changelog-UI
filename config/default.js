// for all private keys and other things that should not be published to github.
// THis file does not have to be published under the AGPL licence.
// For convience, this file is tracked by github by default so you can use heroku with env variables.

//var fs = require('fs');

module.exports = {

	server: {
		// EX: "https://www.example.com" OR "localhost:5000"
		url: process.env.url
	},
	database: {
		MONGODB_URI: process.env.MONGODB_URI, // is for holding your Mongodb URI. If you are using Heroku with the addon, it should automatically add this to the Config Variables. 
		changelogCOLLECTION: process.env.changelogCOLLECTION, // tells the app what collection in the database to connect to. (Ex "dev" and "production") for the Changelog
		accountsCOLLECTION: process.env.accountsCOLLECTION //tells the app what collection in the database to connect to. (Ex "dev" and "production") for accounts
	},
  	local: {
  		secrets: {
  			googleClientID: process.env.googleClientID,  //Get from google developer console 
  			googleClientSECRET: process.env.googleClientSECRET, //Get from google developer console 
  			sessionKey: process.env.sessionKey //your UNIQUE session key.
  		}
  	}

} 

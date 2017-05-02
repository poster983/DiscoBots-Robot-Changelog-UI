//Load database 
var express = require('express');
var router = express.Router();
var Datastore = require('nedb')
  , db = new Datastore({ filename: 'datastores/changes.db', autoload: true });

router.get()

  module.exports = router;
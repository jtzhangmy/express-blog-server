var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./database');

var Schema = mongoose.Schema;

var userSchema = new Schema({
  "username": String,
  'password': String,
  'email': String,
  'userId': String
});
var User = mongoose.model('userList', userSchema);


module.exports = User;




















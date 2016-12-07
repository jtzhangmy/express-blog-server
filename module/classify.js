var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./database');

var Schema = mongoose.Schema;

var classifySchema = new Schema({
  classifyId: String,
  title: String,
  author: String,
  authorId: String
});

var Classify = mongoose.model("Classify", classifySchema);

module.exports = Classify;




















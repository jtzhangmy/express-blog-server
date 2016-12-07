var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
mongoose.connect('mongodb://localhost/myBlog');

var db = mongoose.connection;

if(db){
  console.log('---链接成功---');
}

module.exports = db;
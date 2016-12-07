var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./database');

var Schema = mongoose.Schema;

var articleItemSchema = new Schema({
  title: String,
  type: String,
  articleId: String
});

var articleListSchema = new Schema({
  classifyId: String,
  articleList: [articleItemSchema]
});

var ArticleList = mongoose.model("ArticleList", articleListSchema);

module.exports = ArticleList;


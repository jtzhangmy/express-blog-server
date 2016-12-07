var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var db = require('./database');

var Schema = mongoose.Schema;

// 回复回复的数据模型
var reReplySchema = new Schema({
  floor: Number,
  userName: String,
  replyName: String,
  userId: String,
  date: String,
  title: String,
  context: String
});

// 回复数据模型
var replySchema = new Schema({
  floor: Number,
  userName: String,
  replyName: String,
  userId: String,
  date: String,
  title: String,
  context: String,
  reReply: [reReplySchema]
});

//文章数据模型
var articleSchema = new Schema({
  articleId: String,
  classifyId: String,
  title: String,
  articleCtx: String,
  readNum: Number,
  replayList: [replySchema]
});


var Article = mongoose.model("Article", articleSchema);

module.exports = Article;


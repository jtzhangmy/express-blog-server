var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var crypto = require('crypto');
var uuid = require('node-uuid');
var fs = require('fs');
var colors = require('colors');

var Classify = require('../module/classify');
var ArticleList = require('../module/articleList');
var Article = require('../module/article');
var User = require('../module/user');

/* GET home page. */
router.get('/', function(req, res, next) {

});

//用户注册
router.route('/userReg')
  .post(function (req, res, next) {
    var userInfo = req.body;
    console.log(userInfo);
    console.log(userInfo.email);

    //生成密码的 md5 值
    var md5 = crypto.createHash('md5'),
      password = md5.update(userInfo.password).digest('hex');

    var userId = uuid.v1().replace(/\-/g,"");
    var _user = new User({
      "username": userInfo.username,
      'password': password,
      'email': userInfo.email,
      'userId': userId
    });

    var regJson;
    User.findOne({'username':userInfo.username},function (err, userMongo) {
      if(err){
        console.log(err);
      }
      if(userMongo === null){//如果没发现此用户
        _user.save(function (err, user) {
          //失败
          if(err){
            console.log(err);
            regJson = {reg: 'error'};
            return res.json(regJson);
          }
          //成功
          regJson = {
            reg: 'success',
            userId: userId
          };
          console.log(regJson);
          return res.json(regJson);
        })
      } else{
        // 已存在
        regJson = {reg: 'exist'};
        console.log(regJson);
        return res.json(regJson);
      }
    });
  })
  .get(function () {

  });

//用户登录
router.route('/userLogin')
  .post(function (req, res, next) {
    var userInfo = req.body;
    var md5 = crypto.createHash('md5'),
      password = md5.update(userInfo.password).digest('hex');

    User.findOne({'username': userInfo.username},function (err, userMongo) {
      if(err){
        console.log(err);
      }

      var json;
      //成功
      if(userMongo == null){
        json = {isSuccess: 'error'};
        return res.json(json);
        next();
      } else {
        if(userMongo.password == password){
          json = {
            loginStatus: 'success',
            username: userMongo.username,
            userId: userMongo.userId
          };
          // req.session.user = userInfo.username;
          return res.json(json);
          next();
        } else {
          // 失败
          json = {loginStatus: 'error'};
          console.log('--------');
          return res.json(json);
          next();
        }
      }
    });
  });

//文章分类
router.route('/classify')
  .post(function (req, res, next) {
    var classifyData = req.body;
    console.log(classifyData.type);
    switch (classifyData.type){
      case "add":
        console.log(classifyData.title);
        var classifyId = uuid.v1().replace(/\-/g,"");

        //新建classify
        var _classify = new Classify({
          classifyId: classifyId,
          title: classifyData.title,
          author: classifyData.author,
          authorId: classifyData.authorId
        });
        _classify.save();

        //新建articleList
        var _articleList = new ArticleList({
          classifyId: classifyId,
          articleList: []
        });
        _articleList.save()
          .then(resolved(classifyId), reject);
        break;
      case "update":
        Classify.update(
          {classifyId:classifyData.classifyId},
          {$set:{
            title:classifyData.title
            }
          })
          .then(resolved, reject);
        break;
      case "remove":
        function removeArticle() {
          Article.remove({classifyId: classifyData.classifyId})
            .then(resolved, reject)
        }

        function removeArticleList() {
          ArticleList.remove({classifyId:classifyData.classifyId})
            .then(removeArticle, reject);
        }
        Classify.remove({classifyId:classifyData.classifyId})
          .then(removeArticleList, reject);
        break;
    }

    function resolved(classifyId) {
      console.log('---success---'.green);
      return res.json({result: "success", classifyId: classifyId});
    }

    function reject() {
      console.log('---error---'.red);
      return res.json({result: "error"})
    }

  })
  .get(function (req, res, next) {
    var classifyData;
    Classify
      .find(function (err, classify) {
        classifyData = classify;
      })
      .then(resolve, reject);

    function resolve() {
      console.log('---get classify success!---'.green);
      res.json(classifyData);
    }

    function reject() {
      console.log('---get classify error!---'.red);
    }

  });

//文章列表
router.route('/articleList/:classify')
  .post(function (req, res, next) {
    var classifyId = req.params.classify;
    var articleListData = req.body;
    var articleTitle = articleListData.title;
    var author = articleListData.author;
    var articleType = articleListData.type;
    var articleId = uuid.v1().replace(/\-/g,"");
    var articleData = {
      title: articleTitle,
      type: articleType,
      articleId: articleId
    };
    //修改附表添加文档名称
    ArticleList
      .findOne({classifyId: classifyId})
      .exec(function (err, articleList) {
        articleList.articleList.push(articleData);
        articleList.save();
      })
      .then(saveArticle, reject);

    function saveArticle() {
      var date = new Date();
      var createTime = date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDay();
      console.log(createTime);
      var _article = new Article({
        articleId: articleId,
        classifyId: classifyId,
        title: articleTitle,
        author: author,
        articleCtx: '',
        readNum: 0,
        createTime: createTime,
        replayList: []
      });
      _article.save()
        .then(resolve, reject);
    }

    function resolve() {
      console.log('---update articleList success!---'.green);
      var resJson = {
        result: 'success',
        articleTitle: articleTitle,
        articleId: articleId,
        articleType: articleType
      };
      res.json(resJson);
    }

    function reject() {
      console.log('---update articleList error!---'.red);
      var resJson = {
        result: 'error'
      };
      res.json(resJson);
    }
  })
  .get(function (req, res, next) {
    var classifyId = req.params.classify;
    var articleData;
    ArticleList
      .find({classifyId: classifyId})
      .exec(function (err, article) {
        articleData = article;
      })
      .then(resolve, reject);

    function resolve() {
      console.log('---get articleList success!---'.green);
      res.json(articleData);
    }

    function reject() {
      console.log('---get articleList error!---'.red);
    }
    
  })

// 文章详情
router.route('/articleDetail/:articleDetail')
  .post(function (req, res, next) {
    var articleId = req.params.articleDetail;
    var articleTitle = req.body.title;
    var articleCtx = req.body.articleCtx;
    var classifyId = req.body.classifyId;
    //更新文章
    ArticleList //有bug,得传classifyId
      .update(
        {
          classifyId: classifyId,
          "articleList.articleId": articleId
        },
        {
          $set: {
            "articleList.$.title": articleTitle
          }
        }
      )
      .then(updateArticle, reject);



    function updateArticle() {
      Article
        .update(
          {articleId: articleId},
          {
            $set: {
              title: articleTitle,
              articleCtx: articleCtx
            }
          }
        ).then(resolve, reject);
    }

    function resolve() {
      console.log('---update article success!---'.green);
      var articleData = {
        updateStatus: 'success'
      };
      res.json(articleData);
    }

    function reject() {
      console.log('---update article error!---'.red);
      var articleData = {
        updateStatus: 'error'
      };
      res.json(articleData);
    }
  })
  .get(function (req, res, next) {
    var articleId = req.params.articleDetail;
    var articleData;
    Article
      .find({articleId: articleId})
      .exec(function (err, article) {
        articleData = article[0];
        articleData.readNum = articleData.readNum +1;
      })
      .then(updateReadNum, reject);

    function updateReadNum() {
      Article
        .update(
            {articleId: articleId},
            {
              $set: {
                readNum: articleData.readNum
              }
            }
          )
        .then(resolve, reject);
    }

    function resolve() {
      console.log('-------------');
      console.log('---get articleDetail success!---'.green);
      console.log(articleData);
      res.json(articleData);
    }

    function reject() {
      console.log('---get articleDetail error!---'.red);
      res.json()
    }

  });

router.route('/article/delete')
  .post(function (req, res, next) {
    var body = req.body;
    var classifyId = body.classifyId;
    var articleId = body.articleId;
    var removeIndex;

    ArticleList.findOne({
        "classifyId": classifyId,
        "articleList.articleId": articleId
      })
      .exec(function (err, articleList) {
        var ArticleItem = articleList.articleList;
        for(var i = 0,j = ArticleItem.length; i < j; i ++) {
          if(ArticleItem[i].articleId == articleId) {
            removeIndex = i;
            articleList.articleList.splice(i, 1);
            articleList.save();
            break;
          }
        }
      })
      .then(removeArticle, reject);

    function removeArticle() {
      Article.remove(
        {articleId: articleId}
      ).then(resolve, reject);
    }
    
    function resolve() {
      console.log('remove article success!'.green);
      var delReqJson = {
        deleteStatus: "success",
        removeIndex: removeIndex
      };
      res.json(delReqJson);
    }
    
    function reject() {
      var delReqJson = {
        "deleteStatus": "error"
      };
      res.json(delReqJson);
    }

    
  });

// 上传图片
router.post('/image', function (req, res, next) {
  console.log(req.body.imageData);
  var imgData = req.body.imageData;
  //base64转码
  var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
  var dataBuffer = new Buffer(base64Data, 'base64');

  var date = new Date();
  var today = date.getFullYear().toString() + (date.getMonth() + 1).toString() + date.getDay().toString();
  console.log(today);

  //创建目录
  var publicRoot = "public/";
  var file = "images/" + today;
  var publicFile = publicRoot + file;
  fs.exists(publicFile, function(exists) {
    if (exists) {
      console.log('存在');
      saveImg();
    } else {
      console.log('不存在');
      fs.mkdir(publicFile, function (err) {
        if (err) {
          console.log('创建目录失败');
        } else {
          console.log('创建目录成功');
          saveImg()
        }
      })
    }
  });

  function saveImg() {
    var imgName = uuid.v1().replace(/\-/g,'') + '.png';
    fs.writeFile(publicFile + '/' + imgName, dataBuffer, function(err) {
      if(err){
        res.json({
          error: err
        });
        console.log(err);
        console.log("保存失败!");
      }else{
        console.log('保存成功!');
        res.json({
          imgPath: file + '/' + imgName
        });
      }
    });
  }
});



module.exports = router;

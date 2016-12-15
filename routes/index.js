var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var crypto = require('crypto');
var uuid = require('node-uuid');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var fs = require('fs');

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
        Classify.update({classifyId:classifyData.classifyId}, {$set:{title:classifyData.title}})
          .then(resolved, reject);
        break;
      case "remove":
        function removeArticleList() {
          ArticleList.remove({classifyId:classifyData.classifyId})
            .then(resolved, reject);
        }
        Classify.remove({classifyId:classifyData.classifyId})
          .then(removeArticleList, reject);
        break;
    }

    function resolved(classifyId) {
      console.log('---success---');
      return res.json({result: "success", classifyId: classifyId});
    }

    function reject() {
      console.log('---error---');
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
      console.log('---get classify success!---');
      res.json(classifyData);
    }

    function reject() {
      console.log('---get classify error!---');
    }

  });

//文章列表
router.route('/articleList/:classify')
  .post(function (req, res, next) {
    var classifyId = req.params.classify;
    var articleListData = req.body;
    var articleTitle = articleListData.title;
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
      var _article = new Article({
        articleId: articleId,
        classifyId: classifyId,
        title: '',
        articleCtx: '',
        readNum: 0,
        replayList: []
      });
      _article.save()
        .then(resolve, reject);
    }

    function resolve() {
      console.log('---update articleList success!---');
      var resJson = {
        result: 'success',
        articleTitle: articleTitle,
        articleId: articleId,
        articleType: articleType
      };
      res.json(resJson);
    }

    function reject() {
      console.log('---update articleList error!---');
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
      console.log('---get articleList success!---');
      res.json(articleData);
    }

    function reject() {
      console.log('---get articleList error!---');
    }
    
  });

// 文章详情
router.route('/articleDetail/:articleDetail')
  .post(function (req, res, next) {
    var articleId = req.params.articleDetail;
    var atricleTitle = req.body.title;
    var articleCtx = req.body.articleCtx;
    //更新文章
    Article
      .update(
        {articleId: articleId},
        {$set: {
          title: atricleTitle,
          articleCtx: articleCtx
        }}
      ).then(resolve, reject);

    function resolve() {
      console.log('---update article success!---');
      var articleData = {
        updateStatus: 'success'
      };
      res.json(articleData);
    }

    function reject() {
      console.log('---update article error!---');
      var articleData = {
        updateStatus: 'error'
      };
      res.json(articleData);
    }
  })
  .get(function (req, res, next) {
    var articleId = req.params.articleDetail;

    var classifyData;
    Classify
      .find(function (err, articleDetail) {
        articleDetailData = articleDetail;
      })
      .then(resolve, reject);

    function resolve() {
      console.log('---get articleDetail success!---');
      res.json(articleDetailData);
    }

    function reject() {
      console.log('---get articleDetail error!---');
      res.json()
    }

  });

// 上传图片
// router.post('/image', upload.single('image'), function (req, res, next) {
//   var imgData = req.body.imgData;
//   console.log(imgData);
//   console.log('------------------------------------------------')
//   //过滤data:URL
//   var base64Data = imgData.replace(/^data:image\/\w+;base64,/, "");
//   var dataBuffer = new Buffer(base64Data, 'base64');
//   var file = "public/images/out.png";
//   fs.exists(file, function(exists) {
//     if (exists) {
//       console.log('存在');
//       fs.unlink(file, function(err){
//         if(err){
//           console.log("删除失败！");
//         }else{
//           console.log("删除成功！");
//         }
//       });
//     } else {
//       console.log('不存在');
//     }
//   });
//
//   setTimeout(function () {
//     fs.writeFile("public/images/out.png", dataBuffer, function(err) {
//       if(err){
//         res.send(err);
//         console.log(err);
//         console.log("保存失败!");
//       }else{
//         console.log('保存成功!');
//         res.send("保存成功！");
//       }
//     });
//   }, 1000);
//   });

router.post('/image', function (req, res, next) {
  console.log(req.body['imageData[]']);
  res.send('aaa');
});



module.exports = router;

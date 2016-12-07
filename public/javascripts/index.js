//Cookie
function cookie() {
  this.set = function(key, value) {

    var dates=new Date();

    dates.setDate(dates.getDate()+1); //按天数设置

    document.cookie = key + "=" + value + ";expires="+dates;

  };
  this.get = function(key) {

    var arr = document.cookie.match(new RegExp("(^| )" + key + "=([^;]*)(;|$)"));

    if (arr != null) {
      return (arr[2]);
    } else {
      return "";
    }
  };
  this.remove = function(key) {

    var exp = new Date();
    exp.setTime(exp.getTime() + (-1 * 24 * 60 * 60 * 1000));
    var cval = this.set(key);
    document.cookie = key + "=" + cval + "; expires=" + exp.toGMTString();
  };

}

var Cookie = new cookie();


// 显示登录界面
function loginShow() {
  $('.mask').show();
  $('.login').show();
}

// 退出登录界面
function loginExist() {
  $('.mask').hide();
  $('.login').hide();
}

//登录
function login() {
  var username = $('#username').val();
  var password = $('#password').val();
  var login_url = "/users/";
  var data = {
    'username': username,
    'password': password
  };
  $.ajax({
    url: login_url,
    data: data,
    method: 'post',
    type: 'json',
    timeout: 5000,
    success: function(data){
      if(data.isSuccess == 'success'){
        console.log('success');
        location.assign('/');
        Cookie.set('user',username);
      } else {
        console.log('error');
        alert('用户名错误或密码错误');
        username = '';
        password = '';
      }
    }
  })
}

//注册
function register() {
  var username = $('#username').val();
  var password = $('#password').val();
  var re_password = $('#re_password').val();
  var email = $('#email').val();
  if(username && password && email){
    if (password != re_password){
      alert('两次密码输入不一致');
    } else {
      var reg_url = "/users/reg";
      var data = {
        'username': username,
        'password': password,
        'email': email
      };
      $.ajax({
        url: reg_url,
        data: data,
        method: 'post',
        type: 'json',
        timeout: 5000,
        success: function(data){
          alert(data.reg);
          if(data.reg == 'success'){
            console.log('success');
            location.assign('/');
          } else if(data.reg == 'exist'){
            alert('用户名已存在');
          } else {
            console.log('error');
            username = '';
            password = '';
          }
        }
      })
    }
  } else {
    alert('请完善信息!');
  }
}

//退出
function logOut() {
  var logOut_url = '/users/logout';
  var data = {
    "logout":true
  };
  $.ajax({
    url: logOut_url,
    data: data,
    method: 'post',
    type: 'json',
    timeout: 5000,
    success: function(data){
      // Cookie.remove('user');
      location.assign('/');
    },
    error: function (err) {
      console.log(err);
    }
  })
}

//编辑项目
function edit() {
  $('.home-header-add-inner').show();
  $('.home-header-classify-close').show();
  $('.home-header-edit').hide();
  $('.home-header-confirm').show();
  $('.home-header-classify').removeClass('home-header-classify-hover');
  watchClassify();
}
//编辑项目确定
function confirm() {
  $('.home-header-add-inner').hide();
  $('.home-header-classify-close').hide();
  $('.home-header-edit').show();
  $('.home-header-confirm').hide();
  $('.home-header-classify').addClass('home-header-classify-hover');
}

//添加项目弹出框
function addClassify() {
  $('.mask').show();
  $('.home-header-add-classify').show();
  $('.home-header-input').val('').focus();
}

//添加项目弹出框取消
function addClassifyCancel() {
  $('.home-header-input').val('');
  $('.mask').hide();
  $('.home-header-add-classify').hide();
}

//添加分类
function addClassifyTitle() {
  var change_classify_url = '/users/changeClassify';
  var classify_title = $('.home-header-input').val();
  var data = {
    type: "add",
    title: classify_title
  };
  $.ajax({
    url: change_classify_url,
    data: data,
    method: 'post',
    type: 'json',
    timeout: 5000,
    success: function(data){
      var classifyId = data.classifyId;
      $('.mask').hide();
      $('.home-header-add-classify').hide();
      var classifyHTML = "<div class='home-header-classify-outer'>" +
        "<a class='home-header-classify' href='/home/" + classifyId + "'>" + classify_title + "</a>" +
          "<span data='" + classifyId + "' class='home-header-classify-close ion-ios-close-outline' style='display: inline;'> </span>" +
        "</div>";
      $('.home-header-add').before(classifyHTML);
      watchClassify();
    },
    error: function (err) {
      alert("添加失败!")
    }
  })
}

//添加绑定
function watchClassify() {
  $('.home-header-classify-close').each(function (index) {
    $(this).unbind('click');
    $(this).on('click', function () {
      alert(index);
      var classifyId = $(this).attr('data');
      var change_classify_url = '/users/changeClassify';
      var data = {
        type: "remove",
        classifyId: classifyId
      };
      $.ajax({
        url: change_classify_url,
        data: data,
        method: 'post',
        type: 'json',
        timeout: 5000,
        success: function(data){
          if(data.result == 'success'){
            $('.home-header-classify-outer').eq(index).remove();
            watchClassify();
          } else {
            alert('删除失败');
          }
        },
        error: function (err) {
          alert("添加失败!")
        }
      })
    })
  });
}

//添加文章
function addArticleTitle(classifyId) {
  var change_article_url = '/users/changeArticle';
  var article_title = $('.home-header-input-article').val();
  var article_type = $('.home-header-radio:checked').val();
  var data = {
    type: "add",
    title: article_title,
    classify_id: classifyId,
    article_type: article_type
  };
  $.ajax({
    url: change_article_url,
    data: data,
    method: 'post',
    type: 'json',
    timeout: 5000,
    success: function(data){
      var classifyId = data.classifyId;
      
    },
    error: function (err) {
      alert("添加失败!")
    }
  })
}

function addArticleCancel() {
  $('.home-header-input-article').val('');
  $('.mask').hide();
  $('.home-header-add-article').hide();
}


/*var header = new Vue({
  el: '#header',
  data: {
    classifies: []
  },
  beforeCreate: function () {
    this.$http.get('http://127.0.0.1:3000/blogData/classify', {}, {emulateJSON: true})
      .then(
        function (res) {
          var classifyData = res.data;
          this.$data.classifies = classifyData;
          console.log('success~')
        },
        function (res) {
          console.error('get classify error');
        }
      )
  },
  methods: {
    
  }
})*/











// 登录组件
Vue.component('login', {
  template: `
     <div class="login">
      <h2 class="login-title success">博客登录</h2> 
      <!--<div class="login-exist ion-ios-close-empty" onclick='loginExist()'></div>-->
      <form role='form' method='post' action='/user'>
        <div class="form-group"></div>
          <label for="username" class="input-label">用户名:</label>
          <input type="text" id="username" class="form-control" placeholder='请输入用户名' name='username' v-model="username">
        <div class="form-group"></div>
          <label for="password" class="input-label">密码:</label>
          <input type="password" id="password" class="form-control" placeholder='请输入密码' name='password' v-model="password">
        <div class="btn-row">
          <span href="" class="btn btn-success" @click = 'login()'>登录</span>
          <router-link to="/reg" class="btn btn-info">注册</router-link>
        </div>
      </form>
    </div>
  `,
  methods: {
    login: function () {
      var loginUrl = 'http://127.0.0.1:3000/blogData/userLogin';
      var loginData = {
        username: this.username,
        password: this.password
      };
      this.$http.post(loginUrl, loginData, {emulateJSON: true})
        .then(
          function (res) {
            var loginStatus = res.data.loginStatus;
            var userId = res.data.userId;
            console.log(loginStatus);
            if(loginStatus == 'success') {
              Cookie.set('username', this.username);
              Cookie.set('userId', userId);
              router.push({path: '/'});
            }
          },
          function (res) {
            console.error('login error');
          }
        )
    }
  },
  data: function () {
    return {
      username: "",
      password: ""
    }
  }
});

// 注册组件
Vue.component('register', {
  template: `
    <div class="reg-content">
      <div class="reg col-md-4 col-md-offset-4"><h2 class="reg-title">注册新用户</h2>
        <form role="form" method="POST" action="/user">
          <div class="form-group has-feedback has-success">
            <label for="username" class="input-label">用户名:</label>
            <input id="username" type="text" placeholder="请输入用户名" name="username" class="form-control" v-model="username">
            <span class="glyphicon form-control-feedback glyphicon-ok"></span>
          </div>
          <div class="form-group has-feedback has-success">
            <label for="password" class="input-label">密码:</label>
            <input id="password" type="password" placeholder="请输入密码" name="password" class="form-control" v-model="pass">
            <span class="glyphicon form-control-feedback glyphicon-ok"></span>
          </div>
          <div class="form-group has-feedback has-success">
            <label for="password" class="input-label">重复密码:</label>
            <input id="re_password" type="password" placeholder="请重复输入密码" name="re_password" class="form-control" v-model="rePass">
            <span class="glyphicon form-control-feedback glyphicon-ok"></span>
          </div>
          <div class="form-group has-feedback has-success">
            <label for="password" class="input-label">邮箱:</label>
            <input id="email" type="email" placeholder="请输入邮箱" name="email" class="form-control" v-model="email">
            <span class="glyphicon form-control-feedback glyphicon-ok"></span>
          </div>
          <div class="btn-row">
            <a @click="register()" class="btn btn-success">注册</a>
            <a href="/" class="btn btn-info">返回</a>
          </div>
        </form>
      </div>
    </div>
  `,
  methods: {
    register: function () {
      if (this.pass == this.rePass) {
        var useRegSrc = 'http://127.0.0.1:3000/blogData/userReg';
        var userData = {
          username: this.username,
          password: this.pass,
          email: this.email
        };
        this.$http.post(useRegSrc, userData, {emulateJSON: true})
          .then(
            function (res) {
              console.log(res.data);
              var resData = res.data;
              if (resData.reg == 'success') {
                alert('注册成功');
                Cookie.set('username', this.username);
                router.push({path: '/'});
              } else if (resData.reg == 'error') {
                alert('注册失败');
              } else if (resData.reg == 'exist') {
                alert('用户已存在');
              }


            },
            function (res) {

            }
          )
      } else {
        alert('两次密码输入不一致,请重新输入!');
      }
    }
  },
  data: function () {
    return {
      username: '',
      pass: '',
      rePass: '',
      email: ''
    }
  }
});

//文章列表组件
Vue.component('article-list', {
  props:['classifyId'],
  template: `
    <div class="article-list">
      <div class="home-aside col-md-2">
        <h3 class="home-aside-title">目录</h3>
        <router-link 
          v-for="classify in classifies" 
          :to="{ path: '/classify/' + classifyId + '/' + classify.articleId}" 
          class="home-aside-tt" >
          {{classify.title}}
        </router-link>
      </div>
      <router-view></router-view>
    </div>
  `,
  watch: {
    //监听路由改变
    classifyId: function () {
      var articleListUrl = 'http://127.0.0.1:3000/blogData/articleList/' + this.classifyId;
      this.$http.get(articleListUrl, {}, {emulateJSON: true})
        .then(
          function (res) {
            var classifyData = res.data;
            this.$data.classifies = classifyData[0].articleList;
            console.log(classifyData[0].articleList)
          },
          function (res) {
            console.error('get classify error');
          }
        )
    }
  },
  data: function () {
    return {
      classifies: []
    }
  }
});
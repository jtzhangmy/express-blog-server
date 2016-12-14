// 首页
const Index = {
  template: `<div>index</div>`
};

// 注册页
const Register = {
  template: `<register></register>`
};

// 登录页
const Login = {
  template: `<login></login>`
};

// 文章列表页
const ArticleList = {
  template: `<article-list :classifyId="$route.params.classify" :edit.sync="editing"></article-list>`
};


const Article = {
  template: `<h1>Article</h1>`
};

const ArticleDetail = {
  template: `<h1>{{$route.params.articleId}}</h1>`
};

const routes = [
  {
    path: '/',
    component: Index,
    name: 'index'
  },
  {
    path: '/reg',
    component: Register,
    name: 'reg'
  },{
    path: '/login',
    component: Login,
    name: 'login'
  },{
    path: '/classify/:classify',
    component: ArticleList,
    name: 'articleList',
    children: [
      {
        path: '',
        component: Article
      },
      {
        path: ':articleId',
        component: ArticleDetail
      }
    ]
  }
];

const router = new VueRouter({
  routes: routes
});

const app = new Vue({
  el: '#app',
  router: router,
  data: {
    classifies: [],
    userLogin: false,
    username: Cookie.get('username'),
    editing: false,
    editName: '编辑',
    addingClassify: false,
    classifyAddTitle: ''
  },
  mounted: function () {
    this.$http.get('http://127.0.0.1:3000/blogData/classify', {}, {emulateJSON: true})
      .then(
        function (res) {
          var classifyData = res.data;
          this.$data.classifies = classifyData;
          console.log(classifyData[0])
        },
        function (res) {
          console.error('get classify error');
        }
      );

      if(Cookie.get('username')) {
        this.userLogin = true;
      }
  },
  methods: {
    edit: function () {
      if(this.editing) {
        this.editing = false;
        this.editName = '编辑';
      } else {
        this.editing = true;
        this.editName = '确认';
      }
    },
    //退出登录
    exit: function () {
      Cookie.remove('username');
      Cookie.remove('userId');
      this.userLogin = false;
    },
    //插入分类
    addClassify: function () {
      this.addingClassify = true;
    },
    //插入分类标题
    addClassifyConfirm: function () {
      var classifyAddUrl = "http://127.0.0.1:3000/blogData/classify";
      var classifyAddData = {
        type: 'add',
        title: this.classifyAddTitle,
        author: Cookie.get('username'),
        authorId: Cookie.get('userId')
      };
      this.$http.post(classifyAddUrl, classifyAddData, {emulateJSON: true})
        .then(
          function (res) {
            var classifyAddStatus = res.data;
            if (classifyAddStatus.result == 'success') {
              this.classifies.push(
                {
                  classifyId: classifyAddStatus.classifyId,
                  title: this.classifyAddTitle
                }
              );
              this.addingClassify = false;

            } else {
              alert('插入分类失败1');
            }
          },
          function (res) {
            alert('插入分类失败2');
          }
        )
    },
    // 插入标题关闭
    addClassifyCancel: function () {
      this.addingClassify = false;
    },
    // 删除分类
    removeClassify: function (index, classifyId) {
      var classifyAddUrl = "http://127.0.0.1:3000/blogData/classify";
      var classifyAddData = {
        type: 'remove',
        classifyId: classifyId
      };
      this.$http.post(classifyAddUrl, classifyAddData, {emulateJSON: true})
        .then(
          function (res) {
            var classifyAddStatus = res.data;
            if (classifyAddStatus.result == 'success') {
              this.classifies.splice(index, 1);
            } else {
              alert('删除分类失败1');
            }
          },
          function (res) {
            alert('删除分类失败2');
          }
        )
    }

  }
});


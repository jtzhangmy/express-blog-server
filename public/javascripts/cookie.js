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
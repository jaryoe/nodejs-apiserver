var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fs = require('fs');
const jwt = require('jsonwebtoken');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

//验证token
const verifyToken = token => {
  let cert = fs.readFileSync(path.join(__dirname, './conf/rsa_public_key.pem'));//公钥
  let res = {};
  try{
    let result = jwt.verify(token, cert, {algorithms: ['RS256']}) || {};
    let {exp = 0} = result,current = Math.floor(Date.now()/1000);
    if(current <= exp){
      res = result.data;
    }
  }catch(e){
  
  }
  return res;
  
}

var app = express();

app.use(async(req, res, next) => {
  let {url = ''} = req;
  if(url.indexOf('/api/user') > -1){//需要校验登录态
      let {token} = req.headers;
      if (token) {
          let result = verifyToken(token);
          let {uid} = result;
          if(uid){
              req.state = {uid};
              next();
          }else{
              return req.body = res.json({
                code:'1',
                msg: '验证token失效'
              });;
          }
      } else {
          return req.body = res.json({
            code:'1',
            msg: '验证token失效'
          });;
      }
  }else{
      next();
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('mysssss'));
app.use(express.static(path.join(__dirname, 'public')));
/*
app.get('/', function(req, res){
  //直接通过req.cookies.key获取对应cookies中记录的value值
  if (req.cookies.remember) {
    res.send('Remembered :). Click to <a href="/forget">forget</a>!.');
  } else {
    res.send('<form method="post"><p>Check to <label>'
      + '<input type="checkbox" name="remember"/> remember me</label> '
      + '<input type="submit" value="Submit"/>.</p></form>');
  }
});
app.get('/forget', function(req, res){
  //输入key值，清除对应的value值
  res.clearCookie('remember');
  res.redirect('back');
});
app.post('/', function(req, res){
  var minute = 60000;
  //输入key值,value值,第三个参数为cookie的设置
  //例如:res.cookie('name', 'laodoujiao', { domain: '.cnblog.com', path: '/admin', secure: true,expires: new Date(Date.now() + 900000), httpOnly: true,maxAge:900000 });
  //注意maxAge这个参数，这是为了方便设置cookie的过期时间而设置的一个简易参数，已毫秒为单位 
 if (req.body.remember) res.cookie('remember', 1, { maxAge: minute });
  res.redirect('back');
});*/

app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

var express = require('express');
var router = express.Router();
var apiDao = require('../dao/apiDao');

/* GET api index. */
router.get('/', function(req, res, next) {	
  res.render('index', { title: 'index' });
});

router.post('/', function(req, res, next) {
	//输入key值,value值,第三个参数为cookie的设置
	res.cookie('testpostcookie', 'cookievalue', { expires: new Date(Date.now() + 60000), maxAge:60000 });
  res.render('index', { title: 'index' });
});

//登录接口
router.post('/login', async (req, res, next) => {
  apiDao.login(req, res, next);
});


// 增加用户
router.post('/user/addUser', function(req, res, next) {
	apiDao.add(req, res, next);
});
 //获取用户数据
router.get('/queryAll', function(req, res, next) {
	//输入key值,value值,第三个参数为cookie的设置
	res.cookie('testcookie', 'cookievalue', {  expires: new Date(Date.now() + 60000), maxAge:60000 });	
	apiDao.queryAll(req, res, next);
});
 
router.get('/query', function(req, res, next) {
	apiDao.queryById(req, res, next);
});
 
router.get('/deleteUser', function(req, res, next) {
	apiDao.delete(req, res, next);
});
 
router.post('/updateUser', function(req, res, next) {
	apiDao.update(req, res, next);
});

module.exports = router;

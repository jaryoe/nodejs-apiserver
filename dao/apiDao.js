// dao/userDao.js
// 实现与MySQL交互
var mysql = require('mysql');
var $conf = require('../conf/db');
var $sql = require('./apiSqlMapping');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
 
// 使用连接池，提升性能
//var pool  = mysql.createPool($util.extend({}, $conf.mysql));
var pool  = mysql.createPool($conf.mysql);

// 向前台返回JSON方法的简单封装
var jsonWrite = function (res, ret, err) {
	if(typeof ret === 'undefined') {
		res.json({
			code:'1',
			msg: '操作失败'
		});
	} else {
		res.json({
			code: '200',
			status: 'success',
			msg: err,
			token: generateToken(),
			data: ret
		});
	}
};

//生成token的方法
const generateToken = data => {
	let created = Math.floor(Date.now() / 1000);
	let cert = fs.readFileSync(path.join(__dirname, '../conf/rsa_private_key.pem'));//私钥
	let token = jwt.sign({
		data,
		exp: created + 3600 * 24
	}, cert, {algorithm: 'RS256'});
	return token;
  }
 
module.exports = {
    login: function(req, res, next){
        pool.getConnection(function(err, connection) {
            if(err){
                console.log(err);
            }
			// 获取前台页面传过来的参数
			let param = req.body || req.params;
 
			// 建立连接，向表中插入值
			connection.query($sql.login, [param.username, param.password], function(err, result) {
                if(err){
                    console.log(err);
                }
				let val = result[0];
                let uid = val['uid'];
				if(result) {
					result = {
						code: 200,
                        msg:'登录成功',
                        token: generateToken({uid})
					};    
				}
 
				// 以json形式，把操作结果返回给前台页面
				jsonWrite(res, result);
 
				// 释放连接 
				connection.release();
			});
        });
                
    },
	add: function (req, res, next) {
        
		pool.getConnection(function(err, connection) {
            if(err){
                console.log(err);
            }
			// 获取前台页面传过来的参数
			var param = req.body || req.params;
 
			// 建立连接，向表中插入值
			connection.query($sql.insert, [param.username, param.password], function(err, result) {
                if(err){
                    console.log(err);
                }
				if(result) {
					result = {
						code: 200,
						msg:'增加成功'
					};    
				}
 
				// 以json形式，把操作结果返回给前台页面
				jsonWrite(res, result);
 
				// 释放连接 
				connection.release();
			});
		});
	},
	delete: function (req, res, next) {
		// delete by Id
		pool.getConnection(function(err, connection) {
			var id = +req.query.id;
			connection.query($sql.delete, id, function(err, result) {
				if(result.affectedRows > 0) {
					result = {
						code: 200,
						msg:'删除成功'
					};
				} else {
					result = void 0;
				}
				jsonWrite(res, result);
				connection.release();
			});
		});
	},
	update: function (req, res, next) {
		// update by id
		// 为了简单，要求同时传name和age两个参数
		var param = req.body;
		if(param.name == null || param.age == null || param.id == null) {
			jsonWrite(res, undefined);
			return;
		}
 
		pool.getConnection(function(err, connection) {
			connection.query($sql.update, [param.name, param.age, +param.id], function(err, result) {
				// 使用页面进行跳转提示
				if(result.affectedRows > 0) {
					res.render('suc', {
						result: result
					}); // 第二个参数可以直接在jade中使用
				} else {
					res.render('fail',  {
						result: result
					});
				}
 
				connection.release();
			});
		});
 
	},
	queryById: function (req, res, next) {
		var id = +req.query.id; // 为了拼凑正确的sql语句，这里要转下整数
		pool.getConnection(function(err, connection) {
			connection.query($sql.queryById, id, function(err, result) {
				jsonWrite(res, result);
				connection.release();
 
			});
		});
	},
	queryAll: function (req, res, next) {
		pool.getConnection(function(err, connection) {
			connection.query($sql.queryAll, function(err, result) {	
				jsonWrite(res, result, err);
				connection.release();
			});
		});
	}
 
};
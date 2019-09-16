// dao/apiSqlMapping.js
// CRUD SQL语句
var user = {
	insert:'insert into users(username, password) values(?,?);',
	update:'update users set username=?, password=? where id=?;',
	delete: 'delete from users where id=?;',
	queryById: 'select * from users  where id=?;',
    queryAll: 'select * from users;',
    login: 'SELECT uid FROM users WHERE username=? and password=?',
};
 
module.exports = user;
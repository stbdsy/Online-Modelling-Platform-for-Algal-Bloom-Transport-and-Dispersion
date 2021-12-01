var mysqlConn = require('./db');
const dataService = {
	// 查询最新的数据
	queryPromise: function (sql,userCallback) {
		var promiseObj = new Promise(function(resolve, reject){
			mysqlConn.query(
				sql,
				[],
				function selectCb(err, results, fields) {
					// resolve 只能传递一个参数
					resolve({
						err: err,
						results: results,
						fields: fields
					});
				}
			);
		});
		return promiseObj;
	}
}
module.exports = dataService;

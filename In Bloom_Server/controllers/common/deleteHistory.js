var express = require('express');
var fs = require('fs');
var router = express.Router();
router.prefix = '/deleteHistory'
var dataService = require('./dataService');
router.post('/', function (req, res, next) {
    var params = req.body;
    var username = params["username"];
    var time = params["time"];
    var sql = "DELETE FROM `tasks` where username='" + username + "' and time='" + time + "'";
    dataService.queryPromise(sql).then(function (serviceResp) {
        var results = serviceResp.results;
    });
    var path="data//" + username + "_" + time;
    delDir(path)
    var path2="current_interpo//" + username + "_" + time;
    if(fs.statSync(path2).isDirectory()){
        delDir(path2); //递归删除文件夹
    }
    res.jsonp("删除完成");
});
module.exports = router;

function delDir(path){
    let files = [];
    try{
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "//" + file;
            if(fs.statSync(curPath).isDirectory()){
                delDir(curPath); //递归删除文件夹
            } else {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        fs.rmdirSync(path);  // 删除文件夹自身
    }catch (e) {
        console.log(e)
    }
}
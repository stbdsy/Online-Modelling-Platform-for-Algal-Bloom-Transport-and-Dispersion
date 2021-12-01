var express = require('express');
var fs = require("fs");
var router = express.Router();
router.prefix = '/fsCurrentInterpo'
router.post('/', function (req, res, next) {
    var time = req.body["time"];
    var data = req.body["data"];
    fs.writeFileSync("current//uv_value_t_"+time+".json",data);
    res.jsonp(time+"：计算成功");
    // fs.writeFile("data//"+time+"_"+label+".json",data,function(err){
    //     if(!err){
    //         console.log("写入成功");
    //         res.jsonp(time+"_"+label+"：计算成功");
    //     }
    //     else{
    //         console.log(err);
    //         res.jsonp(time+"_"+label+"："+err);
    //     }
    // });
});
module.exports = router;
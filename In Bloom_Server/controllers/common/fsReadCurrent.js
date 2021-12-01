var express = require('express');
var fs = require("fs");
var router = express.Router();
router.prefix = '/fsReadCurrent'
router.post('/', function (req, res, next) {
    var time = req.body["time"]; 
    data=fs.readFileSync("current//uv_value_t_"+time+".json");
    res.jsonp(data.toString());
    // fs.readFile("data//"+time+"_"+label+".json",function(err,data){
    //     if(!err){
    //         res.jsonp(data.toString());
    //     }
    //     else{
    //         res.jsonp("null");
    //     }
    // });
});
module.exports = router;
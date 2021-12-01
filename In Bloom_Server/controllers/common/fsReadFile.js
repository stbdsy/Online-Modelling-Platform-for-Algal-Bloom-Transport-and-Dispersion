var express = require('express');
var fs = require("fs");
var router = express.Router();
router.prefix = '/fsReadFile'
router.post('/', function (req, res, next) {
    console.log(req)
    var time = req.body["time"];  
    var label = req.body["label"]; 
    var dir = req.body["dir"]; 
    data=fs.readFileSync("data//"+dir+"//"+time+"_"+label+".json");
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
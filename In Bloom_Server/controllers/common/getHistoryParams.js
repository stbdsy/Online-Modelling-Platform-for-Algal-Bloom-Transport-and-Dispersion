var express = require('express');
var fs = require("fs");
var dataService = require('./dataService');
var router = express.Router();
router.prefix = '/getHistoryParams'
router.post('/', function (req, res, next) {
    var params = req.body;
    var username = params["username"];
    var time = params["time"];
    var sql = "SELECT taskname,username,time,model,starttime,endtime,timeStep,pointsnum,strand,windDragCoef,windSpeed,windDirection,FbmStepSize,hurst FROM `tasks` where username='" + username + "' and time ='" + time + "'";
    dataService.queryPromise(sql).then(function (serviceResp) {
        var results = serviceResp.results;
        console.log(results);
        res.jsonp(results);
    });
});
module.exports = router;
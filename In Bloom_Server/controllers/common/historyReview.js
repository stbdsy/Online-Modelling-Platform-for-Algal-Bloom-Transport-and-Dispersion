var express = require('express');
var fs = require("fs");
var dataService = require('./dataService');
var router = express.Router();
router.prefix = '/historyReview'
router.post('/', function (req, res, next) {
    var sql = "SELECT taskname,username,time,model,starttime,endtime,timeStep FROM `tasks`";
    dataService.queryPromise(sql).then(function (serviceResp) {
        var results = serviceResp.results;
        console.log(results);
        res.jsonp(results);
    });
});
module.exports = router;
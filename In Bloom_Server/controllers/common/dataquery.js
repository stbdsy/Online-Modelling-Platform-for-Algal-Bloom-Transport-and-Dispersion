var express = require('express');
var fs = require("fs");
var dataService = require('./dataService');
var router = express.Router();
router.prefix = '/dataquery'
router.post('/', function (req, res, next) {
    var sql = req.body;
    console.log(sql);
    dataService.queryPromise(sql).then(function (serviceResp) {
        var results = serviceResp.results;
        console.log(results);
        res.jsonp(results);
    });
});
module.exports = router;
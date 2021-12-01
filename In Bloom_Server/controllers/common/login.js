var express = require('express');
var router = express.Router();
router.prefix = '/login'
var dataService = require('./dataService');
router.post('/', function (req, res, next) {
    var params = req.body;
    var username = params["username"];
    var password = params["password"];
    var sql = "SELECT * FROM `users` where username='" + username + "' and password='" + password + "'";
    dataService.queryPromise(sql).then(function (serviceResp) {
        var results = serviceResp.results;
        console.log(results);
        if (results.length == 0) {
            res.jsonp(false);
        } else {
            res.jsonp(true);
        }
    });
});
module.exports = router;
var express = require('express');
var fs = require("fs");
var dataFn = require('./dealFn');
var router = express.Router();
router.prefix = '/timeInterpo'
router.post('/', function (req, res, next) {
    var params = req.body;
    var timenow = params["timenow"];
    var username = params["user"];
    var startTime = parseFloat(params["startTime"]);
    var stopTime = parseFloat(params["stopTime"]);
    var timeStep = parseFloat(params["timeStep"]);
    var n = 3600 / timeStep;
    globalTimeStep = timeStep / 3600;
    let uComponent1, uComponent2, vComponent1, vComponent2;
    var promise0 = new Promise(function (resolve, reject) {
        var fs = require('fs');
        fs.mkdir("current_interpo//" + username + "_" + timenow, 0777, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("creat done!");
            }
        })
        resolve();
    })
    promise0.then(function () {
        var promise1 = new Promise(function (resolve, reject) {
            for (var time = startTime; time <= stopTime - 3600; time = time + 3600) {
                console.log("插值完成" + time)
                response1 = fs.readFileSync("current//uv_value_t_" + time + ".json");
                response1 = JSON.parse(response1);
                response1 = response1[0];
                uComponent1 = response1["u-data"];
                vComponent1 = response1["v-data"];
                var newtime = time + 3600;
                response2 = fs.readFileSync("current//uv_value_t_" + newtime + ".json");
                response2 = JSON.parse(response2);
                response2 = response2[0];
                uComponent2 = response2["u-data"];
                vComponent2 = response2["v-data"];
                for (var i = 1; i < n; i++) {
                    var uComponent3 = [];
                    var vComponent3 = [];
                    for (var j = 0; j < vComponent2.length; j++) {
                        var u1 = parseFloat(uComponent1[j]);
                        var u2 = parseFloat(uComponent2[j]);
                        var v1 = parseFloat(vComponent1[j]);
                        var v2 = parseFloat(vComponent2[j]);
                        uComponent3[j] = parseFloat((u1 + (-u1 + u2) / n * i).toFixed(5));
                        vComponent3[j] = parseFloat((v1 + (-v1 + v2) / n * i).toFixed(5));
                    }
                    var data = {};
                    var time_ = time + timeStep * i
                    data["u-data"] = uComponent3;
                    data["v-data"] = vComponent3;
                    data = JSON.stringify(data);
                    dataFn.writeFileData("current_interpo//" + username + "_" + timenow + "//uv_value_t_" + time_ + ".json", data).then(data => {
                        console.log("插值完成",time_)
                    }).catch(message => {
                        console.log(message)
                    })
                }
            }
            resolve();
        })
        promise1.then(function () {
            res.jsonp("插值完成");
        })
    })
});
module.exports = router;
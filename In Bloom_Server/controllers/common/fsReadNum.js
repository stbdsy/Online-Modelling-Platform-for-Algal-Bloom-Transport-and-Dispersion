const path = require('path')
const fs = require('fs')
const basePath = 'data//'
var express = require('express');
var router = express.Router();
router.prefix = '/fsReadNum'
router.post('/', function (req, res, next) {
  var data = [];
  var dir = req.body["Dir"];
  mapDir(
    dir,
    function (file, filename) {
      try {
        if (filename.split("_")[1] == "x.json") {
          var points = file.toString().split(';');
          var count0 = 0;
          var count2 = 0;
          var count4 = 0;
          for (var i = 0; i < points.length; i++) {
            if (points[i] != "") {
              var temp = points[i].toString().split(',');
              if (temp[1] == 0 || temp[1] == 3) {
                count0 = count0 + 1;
              } else if (temp[1] == 2) {
                count2 = count2 + 1;
              } else if (temp[1] == 4) {
                count4 = count4 + 1;
              }
            }
          }
          data.push(count0);
          data.push(count2);
          data.push(count4);
          data.push(filename);
        }
      } catch (e) {
        console.log(e);
      }
    },
    function (n) {
      console.log(n, '个文件遍历完毕')
      res.jsonp(data);
    }
  )
})
module.exports = router;
function mapDir(dir, callback, finish) {
  files = fs.readdirSync(dir);
  files.forEach((filename, index) => {
    // if (filename.split("_")[1]!="y.json"){
    let pathname = path.join(dir, filename)
    var stats = fs.statSync(pathname);
    if (stats.isDirectory()) {
      return
    } else if (stats.isFile()) {
      callback && callback(fs.readFileSync(pathname), filename);
    }
    if (index == files.length - 1) {
      finish && finish(files.length)
    }
    // }else{return}
  })
}
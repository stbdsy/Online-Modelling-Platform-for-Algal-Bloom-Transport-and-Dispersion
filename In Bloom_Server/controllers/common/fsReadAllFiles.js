const path = require('path')
const fs = require('fs')
const basePath = 'data//'
var express = require('express');
var router = express.Router();
router.prefix = '/fsReadAllFiles'
router.post('/', function (req, res, next) {
  var data = [];
  var dir = req.body["Dir"];
  mapDir(
    dir,
    function (file, filename) {
      try {
        var points = file.toString().split(';');
        points.pop();
        data.push(filename);
        data.push(points);
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
  })
}
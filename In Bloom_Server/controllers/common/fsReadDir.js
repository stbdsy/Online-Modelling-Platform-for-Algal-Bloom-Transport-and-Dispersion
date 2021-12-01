const path = require('path')
const fs = require('fs')
const basePath = 'data//'
var express = require('express');
var router = express.Router();
router.prefix = '/fsReadDir'
router.post('/', function (req, res, next) {
  var data = [];
  var dir = req.body["Dir"];
  var pointId = parseInt(req.body["pointId"]);
  mapDir(
    dir,
    function (file, filename) {
      var points = file.toString().split(';');
      var point = points[pointId].split(',');
      data.push(point[0]);
      data.push(filename);
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
      callback && callback(fs.readFileSync(pathname),filename);
    }
    if (index == files.length - 1) {
      finish && finish(files.length)
    }
  })
}
// fs.readdir(dir, function (err, files) {
  //   if (err) {
  //     console.error(err)
  //     return
  //   }
  //   files.forEach((filename, index) => {
  //     let pathname = path.join(dir, filename)
      // fs.statSync(pathname, (err, stats) => { // 读取文件信息
      //   if (err) {
      //     console.log('获取文件stats失败')
      //     return
      //   }
      //   if (stats.isDirectory()) {
      //     mapDir(pathname, callback, finish)
      //   } else if (stats.isFile()) {
      //     //   if (['.json', '.less'].includes(path.extname(pathname))) {  // 排除 目录下的 json less 文件
      //     //     return
      //     //   }
      //     fs.readFileSync(pathname, (err, data) => {
      //       if (err) {
      //         console.error(err)
      //         return
      //       }
      //       callback && callback(data)
      //     })
      //   }
      // })
  //     if (index === files.length - 1) {
  //       finish && finish(files.length)
  //     }
  //   })
  // })
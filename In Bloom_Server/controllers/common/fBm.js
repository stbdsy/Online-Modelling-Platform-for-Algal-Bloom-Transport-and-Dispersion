var express = require('express');
var fs = require("fs");
var turf = require("@turf/turf");
var dataService = require('./dataService');
var gcode;
var BITS = [16, 8, 4, 2, 1];
var BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
let poly0;
let poly1;
let poly2;
let poly3;
let linestrings=[];
var fBmX;
var fBmY;
var polyboundary = [];
let pointsCollection = [];
let new_pointsCollection = [];
let coordinatesCollectionX = "";
let coordinatesCollectionY = "";
var router = express.Router();
router.prefix = '/fBm'
router.post('/', function (req, res, next) {
    var Promise0 = new Promise(function (resolve, reject) {
        getBoundaries();
        resolve();
    });
    Promise0.then(function () {
        var Promise1 = new Promise(function (resolve, reject) {
            var params = req.body;
            discretization(params);
            resolve(params);
        });
        Promise1.then(function (params) {
            calfBm(params);
            res.jsonp("计算结束");
        });
    });

});
module.exports = router;
function getBoundaries() {
    data = fs.readFileSync('boundary_data/export.json');
    var response = JSON.parse(data);
    var coordinates = response["features"][0]["geometry"]["coordinates"];
    poly0 = turf.polygon([coordinates[0]]);
    poly1 = turf.polygon([coordinates[1]]);
    poly2 = turf.polygon([coordinates[2]]);
    poly3 = turf.polygon([coordinates[3]]);

    data_ = fs.readFileSync('boundary_data/points_gcode.json');
    var response_ = JSON.parse(data_);
    gcode = response_[0]["g-code"];

    data_1 = fs.readFileSync('boundary_data/boundary.json');
    var response_1 = JSON.parse(data_1);
    var gcode_1 = response_1.split(",")
    for (var _i = 0; _i < gcode_1.length; _i++) {
        code = gcode_1[_i];
        var extent = decodeGeoHash(code);
        polyboundary.push(turf.polygon([[
            [extent.longitude[1], extent.latitude[0]],
            [extent.longitude[0], extent.latitude[0]],
            [extent.longitude[0], extent.latitude[1]],
            [extent.longitude[1], extent.latitude[1]],
            [extent.longitude[1], extent.latitude[0]]
        ]]));
    }

    data_2 = fs.readFileSync('boundary_data/boundary_line_84.json');
    data_2 = JSON.parse(data_2);
    var lines = data_2["features"];
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i]["geometry"]["coordinates"];
        var linestring = turf.lineString(line);
        linestrings.push(linestring);
    }
}
function discretization(params) {
    pointsCollection = [];
    new_pointsCollection = [];
    coordinatesCollectionX = "";
    coordinatesCollectionY = "";
    let initialArea = JSON.parse(params["initialArea"]);
    let initialAreas = initialArea["features"];
    let numPoints = params["numPoints"];
    let polygons = [];
    let areas = [];
    let coordinates = [];
    let areaNum = initialAreas.length;
    let areaSum = 0;
    let pNum = [];
    for (var i = 0; i < areaNum; i++) {
        coordinates[i] = initialAreas[i]["geometry"]["coordinates"][0];
        polygon = turf.polygon([coordinates[i]]);
        var intersection = turf.intersect(polygon, poly0);
        polygons.push(intersection);
        area = turf.area(intersection);
        areas.push(area);
        areaSum = areaSum + area;
    }
    var x = [];
    var y = [];
    var xMax = [];
    var yMax = [];
    var xMin = [];
    var yMin = [];
    for (var i = 0; i < coordinates.length; i++) {
        for (var j = 0; j < coordinates[i].length; j++) {
            if (coordinates[i][j] != null) {
                x.push(coordinates[i][j][0]);
                y.push(coordinates[i][j][1]);
            }
        }
        xMax.push(Math.max.apply(null, x));
        yMax.push(Math.max.apply(null, y));
        xMin.push(Math.min.apply(null, x));
        yMin.push(Math.min.apply(null, y));
    }
    for (var i = 0; i < areaNum; i++) {
        pNum[i] = Math.round(numPoints * areas[i] / areaSum);
        var p1 = Math.round(pNum[i] * 0.1);
        var p1_, p1_count;
        let distances = [];
        let sum = 0;
        var options = { units: 'kilometers' };
        for (var j = 0; j < coordinates[i].length - 1; j++) {
            var distance = turf.distance(coordinates[i][j], coordinates[i][j + 1], options);
            distances.push(distance);
            sum = sum + distance;
        }
        p1_count = 0;
        for (var j = 0; j < distances.length; j++) {
            p1_ = Math.round(p1 * distances[j] / sum);
            for (var k = 0; k < p1_; k++) {
                longitude = parseFloat(coordinates[i][j][0]) + k * (coordinates[i][j + 1][0] - coordinates[i][j][0]) / p1_;
                latitude = parseFloat(coordinates[i][j][1]) + k * (coordinates[i][j + 1][1] - coordinates[i][j][1]) / p1_;
                var point = turf.point([longitude, latitude]);
                if (turf.booleanPointInPolygon(point, poly0) && !turf.booleanPointInPolygon(point, poly1) && !turf.booleanPointInPolygon(point, poly2) && !turf.booleanPointInPolygon(point, poly3)) {
                    pointsCollection.push(point);
                    coordinatesCollectionX += longitude + ',' + 0 + ';';
                    coordinatesCollectionY += latitude + ',' + 0 + ';';
                    p1_count = p1_count + 1;
                }
            }
        }
        var p2 = pNum[i] - p1_count;
        while (p2 > 0) {
            try {
                // 随机生成经、纬、高
                var longitude = Math.random() * (xMax[i] - xMin[i]) + xMin[i];
                var latitude = Math.random() * (yMax[i] - yMin[i]) + yMin[i];
                var point = turf.point([longitude, latitude]);
                if (!turf.booleanPointInPolygon(point, poly1) && !turf.booleanPointInPolygon(point, poly2) && !turf.booleanPointInPolygon(point, poly3)) {
                    if (!turf.booleanPointInPolygon(point, polygons[i])) {
                        throw ("超出边界！");
                    }
                    p2 = p2 - 1;
                    pointsCollection.push(point);
                    coordinatesCollectionX += longitude + ',' + 0 + ';';
                    coordinatesCollectionY += latitude + ',' + 0 + ';';
                }
            }
            catch (e) {
            }
        }
    }
}
function calfBm(params) {
    fBmX = new Array();
    fBmY = new Array();
    var username = params["user"];
    var taskname = params["taskname"];
    var timenow = params["timenow"];
    var secs = params["timeStep"];
    var FbmStepSize = params["FbmStepSize"];
    var hurst = params["hurst"];
    var pointCnt = pointsCollection.length;
    var units = secs * 1000 / FbmStepSize;
    var windDragCoef = params["windDragCoef"];
    var windSpeed = params["windSpeed"];
    var windDirection = params["windDirection"];
    var windU = windSpeed * Math.sin(windDirection);
    var windV = windSpeed * Math.cos(windDirection);
    var startTime = parseFloat(params["startTime"]);
    var stopTime = parseFloat(params["stopTime"]);
    var timeStep = parseFloat(params["timeStep"]);
    var length = (stopTime - startTime) / secs + 1;
    var strand = params["strand"];
    var currentDragCoef = params["currentDragCoef"];
    var numPoints = params["numPoints"];
    var initialArea_ = params["initialArea"];

    var sql = "INSERT INTO tasks (username, taskname, time, model, starttime, endtime, timeStep, pointsnum, strand, windDragCoef, windSpeed, windDirection, initialArea, FbmStepSize, hurst) VALUES " +
        "('" + username + "', '" + taskname + "','" + timenow + "','fBm','" + startTime + "','" + stopTime + "','" + timeStep + "','" + numPoints + "','" + strand + "','" + windDragCoef + "','" + windSpeed + "','" + windDirection + "','" + initialArea_ + "','" + FbmStepSize + "','" + hurst + "')";
    dataService.queryPromise(sql).then(function (serviceResp) {
        var results = serviceResp.results;
        console.log(results);
    });
    var promise3 = new Promise(function (resolve, reject) {
        fs.mkdir("data//" + username + "_" + timenow, 0777, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("creat done!");
            }
        })
        resolve();
    })
    promise3.then(function () {
        fs.writeFileSync("data//" + username + "_" + timenow + "//" + startTime + "_x.json", coordinatesCollectionX);
        fs.writeFileSync("data//" + username + "_" + timenow + "//" + startTime + "_y.json", coordinatesCollectionY);
        let countArray = [];
        let strandedArray = [];
        var seed1 = Math.random() * 100000;
        var seed2 = Math.random() * 100000;
        var seed3 = Math.random() * 100000;
        var seed4 = Math.random() * 100000;
        var promise2 = new Promise(function (resolve, reject) {
            for (var j = 0; j < pointCnt; j++) {
                var strx = FBmSolution(secs, hurst, length, units, seed1, seed2);
                var stry = FBmSolution(secs, hurst, length, units, seed3, seed4);
                outpx = strx.split(';');
                outpy = stry.split(';');
                fBmX[j] = new Array();
                fBmY[j] = new Array();
                for (var k = 0; k < outpx.length - 1; k++) {
                    fBmX[j][k] = parseFloat(outpx[k]);
                    fBmY[j][k] = parseFloat(outpy[k]);
                }
            }
            resolve();
        })
        promise2.then(function () {
            loopArray(startTime);
            function loopArray(time) {
                var promise0 = new Promise(function (resolve, reject) {
                    console.log("fBm计算完成" + time)
                    let uComponent, vComponent;
                    if (time % 3600 == 0) {
                        data = fs.readFileSync("current//uv_value_t_" + time + ".json");
                        data = JSON.parse(data);
                        data = data[0];
                    } else {
                        data = fs.readFileSync("current_interpo//" + username + "_" + timenow + "//uv_value_t_" + time + ".json");
                        data = JSON.parse(data);
                    }
                    uComponent = data["u-data"];
                    vComponent = data["v-data"];
                    grid = [];
                    for (var k = 0; k < uComponent.length; k++) {
                        var uv = _calcUV(uComponent[k], vComponent[k]);
                        grid.push(uv);
                    }
                    var Promise1 = new Promise(function (resolve, reject) {
                        new_pointsCollection = [];
                        coordinatesCollectionX = "";
                        coordinatesCollectionY = "";
                        for (var i = 0; i < pointsCollection.length; i++) {
                            let longitude, latitude;
                            try {
                                coordinate = pointsCollection[i]["geometry"]["coordinates"];
                                if (IsInArray(countArray, i)) {
                                    throw ("超出边界！(3)");
                                }
                                if (IsInArray(strandedArray, i)) {
                                    throw ("已经附着");
                                }
                                velocity = getIn(coordinate[0], coordinate[1]);
                                if (velocity[0] == 0 && velocity[1] == 0) {
                                    throw ("超出边界！(1)");
                                }
                                dx = velocity[0] * timeStep / 1000 * currentDragCoef;
                                dy = velocity[1] * timeStep / 1000 * currentDragCoef;
                                dx = dx + windDragCoef * (windU - velocity[0]) * timeStep / 1000;
                                dy = dy + windDragCoef * (windV - velocity[1]) * timeStep / 1000;
                                var k = (time - startTime) / timeStep;
                                dx = dx + fBmX[i][k];
                                dy = dy + fBmY[i][k];
                                if (dx == 0 && dy == 0) {
                                    throw ("超出边界！(1)");
                                }
                                brng = Math.atan2(dy, dx) * 180 / Math.PI;
                                dist = Math.sqrt(dx * dx + dy * dy);
                                var from = turf.point(coordinate);
                                var options = { units: 'kilometers' };
                                var destination = turf.destination(from, dist, brng, options);
                                longitude = destination["geometry"]["coordinates"][0];
                                latitude = destination["geometry"]["coordinates"][1];
                                var point = destination;
                                for (var _i = 0; _i < polyboundary.length; _i++) {
                                    if (turf.booleanPointInPolygon(point, polyboundary[_i])) {
                                        throw ("超出边界！(2)");
                                    }
                                }
                                if (turf.booleanPointInPolygon(point, poly0) && !turf.booleanPointInPolygon(point, poly1) && !turf.booleanPointInPolygon(point, poly2) && !turf.booleanPointInPolygon(point, poly3)) {
                                }
                                else {
                                    var rand = Math.random();
                                    if (rand > strand) {
                                        brng = brng + 180;
                                        var destination_new = turf.destination(from, dist / 2, brng, options);
                                        longitude = destination_new["geometry"]["coordinates"][0];
                                        latitude = destination_new["geometry"]["coordinates"][1];
                                        point = destination_new;
                                        if (turf.booleanPointInPolygon(point, poly0) && !turf.booleanPointInPolygon(point, poly1) && !turf.booleanPointInPolygon(point, poly2) && !turf.booleanPointInPolygon(point, poly3)) {
                                        }
                                        else {
                                            longitude = coordinate[0];
                                            latitude = coordinate[1];
                                            point = turf.point([coordinate[0], coordinate[1]]);
                                        }
                                    }
                                    else {
                                        throw ("岸界附着");
                                    }
                                }
                                new_pointsCollection.push(point);
                                longitude = point["geometry"]["coordinates"][0];
                                latitude = point["geometry"]["coordinates"][1];
                                coordinatesCollectionX += longitude + ',' + 0 + ';';
                                coordinatesCollectionY += latitude + ',' + 0 + ';';
                            }
                            catch (e) {
                                if (e == "超出边界！(2)") {
                                    if (!IsInArray(countArray, i)) {
                                        countArray.push(i);
                                    }
                                    new_pointsCollection.push(point);
                                    coordinatesCollectionX += longitude + ',' + 1 + ';';
                                    coordinatesCollectionY += latitude + ',' + 1 + ';';
                                }
                                if (e == "超出边界！(1)" || e == "超出边界！(3)") {
                                    if (!IsInArray(countArray, i)) {
                                        countArray.push(i);
                                    }
                                    var point = turf.point([coordinate[0], coordinate[1]]);
                                    new_pointsCollection.push(point);
                                    coordinatesCollectionX += coordinate[0] + ',' + 1 + ';';
                                    coordinatesCollectionY += coordinate[1] + ',' + 1 + ';';
                                }
                                if (e == "岸界附着") {
                                    var line = turf.lineString([[coordinate[0], coordinate[1]], [longitude, latitude]]);
                                    var point;
                                    for (var j = 0; j < linestrings.length; j++) {
                                        var intersects = turf.lineIntersect(line, linestrings[j]);
                                        if (intersects["features"].length != 0) {
                                            point["geometry"]["coordinates"] = intersects["features"][0]["geometry"]["coordinates"];
                                        }
                                    }
                                    strandedArray.push(i);
                                    new_pointsCollection.push(point);
                                    coordinatesCollectionX += point["geometry"]["coordinates"][0] + ',' + 2 + ';';
                                    coordinatesCollectionY += point["geometry"]["coordinates"][1] + ',' + 2 + ';';
                                }
                                if (e == "已经附着") {
                                    var point = turf.point([coordinate[0], coordinate[1]]);
                                    new_pointsCollection.push(point);
                                    coordinatesCollectionX += coordinate[0] + ',' + 2 + ';';
                                    coordinatesCollectionY += coordinate[1] + ',' + 2 + ';';
                                }
                            }
                        }
                        resolve();
                    });
                    Promise1.then(function () {
                        time = time + timeStep;
                        fs.writeFileSync("data//" + username + "_" + timenow + "//" + time + "_x.json", coordinatesCollectionX);
                        fs.writeFileSync("data//" + username + "_" + timenow + "//" + time + "_y.json", coordinatesCollectionY);
                        pointsCollection = new_pointsCollection;
                    })
                    resolve();
                })
                promise0.then(() => {
                    if (time <= stopTime) {
                        loopArray(time);
                    }
                });
            }
        })
    })
}
function _calcUV(u, v) {
    return [+u, +v, Math.sqrt(u * u + v * v)];
}
function getIn(x, y) {
    var point_gcode = encodeGeoHash(x, y);
    var result;
    var nearestpoints = [];
    var idw = new IDWClass();
    try {
        try {
            nearest = gcode[0][point_gcode.substring(0, 1)][point_gcode.substring(0, 2)][point_gcode.substring(0, 3)][point_gcode.substring(0, 4)][point_gcode.substring(0, 5)];
            for (obj in nearest) {
                nearestpoints.push(nearest[obj]);
            }
        }
        catch (e) {
            nearestpoints = [];
        }
        if (nearestpoints.length > 0) {
            var pointsU = [];
            var pointsV = [];
            var targetPoint = { 'x': x, 'y': y, 'z': null };
            for (_i = 0; _i < nearestpoints.length; _i++) {
                var np = nearestpoints[_i];
                var p = decodeGeoHash(nearestpoints[_i]);
                for (__i = 0; __i < np.length; __i++) {
                    var w = grid[np[__i][1]];
                    var point = { 'x': p.longitude[0], 'y': p.latitude[0], 'z': w[0] };
                    pointsU.push(point);
                    var point = { 'x': p.longitude[0], 'y': p.latitude[0], 'z': w[1] };
                    pointsV.push(point);
                }
            }
            var u = idw.getZValueFunc(pointsU, targetPoint);
            var v = idw.getZValueFunc(pointsV, targetPoint);
            result = _calcUV(u, v);
            return result
        }
        else {
            return [0, 0, 0];
        }
    } catch (e) {
        return [0, 0, 0];
    }
}
function IDWClass() {
    var _beta = 2;
    var _points = new Object();
    var _targetPoint = new Object();
    this._getZValueFunc = function (pointsArray, targetPoint) {
        _points = pointsArray;
        _targetPoint = targetPoint;
        _getDistance();
        _getWeight();
        _getTargetZ();
        return _targetPoint.z;
    };
    _getDistance = function () {
        function getDistance(lat1, lng1, lat2, lng2) {
            var radLat1 = lat1 * Math.PI / 180.0;
            var radLat2 = lat2 * Math.PI / 180.0;
            var a = radLat1 - radLat2;
            var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
            s = s * 6378.137;// EARTH_RADIUS;
            s = Math.round(s * 10000) / 10000;
            return s;
        };
        for (var i = 0; i < _points.length; i++) {
            if (!_points[i].d)
                _points[i].d = new Object();
            // _points[i].d = Math.sqrt(Math.pow((_targetPoint.x - points[i].x), 2) + Math.pow((_targetPoint.y - _points[i].y), 2));
            _points[i].d = getDistance(_targetPoint.y, _targetPoint.x, _points[i].y, _points[i].x);
        }
    };
    _getFenmu = function () {
        var fenmu = 0;
        for (var i = 0; i < _points.length; i++) {
            fenmu += Math.pow((1 / _points[i].d), _beta);
        }
        return fenmu;
    };

    _getWeight = function () {

        var fenmu = _getFenmu();
        for (var i = 0; i < _points.length; i++) {
            if (!_points[i].w)
                _points[i].w = new Object();
            _points[i].w = Math.pow((1 / _points[i].d), _beta) / fenmu;
        }
    }

    _getTargetZ = function () {
        if (!_targetPoint.z)
            _targetPoint.z = 0;
        for (var i = 0; i < _points.length; i++) {
            _targetPoint.z += _points[i].z * _points[i].w;
        }
    }
    return {
        getZValueFunc: this._getZValueFunc,
    };
};
function IsInArray(arr, val) {
    var testStr = ',' + arr.join(",") + ",";
    return testStr.indexOf("," + val + ",") != -1;
}
//geohash
var refine_interval = function (interval, cd, mask) {
    if (cd & mask)
        interval[0] = (interval[0] + interval[1]) / 2;
    else
        interval[1] = (interval[0] + interval[1]) / 2;
}
var decodeGeoHash = function (geohash) {
    var is_even = 1;
    var lat = []; var lon = [];
    lat[0] = -90.0; lat[1] = 90.0;
    lon[0] = -180.0; lon[1] = 180.0;
    lat_err = 90.0; lon_err = 180.0;
    for (i = 0; i < geohash.length; i++) {
        c = geohash[i];
        cd = BASE32.indexOf(c);
        for (j = 0; j < 5; j++) {
            mask = BITS[j];
            if (is_even) {
                lon_err /= 2;
                refine_interval(lon, cd, mask);
            } else {
                lat_err /= 2;
                refine_interval(lat, cd, mask);
            }
            is_even = !is_even;
        }
    }
    lat[2] = (lat[0] + lat[1]) / 2;
    lon[2] = (lon[0] + lon[1]) / 2;
    return { latitude: lat, longitude: lon };
}
var encodeGeoHash = function (longitude, latitude) {
    var is_even = 1;
    var i = 0;
    var lat = []; var lon = [];
    var bit = 0;
    var ch = 0;
    var precision = 10;
    geohash = "";
    lat[0] = -90.0; lat[1] = 90.0;
    lon[0] = -180.0; lon[1] = 180.0;
    while (geohash.length < precision) {
        if (is_even) {
            mid = (lon[0] + lon[1]) / 2;
            if (longitude > mid) {
                ch |= BITS[bit];
                lon[0] = mid;
            } else
                lon[1] = mid;
        } else {
            mid = (lat[0] + lat[1]) / 2;
            if (latitude > mid) {
                ch |= BITS[bit];
                lat[0] = mid;
            } else
                lat[1] = mid;
        }

        is_even = !is_even;
        if (bit < 4)
            bit++;
        else {
            geohash += BASE32[ch];
            bit = 0;
            ch = 0;
        }
    }
    return geohash;
}
var nearestGeoHash = function (codestring) {
    result = []
    try {
        code_length = codestring.length
        var oddtable = [["b", "c", "f", "g", "u", "v", "y", "z"], ["8", "9", "d", "e", "s", "t", "w", "x"], ["2", "3", "6", "7", "k", "m", "q", "r"], ["0", "1", "4", "5", "h", "j", "n", "p"]]
        var eventable = [["p", "r", "x", "z"], ["n", "q", "w", "y"], ["j", "m", "t", "v"], ["h", "k", "s", "u"], ["5", "7", "e", "g"], ["4", "6", "d", "f"], ["1", "3", "9", "c"], ["0", "2", "8", "b"]]
        var dx = [-1, 0, 1];
        var dy = [-1, 0, 1];
        var isodd = true;
        if (code_length % 2 == 0) {
            isodd = false
        }
        else {
            isodd = true
        }
        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                var char_tem = ""
                var flag_tem = true
                var index = code_length - 1
                while (index >= 0) {
                    var c;
                    cchar = codestring[index].toString();
                    if (flag_tem) {
                        var ix = 0;
                        var iy = 0;
                        if (isodd) {
                            for (var _i = 0; _i < 4; _i++) {
                                for (var _j = 0; _j < 8; _j++) {
                                    if (oddtable[_i][_j] == cchar) {
                                        ix = _i;
                                        iy = _j;
                                    }
                                }
                            }
                        }
                        else {
                            for (var _i = 0; _i < 8; _i++) {
                                for (var _j = 0; _j < 4; _j++) {
                                    if (eventable[_i][_j] == cchar) {
                                        ix = _i;
                                        iy = _j;
                                    }
                                }
                            }
                        }
                        var c_x = ix + dx;
                        var c_y = iy + dy;
                        flag_tem = false
                        if (isodd) {
                            if (c_x == 4) {
                                c_x = 0
                                flag_tem = true
                            }
                            if (c_x == -1) {
                                c_x = 3
                                flag_tem = true
                            }
                            if (c_y == 8) {
                                c_y = 0
                                flag_tem = true
                            }
                            if (c_y == -1) {
                                c_y = 7
                                flag_tem = true
                            }
                            c = oddtable[c_x][c_y]
                        }
                        else {
                            if (c_x == 8) {
                                c_x = 0
                                flag_tem = true
                            }
                            if (c_x == -1) {
                                c_x = 7
                                flag_tem = true
                            }
                            if (c_y == 4) {
                                c_y = 0
                                flag_tem = true
                            }
                            if (c_y == -1) {
                                c_y = 3
                                flag_tem = true
                            }
                            c = eventable[c_x][c_y]
                        }
                    }
                    else {
                        c = cchar
                    }

                    char_tem = c + char_tem
                    index = index - 1;
                    if (isodd) {
                        isodd = false
                    }
                    else {
                        isodd = true
                    }
                }
                result.push(char_tem)
            }
        }
        return result
    }
    catch (e) {
        return e
    }
}
//fBm
function snorm() {
    temp = getNumberInNormalDistribution(0, 0.1);
    // while (temp > 1 || temp < 0)
    //     temp = getNumberInNormalDistribution(0, 0.1) + 0.5;
    return temp;
}
function getNumberInNormalDistribution(mean, std_dev) {
    return mean + (randomNormalDistribution() * std_dev);
}
function randomNormalDistribution() {
    var u = 0.0, v = 0.0, w = 0.0, c = 0.0;
    do {
        //获得两个（-1,1）的独立随机变量
        u = Math.random() * 2 - 1.0;
        v = Math.random() * 2 - 1.0;
        w = u * u + v * v;
    } while (w == 0.0 || w >= 1.0)
    //这里就是 Box-Muller转换
    c = Math.sqrt((-2 * Math.log(w)) / w);
    //返回2个标准正态分布的随机数，封装进一个数组返回
    //当然，因为这个函数运行较快，也可以扔掉一个
    //return [u*c,v*c];
    return u * c;
}
function covariance(i, H) {
    if (i == 0) return 1;
    else return (Math.pow(i - 1, 2 * H) - 2 * Math.pow(i, 2 * H) + Math.pow(i + 1, 2 * H)) / 2;
}
function FBmSolution(secs, hurst, length, units, seed1, seed2) {
    var m = units * length;
    var i, j, generator;//, m = pow(2.0,*n)
    var phi = new Array(m);
    var psi = new Array(m);
    var cov = new Array(m);
    var output = new Array(m);
    var v, scaling;

    /* initialization */
    output[0] = snorm();
    v = 1;
    phi[0] = 0;
    for (i = 0; i < m; i++)
        cov[i] = covariance(i, hurst);

    /* simulation */
    for (i = 1; i < m; i++) {
        phi[i - 1] = cov[i];
        for (j = 0; j < i - 1; j++) {
            psi[j] = phi[j];
            phi[i - 1] -= psi[j] * cov[i - j - 1];
        }
        phi[i - 1] /= v;
        for (j = 0; j < i - 1; j++) {
            phi[j] = psi[j] - phi[i - 1] * psi[i - j - 2];
        }
        v *= (1 - phi[i - 1] * phi[i - 1]);

        output[i] = 0;
        for (j = 0; j < i; j++) {
            output[i] += phi[j] * output[i - j - 1];
        }
        output[i] += Math.sqrt(v) * snorm();
    }

    var out = new Array(length);
    /* rescale to obtain a sample of size 2^(*n) on [0,L] */
    scaling = Math.pow(secs / units, hurst) / 10;
    for (i = 0; i < length; i++) out[i] = 0;
    for (i = 0; i < m; i++) {
        output[i] = scaling * (output[i]);
        //if (i>0) {
        out[i / units] += output[i];
        //}
    }

    var result = "";
    for (var i = 0; i < length; i++) {
        result = result + out[i].toString();
        result = result + ";";
    }
    return result;
}
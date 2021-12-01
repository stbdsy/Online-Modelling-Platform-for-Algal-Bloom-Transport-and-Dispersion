/****
 *风场类
 ****/
var CanvasWindy = function(json, params) {
    //风场json数据
    this.windData = json;
    //可配置参数
    this.viewer = params.viewer;
    this.canvas = params.canvas;
    this.INTENSITY_SCALE_STEP = 10;
    this.MAX_WIND_INTENSITY = .4;
    this.extent = params.extent || []; //风场绘制时的地图范围，范围不应该大于风场数据的范围，顺序：west/east/south/north，有正负区分，如：[110,120,30,36]
    this.canvasContext = params.canvas.getContext("2d"); //canvas上下文
    this.canvasWidth = params.canvasWidth || 300; //画板宽度
    this.canvasHeight = params.canvasHeight || 180; //画板高度
    this.speedRate = params.speedRate || 100; //风前进速率，意思是将当前风场横向纵向分成100份，再乘以风速就能得到移动位置，无论地图缩放到哪一级别都是一样的速度，可以用该数值控制线流动的快慢，值越大，越慢，
    this.particlesNumber = params.particlesNumber || 20000; //初始粒子总数，根据实际需要进行调节
    this.maxAge = params.maxAge || 120; //每个粒子的最大生存周期
    this.frameTime = 1000 / (params.frameRate || 10); //每秒刷新次数，因为requestAnimationFrame固定每秒60次的渲染，所以如果不想这么快，就把该数值调小一些
    this.color = params.color || '#ffffff'; //线颜色，提供几个示例颜色['#14208e','#3ac32b','#e0761a']
    this.lineWidth = params.lineWidth || 1; //线宽度
    //内置参数
    this.initExtent = []; //风场初始范围
    this.calc_speedRate = [0, 0]; //根据speedRate参数计算经纬度步进长度
    this.windField = null;
    this.particles = [];
    this.animateFrame = null; //requestAnimationFrame事件句柄，用来清除操作
    this.isdistory = false; //是否销毁，进行删除操作
    this._init();
};
CanvasWindy.prototype = {
    constructor: CanvasWindy,
    _init: function() {
        var self = this;
        // 创建风场网格
        this.windField = this.createField();
        // console.log(this.windField.getIn(119.39653,39.2322))
        // console.log(this.windField.getIn(119.84406, 39.7035))
        // this.colorStyles = this.windIntensityColorScale(this.INTENSITY_SCALE_STEP, this.MAX_WIND_INTENSITY);
        // console.log(this.colorStyles)
        // this.buckets = this.colorStyles.map(function () { return []; });
        // console.log(buckets)
        this.initExtent = [this.windField.west, this.windField.east, this.windField.south, this.windField.north];
        //如果风场创建时，传入的参数有extent，就根据给定的extent，让随机生成的粒子落在extent范围内
        if (this.extent.length != 0) {
            this.extent = [
                Math.max(this.initExtent[0], this.extent[0]),
                Math.min(this.initExtent[1], this.extent[1]),
                Math.max(this.initExtent[2], this.extent[2]),
                Math.min(this.initExtent[3], this.extent[3])
            ];
        }
        //console.log(this.initExtent);
        this._calcStep();
        // 创建风场粒子
        for (var i = 0; i < this.particlesNumber; i++) {
            this.particles.push(this.randomParticle(new CanvasParticle()));
        }
        this.canvasContext.fillStyle = "rgba(0, 0, 0, 0.97)";
        this.canvasContext.globalAlpha = 0.6;
        this.animate();
        var then = Date.now();
        (function frame() {
            if (!self.isdistory) {
                self.animateFrame = requestAnimationFrame(frame);
                var now = Date.now();
                var delta = now - then;
                if (delta > self.frameTime) {
                    then = now - delta % self.frameTime;
                    self.animate();
                }
            } else {
                self.removeLines();
            }
        })();
    },
    //计算经纬度步进长度
    _calcStep: function() {
        var isextent = (this.extent.length != 0);
        var calcExtent = isextent ? this.extent : this.initExtent;
        var calcSpeed = this.speedRate;
        this.calc_speedRate = [(calcExtent[1] - calcExtent[0]) / calcSpeed, (calcExtent[3] - calcExtent[2]) / calcSpeed];
    },
    //根据现有参数重新生成风场
    redraw: function() {
        window.cancelAnimationFrame(this.animateFrame);
        this.particles = [];
        this._init();
    },
    stop: function() {
        window.cancelAnimationFrame(this.animateFrame);
        this.isdistory = true;
        this.canvas.width = 1;
    },
    createField: function() {
        var data = this._parseWindJson();
        return new CanvasWindField(data);
    },
    windIntensityColorScale: function(step, maxWind) {

        var result = [
            //blue to red
            "rgba(" + hexToR('#178be7') + ", " + hexToG('#178be7') + ", " + hexToB('#178be7') + ", " + 1 + ")",
            "rgba(" + hexToR('#8888bd') + ", " + hexToG('#8888bd') + ", " + hexToB('#8888bd') + ", " + 1 + ")",
            "rgba(" + hexToR('#b28499') + ", " + hexToG('#b28499') + ", " + hexToB('#b28499') + ", " + 1 + ")",
            "rgba(" + hexToR('#cc7e78') + ", " + hexToG('#cc7e78') + ", " + hexToB('#cc7e78') + ", " + 1 + ")",
            "rgba(" + hexToR('#de765b') + ", " + hexToG('#de765b') + ", " + hexToB('#de765b') + ", " + 1 + ")",
            "rgba(" + hexToR('#ec6c42') + ", " + hexToG('#ec6c42') + ", " + hexToB('#ec6c42') + ", " + 1 + ")",
            "rgba(" + hexToR('#f55f2c') + ", " + hexToG('#f55f2c') + ", " + hexToB('#f55f2c') + ", " + 1 + ")",
            "rgba(" + hexToR('#fb4f17') + ", " + hexToG('#fb4f17') + ", " + hexToB('#fb4f17') + ", " + 1 + ")",
            "rgba(" + hexToR('#fe3705') + ", " + hexToG('#fe3705') + ", " + hexToB('#fe3705') + ", " + 1 + ")",
            "rgba(" + hexToR('#ff0000') + ", " + hexToG('#ff0000') + ", " + hexToB('#ff0000') + ", " + 1 + ")"
        ]

        function hexToR(h) { return parseInt((cutHex(h)).substring(0, 2), 16) }

        function hexToG(h) { return parseInt((cutHex(h)).substring(2, 4), 16) }

        function hexToB(h) { return parseInt((cutHex(h)).substring(4, 6), 16) }

        function cutHex(h) { return (h.charAt(0) == "#") ? h.substring(1, 7) : h }
        result.indexFor = function(m) { // map wind speed to a style
            return Math.floor(Math.min(m, maxWind) / maxWind * (result.length - 1));
        };
        return result;
    },
    animate: function() {
        var self = this,
            field = self.windField;

        var nextLng = null,
            nextLat = null,
            uv = null;
        // console.log(field.getIn(119.52046, 39.1585))
        self.particles.forEach(function(particle) {
            if (particle.age <= 0) {
                self.randomParticle(particle);
            }
            if (particle.age > 0) {
                var x = particle.x,
                    y = particle.y,
                    tlng = particle.tlng,
                    tlat = particle.tlat;
                if (!self.isInExtent(tlng, tlat)) {
                    particle.age = 0;
                } else {
                    uv = field.getIn(tlng, tlat);
                    // buckets[colorStyles.indexFor(uv[2])].push(particle);
                    nextLng = tlng + self.calc_speedRate[0] * uv[0];
                    nextLat = tlat + self.calc_speedRate[1] * uv[1];
                    particle.lng = tlng;
                    particle.lat = tlat;
                    particle.tlng = nextLng;
                    particle.tlat = nextLat;
                    particle.age--;
                }
            }
        });
        if (self.particles.length <= 0) this.removeLines();
        self._drawLines();
    },
    //粒子是否在地图范围内xx
    isInExtent: function(lng, lat) {
        var calcExtent = this.initExtent;
        if ((lng >= calcExtent[0] && lng <= calcExtent[1]) && (lat >= calcExtent[2] && lat <= calcExtent[3])) return true;
        return false;
    },
    _resize: function(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    },
    _parseWindJson: function() {
        var uComponent = null,
            vComponent = null,
            gcode = null,
            filter_5 = null,
            filter_6 = null,
            filter_7 = null,
            filter_8 = null,
            header = null;

        this.windData.forEach(function(record) {
            uComponent = record["u-data"]
            vComponent = record["v-data"]
            gcode = record["g-code"]
            filter_5 = record["filter-5"]
            filter_6 = record["filter-6"]
            filter_7 = record["filter-7"]
            filter_8 = record["filter-8"]
            header = record["header"]
        });
        return {
            header: header,
            uComponent: uComponent,
            vComponent: vComponent,
            gcode: gcode,
            filter_5: filter_5,
            filter_6: filter_6,
            filter_7: filter_7,
            filter_8: filter_8
        };
    },
    removeLines: function() {
        window.cancelAnimationFrame(this.animateFrame);
        this.isdistory = true;
        this.canvas.width = 1;
    },
    // 根据粒子当前所处的位置(棋盘网格位置)，计算经纬度，在根据经纬度返回屏幕坐标
    _tomap: function(lng, lat, particle) {
        var ct3 = Cesium.Cartesian3.fromDegrees(lng, lat, 0);
        // 判断当前点是否在地球可见端
        var isVisible = new Cesium.EllipsoidalOccluder(Cesium.Ellipsoid.WGS84, this.viewer.camera.position).isPointVisible(ct3);
        var pos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, ct3);
        if (!isVisible) {
            particle.age = 0;
        }
        // console.log(pos);
        return pos ? [pos.x, pos.y] : null;
    },
    _drawLines: function() {
        var self = this;
        var particles = this.particles;
        this.canvasContext.lineWidth = self.lineWidth;
        //后绘制的图形和前绘制的图形如果发生遮挡的话，只显示后绘制的图形跟前一个绘制的图形重合的前绘制的图形部分，示例：https://www.w3school.com.cn/tiy/t.asp?f=html5_canvas_globalcompop_all
        this.canvasContext.globalCompositeOperation = "destination-in";
        this.canvasContext.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.canvasContext.globalCompositeOperation = "lighter"; //重叠部分的颜色会被重新计算
        this.canvasContext.globalAlpha = 0.9;
        this.canvasContext.beginPath();
        this.canvasContext.strokeStyle = this.color;
        particles.forEach(function(particle) {
            var movetopos = self._tomap(particle.lng, particle.lat, particle);
            var linetopos = self._tomap(particle.tlng, particle.tlat, particle);
            // console.log(movetopos,linetopos);
            if (movetopos != null && linetopos != null) {
                self.canvasContext.moveTo(movetopos[0], movetopos[1]);
                self.canvasContext.lineTo(linetopos[0], linetopos[1]);
            }
        });
        this.canvasContext.stroke();
    },
    //随机数生成器（小数）
    fRandomByfloat: function(under, over) {
        return under + Math.random() * (over - under);
    },
    //随机数生成器（整数）
    fRandomBy: function(under, over) {
        switch (arguments.length) {
            case 1:
                return parseInt(Math.random() * under + 1);
            case 2:
                return parseInt(Math.random() * (over - under + 1) + under);
            default:
                return 0;
        }
    },
    //根据当前风场extent随机生成粒子
    randomParticle: function(particle) {
        var safe = 30,
            x = -1,
            y = -1,
            lng = null,
            lat = null;
        var hasextent = this.extent.length != 0;
        var calc_extent = hasextent ? this.extent : this.initExtent;
        do {
            try {
                if (hasextent) {
                    var pos_x = this.fRandomBy(0, this.canvasWidth);
                    var pos_y = this.fRandomBy(0, this.canvasHeight);
                    var cartesian = this.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(pos_x, pos_y), this.viewer.scene.globe.ellipsoid);
                    var cartographic = this.viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
                    if (cartographic) {
                        //将弧度转为度的十进制度表示
                        lng = Cesium.Math.toDegrees(cartographic.longitude);
                        lat = Cesium.Math.toDegrees(cartographic.latitude);
                    }
                } else {
                    lng = this.fRandomByfloat(calc_extent[0], calc_extent[1]);
                    lat = this.fRandomByfloat(calc_extent[2], calc_extent[3]);
                }
            } catch (e) {

            }
        } while (this.windField.getIn(lng, lat)[2] <= 0 && safe++ < 30);
        var field = this.windField;
        var uv = field.getIn(lng, lat);
        var nextLng = lng + this.calc_speedRate[0] * uv[0];
        var nextLat = lat + this.calc_speedRate[1] * uv[1];
        particle.lng = lng;
        particle.lat = lat;
        particle.tlng = nextLng;
        particle.tlat = nextLat;
        particle.speed = uv[2];
        particle.age = Math.round(Math.random() * this.maxAge); //每一次生成都不一样
        return particle;
    },
};

var Ghsah = function() {
    this.BITS = null;
    this.BASE32 = null;
    this.NEIGHBORS = null;
    this.BORDERS = null;
    this._init();
}
Ghsah.prototype = {
        constructor: Ghsah,
        _init: function() {
            this.BITS = [16, 8, 4, 2, 1];
            this.BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
            this.NEIGHBORS = {
                right: { even: "bc01fg45238967deuvhjyznpkmstqrwx" },
                left: { even: "238967debc01fg45kmstqrwxuvhjyznp" },
                top: { even: "p0r21436x8zb9dcf5h7kjnmqesgutwvy" },
                bottom: { even: "14365h7k9dcfesgujnmqp0r2twvyx8zb" }
            };
            this.BORDERS = {
                right: { even: "bcfguvyz" },
                left: { even: "0145hjnp" },
                top: { even: "prxz" },
                bottom: { even: "028b" }
            };
            this.NEIGHBORS.bottom.odd = this.NEIGHBORS.left.even;
            this.NEIGHBORS.top.odd = this.NEIGHBORS.right.even;
            this.NEIGHBORS.left.odd = this.NEIGHBORS.bottom.even;
            this.NEIGHBORS.right.odd = this.NEIGHBORS.top.even;

            this.BORDERS.bottom.odd = this.BORDERS.left.even;
            this.BORDERS.top.odd = this.BORDERS.right.even;
            this.BORDERS.left.odd = this.BORDERS.bottom.even;
            this.BORDERS.right.odd = this.BORDERS.top.even;
        },
        refine_interval: function(interval, cd, mask) {
            if (cd & mask)
                interval[0] = (interval[0] + interval[1]) / 2;
            else
                interval[1] = (interval[0] + interval[1]) / 2;
        },
        calculateAdjacent: function(srcHash, dir) {
            srcHash = srcHash.toLowerCase();
            var lastChr = srcHash.charAt(srcHash.length - 1);
            var type = (srcHash.length % 2) ? 'odd' : 'even';
            var base = srcHash.substring(0, srcHash.length - 1);
            if (this.BORDERS[dir][type].indexOf(lastChr) != -1)
                base = calculateAdjacent(base, dir);
            return base + this.BASE32[this.NEIGHBORS[dir][type].indexOf(lastChr)];
        },
        decodeGeoHash: function(geohash) {
            var is_even = 1;
            var lat = [];
            var lon = [];
            lat[0] = -90.0;
            lat[1] = 90.0;
            lon[0] = -180.0;
            lon[1] = 180.0;
            lat_err = 90.0;
            lon_err = 180.0;

            for (i = 0; i < geohash.length; i++) {
                c = geohash[i];
                cd = this.BASE32.indexOf(c);
                for (j = 0; j < 5; j++) {
                    mask = this.BITS[j];
                    if (is_even) {
                        lon_err /= 2;
                        this.refine_interval(lon, cd, mask);
                    } else {
                        lat_err /= 2;
                        this.refine_interval(lat, cd, mask);
                    }
                    is_even = !is_even;
                }
            }
            lat[2] = (lat[0] + lat[1]) / 2;
            lon[2] = (lon[0] + lon[1]) / 2;

            return { latitude: lat, longitude: lon };
        },
        encodeGeoHash: function(longitude, latitude) {
            var is_even = 1;
            var i = 0;
            var lat = [];
            var lon = [];
            var bit = 0;
            var ch = 0;
            var precision = 10;
            geohash = "";

            lat[0] = -90.0;
            lat[1] = 90.0;
            lon[0] = -180.0;
            lon[1] = 180.0;

            while (geohash.length < precision) {
                if (is_even) {
                    mid = (lon[0] + lon[1]) / 2;
                    if (longitude > mid) {
                        ch |= this.BITS[bit];
                        lon[0] = mid;
                    } else
                        lon[1] = mid;
                } else {
                    mid = (lat[0] + lat[1]) / 2;
                    if (latitude > mid) {
                        ch |= this.BITS[bit];
                        lat[0] = mid;
                    } else
                        lat[1] = mid;
                }

                is_even = !is_even;
                if (bit < 4)
                    bit++;
                else {
                    geohash += this.BASE32[ch];
                    bit = 0;
                    ch = 0;
                }
            }
            return geohash;
        },
        nearestGeoHash: function(codestring) {
            result = []
            try {
                code_length = codestring.length
                var oddtable = [
                    ["b", "c", "f", "g", "u", "v", "y", "z"],
                    ["8", "9", "d", "e", "s", "t", "w", "x"],
                    ["2", "3", "6", "7", "k", "m", "q", "r"],
                    ["0", "1", "4", "5", "h", "j", "n", "p"]
                ]
                var eventable = [
                    ["p", "r", "x", "z"],
                    ["n", "q", "w", "y"],
                    ["j", "m", "t", "v"],
                    ["h", "k", "s", "u"],
                    ["5", "7", "e", "g"],
                    ["4", "6", "d", "f"],
                    ["1", "3", "9", "c"],
                    ["0", "2", "8", "b"]
                ]
                var dx = [-1, 0, 1];
                var dy = [-1, 0, 1];
                var isodd = true;
                if (code_length % 2 == 0) {
                    isodd = false
                } else {
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
                                } else {
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
                                } else {
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
                            } else {
                                c = cchar
                            }

                            char_tem = c + char_tem
                            index = index - 1;
                            if (isodd) {
                                isodd = false
                            } else {
                                isodd = true
                            }
                        }
                        result.push(char_tem)
                    }
                }
                return result
            } catch (e) {
                return e
            }
        }

    }
    /****
     *棋盘类
     *根据风场数据生产风场棋盘网格
     ****/
var CanvasWindField = function(obj) {
    this.west = null;
    this.east = null;
    this.south = null;
    this.north = null;
    this.unit = null;
    this.date = null;
    this.grid = null;
    this._init(obj);
};
CanvasWindField.prototype = {
    constructor: CanvasWindField,
    _init: function(obj) {
        var header = obj.header,
            uComponent = obj['uComponent'],
            vComponent = obj['vComponent'],
            filter_5 = obj['filter_5'],
            filter_6 = obj['filter_6'],
            filter_7 = obj['filter_7'],
            filter_8 = obj['filter_8'],
            gcode = obj['gcode'];
        this.west = +header['lo1'];
        this.east = +header['lo2'];
        this.south = +header['la2'];
        this.north = +header['la1'];
        this.unit = header['parameterUnit'];
        this.date = header['refTime'];
        this.Ghash = new Ghsah();
        this.idw = new IDWClass();
        this.gcode = gcode[0];
        this.filter_5 = filter_5[0];
        this.filter_6 = filter_6[0];
        this.filter_7 = filter_7[0];
        this.filter_8 = filter_8[0];
        this.grid = [];
        for (var k = 0; k < uComponent.length; k++) {
            var uv = this._calcUV(uComponent[k], vComponent[k]);
            this.grid.push(uv);
        }
        // console.log(this.grid)
    },
    _calcUV: function(u, v) {
        return [+u, +v, Math.sqrt(u * u + v * v)];
    },
    getIn: function(x, y) {
        if (x < this.west || x > this.east || y > this.north || y < this.south) {
            return [0, 0, 0];
        } else {
            try {
                var point_gcode = this.Ghash.encodeGeoHash(x, y);
                // point_gcode = "wxhcetmr5w";
                var result;
                var nearestpoints = [];
                try {
                    nearest = this.gcode[point_gcode.substring(0, 1)][point_gcode.substring(0, 2)][point_gcode.substring(0, 3)][point_gcode.substring(0, 4)][point_gcode.substring(0, 5)]
                    for (obj in nearest) {
                        for (_i = 0; _i < nearest[obj].length; _i++) {
                            nearestpoints.push(nearest[obj][_i])
                        }
                    }
                } catch (e) {
                    nearestpoints = [];
                }
                var flag = false;
                if (nearestpoints.length > 0) {
                    try {
                        n_5 = this.filter_5[point_gcode.substring(0, 1)][point_gcode.substring(0, 2)][point_gcode.substring(0, 3)][point_gcode.substring(0, 4)][point_gcode.substring(0, 5)]
                        if (n_5 == "in") {
                            flag = true;
                        } else {
                            n_6 = this.filter_6[point_gcode.substring(0, 1)][point_gcode.substring(0, 2)][point_gcode.substring(0, 3)][point_gcode.substring(0, 4)][point_gcode.substring(0, 5)][point_gcode.substring(0, 6)]
                            if (n_6 == "in") {
                                flag = true;
                            } else {
                                n_7 = this.filter_7[point_gcode.substring(0, 1)][point_gcode.substring(0, 2)][point_gcode.substring(0, 3)][point_gcode.substring(0, 4)][point_gcode.substring(0, 5)][point_gcode.substring(0, 6)][point_gcode.substring(0, 7)]
                                if (n_7 == "in") {
                                    flag = true;
                                } else {
                                    n_8 = this.filter_8[point_gcode.substring(0, 1)][point_gcode.substring(0, 2)][point_gcode.substring(0, 3)][point_gcode.substring(0, 4)][point_gcode.substring(0, 5)][point_gcode.substring(0, 6)][point_gcode.substring(0, 7)][point_gcode.substring(0, 8)]
                                    if (n_8 == "in") {
                                        flag = true;
                                    } else {
                                        flag = false;
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        try {
                            n_6 = this.filter_6[point_gcode.substring(0, 1)][point_gcode.substring(0, 2)][point_gcode.substring(0, 3)][point_gcode.substring(0, 4)][point_gcode.substring(0, 5)][point_gcode.substring(0, 6)]
                            if (n_6 == "in") {
                                flag = true;
                            }
                        } catch {
                            try {
                                n_7 = this.filter_7[point_gcode.substring(0, 1)][point_gcode.substring(0, 2)][point_gcode.substring(0, 3)][point_gcode.substring(0, 4)][point_gcode.substring(0, 5)][point_gcode.substring(0, 6)][point_gcode.substring(0, 7)]
                                if (n_7 == "in") {
                                    flag = true;
                                }
                            } catch {
                                try {
                                    n_8 = this.filter_8[point_gcode.substring(0, 1)][point_gcode.substring(0, 2)][point_gcode.substring(0, 3)][point_gcode.substring(0, 4)][point_gcode.substring(0, 5)][point_gcode.substring(0, 6)][point_gcode.substring(0, 7)][point_gcode.substring(0, 8)]
                                    if (n_8 == "in") {
                                        flag = true;
                                    }
                                } catch {
                                    flag = false;
                                }
                            }
                        }
                    }
                }
                // console.log(x,y)
                // console.log(nearestpoints)
                if (nearestpoints.length > 0 && flag == true) {
                    var points = []
                    for (_i = 0; _i < nearestpoints.length; _i++) {
                        var p = this.Ghash.decodeGeoHash(nearestpoints[_i][0]);
                        var w = this.grid[nearestpoints[_i][1]];
                        var point = { 'x': p.longitude[0], 'y': p.latitude[0], 'z': w[0] };
                        points.push(point);
                    }
                    // console.log(points)
                    var targetPoint = { 'x': x, 'y': y, 'z': null };
                    var u = this.idw.getZValueFunc(points, targetPoint);
                    // console.log(u)
                    for (_i = 0; _i < nearestpoints.length; _i++) {
                        var w = this.grid[nearestpoints[_i][1]];
                        points[_i].z = w[1];
                    }
                    // console.log(points)
                    targetPoint = { 'x': x, 'y': y, 'z': null };
                    var v = this.idw.getZValueFunc(points, targetPoint);
                    // console.log(v)
                    result = this._calcUV(u, v);
                    return result
                } else {
                    return [0, 0, 0];
                }

            } catch (e) {
                return [0, 0, 0];
            }

        }
    },
    getDistance: function(lat1, lng1, lat2, lng2) {
        var radLat1 = lat1 * Math.PI / 180.0;
        var radLat2 = lat2 * Math.PI / 180.0;
        var a = radLat1 - radLat2;
        var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
            Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
        s = s * 6378.137; // EARTH_RADIUS;
        s = Math.round(s * 10000) / 10000;
        return s;
    },
    isInBound: function(x, y) {
        if ((x >= 0 && x < this.cols - 1) && (y >= 0 && y < this.rows - 1)) return true;
        return false;
    }
};


/****
 *粒子对象
 ****/
var CanvasParticle = function() {
    this.lng = null; //粒子初始经度
    this.lat = null; //粒子初始纬度
    this.x = null; //粒子初始x位置(相对于棋盘网格，比如x方向有360个格，x取值就是0-360，这个是初始化时随机生成的)
    this.y = null; //粒子初始y位置(同上)
    this.tlng = null; //粒子下一步将要移动的经度，这个需要计算得来
    this.tlat = null; //粒子下一步将要移动的y纬度，这个需要计算得来
    this.age = null; //粒子生命周期计时器，每次-1
    this.speed = null; //粒子移动速度，可以根据速度渲染不同颜色
};

class Node {
    constructor(data) {
        this.root = this;
        this.data = data;
        this.left = null;
        this.right = null
    }
}


// IDE
function IDWClass() {
    var _beta = 2;
    var _points = new Object();
    var _targetPoint = new Object();
    this._getZValueFunc = function(pointsArray, targetPoint) {
        _points = pointsArray;
        _targetPoint = targetPoint;
        _getDistance();
        _getWeight();
        _getTargetZ();
        return _targetPoint.z;
    };
    _getDistance = function() {
        function getDistance(lat1, lng1, lat2, lng2) {
            var radLat1 = lat1 * Math.PI / 180.0;
            var radLat2 = lat2 * Math.PI / 180.0;
            var a = radLat1 - radLat2;
            var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
            s = s * 6378.137; // EARTH_RADIUS;
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
    _getFenmu = function() {
        var fenmu = 0;
        for (var i = 0; i < _points.length; i++) {
            fenmu += Math.pow((1 / _points[i].d), _beta);
        }
        return fenmu;
    };

    _getWeight = function() {

        var fenmu = _getFenmu();
        for (var i = 0; i < _points.length; i++) {
            if (!_points[i].w)
                _points[i].w = new Object();
            _points[i].w = Math.pow((1 / _points[i].d), _beta) / fenmu;
        }
    }

    _getTargetZ = function() {
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
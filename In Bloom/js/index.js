/* 2017-12-7 10:33:50 | 修改 木遥（QQ：516584683） */
$.ajaxSettings.async = false;
//loading bar
var loadingBar = document.getElementById('loadbar');
var oldTime = new Date().getTime();
// var oldTime = new Date("2013-07-02 00:00:00")
$('.form_date').datetimepicker({
    language: 'zh-CN',
    //format : 'yyyy-mm-dd hh:ii:ss',//日期格式
    //language:  'fr',
    weekStart: 1,
    todayBtn: 1,
    autoclose: 1,
    todayHighlight: 1,
    startView: 2,
    minView: 2,
    forceParse: 0

});

function run() {
    var curTime = new Date().getTime();
    // var curTime = new Date("2013-07-02 00:00:00")
    if (curTime - oldTime >= 3500) {
        loadingBar.className = "";
        if (curTime - oldTime >= 3550) {
            loadingBar.className = "ins";
            oldTime = curTime;
        }
    }
    if (Window.LOADING_FLAG == true) {
        clearInterval(loadIdx);
    }
}

function loaderOK() {
    $("#loadOverlay").hide();
    $('#loadbar').removeClass('ins');
    Window.LOADING_FLAG = true;
}
var loadIdx = setInterval(run, 100);


//地图
$(document).ready(function () {
    if (!mars3d.util.webglreport()) {
        toastr.error('系统检测到您当前使用的浏览器WebGL功能无效');
        layer.open({
            type: 1,
            title: "当前浏览器WebGL功能无效",
            skin: "layer-mars-dialog animation-scale-up",
            resize: false,
            area: ['600px', '200px'], //宽高
            content: '<div style="margin: 20px;"><h3>系统检测到您使用的浏览器WebGL功能无效！</h3>  <p>1、请您检查浏览器版本，安装使用最新版chrome、火狐或IE11以上浏览器！</p> <p>2、WebGL支持取决于GPU支持，请保证客户端电脑已安装最新显卡驱动程序！</p><p>3、如果上两步骤没有解决问题，说明您的电脑需要更换了！</p></div>'
        });
    }
    initUI();
    initMap();
});

function removeMask() {
    $("#mask").remove();
}

var viewer;
var poly0;
var poly1;
var poly2;
var poly3;
let linestrings = [];
var polyboundary = [];
var pointPrimitives = null; // 申明点渲染集合
var handler;
var windy;
var addentity = null;
var temptureLayer;
var contourflayer;
var timeModel;
var chlalayer;
var cutlayer;
var shplayer;
var windycanvas = null;
var pcolorcanvas = null;
var intA_flag = false;
var p1_cnt = 0;
var p2_cnt = 0;
var p3_cnt = 0;
var p4_cnt = 0;
var p5_cnt = 0;
//time-toorbar
var toolbar = document.getElementById('time-toolbar');
var starttime, endtime, timestep = 3600,
    onPlay = false,
    myVar;
var dir_getParticles;
var inHistory = false;
//geohash
var BITS = [16, 8, 4, 2, 1];
var BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
var refine_interval = function (interval, cd, mask) {
    if (cd & mask)
        interval[0] = (interval[0] + interval[1]) / 2;
    else
        interval[1] = (interval[0] + interval[1]) / 2;
}
var decodeGeoHash = function (geohash) {
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
    return {
        latitude: lat,
        longitude: lon
    };
}
var encodeGeoHash = function (longitude, latitude) {
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
var Ghsah = function () {
    this.BITS = null;
    this.BASE32 = null;
    this.NEIGHBORS = null;
    this.BORDERS = null;
    this._init();
}
Ghsah.prototype = {
    constructor: Ghsah,
    _init: function () {
        this.BITS = [16, 8, 4, 2, 1];
        this.BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
        this.NEIGHBORS = {
            right: {
                even: "bc01fg45238967deuvhjyznpkmstqrwx"
            },
            left: {
                even: "238967debc01fg45kmstqrwxuvhjyznp"
            },
            top: {
                even: "p0r21436x8zb9dcf5h7kjnmqesgutwvy"
            },
            bottom: {
                even: "14365h7k9dcfesgujnmqp0r2twvyx8zb"
            }
        };
        this.BORDERS = {
            right: {
                even: "bcfguvyz"
            },
            left: {
                even: "0145hjnp"
            },
            top: {
                even: "prxz"
            },
            bottom: {
                even: "028b"
            }
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
    refine_interval: function (interval, cd, mask) {
        if (cd & mask)
            interval[0] = (interval[0] + interval[1]) / 2;
        else
            interval[1] = (interval[0] + interval[1]) / 2;
    },
    calculateAdjacent: function (srcHash, dir) {
        srcHash = srcHash.toLowerCase();
        var lastChr = srcHash.charAt(srcHash.length - 1);
        var type = (srcHash.length % 2) ? 'odd' : 'even';
        var base = srcHash.substring(0, srcHash.length - 1);
        if (this.BORDERS[dir][type].indexOf(lastChr) != -1)
            base = calculateAdjacent(base, dir);
        return base + this.BASE32[this.NEIGHBORS[dir][type].indexOf(lastChr)];
    },
    decodeGeoHash: function (geohash) {
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

        return {
            latitude: lat,
            longitude: lon
        };
    },
    encodeGeoHash: function (longitude, latitude) {
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
}
Ghash = new Ghsah();
//初始化地图
function initMap() {
    var request = haoutil.system.getRequest();
    var configfile = "config/config.json";
    if (request.config)
        configfile = request.config;

    haoutil.loading.show();

    mars3d.createMap({
        id: 'cesiumContainer',
        url: configfile + "?time=20190418",
        //infoBox: false,     //是否显示点击要素之后显示的信息  【也可以在config.json中配置】  
        //sceneMode: Cesium.SceneMode.SCENE2D,
        layerToMap: layerToMap,
        success: function (_viewer, gisdata, jsondata) { //地图成功加载完成后执行 
            //欢迎UI关闭处理
            setTimeout(removeMask, 3000);
            loaderOK();
            haoutil.loading.hide();

            //记录viewer
            viewer = _viewer;

            //初始化widget管理器
            var hasAnimation = true;
            if (haoutil.isutil.isNotNull(request.widget)) {
                jsondata.widget.widgetsAtStart.push({
                    uri: request.widget,
                    request: request
                });
                hasAnimation = false;
            }
            mars3d.widget.init(_viewer, jsondata.widget);

            //如果有xyz传参，进行定位 
            if (haoutil.isutil.isNotNull(request.x) &&
                haoutil.isutil.isNotNull(request.y)) {
                viewer.mars.centerAt(request, {
                    duration: 0,
                    isWgs84: true
                });
            }

            if (hasAnimation) {
                viewer.mars.openFlyAnimation(); //开场动画
            }
            viewer.refresh_monitor = false;

            initWork(_viewer);

        }
    });


    $.ajax({
        type: "get",
        url: "data/boundary.json",
        dataType: "json",
        success: function (response) {
            var gcode = response.split(",")
            for (var _i = 0; _i < gcode.length; _i++) {
                code = gcode[_i];
                var extent = decodeGeoHash(code);
                polyboundary.push(turf.polygon([
                    [
                        [extent.longitude[1], extent.latitude[0]],
                        [extent.longitude[0], extent.latitude[0]],
                        [extent.longitude[0], extent.latitude[1]],
                        [extent.longitude[1], extent.latitude[1]],
                        [extent.longitude[1], extent.latitude[0]]
                    ]
                ]));
            }
        },
        error: function (errorMsg) {
            console.log("请求数据失败!");
        }
    });
    $.ajax({
        type: "get",
        url: "data/export.json",
        dataType: "json",
        success: function (response) {
            var coordinates = response["features"][0]["geometry"]["coordinates"];
            poly0 = turf.polygon([coordinates[0]]);
            poly1 = turf.polygon([coordinates[1]]);
            poly2 = turf.polygon([coordinates[2]]);
            poly3 = turf.polygon([coordinates[3]]);
        },
        error: function (errorMsg) {
            console.log("请求数据失败!");
        }
    });
    $.ajax({
        type: "get",
        url: "data/points_gcode.json",
        dataType: "json",
        success: function (response) {
            gcode = response[0]["g-code"];
        },
        error: function (errorMsg) {
            haoutil.msg("请求数据失败!");
        }
    });
    // $.ajax({
    //     type: "get",
    //     url: "data/boundary_line_84.json",
    //     dataType: "json",
    //     success: function(response) {
    //         var json = {
    //             "pid": 3030,
    //             "type": "geojson",
    //             "name": "研究范围",
    //             "url": "data/geojson/boundary_line_84.json",
    //             "symbol": {
    //                 "styleOptions": {
    //                     "lineType": "solid",
    //                     "color": "#b9bb0b",
    //                     "width": 2,
    //                     "opacity": 0.8
    //                 }
    //             },
    //             "visible": false,
    //             "flyTo": false
    //         };
    //         mars3d.layer.createLayer(json, viewer);
    //         bindToLayerControl(json);
    //     },
    //     error: function(errorMsg) {
    //         console.log("请求数据失败!");
    //     }
    // });
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    viewer.windy = false;
    viewer.arrow = false;
    viewer.pcolor = false;
    viewer.contourf = false;
    viewer.chla = false;
    viewer.cut = false;
    $("#play_btn").click(function () {
        var time_toolbar = document.getElementById("time-toolbar")
        if (time_toolbar.style.display == "none") {
            time_toolbar.style.display = "block"
        } else {
            time_toolbar.style.display = "none"
        }
    })
    $("#windy_btn").click(function () {
        if (viewer.windy == false) {
            var currentTime = new Date(timeModel["nowtimeparse"] * 1000)
            load_windy(currentTime)
            viewer.windy = true;
            $(this).css('background-color', '#7984868a')
        } else {
            viewer.windy = false;
            windy.stop()
            windy = null;
            $(this).css('background-color', 'rgba(255, 255, 0, 0.0)')
            document.getElementById("centerDiv").removeChild(windycanvas);
            windycanvas = null;
        }
    })
    $("#arrow_btn").click(function () {
        if (viewer.arrow == false) {
            var currentTime = new Date(timeModel["nowtimeparse"] * 1000)
            viewer.arrow = true;
            load_arrow(currentTime)
            $(this).css('background-color', '#7984868a')
        } else {
            viewer.arrow = false;
            handler.removeInputAction(Cesium.ScreenSpaceEventType.WHEEL);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOWN);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.RIGHT_DOWN);
            handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_UP);
            viewer.dataSources.remove(arrowdataSource);
            $(this).css('background-color', 'rgba(255, 255, 0, 0.0)')
        }
    })
    $("#pcolor_btn").click(function () {
        // console.log(viewer.pcolor)
        if (viewer.pcolor == false) {
            if (viewer.contourf == true) {
                viewer.contourf = false;
                if (contourflayer != null) {
                    viewer.imageryLayers.remove(contourflayer)
                    var colorbarContainer = document.getElementById("colorbarContainer");
                    colorbarContainer.style.display = "none"
                    $("#contourf_btn").css('background-color', 'rgba(255, 255, 0, 0.0)')
                }
            }
            viewer.pcolor = true;
            var currentTime = new Date(timeModel["nowtimeparse"] * 1000)
            load_pcolor(currentTime)
            $(this).css('background-color', '#7984868a')
        } else {
            viewer.pcolor = false;
            if (temptureLayer != null) {
                viewer.imageryLayers.remove(temptureLayer)
                var colorbarContainer = document.getElementById("colorbarContainer");
                colorbarContainer.style.display = "none";
                temptureLayer = null
                $(this).css('background-color', 'rgba(255, 255, 0, 0.0)')
                document.getElementById("centerDiv").removeChild(pcolorcanvas);
                pcolorcanvas = null;
            }
        }
    })
    $("#contourf_btn").click(function () {
        if (viewer.contourf == false) {
            if (viewer.pcolor == true) {
                viewer.pcolor = false;
                if (temptureLayer != null) {
                    viewer.imageryLayers.remove(temptureLayer)
                    var colorbarContainer = document.getElementById("colorbarContainer");
                    colorbarContainer.style.display = "none"
                    $("#pcolor_btn").css('background-color', 'rgba(255, 255, 0, 0.0)')
                }
            }
            viewer.contourf = true;
            var currentTime = new Date(timeModel["nowtimeparse"] * 1000)
            load_contourf(currentTime)
            $(this).css('background-color', '#7984868a')
        } else {
            viewer.contourf = false;
            if (contourflayer != null) {
                viewer.imageryLayers.remove(contourflayer)
                var colorbarContainer = document.getElementById("colorbarContainer");
                colorbarContainer.style.display = "none"
                $(this).css('background-color', 'rgba(255, 255, 0, 0.0)')
            }
        }
    })
    $("#chla_btn").click(function () {
        if (viewer.chla == false) {
            viewer.chla = true;
            var currentTime = new Date(timeModel["nowtimeparse"] * 1000)
            if (addentity) {
                viewer.entities.remove(addentity);
            }
            load_chlalayer(currentTime)
            $(this).css('background-color', '#7984868a')

            function update_chla_colorbar() {
                var min = 0;
                var max = 8.5;
                var legends = document.getElementById("colorbarContainer") //document.querySelector('colorbarContainer');
                legends.style.display = 'block';
                var legendCanvas = document.createElement('canvas');
                legendCanvas.width = 20; //rbar 256
                legendCanvas.height = 100; //10
                var min1 = document.getElementById('min') //document.querySelector('min');
                var max1 = document.getElementById('max') //document.querySelector('max');
                var gradientImg = document.getElementById('soundgradient');
                var legendCtx = legendCanvas.getContext('2d');
                var gradientCfg = {};
                min1.innerHTML = min.toFixed(2);
                max1.innerHTML = max.toFixed(2) + " ug/L";
                gradientCfg = {
                    1:"#0000FF",
                    0.9: "#005FFF", // "#3E26A8","#FF0C00"
                    0.8: "#00BFFF", //#484DF0","#FF6100"
                    0.7: "#00FFD7", //#327CFC","#FFA100"
                    0.6: "#00FF6F", //#21A2E4","#FFEE00"
                    0.5: "#00FF0F", //#19BFB6","#83FF00"
                    0.4: "#57FF00", //#5ECC73","#00FF61"
                    0.3: "#BFFF00", //#D1BE26","#00FFED"
                    0.2: "#FFD700", //#FCCF30", "#00D0FF"
                    0.1:"#FF7700",
                    0: "#FF0000" //#F9FB15","#0065FF"
                };
                var gradient = legendCtx.createLinearGradient(0, 0, 1, 100);
                for (var key in gradientCfg) {
                    gradient.addColorStop(key, gradientCfg[key]);
                }
                legendCtx.fillStyle = gradient;
                legendCtx.fillRect(0, 0, 20, 100);
                gradientImg.src = legendCanvas.toDataURL();
            }
            update_chla_colorbar()
        } else {
            if (addentity) {
                viewer.entities.remove(addentity);
            }
            if (chlalayer != null) {
                viewer.chla = false;
                viewer.imageryLayers.remove(chlalayer)
                $(this).css('background-color', 'rgba(255, 255, 0, 0.0)');
                handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
                var colorbarContainer = document.getElementById("colorbarContainer");
                colorbarContainer.style.display = "none";
            }
        }
    })
    $("#cut_btn").click(function () {
        if (viewer.cut == false) {
            viewer.cut = true;
            var currentTime = new Date(timeModel["nowtimeparse"] * 1000)
            load_cutlayer(currentTime);
            $(this).css('background-color', '#7984868a')
        } else {
            if (cutlayer != null) {
                viewer.cut = false;
                if (shplayer != null) {
                    viewer.imageryLayers.remove(shplayer)
                }
                viewer.imageryLayers.remove(cutlayer)
                $(this).css('background-color', 'rgba(255, 255, 0, 0.0)')
            }
        }
    })

    $("#stt_btn").click(function () {
        var uri = "widgetsTS/addmarker/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "autoDisable": false,
                "disableOther": false
            });
        }
    })
    $("#initLct_btn").click(function () {
        if (!intA_flag) {
            try {
                var url = baseUrlConfig['serverport'] + "getInitArea";
                var dir = dir_getParticles.split("_");
                let coordinates = [];
                var data;
                $.post(url, {
                    'username': dir[0],
                    'time': dir[1]
                }, function (response) {
                    data = response[0]["initialArea"]
                })
                let initialArea = JSON.parse(data);
                let initialAreas = initialArea["features"];
                let areaNum = initialAreas.length;
                for (var i = 0; i < areaNum; i++) {
                    var pointsdatai = [];
                    coordinates[i] = initialAreas[i]["geometry"]["coordinates"][0];
                    polygon = turf.polygon([coordinates[i]]);
                    var intersection = turf.intersect(polygon, poly0);
                    for (var j = 0; j < intersection["geometry"]["coordinates"][0].length; j++) {
                        pointsdatai.push(intersection["geometry"]["coordinates"][0][j][0]);
                        pointsdatai.push(intersection["geometry"]["coordinates"][0][j][1]);
                    }
                    viewer.entities.add({
                        polygon: {
                            hierarchy: Cesium.Cartesian3.fromDegreesArray(pointsdatai),
                            material: Cesium.Color.YELLOW.withAlpha(0.2)
                        },
                    });
                }
                intA_flag = true;
            } catch (e) {
                console.log(e)
            }
        } else {
            viewer.entities.removeAll();
            intA_flag = false;
        }

    })
    $("#HABParticles_btn").click(function () {
        if (pointPrimitives) {
            viewer.scene.primitives.remove(pointPrimitives);
            pointPrimitives = null;
        } else {
            drawParticles();
        }
    })

    $("#insitu_btn").click(function () {
        var uri = "widgetsTS/insitu/widget.js";
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "autoDisable": false,
                "disableOther": false
            });
        }
    })
    $("#biomass_btn").click(function () {
        var uri = "widgetsTS/showView/widget.js";
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "autoDisable": false,
                "disableOther": false
            });
        }
    })
    $("#densityMon_btn").click(function () {
        var uri = "widgetsTS/densityMonitor/widget.js";
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "autoDisable": false,
                "disableOther": false
            });
        }
    })
    $("#alert_btn").click(function () {
        var uri = "widgetsTS/alert/widget.js";
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri
            });
        }
    })


    $("#newtask_btn").click(function () {
        var uri = "widgetsTS/drawInitialArea/widget.js";
        var currentTime = timeModel["nowtimeparse"];
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                data: currentTime,
                windowOptions: {
                    width: 250,
                    height: 500,
                    position: {
                        "top": 0,
                        "left": 160
                    }
                }
            });
        }
    })
    $("#oldtask_btn").click(function () {
        var uri = "widgetsTS/historyReview/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "windowOptions": {
                    "height": 500,
                    "width": 900,
                    "position": {
                        "top": 0,
                        "left": 135
                    },
                },
                "autoDisable": true,
                "disableOther": true
            });
        }
    })
    $("#track_btn").click(function () {
        var uri = "widgetsTS/track/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOther": false
            });
        }
    })
    $("#envelop_btn").click(function () {
        var uri = "widgetsTS/envelop/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOther": false
            });
        }
    })
    $("#heatmap_btn").click(function () {
        var uri = "widgetsTS/kde/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOther": false
            });
        }
    })
    $("#manageBasemaps_btn").click(function () {
        var uri = "widgets/manageBasemaps/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOther": false
            });
        }
    })
    $("#plot_btn").click(function () {
        var uri = "widgets/plot/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOther": false
            });
        }
    })
    $("#measure_btn").click(function () {
        var uri = "widgets/measure/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOther": false
            });
        }
    })
    $("#centerXY_btn").click(function () {
        var uri = "widgets/centerXY/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOther": false
            });
        }
    })
    $("#manageLayers_btn").click(function () {
        var uri = "widgets/manageLayers/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOhter": false
            });
        }
    })
    $("#section_btn").click(function () {
        var uri = "widgets/section/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOhter": false
            });
        }
    })
    $("#bookmark_btn").click(function () {
        var uri = "widgets/bookmark/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOhter": false
            });
        }
    })
    $("#addmarker_btn").click(function () {
        var uri = "widgets/addmarker/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOhter": false
            });
        }
    })
    $("#navXZQH_btn").click(function () {
        var uri = "widgets/navXZQH/widget.js"
        if (mars3d.widget.isActivate(uri)) {
            mars3d.widget.disable(uri);
        } else {
            mars3d.widget.activate({
                uri: uri,
                "disableOhter": false
            });
        }
    })
}


//UI界面相关
function initUI() {
    haoutil.oneMsg('首次访问系统无缓存会略慢，请耐心等待！', 'load3d_tip');
}


//当前页面业务相关
function initWork(viewer) {
    haoutil.oneMsg('如果未出现地球，是因为地形加载失败，请刷新重新加载！', 'terrain_tip');

    // 禁用默认的实体双击动作。
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
    viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);

    //webgl渲染失败后，刷新页面
    //viewer.scene.renderError.addEventListener(function (scene, error) {
    //    window.location.reload();
    //});


    //移动设备上禁掉以下几个选项，可以相对更加流畅
    if (!haoutil.system.isPCBroswer()) {
        viewer.targetFrameRate = 20; //限制帧率
        viewer.requestRenderMode = true; //取消实时渲染
        viewer.scene.fog.enable = false;
        viewer.scene.skyAtmosphere.show = false;
        viewer.scene.fxaa = false;
    }

    //IE浏览器优化
    if (window.navigator.userAgent.toLowerCase().indexOf("msie") >= 0) {
        viewer.targetFrameRate = 20; //限制帧率
        viewer.requestRenderMode = true; //取消实时渲染
    }

    //更改配置，性能优化
    viewer.scene.logarithmicDepthBuffer = false;

    //二三维切换不用动画
    if (viewer.sceneModePicker)
        viewer.sceneModePicker.viewModel.duration = 0.0;

    //3dtiles模型的单体化高亮，在ex/featureViewer.js处理
    featureViewer.install(viewer);
    let timenow = Date.now();
    // let timenow = new Date("2013-07-02 14:00:00")
    timenow = Math.floor(timenow / 1000)
    starttime = timenow;
    endtime = timenow + 3600 * 72;
    timeModel = {
        nowtime: getTime1(timenow),
        nowtimeparse: timenow,
        clickstatus: false
    };
    Cesium.knockout.track(timeModel);
    Cesium.knockout.applyBindings(timeModel, toolbar);
    toolbar.style.display = "block";



    function timeParameter(name) {
        Cesium.knockout.getObservable(timeModel, name).subscribe(
            function (newValue) {
                timeModel[name] = newValue;
                var date = getTime(newValue)
                timeModel.nowtime = date;
                if (inHistory) {
                    drawParticles()
                    // document.getElementById("timeinput").value = timeModel.nowtime;
                }
                if (viewer.windy) {
                    windy.stop()
                    var currentTime = new Date(timeModel.nowtime)
                    load_windy(currentTime)
                }
                if (viewer.arrow) {
                    viewer.dataSources.remove(arrowdataSource);
                    var currentTime = new Date(timeModel.nowtime)
                    load_arrow(currentTime)
                }
                if (viewer.pcolor) {
                    viewer.imageryLayers.remove(temptureLayer)
                    var colorbarContainer = document.getElementById("colorbarContainer");
                    colorbarContainer.style.display = "none";
                    temptureLayer = null;
                    var currentTime = new Date(timeModel["nowtimeparse"] * 1000)
                    load_pcolor(currentTime)
                }
                if (viewer.contourf) {
                    viewer.imageryLayers.remove(contourflayer)
                    var colorbarContainer = document.getElementById("colorbarContainer");
                    colorbarContainer.style.display = "none";
                    var currentTime = new Date(timeModel["nowtimeparse"] * 1000)
                    load_contourf(currentTime)
                }
                if (viewer.chla) {
                    viewer.imageryLayers.remove(chlalayer);
                    var currentTime = new Date(timeModel["nowtimeparse"] * 1000);
                    if (addentity) {
                        viewer.entities.remove(addentity);
                    }
                    load_chlalayer(currentTime);
                }
                if (viewer.cut) {
                    viewer.imageryLayers.remove(cutlayer);
                    if (shplayer != null) {
                        viewer.imageryLayers.remove(shplayer);
                    }
                    var currentTime = new Date(timeModel["nowtimeparse"] * 1000);
                    load_cutlayer(currentTime);
                }
            }
        );
    }
    timeParameter("nowtimeparse")

    $("#timetext").on("change", function () {
        console.log(timeModel["nowtimeparse"])
        var timenow = new Date(document.getElementById("timetext").value)
        timenow.setMinutes(0)
        timenow.setSeconds(0)
        timenow = parseInt(Number(timenow) / 100000) * 100
        timeModel["nowtimeparse"] = timenow
        starttime = timenow - 3600 * 12;
        endtime = timenow + 3600 * 12;
        instance.update({
            min: starttime,
            max: endtime,
            step: timestep,
            from: timeModel["nowtimeparse"]
        });
    })
    $(".js-range-slider-sharp").ionRangeSlider({
        skin: "sharp",
        type: "single",
        min: starttime,
        max: endtime,
        prettify: getTime,
        step: 3600,
        grid: true,
        // grid_snap: true,
    });
    instance = $(".js-range-slider-sharp").data("ionRangeSlider");
    $("#next").click(function () {
        timeModel["nowtimeparse"] = parseFloat(timeModel["nowtimeparse"]) + timestep;
        var val = timeModel["nowtimeparse"];
        // validate
        if (val < starttime) {
            val = starttime;
        } else if (val > endtime) {
            val = endtime;
        }
        instance.update({
            from: val
        });
    })
    $("#pre").click(function () {
        timeModel["nowtimeparse"] = parseFloat(timeModel["nowtimeparse"]) - timestep;
        var val = timeModel["nowtimeparse"];
        // validate
        if (val < starttime) {
            val = starttime;
        } else if (val > endtime) {
            val = endtime;
        }
        instance.update({
            from: val
        });
    })
    $("#gopre").click(function () {
        timeModel["nowtimeparse"] = starttime;
        var val = timeModel["nowtimeparse"];
        instance.update({
            from: val
        });
    })
    $("#gonext").click(function () {
        timeModel["nowtimeparse"] = endtime;
        var val = timeModel["nowtimeparse"];
        instance.update({
            from: val
        });
    })
    $("#play").click(function () {
        if (onPlay == false) {
            play_btn = document.getElementById('play');
            play_btn.innerHTML = " 暂停";
            play_btn.setAttribute('class', "fa fa-pause-circle-o");
            onPlay = true;
            myVar = setInterval(function () {
                timeModel["nowtimeparse"] = parseFloat(timeModel["nowtimeparse"]) + timestep;
                var val = timeModel["nowtimeparse"];
                // validate
                if (val < starttime) {
                    val = starttime;
                } else if (val > endtime) {
                    val = starttime;
                    timeModel["nowtimeparse"] = starttime;
                }
                instance.update({
                    from: val
                });
            }, 1000);
        } else {
            onPlay = false;
            play_btn = document.getElementById('play');
            play_btn.innerHTML = " 播放";
            play_btn.setAttribute('class', "fa fa-play-circle-o");
            clearInterval(myVar);
        }
    })
}

//config中非底层类库封装类，可以在此加入进行实例化
function layerToMap(item, viewer, layer) {
    switch (item.type) {
        //case "s3m"://超图S3M数据加载 
        //    return new S3MLayer(item, viewer);
        //    break;
    }
}


//绑定图层管理
function bindToLayerControl(options) {
    if (options._layer == null) {
        var _visible = options.visible;
        delete options.visible;

        var layer = new mars3d.layer.BaseLayer(options, viewer);
        layer._visible = _visible;
        options._layer = layer;
    }

    var manageLayersWidget = mars3d.widget.getClass('widgets/manageLayers/widget.js');
    if (manageLayersWidget) {
        manageLayersWidget.addOverlay(options);
    } else {
        viewer.gisdata.config.operationallayers.push(options);
    }
    return options._layer;
}
//取消绑定图层管理
function unbindLayerControl(name) {
    var manageLayersWidget = mars3d.widget.getClass('widgets/manageLayers/widget.js');
    if (manageLayersWidget) {
        manageLayersWidget.removeLayer(name);
    } else {
        var operationallayersCfg = viewer.gisdata.config.operationallayers;
        for (var i = 0; i < operationallayersCfg.length; i++) {
            var item = operationallayersCfg[i];
            if (item.name == name) {
                operationallayersCfg.splice(i, 1);
                break;
            }
        }
    }
}

//外部页面调用
function activateWidget(item) {
    mars3d.widget.activate(item);
}

function disableWidget(item) {
    mars3d.widget.disable(item);
}

function activateFunByMenu(fun) {
    eval(fun);
}

function drawParticles() {
    viewer.entities.removeAll();
    if (pointPrimitives) {
        viewer.scene.primitives.remove(pointPrimitives); // 移除已经存在的点元素
    }
    p1_cnt = 0;
    p2_cnt = 0;
    p3_cnt = 0;
    p4_cnt = 0;
    p5_cnt = 0;
    $.post(baseUrlConfig['serverport'] + "fsReadFile", {
        'time': (Date.parse(timeModel.nowtime) / 1000),
        'label': 'x',
        'dir': dir_getParticles
    }, function (response) {
        if (pointPrimitives) {
            viewer.scene.primitives.remove(pointPrimitives); // 移除已经存在的点元素
        }
        if (response != "null") {
            var x = response.split(';');
            var y = null;
            $.post(baseUrlConfig['serverport'] + "fsReadFile", {
                'time': (Date.parse(timeModel.nowtime) / 1000),
                'label': 'y',
                'dir': dir_getParticles
            }, function (response1) {
                y = response1.split(';');
            })
            pointsCollection = [];
            pointsCollection_env = [];
            pointsCollectionAll = [];
            pointPrimitives = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
            var outlineColor = Cesium.Color.TRANSPARENT;
            for (var i = 0; i < x.length; i++) {
                if (x[i] == "") {} else {
                    var x_point = x[i].split(',');
                    var y_point = y[i].split(',');
                    var point = turf.point([x_point[0], y_point[0]]);
                    var position = Cesium.Cartesian3.fromDegrees(x_point[0], y_point[0], 0);
                    pointsCollectionAll.push(point);
                    if (x_point[1] == 0) {
                        pointsCollection.push(point);
                        pointsCollection_env.push(point);
                        p1_cnt = p1_cnt + 1;
                        // var primitive = pointPrimitives.add({
                        //     pixelSize: 2,
                        //     color: Cesium.Color.LIGHTSKYBLUE,
                        //     outlineColor: Cesium.Color.RED,
                        //     outlineWidth: 0.0000001,
                        //     position: position
                        // });
                        // var primitive = pointPrimitives.add({
                        //     pixelSize: 4,
                        //     color: Cesium.Color.CHOCOLATE,
                        //     outlineColor:outlineColor,
                        //     outlineWidth: 0,
                        //     position: position
                        // });
                        var primitive = pointPrimitives.add({
                            pixelSize: 5,
                            color: Cesium.Color.LIGHTSKYBLUE,
                            outlineColor: Cesium.Color.GREEN,
                            outlineWidth: 0.0000001,
                            position: position
                        });
                    } else if (x_point[1] == 1) {
                        // var primitive = pointPrimitives.add({
                        //     pixelSize: 5,
                        //     color: Cesium.Color.YELLOW,
                        //     outlineColor: outlineColor,
                        //     outlineWidth: 0,
                        //     position: position
                        // });
                    } else if (x_point[1] == 2) {
                        pointsCollection.push(point);
                        p2_cnt = p2_cnt + 1;
                        var primitive = pointPrimitives.add({
                            pixelSize: 10,
                            // color: Cesium.Color.AQUAMARINE,
                            color: Cesium.Color.LIGHTSEAGREEN,
                            outlineColor: outlineColor,
                            outlineWidth: 0,
                            position: position
                        });
                    } else if (x_point[1] == 3) {
                        p3_cnt = p3_cnt + 1;
                        pointsCollection.push(point);
                        pointsCollection_env.push(point);
                        var primitive = pointPrimitives.add({
                            pixelSize: 5,
                            color: new Cesium.Color(0.37647, 1, 0.26667),
                            outlineColor: outlineColor,
                            outlineWidth: 0,
                            position: position
                        });
                    } else if (x_point[1] == 4) {
                        p4_cnt = p4_cnt + 1;
                        var primitive = pointPrimitives.add({
                            pixelSize: 5,
                            color: Cesium.Color.WHITE.withAlpha(0.3),
                            outlineColor: outlineColor,
                            outlineWidth: 0,
                            position: position
                        });
                    }
                    primitive.tooltip = 'id：' + i;
                }
            }
            console.log(x.length)
        }
    }).error(function () {
        haoutil.msg('超出计算范围');
    });
    $("#p1_cnt").text(p1_cnt);
    $("#p2_cnt").text(p2_cnt);
    $("#p3_cnt").text(p3_cnt);
    $("#p4_cnt").text(p4_cnt);
    $("#p5_cnt").text(p5_cnt);
}

function getTime(value) {
    var date = new Date(value * 1000);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var min = date.getMinutes();
    min = min < 10 ? ('0' + min) : min;
    return y + '-' + m + '-' + d + 'T' + h + ':' + min;
}

function getTime1(value) {
    var date = new Date(value * 1000);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var min = date.getMinutes();
    min = '00';
    return y + '-' + m + '-' + d + 'T' + h + ':' + min;
}

function load_windy(currentTime) {
    currentTime.setMinutes(0)
    currentTime.setSeconds(0)
    currentTime = parseInt(Number(currentTime) / 100000) * 100
    var drawdata;
    var params;
    var globalExtent;
    var resizeCanvas = function () {
        if (windycanvas == null) {
            return;
        }
        windycanvas.width = window.innerWidth;
        windycanvas.height = window.innerHeight;
        if (windy) {
            windy._resize(windycanvas.width, windycanvas.height);
        }
    };

    var getCesiumExtent = function () {
        var canvaswidth = window.innerWidth,
            canvasheight = window.innerHeight - 50;
        var left_top_pt = new Cesium.Cartesian2(0, 0);
        var left_bottom_pt = new Cesium.Cartesian2(0, canvasheight);
        var right_top_pt = new Cesium.Cartesian2(canvaswidth, 0);
        var right_bottom_pt = new Cesium.Cartesian2(canvaswidth, canvasheight);
        var pick1 = viewer.scene.globe.pick(viewer.camera.getPickRay(left_top_pt), viewer.scene);
        var pick2 = viewer.scene.globe.pick(viewer.camera.getPickRay(left_bottom_pt), viewer.scene);
        var pick3 = viewer.scene.globe.pick(viewer.camera.getPickRay(right_top_pt), viewer.scene);
        var pick4 = viewer.scene.globe.pick(viewer.camera.getPickRay(right_bottom_pt), viewer.scene);
        if (pick1 && pick2 && pick3 && pick4) {
            //将三维坐标转成地理坐标---只需计算左下右上的坐标即可
            var geoPt1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(pick2);
            var geoPt2 = viewer.scene.globe.ellipsoid.cartesianToCartographic(pick3);
            //地理坐标转换为经纬度坐标
            var point1 = [geoPt1.longitude / Math.PI * 180, geoPt1.latitude / Math.PI * 180];
            var point2 = [geoPt2.longitude / Math.PI * 180, geoPt2.latitude / Math.PI * 180];
            // console.log(point1,point2);
            //此时说明extent需要分为东西半球
            if (point1[0] > point2[0]) {
                globalExtent = [point1[0], 180, point1[1], point2[1], -180, point2[0], point1[1], point2[1]];
            } else {
                globalExtent = [point1[0], point2[0], point1[1], point2[1]];
            }
        } else {
            globalExtent = [];
        }
    };
    $.ajax({
        type: "get",
        url: "../../data/points_gcode.json",
        dataType: "json",
        success: function (points_gcode) {
            var windydata;
            $.post(baseUrlConfig['serverport'] + "fsReadCurrent", {
                'time': currentTime
            }, function (response) {
                windydata = response

                function loadwindy() {
                    windycanvas = document.createElement('canvas');
                    windycanvas.setAttribute("id", "windycanvas");
                    // windycanvas = document.getElementById('windycanvas')
                    windycanvas.style.position = 'fixed'
                    windycanvas.style["pointer-events"] = "none";
                    windycanvas.style["z-index"] = 10;
                    windycanvas.style["top"] = 0;
                    response = JSON.parse(windydata);
                    response[0]["g-code"] = points_gcode[0]["g-code"]
                    response[0]["filter-5"] = points_gcode[0]["filter-5"]
                    response[0]["filter-6"] = points_gcode[0]["filter-6"]
                    response[0]["filter-7"] = points_gcode[0]["filter-7"]
                    response[0]["filter-8"] = points_gcode[0]["filter-8"]
                    resizeCanvas();
                    window.onresize = resizeCanvas;
                    //风场的参数配置，除了canvas/viewer是必传项，其他可以不传，参数含义见windy.js
                    params = {
                        viewer: viewer,
                        canvas: windycanvas,
                        canvasWidth: window.innerWidth,
                        canvasHeight: window.innerHeight,
                        speedRate: 25,
                        particlesNumber: 2000,
                        maxAge: 20,
                        frameRate: 10,
                        color: '#ffffff',
                        extent: globalExtent,
                        lineWidth: 1,
                    };
                    drawdata = response
                    windy = new CanvasWindy(response, params);
                    document.getElementById('centerDiv').appendChild(windycanvas);
                }

                function windyload() {
                    let postRender = viewer.scene.postRender.addEventListener(() => {
                        getCesiumExtent();
                    });
                    var mouse_down = false;
                    var mouse_move = false;
                    //鼠标滚动、旋转后是否需要重新生成风场---如果需要，打开以下注释--旋转或者移动到北半球的时候计算会有问题
                    handler.setInputAction(function (e) {
                        getCesiumExtent()
                        windy.extent = globalExtent;
                        windy.stop();
                        document.getElementById("centerDiv").removeChild(windycanvas);
                        loadwindy();
                    }, Cesium.ScreenSpaceEventType.WHEEL);
                    // 鼠标左键、右键按下
                    handler.setInputAction(function (e) {
                        mouse_down = true;
                    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
                    handler.setInputAction(function (e) {
                        mouse_down = true;
                    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
                    handler.setInputAction(function (e) {
                        if (mouse_down || mouse_move) {
                            getCesiumExtent()
                            windy.extent = globalExtent;
                            windy.stop();
                            document.getElementById("centerDiv").removeChild(windycanvas);
                            // windy.redraw();
                            loadwindy();
                        }
                        mouse_down = false;
                        mouse_move = false;
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);
                }
                loadwindy();
                windyload();
            }).error(function () {
                haoutil.msg('请求数据失败');
            });
        },
        error: function (errorMsg) {
            haoutil.msg("请求网格失败!");
        }
    })
}

function load_arrow(currentTime) {
    currentTime.setMinutes(0)
    currentTime.setSeconds(0)
    currentTime = parseInt(Number(currentTime) / 100000) * 100
    handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    $.ajax({
        type: "get",
        url: "../../data/points_gcode.json",
        dataType: "json",
        success: function (points_gcode) {
            function getextent() {
                var g_extent = [];
                var canvaswidth = window.innerWidth;
                var canvasheight = window.innerHeight - 50;
                var left_top_pt = new Cesium.Cartesian2(0, 0);
                var left_bottom_pt = new Cesium.Cartesian2(0, canvasheight);
                var right_top_pt = new Cesium.Cartesian2(canvaswidth, 0);
                var right_bottom_pt = new Cesium.Cartesian2(canvaswidth, canvasheight);
                var pick1 = viewer.scene.globe.pick(viewer.camera.getPickRay(left_top_pt), viewer.scene);
                var pick2 = viewer.scene.globe.pick(viewer.camera.getPickRay(left_bottom_pt), viewer.scene);
                var pick3 = viewer.scene.globe.pick(viewer.camera.getPickRay(right_top_pt), viewer.scene);
                var pick4 = viewer.scene.globe.pick(viewer.camera.getPickRay(right_bottom_pt), viewer.scene);
                if (pick1 && pick2 && pick3 && pick4) {
                    var geoPt1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(pick1);
                    var geoPt2 = viewer.scene.globe.ellipsoid.cartesianToCartographic(pick2);
                    var geoPt3 = viewer.scene.globe.ellipsoid.cartesianToCartographic(pick3);
                    var geoPt4 = viewer.scene.globe.ellipsoid.cartesianToCartographic(pick4);
                    //地理坐标转换为经纬度坐标
                    var point1 = [geoPt1.longitude / Math.PI * 180, geoPt1.latitude / Math.PI * 180];
                    var point2 = [geoPt2.longitude / Math.PI * 180, geoPt2.latitude / Math.PI * 180];
                    var point3 = [geoPt3.longitude / Math.PI * 180, geoPt3.latitude / Math.PI * 180];
                    var point4 = [geoPt4.longitude / Math.PI * 180, geoPt4.latitude / Math.PI * 180];
                    g_extent = [Math.min(point1[0], point2[0], point3[0], point4[0]), Math.min(point1[1], point2[1], point3[1], point4[1]), Math.max(point1[0], point2[0], point3[0], point4[0]), Math.max(point1[1], point2[1], point3[1], point4[1])]
                }
                return g_extent
            }
            $.post(baseUrlConfig['serverport'] + "fsReadCurrent", {
                'time': currentTime
            }, function (response) {
                response = JSON.parse(response);

                function loadarrow() {
                    response[0]["lon-data"] = points_gcode[0]["lon-data"]
                    response[0]["lat-data"] = points_gcode[0]["lat-data"]
                    response[0]["g-code"] = points_gcode[0]["g-code"]
                    g_extent = getextent()
                    my_extent = [119.1135, 39.0025, 120.3829, 40.0546]
                    var xmin, ymin, xmax, ymax;
                    if (g_extent.length == 0) {
                        xmin = my_extent[0];
                        ymin = my_extent[1];
                        xmax = my_extent[2];
                        ymax = my_extent[3];
                    } else {
                        if (g_extent[0] <= my_extent[0] && g_extent[1] <= my_extent[1] && g_extent[2] >= my_extent[2] && g_extent[3] >= my_extent[3]) {
                            xmin = my_extent[0];
                            ymin = my_extent[1];
                            xmax = my_extent[2];
                            ymax = my_extent[3];
                        } else {
                            xmin = g_extent[0];
                            ymin = g_extent[1];
                            xmax = g_extent[2];
                            ymax = g_extent[3];
                        }
                    }
                    arrowdataSource = new Cesium.CustomDataSource('myData');
                    var n = 1000;
                    var draw_points_index = [];
                    draw_gcode = [];
                    var dx = (xmax - xmin) / 100;
                    var dy = (ymax - ymin) / 100;
                    for (var i = 0; i < 100; i++) {
                        for (var j = 0; j < 100; j++) {
                            var px = xmin + i * dx;
                            var py = ymin + j * dy;
                            var p_gcode = Ghash.encodeGeoHash(px, py)
                            draw_gcode.push(p_gcode.substring(0, 5))
                        }
                    }
                    draw_gcode = draw_gcode.sort()
                    var draw_gcode_unique = [];
                    draw_gcode_unique.push(draw_gcode[0])
                    for (var i = 1; i < 10000; i++) {
                        if (draw_gcode[i] != draw_gcode[i - 1]) {
                            draw_gcode_unique.push(draw_gcode[i])
                        }
                    }
                    var each_num = Math.floor(n / draw_gcode_unique.length)
                    each_num = 2 * each_num + 1;
                    // console.log(each_num)
                    for (var i = 0; i < draw_gcode_unique.length; i++) {
                        try {
                            var tt = response[0]["g-code"][0][draw_gcode_unique[i].substring(0, 1)][draw_gcode_unique[i].substring(0, 2)][draw_gcode_unique[i].substring(0, 3)][draw_gcode_unique[i].substring(0, 4)][draw_gcode_unique[i].substring(0, 5)]
                            var t = []
                            for (var item in tt) {
                                t.push(item)
                            }
                            for (var j = 0; j < each_num; j++) {
                                draw_points_index.push(tt[t[j]][0][1])
                            }
                            draw_points_index.push(tt[t[Math.ceil(t.length / 2)]][0][1])
                            draw_points_index.push(tt[t[t.length - 1]][0][1])
                        } catch {}
                    }
                    var w = [];
                    var x = [];
                    var y = [];
                    for (var j = 0; j < draw_points_index.length; j++) {
                        i = draw_points_index[j]
                        var w_value = Math.sqrt(response[0]["u-data"][i] * response[0]["u-data"][i] + response[0]["v-data"][i] * response[0]["v-data"][i])
                        w.push(w_value); // 权重值
                        x.push(response[0]["lon-data"][i]); // x
                        y.push(response[0]["lat-data"][i]); // y
                        var position = Cesium.Cartesian3.fromDegrees(
                            response[0]["lon-data"][i],
                            response[0]["lat-data"][i],
                            0
                        );
                        var entitie = arrowdataSource.entities.add({
                            name: "name",
                            position: Cesium.Cartesian3.fromDegrees(response[0]["lon-data"][i], response[0]["lat-data"][i]),
                            polyline: {
                                positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                                    response[0]["lon-data"][i],
                                    response[0]["lat-data"][i],
                                    0,
                                    response[0]["lon-data"][i] + response[0]["u-data"][i] * 0.05,
                                    response[0]["lat-data"][i] + response[0]["v-data"][i] * 0.05,
                                    0,
                                ]),
                                width: 4,
                                show: true,
                                fill: true,
                                clampToGround: true,
                                material: new Cesium.PolylineArrowMaterialProperty(
                                    Cesium.Color.RED.withAlpha(0.85),
                                ),
                            },
                        });

                        entitie.tooltip = '经度:&nbsp;&nbsp;&nbsp;&nbsp;' + response[0]["lon-data"][i] + "°<br>" + '纬度:&nbsp;&nbsp;&nbsp;&nbsp;' + response[0]["lat-data"][i] + "°<br>" + '流速u:&nbsp;&nbsp;&nbsp;' + response[0]["u-data"][i] + "&nbsp;m/s<br>" + '流速v:&nbsp;&nbsp;&nbsp;' + response[0]["v-data"][i] + "&nbsp;m/s<br>" + '流速uv:&nbsp;&nbsp;' + w_value.toFixed(5) + '&nbsp;m/s';
                    }

                }

                function arrowload() {
                    viewer.dataSources.add(arrowdataSource);
                    let postRender = viewer.scene.postRender.addEventListener(() => {
                        getextent();
                    });
                    var mouse_down = false;
                    var mouse_move = false;
                    //鼠标滚动、旋转后是否需要重新生成风场---如果需要，打开以下注释--旋转或者移动到北半球的时候计算会有问题
                    handler.setInputAction(function (e) {
                        viewer.dataSources.remove(arrowdataSource);
                        loadarrow()
                        viewer.dataSources.add(arrowdataSource);
                    }, Cesium.ScreenSpaceEventType.WHEEL);
                    // 鼠标左键、右键按下
                    handler.setInputAction(function (e) {
                        mouse_down = true;
                    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
                    handler.setInputAction(function (e) {
                        mouse_down = true;
                    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);
                    handler.setInputAction(function (e) {
                        if (mouse_down || mouse_move) {
                            viewer.dataSources.remove(arrowdataSource);
                            loadarrow()
                            viewer.dataSources.add(arrowdataSource);
                        }
                        mouse_down = false;
                        mouse_move = false;
                    }, Cesium.ScreenSpaceEventType.LEFT_UP);
                }
                loadarrow();
                arrowload()
            }).error(function () {
                haoutil.msg('请求数据失败');
            });
        },
        error: function (errorMsg) {
            haoutil.msg("请求网格失败!");
        }
    });
}

function load_pcolor(currentTime) {
    currentTime.setMinutes(0)
    currentTime.setSeconds(0)
    currentTime = parseInt(Number(currentTime) / 100000) * 100
    draw_interval = 0.005;
    $.ajax({
        type: "get",
        url: "../../data/points_gcode.json",
        dataType: "json",
        success: function (points_gcode) {
            function getextent() {
                var g_extent = [];
                var canvaswidth = window.innerWidth;
                var canvasheight = window.innerHeight - 50;
                var left_top_pt = new Cesium.Cartesian2(0, 0);
                var left_bottom_pt = new Cesium.Cartesian2(0, canvasheight);
                var right_top_pt = new Cesium.Cartesian2(canvaswidth, 0);
                var right_bottom_pt = new Cesium.Cartesian2(canvaswidth, canvasheight);
                var pick1 = viewer.scene.globe.pick(viewer.camera.getPickRay(left_top_pt), viewer.scene);
                var pick2 = viewer.scene.globe.pick(viewer.camera.getPickRay(left_bottom_pt), viewer.scene);
                var pick3 = viewer.scene.globe.pick(viewer.camera.getPickRay(right_top_pt), viewer.scene);
                var pick4 = viewer.scene.globe.pick(viewer.camera.getPickRay(right_bottom_pt), viewer.scene);
                if (pick1 && pick2 && pick3 && pick4) {
                    var geoPt1 = viewer.scene.globe.ellipsoid.cartesianToCartographic(pick1);
                    var geoPt2 = viewer.scene.globe.ellipsoid.cartesianToCartographic(pick2);
                    var geoPt3 = viewer.scene.globe.ellipsoid.cartesianToCartographic(pick3);
                    var geoPt4 = viewer.scene.globe.ellipsoid.cartesianToCartographic(pick4);
                    //地理坐标转换为经纬度坐标
                    var point1 = [geoPt1.longitude / Math.PI * 180, geoPt1.latitude / Math.PI * 180];
                    var point2 = [geoPt2.longitude / Math.PI * 180, geoPt2.latitude / Math.PI * 180];
                    var point3 = [geoPt3.longitude / Math.PI * 180, geoPt3.latitude / Math.PI * 180];
                    var point4 = [geoPt4.longitude / Math.PI * 180, geoPt4.latitude / Math.PI * 180];
                    g_extent = [Math.min(point1[0], point2[0], point3[0], point4[0]), Math.min(point1[1], point2[1], point3[1], point4[1]), Math.max(point1[0], point2[0], point3[0], point4[0]), Math.max(point1[1], point2[1], point3[1], point4[1])]
                }
                return g_extent
            }
            $.post(baseUrlConfig['serverport'] + "fsReadCurrent", {
                'time': currentTime
            }, function (response) {
                response = JSON.parse(response);
                pcolorcanvas = document.createElement('canvas');
                pcolorcanvas.setAttribute("id", "pcolorcanvas");
                pcolorcanvas.style.position = 'fixed'
                pcolorcanvas.style["pointer-events"] = "none";
                pcolorcanvas.style["z-index"] = 10;
                pcolorcanvas.style["top"] = 0;
                pcolorcanvas.style.display = "none";
                document.getElementById('centerDiv').appendChild(pcolorcanvas);
                response[0]["lon-data"] = points_gcode[0]["lon-data"]
                response[0]["lat-data"] = points_gcode[0]["lat-data"]
                response[0]["g-code"] = points_gcode[0]["g-code"]
                g_extent = getextent()
                my_extent = [119.1135, 39.0025, 120.3829, 40.0546]
                var xmin, ymin, xmax, ymax;
                if (g_extent.length == 0) {
                    xmin = my_extent[0];
                    ymin = my_extent[1];
                    xmax = my_extent[2];
                    ymax = my_extent[3];
                } else {
                    if (g_extent[0] <= my_extent[0] && g_extent[1] <= my_extent[1] && g_extent[2] >= my_extent[2] && g_extent[3] >= my_extent[3]) {
                        xmin = my_extent[0];
                        ymin = my_extent[1];
                        xmax = my_extent[2];
                        ymax = my_extent[3];
                    } else {
                        xmin = g_extent[0];
                        ymin = g_extent[1];
                        xmax = g_extent[2];
                        ymax = g_extent[3];
                    }
                }
                pcolorcanvas.width = window.innerWidth;
                pcolorcanvas.height = window.innerHeight;
                var n = 1000;
                var draw_points_index = [];
                draw_gcode = [];
                var dx = (xmax - xmin) / 100;
                var dy = (ymax - ymin) / 100;
                for (var i = 0; i < 100; i++) {
                    for (var j = 0; j < 100; j++) {
                        var px = xmin + i * dx;
                        var py = ymin + j * dy;
                        var p_gcode = Ghash.encodeGeoHash(px, py)
                        draw_gcode.push(p_gcode.substring(0, 5))
                    }
                }
                draw_gcode = draw_gcode.sort()
                var draw_gcode_unique = [];
                draw_gcode_unique.push(draw_gcode[0])
                for (var i = 1; i < 10000; i++) {
                    if (draw_gcode[i] != draw_gcode[i - 1]) {
                        draw_gcode_unique.push(draw_gcode[i])
                    }
                }
                var each_num = Math.floor(n / draw_gcode_unique.length)
                each_num = Math.min(each_num * each_num, draw_gcode_unique.length)
                // console.log('each_num:', each_num)
                for (var i = 0; i < draw_gcode_unique.length; i++) {
                    try {
                        var tt = response[0]["g-code"][0][draw_gcode_unique[i].substring(0, 1)][draw_gcode_unique[i].substring(0, 2)][draw_gcode_unique[i].substring(0, 3)][draw_gcode_unique[i].substring(0, 4)][draw_gcode_unique[i].substring(0, 5)]
                        var t = []
                        for (var item in tt) {
                            t.push(item)
                        }
                        for (var j = 0; j < each_num; j++) {
                            draw_points_index.push(tt[t[j]][0][1])
                        }
                    } catch {}
                }
                var w = [];
                var x = [];
                var y = [];
                for (var j = 0; j < draw_points_index.length; j++) {
                    i = draw_points_index[j]
                    var w_value = Math.sqrt(response[0]["u-data"][i] * response[0]["u-data"][i] + response[0]["v-data"][i] * response[0]["v-data"][i])
                    w.push(w_value); // 权重值
                    x.push(response[0]["lon-data"][i]); // x
                    y.push(response[0]["lat-data"][i]); // y

                }
                // console.log(bounds, w, x, y, draw_interval)
                var p_grid = pcolor.p_grid(bounds, w, x, y, draw_interval)
                var colors = ['#0065FF', '#0068FF', '#006BFF', '#006FFF', '#0072FF', '#0075FF', '#0079FF', '#007CFF', '#007FFF', '#0083FF', '#0086FF', '#0089FF', '#008DFF', '#0090FF', '#0093FF', '#0097FF', '#009AFF', '#009DFF', '#00A1FF', '#00A4FF', '#00A7FF', '#00ABFF', '#00AEFF', '#00B1FF', '#00B5FF', '#00B8FF', '#00BBFF', '#00BFFF', '#00C2FF', '#00C5FF', '#00C9FF', '#00CCFF', '#00D0FF', '#00D1FE', '#00D2FD', '#00D4FD', '#00D5FC', '#00D7FC', '#00D8FB', '#00DAFB', '#00DBFA', '#00DDF9', '#00DEF9', '#00E0F8', '#00E1F8', '#00E3F7', '#00E4F7', '#00E6F6', '#00E7F6', '#00E8F5', '#00EAF4', '#00EBF4', '#00EDF3', '#00EEF3', '#00F0F2', '#00F1F2', '#00F3F1', '#00F4F0', '#00F6F0', '#00F7EF', '#00F9EF', '#00FAEE', '#00FCEE', '#00FDED', '#00FFED', '#00FFE8', '#00FFE4', '#00FFDF', '#00FFDB', '#00FFD7', '#00FFD2', '#00FFCE', '#00FFCA', '#00FFC5', '#00FFC1', '#00FFBC', '#00FFB8', '#00FFB4', '#00FFAF', '#00FFAB', '#00FFA7', '#00FFA2', '#00FF9E', '#00FF99', '#00FF95', '#00FF91', '#00FF8C', '#00FF88', '#00FF84', '#00FF7F', '#00FF7B', '#00FF76', '#00FF72', '#00FF6E', '#00FF69', '#00FF65', '#00FF61', '#04FF5D', '#08FF5A', '#0CFF57', '#10FF54', '#14FF51', '#18FF4E', '#1CFF4B', '#20FF48', '#24FF45', '#28FF42', '#2DFF3F', '#31FF3C', '#35FF39', '#39FF36', '#3DFF33', '#41FF30', '#45FF2D', '#49FF2A', '#4DFF27', '#51FF24', '#55FF21', '#5AFF1E', '#5EFF1B', '#62FF18', '#66FF15', '#6AFF12', '#6EFF0F', '#72FF0C', '#76FF09', '#7AFF06', '#7EFF03', '#83FF00', '#86FE00', '#8AFD00', '#8EFD00', '#92FC00', '#96FC00', '#9AFB00', '#9EFB00', '#A2FA00', '#A5FA00', '#A9F900', '#ADF900', '#B1F800', '#B5F800', '#B9F700', '#BDF700', '#C1F600', '#C4F500', '#C8F500', '#CCF400', '#D0F400', '#D4F300', '#D8F300', '#DCF200', '#E0F200', '#E3F100', '#E7F100', '#EBF000', '#EFF000', '#F3EF00', '#F7EF00', '#FBEE00', '#FFEE00', '#FFEB00', '#FFE900', '#FFE600', '#FFE400', '#FFE100', '#FFDF00', '#FFDD00', '#FFDA00', '#FFD800', '#FFD500', '#FFD300', '#FFD100', '#FFCE00', '#FFCC00', '#FFC900', '#FFC700', '#FFC500', '#FFC200', '#FFC000', '#FFBD00', '#FFBB00', '#FFB900', '#FFB600', '#FFB400', '#FFB100', '#FFAF00', '#FFAD00', '#FFAA00', '#FFA800', '#FFA500', '#FFA300', '#FFA100', '#FF9F00', '#FF9D00', '#FF9B00', '#FF9900', '#FF9700', '#FF9500', '#FF9300', '#FF9100', '#FF8F00', '#FF8D00', '#FF8B00', '#FF8900', '#FF8700', '#FF8500', '#FF8300', '#FF8100', '#FF7F00', '#FF7D00', '#FF7B00', '#FF7900', '#FF7700', '#FF7500', '#FF7300', '#FF7100', '#FF6F00', '#FF6D00', '#FF6B00', '#FF6900', '#FF6700', '#FF6500', '#FF6300', '#FF6100', '#FF5E00', '#FF5B00', '#FF5900', '#FF5600', '#FF5300', '#FF5100', '#FF4E00', '#FF4B00', '#FF4900', '#FF4600', '#FF4300', '#FF4100', '#FF3E00', '#FF3B00', '#FF3900', '#FF3600', '#FF3300', '#FF3100', '#FF2E00', '#FF2B00', '#FF2900', '#FF2600', '#FF2300', '#FF2100', '#FF1E00', '#FF1B00', '#FF1900', '#FF1600', '#FF1300', '#FF1100', '#FF0E00']
                pcolor.plot(pcolorcanvas, p_grid, [xmin, xmax], [ymin, ymax], colors);

                updatelegend = function (min, max) {
                    var legends = document.getElementById("colorbarContainer") //document.querySelector('colorbarContainer');
                    legends.style.display = 'block';
                    var legendCanvas = document.createElement('canvas');
                    legendCanvas.width = 20; //rbar 256
                    legendCanvas.height = 100; //10
                    var min1 = document.getElementById('min') //document.querySelector('min');
                    var max1 = document.getElementById('max') //document.querySelector('max');
                    var gradientImg = document.getElementById('soundgradient');
                    var legendCtx = legendCanvas.getContext('2d');
                    min1.innerHTML = min.toFixed(2);
                    max1.innerHTML = max.toFixed(2) + " m/s";
                    var gradientCfg = {};

                    // min1.innerHTML = min.toFixed(2);
                    // max1.innerHTML = max.toFixed(2);
                    gradientCfg = {
                        0.1: "#FF0C00", // "#3E26A8","#FF0C00"
                        0.2: "#FF6100", //#484DF0","#FF6100"
                        0.3: "#FFA100", //#327CFC","#FFA100"
                        0.4: "#FFEE00", //#21A2E4","#FFEE00"
                        0.5: "#83FF00", //#19BFB6","#83FF00"
                        0.6: "#00FF61", //#5ECC73","#00FF61"
                        0.7: "#00FFED", //#D1BE26","#00FFED"
                        0.8: "#00D0FF", //#FCCF30", "#00D0FF"
                        1: "#0065FF" //#F9FB15","#0065FF"
                    };
                    var gradient = legendCtx.createLinearGradient(0, 0, 1, 100);
                    for (var key in gradientCfg) {
                        gradient.addColorStop(key, gradientCfg[key]);
                    }
                    legendCtx.fillStyle = gradient;
                    legendCtx.fillRect(0, 0, 20, 100);
                    gradientImg.src = legendCanvas.toDataURL();

                }
                updatelegend(p_grid['zlim'][0], p_grid['zlim'][1])

                function returnImgae() {
                    return pcolorcanvas.toDataURL("image/png");
                }
                // console.log(returnImgae())
                temptureLayer = viewer.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
                    url: returnImgae(),
                    rectangle: new Cesium.Rectangle(
                        Cesium.Math.toRadians(xmin),
                        Cesium.Math.toRadians(ymin),
                        Cesium.Math.toRadians(xmax),
                        Cesium.Math.toRadians(ymax)
                    )
                }));
                temptureLayer.alpha = 0.9
                var colorbarContainer = document.getElementById("colorbarContainer");
                colorbarContainer.style.display = "block"

            }).error(function () {
                haoutil.msg('请求数据失败');
            });
        },
        error: function (errorMsg) {
            haoutil.msg("请求网格失败!");
        }
    });
}

function load_contourf(currentTime) {
    currentTime.setMinutes(0)
    currentTime.setSeconds(0)
    currentTime = parseInt(Number(currentTime) / 100000) * 100
    var clipdata, maskdata;
    var getCut = function () {
        var url = "../../data/boundary_xy_polygon.json"; //widgetsTS\show_current\contour\boundary_xy_polygon.json
        //  var results
        $.get(url, function (res) {
            if (res) {
                let ext = res.features[0].geometry.coordinates[0].map((it) => { //let ext = res.geometries[0].coordinates[0].map((it) => {
                    return {
                        lat: it[1],
                        lng: it[0]
                    };
                });
                clipdata = ext;
            }
        })
    }
    getCut();
    var updatelegend = function (min, max) {
        var legends = document.getElementById("colorbarContainer") //document.querySelector('colorbarContainer');
        legends.style.display = 'block';
        var legendCanvas = document.createElement('canvas');
        legendCanvas.width = 20; //rbar 256
        legendCanvas.height = 100; //10
        var min1 = document.getElementById('min') //document.querySelector('min');
        var max1 = document.getElementById('max') //document.querySelector('max');
        var gradientImg = document.getElementById('soundgradient');
        var legendCtx = legendCanvas.getContext('2d');
        var gradientCfg = {};
        min1.innerHTML = min.toFixed(2);
        max1.innerHTML = max.toFixed(2) + " m/s";
        gradientCfg = {
            0.1: "#FF0C00", // "#3E26A8","#FF0C00"
            0.2: "#FF6100", //#484DF0","#FF6100"
            0.3: "#FFA100", //#327CFC","#FFA100"
            0.4: "#FFEE00", //#21A2E4","#FFEE00"
            0.5: "#83FF00", //#19BFB6","#83FF00"
            0.6: "#00FF61", //#5ECC73","#00FF61"
            0.7: "#00FFED", //#D1BE26","#00FFED"
            0.8: "#00D0FF", //#FCCF30", "#00D0FF"
            1: "#0065FF" //#F9FB15","#0065FF"
        };
        var gradient = legendCtx.createLinearGradient(0, 0, 1, 100);
        for (var key in gradientCfg) {
            gradient.addColorStop(key, gradientCfg[key]);
        }
        legendCtx.fillStyle = gradient;
        legendCtx.fillRect(0, 0, 20, 100);
        gradientImg.src = legendCanvas.toDataURL();

    }
    var calcCircleBound = function (data) {
        var _x = data[0][0];
        var _y = data[0][1];;
        var _value = data[0][2];;

        var bounds = {
            "east": _x,
            "west": _x,
            "north": _y,
            "south": _y
        };
        var min = _value;
        var max = _value;
        for (var i = 0; i < data.length; i++) {
            _x = data[i][0];
            _y = data[i][1];
            _value = data[i][2];
            if (min > _value) min = _value;
            if (max < _value) max = _value;
            if (_x > bounds.east) bounds.east = _x;
            if (_x < bounds.west) bounds.west = _x;
            if (_y > bounds.north) bounds.north = _y;
            if (_y < bounds.south) bounds.south = _y;
        }
        return {
            min: min,
            max: max,
            bounds: bounds
        }
    }
    var soundContour = function (data) {
        const tric = d3.tricontour();
        let tempColor = [
            "#0065FF", // "#3E26A8",
            "#00D0FF", //#484DF0",
            "#00FFED", //#327CFC",
            "#00FF61", //#21A2E4",
            "#83FF00", //#19BFB6",
            "#FFEE00", //#5ECC73",
            "#FFA100", //#D1BE26",
            "#FF6100", //#FCCF30",
            "#FF0C00" //#F9FB15"
        ]
        const contours = tric(data);
        const result = [];
        let i = 0;
        contours.forEach((contour) => {
            let item = {
                color: tempColor[i++],
                lines: [],
                value: contour.value,
            };
            contour.coordinates.forEach((coordinate) => {
                coordinate.forEach((line) => {
                    item.lines.push(
                        line.map((point) => {
                            return L.latLng(point[1], point[0]);
                        })
                    );
                });
            });
            result.push(item);
        });
        //lines 是与cut mask 一样的数组
        return result

    }
    $.ajax({
        type: "get",
        url: "../../data/points_gcode.json",
        dataType: "json",
        success: function (points_gcode) {
            $.post(baseUrlConfig['serverport'] + "fsReadCurrent", {
                'time': currentTime
            }, function (result) {
                result = JSON.parse(result);
                var queryCol = []
                for (i = 0; i < result[0]["u-data"].length; i++) {
                    queryCol.push({
                        x: points_gcode[0]["lon-data"][i],
                        y: points_gcode[0]["lat-data"][i],
                        value: Math.sqrt(result[0]["u-data"][i] * result[0]["u-data"][i] + result[0]["v-data"][i] * result[0]["v-data"][i])
                    })
                }
                let resData = [];
                queryCol.forEach(ele => {
                    let tempArr = [ele.x, ele.y, ele.value];
                    resData.push(tempArr);
                })
                var params = calcCircleBound(resData);
                var contourData = soundContour(resData);
                heatLayer = createHeatmapImageryByContour(Cesium, {
                    bounds: params.bounds,
                    min: params.min,
                    max: params.max,
                    data: contourData,
                    clip: clipdata,
                    mask: maskdata,
                    heatmapoptions: {
                        blur: .85,
                        radius: 40,
                        useLocalExtrema: true,
                        minopacity: 0.1,
                        maxopacity: 0.9
                    }
                })

                contourflayer = viewer.imageryLayers.addImageryProvider(heatLayer)
                viewer.imageryLayers.remove(heatLayer)
                updatelegend(params.min, params.max)
            }).error(function () {
                haoutil.msg('请求数据失败');
            });
        },
        error: function (errorMsg) {
            haoutil.msg("请求网格失败!");
        }
    });
}

function load_chlalayer(currentTime) {
    currentTime.setMinutes(0)
    currentTime.setSeconds(0)
    current_date = currentTime.toLocaleDateString().split("/")[0] + Math.floor(currentTime.toLocaleDateString().split("/")[1] / 10) + currentTime.toLocaleDateString().split("/")[1] % 10 + Math.floor(currentTime.toLocaleDateString().split("/")[2] / 10) + currentTime.toLocaleDateString().split("/")[2] % 10 + currentTime.toTimeString().substr(0, 2);
    var chlaprovider = new Cesium.WebMapServiceImageryProvider({
        url: baseUrlConfig['RSport'],
        layers: baseUrlConfig['RSlayer'] + current_date + '_he5_OC2_chla',
        parameters: {
            service: 'WMS',
            format: 'image/png',
            transparent: true,
            // sld_body: get_chla_sld('green-tide:' + current_date + '_he5_OC2_chla')
        }
        // rectangle: rectangle
    });
    chlalayer = new Cesium.ImageryLayer(chlaprovider, {
        alpha: 1.0
    })
    viewer.imageryLayers.add(chlalayer);

    handler.setInputAction(function (movement) {
        if (addentity) {
            viewer.entities.remove(addentity);
        }
        //通过鼠标当前的二维屏幕坐标获取椭球笛卡尔坐标
        var cartesian = mars3d.point.getCurrentMousePosition(viewer.scene, movement.position);
        if (cartesian) {
            //将笛卡尔坐标转为地理坐标
            var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
            var height = Math.ceil(cartographic.height);
            //输出地理坐标值
            let offset = 0.00001;
            let minx = longitudeString - offset;
            let miny = latitudeString - offset;
            let maxx = longitudeString + offset;
            let maxy = latitudeString + offset;
            var currentTime = new Date(timeModel["nowtimeparse"] * 1000)
            currentTime.setMinutes(0)
            currentTime.setSeconds(0)
            current_date = currentTime.toLocaleDateString().split("/")[0] + Math.floor(currentTime.toLocaleDateString().split("/")[1] / 10) + currentTime.toLocaleDateString().split("/")[1] % 10 + Math.floor(currentTime.toLocaleDateString().split("/")[2] / 10) + currentTime.toLocaleDateString().split("/")[2] % 10 + currentTime.toTimeString().substr(0, 2);
            var val;
            getRasterValue(minx, miny, maxx, maxy, current_date, "chla").then(function (data) {
                val = data;
                // debugger
                // //更新entity时
                // mars3d.draw.attr.label.style2Entity({text: "MarsGIS三维地球"}, entity.label);
                var inthtml = '经度:' + longitudeString.toFixed(2) + '<br>纬度:' + latitudeString.toFixed(2) + '<br>叶绿素浓度:' + val.toFixed(2) + " ug/L";
                // toastr.info(info_text)

                // var info_text = '叶绿素浓度:' + val.toFixed(2) + " ug/L";
                var info_text = "非爆发点";
                if (val.toFixed(2) >= baseUrlConfig["keychla"]) {
                    info_text = "爆发点";
                }

                addentity = viewer.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(longitudeString, latitudeString, 2.61),
                    point: {
                        color: new Cesium.Color.fromCssColorString("#3388ff"),
                        pixelSize: 10,
                        outlineColor: new Cesium.Color.fromCssColorString("#ffffff"),
                        outlineWidth: 2,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    },
                    label: {
                        text: info_text,
                        font: 'normal small-caps normal 22px 楷体', //字体样式
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        fillColor: Cesium.Color.AZURE,
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 2,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -20),
                        //偏移量  
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 2000000)
                    },
                    tooltip: {
                        html: inthtml,
                        anchor: [0, -12],
                    }
                });
            });

        }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
tiff_list = ['2013070208', '2013070308', '2013070408', '2013070508', '2013070608']

function load_cutlayer(currentTime) {
    currentTime.setMinutes(0)
    currentTime.setSeconds(0)
    current_date = currentTime.toLocaleDateString().split("/")[0] + Math.floor(currentTime.toLocaleDateString().split("/")[1] / 10) + currentTime.toLocaleDateString().split("/")[1] % 10 + Math.floor(currentTime.toLocaleDateString().split("/")[2] / 10) + currentTime.toLocaleDateString().split("/")[2] % 10 + currentTime.toTimeString().substr(0, 2);


    cutprovider = new Cesium.WebMapServiceImageryProvider({
        url: baseUrlConfig['RSport'],
        layers: baseUrlConfig['RSlayer'] + current_date + '_he5_cut_1',
        parameters: {
            service: 'WMS',
            format: 'image/png',
            VERSION: '1.1.1',
            // layers: 'green-tide:' + current_date + '_he5_cut_1',
            transparent: true,
            tiled: true
            // sld_body:get_cut_sld('green-tide:' + current_date + '_he5_cut_1')
        },

        // rectangle: rectangle
    })

    cutlayer = new Cesium.ImageryLayer(cutprovider, {
        alpha: 1.0
    })
    viewer.imageryLayers.add(cutlayer);
    if (tiff_list.indexOf(current_date) >= 0) {
        shpprovider = new Cesium.WebMapServiceImageryProvider({
            url: baseUrlConfig['RSport'],
            layers: baseUrlConfig['RSlayer'] + current_date.substring(0, current_date.length - 2),
            parameters: {
                service: 'WMS',
                format: 'image/png',
                VERSION: '1.1.1',
                // layers: 'green-tide:' + current_date + '_he5_cut_1',
                transparent: true,
                tiled: true
                // sld_body:get_cut_sld('green-tide:' + current_date + '_he5_cut_1')
            },

            // rectangle: rectangle
        })
        shplayer = new Cesium.ImageryLayer(shpprovider, {
            alpha: 1.0
        })
        viewer.imageryLayers.add(shplayer);
    }
}

function getRasterValue(minx, miny, maxx, maxy, current_date, layer_type) {
    var layers;
    if (layer_type == "cut") {
        layers = 'green-tide:' + current_date + '_he5_cut_1';
    } else {
        layers = 'green-tide:' + current_date + '_he5_OC2_chla';
    }
    var p = new Promise(function (resolve, reject) {
        let url = baseUrlConfig['RSport'] +
            "?SERVICE=WMS" +
            "&VERSION=2.0.0" +
            "&REQUEST=GetFeatureInfo" +
            "&FORMAT=" + encodeURIComponent("image/png") +
            "&TRANSPARENT=true" +
            "&QUERY_LAYERS=" + encodeURIComponent(layers) +
            "&LAYERS=" + encodeURIComponent(layers) +
            "&exceptions=" + encodeURIComponent("application/vnd.ogc.se_inimage") +
            "&INFO_FORMAT=" + encodeURIComponent("application/json") +
            "&FEATURE_COUNT=50" +
            "&X=50" +
            "&Y=50" +
            "&SRS=EPSG%3A4326" +
            "&STYLES=" +
            "&WIDTH=101" +
            "&HEIGHT=101" +
            "&BBOX=" + encodeURIComponent(minx + "," + miny + "," + maxx + "," + maxy);
        // console.log(url);
        $.getJSON(url, function (data) {
            let val = data['features'][0]['properties']['GRAY_INDEX']
            resolve(val)
            reject("请求数据失败")
        });
    })
    return p;
}
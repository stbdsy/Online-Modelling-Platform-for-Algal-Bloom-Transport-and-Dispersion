(function(window) {
    'use strict';

    function define_kde() {
        var kde = {}
        var cellSize;
        // var pop = 1;
        var radius;
        var cellnum = 512;
        var xnet, ynet, density;
        var xmin, xmax;
        var ymin, ymax;
        var zmin = 100000000000,

            zmax = -100000000000;

        function init(userConfig) {
            if (!userConfig.xmin || !userConfig.xmax || !userConfig.ymax || !userConfig.ymin)
                console.log("Missing Parameters in kde");
            else {
                xmin = userConfig.xmin;
                xmax = userConfig.xmax;
                ymin = userConfig.ymin;
                ymax = userConfig.ymax;
                if (userConfig.cellSize && userConfig.cellSize >= 0)
                    cellSize = userConfig.cellSize;
                else if (!userConfig.cellSize) {
                    cellSize = Math.min(((xmax - xmin) / cellnum), ((ymax - ymin) / cellnum))
                }
                createNetwork();
            }
        }

        function dist(lat1, lng1, lat2, lng2) {
            var s = Math.pow(Math.pow(lng1 - lng2, 2) + Math.pow(lat1 - lat2, 2), 0.5)
            return s;
        }

        function geo_dist(lat1, lng1, lat2, lng2) {
            var radLat1 = lat1 * Math.PI / 180.0;
            var radLat2 = lat2 * Math.PI / 180.0;
            var a = radLat1 - radLat2;
            var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
            var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
            s = s * 6378.137; // EARTH_RADIUS;
            s = Math.round(s * 10000) / 10000;
            return s;
        }

        function createNetwork() {
            xnet = new Array(Math.floor((xmax - xmin) / cellSize)).fill(0).map(x => Array(Math.floor((ymax - ymin) / cellSize)));
            ynet = new Array(Math.floor((xmax - xmin) / cellSize)).fill(0).map(x => Array(Math.floor((ymax - ymin) / cellSize)));
            density = new Array(Math.floor((xmax - xmin) / cellSize)).fill(0).map(x => Array(Math.floor((ymax - ymin) / cellSize)).fill(0));
            for (var i = 0; i < Math.floor((xmax - xmin) / cellSize); i++) {
                for (var j = 0; j < Math.floor((ymax - ymin) / cellSize); j++) {
                    // xnet[i][j] = xmin + (i - 1) * cellSize + Math.pow(-1, i) * 0.5 * cellSize;
                    // ynet[i][j] = ymin + (j - 1) * cellSize * Math.pow(3, 0.5);
                    xnet[i][j] = xmin + (i - 1) * cellSize;
                    ynet[i][j] = ymin + (j - 1) * cellSize;
                }
            }

        }

        function calradius(nodes) {
            var dm;
            var num = nodes.length;
            var xmean = 0;
            var ymean = 0;
            var popnum = 0;
            for (var n = 0; n < nodes.length; n++) {
                xmean = xmean + nodes[n].pop * nodes[n].x;
                ymean = ymean + nodes[n].pop * nodes[n].y;
                popnum = popnum + nodes[n].pop;
            }
            xmean = xmean / popnum;
            ymean = ymean / popnum;
            var meandis = new Array(num);
            for (var n = 0; n < nodes.length; n++) {
                meandis[n] = dist(ymean, xmean, nodes[n].y, nodes[n].x);
            }
            meandis.sort()
            if (num % 2 === 0) { //判断数字个数是奇数还是偶数
                dm = ((meandis[num / 2] + meandis[num / 2 - 1]) / 2); //偶数个取中间两个数的平均数
            } else {
                dm = meandis[parseInt(num / 2)]; //奇数个取最中间那个数
            }
            var sd = 0;
            for (var n = 0; n < nodes.length; n++) {
                // console.log(nodes[n].pop)
                sd = sd + nodes[n].pop * (Math.pow((nodes[n].x - xmean), 2) + Math.pow((nodes[n].y - ymean), 2)) / popnum
            }
            sd = Math.pow(sd, 0.5);
            var returnradius = 0.9 * Math.min(sd, Math.pow(1 / Math.LN2, 0.5) * dm) * Math.pow(popnum, -0.2);
            return returnradius
        }

        function pip(x, y, polygons) {
            var i, j, c = false;
            for (i = 0, j = polygons.length - 1; i < polygons.length; j = i++) {
                if (((polygons[i][1] > y) != (polygons[j][1] > y)) &&
                    (x < (polygons[j][0] - polygons[i][0]) * (y - polygons[i][1]) / (polygons[j][1] - polygons[i][1]) + polygons[i][0])) {
                    c = !c;
                }
            }
            return c;
        }
        var kde = {
            fit: function(nodes, config, polygons) {
                init(config);
                var radius;
                if (!config.radius) {
                    radius = calradius(nodes);
                } else {
                    radius = config.radius;
                }
                for (var i = 0; i < Math.floor((xmax - xmin) / cellSize); i++) {
                    for (var j = 0; j < Math.floor((ymax - ymin) / cellSize); j++) {
                        if (pip(xnet[i][j], ynet[i][j], polygons)) {
                            for (var n = 0; n < nodes.length; n++) {
                                // var aa = dist(nodes[n].y, nodes[n].x, ynet[i][j], xnet[i][j]);
                                if (dist(nodes[n].y, nodes[n].x, ynet[i][j], xnet[i][j]) < radius) {
                                    density[i][j] = density[i][j] + (3 * nodes[n].pop * Math.pow((1 - Math.pow((dist(nodes[n].y, nodes[n].x, ynet[i][j], xnet[i][j]) / radius), 2)), 2) / Math.PI) / Math.pow(radius, 2);
                                    if (density[i][j] > zmax) {
                                        zmax = density[i][j]
                                    }
                                    if (density[i][j] < zmin) {
                                        zmin = density[i][j]
                                    }
                                }
                            }
                        }
                    }
                }
                return density
            },
            plot: function(canvas, colors) {
                // Clear screen
                var ctx = canvas.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // Starting boundaries
                var range = [xmax - xmin, ymax - ymin, zmax - zmin];
                var i, j, x, y, z;
                var m = ynet[0].length;
                var n = ynet.length
                    // var m = Math.max(ynet[0].length, xnet.length);
                    // var n = Math.max(ynet[0].length, xnet.length);
                var wx = canvas.width / n; //
                var wy = canvas.height / m; //n
                for (i = 0; i < n; i++)
                    for (j = 0; j < m; j++) {
                        if (density[i][j] == 0) continue;
                        x = (i * wx);
                        y = canvas.height - (j * wy);
                        var ddd = density[i][j];
                        z = (density[i][j] - zmin) / range[2];
                        if (z < 0.0) z = 0.0;
                        if (z > 1.0) z = 1.0;

                        ctx.fillStyle = colors[Math.floor((colors.length - 1) * z)];

                        ctx.strokeStyle = colors[Math.floor((colors.length - 1) * z)];

                        ctx.strokeRect(x - wx / 2, y - wy / 2, wx, wy);
                        ctx.fillRect(x - wx / 2, y - wy / 2, wx, wy);
                        // ctx.fillRect(20, 20, 150, 100);
                    }

            },
            get_zrange: function() {
                var zrange = [zmin, zmax];
                return zrange
            }
        }
        return kde
    }
    if (typeof(kde) == 'undefined') {
        window.kde = define_kde();
    } else {
        console.log("KDE already defined.");
    }
})(window);
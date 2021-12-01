// Extend the Array class
Array.prototype.max = function() {
    return Math.max.apply(null, this);
};
Array.prototype.min = function() {
    return Math.min.apply(null, this);
};
Array.prototype.mean = function() {
    var i, sum;
    for (i = 0, sum = 0; i < this.length; i++)
        sum += this[i];
    return sum / this.length;
};
Array.prototype.pip = function(x, y) {
    var i, j, c = false;
    for (i = 0, j = this.length - 1; i < this.length; j = i++) {
        if (((this[i][1] > y) != (this[j][1] > y)) &&
            (x < (this[j][0] - this[i][0]) * (y - this[i][1]) / (this[j][1] - this[i][1]) + this[i][0])) {
            c = !c;
        }
    }
    return c;
}

var pcolor = function() {
    var pcolor = {};
    var points = []
    var pidw = null;

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
    pcolor.predict = function(x, y) {
        pidw = new IDWClass();
        var k;
        var targetPoint = { 'x': x, 'y': y, 'z': null };
        k = pidw.getZValueFunc(points, targetPoint);
        return k
    };
    // Gridded matrices or contour paths
    pcolor.p_grid = function(polygons, t, x, y, width) {
        var variogram = {
            t: t,
            x: x,
            y: y,
            nugget: 0.0,
            range: 0.0,
            sill: 0.0,
            A: 1 / 3,
            n: 0
        };
        for (_i = 0; _i < x.length; _i++) {
            var point = { 'x': x[_i], 'y': y[_i], 'z': t[_i] };
            points.push(point);
        }
        var i, j, k, n = polygons.length;
        if (n == 0) return;
        // Boundaries of polygons space
        var xlim = [polygons[0][0][0], polygons[0][0][0]];
        var ylim = [polygons[0][0][1], polygons[0][0][1]];
        for (i = 0; i < n; i++) // Polygons
            for (j = 0; j < polygons[i].length; j++) { // Vertices
            if (polygons[i][j][0] < xlim[0])
                xlim[0] = polygons[i][j][0];
            if (polygons[i][j][0] > xlim[1])
                xlim[1] = polygons[i][j][0];
            if (polygons[i][j][1] < ylim[0])
                ylim[0] = polygons[i][j][1];
            if (polygons[i][j][1] > ylim[1])
                ylim[1] = polygons[i][j][1];
        }

        // Alloc for O(n^2) space
        var xtarget, ytarget;
        var a = Array(2),
            b = Array(2);
        var lxlim = Array(2); // Local dimensions
        var lylim = Array(2); // Local dimensions
        var x = Math.ceil((xlim[1] - xlim[0]) / width);
        var y = Math.ceil((ylim[1] - ylim[0]) / width);
        var A = Array(x + 1);
        for (i = 0; i <= x; i++) A[i] = Array(y + 1);
        for (i = 0; i < n; i++) {
            // Range for polygons[i]
            lxlim[0] = polygons[i][0][0];
            lxlim[1] = lxlim[0];
            lylim[0] = polygons[i][0][1];
            lylim[1] = lylim[0];
            for (j = 1; j < polygons[i].length; j++) { // Vertices
                if (polygons[i][j][0] < lxlim[0])
                    lxlim[0] = polygons[i][j][0];
                if (polygons[i][j][0] > lxlim[1])
                    lxlim[1] = polygons[i][j][0];
                if (polygons[i][j][1] < lylim[0])
                    lylim[0] = polygons[i][j][1];
                if (polygons[i][j][1] > lylim[1])
                    lylim[1] = polygons[i][j][1];
            }

            // Loop through polygon subspace
            a[0] = Math.floor(((lxlim[0] - ((lxlim[0] - xlim[0]) % width)) - xlim[0]) / width);
            a[1] = Math.ceil(((lxlim[1] - ((lxlim[1] - xlim[1]) % width)) - xlim[0]) / width);
            b[0] = Math.floor(((lylim[0] - ((lylim[0] - ylim[0]) % width)) - ylim[0]) / width);
            b[1] = Math.ceil(((lylim[1] - ((lylim[1] - ylim[1]) % width)) - ylim[0]) / width);
            for (j = a[0]; j <= a[1]; j++)
                for (k = b[0]; k <= b[1]; k++) {
                    xtarget = xlim[0] + j * width;
                    ytarget = ylim[0] + k * width;
                    // console.log(xtarget,ytarget)
                    if (polygons[i].pip(xtarget, ytarget))
                        A[j][k] = pcolor.predict(xtarget,
                            ytarget);
                }
        }
        A.xlim = xlim;
        A.ylim = ylim;
        A.zlim = [variogram.t.min(), variogram.t.max()];
        A.width = width;
        // console.log(A)
        // debugger
        return A;
    };

    // Plotting on the DOM
    pcolor.plot = function(canvas, p_grid, xlim, ylim, colors) {
        // Clear screen
        var ctx = canvas.getContext("2d");
        // debugger
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Starting boundaries
        var range = [xlim[1] - xlim[0], ylim[1] - ylim[0], p_grid.zlim[1] - p_grid.zlim[0]];
        var i, j, x, y, z;
        var n = p_grid.length;
        var m = p_grid[0].length;
        var wx = Math.ceil(p_grid.width * canvas.width / (xlim[1] - xlim[0]));
        var wy = Math.ceil(p_grid.width * canvas.height / (ylim[1] - ylim[0]));
        // console.log(p_grid)
        // console.log(canvas.toDataURL("image/png"));
        // debugger
        for (i = 0; i < n; i++) {
            for (j = 0; j < m; j++) {
                if (p_grid[i][j] == undefined) continue;
                x = canvas.width * (i * p_grid.width + p_grid.xlim[0] - xlim[0]) / range[0];
                y = canvas.height * (1 - (j * p_grid.width + p_grid.ylim[0] - ylim[0]) / range[1]);
                z = (p_grid[i][j] - p_grid.zlim[0]) / range[2];
                if (z < 0.0) z = 0.0;
                if (z > 1.0) z = 1.0;
                ctx.fillStyle = colors[Math.floor((colors.length - 1) * z)];
                ctx.fillRect(Math.round(x - wx / 2), Math.round(y - wy / 2), wx, wy);
            }
        }
        // console.log(canvas.toDataURL("image/png"));
        // debugger
    };
    return pcolor;
}();
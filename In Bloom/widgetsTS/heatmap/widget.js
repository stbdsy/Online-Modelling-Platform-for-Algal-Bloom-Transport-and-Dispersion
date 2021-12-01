var heatmapparams, heatLayer;
var heatmaptoolbar = document.getElementById('heatmap-toolbar');
var widget = mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        resources: [
            './data/urlConfig.js'
        ],
    },
    //初始化[仅执行1次]
    create: function() {
        heatmapparams = {
            radius: 150
        };
        //heatmap-toolbar
        Cesium.knockout.track(heatmapparams);
        heatmaptoolbar.style.display = "none";
        Cesium.knockout.applyBindings(heatmapparams, heatmaptoolbar);
    },
    activate: function() {
        heatmaptoolbar.style.display = "block";

        function heatmapParameter(name) {
            Cesium.knockout.getObservable(heatmapparams, name).subscribe(
                function(newValue) {
                    viewer.imageryLayers.remove(viewer.imageryLayers.get(1));
                    drawHeatmap(newValue);
                }
            );
        }
        heatmapParameter('radius');
        drawHeatmap(150);
    },
    disable: function() {
        heatmaptoolbar.style.display = "none";
        if (heatLayer != null) {
            viewer.imageryLayers.remove(heatLayer)
        }
    },
}));


//heatmap
function drawHeatmap(radius) {
    let geo = [];
    let bounds_north = -90;
    let bounds_west = 180;
    let bounds_south = 90;
    let bounds_east = -180;
    for (var i = 0; i < pointsCollection.length; i++) {
        let x = pointsCollection[i]["geometry"]["coordinates"][0];
        let y = pointsCollection[i]["geometry"]["coordinates"][1];
        if (y > bounds_north)
            bounds_north = y;
        if (y < bounds_south)
            bounds_south = y;
        if (x > bounds_east)
            bounds_east = x;
        if (x < bounds_west)
            bounds_west = x;
        var position = {
            x: x,
            y: y
        }
        geo.push(position);
    }
    let bounds = { "north": bounds_north, "west": bounds_west, "south": bounds_south, "east": bounds_east };
    const arrPoint = geo;
    heatLayer_ = createHeatmapImageryProvider(Cesium, {
        data: {
            "min": 0,
            "max": 0, //热力值
            "points": arrPoint
        },
        radius: radius,
        bounds: bounds
    });
    heatLayer = viewer.imageryLayers.addImageryProvider(heatLayer_);
}
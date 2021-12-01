var widget = mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        resources: [
            './lib/green_tide/kde/kde.js',
            './data/outline_84.js',
            './data/urlConfig.js'
        ],
    },
    //初始化[仅执行1次]
    create: function() {},
    kdeLayer: null,
    activate: function() {
        drawHeatmap();
    },
    disable: function() {
        if (kdeLayer != null) {
            viewer.imageryLayers.remove(kdeLayer)
            var colorbarContainer = document.getElementById("kdecolorbarContainer");
            colorbarContainer.style.display = "none"
        }
    },
}));


//heatmap
function drawHeatmap() {
    let geo = [];
    let bounds_north = -90;
    let bounds_west = 180;
    let bounds_south = 90;
    let bounds_east = -180;
    for (var i = 0; i < pointsCollection.length; i++) {
        let x = parseFloat(pointsCollection[i]["geometry"]["coordinates"][0]);
        let y = parseFloat(pointsCollection[i]["geometry"]["coordinates"][1]);
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
            y: y,
            pop: 1,
        }
        geo.push(position);
    }
    bounds_west = (bounds_west + bounds_east) / 2 - 1.5 * (bounds_east - bounds_west)
    bounds_east = (bounds_west + bounds_east) / 2 + 1.5 * (bounds_east - bounds_west)
    bounds_south = (bounds_south + bounds_north) / 2 - 1.5 * (bounds_north - bounds_south)
    bounds_north = (bounds_south + bounds_north) / 2 + 1.5 * (bounds_north - bounds_south)
    var config = { "xmin": bounds_west, "xmax": bounds_east, "ymin": bounds_south, "ymax": bounds_north };
    var draw_data = kde.fit(geo, config, bounds[0]);
    const arrPoint = draw_data;
    // 矩形坐标
    var kdecanvas = document.getElementById("kdecanvas");
    kdecanvas.style.display = "none";
    kdecanvas.width = window.innerWidth;
    kdecanvas.height = window.innerHeight;
    var colors = ['#0065FF', '#0068FF', '#006BFF', '#006FFF', '#0072FF', '#0075FF', '#0079FF', '#007CFF', '#007FFF', '#0083FF', '#0086FF', '#0089FF', '#008DFF', '#0090FF', '#0093FF', '#0097FF', '#009AFF', '#009DFF', '#00A1FF', '#00A4FF', '#00A7FF', '#00ABFF', '#00AEFF', '#00B1FF', '#00B5FF', '#00B8FF', '#00BBFF', '#00BFFF', '#00C2FF', '#00C5FF', '#00C9FF', '#00CCFF', '#00D0FF', '#00D1FE', '#00D2FD', '#00D4FD', '#00D5FC', '#00D7FC', '#00D8FB', '#00DAFB', '#00DBFA', '#00DDF9', '#00DEF9', '#00E0F8', '#00E1F8', '#00E3F7', '#00E4F7', '#00E6F6', '#00E7F6', '#00E8F5', '#00EAF4', '#00EBF4', '#00EDF3', '#00EEF3', '#00F0F2', '#00F1F2', '#00F3F1', '#00F4F0', '#00F6F0', '#00F7EF', '#00F9EF', '#00FAEE', '#00FCEE', '#00FDED', '#00FFED', '#00FFE8', '#00FFE4', '#00FFDF', '#00FFDB', '#00FFD7', '#00FFD2', '#00FFCE', '#00FFCA', '#00FFC5', '#00FFC1', '#00FFBC', '#00FFB8', '#00FFB4', '#00FFAF', '#00FFAB', '#00FFA7', '#00FFA2', '#00FF9E', '#00FF99', '#00FF95', '#00FF91', '#00FF8C', '#00FF88', '#00FF84', '#00FF7F', '#00FF7B', '#00FF76', '#00FF72', '#00FF6E', '#00FF69', '#00FF65', '#00FF61', '#04FF5D', '#08FF5A', '#0CFF57', '#10FF54', '#14FF51', '#18FF4E', '#1CFF4B', '#20FF48', '#24FF45', '#28FF42', '#2DFF3F', '#31FF3C', '#35FF39', '#39FF36', '#3DFF33', '#41FF30', '#45FF2D', '#49FF2A', '#4DFF27', '#51FF24', '#55FF21', '#5AFF1E', '#5EFF1B', '#62FF18', '#66FF15', '#6AFF12', '#6EFF0F', '#72FF0C', '#76FF09', '#7AFF06', '#7EFF03', '#83FF00', '#86FE00', '#8AFD00', '#8EFD00', '#92FC00', '#96FC00', '#9AFB00', '#9EFB00', '#A2FA00', '#A5FA00', '#A9F900', '#ADF900', '#B1F800', '#B5F800', '#B9F700', '#BDF700', '#C1F600', '#C4F500', '#C8F500', '#CCF400', '#D0F400', '#D4F300', '#D8F300', '#DCF200', '#E0F200', '#E3F100', '#E7F100', '#EBF000', '#EFF000', '#F3EF00', '#F7EF00', '#FBEE00', '#FFEE00', '#FFEB00', '#FFE900', '#FFE600', '#FFE400', '#FFE100', '#FFDF00', '#FFDD00', '#FFDA00', '#FFD800', '#FFD500', '#FFD300', '#FFD100', '#FFCE00', '#FFCC00', '#FFC900', '#FFC700', '#FFC500', '#FFC200', '#FFC000', '#FFBD00', '#FFBB00', '#FFB900', '#FFB600', '#FFB400', '#FFB100', '#FFAF00', '#FFAD00', '#FFAA00', '#FFA800', '#FFA500', '#FFA300', '#FFA100', '#FF9F00', '#FF9D00', '#FF9B00', '#FF9900', '#FF9700', '#FF9500', '#FF9300', '#FF9100', '#FF8F00', '#FF8D00', '#FF8B00', '#FF8900', '#FF8700', '#FF8500', '#FF8300', '#FF8100', '#FF7F00', '#FF7D00', '#FF7B00', '#FF7900', '#FF7700', '#FF7500', '#FF7300', '#FF7100', '#FF6F00', '#FF6D00', '#FF6B00', '#FF6900', '#FF6700', '#FF6500', '#FF6300', '#FF6100', '#FF5E00', '#FF5B00', '#FF5900', '#FF5600', '#FF5300', '#FF5100', '#FF4E00', '#FF4B00', '#FF4900', '#FF4600', '#FF4300', '#FF4100', '#FF3E00', '#FF3B00', '#FF3900', '#FF3600', '#FF3300', '#FF3100', '#FF2E00', '#FF2B00', '#FF2900', '#FF2600', '#FF2300', '#FF2100', '#FF1E00', '#FF1B00', '#FF1900', '#FF1600', '#FF1300', '#FF1100', '#FF0E00']
    kde.plot(kdecanvas, colors);
    updatelegend = function() {
        var legends = document.getElementById("kdecolorbarContainer") //document.querySelector('colorbarContainer');
        legends.style.display = 'none';
        var legendCanvas = document.createElement('canvas');
        legendCanvas.width = 20; //rbar 256
        legendCanvas.height = 100; //10
        // var min1 = document.getElementById('kdemin') //document.querySelector('min');
        // var max1 = document.getElementById('kdemax') //document.querySelector('max');
        var gradientImg = document.getElementById('kdesoundgradient');
        var legendCtx = legendCanvas.getContext('2d');
        var gradientCfg = {};

        // min1.innerHTML = "低";
        // max1.innerHTML = "高";
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
    updatelegend()

    function returnImgae() {
        return kdecanvas.toDataURL("image/png");
    }
    kdeLayer = viewer.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
        url: returnImgae(),
        rectangle: new Cesium.Rectangle(
            Cesium.Math.toRadians(config.xmin),
            Cesium.Math.toRadians(config.ymin),
            Cesium.Math.toRadians(config.xmax),
            Cesium.Math.toRadians(config.ymax)
        )
    }));
    kdeLayer.alpha = 1.0
    viewer.flyTo(kdeLayer);
    var colorbarContainer = document.getElementById("kdecolorbarContainer");
    colorbarContainer.style.display = "block"
}
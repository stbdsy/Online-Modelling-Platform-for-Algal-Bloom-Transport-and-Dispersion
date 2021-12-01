var redPolygon;
var redLine;
var dataSource;
mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                "position": {
                    "top": 50,
                    "bottom": 200,
                    "left": 160
                },
                width: 800,
            }
        },
        resources: [
            './data/urlConfig.js'
        ],
    },
    //初始化[仅执行1次]
    create: function() {

    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function(opt, result) {
        this.viewWindow = result;
    },
    //打开激活
    activate: function() {

    },
    //关闭释放
    disable: function() {
        this.clearFeature();
        this.viewWindow = null;
    },
    doQuery: function(sql) {
        var url = baseUrlConfig['serverport'] + "dataquery";
        var data;
        $.post(url, {sql}, function(response) {
            data = response
        })
        return data;
    },
    getbaseUrlConfig: function() {
        return baseUrlConfig;
    },
    drawPolygon: function() {
        redPolygon = viewer.entities.add({
            name: 'Red polygon on surface',
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray([
                    119.561127, 39.905102,
                    119.564678, 39.900579,
                    119.540598, 39.886109,
                    119.535446, 39.889519,
                    119.561127, 39.905102]),
                material: Cesium.Color.RED
            }
        });
        viewer.flyTo(redPolygon);
    },
    drawLine: function() {
        redLine = viewer.entities.add({
            name: '沿着地球表面的红线',
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArray(
                    [119.560137, 39.905390,
                        119.525877, 39.831570]),
                width: 5,
                clampToGround: true,
                material: Cesium.Color.RED
            }
        });
        viewer.flyTo(redLine);
    },
    addFeature1:function (arr) {
        dataSource = new Cesium.CustomDataSource('myData');

        $(arr).each(function (i, item) {
            //添加实体
            var entity = dataSource.entities.add({
                name: item.name,
                position: Cesium.Cartesian3.fromDegrees(item.X, item.Y),
                billboard: {
                    image: "img/marker.png",
                    scale: 0.7,  //原始大小的缩放比例
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //CLAMP_TO_GROUND
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
                },
                label: {
                    text: item.name,
                    font: 'normal small-caps normal 19px 楷体',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    fillColor: Cesium.Color.AZURE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, 20),   //偏移量  
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 2000000)
                },
                data: item,
                popup: {
                    anchor: [0, -25],
                }
            });
        });
        viewer.dataSources.add(dataSource);
        this.drawPolygon();
    },
    addFeature2:function (arr) {
        dataSource = new Cesium.CustomDataSource('myData');
        $(arr).each(function (i, item) {
            //添加实体
            var entity = dataSource.entities.add({
                name: item.name,
                position: Cesium.Cartesian3.fromDegrees(item.X, item.Y),
                billboard: {
                    image: "img/marker.png",
                    scale: 0.7,  //原始大小的缩放比例
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //CLAMP_TO_GROUND
                    scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.5, 8.0e6, 0.2)
                },
                label: {
                    text: item.name,
                    font: 'normal small-caps normal 19px 楷体',
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    fillColor: Cesium.Color.AZURE,
                    outlineColor: Cesium.Color.BLACK,
                    outlineWidth: 2,
                    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(0, 20),   //偏移量  
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 2000000)
                },
                data: item,
                popup: {
                    anchor: [0, -25],
                }
            });
        });
        viewer.dataSources.add(dataSource);
        this.drawLine();
    },
    clearFeature:function (){
        viewer.dataSources.remove(dataSource);
        viewer.entities.remove(redPolygon);
        viewer.entities.remove(redLine);
    }
}));
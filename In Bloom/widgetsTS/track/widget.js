var dataSource_track, dataSource_track1;
var widget_queryBaiduPOI = mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        resources: [
            './data/urlConfig.js'
        ],
    },
    //初始化[仅执行1次]
    create: function() {},
    activate: function() {
        haoutil.msg('请选择点');
        // viewer.dataSources.remove(viewer.dataSources.get(1));
        // viewer.dataSources.remove(viewer.dataSources.get(1));

        function bindPopup(entity, name) {
            var inthtml = '<div style="text-align:center;vertical-align:middle;"><input readonly="readonly" style="text-align:center;font-size:15px;" value=' + name + '><br>' +
                '<input id="button" type="button" value="Draw Trajectory" onclick="buttonClick(\'' + name + '\');"></div>'
            entity.popup = {
                html: inthtml,
                anchor: [0, -12], //左右、上下的偏移像素值。
            };
        }
        dataSource_track = new Cesium.CustomDataSource('myData');
        dataSource_track1 = new Cesium.CustomDataSource('myData1');
        for (var i = 0; i < pointsCollectionAll.length; i++) {
            let longitude = pointsCollectionAll[i]["geometry"]["coordinates"][0];
            let latitude = pointsCollectionAll[i]["geometry"]["coordinates"][1];
            var entity = dataSource_track.entities.add({
                name: i,
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                point: {
                    color: new Cesium.Color.fromCssColorString("#3388ff"),
                    pixelSize: 10,
                    outlineColor: new Cesium.Color.fromCssColorString("#ffffff"),
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                },
                label: {
                    // text: "i",
                    font: 'normal small-caps normal 17px 楷体',
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
                // data: item,
                tooltip: {
                    // html: inthtml,
                    anchor: [0, -12],
                }
            });
            var name = i;
            bindPopup(entity, name);
        }
        viewer.dataSources.add(dataSource_track);
    },
    disable: function() {
        viewer.dataSources.remove(dataSource_track);
        viewer.dataSources.remove(dataSource_track1);
    },
}));


function buttonClick(name) {
    viewer.dataSources.remove(dataSource_track);
    $.post(baseUrlConfig['serverport'] + "fsReadDir", { 'Dir': 'data//' + dir_getParticles + "//", 'pointId': name }, function(response) {
        var lineposition = [];
        for (var i = 0; i < response.length; i = i + 4) {
            longitude = response[i];
            latitude = response[i + 2];
            lineposition.push(longitude, latitude, 0);
            datetime = response[i + 1];
            datetime = datetime.split("_")[0];
            datetime = getTime2(datetime);
            var inthtml = '<div style="font-size:20px"><table><tr><td>Time：</td><td><input readonly="readonly" style="width:200px;" value=' + datetime + '></td></tr>' +
                '<tr><td>ID：</td><td><input readonly="readonly" style="width:200px;" value=' + name + '></td></tr>' +
                '<tr><td>Lon：</td><td><input readonly="readonly" style="width:200px;" value=' + parseFloat(longitude).toFixed(5) + '°' + '></td></tr>' +
                '<tr><td>Lat：</td><td><input readonly="readonly" style="width:200px;" value=' + parseFloat(latitude).toFixed(5) + '°' + '></td></tr></div>';
            var color, olw;
            if (i==0){
                color=Cesium.Color.GREEN;
                olw = 4;
            }else if(i==response.length-4){
                color=Cesium.Color.RED;
                olw = 4;
            }
            else{
                color=new Cesium.Color.fromCssColorString("#ffffff");
                olw = 2;
            }
            var entity = dataSource_track1.entities.add({
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude),
                point: {
                    color: Cesium.Color.TRANSPARENT,
                    pixelSize: 10,
                    outlineColor: color,
                    outlineWidth: olw,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                },
                label: {
                    // text: "i",
                    font: 'normal small-caps normal 30px 楷体',
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
                // data: item,
                tooltip: {
                    html: inthtml,
                    anchor: [0, -12],
                }
            });
        }
        viewer.dataSources.add(dataSource_track1);
        dataSource_track1.entities.add({
            name: '流动线特效 地面',
            polyline: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(lineposition),
                width: 5,
                material: new mars3d.AnimationLineMaterialProperty({ //动画线材质
                    color: Cesium.Color.DEEPSKYBLUE,
                    duration: 10000, //时长，控制速度
                    url: 'img/textures/LinkPulse.png'
                }),
            }
        });
    });
}

function getTime2(value) {
    var date = new Date(value * 1000);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? '0' + m : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var min = date.getMinutes();
    min = min < 10 ? '0' + min : min;
    return y + '-' + m + '-' + d + 'T' + h + ':' + min;
}
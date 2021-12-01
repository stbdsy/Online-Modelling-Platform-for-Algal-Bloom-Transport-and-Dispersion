var widget_clearAll = mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    map: null, //框架会自动对map赋值
    options: {
        resources: [
            'view.css',
            './data/urlConfig.js'

        ],
        //直接添加到index
        view: {
            type: "append",
            url: 'view.html',
            parent: 'body'
        },
    },
    activate: function() {
        $("#btn_clearall").click(function() {
            document.getElementById("heatmap-toolbar").style.display = "none";
            document.getElementById("concave-toolbar").style.display = "none";
            document.getElementById("windy-toolbar").style.display = "none";
            viewer.entities.removeAll();
            viewer.dataSources.removeAll(true);
            viewer.imageryLayers.remove(viewer.imageryLayers.get(1));
            if (pointPrimitives) {
                viewer.scene.primitives.remove(pointPrimitives); // 移除已经存在的点元素
            }
            viewer.dataSources.add(Cesium.GeoJsonDataSource.load('data/boundary_line_84.json', {
                stroke: Cesium.Color.ORANGE,
                strokeWidth: 2.5,
                markerSymbol: '?'
            }));
        });
    }
}));
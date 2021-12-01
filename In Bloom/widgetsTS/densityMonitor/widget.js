/* 2017-12-4 15:31:54 | 修改 木遥（QQ：516584683） */
//模块：
mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: { 
                width: 1000,
                height: 600,
            }
        },
    },
    layerWork: null,
    //初始化[仅执行1次]
    create: function () { 
        var item = {
            "name": "铁路",
            "type": "arcgis_dynamic",
            "url": "http://arc.marsgis.cn/arcgis/rest/services/mars/hefei/MapServer",
            "layers": "33",
            "center": { "y": 31.814176, "x": 117.225362, "z": 5105.3, "heading": 359.2, "pitch": -83.1, "roll": 360 },
            "popup": "all"
        };
        
        this.layerWork = mars3d.layer.createLayer(item, this.viewer);
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //打开激活
    activate: function () { 
        this.layerWork.setVisible(true);
        // this.layerWork.centerAt();
    }, 
    //关闭释放
    disable: function () {
        this.layerWork.setVisible(false);
    },
    getbaseUrlConfig: function() {
        return baseUrlConfig;
    },
    getdir_getParticles: function() {
        return dir_getParticles;
    },
    getTime(value) {
        var date = new Date(value * 1000);
        var d = date.getDate();
        d = d < 10 ? ('0' + d) : d;
        var h = date.getHours();
        h = h < 10 ? ('0' + h) : h;
        return d+"日"+h+"时";
    }
}));
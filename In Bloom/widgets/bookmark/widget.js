/* 2017-9-28 16:14:36 | 修改 木遥（QQ：516584683） */
//模块：
mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 300,
                height: 400
            }
        },
    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //激活插件
    activate: function () {

    },
    //释放插件
    disable: function () {
        this.viewWindow = null;

    },
    showExtent: function (cfg) {
        console.log('书签定位：' + JSON.stringify(cfg));

        this.viewer.mars.centerAt(cfg, { isWgs84: true });
    },
    getDefaultExtent: function () {
        return this.viewer.gisdata.config.center;
    },
    getThisExtent: function () {
        var bookmark = mars3d.point.getCameraView(this.viewer, true);
        return bookmark;
    }

}));
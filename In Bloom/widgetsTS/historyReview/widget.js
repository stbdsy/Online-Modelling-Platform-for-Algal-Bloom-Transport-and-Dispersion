mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                "position": {
                    "top": 50,
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
        this.viewWindow = null;

    },
    testFun: function() {
        var url = baseUrlConfig['serverport'] + "historyReview";
        var data;
        $.post(url, function(response) {
            data = response
        })
        return data;
    },
    showHistory: function(data) {
        mars3d.widget.activate({
            uri: "widgetsTS/timeSlider/widget.js",
            data: data,
        });
    },
    getbaseUrlConfig: function() {
        return baseUrlConfig;
    }
}));
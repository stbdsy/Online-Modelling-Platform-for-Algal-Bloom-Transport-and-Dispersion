mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                "position": {
                    "top": 50,
                    "left": 10
                },
                width: 1427,
            },
        },
        //弹窗
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
        document.getElementById('particleLegend').style.display = "block";
        dir_getParticles = this.config.data[0];
        starttime = this.config.data[1];
        endtime = this.config.data[2];
        timestep = this.config.data[3];
        //time-toorbar
        // timeModel = {
        //     nowtime: getTime(starttime),
        //     nowtimeparse: starttime,
        //     clickstatus: false
        // };
        inHistory = true;
        toolbar.style.display = "block";
        instance = $(".js-range-slider-sharp").data("ionRangeSlider");
        timeModel["nowtimeparse"] = starttime;
        timeModel["nowtime"] = getTime(starttime);
        instance.update({
            min: starttime,
            max: endtime,
            step: timestep,
            from: starttime
        });
    },
    //关闭释放
    disable: function() {
        if (pointPrimitives) {
            viewer.scene.primitives.remove(pointPrimitives); // 移除已经存在的点元素
        }
        document.getElementById('particleLegend').style.display = "none";
        inHistory = false;
        this.viewWindow = null;
        instance = $(".js-range-slider-sharp").data("ionRangeSlider");
        let timenow = Date.now();
        timenow = Math.floor(timenow / 1000)
        timeModel["nowtimeparse"] = starttime;
        starttime = timenow - 3600 * 12;
        endtime = timenow + 3600 * 12;
        instance.update({
            min: starttime,
            max: endtime,
            step: timestep,
            from: timeModel["nowtimeparse"]
        });
    },
    testFun: function() {
        var url = baseUrlConfig['serverport'] + "getHistoryParams";
        var dir = dir_getParticles.split("_")
        var data;
        $.post(url, {
            'username': dir[0],
            'time': dir[1]
        }, function(response) {
            data = response
        })
        return data;
    },
}));

function getTime(value) {
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
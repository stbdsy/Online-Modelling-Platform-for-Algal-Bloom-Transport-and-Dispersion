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
                width: 600,
            }
        },
        resources: [
            './data/urlConfig.js'
        ],
    },
    //初始化[仅执行1次]
    create: function () {

    },
    viewWindow: null,
    //每个窗口创建完成后调用
    winCreateOK: function (opt, result) {
        this.viewWindow = result;
    },
    //打开激活
    activate: function () {

    },
    //关闭释放
    disable: function () {
        this.viewWindow = null;
    },
    testFun: function (params, elem) {
        if ("growthArea" in this.config.data){
            growthArea = this.config.data["growthArea"];
            params["growthArea"] = growthArea;
            params["initialArea"] = this.config.data["initialArea"];
        }else{
            initialArea = this.config.data[0];
            initialArea = JSON.stringify(initialArea);
            params["initialArea"] = initialArea;
        }
        if ("growthAreaSelect" in params){
            if (params["growthAreaSelect"]=="growthAreaOld"){
                params["growthArea"] = params["initialArea"]
            }
        }
        var user = JSON.parse(haoutil.storage.get("user"));
        user = user["name"];
        let timenow = Date.now();
        timenow = Math.floor(timenow / 1000);
        var timeStep = params["timeStep"];
        var starttime = parseFloat(params["startTime"]);
        var stopTime = parseFloat(params["stopTime"]);
        var length = stopTime - starttime;
        params["timenow"] = timenow;
        params["user"] = user;
        console.log(params)

        // if (timeStep % 3600 != 0) {
        //     var url = baseUrlConfig['serverport'] + "timeInterpo";
        //     $.ajax(url, {
        //         type: 'post',
        //         data: {
        //             'timenow': timenow,
        //             'user': user,
        //             'startTime': params["startTime"],
        //             'stopTime': params["stopTime"],
        //             'timeStep': params["timeStep"]
        //         },
        //         success: function (response) {
        //             console.log(response);
        //             var ws = new WebSocket('ws://' + baseUrlConfig['webSocketport']);
        //             ws.onopen = function () {
        //                 ws.send(JSON.stringify(params));
        //             }
        //             // 这里接受服务器端发过来的消息
        //             ws.onmessage = function (e) {
        //                 console.log(e.data)
        //                 var width = (parseFloat(e.data) - starttime) / length * 100;
        //                 width = width.toFixed(2);
        //                 if (width < 15) {
        //                     elem.style.width = '15%';
        //                 } else {
        //                     elem.style.width = width + '%';
        //                 }
        //                 elem.innerHTML = '计算进度' + width * 1 + '%';
        //                 if (width == 100) {
        //                     console.log("完成")
        //                     ws.close();
        //                     this.viewWindow = null;
        //                 }
        //             }
        //             ws.error = function () {
        //                 console.log("连接错误")
        //             }
        //             ws.close = function () {
        //                 console.log("socket已经关闭")
        //             }
        //         }
        //     });
        // } else {
            var ws = new WebSocket('ws://' + baseUrlConfig['webSocketport']);
            ws.onopen = function () {
                ws.send(JSON.stringify(params));
                if (params["model"] == "fBm"){
                    elem.innerHTML = "Random item generating……";
                    elem.style.width = '20%';
                }
            }
            // 这里接受服务器端发过来的消息
            ws.onmessage = function (e) {
                console.log(e.data);
                if (e.data=="error"){
                    haoutil.msg("Missing data, unable to calculate")
                    ws.close();
                    this.viewWindow = null;
                }
                else{
                    var width=e.data.split("：")[1];
                    width=width.split("%")[0];
                    width=parseFloat(width);
                    if (width < 20) {
                        elem.style.width = '20%';
                    } else {
                        elem.style.width = width + '%';
                    }
                    elem.innerHTML = e.data;
                    if (width == 100) {
                        console.log("Done")
                        ws.close();
                        this.viewWindow = null;
                    }
                }
            }
            ws.error = function () {
                console.log("连接错误")
            }
            ws.close = function () {
                console.log("socket已经关闭")
            }
        // }
    },
    drawGrowthArea: function (params) {
        if ("initialArea" in this.config.data){
            params["initialArea"] = this.config.data["initialArea"];
        }else{
            initialArea = this.config.data[0];
            initialArea = JSON.stringify(initialArea);
            params["initialArea"] = initialArea;
        }
        if ("growthArea" in this.config.data){
            growthArea = this.config.data["growthArea"];
            params["growthArea"] = growthArea;
        }
        mars3d.widget.activate({
            uri: "widgetsTS/drawGrowthArea/widget.js",
            data: params,
            windowOptions: {
                width: 250,
                height: 500,
                position: {
                    "top": 0,
                    "left": 160
                }
            },
            "autoDisable": true,
            "disableOther": true
        });
    },
    checkVirginity: function(){
        if ("growthArea" in this.config.data){
            growthArea=JSON.parse(this.config.data["growthArea"]);
            return growthArea["features"].length;
        }else{
            return false;
        }
    },
    getData: function(){
        return this.config.data;
    }
}));
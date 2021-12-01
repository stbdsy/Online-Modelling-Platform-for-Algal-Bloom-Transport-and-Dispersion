var modelSelect = document.getElementById('modelSelect');
var checkWind = document.getElementById('checkWind');
var setWind = document.getElementById('setWind');
var fBmdiv = document.getElementById('fBmdiv');
var windmodelSelect = document.getElementById("windmodelSelect");
var elem = document.getElementById("myBar");
var WRFWind = document.getElementById("WRFWind");
var constWind = document.getElementById("constWind");
var checkGrowth = document.getElementById('checkGrowth');
var checkDecay = document.getElementById('checkDecay');
var setGrowth = document.getElementById('setGrowth');
var drawGrowthArea = document.getElementById('drawGrowthArea');
var growthAreaSelect = document.getElementById('growthAreaSelect');
var alreadyDrawn = document.getElementById('alreadyDrawn');
var growthMethods = document.getElementById('growthMethods');

function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;
    if (thisWidget.config && thisWidget.config.style) {
        $("body").addClass(thisWidget.config.style);
    }
    if (thisWidget.checkVirginity()) {
        params=thisWidget.getData();
        document.getElementById('alreadyDrawn').innerHTML = thisWidget.checkVirginity() + ' Growth Area Ready';
        document.getElementById('Name').value = params["taskname"];
        document.getElementById('startTime').value = getTime(params["startTime"]);
        document.getElementById('stopTime').value = getTime(params["stopTime"]);
        document.getElementById('timeStep').value = params["timeStep"] / 60;
        document.getElementById('FbmStepSize').value = params["FbmStepSize"];
        document.getElementById('hurst').value = params["hurst"];
        document.getElementById('strand').value = params["strand"] * 100;
        document.getElementById('currentDragCoef').value = params["currentDragCoef"];
        document.getElementById('particleCnt').value = params["particleCnt"];
        document.getElementById('windDragCoef').value = params["windDragCoef"];
        document.getElementById('windSpeed').value = params["windSpeed"];
        document.getElementById('windDirection').value = params["windDirection"];
        document.getElementById('growSpeed').value = params["growSpeed"];
        document.getElementById('growStartTime').value = getTime(params["growStartTime"]);
        document.getElementById('growStopTime').value = getTime(params["growStopTime"]);
        document.getElementById('growStep').value = params["growStep"];
        modelSelect.value = params["model"];
        checkWind.checked = params["wind"];
        checkGrowth.checked = params["grow"];
    }else{
        var time1 = thisWidget.getData()[1];
        var time2 = time1 + 3600 * 72;
        document.getElementById('startTime').value = getTime(time1);
        document.getElementById('stopTime').value = getTime(time2);
    }
    if (modelSelect.value == "Lagrange") {
        fBmdiv.style.display = "none";
    } else if (modelSelect.value == "fBm") {
        fBmdiv.style.display = "block";
    }
    if (checkWind.checked) {
        setWind.style.display = "block";
    } else {
        setWind.style.display = "none";
    }
    if (checkGrowth.checked) {
        document.getElementById('growthParams').style.display = "block";
        if (growthAreaSelect.value == "growthAreaOld") {
            drawGrowthArea.style.display = "none";
            alreadyDrawn.style.display = "none";
        } else if (growthAreaSelect.value == "growthAreaNew") {
            drawGrowthArea.style.display = "block";
            alreadyDrawn.style.display = "block";
            document.getElementById('growStartTime').value = document.getElementById('startTime').value;
            document.getElementById('growStopTime').value = document.getElementById('stopTime').value;
        }
        if (checkDecay.checked) {
            document.getElementById('setDecay').style.display = "block";
        } else {
            document.getElementById('setDecay').style.display = "none";
        }
    } else {
        document.getElementById('growthParams').style.display = "none";
    }
    if (windmodelSelect.value == "WRF" || windmodelSelect.value == "defaultwind") {
        WRFWind.style.display = "block";
        constWind.style.display = "none";
    } else if (windmodelSelect.value == "constwind") {
        WRFWind.style.display = "none";
        constWind.style.display = "block";
    }
    elem.style.display = "none";
}
$("#drawGrowthArea").click(function () {
    var taskname = $("#Name").val();
    var startTime = (Date.parse($("#startTime").val()) / 1000);
    var stopTime = (Date.parse($("#stopTime").val()) / 1000);
    var timeStep = parseFloat($("#timeStep").val()) * 60;
    var FbmStepSize = parseFloat($("#FbmStepSize").val());
    var hurst = parseFloat($("#hurst").val());
    var strand = parseFloat($("#strand").val()) / 100;
    var currentDragCoef = parseFloat($("#currentDragCoef").val());
    var particleCnt = parseFloat($("#particleCnt").val());
    var params = {
        taskname: taskname,
        startTime: startTime,
        stopTime: stopTime,
        timeStep: timeStep,
        strand: strand,
        particleCnt: particleCnt,
        model: modelSelect.value,
        currentDragCoef: currentDragCoef,
        modelSelect: modelSelect.value,
    };
    if (modelSelect.value == "fBm") {
        params["FbmStepSize"] = FbmStepSize;
        params["hurst"] = hurst;
    }
    params["wind"] = checkWind.checked;
    if (checkWind.checked) {
        params["windDragCoef"] = parseFloat($("#windDragCoef").val());
        params["windSpeed"] = parseFloat($("#windSpeed").val());
        params["windDirection"] = parseFloat($("#windDirection").val());
    } else {
        params["windDragCoef"] = 0;
        params["windSpeed"] = 0;
        params["windDirection"] = 0;
    }
    params["grow"] = checkGrowth.checked;
    if (checkGrowth.checked) {
        params["growSpeed"] = parseFloat($("#growSpeed").val());
        params["growStartTime"] = (Date.parse($("#growStartTime").val()) / 1000);
        params["growStopTime"] = (Date.parse($("#growStopTime").val()) / 1000);
        params["growStep"] = parseFloat($("#growStep").val());
    }
    thisWidget.drawGrowthArea(params);
});
$("#btn").click(function () {
    var taskname = $("#Name").val();
    var startTime = (Date.parse($("#startTime").val()) / 1000);
    var stopTime = (Date.parse($("#stopTime").val()) / 1000);
    if (startTime>stopTime){
        haoutil.msg('时间范围有误');
        return;
    }
    document.getElementById('btn').style.display = "none";
    var timeStep = parseFloat($("#timeStep").val()) * 60;
    var FbmStepSize = parseFloat($("#FbmStepSize").val());
    var hurst = parseFloat($("#hurst").val());
    var strand = parseFloat($("#strand").val()) / 100;
    var currentDragCoef = parseFloat($("#currentDragCoef").val());
    var particleCnt = parseFloat($("#particleCnt").val());
    var params = {
        taskname: taskname,
        startTime: startTime,
        stopTime: stopTime,
        timeStep: timeStep,
        strand: strand,
        particleCnt: particleCnt,
        model: modelSelect.value,
        currentDragCoef: currentDragCoef
    };
    if (modelSelect.value == "fBm") {
        params["FbmStepSize"] = FbmStepSize;
        params["hurst"] = hurst;
    }
    params["wind"] = checkWind.checked;
    params["windmodel"] = windmodelSelect.value;
    if (checkWind.checked && windmodelSelect.value == "constwind") {
        params["windDragCoef"] = parseFloat($("#windDragCoef").val());
        params["windSpeed"] = parseFloat($("#windSpeed").val());
        params["windDirection"] = parseFloat($("#windDirection").val());
    } else {
        params["windDragCoef"] = 0;
        params["windSpeed"] = 0;
        params["windDirection"] = 0;
    }
    params["grow"] = checkGrowth.checked;
    if (checkGrowth.checked) {
        params["growSpeed"] = parseFloat($("#growSpeed").val());
        params["growStartTime"] = (Date.parse($("#growStartTime").val()) / 1000);
        params["growStopTime"] = (Date.parse($("#growStopTime").val()) / 1000);
        params["growStep"] = parseFloat($("#growStep").val()) * 60 * 60;
        params["growthAreaSelect"] = growthAreaSelect.value;
        params["growthMethods"] = growthMethods.value;
        data = thisWidget.getData();
        if ("growthArea" in data){}else{
            if (params["growthAreaSelect"]=="自定义新生长区域"){
                haoutil.msg("请定义生长区域!");
                return;
            }
        }

        params["decay"] = checkDecay.checked;
        if (checkDecay.checked) {
            params["lifespan"] = parseFloat($("#lifespan").val()) * 60 * 60;
        }
    }
    elem.style.display = "block";
    thisWidget.testFun(params, elem);
});
$("#modelSelect").change(function () {
    if (modelSelect.value == "Lagrange") {
        fBmdiv.style.display = "none";
    } else if (modelSelect.value == "fBm") {
        fBmdiv.style.display = "block";
    }
})
$("#checkWind").change(function () {
    if (checkWind.checked) {
        setWind.style.display = "block";
    } else {
        setWind.style.display = "none";
    }
})
$("#windmodelSelect").change(function () {
    if (windmodelSelect.value == "WRF" || windmodelSelect.value == "defaultwind") {
        WRFWind.style.display = "block";
        constWind.style.display = "none";
    } else if (windmodelSelect.value == "constwind") {
        WRFWind.style.display = "none";
        constWind.style.display = "block";
    }
})
$("#checkGrowth").change(function () {
    if (checkGrowth.checked) {
        document.getElementById('growthParams').style.display = "block";
        document.getElementById('growStartTime').value = document.getElementById('startTime').value;
        document.getElementById('growStopTime').value = document.getElementById('stopTime').value;
        if (growthAreaSelect.value == "growthAreaOld") {
            drawGrowthArea.style.display = "none";
            alreadyDrawn.style.display = "none";
        } else if (growthAreaSelect.value == "growthAreaNew") {
            drawGrowthArea.style.display = "block";
            alreadyDrawn.style.display = "block";
        }
        if (checkDecay.checked) {
            document.getElementById('setDecay').style.display = "block";
        } else {
            document.getElementById('setDecay').style.display = "none";
        }
    } else {
        document.getElementById('growthParams').style.display = "none";
    }
})
$("#growthAreaSelect").change(function () {
    if (growthAreaSelect.value == "growthAreaOld") {
        document.getElementById('setGrowth').style.display = "block";
        drawGrowthArea.style.display = "none";
        alreadyDrawn.style.display = "none";
    } else if (growthAreaSelect.value == "growthAreaNew") {
        document.getElementById('setGrowth').style.display = "block";
        drawGrowthArea.style.display = "block";
        alreadyDrawn.style.display = "block";
    }else if (growthAreaSelect.value == "growthDefault"){
        document.getElementById('setGrowth').style.display = "none";
        drawGrowthArea.style.display = "none";
        alreadyDrawn.style.display = "none";
    }
})
$("#checkDecay").change(function () {
    if (checkDecay.checked) {
        document.getElementById('setDecay').style.display = "block";
    } else {
        document.getElementById('setDecay').style.display = "none";
    }
})

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
    min = '00';
    return y + '-' + m + '-' + d + 'T' + h + ':' + min;
}
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;
    if (thisWidget.config && thisWidget.config.style) {
        $("body").addClass(thisWidget.config.style);
    }
    var datas = thisWidget.testFun();
    var tbody = document.querySelector("tbody");
    for (var i = 0; i < datas.length; i++)  //外面的for循环 是 行tr
    {
        var tr = document.createElement("tr");
        tbody.appendChild(tr);
        for (var k in datas[i])   //里面的for循环是 列
        {
            var td = document.createElement("td");  //创建单元格
            tr.appendChild(td);
            if (k == 'starttime' || k == 'endtime' || k == 'time') {
                datas[i][k] = getTime(datas[i][k]);
            }
            if (k == 'timeStep') {
                datas[i][k] = datas[i][k] / 60;
            }
            td.innerHTML = datas[i][k]; //把对象里面的属性值 datas[i][k]给td
        }
    }
}
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
    var sec = date.getSeconds();
    sec = sec < 10 ? '0' + sec : sec;
    return y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' + sec;
}
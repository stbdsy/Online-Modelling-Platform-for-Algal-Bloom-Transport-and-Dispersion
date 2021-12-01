function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;
    if (thisWidget.config && thisWidget.config.style) {
        $("body").addClass(thisWidget.config.style);
    }
    var datas = thisWidget.testFun();
    var tbody = document.querySelector("tbody");
    for (var i = 0; i < datas.length; i++) //外面的for循环 是 行tr
    {
        var tr = document.createElement("tr");
        tbody.appendChild(tr);
        var validation = false;
        for (var k in datas[i]) //里面的for循环是 列
        {
            if (k == 'username') {
                var user = JSON.parse(haoutil.storage.get("user"));
                user = user["name"];
                if (datas[i][k]==user){
                    validation=true;
                }else{
                    validation=false;
                }
            }
            var td = document.createElement("td"); //创建单元格
            tr.appendChild(td);
            if (k == 'starttime' || k == 'endtime' || k == 'time') {
                datas[i][k] = getTime(datas[i][k]);
            }
            if (k == 'timeStep') {
                datas[i][k] = datas[i][k] / 60;
            }
            td.innerHTML = datas[i][k]; //把对象里面的属性值 datas[i][k]给td
        }
        var td = document.createElement("td");
        tr.appendChild(td);
        if (validation==false){
            td.innerHTML = "<a1 href='javascript:;'>View</a1>";
        }else{
            td.innerHTML = "<a1 href='javascript:;'>View</a1>&nbsp;&nbsp;&nbsp;<a2 href='javascript:;'>Delete</a2>";
        }
    }

    //查看操作
    var as1 = document.querySelectorAll("a1");
    for (var i = 0; i < as1.length; i++) {
        as1[i].onclick = function() {
            var rows = this.parentNode.parentNode.rowIndex;
            var username = $("#tablelist tr:eq(" + rows + ") td:eq(1)").html();
            var time = $("#tablelist tr:eq(" + rows + ") td:eq(2)").html();
            time = Date.parse(time) / 1000;
            dir_getParticles = username + "_" + time;

            starttime = Date.parse($("#tablelist tr:eq(" + rows + ") td:eq(4)").html()) / 1000;
            endtime = Date.parse($("#tablelist tr:eq(" + rows + ") td:eq(5)").html()) / 1000;
            timestep = $("#tablelist tr:eq(" + rows + ") td:eq(6)").html() * 60;

            var data = [dir_getParticles, starttime, endtime, timestep]
            thisWidget.showHistory(data);
        }
    }

    //删除操作
    var as2 = document.querySelectorAll("a2");
    for (var i = 0; i < as2.length; i++) {
        as2[i].onclick = function() {
            var rows = this.parentNode.parentNode.rowIndex;
            var username = $("#tablelist tr:eq(" + rows + ") td:eq(1)").html();
            var time = $("#tablelist tr:eq(" + rows + ") td:eq(2)").html();
            time = Date.parse(time) / 1000;

            baseUrlConfig=thisWidget.getbaseUrlConfig();
            var url = baseUrlConfig['serverport'] + "deleteHistory";
            $.ajax(url, {
                type: 'post',
                data: {
                    'username': username,
                    'time': time
                },
                success: function(response) {
                    console.log(response);
                }
            });

            tbody.removeChild(this.parentNode.parentNode); //删除当前所在的行

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
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;
    if (thisWidget.config && thisWidget.config.style) {
        $("body").addClass(thisWidget.config.style);
    }
    selectChange();
    showTable("seaweedfield_biomass");
    showTable("seaweedfield_growthrate");
    showTable("greentide_biomass");
    showTable("greentide_growthrate");
}
$("#dataSelect").change(function () {
    selectChange();
})
function selectChange(){
    if (document.getElementById('dataSelect').value == "seaweedField") {
        document.getElementById('div2').style.display = "none";
        document.getElementById('div1').style.display = "block";
        thisWidget.clearFeature();
        $.getJSON("marker.json", function (result) {
            thisWidget.addFeature1(result.Data);
        });
    } else if (document.getElementById('dataSelect').value == "greenTide") {
        thisWidget.clearFeature();
        $.getJSON("marker2.json", function (result) {
            thisWidget.addFeature2(result.Data);
        });
        document.getElementById('div2').style.display = "block";
        document.getElementById('div1').style.display = "none";
    }
}
function showTable(tableName){
    var sql_year="SELECT YEAR FROM " + tableName + " GROUP BY YEAR";
    var years = thisWidget.doQuery(sql_year);
    var tbody = document.getElementById(tableName);
    var tr = document.createElement("tr");
    tbody.appendChild(tr);
    var td = document.createElement("td");
    tr.appendChild(td);
    if (tableName.includes("biomass")){
        td.innerHTML = "单位（g/m2）";
    }else if (tableName.includes("growthrate")){
        td.innerHTML = "单位（%）";}
    for (var i = 0; i < years.length; i++)
    {
        var td = document.createElement("td");
        tr.appendChild(td);
        td.innerHTML = years[i]["YEAR"] + "年";
    }

    var sql_month="SELECT MONTH FROM " + tableName + " GROUP BY MONTH";
    var months = thisWidget.doQuery(sql_month);
    for (var i = 0; i < months.length; i++)
    {
        var tr = document.createElement("tr");
        tbody.appendChild(tr);
        var td = document.createElement("td");
        tr.appendChild(td);
        td.innerHTML = months[i]["MONTH"] + "月";
        for (var j = 0; j < years.length; j++)
        {
            var sql_data="SELECT VAL FROM " + tableName + " WHERE YEAR = " + years[j]["YEAR"] + " AND MONTH = " + months[i]["MONTH"];
            var val = thisWidget.doQuery(sql_data);
            var td = document.createElement("td");
            tr.appendChild(td);
            td.innerHTML = val[0]["VAL"];
        }
    }
}
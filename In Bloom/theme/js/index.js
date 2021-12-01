'use strict'; //首页js by 木遥（516584683） 2018-4-12

var defpage;
var rightFrame;

$(document).ready(function() {
    initView();
});

function initView() {
    //获取菜单,并校验token
    //sendAjax({
    //    //url: "sys/menu/nav",
    //    "url": "sys/config/infoByKey/marsgis",
    //    type: "get",
    //    success: function (data) {

    //    },
    //});

    var user = JSON.parse(haoutil.storage.get("user"));
    $("#lblUserName").html(user.name);

    //根据设置，加载不同皮肤
    //setStyleByTheme();

    $('#userInfo').on('mouseenter', function() {
        var list = $(this).find('dl'),
            child = list.children(),
            size = child.size(),
            offsetV = 6;

        list.css({
            'height': $(child.get(size - 1)).height() * size + offsetV
        });

    })
    $('#userInfo').on('mouseleave', function() {
        var list = $(this).find('dl');

        list.css({
            'height': 0
        });
    });

    rightFrame = document.getElementById('rightFrame');
    if (rightFrame.attachEvent) {
        rightFrame.attachEvent("onload", rightFrame_onload);
    } else {
        rightFrame.onload = rightFrame_onload;
    }

    //加载菜单
    $.ajax({
        url: '../data/menu.json',
        type: 'get',
        dataType: "json",
        cache: false,
        beforeSend: function() {
            $('#navLoadEle').show();
        },
        success: function(json) {
            $('#navLoadEle').hide(); // loading

            defpage = json.defpage;
            //showPage(defpage);
        },
        error: function(d) {
            $('#navLoadEle').hide(); // loading

        },
    });
}


var lastFun;

function rightFrame_onload() {
    if (lastFun) {
        setTimeout(function() {
            lastFun();
        }, 200);
    }
}

function showPage(url) {
    if (url == null || url == '') return false;

    var lastsrc = $("#rightFrame").attr('src');
    if (lastsrc != url) {
        $("#rightFrame").attr('src', url);
        return true
    } else {
        return false;
    }
}

function logout() {
    //sendAjax({
    //    url: "userlogin/logout", 
    //    type: "post",
    //    dataType: "json",
    //    success: function (result) {

    //    }, 
    //});
    location.href = "login.html";
}
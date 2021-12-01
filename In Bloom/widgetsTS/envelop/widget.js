//concave-toorbar            
let maxDistance, minPoints, concavity, area, concaveparams;
var concavetoorbar = document.getElementById('concave-toolbar');
var widget_queryBaiduPOI = mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({
    options: {
        //弹窗
        resources: [
            './data/urlConfig.js'
        ],
    },
    //初始化[仅执行1次]
    create: function() {
        maxDistance = 3;
        concavity = 0.5;
        minPoints = 3;
        mycolor = "#87CEFA";
        // mycolor = "#b9bb0b"
        area = 0;
        concaveparams = {
            maxDistance: maxDistance,
            minPoints:minPoints,
            concavity: concavity,
            mycolor: mycolor,
            area: area
        };
        Cesium.knockout.track(concaveparams);
        var concavetoolbar = document.getElementById('concave-toolbar');
        concavetoolbar.style.display = "none";
        Cesium.knockout.applyBindings(concaveparams, concavetoolbar);
    },
    activate: function() {
        concavetoorbar.style.display = "block";

        function concaveParameter(name) {
            Cesium.knockout.getObservable(concaveparams, name).subscribe(
                function(newValue) {
                    viewer.entities.removeAll();
                    if (name == "concavity")
                        concavity = newValue;
                    else if (name == "maxDistance")
                        maxDistance = newValue;
                    else if (name == "minPoints")
                        minPoints = minPoints;
                    else if (name == "mycolor")
                        mycolor = newValue;

                    concaveHull(maxDistance, minPoints, concavity, mycolor);
                }
            );
        }
        concaveParameter('maxDistance');
        concaveParameter('minPoints');
        concaveParameter('concavity');
        concaveParameter('mycolor');
        concaveHull(maxDistance, minPoints, concavity, mycolor);
        new Colorpicker({
            el: "color-picker",
            color: mycolor,
            change: function(elem, hex) {
                document.getElementById("color-picker").value = hex;
                mycolor = hex;
            }
        })
        $("#change_color").click(function() {
            concaveHull(maxDistance, minPoints, concavity, mycolor);
        })
    },
    disable: function() {
        var concavetoorbar = document.getElementById('concave-toolbar');
        concavetoorbar.style.display = "none";
        viewer.entities.removeAll();
    },
}));

//concaveHull
function concaveHull(maxDistance, minPoints, concavity, mycolor) {
    const pointsets = clustersDbscan(maxDistance, minPoints);
    const format = ['.x', '.y'];
    area = 0;
    for (var i = 0; i < pointsets.length; i++) {
        const hullPts = hull(pointsets[i], concavity, format);
        drawPolygon(hullPts, mycolor);
    }
}

function drawPolygon(points, mycolor) {
    var pointsdata = [];
    var pointsdatai = [];
    var holesArray = [];
    var holes = []
    for (var i = 0; i < points.length; i++) {
        pointsdata.push([points[i]["x"], points[i]["y"]]);
    }
    pointsdata.push([points[0]["x"], points[0]["y"]]);
    var hull = turf.polygon([pointsdata])
    var hull1 = turf.difference(hull, poly1);
    var hull2 = turf.difference(hull1, poly2);
    var hull3 = turf.difference(hull2, poly3);
    var intersection = turf.intersect(hull3, poly0);
    for (var i = 0; i < intersection["geometry"]["coordinates"][0].length; i++) {
        pointsdatai.push(intersection["geometry"]["coordinates"][0][i][0]);
        pointsdatai.push(intersection["geometry"]["coordinates"][0][i][1]);
    }
    if (intersection["geometry"]["coordinates"].length > 1) {
        for (var i = 1; i < intersection["geometry"]["coordinates"].length; i++) {
            holesArray = [];
            for (var j = 0; j < intersection["geometry"]["coordinates"][i].length; j++) {
                holesArray.push(intersection["geometry"]["coordinates"][i][j][0]);
                holesArray.push(intersection["geometry"]["coordinates"][i][j][1]);
            }
            holes.push({ positions: Cesium.Cartesian3.fromDegreesArray(holesArray) })
        }
        console.log(holes)
        viewer.entities.add({
            name: "Red polygon on surface",
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(pointsdatai),
                holes: holes,
                material: Cesium.Color.fromCssColorString(mycolor)
            },
        });
    } else {
        viewer.entities.add({
            name: "Red polygon on surface",
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(pointsdatai),
                material: Cesium.Color.fromCssColorString(mycolor)
            },
        });
    }

    area = area + turf.area(intersection);
    var str = (area / 1000000).toFixed(2) + "km²"
    document.getElementById("arealabel").value = str;
}
//clusters
function clustersDbscan(maxDistance, minPoints) {
    p1_cnt = 0;
    p2_cnt = 0;
    p3_cnt = 0;
    p4_cnt = 0;
    p5_cnt = 0;
    let geo = [];
    let clusters = [];
    var points = { type: "FeatureCollection", features: pointsCollection_env };
    var options = {minPoints: minPoints};
    var clustered = turf.clustersDbscan(points, maxDistance, options);
    clustered = clustered["features"];
    if (pointPrimitives) {
        viewer.scene.primitives.remove(pointPrimitives); // 移除已经存在的点元素
    }
    pointPrimitives = viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    for (var i = 0; i < clustered.length; i++) {
        var x = clustered[i]["geometry"]["coordinates"][0];
        var y = clustered[i]["geometry"]["coordinates"][1];
        var position = Cesium.Cartesian3.fromDegrees(x, y, 0);
        if (clustered[i]["properties"]["dbscan"] != "noise") {
            p5_cnt = p5_cnt + 1;
            var clusterid = clustered[i]["properties"]["cluster"];
            var position0 = {
                x: x,
                y: y
            };
            pointPrimitives.add({
                pixelSize: 5,
                color: Cesium.Color.RED,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 0,
                position: position
            });
            if (isInArray(clusters, clusterid)) {
                geo[clusterid].push(position0);
            } else {
                clusters.push(clusterid);
                geo[clusterid] = [];
                geo[clusterid].push(position0);
            }
        } else {
            p1_cnt = p1_cnt + 1;
            pointPrimitives.add({
                pixelSize: 5,
                color: Cesium.Color.LIGHTSKYBLUE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 0,
                position: position
            });
        }
    }
    $("#p1_cnt").text(p1_cnt);
    $("#p2_cnt").text(p2_cnt);
    $("#p3_cnt").text(p3_cnt);
    $("#p4_cnt").text(p4_cnt);
    $("#p5_cnt").text(p5_cnt);
    return geo;
}

function isInArray(arr, value) {
    for (var i = 0; i < arr.length; i++) {
        if (value === arr[i]) {
            return true;
        }
    }
    return false;
}
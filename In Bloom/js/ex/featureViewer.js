//鼠标高亮
var featureViewer = {
    colorHighlight: Cesium.Color.YELLOW,
    colorSelected: Cesium.Color.LIME, 
    getBimAttr: function (pickedFeature) {
        if (!pickedFeature.tileset.properties || !pickedFeature.tileset.properties.length)
            return false;
        
        var fileParams;

        //如果有文件名，那么依据文件名
        if (pickedFeature.hasProperty("file")) {
            var file = pickedFeature.getProperty("file");

            for (var i = 0; i < pickedFeature.tileset.properties.length; i++) {
                var params = pickedFeature.tileset.properties[i];
                if (params.file == file) {
                    fileParams = params.params;
                }
            }
        }
            //直接取第一个
        else {
            fileParams = pickedFeature.tileset.properties[0].params;
        }

        if (!fileParams)
            return false;



        // 名称和 id
        var arrAttr = []; 
        function addItem(name, value) {
            if (value != null && value != "" && value != 0)
                arrAttr.push({name:name,value:value});
        }

        if (pickedFeature.hasProperty("id"))
            addItem('ID', pickedFeature.getProperty("id") ); 
        if (pickedFeature.hasProperty("name"))
            addItem('名称', pickedFeature.getProperty("name")); 
        if (pickedFeature.hasProperty("LevelName"))
            addItem('楼层', pickedFeature.getProperty("LevelName"));  
        if (pickedFeature.hasProperty("CategoryName"))
            addItem('分类', pickedFeature.getProperty("CategoryName"));   
        if (pickedFeature.hasProperty("FamilyName"))
            addItem('族', pickedFeature.getProperty("FamilyName"));    
        if (pickedFeature.hasProperty("FamilySymbolName"))
            addItem('族类型', pickedFeature.getProperty("FamilySymbolName"));     
        if (pickedFeature.hasProperty("file"))
            addItem('文件名', pickedFeature.getProperty("file"));      
         

 
        //依据group分类
        var groups = {};
        var names = pickedFeature._content.batchTable.getPropertyNames(pickedFeature._batchId);
        for (var k = 0; k < names.length; k++) {
            var n = names[k];
             
            if (n == "_properties") {//对于这种属性

                var properties = pickedFeature.getProperty(n);

                try {
                    var sets = JSON.parse(properties);

                    for (var b = 0; b < sets.length; b++) {
                        var set = sets[b];

                        var rows = groups[set.name];
                        if (!rows) rows = [];

                        for (var j = 0; j < set.properties.length; j++) {
                            var p = set.properties[j];
                            if (!p.value) continue;

                            var row = { name: p.name, value: p.value }; 
                            rows.push(row);
                        }
                        groups[set.name] = rows;

                    }
                }
                catch (ex) {
                    console.log("parse _properties failed:" + ex);
                } 
            }  
            else {//其他属性
                var name = n, value = pickedFeature.getProperty(n);
                 
                var defp; 
                for (var j = 0; j < fileParams.length; j++) {
                    var fp = fileParams[j];
                    if (name == fp.name) {
                        defp = fp;
                        break;
                    }
                }
                if (!defp) continue;

                var rows = groups[defp.group]; 
                if (!rows) rows = [];

                var val = value;
                if (defp.type == "YesNo")
                    val= value == 1 ? '是' : '否';
                if (defp.type == "Length")
                    val = (value * 0.3048).toFixed(2) + 'm';
                if (defp.type == "Area")
                    val = (value * 0.3048 * 0.3048).toFixed(2) + '㎡';
                if (defp.type == "Volume")
                    val = (value * 0.3048 * 0.3048 * 0.3048).toFixed(2) + 'm³';

                if (!val) continue;

                var row = { name: defp.name, value: val };
                rows.push(row);
                groups[defp.group] = rows;
            }

        }


        function groupName(group) {
            if (group == "PG_IDENTITY_DATA")
                return "标识数据";
            if (group == "PG_GEOMETRY")
                return "尺寸标注";
            if (group == "PG_PHASING")
                return "阶段化";
            if (group == "PG_CONSTRAINTS")
                return "约束";
            if (group == "INVALID")
                return '其他';
            if (group == "PG_MATERIALS")
                return '材质和装饰';
            if (group == "PG_CONSTRUCTION")
                return '构造';
            return group;
        }
         
        for (group in groups) {
            arrAttr.push({ type: 'group', name: groupName(group)});
             
            var rows = groups[group];
            for (var i = 0; i < rows.length; i++) {
                arrAttr = arrAttr.concat(rows[i]);
            }
        }

        return arrAttr;

    },
    install: function (viewer) { 
        this.viewer = viewer;

        var nameOverlay = document.createElement('div');
        viewer.container.appendChild(nameOverlay);
        //nameOverlay.className = 'backdrop';
        nameOverlay.style.display = 'none';
        nameOverlay.style.position = 'absolute';
        nameOverlay.style.bottom = '0';
        nameOverlay.style.left = '0';
        nameOverlay.style.color = '#ffffff';
        nameOverlay.style['pointer-events'] = 'none';
        nameOverlay.style.padding = '4px';
        nameOverlay.style.backgroundColor = 'black';
        this.nameOverlay = nameOverlay;

        var selected = {
            feature: undefined,
            originalColor: new Cesium.Color()
        }; 
        var highlighted = {
            feature: undefined,
            originalColor: new Cesium.Color()
        };
        var selectedEntity = new Cesium.Entity();
         
         
        var self = this;

        this.restoreHighlight = function () {
            if (Cesium.defined(highlighted.feature)) {
                try {
                    highlighted.feature.color = highlighted.originalColor;
                } catch (ex) {
                }
                highlighted.feature = undefined;
            }
        };
        this.onMouseMove = function (event) {
            self.restoreHighlight();

            // Pick a new feature
            var pickedFeature = viewer.scene.pick(event.endPosition);
            if (!Cesium.defined(pickedFeature)) {
                nameOverlay.style.display = 'none';
                return;
            }

            if (!Cesium.defined(pickedFeature.getProperty)) {
                nameOverlay.style.display = 'none';
                return;
            }
            // A feature was picked, so show it's overlay content

            var name = pickedFeature.getProperty('name');
            if (!Cesium.defined(name)) {
                name = pickedFeature.getProperty('id');
            }
            if (!Cesium.defined(name)) {
                name = pickedFeature.getProperty('ID');
            }
            if (!name || name == '') {
                nameOverlay.style.display = 'none';
                return;
            }
            
            nameOverlay.style.display = 'block';
            nameOverlay.style.bottom = viewer.canvas.clientHeight - event.endPosition.y + 'px';
            nameOverlay.style.left = event.endPosition.x + 'px';
            nameOverlay.textContent = name;

            // Highlight the feature if it's not already selected.
            if (pickedFeature !== selected.feature) {
                highlighted.feature = pickedFeature;
                Cesium.Color.clone(pickedFeature.color, highlighted.originalColor);
                pickedFeature.color = self.colorHighlight;
            }
        };

        this.onLeftClick = function (event) {
            // If a feature was previously selected, undo the highlight
            if (Cesium.defined(selected.feature)) {
                try {
                    selected.feature.color = selected.originalColor;
                } catch (ex) { }
                selected.feature = undefined;
            }

            // Pick a new feature
            var pickedFeature = viewer.scene.pick(event.position);
            if (!Cesium.defined(pickedFeature) && self.orginClickHandler) {
                self.orginClickHandler(event);
                return;
            }

            // Select the feature if it's not already selected
            if (selected.feature === pickedFeature) {
                return;
            }
            self.showTilesParts(pickedFeature);

            if (!Cesium.defined(pickedFeature.getProperty))
                return;

            selected.feature = pickedFeature;

            // Save the selected feature's original color
            if (pickedFeature === highlighted.feature) {
                Cesium.Color.clone(highlighted.originalColor, selected.originalColor);
                highlighted.feature = undefined;
            } else {
                Cesium.Color.clone(pickedFeature.color, selected.originalColor);
            }

            // Highlight newly selected feature
            pickedFeature.color = self.colorSelected;

            // Set feature infobox description
            var featureName = pickedFeature.getProperty('name');
            selectedEntity.name = featureName;
            selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';

            viewer.selectedEntity = selectedEntity;
            

            // 普通3dtiles 获取属性表格
            var arr = self.getBimAttr(pickedFeature); 
            if (!arr || arr.length == 0) { 
                arr = [];
                var names = pickedFeature._content.batchTable.getPropertyNames(pickedFeature._batchId);
                for (var i = 0; i < names.length; i++) {
                    var n = names[i];
                    if (!pickedFeature.hasProperty(n)) continue;

                    var val = pickedFeature.getProperty(n);
                    if (val == null || val == "") continue;
                    arr.push({ name: n, value: val}); 
                }
            }
            if (!arr || arr.length == 0) return;
            
            var html = '<table class="cesium-infoBox-defaultTable"><tbody>';
            for (var i = 0; i < arr.length; i++) {
                var item = arr[i];

                if (item.type == "group")
                    html += '<tr><th colspan="2">' + item.name + '</th></tr>';
                else if (item.value)
                    html += '<tr><th>' + item.name + '</th><td>' + item.value + '</td></tr>';
            }
            html += '</tbody></table>';

            if (viewer.infoBox) { 
                //infobox方式显示  
                selectedEntity.description = html;

            } else {
                //popup方式显示  
                var cartesian = mars3d.point.getCurrentMousePosition(viewer.scene, event.position);
                setTimeout(function () {
                    viewer.mars.popup.show({
                        id: "bim",
                        popup: {
                            html: html,
                            anchor: [0, -15]
                        }
                    }, cartesian);
                }, 200);
            }            

        }


        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        handler.setInputAction(this.onLeftClick, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this.handler = handler;
    },
    setMouseOver: function (v) {
        if (v) {
            this.handler.setInputAction(this.onMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        } else {
            this.restoreHighlight();

            this.nameOverlay.style.display = 'none';
            this.handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }
    },

    showTilesParts: function (pickedObject) {   
        //primitive对象 
        if (pickedObject && Cesium.defined(pickedObject.primitive)
            && pickedObject.primitive._config && pickedObject.primitive._config.scenetree) {
            var tilesParts = 'widgetsTS/tilesParts/widget.js';

            if (mars3d.widget.isActivate(tilesParts)) {
                var parts = mars3d.widget.getClass(tilesParts);
                if (parts.config.layerWork == pickedObject.primitive._config._layer)
                    return;//当前已激活,并且单击了相同模型时跳出
            }

            mars3d.widget.activate({
                name: pickedObject.primitive._config.name + " 构件",
                uri: tilesParts,
                layerWork: pickedObject.primitive._config._layer,
                scenetree: pickedObject.primitive._config.scenetree,
                disableOther: false
            });
        }         
    }



};
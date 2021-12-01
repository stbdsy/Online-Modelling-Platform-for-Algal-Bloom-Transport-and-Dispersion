/* 2017-12-4 08:27:25 | 修改 木遥（QQ：516584683） */
//模块：
mars3d.widget.bindClass(mars3d.widget.BaseWidget.extend({ 
    options: {
        //弹窗
        view: {
            type: "window",
            url: "view.html",
            windowOptions: {
                width: 250,
                height: 300,
                position:{top:120,left:10}
            }
        }
    },
    hasManagerBaseMaps: false, //是否对基础底图做做控制
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

    //数据初始化处理
    _tempIdx: 1,
    arrIdx: [],
    //没有id的图层，进行id赋值处理
    getNextId: function () {
        while (this.arrIdx.indexOf(this._tempIdx) != -1) {
            this._tempIdx++;
        }
        this.arrIdx.push(this._tempIdx);
        return this._tempIdx;
    },
    _layers: null,
    //绑定自定义的非配置图层到图层控制控件中
    addOverlay: function (item) {
        if (!item.name)
            item.name = "未命名";
        if (!item.id)
            item.id = this.getNextId();
        if (!item.pid)
            item.pid = -1;

        //计算层次顺序
        var order = Number(item.order);
        if (isNaN(order))
            order = this._layers.length + 1;
        item.order = order;

        //主键，用于存储取图层用，防止有重复
        item._key = this._layers.length + "_" + item.id + "_" + item.name;

        this._layers.push(item);

        if (this.isActivate && this.viewWindow) {
            this.viewWindow.addNode(item);
        }
    },
    //从图层控制控件中删除指定的图层
    removeLayer: function (name) { 
        for (var i = 0; i < this._layers.length; i++) {
            var item = this._layers[i];

            if (item.name == name) {
                this._layers.splice(i, 1);

                if (this.isActivate && this.viewWindow) {
                    this.viewWindow.removeNode(item);
                }
                break;
            }
        }
    },

    getLayers: function () {
        if (this._layers == null) {
            var layers = [];
            var basemapsCfg = this.hasManagerBaseMaps ? this.viewer.gisdata.config.basemaps : [];
            var operationallayersCfg = this.viewer.gisdata.config.operationallayers;

            //记录所有id，方便计算nextid
            this._tempIdx = 1;
            this.arrIdx = [];
            for (var i = 0; i < basemapsCfg.length; i++) {
                var item = basemapsCfg[i];

                if (item.id)
                    this.arrIdx.push(item.id);
            }
            for (var i = 0; i < operationallayersCfg.length; i++) {
                var item = operationallayersCfg[i];
                if (item.id)
                    this.arrIdx.push(item.id);
            }

            //构建集合，预处理相关数据  
            for (var i = 0; i < basemapsCfg.length; i++) {
                var item = basemapsCfg[i];

                if (!item.name)
                    item.name = "未命名";
                if (!item.id)
                    item.id = this.getNextId();
                if (!item.pid)
                    item.pid = -1;

                layers.push(item);

                if (item.type == "group" && item.layers) {
                    for (var idx = 0; idx < item.layers.length; idx++) {
                        var childitem = item.layers[idx];

                        childitem.pid = item.id;
                        childitem.id = this.getNextId();
                        if (!childitem.name)
                            childitem.name = item.name + '-' + (idx + 1);

                        childitem._parent = item;
                        layers.push(childitem);
                    }
                }
            }

            for (var i = 0; i < operationallayersCfg.length; i++) {
                var item = operationallayersCfg[i];
                if (!item.name)
                    item.name = "未命名";
                if (!item.id)
                    item.id = this.getNextId();
                if (!item.pid)
                    item.pid = -1;

                layers.push(item);

                if (item.type == "group" && item.layers) {
                    for (var idx = 0; idx < item.layers.length; idx++) {
                        var childitem = item.layers[idx];

                        childitem.pid = item.id;
                        childitem.id = this.getNextId();
                        if (!childitem.name)
                            childitem.name = item.name + '-' + (idx + 1);

                        childitem._parent = item;
                        layers.push(childitem);
                    }
                }
            }
            


            //初始化顺序字段,
            for (var i = 0; i < layers.length; i++) {
                var item = layers[i];

                //计算层次顺序
                var order = Number(item.order);
                if (isNaN(order))
                    order = i;//(i + 1) ;
                item.order = order;

                //主键，用于存储取图层用，防止有重复
                item._key = i + "_" + item.id + "_" + item.name;

                //图层的处理
                if (item._layer != null) {
                    this.udpateLayerZIndex(item._layer, order);
                }
            }
            this._layers = layers;
        }
        return this._layers;
    },
    //定位
    centerAt: function (model) {
        model.centerAt();
    },
    getLayerVisible: function (model) {
        return model.getVisible();
    },
    //更新图层:显示隐藏状态
    updateLayerVisible: function (model, visible) {
        model.config.visible = visible; //修改配置中的值
        
        model.setVisible(visible);
        
        if (visible && this.config.autoCenter)
            model.centerAt();

        //更新到分屏对比
        var mapCompare = mars3d.widget.getClass('widgets/mapCompare/widget.js');
        if (mapCompare) {
            mapCompare.updateLayerVisible(model.config, visible);
        } 
    },
    //更新图层:透明度
    udpateLayerOpacity: function (model, opacity) {
        model.setOpacity(opacity);
    },
    //更新图层:顺序
    udpateLayerZIndex: function (model, order) { 
        model.setZIndex(order);
    }
}));

//Cesium 1.50（2018/10/01)版本打开3dtiles可能会出现加载不上导致渲染停止的错误。
//错误说明为：RuntimeError: Unsupported glTF Extension: KHR_technique_webgl
//原因：KHR_technique_webgl扩展新版Cesium已经不支持的缘故，需要升级一下gltf数据，使用KHR_techniques_webgl扩展即可(注意多了一个s)。


//兼容gltf
var fixGltf = function (gltf) {
    if (!gltf.extensionsUsed || !gltf.extensionsUsed.indexOf || !gltf.extensionsRequired) {
        return;
    }

    var v = gltf.extensionsUsed.indexOf('KHR_technique_webgl');
    if (v == -1) return;

    // 中招了。。
    var t = gltf.extensionsRequired.indexOf('KHR_technique_webgl');

    gltf.extensionsRequired.splice(t, 1, 'KHR_techniques_webgl');
    gltf.extensionsUsed.splice(v, 1, 'KHR_techniques_webgl');
    gltf.extensions = gltf.extensions || {};
    gltf.extensions['KHR_techniques_webgl'] = {};
    gltf.extensions['KHR_techniques_webgl'].programs = gltf.programs;
    gltf.extensions['KHR_techniques_webgl'].shaders = gltf.shaders;
    gltf.extensions['KHR_techniques_webgl'].techniques = gltf.techniques;
    var techniques = gltf.extensions['KHR_techniques_webgl'].techniques;

    gltf.materials.forEach(function (mat, index) {
        gltf.materials[index].extensions['KHR_technique_webgl'].values = gltf.materials[index].values;
        gltf.materials[index].extensions['KHR_techniques_webgl'] = gltf.materials[index].extensions['KHR_technique_webgl'];

        var vtxfMaterialExtension = gltf.materials[index].extensions['KHR_techniques_webgl'];

        for (var value in vtxfMaterialExtension.values) {
            var us = techniques[vtxfMaterialExtension.technique].uniforms;
            for (var key in us) {
                if (us[key] === value) {
                    vtxfMaterialExtension.values[key] = vtxfMaterialExtension.values[value];
                    delete vtxfMaterialExtension.values[value];
                    break;
                }
            }
        };
    });

    techniques.forEach(function (t) {
        for (var attribute in t.attributes) {
            var name = t.attributes[attribute];
            t.attributes[attribute] = t.parameters[name];
        };

        for (var uniform in t.uniforms) {
            var name = t.uniforms[uniform];
            t.uniforms[uniform] = t.parameters[name];
        };
    });

}

Object.defineProperties(Cesium.Model.prototype, {
    _cachedGltf: {
        set: function (value) {
            this._vtxf_cachedGltf = value;
            if (Cesium.VERSION > 1.50 && this._vtxf_cachedGltf && this._vtxf_cachedGltf._gltf) {
                fixGltf(this._vtxf_cachedGltf._gltf);
            }
        },
        get: function () {
            return this._vtxf_cachedGltf;
        }
    }
});
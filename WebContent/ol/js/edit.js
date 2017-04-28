ol.edit = function(opt){
	this._map = opt.map;
	ol.edit._layer = opt.layer;
	this._draw = undefined;
	this._select = new ol.interaction.Select();
	this._modify = new ol.interaction.Modify({
		features:this._select.getFeatures()
	});
	this._modify.setActive(false);
	this._modify.on('modifyend',function(e){
		var feature = e.features.getArray()[0];
		var geo = feature.getGeometry();
		feature.unset('geometry');
		feature.setGeometryName('geom');
		feature.setGeometry(geo);
		var exist = array.some(ol.edit._featuresUpdated,function(f){
			var id = f.getId();
			return (f.getId() == feature.getId());
		});
		if(!exist){
			ol.edit._featuresUpdated.push(feature);
		}
	})
	this._map.addInteraction(this._select);
	this._map.addInteraction(this._modify);
	
	ol.edit._featureNS = null;
	ol.edit._featurePrefix = null;
	ol.edit._featureType = null;
	ol.edit._srsName = null;
};
ol.edit._featuresAdded = [];
ol.edit._featuresUpdated = [];
ol.edit._featuresDeleted = [];

ol.edit.prototype.setProperties = function(o){
	ol.edit._featureNS = o.featureNS?o.featureNS:'';
	ol.edit._featurePrefix = o.featurePrefix?o.featurePrefix:'';
	ol.edit._featureType = o.featureType?o.featureType:'';
	ol.edit._srsName = o.srsName?o.srsName:'';
}

ol.edit.prototype.add = function(type){
	this._draw && this._map.removeInteraction(this._draw);
	this._select.setActive(false);
	this._modify.setActive(false);

	var features = ol.edit._featuresAdded = [];
	this._draw = new ol.interaction.Draw({
		type:type,
		source:ol.edit._layer.getSource()
	});
	this._draw.on('drawend',function(e){
		var total = ol.edit._layer.getSource().getFeatures().length;
		var feature = e.feature;
		var geo = feature.getGeometry();
		feature.set('objectid',feature.ol_uid);
		feature.set('mesh','highway');
		feature.set('name_eng','highway');
		feature.set('name_chn','高速路');
		feature.set('name_py','highway');
		feature.set('typename','highway');
		feature.set('type','900');
		feature.set('width',0);
		feature.set('road',0);
		feature.set('shape_leng',0);
		feature.set('shape_le_1',0);
		feature.setGeometryName('geom');
		feature.setGeometry(new ol.geom.MultiLineString([geo.getCoordinates()]));
		feature.unset('geometry');
		features.push(feature);
		this.save('add');
	}.bind(this))
	this._map.addInteraction(this._draw);
}
ol.edit.prototype.update = function(){
	this._draw && this._map.removeInteraction(this._draw);
	this._select.setActive(true);
	this._modify.setActive(true);
	ol.edit._featuresUpdated = this._select.getFeatures().getArray();
	this._modify.on('modifyend',this.save.bind(this));
}
ol.edit.prototype.delFeatures = function(){
	this._draw && this._map.removeInteraction(this._draw);
	this._modify.setActive(false);
	this._select.setActive(true);
	
	var features = this._select.getFeatures().getArray();
	if(features.length<1){
		alert('请选取要删除的要素');
		return;
	}else{
		var conf = confirm('确定要删除选取要素?');
		if(!conf) return;
	}
	ol.edit._featuresDeleted = features;
	this.save('del');
}
ol.edit.prototype.save = function(flag){
	this._modify.setActive(false);
	this._select.setActive(true);
	this._draw && this._draw.setActive(false);
	
	if(!ol.edit._featurePrefix || !ol.edit._featureNS || !ol.edit._featureType){
		return 'save failed';
	}
	flag == 'add' && (ol.edit._featuresUpdated = ol.edit._featuresDeleted = null); 
	flag == 'update' && (ol.edit._featuresAdded = ol.edit._featuresDeleted = null); 
	flag == 'del' && (ol.edit._featuresUpdated = ol.edit._featuresAdded = null); 

	var wfs = new ol.format.WFS({
		gmlFormat:new ol.format.GML3({
			srsName:'EPSG:3857'
		})
	});
	var xml = wfs.writeTransaction(ol.edit._featuresAdded,ol.edit._featuresUpdated,ol.edit._featuresDeleted,{
		featureNS:ol.edit._featureNS,
		featurePrefix:ol.edit._featurePrefix,
		featureType:ol.edit._featureType,
		srsName:ol.edit._srsName
	});
	var featureString = new XMLSerializer().serializeToString(xml);
	var request = new XMLHttpRequest();
	request.onreadystatechange = function(e){
		if (request.readyState==4 && request.status==200){
			var xml = request.responseXML;
			var data = wfs.readTransactionResponse(xml);
			console.log(data);
			var id = data.insertIds[0];
			flag == 'add' && ol.edit._featuresAdded[0].setId(id);
			flag == 'update' && ol.edit._featuresUpdated[0].setId(id);
			flag == 'del' && this.refresh();
		}
	}.bind(this);
    request.open('POST', 'http://localhost:8089/geoserver/wfs?service=wfs');
    request.setRequestHeader('Content-Type', 'text/xml');
    request.send(featureString);
}
ol.edit.prototype.refresh = function(){
	var source = ol.edit._layer.getSource();
	var features = this._select.getFeatures().getArray();
	array.forEach(features,function(feature){
		source.removeFeature(feature);
	});
	this._select.getFeatures().clear();
};

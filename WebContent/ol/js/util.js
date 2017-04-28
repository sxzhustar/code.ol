ol.util = function(opt){};
ol.util.prototype.numFormat = function(x,y){
	return [Number(x),Number(y)];
}
ol.util.prototype.getLayerByKey = function(map,key,val){
	var lyrs = map.getLayers().getArray();
	var target;
	var result = array.some(lyrs,function(lyr){
		var value = lyr[key]?lyr[key]:lyr.get(key);
		if(value == val){
			target = lyr;
			return true
		}else{
			return false;
		}
	});
	return target; 
}
ol.util.prototype.getLayerByUid = function(map,uid){
	var lyrs = map.getLayers().getArray();
	var target;
	var result = array.some(lyrs,function(lyr){
		if(uid == lyr.ol_uid){
			target = lyr;
			return true
		}else{
			return false;
		}
	});
	return target; 
}
ol.util.prototype.fetchLayers = function(map){
	var lyrs = map.getLayers();
	var temp = [];
	var len = lyrs.getLength();
	for(var i=0;i<len;i++){
		var lyr = lyrs.item(i);
		var vector = lyr instanceof ol.layer.Vector;
		if(lyr.name && vector){
			temp.push(lyr);
		}
	}
	return temp;
}
ol.util.prototype.getGraphicLyr = function(){
	var lyr = new ol.layer.Vector({
		source:new ol.source.Vector()
	});
	return lyr;
}
ol.util.prototype.getStyle = function(geoType){
	var stroke = new ol.style.Stroke({
		width:8,
		color:'red'
	});
	var fill = new ol.style.Fill({
		color:'red'
	});
	var style = new ol.style.Style({
		image:new ol.style.Circle({
			radius:4,
			fill:fill
		}),
		stroke:stroke,
		fill:fill
	});
	return style;
}
ol.util = new ol.util();
ol.query = function(option){
	this.map_ = option.map;
}
ol.query.prototype.fetchLayers = function(){
	var mp = this.map_;
	var lyrs = mp.getLayers();
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
ol.query.prototype.fetchFields = function(feature){
	var attr = feature.getProperties();
	var fields = [];
	$.each(attr,function(k,v){
		if(k != 'geometry'){
			fields.push(k);
		}
	});
	return fields;
}
ol.query.prototype.fetchInfo = function(featureRequest,url,callback){
	var features;
	var bodyInfo = new XMLSerializer().serializeToString(featureRequest);
	fetch(url,{
		method:'post',
		body:bodyInfo
	}).then(function(res){
		var json = res.json();
		return json;
	}).then(function(json){
		features = new ol.format.GeoJSON().readFeatures(json);
		callback(features);
	});
}
ol.query.prototype.getFilter = function(expression){
	//gid >= 4 and width < 23 
	var str = $.trim(expression);
	var filter;
	var subFilter = [];
	if(str.indexOf('and')>-1){
		var sqls = str.split(' and ');
		for(var i=0;i<sqls.length;i++){
			var filt = sqls[i];
			var chars = filt.split(' ');
			subFilter.push(this.getFilterInner(chars));
		}
		filter = new ol.format.filter.and(subFilter[0],subFilter[1]);
	}else if(str.indexOf(' or ')>-1){
		var sqls = str.split(' or ');
		for(var i=0;i<sqls.length;i++){
			var filt = sqls[i];
			var chars = filt.split(' ');
			subFilter.push(this.getFilterInner(chars));
		}
		filter = new ol.format.filter.or(subFilter[0],subFilter[1]);
	}else if(str.indexOf('not')>-1){
		var str = str.slice(4);
		filter = new ol.format.filter.not(this.getFilterInner(str.split(' ')));
	}else{
		filter = this.getFilterInner(str.split(' '));
	}
	return filter;
}
ol.query.prototype.getFilterInner = function(arr){
	var opt = arr[1];
	var filter;
	switch (opt) {
	case '>=':
		filter = new ol.format.filter.greaterThanOrEqualTo(arr[0],arr[2]);
		break;
	case '>':
		filter = new ol.format.filter.greaterThan(arr[0],arr[2]);
		break;
	case '<':
		filter = new ol.format.filter.lessThan(arr[0],arr[2]);
		break;
	case '<=':
		filter = new ol.format.filter.lessThanOrEqualTo(arr[0],arr[2]);
		break;
	case '==':
		filter = new ol.format.filter.equalTo(arr[0],arr[2]);
		break;
	case '!=':
		filter = new ol.format.filter.notEqualTo(arr[0],arr[2]);
		break;
	case 'like':
		filter = new ol.format.filter.like(arr[0],arr[2]);
		break;
	case 'isNull':
		filter = new ol.format.filter.isNull(arr[0]);
		break;
	}
	return filter;
}
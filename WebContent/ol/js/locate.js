goog.provide('ol.Locator');
goog.require('ol.Geolocation');

ol.Locator = function(option){
	this.map_ = option.map;
	var graphicLyr = new ol.layer.Vector({
		source:new ol.source.Vector()
	});
	this.graphicLyr = graphicLyr;
	this.map_.addLayer(graphicLyr);
}

ol.Locator.prototype.locate = function(okCall,failCall){
	if(navigator.geolocation){
		navigator.geolocation.getCurrentPosition(okCall,failCall);
	}
}

ol.Locator.prototype.showOnMap = function(point){
	var pos = ol.proj.fromLonLat(point,'EPSG:3857');
	var point = new ol.Feature({
		geometry:new ol.geom.Point(pos)
	});
	var customStyle = function(radius,alpha){
		return new ol.style.Style({
			image:new ol.style.Circle({
				radius:radius,
				fill:new ol.style.Fill({
					color:[255,0,0,alpha]
				})
			})
		})
	} 
	point.setStyle(customStyle(1,0.7));
	this.graphicLyr.getSource().addFeature(point);

	//添加动画效果
	var radius = 1,alpha = 1,then = Date.now(),now,interval;
	function play(){
		//速度控制
		now = Date.now();
		interval = now - then;
		if(interval > 40){
			then = Date.now();
			radius ++;
			alpha -= 0.05;
			if(radius > 20){
				radius = radius % 20;
				alpha = 1;
			}
			point.setStyle(customStyle(radius,alpha));
		}
		requestAnimationFrame(play);
	}
	play();
}
ol.Locator.prototype.clear = function(){
	this.graphicLyr.getSource().clear();
}

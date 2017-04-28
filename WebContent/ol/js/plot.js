ol.plot = function(option) {
	this._map = option.map;
	this._layer = option.layer;
	this._draw = null;
	//文字标注弹窗
	this._overlay = new ol.Overlay({
		element:option.overlayEle,
		positioning:'bottom-center',
		offset:[-54,-90]
	});
	this._overlay.setMap(option.map);
}

ol.plot.prototype.plotShape = function(type) {
	this._draw?this._map.removeInteraction(this._draw):void(0);
	var style = ol.util.getStyle();
	this._draw = this._getDraw(type,style);
	this._draw.on('drawend',function(e){
		e.feature.setStyle(style);
	});
	this._map.addInteraction(this._draw);
}
ol.plot.prototype._getDraw = function(type,style){
	var draw = new ol.interaction.Draw({
		source:this._layer.getSource(),
		type:type,
		style:style?style:null
	});
	return draw;
}
ol.plot.prototype.clear = function(){
	this._map.removeInteraction(this._draw);
}
ol.plot.prototype.plotPic = function(url){
	var style = new ol.style.Style({
		image:new ol.style.Icon({
			src:url
		})
	});
	this._map.removeInteraction(this._draw);
	this._draw = this._getDraw("Point");
	this._draw.on('drawend',function(e){
		e.feature.setStyle(style);
	});
	this._map.addInteraction(this._draw);
}
ol.plot.prototype.popupTxtWin = function(coordinate){
	var ele = this._overlay.getElement();
	var target = ele.getElementsByTagName('textarea')[0];
	var lastCoor = this._overlay.getPosition();

	if(lastCoor && target.value){
		var text = target.value;
		if(!text) return;
		
		var style = new ol.style.Style({
			textAlign:'center',
			offsetY:-12,
			text:new ol.style.Text({
				text:text
			})
		});
		var point = new ol.Feature({
			geometry:new ol.geom.Point(lastCoor)
		});
		point.setStyle(style);
		this._layer.getSource().addFeature(point);
		target.value = '';
	}
	this._overlay.setPosition(coordinate);
}
ol.plot.prototype.hide = function(){
	this._overlay.setPosition(undefined);
}
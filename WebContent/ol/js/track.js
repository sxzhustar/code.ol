/*****轨迹回放******/
var trackTool;
var style = {
	'geoMark':new ol.style.Style({
		image:new ol.style.Circle({
			radius:5,
			fill:new ol.style.Fill({color:'blue'}),
			stroke:new ol.style.Stroke({
				color:'red',
				width:2
			})
		})
	}),
	'point':new ol.style.Style({
		image:new ol.style.Circle({
			radius:5,
			fill:new ol.style.Fill({color:'red'}),
			stroke:new ol.style.Stroke({
				color:'blue',
				width:2
			})
		})
	})
}
$(function(){
	var flag;
	$('#btnSelRoad').click(function(){
		if(!trackTool){
			trackTool = new ol.track({
				map_:map
			});
		}
		if(flag){
			$(this).val('点击选择道路');
			flag = false;
			trackTool.unSelect();
		}else{
			$(this).val('点击取消选择');
			flag = true;
			trackTool.doSelect();
		}
		
	});
	
	$('#btnPlay').click(function(e){
		var coors = trackTool.coors;
		var speed = Number($('#txtSpeed').val());
		var begin = new Date();
		map.on('postcompose',function(t){
			var context = t.vectorContext;
			var now = t.frameState.time;
			
			var stamp = now - begin;
			var index = speed * stamp / 1000;
			index = Math.round(index);
			console.log(index);
			
			if(index >= coors.length) return;
			var currentP = coors[index];
			var curFeature = new ol.Feature(new ol.geom.Point(currentP));
			context.drawFeature(curFeature,style['geoMark']);
			map.render();
		});
		map.render();
	});
});

ol.track = function(opt){
	this.map = opt.map_;
	this.select = new ol.interaction.Select();
	this.dragbox = new ol.interaction.DragBox();
	this.map.addInteraction(this.select);
	this.map.addInteraction(this.dragbox);
	this.map.on('click',function(){
		this.select.getFeatures().clear();
	},this);
}
ol.track.prototype.doSelect = function(){
	if(!this.select){
		this.select = new ol.interaction.Select();
		this.map.addInteraction(this.select);
	}
	if(!this.dragbox){
		this.dragbox = new ol.interaction.Dragbox();
		this.map.addInteraction(this.dragbox);
	}
	var selFeatures = this.select.getFeatures();
	selFeatures.clear();
	var vecLyr;
	var test = this.map.getLayers().forEach(function(el){
		if(el.en_name && el.en_name == 'highway'){
			vecLyr = el;
			return false;
		}
	});
	console.log(test);
	var source = vecLyr.getSource();
	this.dragbox.on('boxend',function(e){
		var extent = this.dragbox.getGeometry().getExtent();
		source.forEachFeatureIntersectingExtent(extent,function(feature){
			selFeatures.push(feature);
		});
		this.formatCoord();
	},this);
	this.select.setActive(true);
	this.dragbox.setActive(true);
}
ol.track.prototype.formatCoord = function(){
	var features = this.select.getFeatures().getArray();
	if(!features || features.length < 1) return;
	
	var line = features[0];
	var geo = line.getGeometry();
	var coors = geo.flatCoordinates;
	var coordinates = [];
	for(var i = 0;i < coors.length;i+=2){
		coordinates.push([coors[i],coors[i+1]]);
	}
	this.coors = coordinates;
	//渲染起点
	var markLyr = new ol.layer.Vector({
		source:new ol.source.Vector({
			features:[new ol.Feature({
				type:'point',
				geometry:new ol.geom.Point(coordinates[0])
			})]
		}),
		style:function(feature){
			return style[feature.get('type')];
		}
	})
	this.map.addLayer(markLyr);
}
ol.track.prototype.unSelect = function(){
	if(this.select){
		this.select.setActive(false);
		this.dragbox.setActive(false);
	}
}
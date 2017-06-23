/*****轨迹回放******/
var trackTool;
var styles = {
	'geoMark':new ol.style.Style({
		image:new ol.style.Icon({
			src:'../img/bike.png'
		})
	}),
	'point':new ol.style.Style({
//		image:new ol.style.Circle({
//			radius:5,
//			fill:new ol.style.Fill({color:'red'}),
//			stroke:new ol.style.Stroke({
//				color:'blue',
//				width:2
//			})
//		})
		image:new ol.style.Icon({
			src:'../img/bike.png'
//			rotation:Math.PI/2
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
		var markStyle = styles['geoMark'];
		console.log(markStyle);
		var preIndx;//上一个点
		map.on('postcompose',function(t){
			var context = t.vectorContext;
			var now = t.frameState.time;
			
			var stamp = now - begin;
			var index = speed * stamp / 1000;
			index = Math.round(index);
			preIndx = preIndx ? preIndx : 0;
			
			if(index >= coors.length) return;
			var currentP = coors[index];//当前点
			var lastP = coors[preIndx];//上一个点
			console.log(currentP);
			console.log(lastP);
			var val = (currentP[0] - lastP[0]) / (currentP[1] - lastP[1]);
			var rotate = Math.atan(val);
			console.log(rotate);
			console.log('==========');

			if(rotate){
				markStyle.getImage().setRotation(rotate);
			}
			preIndx = index;//保存上一个点索引
			
			var curFeature = new ol.Feature(new ol.geom.Point(currentP));
			context.drawFeature(curFeature,markStyle);
			map.render();
		});
		map.render();
	});
});

ol.track = function(opt){
	this.map = opt.map_;
	this.select = new ol.interaction.Select({multi:true});
	this.dragbox = new ol.interaction.DragBox();
	this.map.addInteraction(this.select);
	this.map.addInteraction(this.dragbox);
	this.map.on('click',function(){
		this.select.getFeatures().clear();
	},this);
}
ol.track.prototype.doSelect = function(){
	if(!this.select){
		this.select = new ol.interaction.Select({
			multi:true
		});
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
	console.log(vecLyr);
	var source = vecLyr.getSource();
	this.dragbox.on('boxend',function(e){
		var extent = this.dragbox.getGeometry().getExtent();
		source.forEachFeatureIntersectingExtent(extent,function(feature){
			selFeatures.push(feature);
			console.log(feature);
		});
		this.formatCoord();
	},this);
	this.select.setActive(true);
	this.dragbox.setActive(true);
}
ol.track.prototype.formatCoord = function(){
	var features = this.select.getFeatures().getArray();
	if(!features || features.length < 1) return;
	//选取内的所有线段片段连成一连续线条
	var coordinates = [];
	for(var k = 0;k < features.length;k++){
		var line = features[k];
		var geo = line.getGeometry();
		var coors = geo.flatCoordinates;
		for(var i = 0;i < coors.length;i+=2){
			coordinates.push([coors[i],coors[i+1]]);
		}
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
			return styles[feature.get('type')];
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
/*****全局变量设置**/
var mxExtent;
var center;

function zoom(type){
	var view = map.getView();
	var zoom = view.getZoom();
	switch (type) {
	case 'in':
		zoom += 1;
		break;
	case 'out':
		zoom -= 1;
		break;
	case 'default':
		zoom = 10;
		view.setCenter(ol.proj.fromLonLat([113.37,23.13],'EPSG:3857'))
		break;
	}
	view.setZoom(zoom);
}

function pan(direction){
	var view = map.getView();
	var center = view.getCenter();
	var extent = view.calculateExtent();
	var dx = (extent[2] - extent[0])/3;
	var dy = (extent[3] - extent[1])/3;
	switch (direction) {
	case "left":
		center[0] += dx;
		break;
	case "right":
		center[0] -= dx;
		break;
	case "up":
		center[1] -= dy;
		break;
	case "down":
		center[1] += dy;
		break;
	}
	view.setCenter(center);
	map.render();
}

/**地图初始化*/
function init(){
	var mxExtent = ol.proj.transformExtent([73,18,135,54],'EPSG:4326','EPSG:3857');
	var center = ol.proj.fromLonLat([113.37,23.13],'EPSG:3857');
    var vecSrc = new ol.source.XYZ({
        url:"http://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"
    });
    var imgSrc = new ol.source.XYZ({url:"http://webst01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=6&x=${x}&y=${y}&z=${z}"});
    
    var posCtrl = new ol.control.MousePosition({
    	projection:'EPSG:4326',
    	coordinateFormat:ol.coordinate.createStringXY(3),
    	target:document.getElementById('pos')
    });
    var scale = new ol.control.ScaleLine();
    var zoomSlider = new ol.control.ZoomSlider();
    var overView = new ol.control.OverviewMap({
    	view:new ol.View({projection:'EPSG:3857'})
    });
    var fullScreen = new ol.control.FullScreen();
    var zoomToExt = new ol.control.ZoomToExtent({
    	extent:mxExtent
    });
    var rotate = new ol.control.Rotate();
    
    map = new ol.Map({
    	target:'map',
    	layers:[new ol.layer.Tile({source:vecSrc})],
    	view:new ol.View({
    		projection:'EPSG:3857',
    		center:center,
    		extent:mxExtent,
    		maxZoom:18,
    		minZoom:4,
    		zoom:7
    	}),
    	controls:new ol.control.defaults({
            attributionOptions: {collapsible: false},
            zoom:true
            }).extend([posCtrl,scale,zoomSlider,overView,fullScreen,zoomToExt,rotate])
    });
}

/**图层树加载*/
function loadLyrTree(){
	var myStore = new dojo.store.Memory(cfg.lyrData);
	var myModel = new dijit.tree.ObjectStoreModel({
		store:myStore,
		query:{id:0},
		checkedRoot:true,
		mayHaveChildren:function(item){
			return item.type=="r"?true:false;
		}
	});
	var tree = new dijit.Tree({
		model:myModel,
		id:'lyrTree',
		showRoot:false,
		openOnClick:true,
		onClick:loadLyr
	},'tree');
	tree.startup();
}

/**图层加载*/
function loadLyr(item,node){
	var url = item.url;
	//移除图层
	if(node.lyr){
		map.removeLayer(node.lyr);
		delete node.lyr;
	}else{
		if(item.type == 'n'){
			var lyr = null;
			
//				加载esri的MapServer服务
			if(item.lType == 'esrims'){
				lyr = new ol.layer.Tile({
					source:new ol.source.TileArcGISRest({
						projection:'EPSG:3857',
						url:url
					}),
					name:item.en_name
				});
			}
			
//				加载esri的缓存瓦片服务
			else if(item.lType == 'esrixyz'){
				lyr = new ol.layer.Tile({
					source:new ol.source.XYZ({
						url:url + '/tile/{z}/{y}/{x}'
					}),
					name:item.en_name
				});
			}
			
//				加载esri的WMS服务
			else if(item.lType == 'esriwms'){
				lyr = new ol.layer.Tile({
					source:new ol.source.TileWMS({
						params:{'LAYERS':'0'},
						projection:"EPSG:3857",
						url:url
					}),
					name:item.en_name
				});
			}
			
//				加载esri的WFS服务
			else if(item.lType == 'esriwfs'){
				lyr = new ol.layer.Vector({
					source:new ol.source.Vector({
						strategy:ol.loadingstrategy.bbox,
						url:function(extent){
							return 'https://localhost:6443/arcgis/services/highway/mapserver/wfsserver?'
							+'service=wfs&version=1.1.0&request=getfeature&typename=highway&outputFormat=gml2&'
							+'bbox=' + extent.join(',')
						},
						format:new ol.format.WFS({
							gmlFormat:new ol.format.GML2({
								srsName:'EPSG:3857',
								featureNS:'http://localhost:6080/arcgis/services/highway/MapServer/WFSServer',
								featureType:'highway'
							})
						})
					}),
					style:new ol.style.Style({
						image:new ol.style.Circle({
							radius:2,
							stroke:new ol.style.Stroke({color:'#0B0BED',width:2}),
							fill:ol.style.Fill({color:'#0B0BED'})
						}),
						stroke:new ol.style.Stroke({
							color:'rgba(0,0,255,1)',
							width:2
						}),
						fill:new ol.style.Fill({
							color:'#0B0BED'
						})
					}),
					name:item.en_name
				})
			}
			
//				加载geoserver的WFS服务
			else if(item.lType == 'geowfs'){
				lyr = new ol.layer.Vector({
					source:new ol.source.Vector({
						url:function(extent,resolution,projection){
							extent = ol.proj.transformExtent(extent,'EPSG:3857','EPSG:4326');
							return 'http://localhost:8080/geoserver/test/ows?'
							+'service=wfs&version=1.0.0&request=getfeature&typename=test:'+item.en_name+'&'
							+'srsName=EPSG:4326&outputFormat=application/json&bbox=' + extent.join(',')
						},
						format:new ol.format.GeoJSON(),
						strategy:ol.loadingstrategy.bbox
					}),
					style:new ol.style.Style({
						stroke:new ol.style.Stroke({
							color:'rgba(0,0,255,1.0)',
							width:2
						})
					}),
					name:item.en_name
				})
			}
			
			//加载geoserver的WMS服务
			else if(item.lType == 'geowms'){
				lyr = new ol.layer.Tile({
					source:new ol.source.TileWMS({
						extent:[112,22,114,24],
						params:{
							'LAYERS':'test:' + item.en_name,
							'VERSION':'1.1.0',
//							'BBOX':[113.029319763184,22.7097873687744,113.95068359375,23.7140617370605],
							'CRS':'EPSG:4326'
//							'WIDTH':704,
//							'HEIGHT':768
						},
						projection:"EPSG:4326",
						url:url
					}),
					name:item.en_name
				});
			}
			//加载geoserver的WMTS服务
			else if(item.lType == 'geowmts'){
				var matrixIds = [],resolutions = [];
				var maxExtent = [109.66140013800003,20.22346267200004,117.3041534420001,25.520298004000036];
				var maxResolution = ol.extent.getWidth(maxExtent) / 256;
				for(var i = 0;i <= 3;i++){
//					matrixIds[i] = 'grid_gdxzqh:'+i;
					matrixIds[i] = 'EPSG:4326:'+i;
					resolutions[i] = maxResolution / Math.pow(2,i);
				}
				var tileGrid = new ol.tilegrid.WMTS({
					extent:maxExtent,
					resolutions:resolutions,
					tileSize:[256,256],
					matrixIds:matrixIds
				});
				lyr = new ol.layer.Tile({
					source:new ol.source.WMTS({
						url:url,
						layer:'test:gdxzqh',
						tileGrid:tileGrid,
//						matrixSet:'grid_gdxzqh',
						matrixSet:'EPSG:4326',
						format:'image/png',
						projection:'EPSG:4326'
					}),
					name:item.en_name
				})
			}else if(item.lType = 'vec_tiles'){
				var layerProjection = '4326';
				var source = new ol.source.VectorTile({
					tileGrid:ol.tilegrid.createXYZ({
						maxZoom:22
					}),
					tilePixelRatio:1,
					format:new ol.format.MVT(),
					url:'http://127.0.0.1:8080/geoserver/gwc/service/tms/1.0.0/'
						+ 'test:' + item.en_name + '@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf'
//					format:new ol.format.GeoJSON(),
//					tileUrlFunction: function(tileCoord){
//						console.log(tileCoord);
//		                return 'http://localhost:8080/geoserver/gwc/service/tms/1.0.0/'
//		                +'test:'+item.en_name+'@EPSG:'+layerProjection+'@geojson/'+(tileCoord[0]-1)
//		                + '/'+tileCoord[1] + '/' + (Math.pow(2,tileCoord[0]-1)+tileCoord[2]) + '.geojson';
//
//		            },
				});
				lyr = new ol.layer.VectorTile({
					source:source,
				});
			}
			lyr.name = item.name;
			lyr.en_name = item.en_name;
			lyr.node = node;
			map.addLayer(lyr);
			node.lyr = lyr;
		}
	}
}

function clearFeatures(){
	//临时图层清除
	tmpLyr.getSource().clear();
	//定位图层清除
	locator.clear();
	//标绘图层清除
	plotTool.clear();
}

function locateOk(pos){
	var lbl = "经度：" + pos.longitute + "纬度：" + pos.latitude;
	var lonlat = ol.util.numFormat(pos.longitute,pos.latitude);
	lonlat = ol.proj.fromLonLat(lonlat);
	$("#lblPos").text(lbl);
	locator.showOnMap(lonlat);
}

function locateError(e){
	$("#lblPos").text(e.message);
}

function accordionClick(e){
	if(e.target.innerText == '地图查询'){
		queryMdl = queryMdl?queryMdl:new ol.query({map:map});
		var lyrs = queryMdl.fetchLayers();
		if(lyrs.length<1) return;
		var sel = $("#selLyrs");
		//图层下拉列表
		sel.empty();
		for(var i = 0;i<lyrs.length;i++){
			var lyr = lyrs[i];
			var opt = new Option(lyr.name,lyr.ol_uid);
			sel.append(opt);
		}
		//选中单个图层
		var uid = $("#selLyrs").val();
		var target;
		$.each(map.getLayers().getArray(),function(k,v){
			if(v.ol_uid == uid){
				target = v;
				return false;
			}
		});
		//字段下拉列表
		var lyrName = target.get('name');
		var feature = target.getSource().getFeatureById(lyrName+'.1');
		var fields = queryMdl.fetchFields(feature);
		var selFields = $("#selFields");
		selFields.empty();
		array.forEach(fields,function(item){
			selFields.append(new Option(item,item));
		});
	}else if(e.target.innerText == '地图标注'){
		plotTool = plotTool?plotTool:new ol.plot({
			map:map,
			layer:tmpLyr,
			overlayEle:document.getElementById('popup')
		});
	}else if(e.target.innerText == '地图编辑'){
		var lyrs = ol.util.fetchLayers(map);
		if(lyrs.length<1) return;
		
		var sel = $("#selEditLyrs");
		sel.empty();
		for(var i = 0;i<lyrs.length;i++){
			var lyr = lyrs[i];
			var opt = new Option(lyr.name,lyr.ol_uid);
			sel.append(opt);
		}
		//选中单个图层
		var uid = $("#selEditLyrs").val();
		var target = ol.util.getLayerByUid(map,uid);
		
		if(!editor){
			editor = new ol.edit({
				map:map,
				layer:target
			});
			editor.setProperties({
				featureNS:'http://localhost:8089/geoserver/test',
				featurePrefix:'test',
				featureType:target.get('name'),
				srsName:'EPSG:3857'
			})
		}
	}
}

function lyrChange(){
	var lyr = $("#selLyrs option:selected").text();
	alert(lyr);
}

function query(){
	//获取图层
	var lyrOl_uid = $("#selLyrs").val();
	var layer = ol.util.getLayerByKey(map,'ol_uid',lyrOl_uid);
	//字段名，字段值，图层名
	var fieldName = $("#selFields").val();
	var fieldVal = $("#logicVal").val();
	var featureType = layer.get('name');
	//获取查询条件
	var expression = $("#txt").val();
	var filter = queryMdl.getFilter(expression);
	
	var fRequest = new ol.format.WFS().writeGetFeature({
		featureNS:'http://localhost:8080/geoserver/test',
		featurePrefix:'test',
		featureTypes:[featureType],
		srsName:'EPSG:3857',
		outputFormat:'application/json',
		filter:filter
	});
	var url = 'http://localhost:8080/geoserver/test/wfs';
	queryMdl.fetchInfo(fRequest,url,function(features){
		var source = tmpLyr.getSource();
		//获取样式
		var style = ol.util.getStyle();
		array.forEach(features,function(feature){
			feature.setStyle(style);
		})
		source.addFeatures(features);
		map.getView().fit(source.getExtent());
		});
}

function addLogic(type){
	var area = $("#txt");
	var content = area.val() + type + " ";
	area.val(content);
}

function addLogicOpt(){
	var content = $("#txt").val();
	var str = content + $("#selFields").val() + $("#selLogic").val() + $("#logicVal").val() + " ";
	console.log(str);
	$("#txt").val(str);
}

function plot(index){
	switch (index) {
	case 0:
		plotTool.plotShape('Point');
		break;
	case 1:
		plotTool.plotShape('MultiPoint');
		break;
	case 2:
		plotTool.plotShape('LineString');
		break;
	case 3:
		plotTool.plotShape('MultiLineString');
		break;
	case 4:
		plotTool.plotShape('Polygon');
		break;
	case 5:
		plotTool.plotShape('MultiPolygon');
		break;
	case 6:
		plotTool.plotShape('Circle');
		break;
	}
}

function plotPic(idx){
	url = idx == 0 ? ctx + "/img/flag44.png" : ctx + "/img/balloon44.png";
	plotTool.plotPic(url);
}

function plotTxt(e){
	var coor = e.coordinate;
	plotTool.popupTxtWin(coor);
}

function startPlotTxt(flag){
	if(flag){
		map.un('singleclick',plotTxt)
	}else{
		map.on('singleclick',plotTxt)
	}
}

function overlayClose(){
	plotTool.hide();
}

function Edit(flag){
	var type = 'LineString';
	if(flag == 'add'){
		editor.add(type);
	}else if(flag == 'update'){
		editor.update(type);
	}else if(flag == 'delete'){
		editor.delFeatures();
	}else if(flag == 'save'){
		var msg = editor.save();
		msg && alert(msg);
	}
}
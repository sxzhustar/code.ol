<%@page language="java" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>OpenLayers</title>
<link href="http://localhost:8004/css/ol.css" rel="stylesheet">
<link href="http://localhost:8008/dijit/themes/claro/claro.css" rel="stylesheet">
<style type="text/css">
	html,body,#main{width:100%;height:100%;margin:0}
	a{text-decoration:none;font-size:16px;font-weight:bold;color:#4088FA}
	.claro .dijitContentPane{padding:0px;}
	.ol-mouse-position{right:60px;}
</style>
<script type="text/javascript">
	var ctx = "http://localhost:9000/lightmap/";
	var dojoConfig = {
			isDebug:true,
			async:true,
			packages:['my'],
			path:{business:ctx+'js'}
	}
</script>
<script type="text/javascript" src="jslib/jquery-2.2.3.min.js"></script>
<script src="http://localhost:8004/build/ol-debug.js" type="text/javascript"></script>
<script src="http://localhost:8008/dojo/dojo.js" type="text/javascript"></script>
<!-- 业务处理 -->
<script type="text/javascript" src="js/ol4.js"></script>
<script type="text/javascript" src="js/config.js"></script>
<script type="text/javascript">
	var map;
	require(['dojo/parser','dijit/Tree','dijit/tree/ObjectStoreModel','dojo/store/Memory',
	         'dijit/layout/BorderContainer','dijit/layout/ContentPane','dijit/layout/AccordionContainer',
	         'dojo/domReady!'],function(parser,Tree,ObjectStoreModel,Memory){
		parser.parse();

		loadLyrTree();
		
		function loadLyrTree(){
			var myStore = new dojo.store.Memory(cfg.lyrData);
			var myModel = new ObjectStoreModel({
				store:myStore,
				query:{id:0},
				checkedRoot:true,
				mayHaveChildren:function(item){
					return item.type=="r"?true:false;
				}
			});
			var tree = new Tree({
				model:myModel,
				id:'lyrTree',
				showRoot:false,
				openOnClick:true,
				onClick:loadLyr
			},'tree');
			tree.startup();
		}
		
		function loadLyr(item,node){
			console.log(item);
			var url = item.url;
			//移除图层
			if(node.lyr){
				map.removeLayer(node.lyr);
				delete node.lyr;
			}else{
				if(item.type == 'n'){
					var lyr = null;
					
// 					加载esri的MapServer服务
					if(item.lType == 'esrims'){
						lyr = new ol.layer.Tile({
							source:new ol.source.TileArcGISRest({
								projection:'EPSG:3857',
								url:url
							})
						});
					}
					
// 					加载esri的缓存瓦片服务
					else if(item.lType == 'esrixyz'){
						lyr = new ol.layer.Tile({
							source:new ol.source.XYZ({
								url:url + '/tile/{z}/{y}/{x}'
							})
						});
					}
					
// 					加载esri的WMS服务
					else if(item.lType == 'esriwms'){
						lyr = new ol.layer.Tile({
							source:new ol.source.TileWMS({
								params:{'LAYERS':'0'},
								projection:"EPSG:3857",
								url:url
							})
						});
					}
					
// 					加载esri的WFS服务
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
							})
						})
					}
					
// 					加载geoserver的WFS服务
					else if(item.lType == 'geowfs'){
						lyr = new ol.layer.Vector({
							source:new ol.source.Vector({
								url:function(extent,resolution,projection){
									extent = ol.proj.transformExtent(extent,'EPSG:3857','EPSG:4326');
									return 'http://localhost:8089/geoserver/test/ows?'
									+'service=wfs&version=1.0.0&request=getfeature&typename=test:highway&'
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
							})
						})
					}
					
					//加载geoserver的WMS服务
					else if(item.lType == 'geowms'){
						lyr = new ol.layer.Tile({
							source:new ol.source.TileWMS({
								extent:[112,22,114,24],
								params:{
									'LAYERS':'test:highway',
									'VERSION':'1.1.0',
									'BBOX':[113.029319763184,22.7097873687744,113.95068359375,23.7140617370605],
									'CRS':'EPSG:4326',
									'WIDTH':704,
									'HEIGHT':768
								},
								projection:"EPSG:4326",
								url:url
							})
						});
					}
					
					//加载geoserver的WMTS服务
					else if(item.lType == 'geowmts'){
						var matrixIds = [],resolutions = [];
						var maxExtent = [109.66140013800003,20.22346267200004,117.3041534420001,25.520298004000036];
// 						var maxExtent = ol.proj.get('EPSG:4326').getExtent();
						var maxResolution = ol.extent.getWidth(maxExtent) / 256;
						for(var i = 0;i <= 3;i++){
							matrixIds[i] = 'grid_gdxzqh:'+i;
							resolutions[i] = maxResolution / Math.pow(2,i);
						}
// 						resolutions = [0.0298545050937503,0.0149272525468751,0.0074636262734376,0.0037318131367188];
						console.log(resolutions);
						lyr = new ol.layer.Tile({
							source:new ol.source.WMTS({
								url:url,
								layer:'test:gdxzqh',
								tileGrid:new ol.tilegrid.WMTS({
									extent:maxExtent,
									resolutions:resolutions,
									matrixIds:matrixIds
								}),
								matrixSet:'grid_gdxzqh',
								format:'image/png',
								projection:'EPSG:4326'
							})
						})
					}
					map.addLayer(lyr);
					node.lyr = lyr;
				}
			}
		}
	});
	
/** GaoDe url
    url:'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
});*/
</script>
</head>
<body class='claro' onload='init();'>
	<div data-dojo-type="dijit/layout/BorderContainer" data-dojo-props="design:'headline',gutters:false" id='main'>
		<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'top'"
		 style="height:70px;border-bottom:solid 1px #B7BBB9;background:#CDE6FF">
		 	<div style="text-align:center;color:#5050FB;font:bold 1.5em arial;line-height:70px;">二维基础数据管理平台</div>
		 </div>
		<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'left',splitter:'true'" title='fuck'
		 style="width:300px;border-right:solid 1px #B7BBB9;margin:1;padding:0;">
		 	<div data-dojo-type='dijit/layout/AccordionContainer' style="overflow:hidden;z-index:29;">
		 		<div data-dojo-type='dijit/layout/ContentPane' title='图层管理'>
		 			<div id='tree' style='width:100%;height:100%'></div>
		 		</div>
		 		<div data-dojo-type='dijit/layout/ContentPane' title='地图定位'></div>
		 		<div data-dojo-type='dijit/layout/ContentPane' title='地图查询'></div>
		 		<div data-dojo-type='dijit/layout/ContentPane' title='地图标注'></div>
		 		<div data-dojo-type='dijit/layout/ContentPane' title='空间分析'></div>
		 	</div>
		 </div>
		<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'center'" style="overflow:hidden;">
			<div data-dojo-type="dijit/layout/ContentPane" style="width:100%;height:35px;line-height:35px;">
				<div style="text-align:right;background-color:#F2FBFF">
				<a href="javascript:;" onclick="pan('left');">左移</a>
				<a href="javascript:;" onclick="pan('right');">右移</a>
				<a href="javascript:;" onclick="pan('up');">上移</a>
				<a href="javascript:;" onclick="pan('down');">下移</a>
				<a href="javascript:;" onclick="zoom('in');">放大</a>
		  	 	<a href="javascript:;" onclick="zoom('out');">缩小</a>
				<a href="javascript:;" onclick="zoom('default');">广州</a>
				<a href="javascript:;" onclick="toFullScreen();">全屏</a>
				<a href="javascript:;" onclick="prevView();">前一试图</a>
				<a href="javascript:;" onclick="nextView();">后一试图</a>
				<a href="javascript:;" onclick="mDistance();">测距</a>
				<a href="javascript:;" onclick="mArea();">面积</a>
				</div>
			</div>
			<div data-dojo-type="dijit/layout/ContentPane" id='map' style='width:100%;height:96%'></div>
		</div>
		<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'right'"
		 style="width:3px;"></div>
		<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'bottom',splitter:'true'"
		 style="width:50px;text-align: center;border-top:solid 0.5px #B7BBB9;">版权信息@ZSX-2017/3/6</div>
	</div>
</body>
</html>
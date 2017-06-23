<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<title>Map-Edit</title>
<style type="text/css">
#left {
	width: 200px;
	height: 800px;
	float: left;
	display: block;
}

#map {
	width: 1100px;
	height: 600px;
}

 @font-face {
  font-family: 'iconfont';
  src: url('font/iconfont.eot');
  src: url('font/iconfont.eot?#iefix') format('embedded-opentype'),
  url('font/iconfont.woff') format('woff'),
  url('font/iconfont.ttf') format('truetype'),
  url('font/iconfont.svg#iconfont') format('svg');
} 
.iconfont{
  font-family:"iconfont" !important;
  font-size:16px;font-style:normal;
  -webkit-text-stroke: 0.4px;
  -webkit-font-smoothing: antialiased;
}
ul{list-style: none;border: solid thin;height: 36px;margin: 0px;padding-left:500px;}
li{display:inline-block;line-height: 36px;width:80px;border-left:solid 1px;border-right:solid 1px;}
ul li{cursor:pointer}
#map{background:#FFF;opacity:1;filter: progid:DXImageTransform.Microsoft.Alpha(opacity=0);}
</style>
<script src="../jslib/jquery-2.2.3.min.js" type="text/javascript"></script>
<script src="http://localhost:8000/library/4.3/4.3/init.js"></script>
<link href="http://localhost:8000/library/4.3/4.3/esri/css/main.css" rel="stylesheet">
<link href="http://localhost:8000/library/4.3/4.3/dijit/themes/claro/claro.css" rel="stylesheet">
</head>
<body>
	<div>
		<div style="height: 50px;">空白格</div>
		<ul>
			<li>放大</li>
			<li onclick="reset();">9</li>
			<li onclick="changeCursor();">平移</li>
		</ul>
	</div>
	<div id='left'>
		<p>选择图层：</p>
		<div style='width:100%;height:200px' id='template'></div>
	</div>
	<div id='map'></div>
</body>
<script type="text/javascript">
	var centerPt=[113.244931,23.115074];
	var updateGraphic;
	var attInspector,map;
	
	function changeCursor(){
// 		map.setMapCursor("url(http://localhost:8088/map-edit/img/icon16.ico),crosshair");
		$(".esriMapContainer").css('cursor','url(http://localhost:8088/map-edit/img/icon16.ico),crosshair');
// 		$("#map").hover(function(){
// 			$("this").addClass('hover');
// 			$("#map").css('cursor','url(img/icon16.ico),crosshair');
// 		});
// 		document.getElementById("map").style.cursor="url(img/icon.ico),help";
	}
	function reset(){
		map.setMapCursor('auto');
	}
	require([ "esri/map", "esri/layers/MapImageLayer","esri/layers/FeatureLayer",
// 	        "esri/toolbars/draw", "esri/toolbars/edit", "dojo/_base/event","esri/tasks/GeometryService",
// 	        "dojo/dom-construct","dijit/form/Button","dojo/_base/array",
// 	        "esri/tasks/query","esri/layers/FeatureLayer",
// 			"esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol",
// 			"esri/symbols/SimpleFillSymbol", 
// 			"esri/dijit/editing/TemplatePicker", 
// 			"dojo/_base/array", "esri/geometry/Point", 
// 			"dijit/form/Button", "dojo/_base/lang", "esri/graphic",
// 			"esri/dijit/AttributeInspector",
			"dojo/domReady!" ],function(Map,MapImageLayer,FeatureLayer,Draw,Edit,event,GeometryService,domConstruct,
					Button,arrayUtil){
// 		esriConfig.defaults.io.proxyUrl = "http://localhost:8080/Java/proxy.jsp";
//         esriConfig.defaults.io.alwaysUseProxy= false;
// 		esriConfig.defaults.geometryService = new GeometryService("https://localhost:6443/arcgis/rest/services/Utilities/Geometry/GeometryServer");
		map = new Map("map",{
		    logo:false,
            zoom: 7,
            autoResize:true,
            displayGraphicsOnPan:false,
            slider:false,
            center: centerPt
		  });
		var base = "http://localhost:6080/arcgis/rest/services/%E5%B9%BF%E4%B8%9C%E8%A1%8C%E6%94%BF%E5%8C%BA%E5%88%92/MapServer";
// 		var roads = "https://localhost:6443/arcgis/rest/services/%E5%B9%BF%E5%B7%9E%E5%B8%82%E9%AB%98%E9%80%9F%E8%B7%AF/FeatureServer/0";
        var baseLyr = new MapImageLayer(base,{id:'base0'});
//         var featureLyr = new FeatureLayer(roads,{id:'feaLyr',outFields:'*'});
//         featureLyr.on('click',updateEdit);
        map.addLayers([baseLyr]);
        
        
        //事件绑定
        var editTool,drawTool;
        var selectedTemplate;
//         map.on('load',function(){
//         	//鼠标手势
//         	map.setMapCursor("url(img/hand.ico),auto");
        	
//         	editTool = new Edit(map);
//         	drawTool = new Draw(map);
//         	editTool.on('deactivate',function(e){
//         		featureLyr.applyEdits(null,[e.graphic],null);
//         	});
//         	drawTool.on('draw-end',function(e){
//         		drawTool.deactivate();
//         		var attr = selectedTemplate.template.prototype.attributes;
//         		updateGraphic = new esri.Graphic(e.geometry,null,attr);
//         		featureLyr.applyEdits([updateGraphic],null,null);
//         		map.infoWindow.setContent(attInspector.domNode);
//             	map.infoWindow.resize(350,240);
//         	});
//         });
//         map.on('click',function(e){
//     		editTool.deactivate();
//     	});
//         map.on('layer-add-result',function(e){
//         	var lyr = e.layer;
        	
//         	if(lyr.isEditable()){
//         		var fields = lyr.fields;
//             	var fieldInfos = arrayUtil.map(fields,function(field){
//             		return {
//             			fieldName:field.name,
//             			isEditable:field.editable,
//             			label:field.alias
//             		}
//             	});
//             	var fieldInfos2 = [];
//             	fieldInfos2 = dojo.mixin(fieldInfos2,fieldInfos);
//         		var layerInfos = [{
//         				'featureLayer':featureLyr,
//         				'showAttachments':false,
//         				'isEditable':true,
//         				'fieldInfos':fieldInfos2,
//         				'showDeleteButton':false
//         		}];
//         		initAttributeTemplate(layerInfos);
//         	}
//         })
//         function updateEdit(e){
//         	event.stop(e);
//         	var graphic = e.graphic;
//         	console.log(graphic);
//         	var targetLayer = graphic.getLayer();
//         	var query = new esri.tasks.Query();
//         	query.geometry = graphic.geometry;
// //         	query.distance = 5;
// //         	query.units = "meters";
//         	query.returnGeometry = true;
//         	targetLayer.selectFeatures(query,esri.layers.FeatureLayer.SELECTION_NEW,function(features){
//         		if(features.length>0){
//         			updateGraphic = features[0];
//         			map.infoWindow.setTitle(updateGraphic.getLayer().name);
//         			map.infoWindow.show(e.screenPoint, map.getInfoWindowAnchor(e.screenPoint));
//         			var tool = Edit.EDIT_VERTICES | Edit.MOVE | Edit.SCALE | Edit.ROTATE;
//                 	var opts = {
//                 			allowAddVertices:true,
//                 			allowDeleteVertices:true,
//                 			uniformScaling:true
//                 	}
//                 	editTool.activate(tool,graphic,opts);
//         		}else{
//         			map.infoWindow.hide();
//         		}
//         	});
//         }
        
//         //TemplatePicker
//         var picker = new esri.dijit.editing.TemplatePicker({
// 			featureLayers: [featureLyr],
// 			grouping: true,
// 			rows: "auto",
// 			columns: 3
// 		}, "template");
//         picker.startup();
//         picker.on('selection-change',function(e){
//         	selectedTemplate = picker.getSelected();
// 			if(selectedTemplate){
// 				switch (selectedTemplate.featureLayer.geometryType) {
// 				case "esriGeometryPoint":
// 					drawTool.activate(esri.toolbars.Draw.POINT);
// 		              break;
// 		        case "esriGeometryPolyline":
// 		        	drawTool.activate(esri.toolbars.Draw.POLYLINE);
// 		              break;
// 		        case "esriGeometryPolygon":
// 		        	drawTool.activate(esri.toolbars.Draw.POLYGON);
// 		              break;
// 				}
// 			}
//         });
        
//         //属性框
//         function initAttributeTemplate(alayerInfos){
//         	attInspector = new esri.dijit.AttributeInspector({
//         		layerInfos:alayerInfos
//         	},domConstruct.create('div'));
//         	var saveBtn = new Button({label:"保存","class":"saveButton"},domConstruct.create('div'));
//         	domConstruct.place(saveBtn.domNode,attInspector.deleteBtn.domNode,"after");
//         	saveBtn.on('click',function(){
//         		updateGraphic.getLayer().applyEdits(null,[updateGraphic],null);
//         	});
        	
//         	map.infoWindow.setContent(attInspector.domNode);
//         	map.infoWindow.resize(350,240);
//         }
	});
</script>
</html>
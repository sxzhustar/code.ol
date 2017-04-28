<%@page language="java" pageEncoding="UTF-8" contentType="text/html; charset=UTF-8" %>
<%
	String ctx = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + request.getContextPath();
	request.setAttribute("ctx",ctx); 
%>
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
	#curPos{position:absolute;z-index:2000;border-radius:25px;background:rgba(255,0,0,0.9);transform:scale(0,0);
		animation:myflash 2s;animation-iteration-count:infinite;
	}
	@keyframes myflash{
		from {transform:scale(0.1)}
		to {transform:scale(1);background:rgba(255,0,0,0)}
	}
	.inputControl{width:120px;margin-bottom:5px;}
	.inputControl.txt{width:118px;height:60px;}
	.lbl.left{display:inline-block; width:84px;padding-top:3px;padding-bottom: 3px;}
	.ol-popup{position:absolute;background-color:white;padding:5px;border-radius:5px;
		border:1px solid #cccccc;min-width:120px;min-height:12px;
	}
	.ol-popup:after,.ol-popup:before{top:100%;border:solid transparent;content:'';height:0px;
		width:0;position:absolute;pointer-events:none;
	}
	.ol-popup:before{border-top-color:#cccccc;border-width:21px;left:40%;border-left:0}
	.ol-popup:after{border-top-color:white;border-width:20px;left:40%;border-left:0}
	.ol-popup-closer{text-decoration:none;top:-5px;position:relative;right:-93%;}
	.ol-popup-closer:after{content:"x"}
	.ol-popup-area{width:95%;height:100%;border:1px dashed #cccccc;}
	
</style>
<script type="text/javascript">
	var ctx = "${ctx}";
	var dojoConfig = {
			isDebug:true,
			async:true,
			packages:['my'],
			path:{business:ctx+'js'}
	}
</script>
<script type="text/javascript" src="../jslib/jquery-2.2.3.min.js"></script>
<script src="http://localhost:8004/build/ol-debug.js" type="text/javascript"></script>
<script src="http://localhost:8008/dojo/dojo.js" type="text/javascript"></script>
<!-- 业务处理 -->
<script type="text/javascript" src="js/main.js"></script>
<script type="text/javascript" src="js/util.js"></script>
<script type="text/javascript" src="js/locate.js"></script>
<script type="text/javascript" src="js/query.js"></script>
<script type="text/javascript" src="js/plot.js"></script>
<script type="text/javascript" src="js/edit.js"></script>
<script type="text/javascript" src="js/config.js"></script>
<script type="text/javascript">
$(function(){
	//定位事件
	$("#btnLocate").click(function(){
		locator.locate(locateOk,locateError);
	});
	$("#lonlatLocate").click(function(){
		var lon = $("#lon").val();
		var lat = $("#lat").val();
		locator.showOnMap(ol.util.numFormat(lon,lat));
	});
	$("#lonlatClear").click(function(){
		locator.graphicLyr.getSource().clear();
	});
	$("#drawGeo button").click(function(){
		var index = $(this).index();
		plot(index);
	});
});

	var map,dom,array;
	var locator,queryMdl,tmpLyr,plotTool,editor;
	require(['dojo/parser','dijit/Tree','dijit/tree/ObjectStoreModel','dojo/store/Memory',
	         'dojo/dom-construct','dojo/_base/array',
	         'dijit/layout/BorderContainer','dijit/layout/ContentPane','dijit/layout/AccordionContainer',
	         'dijit/layout/TabContainer','dijit/form/Select','dijit/form/Checkbox',
	         'dojo/domReady!'],function(parser,Tree,ObjectStoreModel,Memory,domCreate,arrayUtil){
		parser.parse();
		init();
		loadLyrTree();
		//赋值全球变量
		dom = domCreate;
		array = arrayUtil;
		tmpLyr = ol.util.getGraphicLyr();
		locator = new ol.Locator({
			map:map
		});
		map.addLayer(tmpLyr);
	});
	
	
/** GaoDe url
    url:'http://webst0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}'
});*/
</script>
</head>
<body class='claro'>
	<div data-dojo-type="dijit/layout/BorderContainer" data-dojo-props="design:'headline',gutters:false" id='main'>
		<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'top'"
		 style="height:70px;border-bottom:solid 1px #B7BBB9;background:#CDE6FF">
		 	<div style="text-align:center;color:#5050FB;font:bold 1.5em arial;line-height:70px;">二维基础数据管理平台</div>
		 </div>
		<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'left',splitter:'true'" title='fuck'
		 style="width:300px;border-right:solid 1px #B7BBB9;margin:1;padding:0;">
		 	<div data-dojo-type='dijit/layout/AccordionContainer' style="overflow:hidden;z-index:29;" onclick="accordionClick(event)">
		 		<div data-dojo-type='dijit/layout/ContentPane' title='图层管理'>
		 			<div id='tree' style='width:100%;height:100%'></div>
		 		</div>
		 		<div data-dojo-type='dijit/layout/ContentPane' title='地图定位'>
		 			<div data-dojo-type="dijit/layout/TabContainer" title="当前位置">
		 				<div data-dojo-type="dijit/layout/ContentPane" id="locateCur" title="当前位置">
		 					<button id='btnLocate'>定位</button><br>
		 					<label id='lblPos'></label>
		 				</div>
		 				<div data-dojo-type="dijit/layout/ContentPane" id="locateLng" title="经纬度">
		 					<div>
		 						经度：<input id='lon' placeholder="小数位两位" required="required" value="113.23"><br>
		 						纬度：<input id='lat' placeholder="小数位两位" required="required" value="22.56"><br>
		 					</div>
		 					<button id='lonlatLocate'>定位</button>&nbsp;
		 					<button id='lonlatClear'>清除</button>&nbsp;
		 				</div>
		 				<div data-dojo-type="dijit/layout/ContentPane" id="locateFlat" title="平面坐标"></div>
		 			</div>
		 		</div>
		 		<div data-dojo-type='dijit/layout/ContentPane' title='地图查询'>
		 			<label class='lbl left'>选择图层：</label>
		 			<select class='inputControl' id='selLyrs' onchange="lyrChange();"></select><br>
		 			<label class='lbl left'>选择字段：</label>
		 			<select class='inputControl' id='selFields'></select><br>
		 			<label class='lbl left'>运算符：</label>
		 			<select class='inputControl' id='selLogic'>
		 				<option label="">
		 				<option label="&gt;=" value=" &gt;= ">
		 				<option label="&gt;" value=" &gt; ">
		 				<option label="==" value=" == ">
		 				<option label="!=" value=" != ">
		 				<option label="&lt;" value=" &lt; ">
		 				<option label="&lt;=" value=" &lt;= ">
		 				<option label="like" value=" like ">
		 				<option label="isNull" value=" isNull ">
		 			</select><br>
		 			<label class='lbl left'>查询值：</label>
		 			<input id="logicVal" class='inputControl'><br>
		 			<label class='lbl left'>逻辑组合：</label>
		 			<textarea id="txt" class='inputControl txt'></textarea><br><br>
		 			<label>添加逻辑操作符：</label><input type='button' value='或' onclick="addLogic('or')">
		 			<input type='button' value='且' onclick="addLogic('and')">
		 			<input type='button' value='非' onclick="addLogic('not')"><br><br>
		 			<input type='button' value='添加条件' onclick="addLogicOpt();">
		 			<input type="button" value="查询" onclick="query();"/>
		 		</div>
		 		<div data-dojo-type='dijit/layout/ContentPane' title='地图标注'>
		 			<div data-dojo-type="dijit/layout/TabContainer">
		 				<div data-dojo-type="dijit/layout/ContentPane" title="图形标绘">
		 					<div id='drawGeo'>
		 						<button>点</button><button>多点</button>
		 						<button>线</button><button>多线</button>
		 						<button>多边形</button><button>多多边形</button>
		 						<button>圆</button>
		 					</div>
		 				</div>
		 				<div data-dojo-type="dijit/layout/ContentPane" title="图片标绘" id='plotPic'>
		 					<div id='flag' data-dojo-type="dijit/form/Checkbox" onChange='plotPic(0);'></div><label for="flag">红旗</label>
		 					<div id='balloon' data-dojo-type="dijit/form/Checkbox"  onChange='plotPic(1);'></div><label for="balloon">气球</label>
		 				</div>
		 				<div data-dojo-type="dijit/layout/ContentPane" title="文字标注">
		 					<div data-dojo-type="dijit/form/Button" onClick="startPlotTxt();">开始标注</div>
		 					<div data-dojo-type="dijit/form/Button" onClick="startPlotTxt('end');">结束标注</div>
		 				</div>
		 			</div>
		 		</div>
		 		<div data-dojo-type="dijit/layout/ContentPane" title="地图编辑">
		 			<select id="selEditLyrs"></select><br>
		 			<div data-dojo-type="dijit/form/Button" onClick="Edit('add');">新建</div>
		 			<div data-dojo-type="dijit/form/Button" onClick="Edit('update');">修改</div>
		 			<div data-dojo-type="dijit/form/Button" onClick="Edit('delete');">删除</div><br>
		 		</div>
		 		<div data-dojo-type='dijit/layout/ContentPane' title='空间分析'></div>
		 	</div>
		 </div>
		<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'center'" style="overflow:hidden;">
			<div data-dojo-type="dijit/layout/ContentPane" style="width:100%;height:35px;line-height:35px;">
				<div style="text-align:right;background-color:#F2FBFF">
				<a href="javascript:;" onclick="clearFeatures();">清除</a>
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
			<div data-dojo-type="dijit/layout/ContentPane" id='map' style='width:100%;height:96%'>
				<div id="curPos"></div>
			</div>
			<div id='popup' class='ol-popup'>
				<a href='#' id='popup-closer' class='ol-popup-closer' onclick='overlayClose();'></a>
				<div class='ol-popup-content'><textarea class="ol-popup-area" onblur="plotText();"></textarea></div>
			</div>
		</div>
		<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'right'"
		 style="width:3px;"></div>
		<div data-dojo-type="dijit/layout/ContentPane" data-dojo-props="region:'bottom',splitter:'true'"
		 style="width:50px;text-align: center;border-top:solid 0.5px #B7BBB9;">版权信息@ZSX-2017/3/6</div>
	</div>
</body>
</html>
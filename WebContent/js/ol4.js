
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
		view.setCenter([113.37,23.13])
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

function init(){
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
    	view:new ol.View({projection:'EPSG:4326'})
    });
    var fullScreen = new ol.control.FullScreen();
    var zoomToExt = new ol.control.ZoomToExtent({
    	extent:[73,18,135,54]
    });
    var rotate = new ol.control.Rotate();
    
    map = new ol.Map({
    	target:'map',
    	layers:[new ol.layer.Tile({source:vecSrc})],
    	view:new ol.View({
    		projection:'EPSG:4326',
    		center:[113.37,23.13],
    		extent:[73,18,135,54],
    		maxZoom:18,
    		minZoom:4,
    		zoom:13
    	}),
    	controls:new ol.control.defaults({
            attributionOptions: {collapsible: false},
            zoom:true
            }).extend([posCtrl,scale,zoomSlider,overView,fullScreen,zoomToExt,rotate])
    });
    
    
}
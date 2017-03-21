var cfg={
		proxyHost:"/wfsOpenLayersProxy?targetURL=",
		lyrData:{
			data:[
			   		{"id":0,"name":"图层树","lType":"ms","type":"r","url":"https://localhost:6443/arcgis/rest/services/GD_WMTS/MapServer"},
			   		{"id":1,"name":"ARCGIS系列","lType":"ms","type":"r","url":"https://localhost:6443/arcgis/rest/services/GD_WMTS/MapServer","parent":0},
			   		{"id":2,"name":"行政区划(MAPSERVER)","lType":"esrims","type":"n","url":"https://localhost:6443/arcgis/rest/services/GD_WMTS/MapServer","parent":1},
			   		{"id":5,"name":"行政区划(CACHE)","lType":"esrixyz","type":"n","url":"https://localhost:6443/arcgis/rest/services/GD_WMTS/MapServer","parent":1},
			   		{"id":6,"name":"行政区划(WMS)","lType":"esriwms","type":"n","url":"https://localhost:6443/arcgis/services/GD_WMTS/MapServer/WMSServer","parent":1},
			   		{"id":3,"name":"高速路(WFS)","lType":"esriwfs","type":"n","url":"https://localhost:6443/arcgis/services/highway/MapServer/WFSServer","parent":1},
			   		{"id":4,"name":"GEOSERVER系列","lType":"fs","type":"r","parent":0},
			   		{"id":7,"name":"高速路(WFS)","lType":"geowfs","type":"n","url":"http://localhost:8089/geoserver/test/ows","parent":4},
			   		{"id":8,"name":"路网(WMS)","lType":"geowms","type":"n","url":"http://localhost:8089/geoserver/test/wms","parent":4},
			   		{"id":9,"name":"路网(WMTS)","lType":"geowmts","type":"n","url":"http://localhost:8089/geoserver/gwc/service/wmts","parent":4}
			   	],
			   	getChildren:function(object){
					return this.query({parent:object.id});
				}
		}
}
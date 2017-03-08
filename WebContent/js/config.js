var cfg={
		lyrData:{
			data:[
			   		{"id":1,"name":"广东交通图","lType":"ms","type":"r","url":"https://localhost:6443/arcgis/rest/services/GD_WMTS/MapServer"},
			   		{"id":2,"name":"行政区划-EsriTileRest","lType":"awmts","type":"n","url":"https://localhost:6443/arcgis/rest/services/GD_WMTS/MapServer","parent":1},
			   		{"id":5,"name":"行政区划-EsriTileXYZ","lType":"axyz","type":"n","url":"https://localhost:6443/arcgis/rest/services/GD_WMTS/MapServer","parent":1},
			   		{"id":3,"name":"高速-ArcGisWMS","lType":"ms","type":"n","url":"https://localhost:6443/arcgis/rest/services/GD_WMTS/MapServer/1","parent":1},
			   		{"id":4,"name":"高速-GSWMS","lType":"fs","type":"r","url":"https://localhost:6443/arcgis/rest/services/GD_WMTS/MapServer/1"},
			   	],
			   	getChildren:function(object){
					return this.query({parent:object.id});
				}
		}
}
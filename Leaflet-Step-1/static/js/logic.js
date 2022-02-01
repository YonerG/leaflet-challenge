// map - tile layers
var defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


// gray layer 
var grayscale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

//terrain layer
var terrain = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 18,
	ext: 'png'
});

//ocean layer

var ocean = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
	maxZoom: 13
});


//create basemaps
let basemaps = {
    Default: defaultMap,
    GrayScale: grayscale,
    Terrain : terrain,
	Ocean: ocean

};

//make a map object 
var myMap = L.map("map", {

    center: [36.7783, -119.4179],
    zoom: 3,
    layers: [defaultMap, grayscale, terrain, ocean]
    
});

// add the default map to the map
defaultMap.addTo(myMap);


// extract tectonic plate data and make maps

let plates = new L.layerGroup();

// retrieve tectonic plate information from api - json
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
	//console log to view data loads
	//console.log(plateData);

	// load data & add tectonic plate layers
	L.geoJson(plateData,{
	// make line visual 
		color:"red", 
		weight: 3
	}).addTo(plates);

});

// add plates to the maps
plates.addTo(myMap);

//variable for earthquake data
let quakes = new L.layerGroup();

//retrieve earthquake data & add to layers
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
	function(earthquakeData){
	// console log to view data loads
	//console.log(earthquakeData);
	// create data markers for the magnitude of the earthquake 
	// and let data marker colors represent the depth
	// color function
	function dataColor(depth){
		//console.log(depth);
		if (depth > 90)
			return "green";
		else if(depth > 70)
			return "#4287f5";
		else if(depth > 50)
			return "yellow";
		else if(depth > 30)
			return "purple";
		else if(depth > 10)
			return "red";
		else
			return "#f542d4"
		
	
	}
		
		
	// data marker size function 

	function markerSize(mag){
		if (mag == 0)
			return 1;
		else 
			return mag* 5;






	}


	// style data markers 
	function style(feature)
	{
		return{
			opacity: .5,
			fillOpacity: .5,
			fillColor: dataColor(feature.geometry.coordinates[2]),					
			radius: markerSize(feature.properties.mag),
			weight: 0.5,
			stroke: true
		}
	}

		 
		// add GeoJson info to earthquake layer

		L.geoJson(earthquakeData, {
			pointToLayer: function(feature, latLng) {
				return L.circleMarker(latLng);
			},
			// set markerstyle
			style: style, 
			//add pop-ups
			// onEachFeature: function(feature, layer){
			// 		layer.bindPopUp('Magnitude: <b>${feature.properties.mag}</b><br>
			// 						Depth: <b>${feature.properties.geometry[2]}</b><br>
			// 						Location: <b>${feature.properties.place}</b></br>');

			// }
			


		}).addTo(quakes);	

					


		}
	
		
);

// add earthquake layer to map
quakes.addTo(myMap);



//adding overlay for the plates and earthquakes

let overLay = {

	TPlates: plates,
	EQData: quakes


};

// add the layer control 
L.control.layers(basemaps,overLay).addTo(myMap);

// add legend to map 

let legend = L.control({
	position: "bottomright"
});

legend.onAdd = function() {
	let div = L.DomUtil.create("div,", "info legend");

	// set up the interval
	let intervals = [-10, 10, 30, 50, 70,90];
	let colors = [
		"yellow",
		"#cafc03",
		"#fcad03",
		"#fc8403",
		"#fc4903",
		"blue"


	];

	//add colors and labels to legend 
	for(var i = 0; i < intervals. length; i++) 
	{
		div.innerHTML += "<i style=background:" 
		 +colors[i]
		 +"></i>"
		 +intervals[i]
		 +(intervals[i +1] ? " &ndash km;" + intervals [i +1] + "km<br>" : "+");
	}
	return div;
legend.addTo(myMap)
}


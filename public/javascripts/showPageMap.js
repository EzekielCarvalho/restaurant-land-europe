
//this is for mapbox map taken from the mapbox API site
mapboxgl.accessToken = mapToken
const map = new mapboxgl.Map({
container: 'cluster-map', // container ID
style: 'mapbox://styles/mapbox/streets-v11', // style URL
center: restaurant.geometry.coordinates, // taking the coordinates from geometry from show.ejs line 111 from restaurant
zoom: 15.5,
pitch: 45,          //this is for adding 3D capability to the map for buildings
bearing: -17.6,
antialias: true
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right'); //THIS IS TO ADD CONTROLS TO THE MAP (LIKE ZOOM)

new mapboxgl.Marker()       //make a marker https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker#setoffset
.setLngLat(restaurant.geometry.coordinates) //set the latitude and longituyde where it should go
.setPopup(          //set a popup on that marker, which is what should happene when the user clicks
    new mapboxgl.Popup({offset: 15})        //here is the popup, it gets made and passes it in
    .setHTML (
        `<h3>${restaurant.title}</h3><p>${restaurant.location}</p>`     //this popup will display the name of hte restaurant and the location
        
        )
)
.addTo(map);        //REFER TO https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker#setoffset FOR VARIOUS FEATURES USED HERE. So this finally the marker is added to the map

map.addControl(                 //this is from mapbox to add a geocoder so that people can search for new locations on the map
new MapboxGeocoder({
accessToken: mapboxgl.accessToken,
mapboxgl: mapboxgl
})
);

map.addControl(new mapboxgl.FullscreenControl());   //This adds a full screen ability to the map so users can make the map full screen

map.on('load', function () {            //THIS IS FOR //this is for adding 3D capability to the map for buildings
    // Insert the layer beneath any symbol layer.
    var layers = map.getStyle().layers;
    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
    labelLayerId = layers[i].id;
    break;
    }
    }
     
    // The 'building' layer in the Mapbox Streets
    // vector tileset contains building height data
    // from OpenStreetMap.
    map.addLayer(
    {
    'id': 'add-3d-buildings',
    'source': 'composite',
    'source-layer': 'building',
    'filter': ['==', 'extrude', 'true'],
    'type': 'fill-extrusion',
    'minzoom': 15,
    'paint': {
    'fill-extrusion-color': '#aaa',
     
    // Use an 'interpolate' expression to
    // add a smooth transition effect to
    // the buildings as the user zooms in.
    'fill-extrusion-height': [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['get', 'height']
    ],
    'fill-extrusion-base': [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['get', 'min_height']
    ],
    'fill-extrusion-opacity': 0.6
    }
    },
     
    labelLayerId
    );
    });

    var distanceContainer = document.getElementById('distance');    /*this is for adding distance measuring ability to the map*/
 
// GeoJSON object to hold our measurement features
var geojson = {
'type': 'FeatureCollection',
'features': []
};
 
// Used to draw a line between points
var linestring = {
'type': 'Feature',
'geometry': {
'type': 'LineString',
'coordinates': []
}
};
 
map.on('load', function () {
map.addSource('geojson', {
'type': 'geojson',
'data': geojson
});
 
// Add styles to the map
map.addLayer({
id: 'measure-points',
type: 'circle',
source: 'geojson',
paint: {
'circle-radius': 5,
'circle-color': '#000'
},
filter: ['in', '$type', 'Point']
});
map.addLayer({
id: 'measure-lines',
type: 'line',
source: 'geojson',
layout: {
'line-cap': 'round',
'line-join': 'round'
},
paint: {
'line-color': '#000',
'line-width': 2.5
},
filter: ['in', '$type', 'LineString']
});
 
map.on('click', function (e) {
var features = map.queryRenderedFeatures(e.point, {
layers: ['measure-points']
});
 
// Remove the linestring from the group
// So we can redraw it based on the points collection
if (geojson.features.length > 1) geojson.features.pop();
 
// Clear the Distance container to populate it with a new value
distanceContainer.innerHTML = '';
 
// If a feature was clicked, remove it from the map
if (features.length) {
var id = features[0].properties.id;
geojson.features = geojson.features.filter(function (point) {
return point.properties.id !== id;
});
} else {
var point = {
'type': 'Feature',
'geometry': {
'type': 'Point',
'coordinates': [e.lngLat.lng, e.lngLat.lat]
},
'properties': {
'id': String(new Date().getTime())
}
};
 
geojson.features.push(point);
}
 
if (geojson.features.length > 1) {
linestring.geometry.coordinates = geojson.features.map(
function (point) {
return point.geometry.coordinates;
}
);
 
geojson.features.push(linestring);
 
// Populate the distanceContainer with total distance
var value = document.createElement('pre');
value.textContent =
'Total distance: ' +
turf.length(linestring).toLocaleString() +
'km';
distanceContainer.appendChild(value);
}
 
map.getSource('geojson').setData(geojson);
});
});
 
map.on('mousemove', function (e) {
var features = map.queryRenderedFeatures(e.point, {
layers: ['measure-points']
});
// UI indicator for clicking/hovering a point on the map
map.getCanvas().style.cursor = features.length
? 'pointer'
: 'crosshair';
});
mapboxgl.accessToken = mapToken;        //sets map token
const map = new mapboxgl.Map({            //creates map
container: 'cluster-map',
style: 'mapbox://styles/mapbox/streets-v11',
center: [9.0000, 53.0000],
zoom: 3
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right'); //THIS IS TO ADD CONTROLS TO THE MAP (LIKE ZOOM)
 
map.on('load', function () {        //map loads here
// Add a new source from our GeoJSON data and
// set the 'cluster' option to true. GL-JS will
// add the point_count property to your source data.
map.addSource('restaurants', {
type: 'geojson',
// Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
// from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
data: restaurants,
cluster: true,
clusterMaxZoom: 14, // Max zoom to cluster points on
clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
});
 
map.addLayer({
id: 'clusters',
type: 'circle',
source: 'restaurants',
filter: ['has', 'point_count'],
paint: {
// Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
// with three steps to implement three types of circles:
//   * Blue, 20px circles when point count is less than 100
//   * Yellow, 30px circles when point count is between 100 and 750
//   * Pink, 40px circles when point count is greater than or equal to 750
'circle-color': [
'step',
['get', 'point_count'],
'yellow',
10,
'#f1f075',
30,
'#f28cb1'
],
'circle-radius': [
'step',
['get', 'point_count'],
15,
10,
20,
30,
25
]
}
});
 
map.addLayer({
id: 'cluster-count',
type: 'symbol',
source: 'restaurants',
filter: ['has', 'point_count'],
layout: {
'text-field': '{point_count_abbreviated}',
'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
'text-size': 12
}
});
 
map.addLayer({
id: 'unclustered-point',
type: 'circle',
source: 'restaurants',
filter: ['!', ['has', 'point_count']],
paint: {
'circle-color': '#11b4da',
'circle-radius': 4,
'circle-stroke-width': 1,
'circle-stroke-color': '#fff'
}
});
 
// inspect a cluster on click
map.on('click', 'clusters', function (e) {      //when you click on a cluster
const features = map.queryRenderedFeatures(e.point, {
layers: ['clusters']
});
const clusterId = features[0].properties.cluster_id;
map.getSource('restaurants').getClusterExpansionZoom(
clusterId,
function (err, zoom) {
if (err) return;
 
map.easeTo({
center: features[0].geometry.coordinates,
zoom: zoom
});
}
);
});
 
// When a click event occurs on a feature in
// the unclustered-point layer, open a popup at
// the location of the feature, with
// description HTML from its properties.
map.on('click', 'unclustered-point', function (e) {     //when you click on an unclustered point
    const {popUpMarkup} = e.features[0].properties;  //this removes or destructures popUpMarkup from whats given after the equal sign. refer to line 61 restaurantspecs.js. This is related to the new virtual set up to show pop ups when a cluster is clicked on a cluster map
    const coordinates = e.features[0].geometry.coordinates.slice();

 
// Ensure that if the map is zoomed out such that
// multiple copies of the feature are visible, the
// popup appears over the copy being pointed to.
while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
}
 
new mapboxgl.Popup()
.setLngLat(coordinates)
.setHTML(popUpMarkup)     //line 104 ref. This is connected to line 104 in this file. we're trying to make an entry here that will automatically display data on the popup. This is a virtual. in mapbox data entering has to follow a pattern. Each object has to have properties and geometry. Look here https://docs.mapbox.com/help/getting-started/creating-data/
.addTo(map);
});
 
map.on('mouseenter', 'clusters', function () {      //when your mouse enters a cluster
map.getCanvas().style.cursor = 'pointer';
});
map.on('mouseleave', 'clusters', function () {      //when your mouse leaves a cluster
map.getCanvas().style.cursor = '';
});
});
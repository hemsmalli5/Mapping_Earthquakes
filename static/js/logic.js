console.log("working");

// Create the tile layer for map backgroud
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attibution: 'Map data',
    maxZoom: 18,
    accessToken: API_KEY
});

// Second tile layer background
let satellitesStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attibution: 'Map data',
    maxZoom: 18,
    accessToken: API_KEY
});

// Third tile layer background
let light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attibution: 'Map data',
    maxZoom: 18,
    accessToken: API_KEY
});

let map = L.map('mapid', {
    center: [40.7, -94.5],
    zoom: 3,
    layers:[streets]
});

let baseMaps = {
    "Streets": streets,
    "Satellite": satellitesStreets,
    Light: light
};

let allEarthquakes = new L.layerGroup();
let largeEarthquakes = new L.LayerGroup();
let tectonicplates = new L.LayerGroup();

let overlays = {
    "Tectonic Plates": tectonicplates,
    "Earthquakes": allEarthquakes
};

L.control.layers(baseMaps, overlays).addTo(map);

// Retrieve earthquake data 
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
    //function return style for each plot
    function styleInfo(feature){
        return{
            opacity:1,
            fillOpacity:1,
            fillColor: getColor(feature.properties.mag),
            color:"#000000",
            radius: getRadius(feature.properties.mag),
            stroke: true,
            weight:0.5
        };
    }

    function getColor(magnitude){
        if (magnitude > 5){
            return "#ea2c2c";
        }
        if (magnitude > 4){
            return "#ea822c";
        }
        if (magnitude > 3){
            return "#ee9c0";
        }
        if (magnitude > 2){
            return "#eecc00";
        }
        if (magnitude > 1){
            return "#d4ee00";
        }
        return "#98eee0";

    }



    // Determine the radius of earthquake 
    // Earthquake with a magnitude of 0 being plotted with wrong radius
    function getRadius(magnitude){
        if (magnitude === 0) {
            return 1
        }
        return magnitude * 4;
    }
    // Creating a GeoJSON layer with the retrieved data.
    L.geoJson(data, {
        // We turn each feature into a circleMarker on the map.
        pointToLayer: function(feature, latlng) {
            console.log(data);
            return L.circleMarker(latlng);
            },
        // We set the style for each circleMarker using our styleInfo function.
        style: styleInfo,
        // We create a popup for each circleMarker to display the magnitude and
        //  location of the earthquake after the marker has been created and styled.
        onEachFeature: function(feature, layer) {
        layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
        }
        }).addTo(allEarthquakes);


    allEarthquakes.addTo(map)

    let legend = L.control({
        position: "bottomright"
    })

    legend.onAdd = function(){
        let div = L.DomUtil.create('div', 'info legend');
        const magnitudes = [0,1,2,3,4,5]
        const colors = [
            "#98eee0", 
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
           
        ]

        for(var i=0; i<magnitudes.length; i++){
            console.log(colors[i])
            div.innerHTML += `<i style='background:${colors[i]}'></i>` + magnitudes[i] + (magnitudes[i + 1] ? "&dash;" + magnitudes[i + 1] + "<br>":"+")
        }
        return div;
    }
    legend.addTo(map)

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData) {
        L.geoJson(plateData, {
            color:"#ff6500",
            weight: 2
        }).addTo(tectonicplates)

        tectonicplates.addTo(map)
    })

    

})
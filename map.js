displayMap2()

function rawUrlToApi(url) {
  const title = url.match(/title=(Data:[^&]+)/)?.[1];
  return title
    ? `https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${encodeURIComponent(title)}&origin=*`
    : null;
}


// async function displayMap() {

//   try {
//     const geoJson = await getData('91')
//   } catch (err) {
//     console.error(err);
//     return null;
//   }
  
//   const map = L.map('map').setView([46.2276, 2.2137], 5);


//   L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=JTzkfuUq9eMmI89PCDrP ', {
//       attribution: '<a href="http://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
//   }).addTo(map);

//   // L.geoJSON(geoJson).addTo(map)
//   displayMap2(map)
// }






async function displayMap2(){
  const map = L.map('map').setView([46.2276, 2.2137], 5);

  L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=JTzkfuUq9eMmI89PCDrP ', {
    attribution: '<a href="http://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
  }).addTo(map);
  
  try {
    let tab_dep = await getCode();

    // Fetch all GeoJSONs in parallel
    let geoJsonPromises = tab_dep.map(dep => getData(dep));
    let allGeoJson = await Promise.all(geoJsonPromises);

    // Add all GeoJSON layers efficiently
    let geoGroup = L.layerGroup();
    allGeoJson.forEach(geoJson => {
      L.geoJSON(geoJson, {
        style: function(feature) {
          // Random color
          let colors = ['yellow', 'blue', 'green', 'purple', 'gray', 'crimson'];
          return {
            color: colors[Math.floor(Math.random() * colors.length)],
            weight: 2,
            fillOpacity: 0.2
          };
        }
      }).addTo(geoGroup);
    });
    geoGroup.addTo(map);

  } catch (err) {
    console.error(err);
    return null;
  }  
}





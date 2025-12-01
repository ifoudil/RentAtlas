displayMap()

function rawUrlToApi(url) {
  const title = url.match(/title=(Data:[^&]+)/)?.[1];
  return title
    ? `https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${encodeURIComponent(title)}&origin=*`
    : null;
}


async function displayMap() {

  try {
    var geoJson = await getData('91')
  } catch (err) {
    console.error(err);
    return null;
  }
  
  var map = L.map('map').setView([46.2276, 2.2137], 5);


  L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=JTzkfuUq9eMmI89PCDrP ', {
      attribution: '<a href="http://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
  }).addTo(map);

  L.geoJSON(geoJson).addTo(map)
  displayMap2(map)
}






async function displayMap2(map){

  console.log("displayMap2")

  tab_dep = await getCode()
  console.log("tableau_departement :")
  console.log(tab_dep)

  for (let i = 0; i < tab_dep.length ; i++) {
    console.log(tab_dep[i])
    try {
      var geoJson = await getData(tab_dep[i])

      L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=JTzkfuUq9eMmI89PCDrP ', {
        attribution: '<a href="http://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
      }).addTo(map);
  
      L.geoJSON(geoJson).addTo(map)
    } catch (err) {
      console.error(err);
      return null;
    }
  
  }
  
}





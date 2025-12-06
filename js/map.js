displayMap()

// affiche la map
async function displayMap(){

  const map = L.map('map').setView([46.2276, 2.2137], 5);

  L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=JTzkfuUq9eMmI89PCDrP ', {
    attribution: '<a href="http://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
  }).addTo(map);
  
  try {
    let tab_dep = await getCode();
    
    let geoJsonPromises = tab_dep.map(dep => getData(dep));
    let allGeoJson = await Promise.all(geoJsonPromises);

    let deptNamePromises = tab_dep.map(code => getDepartmentName(code));
    let allDeptNames = await Promise.all(deptNamePromises);

    let geoGroup = L.layerGroup();

    allGeoJson.forEach((geoJson, index) => {
        
        const codeDep = tab_dep[index];
        const deptName = allDeptNames[index] || `Département ${codeDep}`; 

        if (!geoJson) {
            console.warn(`Skipping GeoJSON for code ${codeDep} as it returned null.`);
            return;
        }

        L.geoJSON(geoJson, {
            style: function(feature) {
                let colors = ['yellow', 'blue', 'green', 'purple', 'gray', 'crimson'];
                return {
                    color: colors[Math.floor(Math.random() * colors.length)],
                    weight: 2,
                    fillOpacity: 0.2
                };
            },

            onEachFeature: function(feature, layer) {
                layer.on({
                    click: async function(e) {
                        layer.bindPopup(
                            `Chargement des données pour: <b>${deptName} (${codeDep})</b>`
                        ).openPopup();

                        try {
                            const rentData = await getRentData(codeDep);

                            localStorage.setItem('currentDeptName', deptName);
                            localStorage.setItem('currentRentData', JSON.stringify(rentData));
                            localStorage.setItem('currentCodeDep', codeDep);
                            
                            window.location.href = 'analysis.html';

                            layer.getPopup().setContent(`Statistiques chargées pour: <b>${deptName}</b>. Ouvrir la nouvelle page.`);

                        } catch (error) {
                            console.error(`Error loading rent data for ${codeDep}:`, error);
                            layer.getPopup().setContent(`Erreur de chargement des données pour: <b>${deptName}</b>.`);
                        }
                    }
                });
            }

        }).addTo(geoGroup);
    });

    geoGroup.addTo(map);


  } catch (err) {
    console.error(err);
    return null;
  }   
}

// retourne le nom du département
async function getDepartmentName(codeDep) {
    const endpoint = 'http://localhost:7200/repositories/loyer';

    let query = 
    `PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>
     SELECT DISTINCT ?nom
     WHERE {
       ?dept rcw:codeDep "${codeDep}" ;
             rcw:nomDept ?nom .
     }`;
    
    let url = endpoint + '?query=' + encodeURIComponent(query) + '&output=json'; 
    
    try {
        const response = await fetch(url, { headers: { 'Accept': 'application/sparql-results+json' } });
        const json = await response.json();
        
        const bindings = json.results.bindings;
        
        if (bindings.length > 0 && bindings[0].nom) {
            return bindings[0].nom.value;
        }

        return null; 
  
    } catch (err) {
        console.error("Erreur dans getDepartmentName:", err);
        return null; 
    }
}
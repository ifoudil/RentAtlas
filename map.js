// map.js

// ⚠️ ASSUMPTION: getCode() est dans allDepartements.js
// ⚠️ ASSUMPTION: getData() est dans fetchMap.js
// ⚠️ ASSUMPTION: getRentData() et updateChart() sont dans loyer.js (sans 'export')

displayMap()

// NOTE: La fonction rawUrlToApi est présumée exister ici.
// ...

async function displayMap(){

  const map = L.map('map').setView([46.2276, 2.2137], 5);

  L.tileLayer('https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=JTzkfuUq9eMmI89PCDrP ', {
    attribution: '<a href="http://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
  }).addTo(map);
  
  try {
    let tab_dep = await getCode(); // Codes des départements
    
    // 1. Fetch all GeoJSONs in parallel
    let geoJsonPromises = tab_dep.map(dep => getData(dep));
    let allGeoJson = await Promise.all(geoJsonPromises);

    // 2. Fetch all department names in parallel (Doit se faire AVANT le forEach)
    let deptNamePromises = tab_dep.map(code => getDepartmentName(code));
    let allDeptNames = await Promise.all(deptNamePromises);

    // Add all GeoJSON layers efficiently
    let geoGroup = L.layerGroup();

    allGeoJson.forEach((geoJson, index) => {
        
        const codeDep = tab_dep[index];
        // Utilise le nom récupéré, ou un nom par défaut
        const deptName = allDeptNames[index] || `Département ${codeDep}`; 

        if (!geoJson) {
            console.warn(`Skipping GeoJSON for code ${codeDep} as it returned null.`);
            return;
        }

        L.geoJSON(geoJson, {
            style: function(feature) {
                // Random color
                let colors = ['yellow', 'blue', 'green', 'purple', 'gray', 'crimson'];
                return {
                    color: colors[Math.floor(Math.random() * colors.length)],
                    weight: 2,
                    fillOpacity: 0.2
                };
            },

            // LOGIQUE DE CLIC MISE À JOUR CORRECTE
            onEachFeature: function(feature, layer) {
                layer.on({
                    click: async function(e) {
                        // 1. Afficher un popup temporaire pour le chargement
                        layer.bindPopup(
                            `Chargement des données pour: <b>${deptName} (${codeDep})</b>`
                        ).openPopup();

                        // 2. Récupérer les données de loyer (Fonction de loyer.js)
                        console.log(`Fetching rent data for department code: ${codeDep}`);
                        try {
                            const rentData = await getRentData(codeDep);
                            
                            // 3. --- NOUVELLE LOGIQUE POUR OUVRIR LA PAGE ---

                            // Stocker les données nécessaires dans localStorage
                            // JSON.stringify est nécessaire car localStorage ne stocke que des chaînes
                            localStorage.setItem('currentDeptName', deptName);
                            localStorage.setItem('currentRentData', JSON.stringify(rentData));
                            localStorage.setItem('currentCodeDep', codeDep);
                            
                            // Ouvrir la nouvelle page dans un nouvel onglet
                            window.open('analysis.html', '_blank');

                            // Mettre à jour le popup après le chargement
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

/**
 * Fonction auxiliaire pour récupérer le nom du département
 * ⚠️ CORRECTION CRITIQUE de la lecture des résultats SPARQL ⚠️
 */
async function getDepartmentName(codeDep) {
    // NOTE: J'utilise 'endpoint' ici, il doit être défini dans un script global 
    // ou être le même que celui utilisé dans loyer.js
    const endpoint = 'http://localhost:7200/repositories/loyer'; // Redéfini pour la clarté

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
        
        // LECTURE CORRECTE du résultat SPARQL
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

// ⚠️ RETIREZ TOUT LE CODE SUIVANT DE map.js ! ⚠️
// Il appartient à loyer.js
/*
const endpoint = 'http://localhost:7200/repositories/loyer';
async function getRentData(codeDep) { ... }
function updateChart(deptName, data) { ... }
*/
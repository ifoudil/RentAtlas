const RENT_ENDPOINT = 'http://localhost:7200/repositories/loyer';

let chartInstances = {
    minChart: null,
    moyChart: null,
    maxChart: null
};

// retourne les données sur le loyer pour un département
async function getRentData(codeDep) {
    const years = ['2018', '2022', '2023', '2024'];
    const types = ['Appart', 'Maison'];
    const results = [];
    
    for (const year of years) {
        for (const type of types) {
            
            const moyProp = `rcw:loyer${type}${year}`;
            const minProp = `rcw:loyerMin${type}${year}`;
            const maxProp = `rcw:loyerMax${type}${year}`;
            
            const query = 
            `PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>
             SELECT 
                 (AVG(xsd:float(?moy)) AS ?avgMoy)
                 (AVG(xsd:float(?min)) AS ?avgMin) 
                 (AVG(xsd:float(?max)) AS ?avgMax)
             WHERE {
                 ?dept rcw:codeDep "${codeDep}" ;
                       rcw:comprend ?commune .
                 ?commune ${moyProp} ?moy ;
                          ${minProp} ?min ;
                          ${maxProp} ?max .
                 
             }`;

            const url = RENT_ENDPOINT + '?query=' + encodeURIComponent(query) + '&output=json';

            try {
                const response = await fetch(url, { headers: { 'Accept': 'application/sparql-results+json' } });
                const json = await response.json();
                
                if (json.results.bindings.length > 0) {
                    const binding = json.results.bindings[0];

                    if (binding.avgMoy && binding.avgMin && binding.avgMax) {
                        results.push({
                            annee: parseInt(year),
                            type: type === 'Appart' ? 'Appartement' : 'Maison',
                            min: parseFloat(binding.avgMin.value), 
                            moy: parseFloat(binding.avgMoy.value),
                            max: parseFloat(binding.avgMax.value)
                        });
                    }
                }
            } catch (err) {
                console.warn(`Erreur récupération ${type} ${year}:`, err);
            }
        }
    }
    return results;
}

// affiche les données sur le graphique pour le département
function updateChart(deptName, data) {
    const titleEl = document.getElementById('dept-title');
    if(titleEl) titleEl.innerText = deptName;

    const years = [...new Set(data.map(d => d.annee))].sort((a, b) => a - b);

    displayMinGraph(data, years);
    displayMoyGraph(data, years);
    displayMaxGraph(data, years);
}

// affiche le graphique sur le loyer minimum
function displayMinGraph(data, years) {
    const config = {
        canvasId: 'minChart',
        title: 'Moyenne des Loyers MINIMUM (€/m²)',
        dataKey: 'min',
        colors: {
            appart: 'rgba(54, 162, 235, 1)', // Bleu
            maison: 'rgba(255, 99, 132, 1)'  // Rouge
        }
    };
    buildChart(config, data, years);
}

// affiche le graphique sur le loyer moyen
function displayMoyGraph(data, years) {
    const config = {
        canvasId: 'moyChart',
        title: 'Moyenne des Loyers MOYENS (€/m²)',
        dataKey: 'moy',
        colors: {
            appart: 'rgba(75, 192, 192, 1)', // Turquoise
            maison: 'rgba(255, 159, 64, 1)'  // Orange
        }
    };
    buildChart(config, data, years);
}

// affiche le graphique sur le loyer maximum
function displayMaxGraph(data, years) {
    const config = {
        canvasId: 'maxChart',
        title: 'Moyenne des Loyers MAXIMUM (€/m²)',
        dataKey: 'max',
        colors: {
            appart: 'rgba(54, 162, 235, 1)', // Bleu
            maison: 'rgba(255, 99, 132, 1)'  // Rouge
        }
    };
    buildChart(config, data, years);
}

// construit le graphique
function buildChart(config, fullData, years) {
    const ctx = document.getElementById(config.canvasId);
    if (!ctx) return;

    if (chartInstances[config.canvasId]) {
        chartInstances[config.canvasId].destroy();
    }

    const dataAppart = years.map(y => {
        const item = fullData.find(d => d.annee === y && d.type === 'Appartement');
        return item ? item[config.dataKey] : null;
    });

    const dataMaison = years.map(y => {
        const item = fullData.find(d => d.annee === y && d.type === 'Maison');
        return item ? item[config.dataKey] : null;
    });

    chartInstances[config.canvasId] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Appartement',
                    data: dataAppart,
                    borderColor: config.colors.appart,
                    backgroundColor: config.colors.appart.replace('1)', '0.2)'),
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Maison',
                    data: dataMaison,
                    borderColor: config.colors.maison,
                    backgroundColor: config.colors.maison.replace('1)', '0.2)'),
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: { display: true, text: config.title, font: { size: 16 } },
                tooltip: { mode: 'index', intersect: false }
            },
            scales: {
                y: { beginAtZero: false, title: { display: true, text: 'Prix €/m²' } }
            }
        }
    });
}
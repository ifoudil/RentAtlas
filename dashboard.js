/* -------------------------------------------------------------------------- */
/*  6. LOADER + LANCEMENT                                                     */
/* -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", async () => {

    document.getElementById("loader").style.display = "block";

    await Promise.all([
        initMoyenneNationaleChart(),
        //initMedianeNationaleChart()
    ]);

    document.getElementById("loader").style.display = "none";

});

const RENT_ENDPOINT = 'http://localhost:7200/repositories/loyer';
const YEARS = ['2018', '2022', '2023', '2024'];
const TYPES = ['Appart', 'Maison'];

let chartInstances = {
    moyenneNationaleChart: null,
    medianeNationaleChart: null
};

/* -------------------------------------------------------------------------- */
/*  1. UTILITAIRES                                                            */
/* -------------------------------------------------------------------------- */

function calculateMedian(values) {
    if (!values.length) return 0;
    values = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0
        ? values[mid]
        : (values[mid - 1] + values[mid]) / 2;
}

async function runSPARQL(query) {
    const url = `${RENT_ENDPOINT}?query=${encodeURIComponent(query)}&output=json`;
    const response = await fetch(url, { headers: { Accept: "application/sparql-results+json" } });
    return response.json();
}

/* -------------------------------------------------------------------------- */
/*  2. RÉCUPÉRATION DES MOYENNES                                              */
/* -------------------------------------------------------------------------- */

async function getRentDataFrance() {
    const promises = [];

    for (const year of YEARS) {
        for (const type of TYPES) {
            const Q = `
                PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>
                PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

                SELECT (AVG(xsd:float(?moy)) AS ?avgMoy)
                WHERE {
                    ?dept rcw:comprend ?commune .
                    ?commune 
                        rcw:loyer${type}${year} ?moy .
                }
            `;

            promises.push(
                runSPARQL(Q).then(json => ({
                    year,
                    type: type === "Appart" ? "Appartement" : "Maison",
                    avgMoy: parseFloat(json.results.bindings[0].avgMoy.value)
                }))
            );
        }
    }

    return Promise.all(promises);
}

/* -------------------------------------------------------------------------- */
/*  3. RÉCUPÉRATION DES MÉDIANES                                              */
/* -------------------------------------------------------------------------- */

async function getMedianRentFrance() {
    const promises = [];

    for (const year of YEARS) {
        for (const type of TYPES) {
            const Q = `
                PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>
                SELECT ?loyer WHERE {
                    ?dept rcw:comprend ?commune .
                    ?commune rcw:loyer${type}${year} ?loyer .
                }
            `;

            promises.push(
                runSPARQL(Q).then(json => {
                    const rents = json.results.bindings
                        .map(b => parseFloat(b.loyer.value))
                        .filter(v => !isNaN(v));
                    return {
                        year,
                        type: type === "Appart" ? "Appartement" : "Maison",
                        median: calculateMedian(rents)
                    };
                })
            );
        }
    }

    return Promise.all(promises);
}

/* -------------------------------------------------------------------------- */
/*  4. GRAPHIQUES                                                             */
/* -------------------------------------------------------------------------- */

function createLineChart(config, fullData, years) {
    const ctx = document.getElementById(config.canvasId);
    if (!ctx) return;

    if (chartInstances[config.canvasId]) {
        chartInstances[config.canvasId].destroy();
    }

    const dataAppart = years.map(y => {
        const item = fullData.find(d => d.year === y && d.type === 'Appartement');
        console.log(item)
        return item ? item[config.dataKey] : null;
    });
    console.log(dataAppart)
    const dataMaison = years.map(y => {
        const item = fullData.find(d => d.year === y && d.type === 'Maison');
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

/* -------------------------------------------------------------------------- */
/*  5. INITIALISATION DES DEUX GRAPHES                                        */
/* -------------------------------------------------------------------------- */

async function initMoyenneNationaleChart() {
    const data = await getRentDataFrance();

    let test = JSON.stringify(data)
    const rentData = JSON.parse(test);
    console.log(rentData)

    const config = {
        canvasId: 'moyenneNationaleChart',
        title: 'Moyenne des Loyers MOYEN (€/m²)',
        dataKey: 'avgMoy',
        colors: {
            appart: 'rgba(54, 162, 235, 1)', // Bleu
            maison: 'rgba(255, 99, 132, 1)'  // Rouge
        }
    };
    
    const years = [...new Set(rentData.map(d => d.year))].sort((a, b) => a - b);
    createLineChart(config, rentData, years)
}

async function initMedianeNationaleChart() {
    const data = await getMedianRentFrance();

    const labels = YEARS;

    const maison = data.filter(d => d.type === "Maison").map(d => d.median);
    const appart = data.filter(d => d.type === "Appartement").map(d => d.median);

    createLineChart("medianeNationaleChart", labels, [
        {
            label: "Maison Médiane (€/m²)",
            data: maison,
            borderColor: "rgb(75,192,192)",
            backgroundColor: "rgba(75, 192, 192, 0.2)", // Fond sous la courbe pour Maison
            fill: true
        },
        {
            label: "Appartement Médian (€/m²)",
            data: appart,
            borderColor: "rgb(153,102,255)",
            backgroundColor: "rgba(153, 102, 255, 0.2)", // Fond sous la courbe pour Appartement
            fill: true
        }
    ], "Loyer Médian (€/m²)");
}

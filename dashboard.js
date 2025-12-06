/* -------------------------------------------------------------------------- */
/*  6. LOADER + LANCEMENT                                                     */
/* -------------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", async () => {

    document.getElementById("loader").style.display = "block";

    await Promise.all([
        initMoyenneNationaleChart(),
        initMedianeNationaleChart()
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

function createLineChart(canvasId, labels, datasets, yTitle) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    if (chartInstances[canvasId]) {
        chartInstances[canvasId].destroy();
    }

    chartInstances[canvasId] = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
            responsive: true,
            scales: {
                y: {
                    title: { display: true, text: yTitle }
                },
                x: {
                    title: { display: true, text: "Année" }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,   // Activer l'affichage des tooltips
                    mode: 'nearest', // Afficher le tooltip pour la valeur la plus proche de la souris
                    intersect: false, // Ne nécessite pas un survol exact d'un point
                    position: 'nearest', // Positionner le tooltip sur la valeur la plus proche de la souris
                    callbacks: {
                        // Personnalisation du label dans le tooltip
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            return `${label}: ${value} €/m²`;
                        }
                    }
                }
            }
        }
    });
}

/* -------------------------------------------------------------------------- */
/*  5. INITIALISATION DES DEUX GRAPHES                                        */
/* -------------------------------------------------------------------------- */

async function initMoyenneNationaleChart() {
    const data = await getRentDataFrance();

    const labels = YEARS;

    const maison = data.filter(d => d.type === "Maison").map(d => d.avgMoy);
    const appart = data.filter(d => d.type === "Appartement").map(d => d.avgMoy);

    createLineChart("moyenneNationaleChart", labels, [
        {
            label: "Maison Moyenne (€/m²)",
            data: maison,
            borderColor: "rgb(54,162,235)",
            backgroundColor: "rgba(54, 162, 235, 0.2)", // Fond sous la courbe pour Maison
            fill: true
        },
        {
            label: "Appartement Moyen (€/m²)",
            data: appart,
            borderColor: "rgb(255,99,132)",
            backgroundColor: "rgba(255, 99, 132, 0.2)", // Fond sous la courbe pour Appartement
            fill: true
        }
    ], "Loyer Moyen (€/m²)");
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

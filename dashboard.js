document.addEventListener("DOMContentLoaded", async () => {

    document.getElementById("loader").style.display = "block";

    await Promise.all([
        initMoyenneNationaleChart(),
        initMedianeNationaleChart()
    ]);

    document.getElementById("loader").style.display = "none";

});

// execute les requetes
async function runSPARQL(query) {
    const url = `${RENT_ENDPOINT}?query=${encodeURIComponent(query)}&output=json`;
    const response = await fetch(url, { headers: { Accept: "application/sparql-results+json" } });
    return response.json();
}

// initialise le graphique de la médiane
async function initMedianeNationaleChart() {
    const data = await getMedianRentFrance();

    const config = {
        canvasId: 'medianeNationaleChart',
        title: 'Médiane des loyers en France (€/m²)',
        dataKey: 'median',
        colors: {
            appart: 'rgba(75,192,192, 1)', // Turquoise
            maison: 'rgba(153, 102, 255, 1)'  // Violet
        }
    };
    
    const years = [...new Set(data.map(d => d.annee))].sort((a, b) => a - b);
    buildChart(config, data, years)
}

// récupèré les données de la base de données pour calculer la médiane
async function getMedianRentFrance() {
    const promises = [];

    for (const annee of ['2018', '2022', '2023', '2024']) {
        for (const type of ['Appart', 'Maison']) {
            const Q = `
                PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>
                SELECT ?loyer WHERE {
                    ?dept rcw:comprend ?commune .
                    ?commune rcw:loyer${type}${annee} ?loyer .
                }
            `;

            promises.push(
                runSPARQL(Q).then(json => {
                    const rents = json.results.bindings
                        .map(b => parseFloat(b.loyer.value))
                        .filter(v => !isNaN(v));
                    return {
                        annee,
                        type: type === "Appart" ? "Appartement" : "Maison",
                        median: calculateMedian(rents)
                    };
                })
            );
        }
    }

    return Promise.all(promises);
}

// calcule la médiane
function calculateMedian(values) {
    if (!values.length) return 0;
    values = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(values.length / 2);
    return values.length % 2 !== 0
        ? values[mid]
        : (values[mid - 1] + values[mid]) / 2;
}

// initialise le graphique de la moyenne nationale
async function initMoyenneNationaleChart() {
    const data = await getRentDataFrance();

    const config = {
        canvasId: 'moyenneNationaleChart',
        title: 'Moyenne des Loyers en France (€/m²)',
        dataKey: 'avgMoy',
        colors: {
            appart: 'rgba(54, 162, 235, 1)', // Bleu
            maison: 'rgba(255, 99, 132, 1)'  // Rouge
        }
    };
    
    const years = [...new Set(data.map(d => d.annee))].sort((a, b) => a - b);
    buildChart(config, data, years)
}

// récupère les données de loyer de chaque département
async function getRentDataFrance() {
    const Q = `
        PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>

        SELECT ?annee ?type (AVG(?LoyerMoyenDept) AS ?avgMoy)
        WHERE {
            VALUES ?annee { "2018" "2022" "2023" "2024" }
            VALUES ?type { "Appart" "Maison" }

            {
                SELECT ?annee ?type ?dept (AVG(xsd:float(?value)) AS ?LoyerMoyenDept)
                WHERE {
                    ?dept rcw:comprend ?commune .
                    BIND(IRI(CONCAT("https://cours.iut-orsay.fr/rcw/loyer", ?type, ?annee)) AS ?prop)
                    ?commune ?prop ?value .
                }
                GROUP BY ?annee ?type ?dept
            }
        }
        GROUP BY ?annee ?type
        ORDER BY ?annee ?type
    `;

    const json = await runSPARQL(Q);

    return json.results.bindings.map(b => ({
        annee: b.annee.value,
        type: b.type.value === "Appart" ? "Appartement" : "Maison",
        avgMoy: parseFloat(b.avgMoy.value)
    }));
}

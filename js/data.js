// Appel de la fonction lorsque le DOM est complètement chargé
document.addEventListener('DOMContentLoaded', () => {
    displayRentTable(); 
    displayDepartmentTable();
});

const endpoint = 'http://localhost:7200/repositories/loyer';

// Fonction pour récupérer et afficher les données dans le tableau
async function displayRentTable() {
    const data = await getRentCityData();

    if (data.length === 0) {
        document.getElementById('tableBody').innerHTML = '<tr><td colspan="100%">Aucune donnée disponible</td></tr>';
        return;
    }

    const headerRow = document.getElementById('tableHeader');
    Object.keys(data[0]).forEach(key => {
        const th = document.createElement('th');
        th.textContent = key;
        headerRow.appendChild(th);
    });

    const tbody = document.getElementById('tableBody');
    data.forEach(item => {
        const tr = document.createElement('tr');
        Object.values(item).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

async function getRentCityData() {
    const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>
    SELECT *
    WHERE {
        ?commune a rcw:commune ;
                rcw:code ?code ;
                rdfs:label ?nom ;
                rcw:loyerAppart2018 ?loyerMoyenAppart2018 ;
                rcw:loyerMaxAppart2018 ?loyerMaxAppart2018 ;
                rcw:loyerMinAppart2018 ?loyerMinAppart2018 ;
                rcw:loyerMaison2018 ?loyerMoyenMaison2018 ;
                rcw:loyerMaxMaison2018 ?loyerMaxMaison2018 ;
                rcw:loyerMinMaison2018 ?loyerMinMaison2018 ;
    }
    LIMIT 10
    `;
    const url = endpoint + '?query=' + encodeURIComponent(query) + '&output=json';
    const results = [];

    try {
        const response = await fetch(url, { headers: { 'Accept': 'application/sparql-results+json' } });
        const json = await response.json();

        json.results.bindings.forEach(binding => {
            const obj = {};
            for (const key in binding) {
                if (key !== 'commune') {
                    obj[key] = binding[key].value;
                }
            }
            results.push(obj);
        });
    } catch (err) {
        console.warn('Erreur récupération des données des communes:', err);
    }

    return results;
}

async function displayDepartmentTable() {
    const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>

    SELECT ?code ?nomDepartement ?map (SUBSTR(GROUP_CONCAT(?commune; separator=", "), 1, 88) AS ?communes)
    WHERE {
        ?departement a rcw:departement ;
                    rcw:codeDep ?code ;
                    rcw:nomDept ?nomDepartement ;
                    rcw:map ?map ;
                    rcw:comprend ?commune .
    }
    GROUP BY ?code ?nomDepartement ?map
    LIMIT 10
    `;

    const url = endpoint + '?query=' + encodeURIComponent(query) + '&output=json';
    const results = [];

    try {
        const response = await fetch(url, { headers: { 'Accept': 'application/sparql-results+json' } });
        const json = await response.json();

        json.results.bindings.forEach(binding => {
            const obj = {};
            for (const key in binding) {
                if (key !== 'departement') {
                    obj[key] = binding[key].value;
                }
            }
            results.push(obj);
        });

        if (results.length === 0) {
            document.getElementById('departmentBody').innerHTML = '<tr><td colspan="100%">Aucune donnée disponible</td></tr>';
            return;
        }
        const headerRow = document.getElementById('departmentHeader');
        Object.keys(results[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            headerRow.appendChild(th);
        });

        const tbody = document.getElementById('departmentBody');
        results.forEach(item => {
            const tr = document.createElement('tr');
            Object.values(item).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });

    } catch (err) {
        console.warn('Erreur récupération des départements:', err);
    }
}

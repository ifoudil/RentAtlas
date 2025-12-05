// graphique.js
document.addEventListener('DOMContentLoaded', () => {
    const deptName = localStorage.getItem('currentDeptName');
    const rentDataJson = localStorage.getItem('currentRentData');
    const codeDep = localStorage.getItem('currentCodeDep');

    if (deptName && rentDataJson) {
        try {
            const rentData = JSON.parse(rentDataJson);
            console.log("Données reçues pour le graphique :", rentData); // Debug

            // Appel de la fonction définie dans loyer.js
            updateChart(deptName, rentData);

        } catch (e) {
            console.error("Erreur parsing JSON:", e);
            document.getElementById('dept-title').innerText = "Erreur de données";
        }
    } else {
        document.getElementById('dept-title').innerText = "Aucune donnée sélectionnée";
    }
});
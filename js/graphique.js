// quand la page charge on affiche les graphiques
document.addEventListener('DOMContentLoaded', () => {
    const deptName = localStorage.getItem('currentDeptName');
    const rentDataJson = localStorage.getItem('currentRentData');
    // const codeDep = localStorage.getItem('currentCodeDep');

    if (deptName && rentDataJson) {
        try {
            const rentData = JSON.parse(rentDataJson);
            updateChart(deptName, rentData);

        } catch (e) {
            console.error("Erreur parsing JSON:", e);
            document.getElementById('dept-title').innerText = "Erreur de données";
        }
    } else {
        document.getElementById('dept-title').innerText = "Aucune donnée sélectionnée";
    }
});
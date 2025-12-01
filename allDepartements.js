getCode()

async function getCode() {
    let endpoint = 'http://localhost:7200/repositories/loyer';
  
    let query = 
    `PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>
      SELECT DISTINCT ?code
      WHERE {
        ?dept rcw:codeDep ?code .
      }`;
  
      let url = endpoint + '?query=' + encodeURIComponent(query) ;
      
      try{
        let data = await fetch(url).then(response => response.text());
        
        // --- Début du traitement de la chaîne de caractères ---
        
        // 1. Divise la chaîne en lignes (chaque code est sur une nouvelle ligne)
        // .split('\n') crée un tableau de lignes.
        let lines = data.split('\n');
        
        // 2. Filtre et mappe les lignes pour créer le tableau final:
        let codesArray = lines
            // Filtre : Retire l'en-tête (la première ligne 'code') et les lignes vides potentielles.
            .filter(line => line.trim() !== '' && line.trim() !== 'code')
            // Mappe : .trim() retire les espaces blancs superflus (s'il y en a) de chaque code.
            .map(code => code.trim());

        // --- Fin du traitement ---

        console.log("Données brutes reçues:", data);
        console.log("Tableau de codes formaté:", codesArray);
        
        // Maintenant, codesArray contient votre tableau: ['30', '32', '33', ..., '75']
        return codesArray;
      } 
      catch (err) {
        console.error(err);
        return null;
      }
  }
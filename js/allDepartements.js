getCode()

// retourne le code de tous les départements
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

        // transforme les données récupérées en tableau
        let lines = data.split('\n');
        let codesArray = lines
            .filter(line => line.trim() !== '' && line.trim() !== 'code')
            .map(code => code.trim());
        
        return codesArray;
      } 
      catch (err) {
        console.error(err);
        return null;
      }
  }
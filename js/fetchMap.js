// retourne les données de la map sur graphdb
async function getData(code) {
  let endpoint = 'http://localhost:7200/repositories/loyer';

  let query = 
  `PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>
    SELECT DISTINCT ?map
    WHERE {
      ?dept rcw:codeDep "${code}" ;
            rcw:map ?map .
    }`;

    let url = endpoint + '?query=' + encodeURIComponent(query) ;
    try{
      let data = await fetch(url).then(response => response.text());
      let result = await getGEOJson(data)
      return result
    } 
    catch (err) {
      console.error(err);
      return null;
    }
}

// retourne le Json pour construire la map
async function getGEOJson(data){
  try {
    let response = await fetch(getMapURL(data));
    let json = await response.json();

    const page = Object.values(json.query.pages)[0];
    const content = JSON.parse(page.revisions[0]["*"]);

    return content.data; 
  } 
  catch (err) {
    console.error(err);
    return null;
  }
}

// retourne le lien de la map stockée dans la base de données et l'encode correctement pour qu'on puisse en extraire le Json
function getMapURL(url) {
  if (!url) return null;

  let index = url.indexOf("Data:");
  if (index === -1) return null;

  let title = decodeURIComponent(url.substring(index).trim());
  // remplace les "+" dans certaines url de map par des tirets du bas pour que ça fonctionne correctement
  title = title.replaceAll("+","_")

  return `https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${encodeURIComponent(title)}&origin=*`;
}
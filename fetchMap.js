// const rawUrl = "https://commons.wikimedia.org/w/index.php?title=Data:Ain.map&action=raw";

// fetch(rawUrlToApi(rawUrl))
  // .then(r => r.json())
  // .then(json => {
    // const page = Object.values(json.query.pages)[0];
    // const content = JSON.parse(page.revisions[0]["*"]);
    // console.log(content.data);
  // })
  // .catch(console.error);

// function rawUrlToApi(url) {
  // const title = url.match(/title=(Data:[^&]+)/)?.[1];
  // return title
    // ? `https://commons.wikimedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=json&titles=${encodeURIComponent(title)}&origin=*`
    // : null;
// }

async function getData(code) {
  const endpoint = 'https://corsproxy.io/?url=' + encodeURIComponent('http://localhost:7200/repositories/loyer');

  const query = 
  `PREFIX rcw: <https://cours.iut-orsay.fr/rcw/>
    SELECT DISTINCT ?map
    WHERE {
      ?dept rcw:code "${code}" ;
            rcw:map ?map .
    }`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json'
      },
      body: query
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.results.bindings.map(b => b.map.value);

  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}
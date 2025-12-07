# RentAtlas

## 1. Présentation du projet
Dans le cadre du cours de "Représentation des connaissances sur le web", nous devions réaliser un projet intitulé "Explorer pour Comprendre : Projet d’application web sémantique enrichi". Ce projet consistait à sélectionner un dataset ouvert, le transformer en graphe RDF enrichi via Wikidata, l’interroger avec SPARQL et développer une application web permettant de visualiser clairement les résultats obtenus (RentAtlas).

Nous nous sommes intéressées lors de ce projet à l'évolution des loyers en France et plus partuclièrement l'évolution par département. La question que nous avons étudié est la suivante : Comment les loyers ont-ils évolué par départements français entre 2018 et 2024 ? 

Cette problématique présente un intérêt particulier car avoir un logement est très important mais peut être compliqué à trouver. Analyser lors de notre projet les différences de loyer entre les maisons et les appartements en fonction des départements et de les comparer à une moyenne française nous a permis de prendre conscience de la disparité des loyers en France. Ce travail nous a également montré l'impact de l'inflation en France.


## 2. Copier le projet
 * Installer GraphDB sur son ordinateur
 * Créer un repository appelé "loyer"
 * Importer les données qui se trouvent dans le dossier "data/ttl/final.ttl"
 * Attention, laissez ouvert tous au long de la manipulation graphDB ouvert ! 
 * Récupérer le code source sur github
 * Ajouter sur votre navigateur l'extrension suivante (Allow CORS)
 * Vérifier que l'extension est bien activée (logo coloré)
 * Ouvrir la page index.html de notre projet
 * Naviguer sur notre site comme vous le souhaitez

## 3. Liens nécessaires
**Datasets :**
* https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2018/
* https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2022/
* https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2023/
* https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2024/

 Nous avons édité les fichiers csv car il y en avait au total 8 (un par type de logement, maison et appartement, pour chaque année). Nous avons rassemblé les fichiers par années pour n'en avoir que 4 au total (2018, 2022, 2023, 2024). Nous avons ensuite supprimé les colonnes dont nous n'allions pas nous servir et gardé uniquement les colonnes suivantes : nom de la commune, code du département, code de la région, loyer moyen, maximum et minimum par ville. Les fichiers édités se trouvent dans data/csv.

 Les données sont basées sur des annonces postées sur des sites d'annonces pour des logements de la France entière, hors Mayotte. Les loyers sont pour des biens mis en locations avec les caractéristiques suivantes :
* Pour un appartement : surface de 49 m² et surface moyenne par pièce de 22,1 m²
* Pour une maison : surface de 92 m² et surface moyenne par pièce de 22,5 m²

Les informations pour les années 2019 à 2021 n'ont pas été exploitées (absence de données).

Nous avons complété le dataset avec Wikidata. Les informations que nous avons récupéré sont sur les départements : nom et map de chacun. Le code utilisé pour réaliser ceci se trouve dans "data/requetes/insert.rq".

**Code source :** 
https://github.com/ifoudil/RentAtlas

**Extension nécessaire pour le fonctionnement du projet :**
https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=fr

**Comment activer l'extension Allow CORS ?**
* Pour l'activer il faut cliquer sur le gestionnaire d'extensions sur la page web (pièce de puzzle généralement située en haut à droite)
* Ensuite cliquer sur le nom de l'extension
* Puis enfin cliquer sur l'image à gauche dans le menu qui s'ouvre pour que l'image devienne colorée 

## 4. Contraintes
* Le repository GraphDB doit s'appeler **"loyer"**
* **Ne pas utiliser Firefox** car les graphiques ne s'affichent pas dessus
* Utiliser et **activer** l'extension "Allow CORS"
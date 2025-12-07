# RentAtlas

1. Présentation du projet


2. Copier le projet
- installer graphdb sur son pc
- créer un repository appelé "loyer"
- importer les données qui se trouvent dans le dossier "data/final/"
- lancer la base de données
- récupérer le code source
- ouvrir la page index.html de notre projet

3. Liens nécessaires
datasets :
- https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2018/
- https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2022/
- https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2023/
- https://www.data.gouv.fr/datasets/carte-des-loyers-indicateurs-de-loyers-dannonce-par-commune-en-2024/

Nous avons édité les fichiers car il y en avait au total 8 (un par type de logement, maison et appartement, pour chaque année). Nous avons ensuite supprimé les colonnes dont nous n'allions pas nous servir et gardé uniquement les colonnes : nom de la commune, code du département, code de la région, loyer moyen, maximum et minimum par ville.
Les données sont basées sur des annonces postées sur des sites d'annonces pour des logements de la France entière, hors Mayotte. Les loyers sont pour des biens mis en locations avec les caractéristiques suivantes :
- Pour un appartement : surface de 49 m² et surface moyenne par pièce de 22,1 m²
- Pour une maison : surface de 92 m² et surface moyenne par pièce de 22,5 m²

code source : 
https://github.com/ifoudil/RentAtlas

extension nécessaire pour le fonctionnement du projet :
https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=fr
- pour l'activer il faut cliquer sur le gestionnaire d'extensions sur la page web (pièce de puzzle généralement située en haut à droite)
- ensuite cliquer sur le nom de l'extension
- puis enfin cliquer sur l'image à gauche dans le menu qui s'ouvre pour que l'image devienne colorée 

4. Contraintes
- Le repository graphdb doit s'appeler "loyer"
- Ne PAS utiliser Firefox car les graphiques ne s'affichent pas dessus
- utiliser l'extension "Allow CORS access control"
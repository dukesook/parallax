# parallax

Creates inferences from a knowledge graph

## Libraries

- N3.js
  - Reads/Writes RDF
- sparql-engine
  - Queries RDF
- EYE JS
  - Enables inferring new triples based on ontology rules.

### Optional

- Linked Data Object (LDO)

  - Provides type-safe, schema-driven RDF data access in TypeScript.

  TODO: use environment variables to hide api key

### Build

- Create a parallax/.env file. add:
  - `VITE_GOOGLE_MAPS_API_KEY=YOUR-API-KEY`
- Find your API Key:
  - https://console.cloud.google.com/
  - Navigation Menu (.)
  - APIs & Services
  - Crednetials
- `$ npm install`
- `$ npm run dev`

### Namespace

`@prefix parallax: <http://parallax.edu/ns/>`

### Used Ontologies

These links can be loaded directly into GraphDB:

- BFO: https://raw.githubusercontent.com/BFO-ontology/BFO-2020/master/src/owl/bfo-core.owl
  - XML Syntax Error: ~~http://purl.obolibrary.org/obo/bfo.owl~~
- ENVO: https://raw.githubusercontent.com/EnvironmentOntology/envo/master/subsets/envo-basic.obo
  - XML Syntax Error: ~~http://purl.obolibrary.org/obo/envo.owl~~
  - Too compilcated to import: ~~https://raw.githubusercontent.com/EnvironmentOntology/envo/master/envo.owl~~
- GeoSPARQL: https://opengeospatial.github.io/ogc-geosparql/geosparql11/geo.ttl

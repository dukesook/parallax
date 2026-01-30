# Parallax

Creates inferences from a knowledge graph. See the [Parallax Wiki](https://github.com/dukesook/parallax.wiki.git) for more informations.

## Libraries

- RDF Structures
  - rdf-js
- Parsing RDF
  - rdflib.js
  - ~~rdf-parse~~ // for node.js!
- Local Triple Store
  - rdflib.js
  - ~~N3.js~~ // replaced by rdflib
- sparql-engine
  - Queries RDF
- EYE JS
  - Enables inferring new triples based on ontology rules.
- @rimbu/bimap
  - Bidiretional Map for Term Registry

### rdf-parse.js

- Is a format router. It doesn’t parse RDF itself, but instead delegates to other parsers under the hood.
- Ideal for backend. Typically overkill for frontend. (compared to `rdflib.js` and `n3.js`)

- Uses: (streaming libraries)
  - `n3.js`
  - `rdfxml-streaming-parser.js`
  - `jsonld-streaming-parser.js`

### rdflib.js

- in-memory parsing
- Ideal for front end.
- Very mature
- See documentation [here](https://linkeddata.github.io/rdflib.js/doc/)
- See tutorial [here](https://github.com/solidos/solid-tutorial-rdflib.js)

## Build

- Create a parallax/.env file. add:
  - `VITE_GOOGLE_MAPS_API_KEY=YOUR-API-KEY`
- Find your API Key:
  - https://console.cloud.google.com/
  - Open Navigation Menu - Three horizontal bars on top left (Press .)
  - APIs & Services
  - Credentials
- `$ npm install`
- `$ npm run dev`

## Namespace IRI

`@prefix parallax: <http://parallax.edu/ns/>`
`https://parallax.nmsu.edu/ns/` ← vocabulary
`https://parallax.nmsu.edu/id/` ← instance/data IRIs

## Used Ontologies

These links can be loaded directly into GraphDB:

- BFO: https://raw.githubusercontent.com/BFO-ontology/BFO-2020/refs/heads/master/21838-2/owl/bfo-core.owl
  - XML Syntax Error: ~~http://purl.obolibrary.org/obo/bfo.owl~~
- ENVO: https://raw.githubusercontent.com/EnvironmentOntology/envo/master/subsets/envo-basic.obo
  - XML Syntax Error: ~~http://purl.obolibrary.org/obo/envo.owl~~
  - Too compilcated to import: ~~https://raw.githubusercontent.com/EnvironmentOntology/envo/master/envo.owl~~
- GeoSPARQL: https://opengeospatial.github.io/ogc-geosparql/geosparql11/geo.ttl

- SOSA
  - https://github.com/w3c/sdw/blob/gh-pages/ssn/integrated/sosa.ttl
  - Not BFO based
  - Stands for `Sensor, Observation, Sample, and Actuator`
  - SNN (Semantic Sensor Network) is built on top of SOSA
  - sosa:Observation, sosa:Sensor, sosa:Actuator, sosa:Platform

## Eye on the Prize

- Foundation
  - Divide Store into graphs.
  - Use one graph per ontology.
- Display Term Registry
- Explore Knowlegdge Graph
  - d

## Design Patterns
1. `document.getElementById()` should only be called by `gui.ts`. In other words, only the GUI knows about elements.
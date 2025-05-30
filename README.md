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
  - `VITE_GOOGLE_MAPS_API_KEY=(your-api-key)`

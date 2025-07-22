import * as N3 from 'n3';
import { v4 as uuidv4 } from 'uuid';

const newId = uuidv4();
console.log('Generated UUID:', newId);

export function saveObservation(objectType: string, lat: number, lng: number): void {
  const objectId = uuidv4();
  const observationId = uuidv4();
  const datetime = new Date().toISOString();

  let objectTypeIRI = null;
  if (objectType === 'plane') {
    objectTypeIRI = 'envo:03501349';
  } else if (objectType === 'car') {
    objectTypeIRI = 'envo:01000605';
  } else if (objectType === 'boat') {
    objectTypeIRI = 'envo:01000608';
  }

  // Example
  /*  @prefix parallax: <http://parallax.edu/ns/> .
      @prefix sosa: <http://www.w3.org/ns/sosa/> .
      @prefix envo: <http://purl.obolibrary.org/obo/ENVO_> .
      @prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
      @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
      @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

      <#boat123> a envo:01000608 ;  # ENVO class for boat
          rdfs:label "Boat 123" .

      <#obs456> a sosa:Observation ;
          sosa:hasFeatureOfInterest <#boat123> ;
          sosa:resultTime "2025-07-21T13:00:00Z"^^xsd:dateTime ;
          geo:lat "38.8977"^^xsd:decimal ;
          geo:long "-77.0365"^^xsd:decimal .
  */

  const turtleData = `
    @prefix parallax: <http://parallax.edu/ns/>
    @prefix sosa: <http://www.w3.org/ns/sosa/> .
    @prefix envo: <http://purl.obolibrary.org/obo/ENVO_> .
    @prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    @prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

    parallax:${objectId} a ${objectTypeIRI} ;
      rdfs:label "Object that was observed" .

    parallax:${observationId} a sosa:Observation ;
      sosa:hasFeatureOfInterest parallax:${objectId} ;
      geo:lat "${lat}" ;
      geo:long "${lng}" ;
      sosa:resultTime "2025-07-21T13:00:00Z"^^xsd:dateTime .
  `;

  console.log('Turtle Data:', turtleData);
}

export function runRdfExample(): void {
  const turtleData = `
    @prefix ex: <http://example.org/> .
    ex:John ex:likes ex:Coffee .
    ex:John ex:knows ex:Jane .
  `;

  // Parse RDF
  const parser = new N3.Parser();
  const quads = parser.parse(turtleData);

  // Create in-memory RDF store
  const store = new N3.Store(quads);

  // Log all triples
  store.getQuads(null, null, null, null).forEach((quad) => {
    console.log(`${quad.subject.value} ${quad.predicate.value} ${quad.object.value}`);
  });

  // Query example: find what John likes
  const likes = store.getQuads('http://example.org/John', 'http://example.org/likes', null, null);
  likes.forEach((quad) => {
    console.log(`John likes: ${quad.object.value}`);
  });
}

export async function runSparqlQuery(query: string) {
  const response = await fetch('http://localhost:7200/repositories/parallax', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      Accept: 'application/sparql-results+json',
    },
    body: query,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SPARQL query failed: ${response.statusText}\n${error}`);
  }

  const data = await response.json();
  console.log(data.results.bindings);
}

export async function testQuery(): Promise<void> {
  const query = `
    SELECT *
    WHERE {
      ?s ?p ?o
    }
    LIMIT 10
  `;

  try {
    await runSparqlQuery(query);
  } catch (error) {
    console.error('Error running SPARQL query:', error);
  }
}

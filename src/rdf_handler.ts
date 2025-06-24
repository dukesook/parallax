import * as N3 from 'n3';
import { v4 as uuidv4 } from 'uuid';

const newId = uuidv4();
console.log('Generated UUID:', newId);

export function saveObservation(objectType: string, lat: number, lng: number): void {
  const objectId = uuidv4();
  const observationId = uuidv4();
  const datetime = new Date().toISOString();

  let objectIRI = null;
  if (objectType === 'Plane') {
    objectIRI = 'envo:03501349';
  } else if (objectType === 'Car') {
    objectIRI = 'envo:01000605';
  } else if (objectType === 'Boat') {
    objectIRI = 'envo:01000608';
  }
  const turtleData = `
    @prefix ex: <http://example.org/> .
    @prefix envo: <http://purl.obolibrary.org/obo/ENVO_>
    @prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .

    ex:${objectId} a ${objectIRI} ;
      ex:wasObservedAt ex:${observationId} .

    ex:${observationId} a ex:Observation ;
      geo:lat "${lat}" ;
      geo:long "${lng}" ;
      ex:hasDatetime "${datetime}" .
      ex:hasObjectType "${objectIRI}" .
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

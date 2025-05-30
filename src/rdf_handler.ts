import * as N3 from 'n3';
import { v4 as uuidv4 } from 'uuid';

const newId = uuidv4();
console.log('Generated UUID:', newId);

export function newObject(objectType: string, lat: number, lng: number): void {
  const objectId = uuidv4();
  const observationId = uuidv4();
  const datetime = new Date().toISOString();

  const turtleData = `
    @prefix ex: <http://example.org/> .
    @prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .

    ex:${objectId} a ex:${objectType} ;
      ex:wasObservedAt ex:${observationId} .

    ex:${observationId} a ex:Observation ;
      geo:lat "${lat}" ;
      geo:long "${lng}" ;
      ex:hasDatetime "${datetime}" ;
      ex:hasObjectType "${objectType}" .
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

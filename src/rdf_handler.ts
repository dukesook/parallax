import { Parser, Store } from 'n3';
import * as N3 from 'n3';

export function runRdfExample(): void {
  const turtleData = `
    @prefix ex: <http://example.org/> .
    ex:John ex:likes ex:Coffee .
    ex:John ex:knows ex:Jane .
  `;

  // Parse RDF
  const parser = new Parser();
  const quads = parser.parse(turtleData);

  // Create in-memory RDF store
  const store = new Store(quads);

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

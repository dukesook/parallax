import * as $rdf from 'rdflib';
import { Statement } from 'rdflib';
import { IndexedFormula } from 'rdflib';

const g_triple_store = new $rdf.Store();
const PARALLAX = $rdf.Namespace('https://parallax.nmsu.edu/ns/');
const PARALLAX_R = $rdf.Namespace('https://parallax.nmsu.edu/id/');

export async function addRDFToStore(rdfData: string, baseIRI: string, contentType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    $rdf.parse(rdfData, g_triple_store, baseIRI, contentType, (err: Error | undefined) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function logStore(store: $rdf.Store): void {
  console.log('logStore()');
  store.statements.forEach((statement: $rdf.Statement) => {
    const s = statement.subject.value;
    const p = statement.predicate.value;
    const o = statement.object.value;
    console.log(`Statement: ${s} ${p} ${o}`);
  });
}

export function debug(): void {
  // Add triple to store
  console.log('creating triple...');
  const subject = PARALLAX('subject1');
  const predicate = $rdf.sym('http://parallax.edu/ns/predicate1');
  const object = $rdf.literal('Object1');

  g_triple_store.add(subject, predicate, object);
  console.log('Added triple to store');

  logStore(g_triple_store);
}

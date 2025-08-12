import * as $rdf from 'rdflib';
import { Statement } from 'rdflib';
import { IndexedFormula } from 'rdflib';

const g_triple_store = new $rdf.Store();

export async function addRDFToStore(rdfData: string, contentType: string, baseIRI: string = ''): Promise<void> {
  return new Promise((resolve, reject) => {
    $rdf.parse(rdfData, g_triple_store, baseIRI, contentType, (err: Error | undefined) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export function logAllTriples() {
  const graph = g_triple_store as IndexedFormula;
  graph.statements.forEach((st: Statement) => {
    console.log(st.subject.value, st.predicate.value, st.object.value);
  });
}

import * as $rdf from 'rdflib';
import { Statement } from 'rdflib';
import { IndexedFormula } from 'rdflib';
import { DataFactory } from 'rdflib';

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

export function getSubjects(): Set<string> {
  console.log('getSubjects()');
  const subjects = new Set<string>();
  g_triple_store.statements.forEach((statement: Statement) => {
    // If blank node, skip it:
    const termType = statement.subject.termType;
    if (termType === 'BlankNode') {
      return;
    } else if (termType === 'NamedNode') {
      subjects.add(statement.subject.value);
    } else {
      throw new Error(`Unexpected term type: ${termType}`);
    }
  });
  console.log(`Found ${subjects.size} subjects`);
  return subjects;
}

export function queryLabels(): void {
  const query = `
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    SELECT ?subject ?label WHERE {
      ?subject rdfs:label ?label .
    }
    `;

  // Prepare the query object
  const testMode = false;
  const sparqlQuery = $rdf.SPARQLToQuery(query, testMode, g_triple_store);

  // Execute the query
  const results = g_triple_store.querySync(sparqlQuery);

  // Output the results
  results.forEach((binding: { [key: string]: $rdf.Term }) => {
    const rdfs_label = binding['?label'];
    console.log('label:', rdfs_label.value);
  });
}

export function logStore(): void {
  const store = g_triple_store as IndexedFormula;

  if (store.statements.length === 0) {
    console.log('========= Store is empty =========');
    return;
  }

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

// ================== RDFLib API ==================
/*
Useful links: 
  1. The library itself - https://vscode.dev/github/linkeddata/rdflib.js
  2. API - https://linkeddata.github.io/rdflib.js/doc/
  3. Data Model - https://rdf.js.org/data-model-spec/




***** rdflib: types.ts *****
Statement = Triple or Quad
export type SubjectType   = RDFlibBlankNode | RDFlibNamedNode | RDFlibVariable
export type PredicateType = RDFlibNamedNode | RDFlibVariable
export type ObjectType    = RDFlibNamedNode | RDFlibLiteral | Collection | RDFlibBlankNode | RDFlibVariable | Empty
*/

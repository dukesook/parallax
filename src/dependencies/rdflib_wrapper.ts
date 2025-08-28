import * as $rdf from 'rdflib';
import { Store } from 'rdflib';
import { Statement } from 'rdflib';
import { IndexedFormula } from 'rdflib';
import { DataFactory } from 'rdflib';
import { Iri, Label } from '../aliases';
import { Triple } from '../aliases';

const g_triple_store: IndexedFormula = new Store();
const PARALLAX = $rdf.Namespace('https://parallax.nmsu.edu/ns/');
const PARALLAX_R = $rdf.Namespace('https://parallax.nmsu.edu/id/');

type SparqlBinding = { [selectVariable: string]: $rdf.Term };
// A SPARQL binding refers to a row in the query result.
// A SparqlBinding is an object where each key corresponds to a SELECT SPARQL variable.

export async function addRDFToStore(rdfData: string, baseIRI: string, contentType: string, graphIRI: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tempStore = $rdf.graph(); // Temporary store to parse into

    $rdf.parse(rdfData, tempStore, baseIRI, contentType, (err: Error | undefined) => {
      if (err) return reject(err);

      const graphSym = $rdf.sym(graphIRI);

      // Transfer each triple from the temp store into the main store with the desired graph
      tempStore.statements.forEach((statement: Statement) => {
        g_triple_store.add(statement.subject, statement.predicate, statement.object, graphSym);
      });

      resolve();
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

export function getTriples(): Triple[] {
  const triples: Triple[] = [];

  for (const statement of g_triple_store.statements) {
    // Skip statements with blank nodes
    if (containsBlankNode(statement)) {
      continue;
    }

    const subject = statement.subject.value;
    const predicate = statement.predicate.value;
    const object = statement.object.value;

    const triple: Triple = { subject, predicate, object };
    triples.push(triple);
  }

  return triples;
}

// return an object of { subject: Iri, label: Label } for each rdfs:label
export function queryLabels(): { [key: Iri]: Label } {
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
  const bindings: SparqlBinding[] = g_triple_store.querySync(sparqlQuery);

  const results: { [key: Iri]: Label } = {};
  bindings.forEach((binding: SparqlBinding) => {
    const label = binding['?label'].value as Label;
    const subject = binding['?subject'].value as Iri;
    results[subject] = label;
  });

  return results;
}

// =================== Private Functions ===================
function containsBlankNode(statement: Statement): boolean {
  //prettier-ignore
  if (statement.subject.termType === 'BlankNode' ||
      statement.predicate.termType === 'BlankNode' ||
      statement.object.termType === 'BlankNode') {
    return true;
  } else {
    return false;
  }
}

// =================== Debugging and Logging ===================
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

  logStore();
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

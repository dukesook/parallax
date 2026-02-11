import * as $rdf from 'rdflib';
import { NamedNode } from 'rdflib';
import { Statement } from 'rdflib';
import { IndexedFormula } from 'rdflib';
import { Iri, Label } from '../aliases';
import { Triple } from '../aliases';
import { Voyage } from '../models';
import { v4 as uuidv4 } from 'uuid'; //uuidv4() is a function
import { Term } from '../term_registry';
import * as TermRegistry from '../term_registry';
import { Coordinate, Port } from '../models';

// $rdf.Namespace() returns a function.
//    This function appends a string to the namespace and returns a NamedNode.
type NamespaceFn = (localName?: string) => NamedNode;
const PARALLAX_R: NamespaceFn = $rdf.Namespace('https://parallax.nmsu.edu/id/');
const PARALLAX_NS: NamespaceFn = $rdf.Namespace('https://parallax.nmsu.edu/ns/');
const SOSA: NamespaceFn = $rdf.Namespace('http://www.w3.org/ns/sosa/');

const g_triple_store: IndexedFormula = $rdf.graph();
const PARALLAX_GRAPH = $rdf.sym('https://parallax.nmsu.edu/');
const a = $rdf.sym('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
const rdfsLabel = $rdf.sym('http://www.w3.org/2000/01/rdf-schema#label');

type SparqlBinding = { [selectVariable: string]: $rdf.Term };
// A SPARQL binding refers to a row in the query result.
// A SparqlBinding is an object where each key corresponds to a SELECT SPARQL variable.

const is_about: NamedNode = $rdf.sym(Term.is_about);
const has_start_time: NamedNode = $rdf.sym(Term.has_start_time);
const has_end_time: NamedNode = $rdf.sym(Term.has_end_time);
const has_start_port: NamedNode = $rdf.sym(Term.has_start_port);
const has_end_port: NamedNode = $rdf.sym(Term.has_end_port);
const has_latitude: NamedNode = $rdf.sym(Term.has_latitude);
const has_longitude: NamedNode = $rdf.sym(Term.has_longitude);

function init(): void {}

export const add = {
  label(subject: Iri, label: string) {
    g_triple_store.add($rdf.sym(subject), rdfsLabel, $rdf.literal(label), PARALLAX_GRAPH);
    // read triple back
    const triples = g_triple_store.statementsMatching($rdf.sym(subject), rdfsLabel, undefined, PARALLAX_GRAPH);
    if (triples.length === 0) {
      throw new Error(`Failed to add label triple for subject: ${subject}`);
    }
  },

  async rdfToStore(rdfData: string, baseIRI: string, contentType: string, graphIRI: string): Promise<void> {
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
  },

  observableEntity(entityType: Iri): Iri {
    const observableEntity: Iri = PARALLAX_R(uuidv4());
    g_triple_store.add(observableEntity, a, entityType, PARALLAX_GRAPH);
    return observableEntity;
  },

  port(port: Port): Iri {
    const the_port: Iri = PARALLAX_R(port.port_id);
    const harbourType: NamedNode = $rdf.sym('http://purl.obolibrary.org/obo/ENVO_00000463'); // harbour
    g_triple_store.add(the_port, a, harbourType, PARALLAX_GRAPH);
    g_triple_store.add(the_port, rdfsLabel, $rdf.literal(port.name), PARALLAX_GRAPH);
    // const latitude: NamedNode
    // latitude is as literal?
    return the_port;
  },

  observation(observedThing: Iri, lat: number, lng: number, date: Date): Iri {
    const observation: Iri = PARALLAX_R(uuidv4());
    const ObservationType = SOSA('Observation');
    const latitude = $rdf.literal(lat.toString(), $rdf.sym('http://www.w3.org/2001/XMLSchema#decimal'));
    const longitude = $rdf.literal(lng.toString(), $rdf.sym('http://www.w3.org/2001/XMLSchema#decimal'));
    const timeLiteral = $rdf.literal(date.toISOString(), $rdf.sym('http://www.w3.org/2001/XMLSchema#dateTime'));
    const resultTime = SOSA('resultTime');

    g_triple_store.add(observation, a, ObservationType, PARALLAX_GRAPH);
    g_triple_store.add(observation, has_latitude, latitude, PARALLAX_GRAPH);
    g_triple_store.add(observation, has_longitude, longitude, PARALLAX_GRAPH);
    g_triple_store.add(observation, is_about, $rdf.sym(observedThing), PARALLAX_GRAPH);
    g_triple_store.add(observation, resultTime, timeLiteral, PARALLAX_GRAPH);
    return observation;
  },

  voyage(voyage: Voyage): Iri {
    const voyageIri: Iri = PARALLAX_R(uuidv4());
    const VoyageType = TermRegistry.getIRI('ActOfTravel');
    const start_time = $rdf.literal(voyage.start_time.toISOString(), $rdf.sym('http://www.w3.org/2001/XMLSchema#dateTime'));
    const end_time = $rdf.literal(voyage.end_time.toISOString(), $rdf.sym('http://www.w3.org/2001/XMLSchema#dateTime'));

    g_triple_store.add(voyageIri, a, VoyageType, PARALLAX_GRAPH);
    g_triple_store.add(voyageIri, is_about, voyage.ship, PARALLAX_GRAPH);
    g_triple_store.add(voyageIri, has_start_time, start_time, PARALLAX_GRAPH);
    g_triple_store.add(voyageIri, has_end_time, end_time, PARALLAX_GRAPH);
    g_triple_store.add(voyageIri, has_start_port, voyage.start_port, PARALLAX_GRAPH);
    g_triple_store.add(voyageIri, has_end_port, voyage.end_port, PARALLAX_GRAPH);

    add.label(voyageIri, 'Voyage');
    return voyageIri;
  },
};

export const get = {
  allGraphs(): Label[] {
    const graphIris: Set<Iri> = getNamedGraphs(g_triple_store);
    const graphNames: string[] = [];
    graphIris.forEach((graph) => {
      try {
        const name = TermRegistry.getLabel(graph);
        graphNames.push(name);
      } catch (error) {
        console.error('Graph IRI not found in TermRegistry:', graph);
        graphNames.push(graph);
      }
    });
    return graphNames;
  },

  allTriples(): Triple[] {
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
  },

  instanceData(): Triple[] {
    const triples: Triple[] = [];
    g_triple_store.statementsMatching(undefined, undefined, undefined, PARALLAX_GRAPH).forEach((statement: Statement) => {
      const subject = statement.subject.value;
      const predicate = statement.predicate.value;
      const object = statement.object.value;
      triples.push({ subject, predicate, object });
    });
    return triples;
  },

  instanceDataTurtle(): string {
    const parallaxTriples = getParallaxTriples();
    let turtle = '';

    const subGraph: $rdf.IndexedFormula = $rdf.graph();
    for (const triple of parallaxTriples) {
      const subject = $rdf.sym(triple.subject);
      const predicate = $rdf.sym(triple.predicate);

      let toObject;
      const isLiteralObj = isLiteral(triple.object);
      if (isLiteralObj) {
        toObject = $rdf.literal;
      } else {
        toObject = $rdf.sym;
      }
      const object = toObject(triple.object);
      subGraph.add(subject, predicate, object, PARALLAX_GRAPH);
    }

    $rdf.serialize(undefined, subGraph, PARALLAX_GRAPH.value, 'text/turtle', (err: Error, str: string) => {
      if (err) {
        console.error('Error serializing to Turtle:', err);
      } else {
        turtle = str || '';
      }
    });

    return turtle;
  },

  iriToLabelMapping(): { [key: Iri]: Label } {
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
  },

  namedNode(label: string): $rdf.NamedNode {
    const iri = TermRegistry.getIRI(label);
    return $rdf.sym(iri);
  },

  coordinate(portIri: Iri): { latitude: number; longitude: number } {
    return { latitude: 0, longitude: 0 };
  },
};

// ================== Default Export ==================
export default {
  add,
  get,
  debug,
  init,
};

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

function getNamedGraphs(tripleStore: $rdf.IndexedFormula): Set<Iri> {
  const graphNames = new Set<Iri>();

  for (const stmt of tripleStore.statementsMatching(undefined, undefined, undefined, undefined)) {
    const graphIRI = stmt.why?.value;
    if (graphIRI) {
      graphNames.add(graphIRI);
    }
  }

  return graphNames;
}

// =================== Debugging and Logging ===================

export function logInstanceData(): void {
  const triples = getParallaxTriples();
  if (triples.length === 0) {
    console.log('No triples found in PARALLAX_GRAPH');
    return;
  }
  for (const triple of triples) {
    console.log(`${triple.subject} ${triple.predicate} ${triple.object}`);
  }
}

function getParallaxTriples(): Triple[] {
  const triples: Triple[] = [];
  g_triple_store.statementsMatching(undefined, undefined, undefined, PARALLAX_GRAPH).forEach((statement: Statement) => {
    const s = statement.subject.value;
    const p = statement.predicate.value;
    const o = statement.object.value;
    triples.push({ subject: s, predicate: p, object: o });
  });
  return triples;
}

function isLiteral(value: string): boolean {
  // Regex for absolute IRI scheme: "scheme:"
  const iriPattern = /^(?:[a-z][a-z0-9+.-]*):/i;
  return !iriPattern.test(value);
}

function debug(): void {
  // debug
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

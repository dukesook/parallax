import * as $rdf from 'rdflib';
import { Coordinate, Port, Voyage, ObservableEntity, Observation, SpatiotemporalCoordinate } from '../models';
import { Iri, Label, Triple } from '../aliases';
import { v4 as uuidv4 } from 'uuid'; //uuidv4() is a function
import { Term } from '../term_registry';
import * as TermRegistry from '../term_registry';
import { IndexedFormula, Query, Statement, NamedNode, Literal } from 'rdflib';
import type { Term as RdfTerm } from '@rdfjs/types';
import type { Bindings } from 'rdflib/lib/types';

type Subject = $rdf.Statement['subject'];
type Predicate = $rdf.Statement['predicate'];
type Object = $rdf.Statement['object'];
type Graph = $rdf.Statement['graph'];

// The Triple Store
const g_triple_store: IndexedFormula = $rdf.graph();

// Types
type NamespaceFn = (localName?: string) => NamedNode;
type SparqlBinding = { [selectVariable: string]: RdfTerm }; // A SPARQL binding refers to a row in the query result. Each key cooresponds to a SPARQL variable

// Named Nodes
const PARALLAX_GRAPH: NamedNode = $rdf.sym(Term.parallax_namespace);
const rdfsLabel: NamedNode = $rdf.sym(Term.has_label);
const a: NamedNode = $rdf.sym(Term.is_a);
const is_about: NamedNode = $rdf.sym(Term.is_about);
const has_start_time: NamedNode = $rdf.sym(Term.has_start_time);
const has_end_time: NamedNode = $rdf.sym(Term.has_end_time);
const has_start_port: NamedNode = $rdf.sym(Term.has_start_port);
const has_end_port: NamedNode = $rdf.sym(Term.has_end_port);
const has_latitude: NamedNode = $rdf.sym(Term.has_latitude);
const has_longitude: NamedNode = $rdf.sym(Term.has_longitude);
const harbourType: NamedNode = $rdf.sym(Term.harbour_class);
const has_geometry: NamedNode = $rdf.sym(Term.has_geometry);
const geometry_class: NamedNode = $rdf.sym(Term.geometry_class);
const feature_class: NamedNode = $rdf.sym(Term.feature_class);
const has_wkt: NamedNode = $rdf.sym(Term.has_wkt);
const wkt_literal_datatype: NamedNode = $rdf.sym(Term.wkt_literal_datatype);
const decimal_literal_datatype: NamedNode = $rdf.sym(Term.decimal_literal_datatype);
const dateTime_literal_datatype: NamedNode = $rdf.sym(Term.dateTime_literal_datatype);
const SosaObservationClass: NamedNode = $rdf.sym(Term.observation_sosa_class);
const SosaResultTimeClass: NamedNode = $rdf.sym(Term.resultTime_sosa_class);

function init(): void {
  //
}

let debugCounter = 1;
export function generate_iri(): Iri {
  const DEBUG = 1;
  if (DEBUG) {
    const iri = `${Term.parallax_namespace}debug${debugCounter}`;
    debugCounter++;
    return iri as Iri;
  } else {
    return (Term.parallax_namespace + uuidv4()) as Iri;
  }
}

export function runQuery(queryStr: string): Promise<Bindings[]> {
  const results: Bindings[] = [];
  const queryObj: Query | false = $rdf.SPARQLToQuery(queryStr, false, g_triple_store);
  if (queryObj === false) {
    throw new Error('Failed to parse SPARQL query');
  }

  // function onRow(row: QueryResultRow): void {
  function onRow(bindings: Bindings): void {
    results.push(bindings);
  }

  function executor(resolve: (value: Bindings[]) => void): void {
    function onDone(): void {
      resolve(results);
    }

    if (queryObj === false) {
      throw new Error('Failed to parse SPARQL query');
    }
    g_triple_store.query(queryObj, onRow, undefined, onDone);
  }

  return new Promise(executor);
}

export const add = {
  triple(s: Subject, p: Predicate, o: Object, g: Graph) {
    g_triple_store.add(s, p, o, g);
  },

  label(subject: Iri, label: string) {
    add.triple($rdf.sym(subject), rdfsLabel, $rdf.literal(label), PARALLAX_GRAPH);
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
          add.triple(statement.subject, statement.predicate, statement.object, graphSym);
        });

        resolve();
      });
    });
  },

  observableEntity(entityType: Iri): Iri {
    const new_iri: Iri = generate_iri();
    const observableEntity: NamedNode = $rdf.sym(new_iri);
    const entityTypeNode: NamedNode = $rdf.sym(entityType);
    add.triple(observableEntity, a, entityTypeNode, PARALLAX_GRAPH);
    add.triple(observableEntity, a, feature_class, PARALLAX_GRAPH);
    return new_iri;
  },

  // port(port: Port) {
  //   const the_port: NamedNode = $rdf.sym(port.port_id);
  //   add.triple(the_port, a, harbourType, PARALLAX_GRAPH);
  //   add.triple(the_port, rdfsLabel, $rdf.literal(port.name), PARALLAX_GRAPH);
  //   // const latitude: NamedNode
  //   // latitude is as literal?
  // },

  observation(obs: Observation) {
    const observationIri: NamedNode = $rdf.sym(obs.id);
    const lat: string = obs.location.latitude.toString();
    const long: string = obs.location.longitude.toString();
    const date: string = obs.time.toISOString();
    const latitude: Literal = $rdf.literal(lat, decimal_literal_datatype);
    const longitude: Literal = $rdf.literal(long, decimal_literal_datatype);
    const timeLiteral: Literal = $rdf.literal(date, dateTime_literal_datatype);

    add.triple(observationIri, a, SosaObservationClass, PARALLAX_GRAPH);
    add.triple(observationIri, has_latitude, latitude, PARALLAX_GRAPH);
    add.triple(observationIri, has_longitude, longitude, PARALLAX_GRAPH);
    for (const entity of obs.entities) {
      add.triple(observationIri, is_about, $rdf.sym(entity), PARALLAX_GRAPH);
    }
    add.triple(observationIri, SosaResultTimeClass, timeLiteral, PARALLAX_GRAPH);
  },

  voyage(voyage: Voyage) {
    const voyageIri: Iri = voyage.id;
    const voyageNode: NamedNode = $rdf.sym(voyageIri);
    const VoyageClass: NamedNode = $rdf.sym(TermRegistry.getIRI('Voyage'));
    const start_time: Literal = $rdf.literal(voyage.start_time.toISOString(), dateTime_literal_datatype);
    const end_time: Literal = $rdf.literal(voyage.end_time.toISOString(), dateTime_literal_datatype);

    add.triple(voyageNode, a, VoyageClass, PARALLAX_GRAPH);
    add.triple(voyageNode, is_about, $rdf.sym(voyage.ship), PARALLAX_GRAPH);
    add.triple(voyageNode, has_start_time, start_time, PARALLAX_GRAPH);
    add.triple(voyageNode, has_end_time, end_time, PARALLAX_GRAPH);
    add.triple(voyageNode, has_start_port, $rdf.sym(voyage.start_port), PARALLAX_GRAPH);
    add.triple(voyageNode, has_end_port, $rdf.sym(voyage.end_port), PARALLAX_GRAPH);

    for (const point of voyage.points) {
      const cord: Coordinate = point.Coordinate;
      const time: Date = point.time;
      const pointIri: Iri = add.coordinate(generate_iri(), cord);
      const timeLiteral: Literal = $rdf.literal(time.toISOString(), dateTime_literal_datatype);
      add.triple(voyageNode, has_geometry, $rdf.sym(pointIri), PARALLAX_GRAPH);
      add.triple($rdf.sym(pointIri), SosaResultTimeClass, timeLiteral, PARALLAX_GRAPH);
    }

    add.label(voyage.id, 'Voyage');
  },

  coordinate(iri: Iri, cord: Coordinate): Iri {
    const feature: NamedNode = $rdf.sym(iri);
    const wktPoint: string = coordinateToWktPoint(cord);
    const point: Iri = generate_iri();
    const pointNode: NamedNode = $rdf.sym(point);
    const wktLiteral: Literal = $rdf.literal(wktPoint, wkt_literal_datatype);

    add.triple(feature, a, feature_class, PARALLAX_GRAPH);
    add.triple(feature, has_geometry, pointNode, PARALLAX_GRAPH);
    add.triple(pointNode, a, geometry_class, PARALLAX_GRAPH);
    add.triple(pointNode, has_wkt, wktLiteral, PARALLAX_GRAPH);

    return point;
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

    $rdf.serialize(null, subGraph, PARALLAX_GRAPH.value, 'text/turtle', (err: Error | null | undefined, str: string | undefined) => {
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
    const sparqlQuery: false | Query = $rdf.SPARQLToQuery(query, false, g_triple_store);
    if (sparqlQuery === false) {
      throw new Error('Failed to parse SPARQL query');
    }

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
};

// ================== Default Export ==================
export default {
  add,
  get,
  debug,
  init,
};

// =================== Private Functions ===================

function number_to_literal(x: number): Literal {
  const str: string = x.toString();
  const literal: Literal = $rdf.literal(str, decimal_literal_datatype);
  return literal;
}

function coordinateToWktPoint(cord: Coordinate): string {
  const WGS84_CRS = 'http://www.opengis.net/def/crs/EPSG/0/4326';
  const { latitude, longitude } = cord;

  return `<${WGS84_CRS}> POINT(${longitude} ${latitude})`;
}

function containsBlankNode(statement: Statement): boolean {
  //prettier-ignore
  if (statement.subject.termType === 'BlankNode' ||
      statement.object.termType === 'BlankNode') {
    return true;
  } else {
    return false;
  }
}

function getNamedGraphs(tripleStore: $rdf.IndexedFormula): Set<Iri> {
  const graphNames = new Set<Iri>();

  for (const stmt of tripleStore.statementsMatching(undefined, undefined, undefined, undefined)) {
    const graphIRI = stmt.why?.value as Iri;
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

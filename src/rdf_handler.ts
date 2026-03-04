import * as Fetcher from './fetcher';
import * as RDFLibWrapper from './dependencies/rdflib_wrapper';
import * as TermRegistry from './term_registry';
import { Iri, Label, Triple } from './aliases';
import { Port, Voyage, Coordinate, ObservableEntity } from './models';
import { Term } from 'rdflib';
type QueryResultRow = Record<string, Term>; // Represents a single row returned by a query.

async function init(): Promise<void> {
  initStore()
    .then(() => {
      //
    })
    .catch((err) => {
      console.error('rdf_handler: initStore() failed', err);
    })
    .then(initTermRegistry);
}

const add = {
  observableEntity(entityTypeString: string): Iri {
    let entityType: Iri = TermRegistry.getIRI(entityTypeString);
    const entity: Iri = RDFLibWrapper.add.observableEntity(entityType) as Iri;
    return entity;
  },

  observation(observedThing: Iri, lat: number, long: number, date: Date): void {
    RDFLibWrapper.add.observation(observedThing, lat, long, date);
  },

  port(port: Port): Iri {
    const harbour: Iri = add.observableEntity('harbour');
    RDFLibWrapper.add.label(harbour, port.name);
    return harbour;
  },

  voyage(voyage: Voyage): Iri {
    const voyageIri: Iri = RDFLibWrapper.add.voyage(voyage);
    return voyageIri;
  },

  label(iri: Iri, label: string): void {
    RDFLibWrapper.add.label(iri, label);
  },
};

const get = {
  instanceDataTriples(): Triple[] {
    return RDFLibWrapper.get.instanceData();
  },

  instanceDataTurtle(): string {
    return RDFLibWrapper.get.instanceDataTurtle();
  },

  graphNames(): Label[] {
    const graphs = RDFLibWrapper.get.allGraphs();
    return graphs;
  },

  allTriples(): Triple[] {
    const triples: Triple[] = RDFLibWrapper.get.allTriples();

    for (const triple of triples) {
      try {
        const subjectLabel = TermRegistry.getLabel(triple.subject);
        triple.subject = subjectLabel;
        console.log('Replaced IRI:', triple.subject, 'with label:', subjectLabel);
      } catch (error) {}
    }

    return triples;
  },

  coordinate(portIri: Iri): Coordinate {
    // TODO
    console.error('rdf_handler.get.coordinate() is not implemented yet');
    return { latitude: 0, longitude: 0 };
  },

  async ships(): Promise<ObservableEntity[]> {
    let query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX parallax: <https://parallax.nmsu.edu/ns/>
    PREFIX obo: <http://purl.obolibrary.org/obo/>

    SELECT ?ship ?label WHERE {
      
      ?ship ?p obo:ENVO_01000608 .
      ?ship rdfs:label ?label .
    }
    `;

    return RDFLibWrapper.runQuery(query).then((rows: QueryResultRow[]) => {
      const ships: ObservableEntity[] = [];
      for (const row of rows) {
        const id: Iri = row['?ship'].value;
        const label: string = row['?label'].value;
        const ship: ObservableEntity = { id, type: 'boat', label };
        ships.push(ship);
      }
      return ships;
    });
  },

  async allPorts(): Promise<Port[]> {
    const query = `
        PREFIX ActOfTravel: <https://www.commoncoreontologies.org/ont00000890>
        PREFIX is_about: <https://www.commoncoreontologies.org/ont00001808>
        PREFIX has_start_time: <https://parallax.nmsu.edu/ns/start_time>
        PREFIX has_end_time: <https://parallax.nmsu.edu/ns/end_time>
        PREFIX has_start_port: <https://parallax.nmsu.edu/ns/start_port>
        PREFIX has_end_port: <https://parallax.nmsu.edu/ns/end_port>
    
        PREFIX harbour: <http://purl.obolibrary.org/obo/ENVO_00000463>
    
        SELECT ?port ?label WHERE {
          ?port a harbour: .
          ?port rdfs:label ?label .
        }
        `;
    return RDFLibWrapper.runQuery(query).then((rows: QueryResultRow[]) => {
      const ports: Port[] = [];
      for (const row of rows) {
        console.log(row);
        const port: Port = {
          port_id: row['?port'].value,
          name: row['?label'].value,
          country: 'todo',
          latitude: 0,
          longitude: 0,
        };
        ports.push(port);
      }
      return ports;
    });
  },

  async allVoyages(): Promise<Voyage[]> {
    const query = `
        PREFIX ActOfTravel: <https://www.commoncoreontologies.org/ont00000890>
        PREFIX is_about: <https://www.commoncoreontologies.org/ont00001808>
        PREFIX has_start_time: <https://parallax.nmsu.edu/ns/start_time>
        PREFIX has_end_time: <https://parallax.nmsu.edu/ns/end_time>
        PREFIX has_start_port: <https://parallax.nmsu.edu/ns/start_port>
        PREFIX has_end_port: <https://parallax.nmsu.edu/ns/end_port>
    
        SELECT ?voyage ?ship ?start_time ?end_time ?start_port ?end_port WHERE {
          
          ?voyage a ActOfTravel: .
          ?voyage is_about: ?ship .
          ?voyage has_start_time: ?start_time .
          ?voyage has_end_time: ?end_time .
          ?voyage has_start_port: ?start_port .
          ?voyage has_end_port: ?end_port .
        }
        `;
    return RDFLibWrapper.runQuery(query).then((rows: QueryResultRow[]) => {
      const voyages: Voyage[] = [];
      for (const row of rows) {
        console.log(row);
        const voyageIri: Iri = row['?voyage'].value;
        const ship: Iri = row['?ship'].value;
        const start_time: Date = row['?start_time'].value;
        const end_time: Date = row['?end_time'].value;
        const start_port: Iri = row['?start_port'].value;
        const end_port: Iri = row['?end_port'].value;
        const voyage: Voyage = {
          ship,
          start_time: new Date(start_time),
          end_time: new Date(end_time),
          start_port,
          end_port,
        };
        voyages.push(voyage);
      }
      return voyages;
    });
  },

  async shipVoyages(ship: Iri): Promise<Voyage[]> {
    const query = `
    PREFIX ActOfTravel: <https://www.commoncoreontologies.org/ont00000890>
    PREFIX is_about: <https://www.commoncoreontologies.org/ont00001808>
    PREFIX has_start_time: <https://parallax.nmsu.edu/ns/start_time>
    PREFIX has_end_time: <https://parallax.nmsu.edu/ns/end_time>
    PREFIX has_start_port: <https://parallax.nmsu.edu/ns/start_port>
    PREFIX has_end_port: <https://parallax.nmsu.edu/ns/end_port>
    PREFIX is_about: <https://www.commoncoreontologies.org/ont00001808>
    
    SELECT ?voyage ?ship ?start_time ?end_time ?start_port ?end_port WHERE {
      
      ?voyage is_about: <${ship}> .
      ?voyage a ActOfTravel: .
      ?voyage is_about: ?ship .
      ?voyage has_start_time: ?start_time .
      ?voyage has_end_time: ?end_time .
      ?voyage has_start_port: ?start_port .
      ?voyage has_end_port: ?end_port .
    }
    `;

    return RDFLibWrapper.runQuery(query).then((rows: QueryResultRow[]) => {
      const voyages: Voyage[] = [];
      for (const row of rows) {
        const voyage: Voyage = {
          ship: row['?ship'].value,
          start_time: new Date(row['?start_time'].value),
          end_time: new Date(row['?end_time'].value),
          start_port: row['?start_port'].value,
          end_port: row['?end_port'].value,
        };
        voyages.push(voyage);
      }
      return voyages;
    });
  },
};

// ================== Private Functions ==================

function initTermRegistry(): void {
  // The term registry manages terms.
  // A term is a mapping between an IRI and a human-readable label.
  // Initialize the Term Registry by loading each IRI/label pair from the Triple Store.
  // todo: should rdf_handler initialize the term registry?
  //        if index.ts uses the term registry, perhaps it should initialize it.
  const mapping: { [key: Iri]: Label } = RDFLibWrapper.get.iriToLabelMapping();

  for (const [iri, label] of Object.entries(mapping)) {
    TermRegistry.addTerm(iri, label);
  }
}

async function initStore(): Promise<void> {
  const bfo = await Fetcher.fetchBFO();
  const bfoGraphIRI = TermRegistry.getIRI('bfoGraph');
  // RDFLibWrapper.add.rdfToStore(bfo.rdf, bfo.base, bfo.mime, bfoGraphIRI);

  const geoSparql = await Fetcher.fetchGeoSparql();
  const geoSparqlGraphIRI = TermRegistry.getIRI('geoSparqlGraph');
  RDFLibWrapper.add.rdfToStore(geoSparql.rdf, geoSparql.base, geoSparql.mime, geoSparqlGraphIRI);

  const envoOntology = await Fetcher.fetchEnvoBasicXml();
  const envoGraphIRI = TermRegistry.getIRI('envoGraph');
  // RDFLibWrapper.add.rdfToStore(envoOntology.rdf, envoOntology.base, envoOntology.mime, envoGraphIRI);

  const sosaOntology = await Fetcher.fetchSosa();
  const sosaGraphIRI = TermRegistry.getIRI('sosaGraph');
  // RDFLibWrapper.add.rdfToStore(sosaOntology.rdf, sosaOntology.base, sosaOntology.mime, sosaGraphIRI);
}

// ================== Debugging Functions ==================

export function logStore(): void {
  console.log('rdf_handler: logStore()');
  RDFLibWrapper.logInstanceData();
}

export function debug(): void {
  console.log('rdf_handler: debug()');
}

// ================== Default Export ==================

export default {
  init,
  add,
  get,
  logStore,
};

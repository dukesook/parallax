import * as Fetcher from './fetcher';
import * as RDFLibWrapper from './dependencies/rdflib_wrapper';
import * as TermRegistry from './term_registry';
import { Iri, Label, Triple } from './aliases';
import { Port, Voyage, Coordinate } from './models';

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
    console.log('entityTypeString:', entityTypeString);
    console.log('entityType IRI:', entityType);
    const entity = RDFLibWrapper.add.observableEntity(entityType) as Iri;
    return entity;
  },

  observation(observedThing: Iri, lat: number, long: number, date: Date): void {
    RDFLibWrapper.add.observation(observedThing, lat, long, date);
  },

  port(port: Port): Iri {
    const harbourType: Iri = TermRegistry.getIRI('harbour');
    const harbour: Iri = add.observableEntity(harbourType);

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
    const coordinate = RDFLibWrapper.get.coordinate(portIri);
    return coordinate;
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
  RDFLibWrapper.add.rdfToStore(bfo.rdf, bfo.base, bfo.mime, bfoGraphIRI);

  const geoSparql = await Fetcher.fetchGeoSparql();
  const geoSparqlGraphIRI = TermRegistry.getIRI('geoSparqlGraph');
  RDFLibWrapper.add.rdfToStore(geoSparql.rdf, geoSparql.base, geoSparql.mime, geoSparqlGraphIRI);

  const envoOntology = await Fetcher.fetchEnvoBasicXml();
  const envoGraphIRI = TermRegistry.getIRI('envoGraph');
  RDFLibWrapper.add.rdfToStore(envoOntology.rdf, envoOntology.base, envoOntology.mime, envoGraphIRI);

  const sosaOntology = await Fetcher.fetchSosa();
  const sosaGraphIRI = TermRegistry.getIRI('sosaGraph');
  RDFLibWrapper.add.rdfToStore(sosaOntology.rdf, sosaOntology.base, sosaOntology.mime, sosaGraphIRI);
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

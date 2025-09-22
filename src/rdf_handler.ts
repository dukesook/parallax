import * as Fetcher from './fetcher';
import * as RDFLibWrapper from './dependencies/rdflib_wrapper';
import * as TermRegistry from './term_registry';
import { Iri, Label, Triple } from './aliases';
import { Port } from './models';

export async function init(): Promise<void> {
  initStore()
    .then(() => {
      //
    })
    .catch((err) => {
      console.error('rdf_handler: initStore() failed', err);
    })
    .then(initTermRegistry);
}

export const add = {
  async observableEntity(entityType: string): Promise<Iri> {
    const iri = await RDFLibWrapper.addObservableEntity(entityType);
    return iri;
  },

  observation(observedThing: Iri, lat: number, long: number, date: Date): void {
    RDFLibWrapper.addObservation(observedThing, lat, long, date);
  },

  async port(port: Port) {
    const harbourType: Iri = TermRegistry.getIRI('harbour');
    const harbour: Iri = await add.observableEntity(harbourType);

    await RDFLibWrapper.add.label(harbour, port.name);
  },

  label(iri: Iri, label: string): void {
    RDFLibWrapper.add.label(iri, label);
  },
};

export const get = {
  instanceData(): string {
    return RDFLibWrapper.instanceDataToTurtle();
  },

  graphNames(): Label[] {
    const graphs = RDFLibWrapper.getGraphs();
    return graphs;
  },

  allTriples(): Triple[] {
    const triples: Triple[] = RDFLibWrapper.getTriples();

    for (const triple of triples) {
      try {
        const subjectLabel = TermRegistry.getLabel(triple.subject);
        triple.subject = subjectLabel;
        console.log('Replaced IRI:', triple.subject, 'with label:', subjectLabel);
      } catch (error) {}
    }

    return triples;
  },
};

// ================== Private Functions ==================

function initTermRegistry(): void {
  // `todo - autogenerate terms from Local Triple Store`
  const subjects: Set<String> = RDFLibWrapper.getSubjects();

  // print length of subjects
  console.log(`rdf_handler: initTermRegistry() found ${subjects.size} subjects in the triple store`);

  // query for each rdfs:label
  const results: { [key: Iri]: Label } = RDFLibWrapper.queryLabels();
  console.log(results);

  TermRegistry.addTerms(results);
  console.log('TermRegistry Number of Terms:', TermRegistry.getNumberOfTerms());
}

async function initStore(): Promise<void> {
  const bfo = await Fetcher.fetchBFO();
  const bfoGraphIRI = TermRegistry.getIRI('bfoGraph');
  RDFLibWrapper.addRDFToStore(bfo.rdf, bfo.base, bfo.mime, bfoGraphIRI);

  const geoSparql = await Fetcher.fetchGeoSparql();
  const geoSparqlGraphIRI = TermRegistry.getIRI('geoSparqlGraph');
  RDFLibWrapper.addRDFToStore(geoSparql.rdf, geoSparql.base, geoSparql.mime, geoSparqlGraphIRI);

  const envoOntology = await Fetcher.fetchEnvoBasicXml();
  const envoGraphIRI = TermRegistry.getIRI('envoGraph');
  RDFLibWrapper.addRDFToStore(envoOntology.rdf, envoOntology.base, envoOntology.mime, envoGraphIRI);

  const sosaOntology = await Fetcher.fetchSosa();
  const sosaGraphIRI = TermRegistry.getIRI('sosaGraph');
  RDFLibWrapper.addRDFToStore(sosaOntology.rdf, sosaOntology.base, sosaOntology.mime, sosaGraphIRI);
}

// ================== Debugging Functions ==================

export function logStore(): void {
  console.log('rdf_handler: logStore()');
  RDFLibWrapper.logInstanceData();
}

export function debug(): void {
  const turtle = RDFLibWrapper.instanceDataToTurtle();
  console.log(turtle);
  Fetcher.saveFile(turtle);
}

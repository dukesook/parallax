import { v4 as uuidv4 } from 'uuid'; //uuidv4() is a function
import * as Fetcher from './fetcher';
import * as RDFLibWrapper from './dependencies/rdflib_wrapper';
import * as TermRegistry from './term_registry';
import { Iri, Label, Triple } from './aliases';

export async function init(): Promise<void> {
  initStore()
    .then(() => {
      console.log('rdf_handler: initStore() completed');
    })
    .catch((err) => {
      console.error('rdf_handler: initStore() failed', err);
    })
    .then(initTermRegistry);
}

export function getTerms(): string[] {
  return TermRegistry.getTerms();
}

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
  RDFLibWrapper.addRDFToStore(bfo.rdf, bfo.base, bfo.mime);

  const geoSparql = await Fetcher.fetchGeoSparql();
  RDFLibWrapper.addRDFToStore(geoSparql.rdf, geoSparql.base, geoSparql.mime);

  const envoOntology = await Fetcher.fetchEnvoBasicXml();
  RDFLibWrapper.addRDFToStore(envoOntology.rdf, envoOntology.base, envoOntology.mime);
}

export function addObservableEntity(): void {
  // An object is a thing that can be observed, like a boat, airplane, or car.
  // NOT TO BE CONFUSED WITH A TRIPLE STORE OBJECT
}

export function getTriples(): Triple[] {
  const triples: Triple[] = RDFLibWrapper.getTriples();

  // TODO: Replace IRIs with labels where possible
  for (const triple of triples) {
    try {
      const subjectLabel = TermRegistry.getLabel(triple.subject);
      triple.subject = subjectLabel;
      console.log('Replaced IRI:', triple.subject, 'with label:', subjectLabel);
    } catch (error) {}
  }

  return triples;
}

// Warning: addObservation should not create observable objects.
export function addObservation(observedThing: string, lat: number, lng: number): void {
  console.log(`Adding observation for observed: ${observedThing}, lat: ${lat}, lng: ${lng}`);

  const observedThingIri = TermRegistry.getIRI(observedThing);
  console.log(`Observed Thing IRI: ${observedThingIri}`);
  // Create a unique identifier for the observation
  // const observationId = uuidv4();
  // console.log(`Generated observation ID: ${observationId}`);
}

// ================== Debugging Functions ==================

export function logStore(): void {
  console.log('rdf_handler: logStore()');
  RDFLibWrapper.logStore();
}

export function debug(): void {
  TermRegistry.debug();
}

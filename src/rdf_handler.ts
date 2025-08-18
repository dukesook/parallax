import { v4 as uuidv4 } from 'uuid'; //uuidv4() is a function
import * as Fetcher from './fetcher';
import * as RDFLibWrapper from './dependencies/rdflib_wrapper';
import * as TermRegistry from './term_registry';

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

function initTermRegistry(): void {
  // `todo - autogenerate terms from Local Triple Store`
  const subjects: Set<String> = RDFLibWrapper.getSubjects();

  // print length of subjects
  console.log(`rdf_handler: initTermRegistry() found ${subjects.size} subjects in the triple store`);

  // query for each rdfs:label
  RDFLibWrapper.queryLabels();
}

async function initStore(): Promise<void> {
  const bfo = await Fetcher.fetchBFO();
  RDFLibWrapper.addRDFToStore(bfo.rdf, bfo.base, bfo.mime);

  const geoSparql = await Fetcher.fetchGeoSparql();
  RDFLibWrapper.addRDFToStore(geoSparql.rdf, geoSparql.base, geoSparql.mime);

  const envoOntology = await Fetcher.fetchEnvoOntology();
  RDFLibWrapper.addRDFToStore(envoOntology.rdf, envoOntology.base, envoOntology.mime);
}

export function addObservableEntity(): void {
  // An object is a thing that can be observed, like a boat, airplane, or car.
  // NOT TO BE CONFUSED WITH A TRIPLE STORE OBJECT
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

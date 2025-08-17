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

  // log the set:
  subjects.forEach((subject) => {
    console.log(`rdf_handler: initTermRegistry() subject: ${subject}`);
  });
}

async function initStore(): Promise<void> {
  const bfo = await Fetcher.fetchBFO();
  RDFLibWrapper.addRDFToStore(bfo.rdf, bfo.base, bfo.mime);

  const geoSparql = await Fetcher.fetchGeoSparql();
  RDFLibWrapper.addRDFToStore(geoSparql.rdf, geoSparql.base, geoSparql.mime);
}

// Work in progress:
// Map strings to their IRIs

export function addObject(objectType: string): void {
  // TODO:
  // first, add a mapping bewteen object strings and their IRIs.
}

// Warning - addObseration should accept the IRI of the features of interest.
//         - If it doesn't exist, then addObject should create it first.
//         - SRP - addObservation should only handle obseration data, not object creation.
export function addObservation(object: string, lat: number, lng: number): void {
  console.log(`Adding observation for object: ${object}, lat: ${lat}, lng: ${lng}`);

  // Create a unique identifier for the observation
  const observationId = uuidv4();
  console.log(`Generated observation ID: ${observationId}`);

  // Add RDF data to the store
  // RDFLibWrapper.
}

// ================== Debugging Functions ==================

export function logStore(): void {
  console.log('rdf_handler: logStore()');
  RDFLibWrapper.logStore();
}

export function debug(): void {
  TermRegistry.debug();
}

import { v4 as uuidv4 } from 'uuid'; //uuidv4() is a function
import * as Fetcher from './fetcher';
import * as RDFLibWrapper from './dependencies/rdflib_wrapper';

export async function init(): Promise<void> {
  console.log('rdf_handler: init()');
  const turtleMime = 'text/turtle';

  // Fetch RDF
  const bfo = await Fetcher.fetchBFO();
  const bfoBase = 'http://purl.obolibrary.org/obo/bfo';
  RDFLibWrapper.addRDFToStore(bfo, bfoBase, turtleMime)
    .then(() => {
      console.log('BFO added to RDF store');
    })
    .catch((error) => {
      console.log('Parallax: Error adding BFO to RDF store:');
      console.error(error);
    });

  const geoSparql = await Fetcher.fetchGeoSparql();
  const geosparqlBase = 'http://www.opengis.net/ont/geosparql/';
  const jsonMime = 'application/ld+json';
  RDFLibWrapper.addRDFToStore(geoSparql, geosparqlBase, jsonMime)
    .then(() => {
      console.log('GeoSPARQL added to RDF store');
    })
    .catch((error) => {
      console.log('Parallax: Error adding GeoSPARQL to RDF store:');
      console.error(error);
    });
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

export function debug(): void {
  RDFLibWrapper.debug();
}

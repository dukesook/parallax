import { v4 as uuidv4 } from 'uuid';
import * as Fetcher from './fetcher';
import * as RDFLibWrapper from './dependencies/rdflib_wrapper';

export async function init(): Promise<void> {
  console.log('rdf_handler: init()');
  // Fetch RDF
  // const geoSpaql = await Fetcher.fetchGeoSparql();
  // const bfo = await Fetcher.fetchBFO();
  // console.log(' ');
  // console.log('Fetched BFO:\n', bfo);
}

const newId = uuidv4();
console.log('Generated UUID:', newId);

export function debug(): void {
  RDFLibWrapper.debug();
}

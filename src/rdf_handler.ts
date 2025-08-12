import { v4 as uuidv4 } from 'uuid';
import * as Fetcher from './fetcher';
import * as $rdf from 'rdflib';
import * as RDFLibWrapper from './dependencies/rdflib_wrapper';

const g_triple_store = new $rdf.Store();

export async function init(url: string): Promise<void> {
  // Fetch RDF
  const geoSpaql = await Fetcher.fetchGeoSparql();
  const bfo = await Fetcher.fetchBFO();
}

const newId = uuidv4();
console.log('Generated UUID:', newId);

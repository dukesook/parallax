import { v4 as uuidv4 } from 'uuid';
import * as Fetcher from './fetcher';
import * as $rdf from 'rdflib';
import * as RDFLibWrapper from './dependencies/rdflib_wrapper';

const g_triple_store = new $rdf.Store();

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
  // Add triple to store
  console.log('creating triple...');
  const subject = $rdf.sym('http://parallax.edu/ns/subject1');
  const predicate = $rdf.sym('http://parallax.edu/ns/predicate1');
  const object = $rdf.literal('Object1');

  g_triple_store.add(subject, predicate, object);
  console.log('Added triple to store');
}

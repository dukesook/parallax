import { BiMap } from '@rimbu/bimap';
import { Iri, Label } from './aliases';

export const Term = {
  // Parallax
  is_about: 'https://parallax.nmsu.edu/ns/is_about',
  has_start_time: 'https://parallax.nmsu.edu/ns/start_time',
  has_end_time: 'https://parallax.nmsu.edu/ns/end_time',
  has_start_port: 'https://parallax.nmsu.edu/ns/start_port',
  has_end_port: 'https://parallax.nmsu.edu/ns/end_port',
  parallax_namespace: 'https://parallax.nmsu.edu/',
  voyage: 'https://parallax.nmsu.edu/ns/voyage',
  has_observation: 'https://parallax.nmsu.edu/ns/has_observation',

  // GeoSPARQL
  has_latitude: 'http://www.w3.org/2003/01/geo/wgs84_pos#lat',
  has_longitude: 'http://www.w3.org/2003/01/geo/wgs84_pos#long',
  has_geometry: 'http://www.opengis.net/ont/geosparql#hasGeometry',
  has_wkt: 'http://www.opengis.net/ont/geosparql#asWKT',
  geometry_class: 'http://www.opengis.net/ont/geosparql#Geometry',
  feature_class: 'http://www.opengis.net/ont/geosparql#Feature',

  // SOSA
  observation_sosa_class: 'http://www.w3.org/ns/sosa/Observation',
  resultTime_sosa_class: 'http://www.w3.org/ns/sosa/resultTime',
  sosa_namespace: 'https://www.w3.org/ns/sosa/',

  // RDF and RDFS
  is_a: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  has_label: 'http://www.w3.org/2000/01/rdf-schema#label',

  // ENVO
  harbour_class: 'http://purl.obolibrary.org/obo/ENVO_00000463',

  // Literals
  wkt_literal_datatype: 'http://www.opengis.net/ont/geosparql#wktLiteral',
  decimal_literal_datatype: 'http://www.w3.org/2001/XMLSchema#decimal',
  dateTime_literal_datatype: 'http://www.w3.org/2001/XMLSchema#dateTime',
};

// prettier-ignore
let g_bimap = BiMap.of<Iri, Label>(
    ['https://github.com/BFO-ontology/BFO', 'bfoGraph'],
    ['https://github.com/EnvironmentOntology/envo', 'envoGraph'],
    ['https://github.com/opengeospatial/ogc-geosparql', 'geoSparqlGraph'],
    [Term.sosa_namespace, 'sosaGraph'],
    ['https://parallax.nmsu.edu/', 'parallaxGraph'],
    [Term.has_observation, 'has_observation'],
    [Term.has_start_time, 'start_time'],
    [Term.has_end_time, 'end_time'],
    [Term.has_start_port, 'start_port'],
    [Term.has_end_port, 'end_port'],
    [Term.voyage, 'Voyage'], // Voyage
    [Term.is_about, 'is_about'],
    [Term.has_latitude, 'latitude'],
    [Term.has_longitude, 'longitude'],
    ['http://purl.obolibrary.org/obo/ENVO_01000608', 'boat'],
    ['http://purl.obolibrary.org/obo/ENVO_03501349', 'airplane'],
    ['http://purl.obolibrary.org/obo/ENVO_01000605', 'car'],
    ['http://purl.obolibrary.org/obo/ENVO_00000463', 'harbour'],
  );

export function addTerm(iri: string, label: string): void {
  const hasIri = g_bimap.hasKey(iri);
  const hasLabel = g_bimap.hasValue(label);

  if (hasIri) {
    throw new Error(`IRI already exists: ${iri}`);
  }

  if (hasLabel) {
    // Some labels are duplicated
    // console.warn('Label aready exists, skipping: ' + label + ' - <' + iri + '>');
    return;
  }

  g_bimap = g_bimap.set(iri, label);
}

export function addTerms(terms: { [key: Iri]: Label }): void {
  Object.entries(terms).forEach(([iri, label]) => {
    if (g_bimap.hasKey(iri) || g_bimap.hasValue(label)) {
      throw new Error(`Term already exists: ${iri} or ${label}`);
    }
  });

  const builder = g_bimap.toBuilder();
  Object.entries(terms).forEach(([iri, label]) => {
    builder.set(iri, label);
  });
  g_bimap = builder.build();
}

export function addTermsArray(terms: Array<{ iri: Iri; label: Label }>): void {
  // Convert array into object
  const obj: { [key: Iri]: Label } = {};
  terms.forEach(({ iri, label }) => {
    obj[iri] = label;
  });

  // Delegate to addTerms
  addTerms(obj);
}

export function getIRI(label: string): Iri {
  // Check if an IRI was passed in instead of a label:
  if (g_bimap.hasKey(label)) {
    throw new Error(`getIRI(): Expected a label, but got an IRI: ${label}`);
  }

  const iri = g_bimap.getKey(label);
  if (!iri) {
    throw new Error(`IRI not found for label: ${label}`);
  }
  return iri;
}

export function getLabel(iri: Iri): string {
  const label = g_bimap.getValue(iri);
  if (!label) {
    throw new Error(`Label not found for IRI: ${iri}`);
  }
  return label;
}

export function getNumberOfTerms(): number {
  return g_bimap.size;
}

export function getTerms(): Label[] {
  return Array.from(g_bimap.values());
}

export function clear(): void {
  g_bimap = BiMap.empty<Iri, Label>();
}

export function debug(): void {
  console.log('Term Registry Debug Info:');
  console.log(`Total terms: ${g_bimap.size}`);
}

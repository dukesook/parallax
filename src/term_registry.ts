import { BiMap } from '@rimbu/bimap';
import { Iri, Label } from './aliases';

// prettier-ignore
let g_bimap = BiMap.of<Iri, Label>(
    ['https://github.com/BFO-ontology/BFO', 'bfoGraph'],
    ['https://github.com/EnvironmentOntology/envo', 'envoGraph'],
    ['https://github.com/opengeospatial/ogc-geosparql', 'geoSparqlGraph'],
    ['https://www.w3.org/ns/sosa/', 'sosaGraph'],
    ['https://parallax.nmsu.edu/', 'parallaxGraph'],
    ['https://parallax.nmsu.edu/ns/voyage', 'voyage'],
    ['https://www.commoncoreontologies.org/ont00000890', 'ActOfTravel'], // Voyage
    ['https://www.commoncoreontologies.org/ont00001808', 'is_about'],
);

// boat = http://purl.obolibrary.org/obo/ENVO_01000608
// airplane = http://purl.obolibrary.org/obo/ENVO_03501349
// car  = http://purl.obolibrary.org/obo/ENVO_01000605
// harbour = http://purl.obolibrary.org/obo/ENVO_00000463

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

export function getIRI(label: string): string {
  const iri = g_bimap.getKey(label);
  if (!iri) {
    throw new Error(`IRI not found for label: ${label}`);
  }
  return iri;
}

export function getLabel(iri: string): string {
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

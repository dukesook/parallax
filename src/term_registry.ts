import { BiMap } from '@rimbu/bimap';

type Iri = string;
type Label = string;

// prettier-ignore
let g_bimap = BiMap.of<Iri, Label>(
  ['http://x/Person', 'Person'],
  ['http://x/Name', 'Name'],
);

export function addTerm(iri: string, label: string): void {
  if (g_bimap.hasKey(iri) || g_bimap.hasValue(label)) {
    throw new Error(`Term already exists: ${iri} or ${label}`);
  }
  g_bimap = g_bimap.set(iri, label);
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

export function debug(): void {
  console.log('Term Registry Debug Info:');
  console.log(`Total terms: ${getNumberOfTerms()}`);
  addTerm('http://x/Observation', 'Observation');
  console.log(`Total terms: ${getNumberOfTerms()}`);
}

import { BiMap } from '@rimbu/bimap';

// =================================== EXAMPLE ===================================
type Iri = string;
type Label = string;

// prettier-ignore
const m = BiMap.of<Iri, Label>(
  ['http://x/Person', 'Person'],
  ['http://x/Name', 'Name'],
);

// forward lookup (IRI -> label)
const personLabel = m.getValue('http://x/Person'); // "Person"
console.log(`Label for IRI 'http://x/Person': ${personLabel}`);

// reverse lookup (label -> IRI)
const nameIRI = m.getKey('Name'); // "http://x/Name"
console.log(`IRI for label 'Name': ${nameIRI}`);
// =================================== EXAMPLE ===================================

let g_bimap: BiMap<string, string> = BiMap.empty();

export function getIRI(label: string): string {
  const iri = g_bimap.keyKey(label);
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

export function debug(): void {
  console.log('term_registry: debug()');
}

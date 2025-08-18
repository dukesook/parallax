import { BiMap } from '@rimbu/bimap';

type Iri = string;
type Label = string;

// prettier-ignore
let g_bimap = BiMap.of<Iri, Label>();

// boat = http://purl.obolibrary.org/obo/ENVO_01000608
// airplane = http://purl.obolibrary.org/obo/ENVO_03501349
// car  = http://purl.obolibrary.org/obo/ENVO_01000605

export function addTerm(iri: string, label: string): void {
  if (g_bimap.hasKey(iri) || g_bimap.hasValue(label)) {
    throw new Error(`Term already exists: ${iri} or ${label}`);
  }
  g_bimap = g_bimap.set(iri, label);
}

export function addTerms(terms: Array<{ iri: Iri; label: Label }>): void {
  terms.forEach(({ iri, label }) => {
    if (g_bimap.hasKey(iri) || g_bimap.hasValue(label)) {
      throw new Error(`Term already exists: ${iri} or ${label}`);
    }
  });

  const builder = g_bimap.toBuilder();

  terms.forEach(({ iri, label }) => {
    builder.set(iri, label);
  });
  g_bimap = builder.build();
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

export function clear(): void {
  g_bimap = BiMap.empty<Iri, Label>();
}

export function debug(): void {
  console.log('Term Registry Debug Info:');
  console.log(`Total terms: ${g_bimap.size}`);
}

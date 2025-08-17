import * as Bimap from '@rimbu/bimap';
// Documentation: https://rimbu.org/docs/collections/bimap

// prettier-ignore
const g_bimap = Bimap.bimap<string, string>().of(
//['key', 'value']
  ['iri1', 'value1'],
  ['iri2', 'value2'],
  ['iri3', 'value3'],
  ['iri4', 'value4'],
  ['iri5', 'value5'],
);

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

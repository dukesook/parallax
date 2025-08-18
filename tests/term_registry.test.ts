// term_registry.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import * as Registry from '../src/term_registry';

beforeEach(() => {
  Registry.clear();
});

describe('term_registry', () => {
  it('addTerm adds a single IRI ↔ label and supports both lookups', () => {
    Registry.addTerm('iri:person', 'Person');

    expect(Registry.getLabel('iri:person')).toBe('Person');
    expect(Registry.getIRI('Person')).toBe('iri:person');
    expect(Registry.getNumberOfTerms()).toBe(1);
  });

  it('addTerm rejects duplicate IRI', () => {
    Registry.addTerm('iri:person', 'Person');
    expect(() => Registry.addTerm('iri:person', 'Human')).toThrow(/already exists/i);
    expect(Registry.getNumberOfTerms()).toBe(1);
  });

  it('addTerm rejects duplicate label', () => {
    Registry.addTerm('iri:person', 'Person');
    expect(() => Registry.addTerm('iri:human', 'Person')).toThrow(/already exists/i);
    expect(Registry.getNumberOfTerms()).toBe(1);
  });

  it('getLabel throws for missing IRI', () => {
    expect(() => Registry.getLabel('iri:missing')).toThrow(/Label not found/i);
  });

  it('getIRI throws for missing label', () => {
    expect(() => Registry.getIRI('Missing')).toThrow(/IRI not found/i);
  });

  it('addTerms adds multiple mappings at once', () => {
    Registry.addTerms([
      { iri: 'iri:person', label: 'Person' },
      { iri: 'iri:name', label: 'Name' },
      { iri: 'iri:title', label: 'Title' },
    ]);

    expect(Registry.getNumberOfTerms()).toBe(3);
    expect(Registry.getLabel('iri:name')).toBe('Name');
    expect(Registry.getIRI('Title')).toBe('iri:title');
  });

  it('addTerms throws when any incoming IRI or label already exists in the registry', () => {
    Registry.addTerm('iri:person', 'Person');

    expect(() =>
      Registry.addTerms([
        { iri: 'iri:person', label: 'Human' }, // conflicts on IRI
        { iri: 'iri:name', label: 'Name' },
      ])
    ).toThrow(/already exists/i);

    // state remains unchanged
    expect(Registry.getNumberOfTerms()).toBe(1);
    expect(Registry.getLabel('iri:person')).toBe('Person');
  });

  it('addTerms: duplicates within the same batch are allowed by current implementation (last write wins)', () => {
    Registry.addTerms([
      { iri: 'iri:a', label: 'X' },
      { iri: 'iri:b', label: 'X' }, // same label in the same batch
    ]);

    // Only one binding for label X survives, bound to the last IRI
    expect(Registry.getNumberOfTerms()).toBe(1);
    expect(Registry.getIRI('X')).toBe('iri:b');
    expect(() => Registry.getLabel('iri:a')).toThrow(/Label not found/i);
  });

  it('clear resets the registry', () => {
    Registry.addTerm('iri:person', 'Person');
    expect(Registry.getNumberOfTerms()).toBe(1);

    Registry.clear();
    expect(Registry.getNumberOfTerms()).toBe(0);
    expect(() => Registry.getLabel('iri:person')).toThrow(/Label not found/i);
  });
});

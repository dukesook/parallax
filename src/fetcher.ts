import { readdir } from 'fs/promises';
import { join } from 'path';

// const geoSparqlUrl = 'https://opengeospatial.github.io/ogc-geosparql/geosparql11/geo.ttl';
const geoSparqlUrl = 'https://opengeospatial.github.io/ogc-geosparql/geosparql10/geo.json';
// const bfoPath = '/parallax/rdf/bfo.owl';
const bfoPath = 'https://raw.githubusercontent.com/BFO-ontology/BFO-2020/refs/heads/master/src/owl/bfo-core.ttl';
// const envoOntologyUrl = 'http://purl.obolibrary.org/obo/envo.owl';
const envoOntologyPath = '/parallax/rdf/envo.owl';

export type RdfFile = {
  rdf: string;
  base: string;
  mime: string;
};

export async function fetchGeoSparql(): Promise<RdfFile> {
  const geoSparql = {
    rdf: await fetchFile(geoSparqlUrl),
    base: 'http://www.opengis.net/ont/geosparql/',
    mime: 'application/ld+json',
  };
  return geoSparql;
}

export async function fetchBFO(): Promise<RdfFile> {
  const bfo = {
    rdf: await fetchFile(bfoPath),
    base: 'http://purl.obolibrary.org/obo/bfo',
    mime: 'text/turtle',
  };
  return bfo;
}

export async function fetchEnvoOntology(): Promise<RdfFile> {
  const envoOntology = {
    rdf: await fetchFile(envoOntologyPath),
    base: 'http://purl.obolibrary.org/obo/envo.owl',
    mime: 'application/rdf+xml',
  };
  return envoOntology;
}

export async function logEachFile(): Promise<void> {
  const modules = import.meta.glob('/parallax/rdf/*', { as: 'raw' }); //glob is Vite-specific

  for (const path in modules) {
    console.log(path);
    const content = await modules[path]();
    console.log(content);
  }
}

async function fetchFile(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const ttlText = await res.text();
    return ttlText;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
}

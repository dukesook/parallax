import { readdir } from 'fs/promises';
import { join } from 'path';

// const bfoPath = '/parallax/rdf/bfo.owl';

// TODO: Use a subset:
//    - https://github.com/EnvironmentOntology/envo/tree/master/subsets
// const envoOntologyUrl = 'http://purl.obolibrary.org/obo/envo.owl';
const envoOntologyPath = '/parallax/rdf/envo.owl';

export type RdfFile = {
  url: string;
  rdf: string;
  base: string;
  mime: string;
};

export async function fetchGeoSparql(): Promise<RdfFile> {
  const geoSparqlUrl = 'https://opengeospatial.github.io/ogc-geosparql/geosparql11/geo.json';
  const localPath = '/parallax/rdf/geo.json';
  const geoSparql = {
    url: geoSparqlUrl,
    rdf: await fetchFile(localPath),
    base: 'http://www.opengis.net/ont/geosparql/',
    mime: 'application/ld+json',
  };
  return geoSparql;
}

export async function fetchBFO(): Promise<RdfFile> {
  const bfoPath = 'https://raw.githubusercontent.com/BFO-ontology/BFO-2020/refs/heads/master/21838-2/owl/bfo-core.owl';
  const bfo = {
    url: bfoPath,
    rdf: await fetchFile(bfoPath),
    base: 'http://purl.obolibrary.org/obo/bfo',
    mime: 'application/rdf+xml',
  };
  return bfo;
}

export async function fetchEnvoBasicXml(): Promise<RdfFile> {
  const envoBasicXml = 'https://raw.githubusercontent.com/EnvironmentOntology/envo/refs/heads/master/subsets/envo-basic.owl';
  const envoOntology = {
    url: envoBasicXml,
    rdf: await fetchFile(envoBasicXml),
    base: 'http://purl.obolibrary.org/obo/subsets/envo-basic.owl',
    mime: 'application/rdf+xml',
  };
  return envoOntology;
}

// Warning - JSON uses ldl instead of rdfs:label
async function fetchBasicEnvoJSON(): Promise<RdfFile> {
  const envoBasicJSON = 'https://raw.githubusercontent.com/EnvironmentOntology/envo/refs/heads/master/subsets/envo-basic.json';
  const envoOntology = {
    url: envoBasicJSON,
    rdf: await fetchFile(envoBasicJSON),
    base: 'http://purl.obolibrary.org/obo/subsets/envo-basic.owl',
    mime: 'application/ld+json',
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

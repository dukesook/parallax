const geoSparqlUrl = 'https://opengeospatial.github.io/ogc-geosparql/geosparql11/geo.ttl';

const bfoPath = '/parallax/rdf/bfo.owl';

export async function fetchGeoSparql(): Promise<string> {
  const geoSparql = await fetchFile(geoSparqlUrl);
  return geoSparql;
}

export async function fetchBFO(): Promise<string> {
  const bfo = await fetchFile(bfoPath);
  return bfo;
}

async function fetchFile(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const ttlText = await res.text();
    return ttlText;
  } catch (error) {
    console.error(`❌ Failed to fetch ${url}:`, error);
    throw error;
  }
}

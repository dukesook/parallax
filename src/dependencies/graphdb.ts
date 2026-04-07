import { Coordinate } from '../models';

const query_basic: string = `
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

  SELECT ?s ?p ?o
  WHERE {
    ?s ?p ?o
  }
  LIMIT 10
`;

const endpoint: string = 'http://localhost:7200/repositories/use_shacl';
type SparqlResult = {
  head: {
    vars: string[];
  };
  results: {
    bindings: SparqlResultRow[];
  };
};

type SparqlResultRow = {
  [variableName: string]: SparqlVariable;
};

type SparqlVariable = {
  type: string;
  value: string;
  datatype?: string; // Optional, only for literals
};

export function init(): void {}

export async function computeDistance(wkt1: string, wkt2: string): Promise<number | null> {
  const query = `
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
    PREFIX uom: <http://www.opengis.net/def/uom/OGC/1.0/>
    
    SELECT ?distance
    WHERE {
      BIND (geof:distance("${wkt1}"^^geo:wktLiteral, "${wkt2}"^^geo:wktLiteral, uom:metre) AS ?distance)
    }
  `;

  return runSparql(query).then((bindings: SparqlResultRow[]) => {
    const distance: number | null = extractDistance(bindings);
    // if (distance !== null) {
    //   console.log(`Distance between points: ${distance} meters`);
    // } else {
    //   console.log('Failed to extract distance from SPARQL results.');
    // }
    return distance;
  });
}

function extractDistance(bindings: SparqlResultRow[]): number | null {
  if (bindings.length === 0) {
    console.log('No results found for the query.');
    return null;
  }

  const firstResult: SparqlResultRow = bindings[0];
  const distanceVariable: SparqlVariable = firstResult['distance'];

  if (!distanceVariable) {
    console.error('The variable "distance" is not present in the query results.');
    return null;
  }

  if (distanceVariable.type !== 'literal') {
    console.error(`Expected "distance" to be a literal, but got type "${distanceVariable.type}".`);
    return null;
  }

  const distanceValue: string = distanceVariable.value;
  const distanceDatatype: string | undefined = distanceVariable.datatype;

  if (distanceDatatype !== 'http://www.w3.org/2001/XMLSchema#double') {
    console.warn(`Expected "distance" to have datatype xsd:double, but got "${distanceDatatype}". Attempting to parse as number.`);
  }

  const distanceNumber: number = parseFloat(distanceValue);
  if (isNaN(distanceNumber)) {
    console.error(`Failed to parse "distance" value "${distanceValue}" as a number.`);
    return null;
  }

  return distanceNumber;
}

export function make_point_wkt(c: Coordinate): string {
  return `POINT(${c.longitude} ${c.latitude})`;
}

export function make_linestring_wkt(coordinates: Coordinate[]): string {
  const pointsWkt = coordinates.map((c) => `${c.longitude} ${c.latitude}`).join(', ');
  return `LINESTRING(${pointsWkt})`;
}

async function runSparql(query: string): Promise<SparqlResultRow[]> {
  const response: Response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/sparql-query',
      Accept: 'application/sparql-results+json',
    },
    body: query,
  });

  if (!response.ok) {
    throw new Error(`GraphDB query failed: ${response.status} ${response.statusText}`);
  }

  const data: SparqlResult = await response.json();
  const bindings: SparqlResultRow[] = data.results.bindings;
  return bindings;
}

function make_query(c1: Coordinate, c2: Coordinate): string {
  // Query that finds the distance between two points
  const wkt1 = make_point_wkt(c1);
  const wkt2 = make_point_wkt(c2);

  const query = `
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>
    PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
    
    SELECT ?distance
    WHERE {
      BIND (geof:distance("${wkt1}"^^geo:wktLiteral, "${wkt2}"^^geo:wktLiteral) AS ?distance)
    }
      `;

  console.log('Generated SPARQL query:', query);
  return query;
}

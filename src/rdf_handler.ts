import * as Fetcher from './fetcher';
import * as RDFLibWrapper from './dependencies/rdflib_wrapper';
import * as GraphDB from './dependencies/graphdb';
import * as TermRegistry from './term_registry';
import { Iri, Label, Triple } from './aliases';
import { Port, Voyage, ObservableEntity, Coordinate, Observation, Observation } from './models';
import type { Bindings } from 'rdflib/lib/types';

const boatClass: Iri = TermRegistry.getIRI('boat');
const harbourClass: Iri = TermRegistry.getIRI('harbour');

async function init(): Promise<void> {
  initStore()
    .then(() => {
      //
    })
    .catch((err) => {
      console.error('rdf_handler: initStore() failed', err);
    })
    .then(initTermRegistry);

  GraphDB.init();
}

export function generateIri(): Iri {
  return RDFLibWrapper.generate_iri();
}

const add = {
  ship(shipName: string): Iri {
    const iri: Iri = addEntity(shipName, boatClass);
    return iri;
  },

  observation(obs: Observation): void {
    RDFLibWrapper.add.observation(obs);
  },

  port(port: Port): Iri {
    const harbour: Iri = addEntity(port.name, harbourClass);
    RDFLibWrapper.add.label(harbour, port.name);

    const cord: Coordinate = { latitude: port.latitude, longitude: port.longitude };

    RDFLibWrapper.add.coordinate(harbour, cord);
    // TODO: port.country

    return harbour;
  },

  voyage(voyage: Voyage): void {
    RDFLibWrapper.add.voyage(voyage);
  },

  label(iri: Iri, label: string): void {
    RDFLibWrapper.add.label(iri, label);
  },
};

const get = {
  instanceDataTriples(): Triple[] {
    return RDFLibWrapper.get.instanceData();
  },

  instanceDataTurtle(): string {
    return RDFLibWrapper.get.instanceDataTurtle();
  },

  graphNames(): Label[] {
    const graphs = RDFLibWrapper.get.allGraphs();
    return graphs;
  },

  allTriples(): Triple[] {
    const triples: Triple[] = RDFLibWrapper.get.allTriples();

    for (const triple of triples) {
      try {
        const s: Iri = triple.subject as Iri;
        const subjectLabel = TermRegistry.getLabel(s);
        triple.subject = subjectLabel;
        console.log('Replaced IRI:', triple.subject, 'with label:', subjectLabel);
      } catch (error) {}
    }

    return triples;
  },

  async coordinate(feature: Iri): Promise<Coordinate> {
    let query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX parallax: <https://parallax.nmsu.edu/ns/>
    PREFIX obo: <http://purl.obolibrary.org/obo/>
    PREFIX geo: <http://www.opengis.net/ont/geosparql#>

    SELECT ?label ?wkt WHERE {
      
      <${feature}> a geo:Feature .
      <${feature}> rdfs:label ?label .
      <${feature}> geo:hasGeometry ?geometry .
      ?geometry a geo:Geometry .
      ?geometry geo:asWKT ?wkt .
    }
    `;

    return RDFLibWrapper.runQuery(query).then((rows: Bindings[]) => {
      const cords: Coordinate[] = [];
      if (rows.length != 1) {
        console.warn('Expected exactly one result for coordinate query, got ' + rows.length);
      }
      const row = rows[0];
      const label: string = row['?label'].value;
      const wkt: string = row['?wkt'].value;
      const cord: Coordinate = parseWKTPoint(wkt);
      return cord;
    });
  },

  async ships(): Promise<ObservableEntity[]> {
    let query = `
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX parallax: <https://parallax.nmsu.edu/ns/>
    PREFIX obo: <http://purl.obolibrary.org/obo/>

    SELECT ?ship ?label WHERE {
      
      ?ship ?p obo:ENVO_01000608 .
      ?ship rdfs:label ?label .
    }
    `;

    return RDFLibWrapper.runQuery(query).then((rows: Bindings[]) => {
      const ships: ObservableEntity[] = [];
      for (const row of rows) {
        const id: Iri = row['?ship'].value as Iri;
        const label: string = row['?label'].value;
        const ship: ObservableEntity = { id, type: 'boat', label };
        ships.push(ship);
      }
      return ships;
    });
  },

  async allPorts(): Promise<Port[]> {
    const query = `
        PREFIX is_about: <${TermRegistry.Term.is_about}>
        PREFIX has_start_time: <https://parallax.nmsu.edu/ns/start_time>
        PREFIX has_end_time: <https://parallax.nmsu.edu/ns/end_time>
        PREFIX has_start_port: <https://parallax.nmsu.edu/ns/start_port>
        PREFIX has_end_port: <https://parallax.nmsu.edu/ns/end_port>
        PREFIX geo: <http://www.opengis.net/ont/geosparql#>
        PREFIX harbour: <${TermRegistry.Term.harbour_class}>
    
        SELECT ?port ?label WHERE {
          ?port a harbour: .
          ?port rdfs:label ?label .

          ?port a geo:Feature . 
          ?port geo:hasGeometry ?geometry .
          ?geometry a geo:Geometry .
          ?geometry geo:asWKT ?wkt .
        }
        `;
    return RDFLibWrapper.runQuery(query).then((rows: Bindings[]) => {
      const ports: Port[] = [];
      for (const row of rows) {
        console.log(row);
        const wkt: string = row['?wkt'].value;
        const cord: Coordinate = parseWKTPoint(wkt);

        const port: Port = {
          port_id: row['?port'].value as Iri,
          name: row['?label'].value,
          country: 'todo',
          latitude: cord.latitude,
          longitude: cord.longitude,
        };
        ports.push(port);
      }
      return ports;
    });
  },

  async allVoyages(): Promise<Voyage[]> {
    const query = makeVoyageQuery();
    return RDFLibWrapper.runQuery(query).then(returnVoyages);
  },

  async allFeatures(): Promise<ObservableEntity[]> {
    const query = `  
      PREFIX geo: <http://www.opengis.net/ont/geosparql#> 
      SELECT * WHERE {
        ?feature a geo:Feature .
        ?feature a ?type .
        ?feature rdfs:label ?label .
        FILTER(!sameTerm(?type, geo:Feature))
        FILTER(?type != geo:Feature)
      }
    `;
    return RDFLibWrapper.runQuery(query).then((rows: Bindings[]) => {
      const features: ObservableEntity[] = [];
      if (rows.length === 0) {
        console.warn('No features found in allFeatures query');
      }
      for (const row of rows) {
        const featureIri: Iri = row['?feature'].value as Iri;
        const typeIri: Iri = row['?type'].value as Iri;
        if (typeIri === 'http://www.opengis.net/ont/geosparql#Feature') {
          // geo:Features have 2 rdf:types: 1. geoFeature and 2: EVNO:something (boat, plane, car, etc.)
          // ?feature is the geo:Feature, ?type is the other type that we're searching for.
          // FILTER() is supposed to account for this, but it's not working.
          continue;
        }
        console.log('typeIri: ' + typeIri);
        const typeLabel: string = TermRegistry.getLabel(typeIri);
        const label: string = row['?label'].value;
        const feature: ObservableEntity = {
          id: featureIri,
          type: typeLabel,
          label: label,
        };
        features.push(feature);
      }

      return features;
    });
  },

  async shipVoyages(ship: Iri): Promise<Voyage[]> {
    const query = makeVoyageQuery(ship);

    return RDFLibWrapper.runQuery(query).then(returnVoyages);
  },

  async allObservations(): Promise<Observation[]> {
    const query = `
    PREFIX sosa: <http://www.w3.org/ns/sosa/>
    PREFIX has_latitude: <http://www.w3.org/2003/01/geo/wgs84_pos#lat>
    PREFIX has_longitude: <http://www.w3.org/2003/01/geo/wgs84_pos#long>
    PREFIX is_about: <${TermRegistry.Term.is_about}>

    SELECT * WHERE {
      ?obs a sosa:Observation .
      ?obs has_latitude: ?lat .
      ?obs has_longitude: ?long .
      ?obs sosa:resultTime ?time .
      ?obs is_about: ?entity .
    }
    `;

    return RDFLibWrapper.runQuery(query).then(resultsToObservations);
  },

  async observations(entity: Iri): Promise<Observation[]> {
    const query = `
    PREFIX sosa: <http://www.w3.org/ns/sosa/>
    PREFIX has_latitude: <http://www.w3.org/2003/01/geo/wgs84_pos#lat>
    PREFIX has_longitude: <http://www.w3.org/2003/01/geo/wgs84_pos#long>
    PREFIX is_about: <${TermRegistry.Term.is_about}>

    SELECT * WHERE {
      ?obs a sosa:Observation .
      ?obs has_latitude: ?lat .
      ?obs has_longitude: ?long .
      ?obs sosa:resultTime ?time .
      ?obs is_about: <${entity}> .
      ?obs is_about: ?entity .
      }
      `;
    // Setting the ?entity variable enables reuse of the resultsToObservations function
    // Warning! This may not work with multiple entities per observation

    return RDFLibWrapper.runQuery(query).then(resultsToObservations);
  },
};

// ================== Private Functions ==================

function addEntity(label: string, entityClass: Iri): Iri {
  const iri: Iri = RDFLibWrapper.add.observableEntity(entityClass);
  RDFLibWrapper.add.label(iri, label);
  return iri;
}

function initTermRegistry(): void {
  // The term registry manages terms.
  // A term is a mapping between an IRI and a human-readable label.
  // Initialize the Term Registry by loading each IRI/label pair from the Triple Store.
  // todo: should rdf_handler initialize the term registry?
  //        if index.ts uses the term registry, perhaps it should initialize it.
  const mapping: { [key: Iri]: Label } = RDFLibWrapper.get.iriToLabelMapping();

  for (const [iri, label] of Object.entries(mapping)) {
    TermRegistry.addTerm(iri, label);
  }
}

async function initStore(): Promise<void> {
  const testData = await Fetcher.fetchTestData();
  RDFLibWrapper.add.rdfToStore(testData.rdf, testData.base, testData.mime, TermRegistry.getIRI('parallaxGraph'));

  const bfo = await Fetcher.fetchBFO();
  const bfoGraphIRI = TermRegistry.getIRI('bfoGraph');
  // RDFLibWrapper.add.rdfToStore(bfo.rdf, bfo.base, bfo.mime, bfoGraphIRI);

  const geoSparql = await Fetcher.fetchGeoSparql();
  const geoSparqlGraphIRI = TermRegistry.getIRI('geoSparqlGraph');
  // RDFLibWrapper.add.rdfToStore(geoSparql.rdf, geoSparql.base, geoSparql.mime, geoSparqlGraphIRI);

  const envoOntology = await Fetcher.fetchEnvoBasicXml();
  const envoGraphIRI = TermRegistry.getIRI('envoGraph');
  // RDFLibWrapper.add.rdfToStore(envoOntology.rdf, envoOntology.base, envoOntology.mime, envoGraphIRI);

  const sosaOntology = await Fetcher.fetchSosa();
  const sosaGraphIRI = TermRegistry.getIRI('sosaGraph');
  // RDFLibWrapper.add.rdfToStore(sosaOntology.rdf, sosaOntology.base, sosaOntology.mime, sosaGraphIRI);
}

function resultsToObservations(rows: Bindings[]): Observation[] {
  const observations: Observation[] = [];
  for (const row of rows) {
    const obs: Observation = {
      id: row['?obs'].value as Iri,
      location: {
        latitude: parseFloat(row['?lat'].value),
        longitude: parseFloat(row['?long'].value),
      },
      time: new Date(row['?time'].value),
      entities: [row['?entity'].value],
    };
    observations.push(obs);
  }
  return observations;
}

function parseWKTPoint(wkt: string): Coordinate {
  // Remove CRS prefix if present
  const idx = wkt.indexOf('POINT');
  if (idx === -1) {
    throw new Error('Invalid WKT: POINT not found');
  }
  const pointPart = wkt.slice(idx);

  const match = pointPart.match(/POINT\s*\(\s*([^\s]+)\s+([^\s]+)\s*\)/i);

  if (!match) {
    throw new Error('Invalid WKT POINT');
  }

  const longitude = parseFloat(match[1]);
  const latitude = parseFloat(match[2]);

  return { latitude, longitude };
}

function makeVoyageQuery(maybeShip: Iri | null = null): string {
  let ship: Iri | string = '?ship'; // get all ships

  if (maybeShip) {
    ship = `<${maybeShip}>`; // get specific ship
  }

  const query = `
        PREFIX Voyage: <https://parallax.nmsu.edu/ns/voyage>
        PREFIX is_about: <https://parallax.nmsu.edu/ns/is_about>
        PREFIX has_latitude: <http://www.w3.org/2003/01/geo/wgs84_pos#lat>
        PREFIX has_longitude: <http://www.w3.org/2003/01/geo/wgs84_pos#long>
        PREFIX sosa: <http://www.w3.org/ns/sosa/>
    
        SELECT ?voyage ?ship ?lat ?long ?time WHERE {
          ?voyage a Voyage: .
          ?voyage is_about: ${ship} .
          ?observation a sosa:Observation .
          ?observation is_about: ?voyage .
          ?observation has_latitude: ?lat .
          ?observation has_longitude: ?long .
          ?observation sosa:resultTime ?time .
        }
        `;
  return query;
}

async function returnVoyages(rows: Bindings[]): Promise<Voyage[]> {
  const voyageMap: Map<Iri, Voyage> = new Map();

  for (const row of rows) {
    const voyageIri: Iri = row['?voyage'].value as Iri;
    const ship: Iri = row['?ship'].value as Iri;
    const obs_iri: Iri = row['?observation'].value as Iri;
    const lat: number = parseFloat(row['?lat'].value);
    const long: number = parseFloat(row['?long'].value);
    const cord: Coordinate = { latitude: lat, longitude: long };
    const date: Date = new Date(row['?time'].value);

    let voyage: Voyage | undefined = voyageMap.get(voyageIri);
    if (!voyage) {
      voyage = {
        id: voyageIri,
        ship: ship,
        points: [],
      };
      voyageMap.set(voyageIri, voyage);
    }

    const point: Observation = {
      id: obs_iri,
      location: cord,
      time: date,
      entities: [voyageIri],
    };
    voyage.points.push(point);
  }

  // Map to List
  const voyages: Voyage[] = Array.from(voyageMap.values());

  return voyages;
}

// ================== Debugging Functions ==================

export function logStore(): void {
  console.log('rdf_handler: logStore()');
  RDFLibWrapper.logInstanceData();
}

export function debug(): void {
  console.log('rdf_handler: debug()');
}

// ================== Default Export ==================

export default {
  generateIri,
  init,
  add,
  get,
  logStore,
};

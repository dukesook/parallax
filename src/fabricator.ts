import RdfHandler from './rdf_handler';
import { Iri } from './aliases';
import { Port, Voyage, Observation, Coordinate } from './models';
import { faker } from '@faker-js/faker';
import rdf_handler from './rdf_handler';
import { FabricatorOptions } from './models';

let g_ports: Iri[] = [];
let g_voyages: Iri[] = [];

export async function generateData(options: FabricatorOptions): Promise<void> {
  const n_ships = options.n_boats;
  const n_trips_per_boat = options.n_trips_per_boat;
  let ships: Iri[] = generateShips(n_ships);
  generatePorts();
  generateVoyages(n_trips_per_boat);
  console.log('Data fabrication complete.');
}

const boat: Iri = 'http://purl.obolibrary.org/obo/ENVO_01000608';

function generateShips(desiredCount: number = 6): Iri[] {
  let ships: Iri[] = [];

  //prettier-ignore
  const boatNames = [
    'Ship - Red October',
    'Ship - USS Enterprise',
    'Ship - Black Pearl',
    'Ship - Flying Dutchman',
    'Ship - The Titanic',
    'Ship - Booty Hunter',
  ];

  if (desiredCount == boatNames.length) {
    for (const name of boatNames) {
      const iri = RdfHandler.add.observableEntity(boat);
      RdfHandler.add.label(iri, name);
      ships.push(iri);
    }
  }

  for (let i = 0; i < desiredCount; i++) {
    const shipName = fabricateShipName();
    const iri = RdfHandler.add.observableEntity(boat);
    RdfHandler.add.label(iri, 'ship - ' + shipName);
    ships.push(iri);
  }

  return ships;
}

function generatePorts() {
  console.log('generatePorts()');
  const ports: Port[] = [
    { port_id: 'P001', name: 'Port of Los Angeles', country: 'USA', latitude: 33.7361, longitude: -118.2631 },
    { port_id: 'P002', name: 'Port of Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737 },
    { port_id: 'P003', name: 'Port of Rotterdam', country: 'Netherlands', latitude: 51.948, longitude: 4.1345 },
    { port_id: 'P004', name: 'Port of Singapore', country: 'Singapore', latitude: 1.2644, longitude: 103.82 },
    { port_id: 'P005', name: 'Port of Sydney', country: 'Australia', latitude: -33.8523, longitude: 151.2108 },
  ];

  for (const port of ports) {
    const port_iri: Iri = RdfHandler.add.port(port);
    g_ports.push(port_iri);
  }
}

function generateVoyages(desiredCount: number = 100) {
  for (let i = 0; i < desiredCount; i++) {
    const voyage = fabricateVoyage();
    const voyageIri: Iri = RdfHandler.add.voyage(voyage);
    g_voyages.push(voyageIri);

    // const observation_start: Observation = {
    // }

    const coordinate: Coordinate = rdf_handler.get.coordinate(voyage.start_port);
    const lat_start: number = 0; // Placeholder
    const long_start: number = 0; // Placeholder
    RdfHandler.add.observation(voyage.ship, lat_start, long_start, voyage.start_time);
  }
}

function fabricateVoyage(ships: Iri[]): Voyage {
  const ship: Iri = getRandomShip(ships);

  // Get two different ports
  const start_port: Iri = getRandomPort();
  let end_port: Iri = getRandomPort();
  while (end_port === start_port) {
    end_port = getRandomPort();
  }

  // Dates
  const start_time: Date = getRandomDate();
  const durationDays = Math.floor(Math.random() * 30) + 1;
  const end_time: Date = new Date(start_time);
  end_time.setDate(start_time.getDate() + durationDays);

  const voyage: Voyage = {
    ship: ship,
    start_port: start_port,
    end_port: end_port,
    start_time: start_time,
    end_time: end_time,
  };
  return voyage;
}

function fabricateShipName(): string {
  const adjective = faker.word.adjective({ length: { min: 4, max: 8 } });
  const noun = faker.word.noun({ length: { min: 4, max: 8 } });
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const fakeName = `${capitalize(adjective)} ${capitalize(noun)}`;
  return fakeName;
}

function getRandomShip(ships: Iri[]): Iri {
  if (ships.length === 0) {
    throw new Error('Fabricator.getRandomShip(): No ships available');
  }
  const randomIndex = getRandomIndex(ships);
  return ships[randomIndex];
}

function getRandomPort(): Iri {
  const randomIndex = getRandomIndex(g_ports);
  return g_ports[randomIndex];
}

function getRandomIndex(data: any[]): number {
  return Math.floor(Math.random() * data.length);
}

function getRandomDate(): Date {
  const start = new Date(2020, 0, 1); // January 1, 2023
  const end = new Date(2025, 11, 31); // December 31, 2023
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
}

function generateTrips() {
  console.log('generateTrips()');
}

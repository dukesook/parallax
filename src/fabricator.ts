import RdfHandler from './rdf_handler';
import { Iri } from './aliases';
import { Port, Voyage, Observation, Coordinate } from './models';
import { faker } from '@faker-js/faker';
import rdf_handler from './rdf_handler';
import { FabricatorOptions } from './models';

export async function generateData(options: FabricatorOptions): Promise<void> {
  const n_ships = options.n_boats;
  const n_trips_per_boat = options.n_trips_per_boat;
  const n_valid_observations_per_trip = options.n_valid_observations_per_trip;
  const ships: Iri[] = generateShips(n_ships);
  const ports = generatePorts();
  const voyages: Voyage[] = generateVoyages(n_trips_per_boat, ships, ports);
  const observations: Observation[] = generateObservations(voyages, n_valid_observations_per_trip);
  console.log('Data fabrication complete.');
}

const BOAT: string = 'boat';

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
      const iri = RdfHandler.add.observableEntity(BOAT);
      RdfHandler.add.label(iri, name);
      ships.push(iri);
    }
  }

  for (let i = 0; i < desiredCount; i++) {
    const shipName = fabricateShipName();
    const iri: Iri = RdfHandler.add.observableEntity(BOAT);
    RdfHandler.add.label(iri, shipName);
    ships.push(iri);
  }

  return ships;
}

function generatePorts(): Iri[] {
  let ports: Iri[] = [];
  const port_objects: Port[] = [
    { port_id: 'P001', name: 'Port of Los Angeles', country: 'USA', latitude: 33.7361, longitude: -118.2631 },
    { port_id: 'P002', name: 'Port of Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737 },
    { port_id: 'P003', name: 'Port of Rotterdam', country: 'Netherlands', latitude: 51.948, longitude: 4.1345 },
    { port_id: 'P004', name: 'Port of Singapore', country: 'Singapore', latitude: 1.2644, longitude: 103.82 },
    { port_id: 'P005', name: 'Port of Sydney', country: 'Australia', latitude: -33.8523, longitude: 151.2108 },
  ];

  for (const port of port_objects) {
    const port_iri: Iri = RdfHandler.add.port(port);
    ports.push(port_iri);
  }
  return ports;
}

function generateVoyages(desiredCount: number, ships: Iri[], ports: Iri[]): Voyage[] {
  let voyages: Voyage[] = [];

  // TODO: vary the number of voyages per ship

  for (const ship of ships) {
    for (let i = 0; i < desiredCount; i++) {
      const voyage: Voyage = fabricateVoyage(ship, ports);
      RdfHandler.add.voyage(voyage);
      voyages.push(voyage);
    }
  }

  return voyages;
}

async function generateObservations(voyages: Voyage[], n_valid_observations_per_trip: number): Observation[] {
  let observations: Observation[] = [];

  for (const voyage of voyages) {
    for (let i = 0; i < n_valid_observations_per_trip; i++) {
      const cord: Coordinate = await fabricateCoordinateBetweenPorts(voyage.start_port, voyage.end_port);
      const date: Date = getRandomDateBetween(voyage.start_time, voyage.end_time);
      const obs: Observation = {
        id: RdfHandler.generateIri(),
        location: cord,
        time: date,
        entities: [voyage.ship],
      };
      RdfHandler.add.observation(obs);
      observations.push(obs);
    }
  }
  return observations;
}

function fabricateVoyage(ship: Iri, ports: Iri[]): Voyage {
  // Get two different ports
  const start_port: Iri = getRandomPort(ports);
  let end_port: Iri = getRandomPort(ports);
  while (end_port === start_port) {
    end_port = getRandomPort(ports);
  }

  // Dates
  const start_time: Date = getRandomDate();
  const durationDays = Math.floor(Math.random() * 30) + 1;
  const end_time: Date = new Date(start_time);
  end_time.setDate(start_time.getDate() + durationDays);

  const voyage: Voyage = {
    id: RdfHandler.generateIri(),
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

function getRandomPort(ports: Iri[]): Iri {
  const randomIndex = getRandomIndex(ports);
  return ports[randomIndex];
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

async function fabricateCoordinateBetweenPorts(start_port: Iri, end_port: Iri): Promise<Coordinate> {
  const start_cord: Coordinate = await RdfHandler.get.coordinate(start_port);
  const end_cord: Coordinate = await RdfHandler.get.coordinate(end_port);

  // y = mx + b
  // Ystart - Yend = m(Xstart - Xend)
  const yStart: number = start_cord.latitude;
  const yEnd: number = end_cord.latitude;
  const xStart: number = start_cord.longitude;
  const xEnd: number = end_cord.longitude;
  const m = (yStart - yEnd) / (xStart - xEnd);
  const b = yStart - m * xStart;

  const long = getRandomInRange(start_cord.longitude, end_cord.longitude);
  // const lat = getRandomInRange(start_cord.latitude, end_cord.latitude);
  const lat = m * long + b;
  return { latitude: lat, longitude: long };
}

function getRandomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getRandomDateBetween(start: Date, end: Date): Date {
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime);
}

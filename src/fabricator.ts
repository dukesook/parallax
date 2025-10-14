import RdfHandler from './rdf_handler';
import { Iri } from './aliases';
import { Port, Voyage } from './models';
import { get } from 'http';

let g_ships: Iri[] = [];
let g_ports: Iri[] = [];
let g_voyages: Iri[] = [];

export async function generateData() {
  generateShips();
  generatePorts();
  generateVoyages();
}

function generateShips() {
  console.log('generateShips()');

  const boat: Iri = 'http://purl.obolibrary.org/obo/ENVO_01000608';
  //prettier-ignore
  const boatNames = [
    'Ship - Red October',
    'Ship - USS Enterprise',
    'Ship - Black Pearl',
    'Ship - Flying Dutchman',
    'Ship - Titanic',
    'Ship - Booty Hunter',
  ];

  for (const name of boatNames) {
    const iri = RdfHandler.add.observableEntity(boat);
    console.log('Generated Ship IRI:', iri);
    RdfHandler.add.label(iri, name);
    g_ships.push(iri);
  }
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

  ports.forEach((port) => {
    const port_iri: Iri = RdfHandler.add.port(port);
    g_ports.push(port_iri);
  });
}

function generateVoyages() {
  // generate 100 voyages
  console.log('generateVoyages()');
  for (let i = 0; i < 10; i++) {
    const voyage = fabricateVoyage();
    const voyageIri: Iri = RdfHandler.add.voyage(voyage);
    g_voyages.push(voyageIri);
    console.log('Generated Voyage IRI:', voyageIri);
  }
}

function fabricateVoyage(): Voyage {
  const ship: Iri = getRandomShip();

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

function getRandomShip(): Iri {
  const randomIndex = getRandomIndex(g_ships);
  return g_ships[randomIndex];
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

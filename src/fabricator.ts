import RdfHandler from './rdf_handler';
import { Iri } from './aliases';
import { Port, Voyage } from './models';

let g_ships: Iri[] = [];
let g_ports: Iri[] = [];

export async function generateData() {
  await generateShips();
  await generatePorts();
  generateVoyages();
}

async function generateShips() {
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
    RdfHandler.add.observableEntity(boat).then((iri: Iri) => {
      console.log('Generated Ship IRI:', iri);
      RdfHandler.add.label(iri, name);
      g_ships.push(iri);
    });
  }
}

async function generatePorts() {
  console.log('generatePorts()');
  const ports: Port[] = [
    { port_id: 'P001', name: 'Port of Los Angeles', country: 'USA', latitude: 33.7361, longitude: -118.2631 },
    { port_id: 'P002', name: 'Port of Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737 },
    { port_id: 'P003', name: 'Port of Rotterdam', country: 'Netherlands', latitude: 51.948, longitude: 4.1345 },
    { port_id: 'P004', name: 'Port of Singapore', country: 'Singapore', latitude: 1.2644, longitude: 103.82 },
    { port_id: 'P005', name: 'Port of Sydney', country: 'Australia', latitude: -33.8523, longitude: 151.2108 },
  ];

  ports.forEach(async (port) => {
    const port_iri: Iri = await RdfHandler.add.port(port);
    g_ports.push(port_iri);
  });
}

function generateVoyages() {
  // A voyage consists of:
  //  1. A ship
  //  2. A departure port
  //  3. An arrival port
  //  4. A departure date
  //  5. An arrival date
  //   export interface Voyage {
  //   ship: string;
  //   start_time: Date;
  //   end_time: Date;
  //   start_port: Iri;
  //   end_port: Iri;
  // }
  const myVoyage: Voyage = {
    ship: g_ships[0],
    start_port: g_ports[0],
    end_port: g_ports[1],
    start_time: new Date('2023-01-01T10:00:00Z'),
    end_time: new Date('2023-01-15T15:00:00Z'),
  };
  const voyageIri: Iri = RdfHandler.add.voyage(myVoyage);
}

function generateTrips() {
  console.log('generateTrips()');
}

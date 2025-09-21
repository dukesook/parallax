import * as RdfHandler from './rdf_handler';
import { Iri } from './aliases';

let g_ships = [];

function generateData() {
  generateShips();
  generatePorts();
  generateTrips();
}

function generateShips() {
  console.log('generateShips()');
  RdfHandler.addObservableEntity('Ship').then((iri: Iri) => {
    console.log('Generated Ship IRI:', iri);
    g_ships.push(iri);
  });
}

function generatePorts() {
  console.log('generatePorts()');
  const ports = [
    { port_id: 'P001', name: 'Port of Los Angeles', country: 'USA', latitude: 33.7361, longitude: -118.2631 },
    { port_id: 'P002', name: 'Port of Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737 },
    { port_id: 'P003', name: 'Port of Rotterdam', country: 'Netherlands', latitude: 51.948, longitude: 4.1345 },
    { port_id: 'P004', name: 'Port of Singapore', country: 'Singapore', latitude: 1.2644, longitude: 103.82 },
    { port_id: 'P005', name: 'Port of Sydney', country: 'Australia', latitude: -33.8523, longitude: 151.2108 },
  ];
}

function generateTrips() {
  console.log('generateTrips()');
}

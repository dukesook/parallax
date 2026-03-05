import * as GMaps from './use_gmaps';
import RdfHandler from './rdf_handler';
import * as Gui from './gui/gui';
import * as GraphTab from './gui/knowledge_graph_tab';
import * as Fabricator from './fabricator';
import { Triple, Iri } from './aliases';
import * as Fetcher from './fetcher';
import { FabricatorOptions as FabricatorOptions, ObservableEntity } from './models';
import { Coordinate, Voyage, Port } from './models';
import Scanner from './scanner';

const debugButton = document.getElementById('debug-button');
const debug2Button = document.getElementById('debug2-button');
const logStoreButton = document.getElementById('log-store-button');

debugButton?.addEventListener('click', debug);
debug2Button?.addEventListener('click', debug2);
logStoreButton?.addEventListener('click', logStore);

document.addEventListener('DOMContentLoaded', async () => {
  // Init GUI
  // Init RDF Handler
  RdfHandler.init();

  Gui.initGui().then(() => {
    const gmapElement = Gui.getGmapElement();
    GMaps.loadGoogleMapsScript(gmapElement);

    GraphTab.init().then(() => {
      GraphTab.On.listTriplesButton(showTriples);
      GraphTab.On.listGraphsButton(showGraphs);
      GraphTab.On.listInstanceData(showInstanceData);
      GraphTab.On.listShipsButton(showShips);
      GraphTab.On.listVoyagesButton(showVoyages);
      GraphTab.On.listPortsButton(showPorts);
      GraphTab.On.scan(scanKGraph);
    });

    // Listeners
    Gui.On.fabricateData(fabricateData);
    Gui.On.saveButton(onAddObservation);
    Gui.On.writeGraphToFile(writeGraphToFile);

    // Temporary: Fabricate data on load for testing
    fabricateData();
    // Temporary: Fabricate data on load for testing
  });

  GMaps.addMapListener(onclickMap);

  console.log('DOM fully loaded');
});

function onclickMap(event: google.maps.MapMouseEvent): void {
  if (event.latLng) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    Gui.displayLatLng(lat, lng);
    // google.maps.LatLngLiteral
    const latLngLiteral: google.maps.LatLngLiteral = {
      lat: lat,
      lng: lng,
    };
    GMaps.moveCurrentMarker(latLngLiteral);
  }
}

async function onAddObservation(): Promise<void> {
  const selectedObject = Gui.getSelectedObject();
  const { lat, lng } = Gui.getLatLng();
  console.log(`Saving data for object: ${selectedObject}, lat: ${lat}, lng: ${lng}`);

  const message = 'A ' + selectedObject + ' was observed at ' + lat + ', ' + lng;
  Gui.displayMessage(message);

  const objectIri = await RdfHandler.add.observableEntity(selectedObject);
  const timestamp = new Date();
  RdfHandler.add.observation(objectIri, lat, lng, timestamp);
}

function writeGraphToFile(): void {
  console.log('writeGraphToFile()');
  const rdf = RdfHandler.get.instanceDataTurtle();
  Fetcher.saveFile(rdf, 'graph.ttl');
}

function showTriples(): void {
  // Get Triples
  const triples: Triple[] = RdfHandler.get.allTriples();
  console.log('Triples:', triples);

  // Display Triples
  Gui.displayTriples(triples);
}

function showGraphs(): void {
  const graphs = RdfHandler.get.graphNames();
  GraphTab.displayGraphs(graphs);
}

function showInstanceData(): void {
  const instanceData: Triple[] = RdfHandler.get.instanceDataTriples();
  GraphTab.displayTriples(instanceData);
}

function showShips(): void {
  RdfHandler.get.ships().then((ships) => {
    GraphTab.displayObservableEntities(ships, onClickShip);
  });
}

function showVoyages() {
  console.log('index.ts - showVoyages()');
  RdfHandler.get.allVoyages().then((voyages) => {
    GraphTab.displayObjects(voyages);
  });
}

function showPorts() {
  console.log('index.ts - showPorts()');
  RdfHandler.get.allPorts().then((ports) => {
    GraphTab.displayObjects(ports);
  });
}

function scanKGraph(): void {
  Scanner.scan();
}

function fabricateData(): void {
  const options = Gui.Get.fabricatorUserInput() as FabricatorOptions;
  Fabricator.generateData(options);
}

async function onClickShip(entity: ObservableEntity) {
  RdfHandler.get.shipVoyages(entity.id).then((voyages) => {
    // Display First Voyage
    const voyage: Voyage = voyages[0];
    const startPort: Iri = voyage.start_port;
    const endPort: Iri = voyage.end_port;

    // TODO: Refactor voyages to have a list of coordinates
    // TODO: Get all the coordinates for a voyage

    RdfHandler.get.coordinate(startPort).then((startCoordinate: Coordinate) => {
      console.log('Start Coordinate:', startCoordinate);
    });

    // const startCoordinate: Coordinate = RdfHandler.get.coordinate(startPort);
    // const endCoordinate: Coordinate = RdfHandler.get.coordinate(endPort);
    // GMaps.drawLine(startCoordinate, endCoordinate);
  });
}

function logStore(): void {
  console.log('logStore()');
  RdfHandler.logStore();
}

function debug() {
  console.log('debug()');
  GMaps.debug();
}

function debug2() {
  console.log('debug2()');
}

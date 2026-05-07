import * as GMaps from './use_gmaps';
import RdfHandler from './rdf_handler';
import * as Gui from './gui/gui';
import * as GraphTab from './gui/knowledge_graph_tab';
import * as Fabricator from './fabricator';
import { Triple, Iri } from './aliases';
import * as Fetcher from './fetcher';
import { FabricatorOptions as FabricatorOptions, ObservableEntity, Observation, ObservationWithDistance } from './models';
import { Coordinate, Voyage, Port } from './models';
import Scanner from './scanner';

// Options
const FABRICATE_ON_LOAD = false;

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
      GraphTab.On.listObservationsButton(showObservations);
      GraphTab.On.scan(scanKGraph);
    });

    // Listeners
    Gui.On.fabricateData(fabricateData);
    Gui.On.addObservation(addObservation);
    Gui.On.writeGraphToFile(writeGraphToFile);
    Gui.On.readRdfFile(readRdfFile);
    Gui.On.showTargetsButton(showTargets);
    Gui.On.scanTargetButton(scanTarget);

    if (FABRICATE_ON_LOAD) {
      fabricateData();
    }
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

async function addObservation(): Promise<void> {
  // Adding new Entity
  const selectedObject = Gui.getSelectedObject();
  const { lat, lng } = Gui.getLatLng();

  const message = 'A ' + selectedObject + ' was observed at ' + lat + ', ' + lng;
  Gui.displayMessage(message);

  const objectIri = Gui.getCurrentTargetIri();

  const timestamp = new Date();
  const obs: Observation = {
    id: RdfHandler.generateIri(),
    location: { latitude: lat, longitude: lng },
    time: timestamp,
    entities: [objectIri],
  };
  RdfHandler.add.observation(obs);
}

function writeGraphToFile(): void {
  console.log('writeGraphToFile()');
  const rdf = RdfHandler.get.instanceDataTurtle();
  Fetcher.saveFile(rdf, 'graph.ttl');
}

async function readRdfFile(event: Event) {
  const target = event.target as HTMLInputElement;
  const fileList = target.files as FileList;
  if (fileList.length > 0) {
    const selectedFile = fileList[0];
    console.log(`File Name: ${selectedFile.name}`);
    console.log(`File Size: ${selectedFile.size} bytes`);
    const content: string = await selectedFile.text();
    RdfHandler.addRdf(content);
  }
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
  RdfHandler.get.ships().then((ships: ObservableEntity[]) => {
    GraphTab.displayObservableEntities(ships, onClickShip);
  });
}

function showVoyages() {
  RdfHandler.get.allVoyages().then((voyages: Voyage[]) => {
    GraphTab.displayObjects(voyages);
  });
}

function showPorts() {
  RdfHandler.get.allPorts().then((ports) => {
    GraphTab.displayObjects(ports);
  });
}

function showObservations() {
  console.log('index.ts - showObservations()');
  RdfHandler.get.allObservations().then((observations) => {
    GraphTab.displayObjects(observations);
  });
}

async function scanTarget() {
  const selectedObject: Iri = Gui.getCurrentTargetIri();
  const threshold: number = parseInt((document.getElementById('distanceThreshold') as HTMLInputElement).value, 10);

  console.log('threshold:', threshold);

  // Get All Voyages for ship
  const voyages: Voyage[] = await RdfHandler.get.shipVoyages(selectedObject);

  // Get Observations for ship
  const observations: Observation[] = await RdfHandler.get.observations(selectedObject);

  // Scan Each Voyage
  const suspicousObservations: ObservationWithDistance[] = [];
  for (const voyage of voyages) {
    const results: ObservationWithDistance[] = await Scanner.scanVoyage(voyage, observations, threshold);
    suspicousObservations.push(...results);
  }

  const count: number = suspicousObservations.length;
  if (count === 0) {
    Gui.displayMessage('No observations found within ' + threshold + ' meters of the voyages');
  } else {
    Gui.displayMessage(count + ' observations found within ' + threshold + ' meters of the voyages');
  }
}

function scanKGraph() {
  Scanner.scan(); // TODO
}

function onClickHarbour(harbourIri: Iri) {
  console.log('Clicked on Harbour: ' + harbourIri);
  RdfHandler.get.coordinate(harbourIri).then((coordinate) => {
    console.log('Harbour Coordinate:', coordinate);
    GMaps.centerMap(coordinate);
  });
}

function onClickObservableEntity(entity: ObservableEntity) {
  if (entity.type === 'boat') {
    onClickShip(entity);
  } else if (entity.type === 'harbour') {
    onClickHarbour(entity.id);
  } else {
    console.log('No click handler for entity type: ' + entity.type);
  }

  // Populate "Add Obervation" fields
  Gui.populateObservationFields(entity);
}

function showTargets() {
  // RdfHandler.get.ships().then((features: ObservableEntity[]) => {
  //   Gui.displayObservableEntities(features, onClickObservableEntity);
  // });

  RdfHandler.get.allVoyages().then((voyages: Voyage[]) => {
    Gui.displayVoyages(voyages, onClickVoyage);
  });
}

function fabricateData() {
  const options = Gui.Get.fabricatorUserInput() as FabricatorOptions;
  Fabricator.generateData(options);
}

async function onClickShip(entity: ObservableEntity) {
  RdfHandler.get.shipVoyages(entity.id).then(async (voyages) => {
    // Display First Voyage
    GMaps.clearLines();
    for (const voyage of voyages) {
      for (let i = 0; i < voyage.points.length - 1; i++) {
        const start = voyage.points[i];
        const end = voyage.points[i + 1];
        const startCoordinate: Coordinate = start.location;
        const endCoordinate: Coordinate = end.location;
        GMaps.drawLine(startCoordinate, endCoordinate);
      }
    }

    // Center Map
    const firstVoyage: Voyage = voyages[0];
    const observtionCount: number = firstVoyage.points.length;
    const centerObservation: Observation = firstVoyage.points[Math.floor(observtionCount / 2)];
    GMaps.centerMap(centerObservation.location);
  });

  GMaps.clearMarkers();
  RdfHandler.get.observations(entity.id).then((observations) => {
    observations.forEach((obs) => {
      const location: Coordinate = obs.location;
      GMaps.addMarkers(location);
    });
  });
}

async function onClickVoyage(voyage: Voyage) {
  console.log('Clicked on Voyage: ' + voyage.id);

  GMaps.clearLines();

  for (let i = 0; i < voyage.points.length - 1; i++) {
    const start = voyage.points[i];
    const end = voyage.points[i + 1];
    const startCoordinate: Coordinate = start.location;
    const endCoordinate: Coordinate = end.location;
    GMaps.drawLine(startCoordinate, endCoordinate);
  }

  // Center Map
  const observtionCount: number = voyage.points.length;
  const centerObservation: Observation = voyage.points[Math.floor(observtionCount / 2)];
  GMaps.centerMap(centerObservation.location);

  const entity: ObservableEntity = {
    id: voyage.ship,
    type: 'boat',
    label: 'Boat ' + voyage.ship,
  };
  Gui.populateObservationFields(entity);
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

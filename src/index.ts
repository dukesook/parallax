import * as GMaps from './use_gmaps';
import RdfHandler from './rdf_handler';
import * as Gui from './gui/gui';
import * as GraphTab from './gui/knowledge_graph_tab';
import * as Fabricator from './fabricator';
import { Triple, Iri } from './aliases';
import * as Fetcher from './fetcher';
import { FabricatorOptions as FabricatorOptions, ObservableEntity, Observation } from './models';
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
    Gui.On.addObservation(onAddObservation);
    Gui.On.writeGraphToFile(writeGraphToFile);
    Gui.On.readRdfFile(readRdfFile);
    Gui.On.showTargetsButton(showTargets);

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

async function onAddObservation(): Promise<void> {
  // Adding new Entity
  const selectedObject = Gui.getSelectedObject();
  const { lat, lng } = Gui.getLatLng();

  const message = 'A ' + selectedObject + ' was observed at ' + lat + ', ' + lng;
  Gui.displayMessage(message);

  const objectIri = Gui.getAddObservationTargetIri();

  // const objectIri = RdfHandler.add.observableEntity(selectedObject);
  const timestamp = new Date();
  const obs: Observation = {
    id: objectIri,
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

function readRdfFile(): void {
  console.log('readRdfFile()');
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

function scanKGraph() {
  Scanner.scan();
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
    console.log('Clicked on Ship: ' + entity.id);
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
  RdfHandler.get.ships().then((features: ObservableEntity[]) => {
    Gui.displayObservableEntities(features, onClickObservableEntity);
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
    GMaps.centerMap(voyages[0].points[0].location);
    for (const voyage of voyages) {
      for (let i = 0; i < voyage.points.length - 1; i++) {
        const start = voyage.points[i];
        const end = voyage.points[i + 1];
        const startCoordinate: Coordinate = start.location;
        const endCoordinate: Coordinate = end.location;
        GMaps.drawLine(startCoordinate, endCoordinate);
      }
    }
  });

  GMaps.clearMarkers();
  RdfHandler.get.observations(entity.id).then((observations) => {
    console.log('Observations for ship:', observations);
    observations.forEach((obs) => {
      const location: Coordinate = obs.location;
      GMaps.addMarkers(location);
    });
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

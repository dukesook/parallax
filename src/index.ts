import * as GMaps from './use_gmaps';
import RdfHandler from './rdf_handler';
import * as Gui from './gui/gui';
import * as GraphTab from './gui/knowledge_graph_tab';
import * as Fabricator from './fabricator';
import { Triple, Iri } from './aliases';
import { saveFile } from './fetcher';

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
      GraphTab.onListTriplesButton(showTriples);
      GraphTab.onListGraphsButton(showGraphs);
    });

    // Listeners
    Gui.On.fabricateData(fabricateData);
    Gui.On.saveButton(onAddObservation);
    Gui.On.showObservationsButton(showObservations);
    Gui.On.downloadRdfButton(downloadRdf);
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

function downloadRdf(): void {
  console.log('downloadRdf()');
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

function showObservations(): void {
  console.log('showObservations()');
}

function fabricateData(): void {
  console.log('fabricateData()');
  Gui.Get.fabricatorUserInput();
}

function logStore(): void {
  console.log('logStore()');
  RdfHandler.logStore();
}

function debug() {
  // Fabricator.generateData();
}

function debug2() {
  const rdf = RdfHandler.get.instanceData();
  saveFile(rdf, 'instance_data.ttl');
}

import * as GMaps from './use_gmaps';
import * as RdfHandler from './rdf_handler';
import * as Gui from './gui';
import * as GraphTab from './graph';
import { log } from 'console';

const debugButton = document.getElementById('debug-button');
const logStoreButton = document.getElementById('log-store-button');

debugButton?.addEventListener('click', debug);
logStoreButton?.addEventListener('click', logStore);

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Document is ready');

  // Init GUI
  // Init RDF Handler
  RdfHandler.init();

  Gui.initGui().then(() => {
    const gmapElement = Gui.getGmapElement();
    GMaps.loadGoogleMapsScript(gmapElement);

    GraphTab.init();

    // Listeners
    Gui.onSave(onAddObservation);
    Gui.onShowObservations(showObservations);
    Gui.onDownloadRdf(downloadRdf);
  });

  GMaps.addMapListener(onclickMap);
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

function onAddObservation(): void {
  const selectedObject = Gui.getSelectedObject();
  const { lat, lng } = Gui.getLatLng();
  console.log(`Saving data for object: ${selectedObject}, lat: ${lat}, lng: ${lng}`);

  const message = 'A ' + selectedObject + ' was observed at ' + lat + ', ' + lng;
  Gui.displayMessage(message);

  // TODO: add observation
  RdfHandler.addObservation(selectedObject, lat, lng);
}

function downloadRdf(): void {
  console.log('downloadRdf()');
}

function showObservations(): void {
  console.log('showObservations()');
}

function logStore(): void {
  console.log('logStore()');
  RdfHandler.logStore();
}

function debug() {
  RdfHandler.debug();
}

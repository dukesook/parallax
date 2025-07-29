import * as GMaps from './use_gmaps';
import * as RdfHandler from './rdf_handler';
import * as Gui from './gui';

const debugButton = document.getElementById('debug-button');

debugButton?.addEventListener('click', debug);

GMaps.loadGoogleMapsScript();
GMaps.addMapListener(onclickMap);

document.addEventListener('DOMContentLoaded', () => {
  console.log('Document is ready');

  // Listeners
  initialize_listeners();

  // Starting Location
  const { lat, lng } = GMaps.startingLocation;
  Gui.displayLatLng(lat, lng);
});

function initialize_listeners(): void {
  Gui.onSave(onAddObservation);

  Gui.onShowObservations(debug_log_observations);
}

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

  // RdfHandler.observationToTurtle(selectedObject, lat, lng);
  RdfHandler.addObservationToTripleStore(selectedObject, lat, lng);
}

function example_downloadTextFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  // Append to body to make it clickable in all browsers
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

function debug_log_observations(): void {
  RdfHandler.debug_dump_observations();
}

function debug() {
  example_downloadTextFile('debug.txt', 'Debugging information logged.');
}

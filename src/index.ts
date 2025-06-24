import * as GMaps from './use_gmaps';
import * as RdfHandler from './rdf_handler';
import * as Gui from './gui';

const debugButton = document.getElementById('debug-button');

debugButton?.addEventListener('click', debug);

GMaps.loadGoogleMapsScript();
GMaps.addMapListener(onclickMap);

document.addEventListener('DOMContentLoaded', () => {
  console.log('Document is ready');

  Gui.onSave(onSave);
  const { lat, lng } = GMaps.startingLocation;
  Gui.displayLatLng(lat, lng);
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

function onSave(): void {
  const selectedObject = Gui.getSelectedObject();
  const { lat, lng } = Gui.getLatLng();
  console.log(`Saving data for object: ${selectedObject}, lat: ${lat}, lng: ${lng}`);

  const message = 'A ' + selectedObject + ' was observed at ' + lat + ', ' + lng;
  Gui.displayMessage(message);

  RdfHandler.saveObservation(selectedObject, lat, lng);

  // 1. Create uuid for object (foo)
  // 2. Create uuid for observation (bar)
  // 2. foo was-observed-at bar
  // 3. bar has-latitude lat
  // 4. bar has-longitude lng
  // 5. bar has-datetime datetime
  // 6. bar has-object-type selectedObject
}

function debug() {
  RdfHandler.testQuery().catch(console.error);
}

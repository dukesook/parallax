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
}

function debug() {
  RdfHandler.testQuery().catch(console.error);
}

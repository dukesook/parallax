import * as GMaps from './use_gmaps';
import * as RdfHandler from './rdf_handler';
import * as Gui from './gui';

const debugButton = document.getElementById('debug-button');

debugButton?.addEventListener('click', () => {
  console.log('Debug button clicked');
})

GMaps.loadGoogleMapsScript();
GMaps.addMapListener((event: google.maps.MapMouseEvent) => {
  if (event.latLng) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const stringified = JSON.stringify({ lat, lng });
    Gui.displayMessage(`Clicked at: ${stringified}`);
  }
})

document.addEventListener('DOMContentLoaded', () => {
  console.log('Document is ready');
});
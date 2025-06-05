import * as GMaps from './use_gmaps';
import * as RdfHandler from './rdf_handler';
import * as Gui from './gui';

const debugButton = document.getElementById('debug-button');

debugButton?.addEventListener('click', () => {
  console.log('Debug button clicked');
  const latLng = Gui.getLatLng();
  console.log(latLng);
})

GMaps.loadGoogleMapsScript();
GMaps.addMapListener(onclickMap)

document.addEventListener('DOMContentLoaded', () => {
  console.log('Document is ready');
});

function onclickMap(event: google.maps.MapMouseEvent): void {
  if (event.latLng) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    Gui.displayLatLng(lat, lng);
  }  
}

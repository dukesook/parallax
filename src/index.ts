import * as GMaps from './use_gmaps';
import * as RdfHandler from './rdf_handler';
import * as Gui from './gui';
import * as GraphTab from './graph';

const debugButton = document.getElementById('debug-button');

debugButton?.addEventListener('click', debug);

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Document is ready');

  // Init GUI
  Gui.initGui().then(() => {
    const gmapElement = Gui.getGmapElement();
    GMaps.loadGoogleMapsScript(gmapElement);
    Gui.onSave(onAddObservation);

    Gui.onShowObservations(showObservations);

    Gui.onDownloadRdf(downloadRdf);

    GraphTab.init();
  });

  // Init RDF Handler
  RdfHandler.init();

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

function debug() {
  RdfHandler.debug();
}

async function loadAndLogHTML(url: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const htmlText = await response.text();
    console.log(htmlText);
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
  }
}

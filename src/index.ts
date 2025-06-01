import * as GMaps from './use_gmaps';
import * as RdfHandler from './rdf_handler';

const debugButton = document.getElementById('debug-button');

debugButton?.addEventListener('click', () => {
  console.log('Debug button clicked');
})

GMaps.loadGoogleMapsScript();

RdfHandler.runRdfExample();

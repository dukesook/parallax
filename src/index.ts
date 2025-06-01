import { loadGoogleMapsScript } from './use_gmaps';
import { runRdfExample } from './rdf_handler';

const debugButton = document.getElementById('debug-button');

debugButton?.addEventListener('click', () => {
  console.log('Debug button clicked');
})

loadGoogleMapsScript();

runRdfExample();

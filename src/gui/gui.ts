import { Triple } from '../aliases';
import * as GraphTab from './knowledge_graph_tab';
import * as TermRegistryGui from './term_registry_tab';

/*
******************* gui.ts *******************
The GUI is dumb. It just display data and gets user-input.

No other module should call document.getElementById().

*/

// HTML Elements - index.html
const messageDiv = getElement('message') as HTMLElement;
const googleMapsTab = getElement('google-maps-tab') as HTMLElement;
const knowledgeGraphTab = getElement('knowledge-graph-tab') as HTMLElement;
const termRegistryTab = getElement('term-registry-tab') as HTMLElement;
const fabricatorTab = getElement('fabricator-tab') as HTMLElement;

const googleMapsContent = getElement('google-maps-content') as HTMLElement;
const knowledgeGraphContent = getElement('knowledge-graph-content') as HTMLElement;
const termRegistryContent = getElement('term-registry-content') as HTMLElement;
const fabricatorContent = getElement('fabricator-content') as HTMLElement;

let g_currentTab = fabricatorTab;

document.addEventListener('DOMContentLoaded', () => {
  initGui();
});

// Public Functions

export function displayLatLng(lat: number, lng: number): void {
  const latInput = getElement('lat') as HTMLInputElement;
  const lngInput = getElement('lng') as HTMLInputElement;
  latInput.value = lat.toFixed(6);
  lngInput.value = lng.toFixed(6);
}

export function displayMessage(message: string): void {
  messageDiv.innerHTML = message;
}

export function displayTriples(triples: Triple[]): void {
  GraphTab.displayTriples(triples);
}

export function displayTermRegistry(terms: string[]): void {
  TermRegistryGui.displayTerms(terms);
}

export function onDisplayTermRegistryButton(callback: () => void) {
  TermRegistryGui.onShowTermRegistryButton(callback);
}

export function getLatLng(): { lat: number; lng: number } {
  const latInput = getElement('lat') as HTMLInputElement;
  const lngInput = getElement('lng') as HTMLInputElement;
  const lat = parseFloat(latInput.value);
  const lng = parseFloat(lngInput.value);
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid latitude or longitude');
  }
  return { lat, lng };
}

export function getSelectedObject(): string {
  const objectSelect = getElement('object-select') as HTMLSelectElement;
  const selectedObject = objectSelect.value;
  if (!selectedObject) {
    throw new Error('No object selected');
  }
  return selectedObject;
}

export const On = {
  writeGraphToFile(callback: () => void) {
    const graphToFileButton = getElement('graph-to-file-button') as HTMLButtonElement;
    graphToFileButton.addEventListener('click', callback);
  },

  fabricateData(callback: () => void) {
    const form = getElement('fabricator-form') as HTMLFormElement;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      callback();
    });
  },

  saveButton(callback: () => void) {
    const addObservationButton = getElement('add-observation-button') as HTMLButtonElement;
    addObservationButton.addEventListener('click', callback);
  },

  showObservationsButton(callback: () => void) {
    const showObservationsButton = getElement('show-observations-button') as HTMLButtonElement;
    showObservationsButton.addEventListener('click', callback);
  },

  downloadRdfButton(callback: () => void) {
    const downloadRdfButton = getElement('download-rdf-button') as HTMLButtonElement;
    downloadRdfButton.addEventListener('click', callback);
  },

  fabricateDataButton(callback: () => void) {
    const fabricateDataButton = getElement('fabricate-data-button') as HTMLButtonElement;
    fabricateDataButton.addEventListener('click', callback);
  },
};

// TODO: move all getters here
export const Get = {
  fabricatorUserInput(): void {
    //
  },
};

export function getGmapElement(): HTMLElement {
  const gmapElement = getElement('map');
  if (!gmapElement) {
    throw new Error('Google Map element not found');
  }
  return gmapElement;
}

// Private Functions

async function loadHTMLIntoElement(url: string, container: HTMLElement): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const htmlText = await response.text();
    container.innerHTML = htmlText;
  } catch (error) {
    console.error(`Error loading ${url}:`, error);
  }
}

//TODO: prevent non-gui modules from importing this function
export function getElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id ${id} not found`);
  }
  return element;
}

export async function initGui(): Promise<void> {
  // Initialize datetime input with current date and time:
  const now = new Date();

  // Tabs
  googleMapsTab.addEventListener('click', () => activateTab(googleMapsTab));
  knowledgeGraphTab.addEventListener('click', () => activateTab(knowledgeGraphTab));
  termRegistryTab.addEventListener('click', () => activateTab(termRegistryTab));
  fabricatorTab.addEventListener('click', () => activateTab(fabricatorTab));

  // Tab Content
  await loadHTMLIntoElement('/parallax/src/html/google_maps.html', googleMapsContent);
  await loadHTMLIntoElement('/parallax/src/html/graph_tab.html', knowledgeGraphContent);
  await loadHTMLIntoElement('/parallax/src/html/term_registry.html', termRegistryContent);
  await loadHTMLIntoElement('/parallax/src/html/fabricator.html', fabricatorContent);
}

function activateTab(tab: HTMLElement): void {
  // Previous Tab
  g_currentTab.classList.remove('active');
  const oldContentId = g_currentTab.getAttribute('content-id')!;

  // Previous Tab Content
  const oldTabContent = getElement(oldContentId);
  oldTabContent.classList.remove('active');

  // New Tab
  g_currentTab = tab;
  tab.classList.add('active');

  // Activate Content
  const tabContentId = tab.getAttribute('content-id')!;
  const tabContent = getElement(tabContentId);
  tabContent.classList.add('active');

  // Clear message
  displayMessage('');
}

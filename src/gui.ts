// HTML Elements - index.html
const messageDiv = getElement('message') as HTMLElement;
const googleMapsTab = getElement('google-maps-tab') as HTMLElement;
const knowledgeGraphTab = getElement('knowledge-graph-tab') as HTMLElement;
const tab3Tab = getElement('tab3-tab') as HTMLElement;

const googleMapsContent = getElement('google-maps-content') as HTMLElement;
const knowledgeGraphContent = getElement('knowledge-graph-content') as HTMLElement;
const tab3Content = getElement('tab3-content') as HTMLElement;

let g_currentTab = googleMapsTab;

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

export function onSave(callback: () => void): void {
  const addObservationButton = getElement('add-observation-button') as HTMLButtonElement;
  addObservationButton.addEventListener('click', callback);
}

export function onShowObservations(callback: () => void): void {
  const showObservationsButton = getElement('show-observations-button') as HTMLButtonElement;
  showObservationsButton.addEventListener('click', callback);
}

export function onDownloadRdf(callback: () => void): void {
  const downloadRdfButton = getElement('download-rdf-button') as HTMLButtonElement;
  downloadRdfButton.addEventListener('click', callback);
}

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

function getElement(id: string): HTMLElement {
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
  tab3Tab.addEventListener('click', () => activateTab(tab3Tab));

  // Tab Content
  await loadHTMLIntoElement('/parallax/src/html/tab3.html', tab3Content);
  await loadHTMLIntoElement('/parallax/src/html/google_maps.html', googleMapsContent);
  await loadHTMLIntoElement('/parallax/src/html/inspect_knowledge_graph.html', knowledgeGraphContent);
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
}

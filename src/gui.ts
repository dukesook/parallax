// HTML Elements
const messageDiv = getElement('message') as HTMLElement;
const latInput = getElement('lat') as HTMLInputElement;
const lngInput = getElement('lng') as HTMLInputElement;
const datetimeInput = getElement('datetime') as HTMLInputElement;
const objectSelect = getElement('object-select') as HTMLSelectElement;
const addObservationButton = getElement('add-observation-button') as HTMLButtonElement;
const showObservationsButton = getElement('show-observations-button') as HTMLButtonElement;
const downloadRdfButton = getElement('download-rdf-button') as HTMLButtonElement;
const googleMapsTab = getElement('google-maps-tab') as HTMLElement;
const knowledgeGraphTab = getElement('knowledge-graph-tab') as HTMLElement;
const tab3Tab = getElement('tab3-tab') as HTMLElement;

function getElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id ${id} not found`);
  }
  return element;
}

function initGui(): void {
  // Initialize datetime input with current date and time:
  const now = new Date();
  datetimeInput.value = now.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM format

  // Set up tab listeners
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      activateTab(tab as HTMLElement);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initGui();
});

export function displayLatLng(lat: number, lng: number): void {
  latInput.value = lat.toFixed(6);
  lngInput.value = lng.toFixed(6);
}

export function displayMessage(message: string): void {
  messageDiv.innerHTML = message;
}

export function getLatLng(): { lat: number; lng: number } {
  const lat = parseFloat(latInput.value);
  const lng = parseFloat(lngInput.value);
  if (isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid latitude or longitude');
  }
  return { lat, lng };
}

export function getSelectedObject(): string {
  const selectedObject = objectSelect.value;
  if (!selectedObject) {
    throw new Error('No object selected');
  }
  return selectedObject;
}

export function onSave(callback: () => void): void {
  addObservationButton.addEventListener('click', callback);
}

export function onShowObservations(callback: () => void): void {
  showObservationsButton.addEventListener('click', callback);
}

export function onDownloadRdf(callback: () => void): void {
  downloadRdfButton.addEventListener('click', callback);
}

function activateTab(tab: HTMLElement): void {
  const tabs = document.querySelectorAll('.tab');

  // Deactivate All Tabs
  tabs.forEach((t) => {
    t.classList.remove('active');
  });

  // Activate Tab
  tab.classList.add('active');

  // Deactivate All Contents
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach((c) => {
    c.classList.remove('active');
  });

  // Activate Content
  const contentId = tab.getAttribute('content-id');
  if (contentId) {
    const content = document.getElementById(contentId);
    if (content) {
      content.classList.add('active');
    }
  }
}

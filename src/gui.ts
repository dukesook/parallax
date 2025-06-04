
// HTML Elements
const messageDiv = getElement("message") as HTMLElement;
const latInput = getElement("lat") as HTMLInputElement;
const lngInput = getElement("lng") as HTMLInputElement;

function getElement(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element with id ${id} not found`);
  }
  return element;
}

export function displayLatLng(lat: number, lng: number): void {
  latInput.value = lat.toFixed(6);
  lngInput.value = lng.toFixed(6);
}

export function displayMessage(message: string): void {
  messageDiv.innerHTML = message;
}
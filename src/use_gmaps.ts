/// <reference types="google.maps" />

let g_googleMapElement: HTMLElement | null = null;
let map: google.maps.Map | null = null;
let currentMarker: google.maps.marker.AdvancedMarkerElement | null = null;
const newYorkLocation = { lat: 40.7128, lng: -74.006 };
export const startingLocation = newYorkLocation;
type MapMouseEvent = google.maps.MapMouseEvent;

const mapListeners: Function[] = [];

export function initMap(): void {
  if (!g_googleMapElement) {
    throw new Error('Gmap element is not initialized');
  }
  map = new google.maps.Map(g_googleMapElement, {
    center: newYorkLocation,
    zoom: 12,
    mapId: '4f0f357dc8a7e399f7881230',
    mapTypeId: google.maps.MapTypeId.HYBRID,
  });

  for (const listener of mapListeners) {
    map?.addListener('click', listener);
  }

  currentMarker = new google.maps.marker.AdvancedMarkerElement({
    position: newYorkLocation,
    map: map,
    title: 'Hello San Francisco!',
  });
}

export function moveCurrentMarker(location: google.maps.LatLngLiteral): void {
  if (currentMarker) {
    // currentMarker.position = location;
    currentMarker.map = null; // Remove from current map
  }

  currentMarker = new google.maps.marker.AdvancedMarkerElement({
    position: location,
    map: map,
    title: 'New Marker',
  });
}

export function addMapListener(listener: Function): void {
  if (map) {
    map.addListener('click', listener);
  } else {
    mapListeners.push(listener);
  }
}

export function loadGoogleMapsScript(googleMapElement: HTMLElement): void {
  g_googleMapElement = googleMapElement;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
  script.async = true;
  script.defer = true;
  script.onload = initMap;
  document.head.appendChild(script);
}

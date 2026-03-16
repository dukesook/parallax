/// <reference types="google.maps" />

import { Coordinate } from './models';

let g_googleMapElement: HTMLElement | null = null;
const g_lines: google.maps.Polyline[] = [];
const g_markers: google.maps.marker.AdvancedMarkerElement[] = [];
let map: google.maps.Map | null = null;
let currentMarker: google.maps.marker.AdvancedMarkerElement | null = null;
const newYorkLocation = { lat: 40.7128, lng: -74.006 };
const sanFranciscoLocation = { lat: 37.7749, lng: -122.4194 };
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

export function centerMap(cord: Coordinate): void {
  if (map) {
    const latLng = new google.maps.LatLng(cord.latitude, cord.longitude);
    map.setCenter(latLng);
  }
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

export function drawLine(c1: Coordinate, c2: Coordinate): void {
  const path = [
    { lat: c1.latitude, lng: c1.longitude },
    { lat: c2.latitude, lng: c2.longitude },
  ];

  const line = new google.maps.Polyline({
    path: path,
    geodesic: false, // follows the curvature of the Earth
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2,
    map: map,
  });
  g_lines.push(line);
}

export function clearMarkers(): void {
  for (const marker of g_markers) {
    marker.map = null;
  }

  g_markers.length = 0;
}

export function addMarkers(cord: Coordinate): void {
  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: cord.latitude, lng: cord.longitude },
    map: map,
  });
  g_markers.push(marker);
}

export function clearLines(): void {
  for (const line of g_lines) {
    line.setMap(null);
  }
  g_lines.length = 0; // Clear the array
}

export function debug() {
  Examples.drawMarker();
}

const Examples = {
  drawPolyLine() {
    if (!map) return;

    const path: google.maps.LatLngLiteral[] = [
      { lat: 34.0522, lng: -118.2437 },
      { lat: 36.1699, lng: -115.1398 },
      { lat: 37.7749, lng: -122.4194 },
    ];

    const line = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });

    line.setMap(map);
  },

  drawLine() {
    const line = new google.maps.Polyline({
      path: [
        { lat: 40.7128, lng: -74.006 },
        { lat: 34.0522, lng: -118.2437 },
      ],
      map: map,
    });
  },

  drawMarker() {
    if (!map) return;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: sanFranciscoLocation,
      map: map,
    });
  },
};

/// <reference types="google.maps" />

const mapDiv = document.getElementById("map") as HTMLElement;
let map: google.maps.Map | null = null;

type MapMouseEvent = google.maps.MapMouseEvent;


export function initMap(): void {

  map = new google.maps.Map(mapDiv, {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 12,
  });

  map.addListener("click", (event: MapMouseEvent) => {
  if (event.latLng) {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    console.log(`Clicked at latitude: ${lat}, longitude: ${lng}`);
  }
});
}

export function loadGoogleMapsScript(): void {
  const script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDIJp5K9Ki2dBsJhw2ayl-SrhJQ8_LmZn4';
  script.async = true;
  script.defer = true;
  script.onload = initMap;
  document.head.appendChild(script);
}





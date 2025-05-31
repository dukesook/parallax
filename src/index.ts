/// <reference types="google.maps" />

function initMap(): void {
  const mapDiv = document.getElementById("map") as HTMLElement;

  new google.maps.Map(mapDiv, {
    center: { lat: 40.7128, lng: -74.006 },
    zoom: 12,
  });
}

// Dynamically load Google Maps API and call initMap once loaded
function loadGoogleMapsScript(): void {
  const script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDIJp5K9Ki2dBsJhw2ayl-SrhJQ8_LmZn4';
  script.async = true;
  script.defer = true;
  script.onload = initMap;
  document.head.appendChild(script);
}

loadGoogleMapsScript();

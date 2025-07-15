var map = L.map('map', {
  crs: L.CRS.Simple,
  minZoom: -4,
  maxZoom: 2,
  zoomSnap: 0.25
});
var bounds = [[0, 0], [1000, 1000]];
L.imageOverlay('mapa.jpg', bounds).addTo(map);
map.fitBounds(bounds);

let customMarkers = [];
let allMarkers = [];

loadMarkers();

map.on("click", function (e) {
  const lat = parseFloat(e.latlng.lat.toFixed(2));
  const lng = parseFloat(e.latlng.lng.toFixed(2));

  const popupForm = `
    <div class="popup-form">
      <label>Nazwa pinezki:</label>
      <input type="text" id="pin-title" placeholder="Nazwa" />
      <label>Zdjęcie:</label>
      <input type="file" id="pin-image" accept="image/*" />
      <button onclick="savePin(${lat}, ${lng})">Zapisz</button>
    </div>
  `;

  L.popup()
    .setLatLng([lat, lng])
    .setContent(popupForm)
    .openOn(map);
});

function savePin(lat, lng) {
  const title = document.getElementById("pin-title").value;
  const imageInput = document.getElementById("pin-image");
  const file = imageInput.files[0];

  if (!title) return alert("Podaj nazwę.");
  if (!file) return alert("Wybierz obrazek.");

  const reader = new FileReader();
  reader.onload = function (e) {
    const base64 = e.target.result;
    const pinData = { lat, lng, title, image: base64 };
    customMarkers.push(pinData);
    storeMarkers();
    addCustomMarker(lat, lng, title, base64);
    map.closePopup();
  };
  reader.readAsDataURL(file);
}

function addCustomMarker(lat, lng, title, image) {
  const marker = L.marker([lat, lng]).addTo(map);
  const popupContent = `
    <div>
      <b>${title}</b><br>
      <img src="${image}" class="popup-img"/><br>
      <button onclick="removeMarker(${lat}, ${lng})">🗑 Usuń</button>
    </div>
  `;
  marker.bindPopup(popupContent);
  marker._lat = lat;
  marker._lng = lng;
  allMarkers.push(marker);
}

function removeMarker(lat, lng) {
  const marker = allMarkers.find(m => m._lat === lat && m._lng === lng);
  if (marker) {
    map.removeLayer(marker);
    allMarkers = allMarkers.filter(m => m !== marker);
    customMarkers = customMarkers.filter(m => m.lat !== lat || m.lng !== lng);
    storeMarkers();
  }
}

function storeMarkers() {
  try {
    const json = JSON.stringify(customMarkers);
    localStorage.setItem("customMarkers", json);
  } catch (e) {
    alert("Zbyt dużo danych. Usuń kilka pinezek.");
  }
}

function loadMarkers() {
  const saved = localStorage.getItem("customMarkers");
  if (saved) {
    try {
      customMarkers = JSON.parse(saved);
      customMarkers.forEach(m => addCustomMarker(m.lat, m.lng, m.title, m.image));
    } catch (e) {
      console.error("Błąd wczytywania pinezek.");
    }
  }
}
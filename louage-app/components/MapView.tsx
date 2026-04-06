import { View, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  depart: string;
  arrivee: string;
}

export default function MapComponent({ depart, arrivee }: Props) {
  const departValue = JSON.stringify(depart);
  const arriveeValue = JSON.stringify(arrivee);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        #map { width: 100%; height: 100vh; }
        .status {
          position: absolute;
          z-index: 999;
          top: 12px;
          left: 12px;
          right: 12px;
          background: rgba(255,255,255,0.95);
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
        }
      </style>
    </head>
    <body>
      <div class="status" id="status">Chargement de la carte...</div>
      <div id="map"></div>
      <script>
        const depart = ${departValue};
        const arrivee = ${arriveeValue};
        const statusBox = document.getElementById('status');
        const map = L.map('map').setView([34.5, 9.5], 7);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: 'OpenStreetMap'
        }).addTo(map);

        function setStatus(text) {
          statusBox.textContent = text;
        }

        async function geocode(city) {
          const query = encodeURIComponent(city + ', Tunisia');
          const url = 'https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=' + query;
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json'
            }
          });
          const data = await response.json();
          if (!Array.isArray(data) || data.length === 0) {
            throw new Error('Ville introuvable: ' + city);
          }
          return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }

        async function initMap() {
          try {
            setStatus('Recherche de ' + depart + ' et ' + arrivee + '...');
            const departCoords = await geocode(depart);
            const arriveeCoords = await geocode(arrivee);

            const departMarker = L.marker(departCoords).addTo(map).bindPopup('Depart: ' + depart);
            const arriveeMarker = L.marker(arriveeCoords).addTo(map).bindPopup('Arrivee: ' + arrivee);

            const routeLine = L.polyline([departCoords, arriveeCoords], {
              color: '#E53935',
              weight: 5
            }).addTo(map);

            const movingMarker = L.circleMarker(departCoords, {
              radius: 8,
              color: '#1D4ED8',
              fillColor: '#1D4ED8',
              fillOpacity: 1
            }).addTo(map);

            map.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
            departMarker.openPopup();
            setStatus('Trajet ' + depart + ' -> ' + arrivee);

            let step = 0;
            const totalSteps = 160;
            setInterval(function () {
              step = (step + 1) % totalSteps;
              const progress = step / totalSteps;
              const lat = departCoords[0] + ((arriveeCoords[0] - departCoords[0]) * progress);
              const lng = departCoords[1] + ((arriveeCoords[1] - departCoords[1]) * progress);
              movingMarker.setLatLng([lat, lng]);
            }, 900);
          } catch (error) {
            setStatus('Impossible d\\'afficher ' + depart + ' -> ' + arrivee);
          }
        }

        initMap();
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{depart} {'->'} {arrivee}</Text>
      <WebView source={{ html }} style={styles.map} javaScriptEnabled domStorageEnabled />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 320, marginVertical: 10, borderRadius: 12, overflow: 'hidden' },
  title: { fontSize: 14, fontWeight: 'bold', color: '#333', padding: 8, backgroundColor: '#fff', textAlign: 'center' },
  map: { flex: 1 },
});

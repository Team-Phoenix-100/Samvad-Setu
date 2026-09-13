import React, { useRef, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { LocateFixed } from 'lucide-react-native';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  category?: string;
  status?: string;
  urgency?: string;
}

interface LeafletMapProps {
  mode?: 'picker' | 'view';
  initialLatitude?: number;
  initialLongitude?: number;
  initialZoom?: number;
  selectedLatitude?: number;
  selectedLongitude?: number;
  markers?: MapMarker[];
  onLocationChange?: (lat: number, lng: number) => void;
  onMarkerPress?: (markerId: string) => void;
  height?: number;
  isDarkMode?: boolean;
  showCurrentLocationButton?: boolean;
}

export default function LeafletMap({
  mode = 'view',
  initialLatitude = 23.3441, // Ranchi, Jharkhand default
  initialLongitude = 85.3096,
  initialZoom = 13,
  selectedLatitude,
  selectedLongitude,
  markers = [],
  onLocationChange,
  onMarkerPress,
  height = 280,
  isDarkMode = false,
  showCurrentLocationButton = true,
}: LeafletMapProps) {
  const webViewRef = useRef<WebView>(null);
  const [locating, setLocating] = useState(false);

  const activeLat = selectedLatitude ?? initialLatitude;
  const activeLng = selectedLongitude ?? initialLongitude;

  const htmlContent = useMemo(() => {
    const markersJson = JSON.stringify(markers);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" crossorigin="" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js" crossorigin=""></script>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #EBF0F0;
    }
    .custom-pin {
      background-color: #E8A33D;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      width: 22px;
      height: 22px;
    }
    .pulse-ring {
      position: absolute;
      top: -9px;
      left: -9px;
      width: 40px;
      height: 40px;
      border: 3px solid rgba(232, 163, 61, 0.45);
      border-radius: 50%;
      animation: pulsate 2s infinite ease-out;
    }
    @keyframes pulsate {
      0% { transform: scale(0.6); opacity: 0.8; }
      100% { transform: scale(1.4); opacity: 0; }
    }
    .leaflet-popup-content-wrapper {
      background: #FFFFFF;
      color: #1A202C;
      border-radius: 12px;
      padding: 4px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
    }
    .leaflet-popup-tip {
      background: #FFFFFF;
    }
    .popup-title {
      font-weight: 800;
      font-size: 13px;
      margin-bottom: 4px;
    }
    .popup-badge {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 10px;
      font-weight: 700;
      background: rgba(47, 158, 143, 0.15);
      color: #2F9E8F;
      margin-bottom: 4px;
    }
    .popup-urgency {
      font-size: 11px;
      color: #E8A33D;
      font-weight: 700;
    }
    .user-loc-dot {
      background-color: #0284C7;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(2, 132, 199, 0.45);
      width: 18px;
      height: 18px;
    }
    .user-pulse-ring {
      position: absolute;
      top: -8px;
      left: -8px;
      width: 34px;
      height: 34px;
      border: 2.5px solid rgba(2, 132, 199, 0.65);
      border-radius: 50%;
      animation: userPulse 1.8s infinite ease-out;
    }
    @keyframes userPulse {
      0% { transform: scale(0.5); opacity: 0.9; }
      100% { transform: scale(1.6); opacity: 0; }
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${activeLat}, ${activeLng}],
      zoom: ${initialZoom},
      zoomControl: true
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    var isPicker = ${mode === 'picker'};
    var pickerMarker = null;

    if (isPicker) {
      var pickerIcon = L.divIcon({
        className: 'picker-icon-wrapper',
        html: '<div style="position:relative;"><div class="pulse-ring"></div><div class="custom-pin"></div></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      pickerMarker = L.marker([${activeLat}, ${activeLng}], {
        draggable: true,
        icon: pickerIcon
      }).addTo(map);

      pickerMarker.bindPopup('<b style="font-size:12px;">Selected Point</b><br><span style="font-size:10px;color:#888;">Drag pin or tap anywhere on map</span>').openPopup();

      pickerMarker.on('dragend', function(e) {
        var coord = e.target.getLatLng();
        sendCoord(coord.lat, coord.lng);
      });

      map.on('click', function(e) {
        pickerMarker.setLatLng(e.latlng);
        map.panTo(e.latlng);
        sendCoord(e.latlng.lat, e.latlng.lng);
      });
    }

    var markersData = ${markersJson};
    if (markersData && markersData.length > 0) {
      markersData.forEach(function(item) {
        if (!item.latitude || !item.longitude) return;

        var color = '#2F9E8F';
        if (item.status === 'Pending' || item.urgency === 'urgent') {
          color = '#E8A33D';
        } else if (item.status === 'Critical') {
          color = '#C1443B';
        }

        var dotIcon = L.divIcon({
          className: 'marker-dot',
          html: '<div style="width:16px;height:16px;background-color:' + color + ';border:2px solid #FFF;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        var m = L.marker([item.latitude, item.longitude], { icon: dotIcon }).addTo(map);
        
        var popupHtml = '<div style="min-width:140px;">' +
          '<div class="popup-title">' + (item.title || 'Civic Report') + '</div>' +
          (item.category ? '<div class="popup-badge">' + item.category + '</div><br/>' : '') +
          '<span class="popup-urgency">Status: ' + (item.status || 'Active') + '</span>' +
          '</div>';

        m.bindPopup(popupHtml);

        m.on('click', function() {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'MARKER_PRESS',
              markerId: item.id
            }));
          }
        });
      });
    }

    function sendCoord(lat, lng) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'LOCATION_CHANGED',
          lat: lat,
          lng: lng
        }));
      }
    }

    var userLocationMarker = null;

    window.setUserLocation = function(lat, lng, zoom) {
      var targetZoom = zoom || 15;
      map.flyTo([lat, lng], targetZoom, { animate: true, duration: 1.0 });

      if (isPicker && pickerMarker) {
        pickerMarker.setLatLng([lat, lng]);
        pickerMarker.bindPopup('<b style="font-size:12px;color:#0D9488;">📍 Your Current Location</b><br><span style="font-size:10px;color:#64748B;">Drag pin to adjust if needed</span>').openPopup();
        sendCoord(lat, lng);
      } else {
        if (!userLocationMarker) {
          var userIcon = L.divIcon({
            className: 'user-loc-wrapper',
            html: '<div style="position:relative;"><div class="user-pulse-ring"></div><div class="user-loc-dot"></div></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          userLocationMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
          userLocationMarker.bindPopup('<div style="text-align:center;padding:2px;"><b style="font-size:12px;color:#0284C7;">📍 You Are Here</b><br><span style="font-size:10px;color:#64748B;">Live GPS Location</span></div>').openPopup();
        } else {
          userLocationMarker.setLatLng([lat, lng]);
          userLocationMarker.openPopup();
        }
      }
    };

    // Listener for parent React Native commands (e.g. centering to GPS)
    function onNativeMsg(event) {
      try {
        var data = JSON.parse(event.data);
        if (data.type === 'SET_CENTER' || data.type === 'USER_LOCATION') {
          if (window.setUserLocation) {
            window.setUserLocation(data.lat, data.lng, data.zoom || 15);
          } else {
            map.setView([data.lat, data.lng], data.zoom || 15);
            if (pickerMarker) {
              pickerMarker.setLatLng([data.lat, data.lng]);
            }
          }
        }
      } catch (err) {}
    }

    window.addEventListener('message', onNativeMsg);
    document.addEventListener('message', onNativeMsg);
  </script>
</body>
</html>
    `;
  }, [mode, activeLat, activeLng, initialZoom, markers, isDarkMode]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'LOCATION_CHANGED' && onLocationChange) {
        onLocationChange(data.lat, data.lng);
      } else if (data.type === 'MARKER_PRESS' && onMarkerPress) {
        onMarkerPress(data.markerId);
      }
    } catch (e) {
      console.warn('LeafletMap message error:', e);
    }
  };

  const handleUseCurrentLocation = async () => {
    if (locating) return;
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow location access to automatically center the map on your current location.',
          [{ text: 'OK' }]
        );
        setLocating(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = loc.coords;

      // Update map inside webview
      const jsCode = `
        if (window.setUserLocation) {
          window.setUserLocation(${latitude}, ${longitude}, 15);
        }
        true;
      `;
      webViewRef.current?.injectJavaScript(jsCode);

      // Trigger callback if provided
      if (onLocationChange) {
        onLocationChange(latitude, longitude);
      }
    } catch (err) {
      console.warn('Failed to obtain current location', err);
      Alert.alert(
        'GPS Unavailable',
        'Could not detect your current location. Please make sure location / GPS is turned on in your device settings.'
      );
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2F9E8F" />
          </View>
        )}
        style={styles.webView}
        scrollEnabled={false}
      />

      {showCurrentLocationButton && (
        <TouchableOpacity
          style={styles.locationButton}
          onPress={handleUseCurrentLocation}
          disabled={locating}
          activeOpacity={0.85}
        >
          {locating ? (
            <ActivityIndicator size="small" color="#0D9488" />
          ) : (
            <LocateFixed size={16} color="#0D9488" />
          )}
          <Text style={styles.locationButtonText}>
            {locating ? 'Locating...' : 'My Location'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  locationButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 999,
  },
  locationButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
});

import * as Location from 'expo-location';

export interface GeocodedLocation {
  state: string;
  district: string;
  block: string;
  formattedAddress: string;
}

// Reference centroids for all Indian States & UTs for offline/failsafe fallback
const ALL_INDIA_STATES = [
  { state: 'Jharkhand', district: 'Ranchi', block: 'Kanke', lat: 23.3441, lng: 85.3096 },
  { state: 'Bihar', district: 'Patna', block: 'Patna Sadar', lat: 25.5941, lng: 85.1376 },
  { state: 'West Bengal', district: 'Kolkata', block: 'Salt Lake', lat: 22.5726, lng: 88.3639 },
  { state: 'Odisha', district: 'Khurda', block: 'Bhubaneswar', lat: 20.2961, lng: 85.8245 },
  { state: 'Uttar Pradesh', district: 'Lucknow', block: 'Hazratganj', lat: 26.8467, lng: 80.9462 },
  { state: 'Delhi', district: 'New Delhi', block: 'Connaught Place', lat: 28.6139, lng: 77.2090 },
  { state: 'Maharashtra', district: 'Mumbai', block: 'Bandra', lat: 19.0760, lng: 72.8777 },
  { state: 'Karnataka', district: 'Bengaluru Urban', block: 'Indiranagar', lat: 12.9716, lng: 77.5946 },
  { state: 'Tamil Nadu', district: 'Chennai', block: 'T. Nagar', lat: 13.0827, lng: 80.2707 },
  { state: 'Telangana', district: 'Hyderabad', block: 'Banjara Hills', lat: 17.3850, lng: 78.4867 },
  { state: 'Andhra Pradesh', district: 'Guntur', block: 'Amaravati', lat: 16.5062, lng: 80.6480 },
  { state: 'Gujarat', district: 'Ahmedabad', block: 'Navrangpura', lat: 23.0225, lng: 72.5714 },
  { state: 'Rajasthan', district: 'Jaipur', block: 'Malviya Nagar', lat: 26.9124, lng: 75.7873 },
  { state: 'Madhya Pradesh', district: 'Bhopal', block: 'Arera Colony', lat: 23.2599, lng: 77.4126 },
  { state: 'Punjab', district: 'Amritsar', block: 'Civil Lines', lat: 31.6340, lng: 74.8723 },
  { state: 'Haryana', district: 'Gurugram', block: 'DLF Phase 1', lat: 28.4595, lng: 77.0266 },
  { state: 'Kerala', district: 'Thiruvananthapuram', block: 'Pattom', lat: 8.5241, lng: 76.9366 },
  { state: 'Assam', district: 'Kamrup', block: 'Guwahati', lat: 26.1445, lng: 91.7362 },
  { state: 'Chhattisgarh', district: 'Raipur', block: 'Telibandha', lat: 21.2514, lng: 81.6296 },
  { state: 'Himachal Pradesh', district: 'Shimla', block: 'Mall Road', lat: 31.1048, lng: 77.1734 },
  { state: 'Uttarakhand', district: 'Dehradun', block: 'Rajpur Road', lat: 30.3165, lng: 78.0322 },
  { state: 'Goa', district: 'North Goa', block: 'Panaji', lat: 15.4909, lng: 73.8278 },
  { state: 'Jammu and Kashmir', district: 'Srinagar', block: 'Lal Chowk', lat: 34.0837, lng: 74.7973 },
  { state: 'Tripura', district: 'West Tripura', block: 'Agartala', lat: 23.8315, lng: 91.2868 },
  { state: 'Manipur', district: 'Imphal West', block: 'Imphal', lat: 24.8170, lng: 93.9368 },
  { state: 'Meghalaya', district: 'East Khasi Hills', block: 'Shillong', lat: 25.5788, lng: 91.8933 },
  { state: 'Nagaland', district: 'Kohima', block: 'Kohima', lat: 25.6751, lng: 94.1086 },
  { state: 'Mizoram', district: 'Aizawl', block: 'Aizawl', lat: 23.7271, lng: 92.7176 },
  { state: 'Sikkim', district: 'East Sikkim', block: 'Gangtok', lat: 27.3389, lng: 88.6065 },
  { state: 'Arunachal Pradesh', district: 'Papum Pare', block: 'Itanagar', lat: 27.0844, lng: 93.6053 },
  { state: 'Ladakh', district: 'Leh', block: 'Leh', lat: 34.1526, lng: 77.5771 },
];

function cleanDistrictName(rawDistrict?: string | null): string {
  if (!rawDistrict) return '';
  return rawDistrict
    .replace(/\b(District|district|Zila|zila)\b/gi, '')
    .trim();
}

function cleanStateName(rawState?: string | null): string {
  if (!rawState) return 'Jharkhand';
  return rawState
    .replace(/\b(State of|State|Province|National Capital Territory of)\b/gi, '')
    .trim();
}

function findNearestIndianLocation(lat: number, lng: number): GeocodedLocation {
  let nearest = ALL_INDIA_STATES[0];
  let minDistance = Infinity;

  for (const item of ALL_INDIA_STATES) {
    const dLat = lat - item.lat;
    const dLng = lng - item.lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistance) {
      minDistance = distSq;
      nearest = item;
    }
  }

  return {
    state: nearest.state,
    district: nearest.district,
    block: nearest.block,
    formattedAddress: `${nearest.block}, ${nearest.district}, ${nearest.state}, India`,
  };
}

/**
 * Reverse geocode latitude and longitude for ANY location in India.
 * Resolves State, District, and Block / Locality.
 */
export async function reverseGeocodeCoords(latitude: number, longitude: number): Promise<GeocodedLocation> {
  // Method 1: expo-location native reverseGeocodeAsync
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results && results.length > 0) {
      const item = results[0];
      const state = cleanStateName(item.region);
      const rawDistrict = cleanDistrictName(item.district || item.subregion || item.city);
      const rawBlock = item.name || item.street || item.subregion || item.city || 'Central';

      const parts = [
        item.name,
        item.street,
        rawDistrict,
        state,
        item.country || 'India',
      ].filter(Boolean);

      if (state && rawDistrict) {
        return {
          state,
          district: rawDistrict,
          block: rawBlock,
          formattedAddress: parts.join(', '),
        };
      }
    }
  } catch (err) {
    console.log('Native reverse geocode skipped, trying Nominatim fallback', err);
  }

  // Method 2: OpenStreetMap Nominatim API (covers every corner of India)
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SamvadSetuIndia/1.0',
      },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const state = cleanStateName(addr.state || addr.province || addr.state_district);
        const district = cleanDistrictName(
          addr.state_district || addr.county || addr.district || addr.city
        );
        const block =
          addr.suburb ||
          addr.neighbourhood ||
          addr.village ||
          addr.town ||
          addr.subdistrict ||
          addr.road ||
          addr.municipality ||
          'Central';

        if (state && district) {
          const parts = [block, district, state, 'India'].filter(Boolean);
          return {
            state,
            district,
            block,
            formattedAddress: data.display_name?.split(',').slice(0, 3).join(', ') || parts.join(', '),
          };
        }
      }
    }
  } catch (err) {
    console.log('Nominatim reverse geocode skipped', err);
  }

  // Method 3: Spatial nearest-centroid fallback across India
  return findNearestIndianLocation(latitude, longitude);
}

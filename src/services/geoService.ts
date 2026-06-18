import * as Location from 'expo-location';

// Indian Creator Ecosystem Cities and Coordinates
export const CITY_COORDINATES: Record<string, { latitude: number; longitude: number }> = {
  Indore: { latitude: 22.7196, longitude: 75.8577 },
  Bhopal: { latitude: 23.2599, longitude: 77.4126 },
  Raipur: { latitude: 21.2514, longitude: 81.6296 },
  Dewas: { latitude: 22.9623, longitude: 76.0508 },
  Jaipur: { latitude: 26.9124, longitude: 75.7873 },
  Lucknow: { latitude: 26.8467, longitude: 80.9462 },
  Surat: { latitude: 21.1702, longitude: 72.8311 },
  Nagpur: { latitude: 21.1458, longitude: 79.0882 }
};

// Haversine formula to calculate the distance between two lat/lon points in kilometers
export function getHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

export async function requestGPSLocation(): Promise<{
  latitude: number;
  longitude: number;
  city: string;
} | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Reverse geocode to find city
    const reverseGeocode = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    let city = 'Indore'; // Default fallback city
    if (reverseGeocode && reverseGeocode.length > 0) {
      city = reverseGeocode[0].city || reverseGeocode[0].subregion || 'Indore';
    }

    return { latitude, longitude, city };
  } catch (error) {
    console.warn('GPS location request failed:', error);
    return null;
  }
}



import type { LatLng } from "@/types";

const EARTH_RADIUS_METERS = 6371000;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Haversine distance between two points in meters.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinDLng * sinDLng;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h));
}

type Checkpoint = {
  latitude: number;
  longitude: number;
  radiusMeters: number;
};

/**
 * Checks if any point on a route falls within a checkpoint's geofence radius.
 * Returns the minimum distance found, or null if no point is within radius.
 */
export function checkRouteAgainstGeofence(
  route: LatLng[],
  checkpoint: Checkpoint
): { hit: boolean; minDistance: number } {
  const center: LatLng = { lat: checkpoint.latitude, lng: checkpoint.longitude };
  let minDistance = Infinity;

  for (const point of route) {
    const distance = haversineDistance(point, center);
    if (distance < minDistance) {
      minDistance = distance;
    }
    // Early exit when we find a hit
    if (distance <= checkpoint.radiusMeters) {
      return { hit: true, minDistance: distance };
    }
  }

  return { hit: false, minDistance };
}

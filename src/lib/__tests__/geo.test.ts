import { describe, it, expect } from "vitest";
import { haversineDistance, checkRouteAgainstGeofence } from "@/lib/geo";

describe("haversineDistance", () => {
  it("calculates distance between OSU Oval and Ohio Stadium as ~800-900m", () => {
    const osuOval = { lat: 39.9995, lng: -83.0108 };
    const ohioStadium = { lat: 40.0017, lng: -83.0197 };

    const distance = haversineDistance(osuOval, ohioStadium);

    expect(distance).toBeGreaterThan(750);
    expect(distance).toBeLessThan(850);
  });

  it("returns 0 distance for the same point", () => {
    const point = { lat: 40.0, lng: -83.0 };

    const distance = haversineDistance(point, point);

    expect(distance).toBe(0);
  });
});

describe("checkRouteAgainstGeofence", () => {
  const checkpoint = {
    latitude: 40.0,
    longitude: -83.0,
    radiusMeters: 100,
  };

  it("returns hit:true when a route point is inside the geofence radius", () => {
    // Point essentially at the checkpoint center
    const route = [{ lat: 40.0, lng: -83.0 }];

    const result = checkRouteAgainstGeofence(route, checkpoint);

    expect(result.hit).toBe(true);
    expect(result.minDistance).toBeLessThan(100);
  });

  it("returns hit:false when all route points are outside the geofence radius", () => {
    // Point ~1km away
    const route = [{ lat: 40.01, lng: -83.01 }];

    const result = checkRouteAgainstGeofence(route, checkpoint);

    expect(result.hit).toBe(false);
    expect(result.minDistance).toBeGreaterThan(100);
  });

  it("returns hit:true with early exit when one point is inside among many outside", () => {
    const route = [
      { lat: 41.0, lng: -84.0 }, // far away
      { lat: 40.0, lng: -83.0 }, // at checkpoint
      { lat: 42.0, lng: -85.0 }, // far away
    ];

    const result = checkRouteAgainstGeofence(route, checkpoint);

    expect(result.hit).toBe(true);
    // minDistance should be ~0 since one point is at the center
    expect(result.minDistance).toBeLessThan(1);
  });

  it("returns hit:false with minDistance=Infinity for an empty route", () => {
    const result = checkRouteAgainstGeofence([], checkpoint);

    expect(result.hit).toBe(false);
    expect(result.minDistance).toBe(Infinity);
  });
});

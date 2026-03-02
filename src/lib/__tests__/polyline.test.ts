import { describe, it, expect } from "vitest";
import { decodePolyline } from "@/lib/polyline";

describe("decodePolyline", () => {
  it("decodes a known encoded polyline to approximate coordinates", () => {
    // Google's example polyline encoding
    const encoded = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
    const points = decodePolyline(encoded);

    expect(points).toHaveLength(3);

    expect(points[0].lat).toBeCloseTo(38.5, 1);
    expect(points[0].lng).toBeCloseTo(-120.2, 1);

    expect(points[1].lat).toBeCloseTo(40.7, 1);
    expect(points[1].lng).toBeCloseTo(-120.95, 1);

    expect(points[2].lat).toBeCloseTo(43.252, 1);
    expect(points[2].lng).toBeCloseTo(-126.453, 1);
  });

  it("returns an empty array for an empty string", () => {
    const points = decodePolyline("");
    expect(points).toEqual([]);
  });

  it("decodes a single point encoding", () => {
    // Encode (38.5, -120.2) manually:
    // lat = 38.5 -> 3850000 -> "~ps|U" ... but easier to just encode the first point
    // from the known polyline. The first point is encoded as "_p~iF~ps|U"
    const encoded = "_p~iF~ps|U";
    const points = decodePolyline(encoded);

    expect(points).toHaveLength(1);
    expect(points[0].lat).toBeCloseTo(38.5, 1);
    expect(points[0].lng).toBeCloseTo(-120.2, 1);
  });
});

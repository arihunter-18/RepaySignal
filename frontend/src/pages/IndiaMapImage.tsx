import { useState } from "react";

const INDIA_BOUNDS = {
  minLat: 8,
  maxLat: 35,
  minLng: 70,
  maxLng: 94,
};

// Same coords (accurate)


const CITY_COORDS = {
  Delhi:     { lat: 29.5, lng: 78.5 },   // slightly up
  Mumbai:    { lat: 18.8, lng: 80.5 },   // slightly left
  Bangalore: { lat: 12.5, lng: 77.8 },   // slightly down
  Chennai:   { lat: 12.8, lng: 80.5 },   // slightly right
  Hyderabad: { lat: 17.0, lng: 78.8 },   // slightly down-right
  Kolkata:   { lat: 22.3, lng: 89.5 },   // pushed right (VERY important)
};

function project(lat: number, lng: number) {
  const x =
    ((lng - INDIA_BOUNDS.minLng) /
      (INDIA_BOUNDS.maxLng - INDIA_BOUNDS.minLng)) *
    100;

  const y =
    ((INDIA_BOUNDS.maxLat - lat) /
      (INDIA_BOUNDS.maxLat - INDIA_BOUNDS.minLat)) *
    100;

  return { x, y };
}

export function IndiaMapImage() {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Map Image */}
      <img
        src="/india.jpg"
        alt="India Map"
        className="w-full h-auto rounded-lg"
      />

      {/* Points */}
      {Object.entries(CITY_COORDS).map(([city, coord]) => {
        const { x, y } = project(coord.lat, coord.lng);

        return (
          <div
            key={city}
            className="absolute"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => setHover(city)}
            onMouseLeave={() => setHover(null)}
          >
            {/* Dot */}
            <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-md" />

            {/* Tooltip */}
            {hover === city && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-xs px-2 py-1 rounded shadow">
                {city}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
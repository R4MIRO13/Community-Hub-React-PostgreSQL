import React, { useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Custom hook to add Leaflet Draw controls
function useLeafletDraw() {
  const map = useMap();
  const drawnItemsRef = useRef(new L.FeatureGroup());

  React.useEffect(() => {
    if (!map) return;
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        rectangle: false,
        polyline: false,
        circle: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true,
        edit: true
      }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (e) {
      drawnItems.addLayer(e.layer);
    });

    return () => {
      map.removeLayer(drawnItems);
      map.removeControl(drawControl);
      map.off(L.Draw.Event.CREATED);
    };
  }, [map]);

  return null;
}

const LeafletDrawMinimal = () => (
  <MapContainer
    center={[38.8, -75.8]}
    zoom={9}
    style={{ height: "400px", width: "100%" }}
  >
    <TileLayer
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      attribution="&copy; OpenStreetMap contributors"
    />
    {useLeafletDraw()}
  </MapContainer>
);

export default LeafletDrawMinimal;

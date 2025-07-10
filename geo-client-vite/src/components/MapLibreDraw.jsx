import React, { useRef, useEffect } from "react";
import Map, { Source, Layer } from "react-map-gl";
import maplibregl from "maplibre-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "maplibre-gl/dist/maplibre-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";
const INITIAL_VIEW_STATE = {
  longitude: -75.8,
  latitude: 38.8,
  zoom: 8
};

const MapLibreDraw = ({ onDrawnFeatures }) => {
  const mapRef = useRef();
  const drawRef = useRef();
  const [drawnFeatures, setDrawnFeatures] = React.useState([]);

  useEffect(() => {
    const map = mapRef.current.getMap();
    if (!drawRef.current) {
      drawRef.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        }
      });
      map.addControl(drawRef.current, "top-right");
      map.on("draw.create", updateDrawn);
      map.on("draw.delete", updateDrawn);
      map.on("draw.update", updateDrawn);
    }
    function updateDrawn() {
      const features = drawRef.current.getAll().features;
      setDrawnFeatures(features);
      if (onDrawnFeatures) onDrawnFeatures(features);
    }
    return () => {
      if (drawRef.current) {
        map.off("draw.create", updateDrawn);
        map.off("draw.delete", updateDrawn);
        map.off("draw.update", updateDrawn);
        map.removeControl(drawRef.current);
        drawRef.current = null;
      }
    };
  }, [onDrawnFeatures]);

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: "100%", height: "100%" }}
        mapLib={maplibregl}
        mapStyle={MAP_STYLE}
      />
      {/* You can display drawn features below if needed */}
      {drawnFeatures.length > 0 && (
        <pre style={{ fontSize: 12, background: "#f8f9fa", padding: 8, marginTop: 8 }}>
          {JSON.stringify(drawnFeatures, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default MapLibreDraw;

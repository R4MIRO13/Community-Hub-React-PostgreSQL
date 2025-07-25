import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import "leaflet-draw/dist/leaflet.draw.css";

/**
 * RectangleDrawControl: Adds a Leaflet draw control to the map for drawing rectangles.
 * Props:
 *   onRectangleDrawn: function(geojson) called when a rectangle is finished
 *   active: boolean, whether drawing mode is enabled
 *   onCancel: function() called if drawing is cancelled
 */
const RectangleDrawControl = ({ onRectangleDrawn, active, onCancel }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let drawnLayer = null;
    let drawControl = null;
    let rectangleDrawer = null;

    // Add draw control only once
    if (!map._drawControlAddedPoly) {
      drawControl = new L.Control.Draw({
        draw: {
          polygon: {
            shapeOptions: { color: '#1976d2', weight: 2 },
            repeatMode: false,
          },
          rectangle: false,
          polyline: false,
          circle: false,
          marker: false,
          circlemarker: false,
        },
        edit: false,
      });
      map.addControl(drawControl);
      map._drawControlAddedPoly = true;
    }

    // Listen for polygon creation
    const handleCreated = (e) => {
      if (drawnLayer) {
        map.removeLayer(drawnLayer);
      }
      if (e.layerType === 'polygon') {
        drawnLayer = e.layer;
        map.addLayer(drawnLayer);
        if (onRectangleDrawn) {
          onRectangleDrawn(drawnLayer.toGeoJSON());
        }
      }
    };
    map.on(L.Draw.Event.CREATED, handleCreated);

    // Ensure pointer events are enabled on the map container
    if (map._container) {
      map._container.style.pointerEvents = 'auto';
    }

    // Automatically activate polygon draw tool when active becomes true
    if (active) {
      const polygonDrawer = new L.Draw.Polygon(map, {
        shapeOptions: { color: '#1976d2', weight: 2 },
        repeatMode: false,
      });
      polygonDrawer.enable();
    }

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      if (drawnLayer) map.removeLayer(drawnLayer);
    };
  }, [map, active, onRectangleDrawn]);

  useEffect(() => {
    if (!active && onCancel) {
      onCancel();
    }
  }, [active, onCancel]);

  return null;
};

export default RectangleDrawControl;
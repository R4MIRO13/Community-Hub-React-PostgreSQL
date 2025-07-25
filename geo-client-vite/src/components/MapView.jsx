import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import L from "leaflet";
import RectangleDrawControl from "./PolygonDrawControl";
import { Box } from "@mui/material";

const MapView = ({ 
  countyData, 
  geoData, 
  foodPoints, 
  slrParcelsData,
  selectedCounty, 
  selectedMunicipality,
  getColorByDecile,
  isDrawingPolygon,
  onPolygonDrawn,
  onDrawCancel,
  drawnPolygon,
  selectedBasemap,
  subdecileMode,
  selectedDecileForSub
}) => {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        bounds={[
          [37.8, -76.5],
          [39.8, -74.8],
        ]}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url={selectedBasemap.url}
          attribution={selectedBasemap.attribution}
        />
        {/* Rectangle Drawing Control */}
        <RectangleDrawControl
          active={isDrawingPolygon}
          onRectangleDrawn={onPolygonDrawn}
          onCancel={onDrawCancel}
        />
        {/* Drawn Rectangle Display */}
        {drawnPolygon && (
          <GeoJSON data={drawnPolygon} style={{ color: '#1976d2', weight: 2, fillOpacity: 0.1 }} />
        )}
        {/* County Boundaries Layer */}
        {countyData && (
          <GeoJSON
            key={`county-layer-${selectedCounty || "all"}`}
            data={{
              ...countyData,
              features: selectedCounty
                ? countyData.features.filter(
                    (f) => f.properties.name === selectedCounty
                  )
                : countyData.features,
            }}
            style={{
              color: "#000000",
              weight: 1.5,
              fillOpacity: 0,
              dashArray: "4",
            }}
            interactive={false}
            onEachFeature={(feature, layer) => {
              const countyName = feature.properties.name;
              layer.bindTooltip(`County: ${countyName}`, { permanent: false });
            }}
          />
        )}
        {/* Parcel Data Layer */}
        {geoData && (
          <GeoJSON
            key={`${selectedMunicipality || selectedCounty}-${geoData?.features?.length || 0}-${subdecileMode ? selectedDecileForSub : 'all'}`}
            data={geoData}
            style={(feature) => {
              const props = feature.properties;
              const decile = props.vpa_decile;
              const subdecile = props.vpa_subdecile;
              const defaultColor = "#3388ff";

              if (subdecileMode) {
                if (decile === selectedDecileForSub) {
                  const color = getColorByDecile(subdecile);
                  return {
                    color,
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 0.6,
                  };
                } else {
                  const color = defaultColor;
                  return {
                    color,
                    weight: 2,
                    fillColor: color,
                    fillOpacity: 0.4, // Dim color for non-selected deciles
                  };
                }
              }

              const color =
                selectedMunicipality && decile > 0
                  ? getColorByDecile(decile)
                  : defaultColor;

              return {
                color,
                weight: 2,
                fillColor: color,
                fillOpacity: 0.6,
              };
            }}
            onEachFeature={(feature, layer) => {
              const props = feature.properties;
              let popupContent = `
                <div style="max-height: 200px; overflow-y: auto; font-size: 12px; font-family: Arial, sans-serif; border: 1px solid #ccc; padding: 4px;">
                  <table style="border-collapse: collapse; width: 100%;">
                    <thead>
                      <tr style="background: #f0f0f0;">
                        <th style="text-align: left; padding: 4px; border-bottom: 1px solid #ccc;">Property</th>
                        <th style="text-align: left; padding: 4px; border-bottom: 1px solid #ccc;">Value</th>
                      </tr>
                    </thead>
                    <tbody>
              `;

              for (const key in props) {
                if (key !== "geom" && key !== "vpa_decile" && key !== "vpa_subdecile") {
                  popupContent += `
                    <tr>
                      <td style="padding: 4px; border-bottom: 1px solid #eee;">${key}</td>
                      <td style="padding: 4px; border-bottom: 1px solid #eee;">${props[key]}</td>
                    </tr>
                  `;
                }
              }

              popupContent += `
                    </tbody>
                  </table>
                </div>
              `;

              layer.bindPopup(popupContent);
            }}
          />
        )}
        {/* Food Access Points Layer */}
        {foodPoints && (
          <GeoJSON
            key={`foodpoints-${foodPoints.features?.length || 0}`}
            data={foodPoints}
            pointToLayer={(feature, latlng) =>
              L.circleMarker(latlng, {
                radius: 6,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
              })
            }
            onEachFeature={(feature, layer) => {
              const props = feature.properties;
              let popupContent = "<table style='font-size: 12px;'>";
              for (const key in props) {
                popupContent += `<tr><td style='font-weight: bold; text-align: left; padding: 2px 8px 2px 0;'>${key}</td><td style='padding: 2px;'>${props[key]}</td></tr>`;
              }
              popupContent += "</table>";
              layer.bindPopup(popupContent);
            }}
          />
        )}
        {/* SLR Parcels Layer */}
        {slrParcelsData && (
          <GeoJSON 
            key={`slrparcels-${slrParcelsData.features?.length || 0}`}
            data={slrParcelsData} 
            style={{ color: "pink", weight: 1, fillColor: "pink", fillOpacity: 0.3, opacity: 0.6 }} 
            onEachFeature={(feature, layer) => {
              const props = feature.properties;
              let popupContent = "<table style='font-size: 12px;'>";
              for (const key in props) {
                popupContent += `<tr><td style='font-weight: bold; text-align: left; padding: 2px 8px 2px 0;'>${key}</td><td style='padding: 2px;'>${props[key]}</td></tr>`;
              }
              popupContent += "</table>";
              layer.bindPopup(popupContent);
            }}
          />
        )}
      </MapContainer>
    </Box>
  );
};

export default MapView;
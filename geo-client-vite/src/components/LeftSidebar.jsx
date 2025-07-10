import React, { useState } from "react";
import { Box, Paper, Typography, Divider, Button, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import LayerToggleControls from "./LayerToggleControls";
import MapLibreDraw from "./MapLibreDraw";

const LeftSidebar = (props) => {
  // Add local state for draw mode and drawn polygon
  const [drawMode, setDrawMode] = useState(false);
  const [drawnFeatures, setDrawnFeatures] = useState([]);

  // Destructure location filter props
  const {
    countyData,
    municipalities,
    selectedCounty,
    selectedMunicipality,
    onCountyChange,
    onMunicipalityChange,
    onDrawPolygon,
    isDrawingPolygon,
    onClearPolygon
  } = props;

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        height: "100vh",
        width: 340,
        minWidth: 260,
        maxWidth: 400,
        bgcolor: "#f7f7f9",
        borderRadius: 0,
        borderRight: "1px solid #d1d5db",
        boxShadow: "2px 0 12px 0 rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1200,
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0", bgcolor: "#f1f3f6" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 15 }}>
          Layers & Filters
        </Typography>
      </Box>
      <Divider />
      {/* Location Filter Section */}
      <Box sx={{ p: 2, pb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, fontSize: 13 }}>
          Filter by Location
        </Typography>
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel id="county-select-label">County</InputLabel>
          <Select
            id="county-select"
            name="county"
            labelId="county-select-label"
            value={selectedCounty}
            label="County"
            onChange={e => onCountyChange && onCountyChange(e.target.value)}
          >
            <MenuItem value="">All Counties</MenuItem>
            {countyData && countyData.features.map(f => (
              <MenuItem key={f.properties.name} value={f.properties.name}>{f.properties.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth size="small" sx={{ mb: 1 }}>
          <InputLabel id="municipality-select-label">Municipality</InputLabel>
          <Select
            id="municipality-select"
            name="municipality"
            labelId="municipality-select-label"
            value={selectedMunicipality}
            label="Municipality"
            onChange={e => onMunicipalityChange && onMunicipalityChange(e.target.value)}
            disabled={!selectedCounty}
          >
            <MenuItem value="">All Municipalities</MenuItem>
            {municipalities && municipalities.map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
          <Button
            variant={isDrawingPolygon ? "contained" : "outlined"}
            color="primary"
            size="small"
            sx={{ fontSize: 11, textTransform: 'none', minWidth: 0, px: 1, py: 0.5 }}
            onClick={() => onDrawPolygon && onDrawPolygon()}
          >
            {isDrawingPolygon ? "Drawing..." : "Draw Polygon"}
          </Button>
          {isDrawingPolygon && (
            <Button
              variant="text"
              color="secondary"
              size="small"
              sx={{ fontSize: 11, textTransform: 'none', minWidth: 0, px: 1, py: 0.5 }}
              onClick={() => onClearPolygon && onClearPolygon()}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ fontSize: 11, textTransform: 'none', minWidth: 0, px: 1.5, py: 0.5 }}
            onClick={props.onLocationOk}
            disabled={!(selectedCounty || isDrawingPolygon)}
          >
            OK
          </Button>
        </Box>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2, pt: 0 }}>
        <LayerToggleControls {...props} />
      </Box>
      <Box sx={{ p: 2 }}>
        <Button
          variant={drawMode ? "contained" : "outlined"}
          color="primary"
          size="small"
          sx={{ mb: 2, fontSize: 13, textTransform: 'none' }}
          onClick={() => setDrawMode((prev) => !prev)}
        >
          {drawMode ? "Exit Polygon Draw" : "Draw Polygon (MapLibre)"}
        </Button>
        {drawMode && (
          <MapLibreDraw
            onDrawnFeatures={setDrawnFeatures}
          />
        )}
        {drawnFeatures.length > 0 && (
          <Box sx={{ mt: 2, p: 1, bgcolor: "#f8f9fa", borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              Drawn Polygon GeoJSON:
            </Typography>
            <pre style={{ fontSize: 12, margin: 0 }}>
              {JSON.stringify(drawnFeatures, null, 2)}
            </pre>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default LeftSidebar;

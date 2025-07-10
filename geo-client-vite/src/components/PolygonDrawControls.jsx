import React from "react";
import { Box, Button } from "@mui/material";

const PolygonDrawControls = ({
  isDrawingPolygon,
  onDrawPolygon,
  onClearPolygon,
  onLocationOk,
  selectedCounty
}) => (
  <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
    <Button
      variant={isDrawingPolygon ? "contained" : "outlined"}
      color="primary"
      size="small"
      sx={{ fontSize: 11, textTransform: 'none', minWidth: 0, px: 1, py: 0.5 }}
      onClick={onDrawPolygon}
    >
      {isDrawingPolygon ? "Drawing..." : "Draw Polygon"}
    </Button>
    {isDrawingPolygon && (
      <Button
        variant="text"
        color="secondary"
        size="small"
        sx={{ fontSize: 11, textTransform: 'none', minWidth: 0, px: 1, py: 0.5 }}
        onClick={onClearPolygon}
      >
        Cancel
      </Button>
    )}
    <Button
      variant="contained"
      color="success"
      size="small"
      sx={{ fontSize: 11, textTransform: 'none', minWidth: 0, px: 1.5, py: 0.5 }}
      onClick={onLocationOk}
      disabled={!(selectedCounty || isDrawingPolygon)}
    >
      OK
    </Button>
  </Box>
);

export default PolygonDrawControls;

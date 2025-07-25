import React, { useState } from "react";
import { Box, Button, Menu, MenuItem, IconButton } from "@mui/material";
import MapIcon from '@mui/icons-material/Map';

const BASEMAPS = [
  {
    key: "osm",
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors"
  },
  {
    key: "esri",
    name: "ESRI World Imagery",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
  },
  {
    key: "carto-dark",
    name: "CartoDB Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; <a href='https://carto.com/attributions'>CARTO</a>"
  }
];

export default function BasemapSwitcher({ basemap, setBasemap }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);
  const handleSelectBasemap = (key) => {
    setBasemap(key);
    handleCloseMenu();
  };

  return (
    <Box sx={{ position: 'relative', zIndex: 3000 }}>
      <IconButton
        onClick={handleOpenMenu}
        sx={{
          background: '#fff',
          border: 'none',
          borderRadius: '50%',
          boxShadow: 'none',
          fontSize: 20,
          color: '#1976d2',
          cursor: 'pointer',
          padding: 0.5,
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        size="small"
        aria-label="Basemap"
      >
        <MapIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        {BASEMAPS.map(b => (
          <MenuItem key={b.key} selected={basemap === b.key} onClick={() => handleSelectBasemap(b.key)}>
            {b.name}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

export { BASEMAPS };
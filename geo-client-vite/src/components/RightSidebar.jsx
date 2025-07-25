import React, { useState, useEffect } from "react";
import { Box, Paper, Typography, Divider, Button, MenuItem, Select, InputLabel, FormControl, TextField, CircularProgress, IconButton } from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import PublicIcon from '@mui/icons-material/Public';
import FolderIcon from '@mui/icons-material/Folder';
import WavesIcon from '@mui/icons-material/Waves';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

/**
 * Inline panel versions of Upload and Download sections
 */
const UploadPanel = ({
  API_URL,
  uploadType,
  setUploadType,
  uploadCounty,
  setUploadCounty,
  uploadMunicipality,
  setUploadMunicipality,
  uploadFile,
  setUploadFile,
  uploading,
  onSubmit,
  countyData,
  handleUploadModalClose,
}) => {
  const [municipalitiesLocal, setMunicipalitiesLocal] = useState([]);

  useEffect(() => {
    setMunicipalitiesLocal([]);
  }, [uploadType]);

  // Remove modalOpen check so panel is always visible
  return (
    <Box sx={{ p: 2, bgcolor: '#f7f7f9', fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#222' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <CloudUploadIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '13px', color: '#222' }}>
          Upload Geospatial Data
        </Typography>
      </Box>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <FormControl fullWidth required size="small">
          <InputLabel>Data Type</InputLabel>
          <Select
            value={uploadType}
            label="Data Type"
            onChange={e => {
              setUploadType(e.target.value);
              setUploadCounty("");
              setUploadMunicipality("");
              setUploadFile(null);
              setMunicipalitiesLocal([]);
            }}
            sx={{ fontSize: '13px' }}
          >
            <MenuItem value="">Choose Data Type</MenuItem>
            <MenuItem value="landvpa"><PublicIcon sx={{ mr: 1, fontSize: 16 }} />Land & Property Data</MenuItem>
            <MenuItem value="foodaccesspoints"><FolderIcon sx={{ mr: 1, fontSize: 16 }} />Food Access Points</MenuItem>
            <MenuItem value="slr"><WavesIcon sx={{ mr: 1, fontSize: 16 }} />Sea Level Rise</MenuItem>
          </Select>
        </FormControl>
        {uploadType === "landvpa" && (
          <>
            <FormControl fullWidth required size="small" sx={{ mt: 1 }}>
              <InputLabel>County</InputLabel>
              <Select
                value={uploadCounty}
                label="County"
                onChange={async e => {
                  const val = e.target.value;
                  setUploadCounty(val);
                  setUploadMunicipality("");
                  // Fetch municipalities for selected county
                  try {
                    const files = await fetch(`${API_URL}/api/files`).then(res => res.json());
                    const uploadedMunicipalities = (files.landvpa || []).map(f => {
                      const match = f.filename.match(/^(.+?)_VPA\.geojson$/i);
                      if (!match) return null;
                      return match[1].replace(/_/g, " ").toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ").trim();
                    }).filter(Boolean);
                    const data = await fetch(`${API_URL}/api/municipalities?county=${val}`).then(res => res.json());
                    const filtered = data.filter(m => !uploadedMunicipalities.includes(m));
                    setMunicipalitiesLocal(filtered);
                  } catch {
                    setMunicipalitiesLocal([]);
                  }
                }}
                sx={{ fontSize: '13px' }}
              >
                <MenuItem value="">Choose County</MenuItem>
                {countyData && countyData.features.map(f => (
                  <MenuItem key={f.properties.name} value={f.properties.name}>{f.properties.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required size="small" sx={{ mt: 1 }}>
              <InputLabel>Municipality</InputLabel>
              <Select
                value={uploadMunicipality}
                label="Municipality"
                onChange={e => setUploadMunicipality(e.target.value)}
                disabled={!uploadCounty}
                sx={{ fontSize: '13px' }}
              >
                <MenuItem value="">Choose Municipality</MenuItem>
                {municipalitiesLocal.map(m => (
                  <MenuItem key={m} value={m.name}>{m.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}
        {uploadType && (
          <Box sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<FolderIcon sx={{ fontSize: 16 }} />}
              fullWidth
              size="small"
              sx={{ fontSize: '13px', textTransform: 'none', py: 1 }}
            >
              {uploadFile ? uploadFile.name : "Select GeoJSON File"}
              <input
                type="file"
                accept=".geojson,.json"
                hidden
                onChange={e => setUploadFile(e.target.files[0])}
                required
              />
            </Button>
            {uploadFile && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', fontSize: '11px' }}>
                {uploadFile.name}
              </Typography>
            )}
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleUploadModalClose}
            startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
            fullWidth
            size="small"
            sx={{ fontSize: '13px', textTransform: 'none', py: 1 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon sx={{ fontSize: 16 }} />}
            disabled={
              uploading ||
              !uploadType ||
              (uploadType === "landvpa" && (!uploadCounty || !uploadMunicipality || !uploadFile)) ||
              ((uploadType === "foodaccesspoints" || uploadType === "slr") && !uploadFile)
            }
            fullWidth
            size="small"
            sx={{ fontSize: '13px', textTransform: 'none', py: 1 }}
          >
            {uploading ? "Uploading..." : "Upload Data"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

const DownloadPanel = ({
  API_URL,
  uploadedFiles,
  selectedCounty,
  selectedMunicipality,
  setDownloadOpen,
}) => {
  // Remove downloadOpen check so panel is always visible
  const downloadCurrentView = () => {
    let url = `${API_URL}/api/export`;
    const params = new URLSearchParams();
    if (selectedMunicipality) {
      params.append('municipality', selectedMunicipality);
    } else if (selectedCounty) {
      params.append('county', selectedCounty);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    window.open(url, '_blank');
  };
  const downloadFullDatabase = () => {
    window.open(`${API_URL}/api/export/full`, '_blank');
  };
  return (
    <Box sx={{ p: 2, bgcolor: '#f7f7f9', fontSize: '13px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#222' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <DownloadIcon color="primary" sx={{ mr: 1, fontSize: 18 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '13px', color: '#222' }}>
          Download Geospatial Data
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
        onClick={downloadCurrentView}
        sx={{ mb: 1, fontSize: '13px', textTransform: 'none', py: 1 }}
        fullWidth
        size="small"
      >
        Export Current View
      </Button>
      <Button
        variant="contained"
        color="success"
        startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
        onClick={downloadFullDatabase}
        sx={{ mb: 1, fontSize: '13px', textTransform: 'none', py: 1 }}
        fullWidth
        size="small"
      >
        Export Complete Database
      </Button>
      <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, fontSize: '12px', color: '#444' }}>
        Previously Uploaded Files
      </Typography>
      <Box sx={{ maxHeight: 140, overflowY: 'auto', bgcolor: '#fff', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
        {uploadedFiles && typeof uploadedFiles === "object" && Object.keys(uploadedFiles).length > 0 ? (
          Object.entries(uploadedFiles).map(([type, files]) => (
            <Box key={type} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5, fontSize: '12px' }}>
                {type === 'landvpa' ? <PublicIcon sx={{ mr: 1, fontSize: 15 }} /> :
                type === 'slr' ? <WavesIcon sx={{ mr: 1, fontSize: 15 }} /> :
                <FolderIcon sx={{ mr: 1, fontSize: 15 }} />}
                
                {type === 'landvpa' ? 'Land & Property Data' :
                type === 'slr' ? 'Sea Level Rise' :
                'Food Access Points'}
              </Typography>
              {Array.isArray(files) && files.map(file => (
                <Box key={file.filename} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5, p: 0.5, borderRadius: 1, bgcolor: '#f7f7f9' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 400, fontSize: '12px', color: '#222' }}>{file.filename}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '11px' }}>
                      Uploaded: {new Date(file.upload_date).toLocaleString()}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon sx={{ fontSize: 14 }} />}
                    href={`${API_URL}/api/files/download/${file.filename}`}
                    target="_blank"
                    sx={{ fontSize: '11px', textTransform: 'none', py: 0.5, px: 1.5 }}
                  >
                    Download
                  </Button>
                </Box>
              ))}
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 1, fontSize: '12px' }}>
            No files have been uploaded yet.
          </Typography>
        )}
      </Box>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => setDownloadOpen(false)}
        startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
        sx={{ mt: 1, fontSize: '13px', textTransform: 'none', py: 1 }}
        fullWidth
        size="small"
      >
        Close
      </Button>
    </Box>
  );
};

/**
 * RightSidebar component: Stacks UploadPanel and DownloadPanel in a right-aligned sidebar.
 * Props are passed through to the respective panels.
 */
const RightSidebar = (props) => {
  const { rightSidebarCollapsed, setRightSidebarCollapsed } = props;
  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "100vh",
        width: 380,
        minWidth: 320,
        maxWidth: 420,
        bgcolor: "#f7f7f9",
        borderRadius: 0,
        borderLeft: "1px solid #d1d5db",
        boxShadow: "-2px 0 12px 0 rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        zIndex: 1200,
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#222',
      }}
    >
      {/* Collapse handle as a vertical line */}
      <Box
        sx={{
          position: 'absolute',
          left: -12,
          top: 0,
          height: '100%',
          width: 12,
          bgcolor: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1300,
        }}
        onClick={() => setRightSidebarCollapsed(true)}
        aria-label="Collapse sidebar"
      >
        <Box sx={{
          width: 4,
          height: 32,
          bgcolor: '#d1d5db',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <ChevronLeftIcon fontSize="small" sx={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', color: '#1976d2' }} />
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', p: 1, borderBottom: "1px solid #e0e0e0", bgcolor: "#f1f3f6" }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '15px', color: '#222' }}>
          Data Management
        </Typography>
      </Box>
      <Divider />
      <UploadPanel {...props} />
      <Divider sx={{ my: 1 }} />
      <DownloadPanel {...props} />
    </Paper>
  );
};

export default RightSidebar;
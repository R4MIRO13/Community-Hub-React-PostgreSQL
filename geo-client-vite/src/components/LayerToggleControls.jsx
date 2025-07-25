import React, { useState } from "react";
import LayersIcon from '@mui/icons-material/Layers';
import FolderIcon from '@mui/icons-material/Folder';
import WavesIcon from '@mui/icons-material/Waves';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import InboxIcon from '@mui/icons-material/Inbox';

const LayerToggleControls = ({
  showLandVPA,
  setShowLandVPA,
  showFoodAccess,
  setShowFoodAccess,
  showSlr,
  setShowSlr,
  uploadedFiles,
  API_URL
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    landvpa: true,
    foodaccesspoints: true,
    slr: true,
  });

  const onToggleCollapse = () => setIsCollapsed((prev) => !prev);
  const toggleSection = (type) => {
    setExpandedSections((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div
      style={{
        background: "#f7f7f9",
        borderRadius: 0,
        boxShadow: "none",
        width: "100%",
        height: "100vh",
        maxHeight: "none",
        overflowY: "auto",
        userSelect: "none",
        border: "none",
        display: 'flex',
        flexDirection: 'column',
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#222',
      }}
    >
      {/* Header with toggle button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75em 1em",
          borderBottom: isCollapsed ? "none" : "1px solid #e0e0e0",
          background: '#f1f3f6',
        }}
      >
        <span
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#222",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontWeight: 600,
            letterSpacing: 0.1,
          }}
          title="Layer Visibility & Files"
        >
          <LayersIcon fontSize="small" style={{marginRight: 4, color: '#1976d2'}}/>
          Layer Visibility & Files
        </span>
        <button
          onClick={onToggleCollapse}
          style={{
            background: "none",
            border: "none",
            fontSize: "16px",
            cursor: "pointer",
            padding: "2px",
            lineHeight: 1,
            borderRadius: 0,
            color: '#888',
          }}
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </button>
      </div>

      {!isCollapsed && (
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#f7f7f9",
            margin: 0,
            padding: '0.5em 0.5em 0.5em 0.5em',
            border: 'none',
          }}
        >
          {uploadedFiles &&
          typeof uploadedFiles === "object" &&
          Object.keys(uploadedFiles).length > 0 ? (
            Object.entries(uploadedFiles).map(([type, files]) => {
              const isLand = type === "landvpa";
              const isFood = type === "foodaccesspoints";
              const isSlr = type === "slr";
              const isVisible = isLand
                ? showLandVPA
                : isFood
                ? showFoodAccess
                : isSlr
                ? showSlr
                : true;
              const expanded = expandedSections[type];
              return (
                <div key={type} style={{ borderBottom: "1px solid #ececec", marginBottom: 2 }}>
                  <div
                    style={{
                      padding: "0.5em 0.5em 0.5em 0.5em",
                      background: "#f9f9fb",
                      fontWeight: 500,
                      fontSize: "12px",
                      color: "#333",
                      borderBottom: "1px solid #e0e0e0",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
                      {isLand ? (
                        <LayersIcon fontSize="small" style={{ color: "#1976d2" }} />
                      ) : isFood ? (
                        <FolderIcon fontSize="small" style={{ color: "#e67e22" }} />
                      ) : isSlr ? (
                        <WavesIcon fontSize="small" style={{ color: "pink" }} />
                      ) : (
                        <InsertDriveFileIcon fontSize="small" style={{ color: "#757575" }} />
                      )}
                      {isLand
                        ? "Land & Property Data"
                        : isFood
                        ? "Food Access Points"
                        : isSlr
                        ? "Sea Level Rise"
                        : type}
                    </span>
                    <div style={{ display: "flex", gap: "0.25em" }}>
                      {(isLand || isFood || isSlr) && (
                        <button
                          onClick={() => {
                            if (isLand) setShowLandVPA((prev) => !prev);
                            if (isFood) setShowFoodAccess((prev) => !prev);
                            if (isSlr) setShowSlr((prev) => !prev);
                          }}
                          style={{
                            width: "24px",
                            height: "24px",
                            background: isVisible ? "#1976d2" : "#b0b0b0",
                            border: "none",
                            borderRadius: 2,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0
                          }}
                          title={isVisible ? "Hide Layer" : "Show Layer"}
                          aria-label={isVisible ? "Hide Layer" : "Show Layer"}
                        >
                          {isVisible ? <VisibilityIcon style={{color: '#fff', fontSize: 16}} /> : <VisibilityOffIcon style={{color: '#fff', fontSize: 16}} />}
                        </button>
                      )}
                      <button
                        onClick={() => toggleSection(type)}
                        style={{
                          width: "24px",
                          height: "24px",
                          background: "#e5e5e5",
                          border: "none",
                          borderRadius: 2,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "13px",
                          fontWeight: "bold",
                          color: '#555',
                        }}
                        title={expanded ? "Collapse files" : "Expand files"}
                        aria-label={expanded ? "Collapse files" : "Expand files"}
                      >
                        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                      </button>
                    </div>
                  </div>
                  {expanded &&
                    Array.isArray(files) &&
                    files.map((file) => (
                      <div
                        key={file.filename}
                        style={{
                          padding: "0.5em 0.5em 0.5em 1.5em",
                          borderBottom: "1px solid #f1f3f4",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "12px",
                          background: '#fff',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 400, color: "#222", fontSize: '12px' }}>
                            {file.filename}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "#888",
                              marginTop: "2px",
                            }}
                          >
                            Uploaded: {new Date(file.upload_date).toLocaleString()}
                          </div>
                        </div>
                        <a
                          href={`${API_URL}/api/files/download/${file.filename}`}
                          download
                          style={{
                            padding: "4px 8px",
                            background: "#1976d2",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: 2,
                            fontSize: "11px",
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3
                          }}
                        >
                          <DownloadIcon fontSize="small" style={{fontSize: 15}}/> Download
                        </a>
                      </div>
                    ))}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: "2em 0.5em",
                textAlign: "center",
                color: "#888",
                fontSize: "12px",
              }}
            >
              <InboxIcon style={{ fontSize: 32, marginBottom: "0.5em", color: '#bdbdbd' }} />
              <div>No files have been uploaded yet.</div>
              <div style={{ fontSize: "11px", marginTop: "0.5em" }}>
                Upload some GeoJSON files to see them here.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LayerToggleControls;
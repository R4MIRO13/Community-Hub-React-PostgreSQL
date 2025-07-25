import React from 'react';

const DownloadModal = ({ 
  isOpen, 
  onClose, 
  uploadedFiles, 
  selectedCounty, 
  selectedMunicipality, 
  API_URL 
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

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
    <div 
      style={{
        position: "fixed", 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        background: "rgba(0,0,0,0.6)", 
        display: "flex",
        justifyContent: "center", 
        alignItems: "center", 
        zIndex: 2000,
        backdropFilter: "blur(4px)"
      }}
      onClick={handleBackdropClick}
    >
      <div style={{
        background: "white",
        padding: "2em",
        borderRadius: "12px",
        width: "600px",
        maxWidth: "90vw",
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "1.5em"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, color: "#333", fontSize: "20px" }}>
            📥 Download Geospatial Data
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              color: "#999",
              padding: "0",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            ✕
          </button>
        </div>

        {/* Quick Export Options */}
        <div style={{
          background: "#f8f9fa",
          padding: "1.5em",
          borderRadius: "8px",
          border: "1px solid #e9ecef"
        }}>
          <h4 style={{ margin: "0 0 1em 0", color: "#495057", fontSize: "16px" }}>
            🚀 Quick Export Options
          </h4>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1em" }}>
            {/* Current View Export */}
            <button
              onClick={downloadCurrentView}
              style={{
                padding: "12px 16px",
                background: "linear-gradient(135deg, #007bff, #0056b3)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left"
              }}
            >
              <div style={{ fontWeight: "600" }}>
                📍 Export Current View
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>
                {selectedMunicipality 
                  ? `Download data for ${selectedMunicipality}, ${selectedCounty}`
                  : selectedCounty 
                    ? `Download data for ${selectedCounty} County`
                    : "Download all available data"
                }
              </div>
            </button>

            {/* Full Database Export */}
            <button
              onClick={downloadFullDatabase}
              style={{
                padding: "12px 16px",
                background: "linear-gradient(135deg, #28a745, #20c997)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left"
              }}
            >
              <div style={{ fontWeight: "600" }}>
                🗄️ Export Complete Database
              </div>
              <div style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>
                Download entire geospatial database as ZIP archive
              </div>
            </button>
          </div>
        </div>

        {/* Previously Uploaded Files */}
        <div>
          <h4 style={{ margin: "0 0 1em 0", color: "#495057", fontSize: "16px" }}>
            📁 Previously Uploaded Files
          </h4>
          
          <div style={{ 
            maxHeight: "300px", 
            overflowY: "auto",
            border: "1px solid #e9ecef",
            borderRadius: "6px",
            background: "white"
          }}>
            {uploadedFiles && typeof uploadedFiles === "object" && Object.keys(uploadedFiles).length > 0 ? (
              Object.entries(uploadedFiles).map(([type, files]) => (
                <div key={type} style={{ borderBottom: "1px solid #f1f3f4" }}>
                  <div style={{
                    padding: "12px 16px",
                    background: "#f8f9fa",
                    fontWeight: "600",
                    fontSize: "14px",
                    color: "#495057",
                    borderBottom: "1px solid #e9ecef"
                  }}>
                    {type === 'landvpa' ? '🏘️ Land & Property Data' : 
                     type === 'foodaccesspoints' ? '🍎 Food Access Points' : 
                     type === 'slrparcels' ? '🌊 Sea Level Rise Parcels' :
                     `📄 ${type}`}
                  </div>
                  {Array.isArray(files) && files.map(file => (
                    <div 
                      key={file.filename} 
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid #f1f3f4",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "14px"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: "500", color: "#333" }}>
                          {file.filename}
                        </div>
                        <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "2px" }}>
                          Uploaded: {new Date(file.upload_date).toLocaleString()}
                        </div>
                      </div>
                      <a 
                        href={`${API_URL}/api/files/download/${file.filename}`} 
                        download
                        style={{
                          padding: "6px 12px",
                          background: "#007bff",
                          color: "white",
                          textDecoration: "none",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "500",
                          transition: "background 0.2s ease"
                        }}
                      >
                        ⬇️ Download
                      </a>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div style={{
                padding: "2em",
                textAlign: "center",
                color: "#6c757d",
                fontSize: "14px"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "1em" }}>📭</div>
                <div>No files have been uploaded yet.</div>
                <div style={{ fontSize: "12px", marginTop: "0.5em" }}>
                  Upload some GeoJSON files to see them here.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{ 
            padding: "12px",
            background: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background 0.2s ease"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DownloadModal;
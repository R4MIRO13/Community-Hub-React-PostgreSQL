import React, {useState, useEffect} from 'react';

const UploadModal = ({ 
  API_URL,
  isOpen, 
  onClose, 
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
  countyData
}) => {
  const [municipalitiesLocal, setMunicipalitiesLocal] = useState([]);

  useEffect(() => {
    if (!isOpen) {
      setMunicipalitiesLocal([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
        width: "500px", 
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
            📤 Upload Geospatial Data
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

        {/* Form */}
        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5em" }}>
          {/* Data Type Selection */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5em" }}>
              <span style={{ fontSize: "14px", fontWeight: "600", color: "#495057" }}>
                Data Type:
              </span>
              <select
                value={uploadType}
                onChange={(e) => {
                  setUploadType(e.target.value);
                  setUploadCounty("");
                  setUploadMunicipality("");
                  setUploadFile(null);
                  setMunicipalitiesLocal([]);
                }}
                style={{ 
                  width: "100%", 
                  marginTop: "0.5em",
                  padding: "12px",
                  border: "2px solid #e9ecef",
                  borderRadius: "6px",
                  fontSize: "14px",
                  background: "white"
                }}
                required
              >
                <option value="">Choose Data Type</option>
                <option value="landvpa">🏘️ Land & Property Data (LandVPA)</option>
                <option value="foodaccesspoints">🍎 Food Access Points</option>
                <option value="slr">🌊 Sea Level Rise Data</option>
              </select>
            </label>
          </div>

          {/* Conditional Fields */}
          {uploadType && (
            <>
              {uploadType === "landvpa" && (
                <div style={{
                  background: "#f8f9fa",
                  padding: "1.5em",
                  borderRadius: "8px",
                  border: "1px solid #e9ecef"
                }}>
                  <h4 style={{ margin: "0 0 1em 0", color: "#495057", fontSize: "16px" }}>
                    📍 Geographic Assignment
                  </h4>
                  
                  {/* County Selection */}
                  <label style={{ display: "block", marginBottom: "1em" }}>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#6c757d" }}>
                      County:
                    </span>
                    <select
                      value={uploadCounty}
                      onChange={(e) => {
                        const val = e.target.value;
                        setUploadCounty(val);
                        setUploadMunicipality("");
                        fetch(`${API_URL}/api/files`)
                          .then((res) => res.json())
                          .then((files) => {
                            const uploadedMunicipalities = (files.landvpa || [])
                              .map(f => {
                                const match = f.filename.match(/^(.+?)_VPA\.geojson$/i);
                                if (!match) return null;

                                return match[1]
                                  .replace(/_/g, " ")
                                  .toLowerCase()
                                  .split(" ")
                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(" ")
                                  .trim();
                              })
                              .filter(Boolean);
                            fetch(`${API_URL}/api/municipalities?county=${val}`)
                              .then((res) => res.json())
                              .then((data) => {
                                const filtered = data.filter(m => !uploadedMunicipalities.includes(m));
                                setMunicipalitiesLocal(filtered);
                              })
                              .catch(() => {
                                setMunicipalitiesLocal([]);
                              });
                          })
                          .catch(() => {
                            setMunicipalitiesLocal([]);
                          });
                      }}
                      style={{ 
                        width: "100%", 
                        marginTop: "0.5em",
                        padding: "10px",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        fontSize: "14px"
                      }}
                      required
                    >
                      <option value="">Choose County</option>
                      {countyData &&
                        countyData.features.map((f) => (
                          <option key={f.properties.name} value={f.properties.name}>
                            {f.properties.name}
                          </option>
                        ))}
                    </select>
                  </label>

                  {/* Municipality Selection */}
                  <label style={{ display: "block" }}>
                    <span style={{ fontSize: "14px", fontWeight: "500", color: "#6c757d" }}>
                      Municipality:
                    </span>
                    <select
                      value={uploadMunicipality}
                      onChange={(e) => setUploadMunicipality(e.target.value)}
                      disabled={!uploadCounty}
                      style={{ 
                        width: "100%", 
                        marginTop: "0.5em",
                        padding: "10px",
                        border: "1px solid #ced4da",
                        borderRadius: "4px",
                        fontSize: "14px",
                        opacity: !uploadCounty ? 0.6 : 1
                      }}
                      required
                    >
                      <option value="">Choose Municipality</option>
                      {municipalitiesLocal.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}

              {/* File Upload */}
              <div>
                <label style={{ display: "block" }}>
                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#495057" }}>
                    GeoJSON File:
                  </span>
                  <div style={{
                    marginTop: "0.5em",
                    border: "2px dashed #ced4da",
                    borderRadius: "6px",
                    padding: "1.5em",
                    textAlign: "center",
                    background: uploadFile ? "#f8f9fa" : "white",
                    transition: "all 0.2s ease"
                  }}>
                    <input
                      type="file"
                      accept=".geojson,.json"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      style={{ 
                        width: "100%",
                        padding: "8px",
                        fontSize: "14px"
                      }}
                      required
                    />
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#6c757d", 
                      marginTop: "0.5em" 
                    }}>
                      {uploadFile ? 
                        `✅ Selected: ${uploadFile.name}` : 
                        "📁 Select a .geojson or .json file"
                      }
                    </div>
                  </div>
                </label>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            marginTop: "1em",
            gap: "1em"
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{ 
                flex: "1",
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                uploading ||
                !uploadType ||
                (uploadType === "landvpa" && (!uploadCounty || !uploadMunicipality || !uploadFile)) ||
                ((uploadType === "foodaccesspoints" || uploadType === "slr") && !uploadFile)
              }
              style={{
                flex: "2",
                padding: "12px",
                background: uploading
                  ? "#28a745"
                  : uploadType && uploadFile && (
                      uploadType !== "landvpa"
                        ? true
                        : (uploadCounty && uploadMunicipality)
                    )
                  ? "linear-gradient(135deg, #28a745, #20c997)"
                  : "#e9ecef",
                color: uploading
                  ? "white"
                  : uploadType && uploadFile && (
                      uploadType !== "landvpa"
                        ? true
                        : (uploadCounty && uploadMunicipality)
                    )
                  ? "white"
                  : "#6c757d",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor:
                  uploading || !uploadType || !uploadFile
                    ? "not-allowed"
                    : "pointer",
                transition: "all 0.2s ease",
                opacity: uploading ? 0.8 : 1,
              }}
            >
              {uploading ? "⏳ Uploading..." : "📤 Upload Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
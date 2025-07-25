import React from 'react';

const FilterControls = ({ 
  countyData, 
  municipalities, 
  selectedCounty, 
  selectedMunicipality, 
  onCountyChange, 
  onMunicipalityChange,
  onUploadClick,
  onDownloadClick,
  isCollapsed,
  onToggleCollapse
}) => {
  return (
    <div style={{
      position: "absolute",
      top: "1em",
      right: "1em",
      zIndex: 1000,
      background: "white",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      minWidth: isCollapsed ? "90px" : "280px",
      transition: "all 0.3s ease",
      transformOrigin: "top right"
    }}>
      {/* Header with toggle button */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1em",
        borderBottom: isCollapsed ? "none" : "1px solid #eee"
      }}>
        <h3 style={{ margin: 0, fontSize: "16px", color: "#333" }}>
          {isCollapsed ? "⚙️" : "Geospatial Data Hub"}
        </h3>
        <button
          onClick={onToggleCollapse}
          style={{
            background: "none",
            border: "none",
            fontSize: "18px",
            cursor: "pointer",
            padding: "4px"
          }}
        >
          {isCollapsed ? "📋" : "➖"}
        </button>
      </div>

      {/* Controls - hidden when collapsed */}
      {!isCollapsed && (
        <div style={{
          padding: "1em",
          display: "flex",
          flexDirection: "column",
          gap: "1em"
        }}>
          {/* Geographic Filters */}
          <div style={{
            padding: "1em",
            background: "#f8f9fa",
            borderRadius: "6px",
            border: "1px solid #e9ecef"
          }}>
            <h4 style={{ margin: "0 0 1em 0", fontSize: "14px", color: "#495057" }}>
              📍 Geographic Filters
            </h4>
            
            <label style={{ display: "block", marginBottom: "1em" }}>
              <span style={{ fontSize: "12px", fontWeight: "500", color: "#6c757d" }}>
                Filter by County:
              </span>
              <select
                value={selectedCounty}
                onChange={(e) => onCountyChange(e.target.value)}
                style={{ 
                  width: "100%", 
                  marginTop: "0.5em",
                  padding: "8px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              >
                <option value="">All Counties</option>
                {countyData &&
                  countyData.features.map((f) => (
                    <option key={f.properties.name} value={f.properties.name}>
                      {f.properties.name}
                    </option>
                  ))}
              </select>
            </label>

            <label style={{ display: "block" }}>
              <span style={{ fontSize: "12px", fontWeight: "500", color: "#6c757d" }}>
                Filter by Municipality:
              </span>
              <select
                value={selectedMunicipality}
                onChange={(e) => onMunicipalityChange(e.target.value)}
                disabled={!selectedCounty}
                style={{ 
                  width: "100%", 
                  marginTop: "0.5em",
                  padding: "8px",
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  fontSize: "14px",
                  opacity: !selectedCounty ? 0.6 : 1
                }}
              >
                {!selectedCounty ? (
                  <option value="">Select County First</option>
                ) : (
                  <>
                    <option value="">All Municipalities</option>
                    {municipalities.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </>
                )}
              </select>
            </label>
          </div>

          {/* Data Management Actions */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5em"
          }}>
            <button 
              onClick={onUploadClick}
              style={{
                padding: "12px",
                background: "linear-gradient(135deg, #28a745, #20c997)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(40, 167, 69, 0.2)"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(40, 167, 69, 0.3)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(40, 167, 69, 0.2)";
              }}
            >
              📤 Upload GeoJSON Data
            </button>

            <button 
              onClick={onDownloadClick}
              style={{
                padding: "12px",
                background: "linear-gradient(135deg, #007bff, #6f42c1)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 4px rgba(0, 123, 255, 0.2)"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0, 123, 255, 0.3)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 2px 4px rgba(0, 123, 255, 0.2)";
              }}
            >
              📥 Download & Export Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterControls;
import React from "react";
import FilterControls from "./FilterControls.jsx";
import LayerToggleControls from "./LayerToggleControls.jsx";

const SidebarControls = (props) => {
  // Destructure all props for both controls
  const {
    // FilterControls props
    countyData,
    municipalities,
    selectedCounty,
    selectedMunicipality,
    onCountyChange,
    onMunicipalityChange,
    onUploadClick,
    onDownloadClick,
    isCollapsed,
    onToggleCollapse,
    // LayerToggleControls props
    showLandVPA,
    setShowLandVPA,
    showFoodAccess,
    setShowFoodAccess,
    uploadedFiles,
    API_URL,
  } = props;

  return (
    <div style={{
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: '1em',
      height: '100vh',
      pointerEvents: 'none',
      minWidth: 340,
    }}>
      <div style={{ pointerEvents: 'auto' }}>
        <FilterControls
          countyData={countyData}
          municipalities={municipalities}
          selectedCounty={selectedCounty}
          selectedMunicipality={selectedMunicipality}
          onCountyChange={onCountyChange}
          onMunicipalityChange={onMunicipalityChange}
          onUploadClick={onUploadClick}
          onDownloadClick={onDownloadClick}
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />
      </div>
      <div style={{ pointerEvents: 'auto' }}>
        <LayerToggleControls
          showLandVPA={showLandVPA}
          setShowLandVPA={setShowLandVPA}
          showFoodAccess={showFoodAccess}
          setShowFoodAccess={setShowFoodAccess}
          uploadedFiles={uploadedFiles}
          API_URL={API_URL}
          selectedCounty={selectedCounty}
        />
      </div>
    </div>
  );
};

export default SidebarControls;
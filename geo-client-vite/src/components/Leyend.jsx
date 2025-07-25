import React, { useEffect, useState } from "react";

export default function Legend({
  API_URL,
  municipalities,
  selectedMunicipality,
  getColorByDecile,
  subdecileMode,
  selectedDecileForSub,
  handleSubdecileClick,
  handleBack
}) {
  const [vpaDeciles, setVpaDeciles] = useState([]);
  const [vpaSubdeciles, setVpaSubdeciles] = useState([]);

  const selectedMunicipalityData = municipalities.find((m) => {
    if (typeof m === "string") return m.trim() === selectedMunicipality.trim();
    return m.name?.trim() === selectedMunicipality.trim();
  });

  useEffect(() => {
    if (!selectedMunicipalityData?.id) return;

    fetch(`${API_URL}/api/municipalities/${selectedMunicipalityData.id}/vpa-deciles`)
      .then((res) => res.json())
      .then((data) => setVpaDeciles(data))
      .catch((err) => console.error("Error fetching decile breakpoints:", err));
  }, [selectedMunicipalityData]);

  useEffect(() => {
    if (!subdecileMode || !selectedMunicipalityData?.id || !selectedDecileForSub) return;

    fetch(`${API_URL}/api/municipalities/${selectedMunicipalityData.id}/vpa-deciles/${selectedDecileForSub}/subdeciles`)
      .then((res) => res.json())
      .then((data) => setVpaSubdeciles(data))
      .catch((err) => console.error("Error fetching subdecile breakpoints:", err));
  }, [subdecileMode, selectedDecileForSub, selectedMunicipalityData]);

  if (!selectedMunicipalityData || !vpaDeciles.length) return null;

  const vpaMaxDeciles = vpaDeciles.map((d) => d.max_vpa);
  const hasValidData = vpaMaxDeciles.some((val) => val !== null && val !== undefined);
  if (!hasValidData) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 40,
        left: 348,
        background: "rgba(255, 255, 255, 0.9)",
        padding: "12px 16px",
        borderRadius: 6,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        fontSize: 14,
        zIndex: 1500,
        maxWidth: 260,
        userSelect: "none",
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: "bold", fontSize: 16, lineHeight: 1.2, maxWidth: "200px" }}>
        <div>Estimated Land Prices by VPA (Value Per Acre) for {selectedMunicipalityData.name} ($)</div>
      </div>

      <div style={{ marginTop: 8 }}>
        {subdecileMode ? (
          <>
            <button 
              onClick={handleBack}
              style={{ marginBottom: 10, fontSize: 14, cursor: "pointer" }}
            >
              ← Back
            </button>
            {(() => {
              const filteredSubdeciles = vpaSubdeciles
                .filter((sub) => sub.max_vpa !== null && sub.max_vpa !== undefined)
                .sort((a, b) => a.subdecile - b.subdecile);

              const isIncomplete = filteredSubdeciles.length < 10;

              const lowerDecileLimit =
                selectedDecileForSub === 1 ? 0 : vpaMaxDeciles[selectedDecileForSub - 2];

              return [
                ...filteredSubdeciles
                  .slice()
                  .reverse()
                  .map((sub, i, arr) => {
                    const upperBound = sub.max_vpa;
                    const lowerBound =
                      i === arr.length - 1 ? lowerDecileLimit : arr[i + 1].max_vpa;

                    const label = isIncomplete
                      ? `≈ ${upperBound}`
                      : `> ${lowerBound} - ${upperBound}`;

                    return (
                      <LegendRow
                        key={`subdecile-${sub.subdecile}-${sub.max_vpa}`}
                        color={getColorByDecile(sub.subdecile)}
                        label={label}
                      />
                    );
                  }),
                <LegendRow
                  key={"out-of-range"}
                  color={getColorByDecile(0)}
                  label=" OUT OF RANGE"
                />,
              ];
            })()}
          </>
        ) : (
          <>
            {[...Array(10)].map((_, i) => {
              const decile = 10 - i;
              const showButton = decile >= 1 && decile <= 10;

              return (
                <LegendRow
                  key={decile}
                  color={getColorByDecile(decile)}
                  label={
                    decile === 1
                      ? `> 0 - ${vpaMaxDeciles[0]}`
                      : `> ${vpaMaxDeciles[decile - 2]} - ${vpaMaxDeciles[decile - 1]}`
                  }
                  showSubdecileButton={showButton}
                  onClickSubdecile={() => handleSubdecileClick(decile)}
                />
              );
            })}
            <LegendRow key={0} color={getColorByDecile(0)} label="= 0" />
          </>
        )}
      </div>
    </div>
  );
}

function LegendRow({ color, label, showSubdecileButton, onClickSubdecile }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
      <div
        style={{
          width: 20,
          height: 20,
          backgroundColor: color,
          border: "1px solid #ccc",
          marginRight: 10,
          borderRadius: 3,
        }}
      />
      <span>{label}</span>
      {showSubdecileButton && (
        <button
          onClick={onClickSubdecile}
          style={{
            marginLeft: 10,
            padding: "2px 6px",
            fontSize: 12,
            cursor: "pointer",
          }}
        >
          ➤
        </button>
      )}
    </div>
  );
}
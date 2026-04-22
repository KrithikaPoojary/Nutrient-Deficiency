import React from "react";

function Result({ result, recommendations }) {

  // ✅ Handle empty state
  if (!result || Object.keys(result).length === 0) {
    return <p style={{ textAlign: "center" }}>No results yet</p>;
  }

  const getStatusStyle = (status) => {
    switch (status) {
      case "Severe":
        return { color: "#e74c3c", background: "#fdecea" };
      case "Moderate":
        return { color: "#f39c12", background: "#fef5e7" };
      case "Mild":
        return { color: "#3498db", background: "#eaf2f8" };
      default:
        return { color: "#27ae60", background: "#eafaf1" };
    }
  };

  const getIcon = (status) => {
    if (status === "Severe") return "🔴";
    if (status === "Moderate") return "🟠";
    if (status === "Mild") return "🔵";
    return "🟢";
  };

  return (
    <div className="card">
      <h2>📊 Results</h2>

      <div className="result-grid">

        {Object.entries(result).map(([key, val]) => {
          const rec = recommendations?.[key];

          return (
            <div className="result-card" key={key}>

              {/* Nutrient Name */}
              <h3>{key}</h3>

              {/* Status */}
              <div
                className="status-badge"
                style={getStatusStyle(val)}
              >
                {getIcon(val)} {val}
              </div>

              {/* 🔥 Recommendations */}
              {val !== "Normal" && rec && (
                <div className="recommend-box">

                  {/* Foods */}
                  {rec.foods && rec.foods.length > 0 && (
                    <>
                      <p><strong>🍎 Suggested Foods:</strong></p>
                      <ul>
                        {rec.foods.map((food, i) => (
                          <li key={i}>→ {food}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* 🔥 Day-wise Plan */}
                  {rec.plan && Object.keys(rec.plan).length > 0 && (
                    <>
                      <p style={{ marginTop: "10px" }}>
                        <strong>📅 3-Day Plan:</strong>
                      </p>

                      {Object.entries(rec.plan).map(([day, foods]) => (
                        <div key={day} style={{ marginBottom: "8px" }}>
                          <strong>{day}:</strong>
                          <ul>
                            {foods.map((f, idx) => (
                              <li key={idx}>→ {f}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </>
                  )}

                </div>
              )}

            </div>
          );
        })}

      </div>
    </div>
  );
}

export default Result;
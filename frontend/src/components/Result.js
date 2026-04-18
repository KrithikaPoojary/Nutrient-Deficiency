import React from "react";

function Result({ result }) {
  if (!result) return null;

  const getIcon = (status) => {
    if (status === "Severe") return "🔴";
    if (status === "Moderate") return "🟠";
    return "🟢";
  };

  return (
    <div className="card">
      <h2>Results</h2>

      <h3>Deficiency</h3>

      {Object.entries(result.results).map(([key, val]) => (
        <div key={key} style={{ marginBottom: "15px" }}>
          
          {/* Deficiency with icon */}
          <p className={val.toLowerCase()}>
            <strong>
              {getIcon(val)} {key}: {val}
            </strong>
          </p>

          {/* Recommendations */}
          {val !== "Normal" && result.recommendations[key] && (
            <div style={{ marginLeft: "20px" }}>
              <p><strong>Recommendations:</strong></p>
              <ul>
                {result.recommendations[key].map((food, i) => (
                  <li key={i}>{food}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
      ))}

    </div>
  );
}

export default Result;
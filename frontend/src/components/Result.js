import React from "react";

function Result({ result }) {
  if (!result) return null;

  const getStatusStyle = (status) => {
    switch (status) {
      case "Severe":
        return { color: "#e74c3c", background: "#fdecea" };
      case "Moderate":
        return { color: "#f39c12", background: "#fef5e7" };
      default:
        return { color: "#27ae60", background: "#eafaf1" };
    }
  };

  const getIcon = (status) => {
    if (status === "Severe") return "🔴";
    if (status === "Moderate") return "🟠";
    return "🟢";
  };

  return (
    <div className="card">
      <h2>📊 Results</h2>

      <div className="result-grid">

        {Object.entries(result.results).map(([key, val]) => (
          <div className="result-card" key={key}>

            {/* 🔥 Nutrient Name */}
            <h3>{key}</h3>

            {/* 🔥 Status Badge */}
            <div
              className="status-badge"
              style={getStatusStyle(val)}
            >
              {getIcon(val)} {val}
            </div>

            {/* 🔥 Recommendations */}
            {val !== "Normal" && result.recommendations?.[key] && (
              <div className="recommend-box">
                <p><strong>🍎 Suggested Foods:</strong></p>
                <ul>
                  {result.recommendations[key].map((food, i) => (
                    <li key={i}>→ {food}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
}

export default Result;
import React from "react";

function Result({ result, recommendations }) {

  // 🔥 Prevent crash
  if (!result) {
    return <p style={{ textAlign: "center" }}>No results yet</p>;
  }

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

        {/* 🔥 FIXED HERE */}
        {Object.entries(result).map(([key, val]) => (
          <div className="result-card" key={key}>

            <h3>{key}</h3>

            <div
              className="status-badge"
              style={getStatusStyle(val)}
            >
              {getIcon(val)} {val}
            </div>

            {/* 🔥 FIXED HERE */}
            {val !== "Normal" && recommendations?.[key] && (
              <div className="recommend-box">
                <p><strong>🍎 Suggested Foods:</strong></p>
                <ul>
                  {recommendations[key].map((food, i) => (
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
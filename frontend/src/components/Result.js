import React from "react";
import NutrientChart from "./NutrientChart"; // 🔥 ADD THIS

function Result({ result, recommendations, nutrients, rda }) {

  if (!result || Object.keys(result).length === 0) {
    return <p style={{ textAlign: "center" }}>No results yet</p>;
  }

  // 🔥 Status Style
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

  // 🔥 Icon
  const getIcon = (status) => {
    if (status === "Severe") return "🔴";
    if (status === "Moderate") return "🟠";
    if (status === "Mild") return "🔵";
    return "🟢";
  };

  // 🔥 Percentage Calculation
  const getPercent = (value, required) => {
    if (!value || !required) return 0;
    return Math.min((value / required) * 100, 100);
  };

  const mealOrder = ["Breakfast", "Lunch", "Dinner"];

  return (
    <div className="card">
      <h2>📊 Results</h2>

      {/* 🔥 NUTRIENT CHART */}
      {nutrients && rda && (
        <div style={{ marginBottom: "20px" }}>
          <NutrientChart nutrients={nutrients} rda={rda} />
        </div>
      )}

      <div className="result-grid">
        {Object.entries(result).map(([key, val]) => {

          const rec = recommendations?.[key];
          const value = nutrients?.[key];
          const required = rda?.[key];
          const percent = getPercent(value, required);

          return (
            <div className="result-card" key={key}>

              <h3>{key}</h3>

              {/* 🔥 Nutrient Values */}
              {value !== undefined && required !== undefined && (
                <div className="nutrient-info">

                  <p>
                    <strong>{value}</strong> / {required}
                  </p>

                  <p>
                    {percent.toFixed(1)}% of daily need
                  </p>

                  {/* 🔥 Progress Bar */}
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                </div>
              )}

              {/* 🔥 Status Badge */}
              <div
                className="status-badge"
                style={getStatusStyle(val)}
              >
                {getIcon(val)} {val}
              </div>

              {/* 🔥 Recommendations */}
              {val !== "Normal" && rec && (
                <div className="recommend-box">

                  {/* 🍎 Suggested Foods */}
                  {Array.isArray(rec.foods) && rec.foods.length > 0 && (
                    <>
                      <p className="section-title">🍎 Suggested Foods</p>

                      <ul className="clean-list">
                        {rec.foods.map((food, i) => (
                          <li key={i}>{food}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {/* 📅 3-Day Plan */}
                  {rec.plan && Object.keys(rec.plan).length > 0 && (
                    <>
                      <p className="section-title">📅 3-Day Plan</p>

                      {Object.entries(rec.plan).map(([day, meals]) => (
                        <div key={day} className="day-block">

                          <p className="day-title">{day}</p>

                          {/* 🔥 Ordered Meals */}
                          {mealOrder.map((meal) => {
                            const foods = meals?.[meal];

                            return (
                              foods && (
                                <div key={meal} className="meal-block">
                                  <strong>{meal}</strong>

                                  <ul className="clean-list">
                                    {foods.map((f, idx) => (
                                      <li key={idx}>{f}</li>
                                    ))}
                                  </ul>
                                </div>
                              )
                            );
                          })}

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
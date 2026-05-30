import React from "react";
import NutrientChart from "./NutrientChart";
import "./Result.css";

function Result({

  result,
  recommendations,
  nutrients,
  rda

}) {

  if (!result || Object.keys(result).length === 0) {

    return (

      <div className="result-empty">
        No Results Yet
      </div>

    );
  }

  // =========================================
  // STATUS STYLE
  // =========================================

  const getStatusClass = (status) => {

    switch (status) {

      case "Severe":
        return "status-severe";

      case "Moderate":
        return "status-moderate";

      case "Mild":
        return "status-mild";

      default:
        return "status-normal";
    }
  };

  // =========================================
  // STATUS ICON
  // =========================================

  const getIcon = (status) => {

    if (status === "Severe") return "🔴";

    if (status === "Moderate") return "🟠";

    if (status === "Mild") return "🔵";

    return "🟢";
  };

  // =========================================
  // PERCENT
  // =========================================

  const getPercent = (

    value,
    required

  ) => {

    if (!value || !required) return 0;

    return Math.min(
      (value / required) * 100,
      100
    );
  };

  // =========================================
  // ORDER
  // =========================================

  const mealOrder = [

    "Breakfast",
    "Lunch",
    "Dinner"

  ];

  // =========================================
  // UI
  // =========================================

  return (

    <div className="result-page">

      <div className="result-container">

        <div className="result-header">

          <h1>
            📊 AI Nutritional Analysis
          </h1>

          <p>
            Personalized Nutrient Deficiency Report
          </p>

        </div>

        {/* ========================================= */}
        {/* CHART */}
        {/* ========================================= */}

        {nutrients && rda && (

          <div className="chart-wrapper">

            <NutrientChart
              nutrients={nutrients}
              rda={rda}
            />

          </div>

        )}

        {/* ========================================= */}
        {/* RESULT GRID */}
        {/* ========================================= */}

        <div className="result-grid">

          {Object.entries(result).map(

            ([key, val]) => {

              const rec =
                recommendations?.[key];

              const value =
                nutrients?.[key];

              const required =
                rda?.[key];

              const percent =
                getPercent(
                  value,
                  required
                );

              return (

                <div
                  className="result-card"
                  key={key}
                >

                  {/* ========================================= */}
                  {/* TITLE */}
                  {/* ========================================= */}

                  <div className="card-top">

                    <h2>{key}</h2>

                    <div
                      className={`status-badge ${getStatusClass(val)}`}
                    >
                      {getIcon(val)} {val}
                    </div>

                  </div>

                  {/* ========================================= */}
                  {/* NUTRIENT INFO */}
                  {/* ========================================= */}

                  {value !== undefined &&
                    required !== undefined && (

                    <div className="nutrient-section">

                      <div className="nutrient-values">

                        <span>
                          Current:
                          <strong>
                            {" "}
                            {value}
                          </strong>
                        </span>

                        <span>
                          Required:
                          <strong>
                            {" "}
                            {required}
                          </strong>
                        </span>

                      </div>

                      <p className="percent-text">
                        {percent.toFixed(1)}%
                        of Daily Requirement
                      </p>

                      <div className="progress-bar">

                        <div
                          className="progress-fill"
                          style={{
                            width:
                              `${percent}%`
                          }}
                        ></div>

                      </div>

                    </div>

                  )}

                  {/* ========================================= */}
                  {/* RECOMMENDATIONS */}
                  {/* ========================================= */}

                  {val !== "Normal" &&
                    rec && (

                    <div className="recommend-box">

                      {/* ========================================= */}
                      {/* FOODS */}
                      {/* ========================================= */}

                      {Array.isArray(rec.foods) &&
                        rec.foods.length > 0 && (

                        <>

                          <h3 className="section-title">
                            🍎 Recommended Foods
                          </h3>

                          <div className="food-list">

                            {rec.foods.map(
                              (
                                food,
                                i
                              ) => (

                                <span
                                  className="food-chip"
                                  key={i}
                                >
                                  {food}
                                </span>

                              )
                            )}

                          </div>

                        </>

                      )}

                      {/* ========================================= */}
                      {/* PLAN */}
                      {/* ========================================= */}

                      {rec.plan &&
                        Object.keys(rec.plan).length > 0 && (

                        <>

                          <h3 className="section-title">
                            📅 3-Day Personalized Plan
                          </h3>

                          {Object.entries(
                            rec.plan
                          ).map(

                            ([day, meals]) => (

                              <div
                                key={day}
                                className="day-card"
                              >

                                <div className="day-title">
                                  {day}
                                </div>

                                {mealOrder.map(

                                  (meal) => {

                                    const foods =
                                      meals?.[meal];

                                    return (

                                      foods && (

                                        <div
                                          key={meal}
                                          className="meal-card"
                                        >

                                          <h4>
                                            {meal}
                                          </h4>

                                          <ul>

                                            {foods.map(

                                              (
                                                food,
                                                idx
                                              ) => (

                                                <li
                                                  key={idx}
                                                >
                                                  {food}
                                                </li>

                                              )
                                            )}

                                          </ul>

                                        </div>

                                      )

                                    );
                                  }

                                )}

                              </div>

                            )

                          )}

                        </>

                      )}

                    </div>

                  )}

                </div>

              );
            }

          )}

        </div>

      </div>

    </div>

  );
}

export default Result;
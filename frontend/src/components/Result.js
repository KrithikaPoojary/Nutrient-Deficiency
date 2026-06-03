import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import downloadReport from "./DownloadReport";
import "./Result.css";

function Result({

  result,
  recommendations,
  nutrients,
  rda,
  fullResult

}) {

  const navigate = useNavigate();

  // =========================================
  // AUTO SCROLL
  // =========================================

  useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

  // =========================================
  // EMPTY
  // =========================================

  if (!result || Object.keys(result).length === 0) {

    return (

      <div className="result-empty">

        No Results Yet

      </div>

    );

  }

  // =========================================
  // PERCENT
  // =========================================

  const getPercent = (

    value,
    required

  ) => {

    if (!value || !required)
      return 0;

    return Math.min(

      (value / required) * 100,

      100

    );

  };

  // =========================================
  // STATUS CLASS
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
  // EXPLAINABLE AI TEXT
  // =========================================

  const getExplanation = (

    nutrient,
    status

  ) => {

    if (status === "Normal") {

      return `No major deficiency detected in ${nutrient}. Current nutritional indicators appear stable.`;

    }

    if (status === "Moderate") {

      return `${nutrient} deficiency risk detected based on dietary intake, nutritional imbalance, and multimodal health analysis.`;

    }

    return `${nutrient} severe deficiency detected. AI analysis indicates high nutritional risk requiring dietary improvement and monitoring.`;

  };

  // =========================================
  // UI
  // =========================================

  return (

    <div className="result-page">

      <div className="report-container">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="report-header">

          <h1>

            Nutritional Deficiency Analysis Report

          </h1>

          <p>

            Personalized Nutrient Assessment

          </p>

        </div>

        {/* ========================================= */}
        {/* DEFICIENCY RESULTS */}
        {/* ========================================= */}

        <div className="report-section">

          <h2>

            Deficiency Results

          </h2>

          <div className="deficiency-grid">

            {

              Object.entries(result).map(

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

                      key={key}

                      className="deficiency-card"

                    >

                      {/* ========================================= */}
                      {/* TOP */}
                      {/* ========================================= */}

                      <div className="deficiency-top">

                        <h3>

                          {key}

                        </h3>

                        <span

                          className={`status-badge ${getStatusClass(val)}`}

                        >

                          {val}

                        </span>

                      </div>

                      {/* ========================================= */}
                      {/* EXPLAINABLE AI */}
                      {/* ========================================= */}

                      <div className="ai-analysis-box">

                        <h4>

                          Explainable AI Analysis

                        </h4>

                        <p>

                          {getExplanation(
                            key,
                            val
                          )}

                        </p>

                      </div>

                      {/* ========================================= */}
                      {/* NUTRIENT DATA */}
                      {/* ========================================= */}

                      {

                        value !== undefined &&
                        required !== undefined && (

                          <div className="nutrient-data">

                            <p>

                              Current Intake:
                              {" "}

                              <strong>

                                {value}

                              </strong>

                            </p>

                            <p>

                              Recommended Intake:
                              {" "}

                              <strong>

                                {required}

                              </strong>

                            </p>

                            <p>

                              {percent.toFixed(1)}%
                              {" "}
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

                        )

                      }

                      {/* ========================================= */}
                      {/* FOOD RECOMMENDATIONS */}
                      {/* ========================================= */}

                      {

                        rec &&
                        Array.isArray(rec.foods) &&
                        rec.foods.length > 0 && (

                          <div className="food-section">

                            <h4>

                              Personalized Food Recommendations

                            </h4>

                            <div className="food-list">

                              {

                                rec.foods.map(

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

                                )

                              }

                            </div>

                          </div>

                        )

                      }

                    </div>

                  );

                }

              )

            }

          </div>

        </div>

        {/* ========================================= */}
        {/* BUTTONS */}
        {/* ========================================= */}

        <div className="report-buttons">

          <button

            className="view-report-btn"

            onClick={() =>
              navigate("/full-report")
            }

          >

            View Full Report

          </button>

          <button

            className="view-report-btn"

            onClick={() =>
              navigate("/meal-plan")
            }

          >

            View 3-Day Plan

          </button>

          <button

            className="download-report-btn"

            onClick={() =>
              downloadReport(
                result,
                recommendations,
                nutrients
              )
            }

          >

            Download PDF Report

          </button>

        </div>

      </div>

    </div>

  );

}

export default Result;


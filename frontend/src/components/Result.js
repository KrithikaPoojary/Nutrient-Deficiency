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
  // EMPTY RESULT
  // =========================================

  if (!result || Object.keys(result).length === 0) {

    return (

      <div className="result-empty">

        No Results Yet

      </div>

    );

  }

  // =========================================
  // RISK SCORE
  // =========================================

  const riskScore = Math.min(

    Number(fullResult?.risk_score || 0),

    100

  );

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
        {/* RISK SCORE */}
        {/* ========================================= */}

        <div className="report-section">

          <h2>

            Risk Assessment

          </h2>

          <div className="summary-grid">

            <div className="summary-box">

              <h3>

                Risk Score

              </h3>

              <p>

                {riskScore.toFixed(1)}/100

              </p>

            </div>

            <div className="summary-box">

              <h3>

                Risk Level

              </h3>

              <p>

                {

                  fullResult?.risk_level ||

                  "Low"

                }

              </p>

            </div>

            <div className="summary-box">

              <h3>

                Previous Risk

              </h3>

              <p>

                {

                  fullResult?.previous_risk_score || 0

                }/100

              </p>

            </div>

            <div className="summary-box">

              <h3>

                Health Trend

              </h3>

              <p>

                {

                  fullResult?.trend_message ||

                  "No Trend"

                }

              </p>

            </div>

          </div>

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

                      {

                        value !== undefined &&
                        required !== undefined && (

                          <div className="nutrient-data">

                            <p>

                              Current:
                              {" "}
                              <strong>

                                {value}

                              </strong>

                            </p>

                            <p>

                              Required:
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

                      {

                        val !== "Normal" &&
                        rec &&
                        Array.isArray(rec.foods) &&
                        rec.foods.length > 0 && (

                          <div className="food-section">

                            <h4>

                              Recommended Foods

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
        {/* EXPLAINABLE AI */}
        {/* ========================================= */}

        {

          fullResult?.shap_explanations && (

            <div className="report-section">

              <h2>

                Explainable AI Analysis

              </h2>

              <div className="deficiency-grid">

                {

                  Object.entries(

                    fullResult.shap_explanations

                  ).map(

                    ([nutrient, reasons]) => (

                      <div

                        key={nutrient}

                        className="deficiency-card"

                      >

                        <h3>

                          {nutrient}

                        </h3>

                        <p>

                          AI detected this
                          deficiency based on:

                        </p>

                        <ul>

                          {

                            reasons.map(

                              (item, i) => (

                                <li key={i}>

                                  {

                                    item.feature

                                  }

                                  :
                                  {" "}

                                  {

                                    item.value

                                  }

                                </li>

                              )

                            )

                          }

                        </ul>

                      </div>

                    )

                  )

                }

              </div>

            </div>

          )

        }

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

            onClick={downloadReport}

          >

            Download PDF Report

          </button>

        </div>

      </div>

    </div>

  );

}

export default Result;
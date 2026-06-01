import React, { useEffect } from "react";

import { useNavigate } from "react-router-dom";

import NutrientChart from "./NutrientChart";

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
  // AUTO SCROLL TOP
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

    if (status === "Severe")
      return "🔴";

    if (status === "Moderate")
      return "🟠";

    if (status === "Mild")
      return "🔵";

    return "🟢";
  };

  // =========================================
  // PERCENTAGE
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
  // IMAGE ANALYSIS
  // =========================================

  const imageAnalysis =
    fullResult?.image_analysis || {};

  // =========================================
  // SYMPTOM ANALYSIS
  // =========================================

  const symptomAnalysis =
    fullResult?.symptom_analysis || [];

  // =========================================
  // SHAP
  // =========================================

  const shapExplanations =
    fullResult?.shap_explanations || {};

  // =========================================
  // UI
  // =========================================

  return (

    <div className="result-page">

      <div className="result-container">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="result-header">

          <h1>

            📊 AI Nutritional Analysis

          </h1>

          <p>

            Personalized Nutrient
            Deficiency Report

          </p>

        </div>

        {/* ========================================= */}
        {/* RISK SUMMARY */}
        {/* ========================================= */}

        <div className="risk-summary-card">

          <h2>

            🚨 AI Risk Assessment

          </h2>

          <div className="risk-summary-grid">

            <div className="risk-box">

              <h3>

                Risk Score

              </h3>

              <p>

                {

                  fullResult?.risk_score || 0

                }

                /100

              </p>

            </div>

            <div className="risk-box">

              <h3>

                Risk Level

              </h3>

              <p>

                {

                  fullResult?.risk_level ||

                  "Low Risk"

                }

              </p>

            </div>

          </div>

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
        {/* IMAGE ANALYSIS */}
        {/* ========================================= */}

        <div className="image-analysis-card">

          <h2>

            🧠 Medical Image Analysis

          </h2>

          <div className="image-analysis-grid">

            {/* EYE */}

            <div className="analysis-box">

              <h3>

                👁 Eye Analysis

              </h3>

              <p>

                {

                  imageAnalysis.eye_analysis ||

                  "No Eye Analysis"

                }

              </p>

            </div>

            {/* NAIL */}

            <div className="analysis-box">

              <h3>

                💅 Nail Analysis

              </h3>

              <p>

                {

                  imageAnalysis.nail_analysis ||

                  "No Nail Analysis"

                }

              </p>

            </div>

            {/* TONGUE */}

            <div className="analysis-box">

              <h3>

                👅 Tongue Analysis

              </h3>

              <p>

                {

                  imageAnalysis.tongue_analysis ||

                  "No Tongue Analysis"

                }

              </p>

            </div>

          </div>

        </div>

        {/* ========================================= */}
        {/* SYMPTOM ANALYSIS */}
        {/* ========================================= */}

        {

          symptomAnalysis.length > 0 && (

            <div className="symptom-result-card">

              <h2>

                🩺 Symptom Questionnaire Analysis

              </h2>

              <div className="symptom-grid">

                {

                  symptomAnalysis.map(

                    (
                      item,
                      index
                    ) => (

                      <div
                        key={index}
                        className="symptom-box"
                      >

                        <h3>

                          {

                            item.symptom
                            .replaceAll(
                              "_",
                              " "
                            )

                          }

                        </h3>

                        <p>

                          Possible Deficiencies:

                        </p>

                        <ul>

                          {

                            item
                            .possible_deficiencies
                            .map(

                              (
                                d,
                                i
                              ) => (

                                <li key={i}>

                                  {d}

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
        {/* EXPLAINABLE AI */}
        {/* ========================================= */}

        <div className="shap-section-main">

          <h2>

            🤖 Explainable AI Insights

          </h2>

          <div className="shap-grid">

            {

              Object.entries(
                shapExplanations
              ).map(

                (
                  [nutrient, features],
                  index
                ) => (

                  <div
                    key={index}
                    className="shap-box"
                  >

                    <h3>

                      {nutrient}

                    </h3>

                    {

                      features.length > 0 ? (

                        <ul>

                          {

                            features.map(

                              (
                                feature,
                                idx
                              ) => (

                                <li key={idx}>

                                  {feature}

                                </li>

                              )

                            )

                          }

                        </ul>

                      ) : (

                        <p>

                          No SHAP explanation available

                        </p>

                      )

                    }

                  </div>

                )

              )

            }

          </div>

        </div>

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
                  {/* CARD TOP */}
                  {/* ========================================= */}

                  <div className="card-top">

                    <h2>

                      {key}

                    </h2>

                    <div

                      className={`status-badge ${getStatusClass(val)}`}

                    >

                      {getIcon(val)}
                      {" "}
                      {val}

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

                        {" "}

                        of Daily Requirement

                      </p>

                      {/* ========================================= */}
                      {/* PROGRESS BAR */}
                      {/* ========================================= */}

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
                  {/* RECOMMENDED FOODS */}
                  {/* ========================================= */}

                  {val !== "Normal" &&
                    rec &&
                    Array.isArray(rec.foods) &&
                    rec.foods.length > 0 && (

                    <div className="recommend-box">

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

                    </div>

                  )}

                </div>

              );
            }

          )}

        </div>

        {/* ========================================= */}
        {/* CONTINUOUS MONITORING */}
        {/* ========================================= */}

        <div className="monitor-card">

          <h2>

            📈 Continuous Health Monitoring

          </h2>

          <p>

            Historical nutritional
            records are stored for
            long-term monitoring,
            adaptive recovery tracking,
            and future comparison.

          </p>

          <div className="monitor-grid">

            <div className="monitor-box">

              ✅ Longitudinal Tracking

            </div>

            <div className="monitor-box">

              ✅ Personalized Recovery

            </div>

            <div className="monitor-box">

              ✅ Historical AI Monitoring

            </div>

          </div>

        </div>

        {/* ========================================= */}
        {/* REPORT BUTTONS */}
        {/* ========================================= */}

        <div className="report-buttons">

          <button

            className="view-report-btn"

            onClick={() =>
              navigate("/full-report")
            }

          >

            View Full AI Report

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
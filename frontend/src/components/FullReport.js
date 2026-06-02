import React from "react";

import {
  useNavigate
} from "react-router-dom";

import "./FullReport.css";

function FullReport({

  result,
  recommendations,
  fullResult

}) {

  const navigate = useNavigate();

  // =========================================
  // EMPTY
  // =========================================

  if (

    !result ||

    Object.keys(result).length === 0

  ) {

    return (

      <div className="full-report-page">

        <div className="full-report-container">

          No Report Found

        </div>

      </div>

    );

  }

  // =========================================
  // SAFE RISK
  // =========================================

  const riskScore = Math.min(

    Number(fullResult?.risk_score || 0),

    100

  );

  // =========================================
  // IMAGE ANALYSIS
  // =========================================

  const imageAnalysis =
    fullResult?.image_analysis || {};

  // =========================================
  // PREVIOUS HISTORY
  // =========================================

  const previousRisk =
    fullResult?.previous_risk_score || 0;

  const trendMessage =
    fullResult?.trend_message ||
    "No Trend";

  return (

    <div className="full-report-page">

      <div className="full-report-container">

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
        {/* MAIN BOX */}
        {/* ========================================= */}

        <div className="main-report-box">

          {/* ========================================= */}
          {/* RISK */}
          {/* ========================================= */}

          <div className="report-section">

            <h2>

              Risk Assessment

            </h2>

            <div className="risk-grid">

              <div className="risk-card">

                <h3>

                  Risk Score

                </h3>

                <p>

                  {riskScore.toFixed(1)}/100

                </p>

              </div>

              <div className="risk-card">

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

              {/* ========================================= */}
              {/* PREVIOUS RISK */}
              {/* ========================================= */}

              <div className="risk-card">

                <h3>

                  Previous Risk

                </h3>

                <p>

                  {previousRisk}/100

                </p>

              </div>

              {/* ========================================= */}
              {/* TREND */}
              {/* ========================================= */}

              <div className="risk-card">

                <h3>

                  Health Trend

                </h3>

                <p>

                  {trendMessage}

                </p>

              </div>

            </div>

          </div>

          {/* ========================================= */}
          {/* IMAGE ANALYSIS */}
          {/* ========================================= */}

          <div className="report-section">

            <h2>

              Medical Image Findings

            </h2>

            <div className="image-grid">

              <div className="image-card">

                <h3>

                  Eye Analysis

                </h3>

                <p>

                  {

                    imageAnalysis.eye_analysis ||

                    "Normal"

                  }

                </p>

              </div>

              <div className="image-card">

                <h3>

                  Nail Analysis

                </h3>

                <p>

                  {

                    imageAnalysis.nail_analysis ||

                    "Normal"

                  }

                </p>

              </div>

              <div className="image-card">

                <h3>

                  Tongue Analysis

                </h3>

                <p>

                  {

                    imageAnalysis.tongue_analysis ||

                    "Normal"

                  }

                </p>

              </div>

            </div>

          </div>

          {/* ========================================= */}
          {/* RESULTS */}
          {/* ========================================= */}

          <div className="report-section">

            <h2>

              Deficiency Results

            </h2>

            <div className="result-grid">

              {

                Object.entries(result).map(

                  ([key, val]) => (

                    <div

                      key={key}

                      className="result-card"

                    >

                      <div className="card-top">

                        <h3>

                          {key}

                        </h3>

                        <span

                          className={`badge ${val.toLowerCase()}`}

                        >

                          {val}

                        </span>

                      </div>

                      {

                        val !== "Normal" &&
                        recommendations?.[key]?.foods && (

                          <>

                            <h4>

                              Recommended Foods

                            </h4>

                            <div className="food-list">

                              {

                                recommendations[
                                  key
                                ].foods.map(

                                  (
                                    food,
                                    i
                                  ) => (

                                    <span
                                      key={i}
                                      className="food-chip"
                                    >

                                      {food}

                                    </span>

                                  )

                                )

                              }

                            </div>

                          </>

                        )

                      }

                    </div>

                  )

                )

              }

            </div>

          </div>

          {/* ========================================= */}
          {/* BUTTONS */}
          {/* ========================================= */}

          <div className="report-buttons">

            <button

              onClick={() =>
                navigate("/result")
              }

              className="back-btn"

            >

              Back

            </button>

          </div>

        </div>

      </div>

    </div>

  );

}

export default FullReport;


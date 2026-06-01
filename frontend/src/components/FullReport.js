import React, { useEffect } from "react";

import "./FullReport.css";

import downloadReport from "./DownloadReport";

function FullReport({

  fullResult,
  result

}) {

  // =====================================
  // AUTO SCROLL TOP
  // =====================================

  useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

  // =====================================
  // DATA
  // =====================================

  const riskScore =
    fullResult?.risk_score || 0;

  const riskLevel =
    fullResult?.risk_level || "Low Risk";

  const imageAnalysis =
    fullResult?.image_analysis || {};

  const recommendations =
    fullResult?.recommendations || {};

  const shapExplanations =
    fullResult?.shap_explanations || {};

  const symptomAnalysis =
    fullResult?.symptom_analysis || [];

  // =====================================
  // SEVERE / MODERATE COUNT
  // =====================================

  let severeCount = 0;

  let moderateCount = 0;

  Object.values(result || {}).forEach(

    (status) => {

      if (status === "Severe") {

        severeCount++;

      }

      else if (
        status === "Moderate"
      ) {

        moderateCount++;

      }

    }

  );

  // =====================================
  // RECOVERY MESSAGE
  // =====================================

  const getRecoveryMessage = () => {

    if (riskScore >= 70) {

      return (
        "Immediate nutritional recovery plan recommended."
      );

    }

    if (riskScore >= 45) {

      return (
        "Moderate nutritional monitoring required."
      );

    }

    return (
      "Nutritional condition currently stable."
    );
  };

  // =====================================
  // HEALTH STATUS COLOR
  // =====================================

  const getRiskClass = () => {

    if (riskScore >= 70)
      return "risk-severe";

    if (riskScore >= 45)
      return "risk-moderate";

    return "risk-low";
  };

  // =====================================
  // SMART ALERTS
  // =====================================

  const getSmartAlerts = () => {

    let alerts = [];

    if (riskScore >= 70) {

      alerts.push(
        "⚠ Severe nutritional imbalance detected."
      );

      alerts.push(
        "⚠ Immediate dietary intervention recommended."
      );

    }

    if (severeCount >= 2) {

      alerts.push(
        "⚠ Multiple severe nutrient deficiencies identified."
      );

    }

    if (

      imageAnalysis.eye_analysis
      ?.includes("High")

    ) {

      alerts.push(
        "⚠ Eye analysis indicates possible anemia risk."
      );

    }

    if (

      imageAnalysis.nail_analysis
      ?.includes("Deficiency")

    ) {

      alerts.push(
        "⚠ Nail abnormalities associated with deficiency detected."
      );

    }

    if (

      imageAnalysis.tongue_analysis
      ?.includes("Deficiency")

    ) {

      alerts.push(
        "⚠ Tongue deficiency indicators detected."
      );

    }

    return alerts;
  };

  const smartAlerts =
    getSmartAlerts();

  // =====================================
  // UI
  // =====================================

  return (

    <div
      className="full-report-page"
      id="full-report-download"
    >

      <div className="full-report-card">

        {/* ===================================== */}
        {/* TITLE */}
        {/* ===================================== */}

        <div className="report-header">

          <h1>

            📄 Full AI Health Report

          </h1>

          <p>

            AI-Based Multimodal
            Nutritional Assessment
            System

          </p>

        </div>

        {/* ===================================== */}
        {/* DOWNLOAD BUTTON */}
        {/* ===================================== */}

        <div className="download-btn-wrapper">

          <button
            className="download-btn"
            onClick={downloadReport}
          >

            📄 Download PDF Report

          </button>

        </div>

        {/* ===================================== */}
        {/* OVERALL RISK */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            ❤️ Overall Nutritional Risk

          </h2>

          <div className="risk-grid">

            <div className="risk-box">

              <h3>

                Risk Score

              </h3>

              <p className={getRiskClass()}>

                {riskScore}

                {" "}

                / 100

              </p>

            </div>

            <div className="risk-box">

              <h3>

                Risk Level

              </h3>

              <p className={getRiskClass()}>

                {riskLevel}

              </p>

            </div>

          </div>

          <div className="risk-summary">

            {getRecoveryMessage()}

          </div>

        </div>

        {/* ===================================== */}
        {/* SMART ALERTS */}
        {/* ===================================== */}

        {

          smartAlerts.length > 0 && (

            <div className="report-section">

              <h2>

                🚨 Smart Clinical Alerts

              </h2>

              <div className="alert-box">

                {

                  smartAlerts.map(

                    (
                      alert,
                      index
                    ) => (

                      <p key={index}>

                        {alert}

                      </p>

                    )

                  )

                }

              </div>

            </div>

          )

        }

        {/* ===================================== */}
        {/* MULTIMODAL */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            🧠 Multimodal Contribution

          </h2>

          <div className="contribution-grid">

            <div className="contribution-card">

              <h3>

                🍽 Food Intake

              </h3>

              <p>

                30%

              </p>

            </div>

            <div className="contribution-card">

              <h3>

                📊 Nutrient Prediction

              </h3>

              <p>

                25%

              </p>

            </div>

            <div className="contribution-card">

              <h3>

                🩺 Symptom Analysis

              </h3>

              <p>

                20%

              </p>

            </div>

            <div className="contribution-card">

              <h3>

                👁 Eye Analysis

              </h3>

              <p>

                15%

              </p>

            </div>

            <div className="contribution-card">

              <h3>

                💅 Nail + Tongue

              </h3>

              <p>

                10%

              </p>

            </div>

          </div>

        </div>

        {/* ===================================== */}
        {/* IMAGE ANALYSIS */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            🩺 Medical Image Findings

          </h2>

          <div className="image-grid">

            <div className="image-box">

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

            <div className="image-box">

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

            <div className="image-box">

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

        {/* ===================================== */}
        {/* ADAPTIVE RECOVERY */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            🌿 Adaptive Recovery Intelligence

          </h2>

          {

            Object.entries(
              recommendations
            ).map(

              (
                [nutrient, data],
                index
              ) => (

                <div
                  key={index}
                  className="recovery-card"
                >

                  <h3>

                    {nutrient}

                  </h3>

                  <p>

                    {

                      data.recovery_message ||

                      "Recovery monitoring active."

                    }

                  </p>

                  <div className="severity-badge">

                    Severity:

                    {" "}

                    {

                      data.severity ||

                      "Moderate"

                    }

                  </div>

                </div>

              )

            )

          }

        </div>

        {/* ===================================== */}
        {/* SYMPTOM ANALYSIS */}
        {/* ===================================== */}

        {

          symptomAnalysis.length > 0 && (

            <div className="report-section">

              <h2>

                🩺 Symptom Questionnaire Analysis

              </h2>

              <div className="symptom-analysis-grid">

                {

                  symptomAnalysis.map(

                    (
                      item,
                      index
                    ) => (

                      <div
                        key={index}
                        className="symptom-card"
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

        {/* ===================================== */}
        {/* EXPLAINABLE AI */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            🤖 Explainable AI Insights

          </h2>

          <ul className="report-list">

            {

              severeCount > 0 && (

                <li>

                  Severe nutrient
                  deficiencies detected
                  through AI prediction.

                </li>

              )

            }

            {

              moderateCount > 0 && (

                <li>

                  Moderate nutritional
                  imbalance identified
                  from dietary analysis.

                </li>

              )

            }

            <li>

              Medical image analysis
              contributed to multimodal
              prediction scoring.

            </li>

            <li>

              Symptom questionnaire
              analysis enhanced clinical
              nutritional reasoning.

            </li>

            <li>

              Personalized food
              recommendations generated
              using nutrient severity.

            </li>

            <li>

              AI integrated food intake,
              nutrient estimation,
              symptom analysis,
              and CNN image analysis.

            </li>

          </ul>

          {/* ===================================== */}
          {/* SHAP FEATURE IMPORTANCE */}
          {/* ===================================== */}

          <div className="shap-section">

            <h3>

              🔍 Top Contributing Factors

            </h3>

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
                    className="shap-card"
                  >

                    <h4>

                      {nutrient}

                    </h4>

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

                          No SHAP explanation available.

                        </p>

                      )

                    }

                  </div>

                )

              )

            }

          </div>

        </div>

        {/* ===================================== */}
        {/* CONTINUOUS MONITORING */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            📈 Continuous Health Monitoring

          </h2>

          <p>

            The system stores historical
            nutritional records for
            long-term health tracking
            and continuous monitoring.

          </p>

          <p>

            Future reports can be
            compared to identify
            nutritional improvement,
            deterioration, and
            recovery trends.

          </p>

          <div className="monitoring-box">

            <p>

              ✅ Longitudinal Tracking Enabled

            </p>

            <p>

              ✅ Historical Risk Monitoring Enabled

            </p>

            <p>

              ✅ Personalized Recovery Monitoring Enabled

            </p>

          </div>

        </div>

        {/* ===================================== */}
        {/* FINAL SUMMARY */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            📋 Final AI Summary

          </h2>

          <p>

            The proposed multimodal AI
            healthcare system analyzed
            food intake, symptom
            questionnaire patterns,
            nutrient trends, and
            medical images to predict
            nutritional deficiencies
            and generate personalized
            recommendations.

          </p>

          <p>

            The system integrates
            XGBoost prediction models,
            CNN-based medical image
            analysis, explainable AI,
            adaptive recovery intelligence,
            personalized meal planning,
            symptom-aware assessment,
            and continuous nutritional
            monitoring.

          </p>

          <p>

            This platform supports
            long-term nutritional
            tracking and intelligent
            healthcare assistance
            using multimodal AI.

          </p>

        </div>

      </div>

    </div>

  );
}

export default FullReport;
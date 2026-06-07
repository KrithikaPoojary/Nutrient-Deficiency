import React from "react";
import { useNavigate } from "react-router-dom";
import "./FullReport.css";

function FullReport({
  result,
  recommendations,
  fullResult
}) {

  const navigate = useNavigate();

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

  const riskScore = Math.min(
    Number(fullResult?.risk_score || 0),
    100
  );

  const previousRisk =
    fullResult?.previous_risk_score || 0;

  const trendMessage =
    fullResult?.trend_message ||
    "No Trend";

  const questionnaire =
    fullResult?.questionnaire || {};

  const shapExplanations =
    fullResult?.shap_explanations || {};

  const gradcam =
    fullResult?.gradcam || {};

  // =========================================
  // TREND DIRECTION HELPER
  // =========================================

  const getTrendClass = () => {
    if (!trendMessage || trendMessage === "No previous records") return "trend-neutral";
    if (trendMessage.includes("Improved")) return "trend-improved";
    if (trendMessage.includes("Increased")) return "trend-worsened";
    return "trend-neutral";
  };

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
        {/* HEALTH TREND ANALYSIS */}
        {/* ========================================= */}

        <div className="report-section">

          <h2>📈 Health Trend Analysis</h2>

          <div className="trend-analysis-box">

            <div className="trend-score-row">

              <div className="trend-score-card">
                <p className="trend-label">Previous Risk Score</p>
                <p className="trend-value trend-value-previous">
                  {previousRisk > 0 ? previousRisk : "No prior data"}
                </p>
              </div>

              <div className="trend-arrow">
                {trendMessage.includes("Improved") ? "↓" :
                 trendMessage.includes("Increased") ? "↑" : "→"}
              </div>

              <div className="trend-score-card">
                <p className="trend-label">Current Risk Score</p>
                <p className="trend-value trend-value-current">
                  {riskScore.toFixed(1)}
                </p>
              </div>

            </div>

            <div className={`trend-message-box ${getTrendClass()}`}>
              {trendMessage}
            </div>

          </div>

        </div>

        {/* ========================================= */}
        {/* RISK ASSESSMENT */}
        {/* ========================================= */}

        <div className="report-section">

          <h2>
            Risk Assessment
          </h2>

          <div className="risk-grid">

            <div className="risk-card">
              <h3>Risk Score</h3>
              <p>{riskScore.toFixed(1)}/100</p>
            </div>

            <div className="risk-card">
              <h3>Risk Level</h3>
              <p>{fullResult?.risk_level}</p>
            </div>

            <div className="risk-card">
              <h3>Previous Risk</h3>
              <p>{previousRisk > 0 ? `${previousRisk}/100` : "No prior data"}</p>
            </div>

            <div className="risk-card">
              <h3>Health Trend</h3>
              <p>{trendMessage}</p>
            </div>

          </div>

        </div>

        {/* ========================================= */}
        {/* QUESTIONNAIRE */}
        {/* ========================================= */}

        <div className="report-section">

          <h2>
            Questionnaire Analysis
          </h2>

          <div className="questionnaire-box">

            <p>
              <strong>Age:</strong>
              {" "}
              {fullResult?.age || "N/A"} Years
            </p>

            <p>
              <strong>Gender:</strong>
              {" "}
              {fullResult?.gender === 0 ? "Female" : "Male"}
            </p>

            <p>
              <strong>Height:</strong>
              {" "}
              {questionnaire.height || "N/A"} cm
            </p>

            <p>
              <strong>Weight:</strong>
              {" "}
              {questionnaire.weight || "N/A"} kg
            </p>

            <p>
              <strong>BMI:</strong>
              {" "}
              {questionnaire.bmi || fullResult?.bmi || "N/A"}
            </p>

            <p>
              <strong>Health Conditions:</strong>
              {" "}
              {questionnaire.conditions?.join(", ") || "None"}
            </p>

            <p>
              <strong>Physical Activity:</strong>
              {" "}
              {questionnaire.activity || "N/A"}
            </p>

            <p>
              <strong>Sleep Duration:</strong>
              {" "}
              {questionnaire.sleep_hours || "N/A"} Hours
            </p>

            <p>
              <strong>Water Intake:</strong>
              {" "}
              {questionnaire.water_intake || "N/A"} Liters
            </p>

            <p>
              <strong>Diet Type:</strong>
              {" "}
              {questionnaire.diet_type || "N/A"}
            </p>

            <p>
              <strong>Sunlight Exposure:</strong>
              {" "}
              {questionnaire.sunlight_exposure || "N/A"}
            </p>

            <p>
              <strong>Fruit Intake:</strong>
              {" "}
              {questionnaire.fruit_intake || "N/A"}
            </p>

            <p>
              <strong>Vegetable Intake:</strong>
              {" "}
              {questionnaire.vegetable_intake || "N/A"}
            </p>

            <p>
              <strong>Meals Per Day:</strong>
              {" "}
              {questionnaire.meals_per_day || "N/A"}
            </p>

            <p>
              <strong>Reported Symptoms:</strong>
              {" "}
              {questionnaire.symptoms?.join(", ") || "None"}
            </p>

          </div>

        </div>

        {/* ========================================= */}
        {/* DEFICIENCY RESULTS */}
        {/* ========================================= */}

        <div className="report-section">

          <h2>
            Deficiency Results
          </h2>

          {
            Object.entries(result).map(([key, val]) => (

              <div key={key} className="result-card">

                <h3>{key}</h3>

                <span className={`badge ${val.toLowerCase()}`}>
                  {val}
                </span>

                {/* EXPLAINABLE AI */}

                <div className="explain-box">

                  <h4>Explainable AI</h4>

                  {
                    shapExplanations[key]?.length > 0
                      ? (
                        <ul className="shap-list">
                          {shapExplanations[key].map((item, i) => (
                            <li key={i}>
                              <strong>{item.feature}</strong>
                              {" | Value: "}
                              {item.value}
                              {" | Impact: "}
                              {item.impact}
                            </li>
                          ))}
                        </ul>
                      )
                      : (
                        <p>No SHAP explanation available</p>
                      )
                  }

                </div>

                {/* FOOD RECOMMENDATIONS */}

                {
                  val !== "Normal" &&
                  recommendations?.[key]?.foods && (

                    <div className="food-section">

                      <h4>Personalized Food Suggestions</h4>

                      <div className="food-list">
                        {recommendations[key].foods.map((food, i) => (
                          <span key={i} className="food-chip">
                            {food}
                          </span>
                        ))}
                      </div>

                    </div>

                  )
                }

              </div>

            ))
          }

        </div>

        {/* ========================================= */}
        {/* GRAD-CAM VISUAL EXPLANATION */}
        {/* ========================================= */}

        <div className="report-section">

          <h2>
            🔥 Grad-CAM Visual Explanation
          </h2>

          <p>
            Heatmaps highlight the image regions
            that contributed most to the CNN
            prediction.
          </p>

          <div className="gradcam-grid">

            {gradcam.eye && (

              <div className="gradcam-card">

                <h3>Eye Analysis</h3>

                <img
                  src={`http://localhost:5000/${gradcam.eye}`}
                  alt="Eye GradCAM"
                  className="gradcam-image"
                />

              </div>

            )}

            {gradcam.nail && (

              <div className="gradcam-card">

                <h3>Nail Analysis</h3>

                <img
                  src={`http://localhost:5000/${gradcam.nail}`}
                  alt="Nail GradCAM"
                  className="gradcam-image"
                />

              </div>

            )}

            {gradcam.tongue && (

              <div className="gradcam-card">

                <h3>Tongue Analysis</h3>

                <img
                  src={`http://localhost:5000/${gradcam.tongue}`}
                  alt="Tongue GradCAM"
                  className="gradcam-image"
                />

              </div>

            )}

          </div>

        </div>

        {/* ========================================= */}
        {/* BUTTON */}
        {/* ========================================= */}

        <div className="report-buttons">

          <button
            className="back-btn"
            onClick={() => navigate("/result")}
          >
            Back
          </button>

        </div>

      </div>

    </div>

  );

}

export default FullReport;
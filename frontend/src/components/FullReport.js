import React, { useEffect } from "react";

import "./FullReport.css";

function FullReport() {

  // =====================================
  // AUTO SCROLL TOP
  // =====================================

  useEffect(() => {

    window.scrollTo(0, 0);

  }, []);

  return (

    <div className="full-report-page">

      <div className="full-report-card">

        <h1>

          📄 Full AI Health Report

        </h1>

        {/* ===================================== */}
        {/* OVERALL RISK */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            ❤️ Overall Nutritional Risk

          </h2>

          <p>

            Risk Level:
            <strong>
              {" "}
              Severe
            </strong>

          </p>

          <p>

            Health Score:
            <strong>
              {" "}
              42 / 100
            </strong>

          </p>

        </div>

        {/* ===================================== */}
        {/* MULTIMODAL */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            🧠 Multimodal Contribution

          </h2>

          <ul>

            <li>
              Food Intake → 35%
            </li>

            <li>
              Questionnaire → 20%
            </li>

            <li>
              Eye Analysis → 25%
            </li>

            <li>
              Nail Analysis → 10%
            </li>

            <li>
              Tongue Analysis → 10%
            </li>

          </ul>

        </div>

        {/* ===================================== */}
        {/* EXPLAINABLE AI */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            🤖 Explainable AI

          </h2>

          <ul>

            <li>
              Low iron-rich food intake
            </li>

            <li>
              Eye anemia indicators detected
            </li>

            <li>
              Koilonychia symptoms found
            </li>

          </ul>

        </div>

        {/* ===================================== */}
        {/* TREND */}
        {/* ===================================== */}

        <div className="report-section">

          <h2>

            📈 Trend Monitoring

          </h2>

          <p>
            Previous Score → 56
          </p>

          <p>
            Current Score → 42
          </p>

          <p>
            Risk Increased → 14%
          </p>

        </div>

      </div>

    </div>

  );
}

export default FullReport;
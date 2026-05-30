import React from "react";

function FullReport() {

  return (

    <div className="result-page">

      <div className="result-container">

        <h1>
          Full AI Health Report
        </h1>

        <br />

        <div className="result-card">

          <h2>
            Overall Nutritional Risk
          </h2>

          <h1>
            🔴 Severe Risk
          </h1>

          <p>
            Health Score: 42 / 100
          </p>

        </div>

        <br />

        <div className="result-card">

          <h2>
            Multimodal Contribution
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

        <br />

        <div className="result-card">

          <h2>
            Explainable AI
          </h2>

          <ul>

            <li>
              Low iron-rich food intake
            </li>

            <li>
              Eye anemia indicators detected
            </li>

            <li>
              Koilonychia nail symptoms found
            </li>

          </ul>

        </div>

      </div>

    </div>

  );
}

export default FullReport;
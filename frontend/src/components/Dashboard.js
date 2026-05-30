import React from "react";

import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

function Dashboard({ user }) {

  const navigate = useNavigate();

  return (

    <div className="dashboard-page">

      {/* ===================================== */}
      {/* SIDEBAR */}
      {/* ===================================== */}

      <div className="sidebar">

        <h2 className="sidebar-logo">
          🥗 NutriHealth AI
        </h2>

        <div className="sidebar-menu">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            🏠 Dashboard
          </button>

          <button
            onClick={() =>
              navigate("/assessment")
            }
          >
            📋 Assessment
          </button>

          <button
            onClick={() =>
              navigate("/history")
            }
          >
            📈 History
          </button>

          <button>
            📄 Reports
          </button>

          <button
            onClick={() =>
              navigate("/")
            }
          >
            🔐 Logout
          </button>

        </div>

      </div>

      {/* ===================================== */}
      {/* MAIN */}
      {/* ===================================== */}

      <div className="dashboard-main">

        {/* ===================================== */}
        {/* TOP BAR */}
        {/* ===================================== */}

        <div className="topbar">

          <div>

            <h1>
              Welcome, {user?.username} 👋
            </h1>

            <p>
              Multimodal AI Nutritional
              Monitoring Platform
            </p>

          </div>

        </div>

        {/* ===================================== */}
        {/* QUICK ACTION */}
        {/* ===================================== */}

        <div className="quick-action-card">

          <div className="quick-left">

            <h2>
              Start Nutritional Assessment
            </h2>

            <p>
              Analyze food intake,
              medical images,
              deficiency severity,
              and personalized health insights.
            </p>

          </div>

          <button
            className="start-btn"
            onClick={() =>
              navigate("/assessment")
            }
          >
            Start Assessment →
          </button>

        </div>

        {/* ===================================== */}
        {/* FEATURE CARDS */}
        {/* ===================================== */}

        <div className="dashboard-cards">

          <div className="dash-card">

            <h3>
              🧠 AI Prediction
            </h3>

            <p>
              XGBoost-based nutrient
              deficiency prediction system.
            </p>

          </div>

          <div className="dash-card">

            <h3>
              👁️ Image Analysis
            </h3>

            <p>
              Eye, nail, and tongue
              analysis using CNN models.
            </p>

          </div>

          <div className="dash-card">

            <h3>
              📈 Trend Monitoring
            </h3>

            <p>
              Longitudinal nutritional
              risk tracking and severity analysis.
            </p>

          </div>

          <div className="dash-card">

            <h3>
              🥗 Personalized Plans
            </h3>

            <p>
              AI-generated food
              recommendations and meal plans.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
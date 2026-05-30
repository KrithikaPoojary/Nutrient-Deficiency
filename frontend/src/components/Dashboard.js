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

        {/* TOP BAR */}

        <div className="topbar">

          <div>

            <h1>
              Welcome, {user?.username} 👋
            </h1>

            <p>
              AI-powered nutritional
              deficiency monitoring system
            </p>

          </div>

        </div>

        {/* ===================================== */}
        {/* HERO */}
        {/* ===================================== */}

        <div className="hero-card">

          <div>

            <h2>
              Intelligent Nutritional
              Analysis Platform
            </h2>

            <p>

              Predict nutritional deficiencies
              using AI, analyze dietary trends,
              and receive personalized food
              recommendations.

            </p>

            <button
              className="start-btn"
              onClick={() =>
                navigate("/assessment")
              }
            >
              Start Assessment →
            </button>

          </div>

        </div>

        {/* ===================================== */}
        {/* CARDS */}
        {/* ===================================== */}

        <div className="dashboard-cards">

          <div className="dash-card">

            <h3>
              🍎 Nutrient Prediction
            </h3>

            <p>
              XGBoost-based AI prediction
              for 7 major nutrients.
            </p>

          </div>

          <div className="dash-card">

            <h3>
              📈 Trend Analysis
            </h3>

            <p>
              Monitor nutritional trends
              and deficiency severity.
            </p>

          </div>

          <div className="dash-card">

            <h3>
              🥗 Personalized Plans
            </h3>

            <p>
              Generate customized
              meal recommendations.
            </p>

          </div>

          <div className="dash-card">

            <h3>
              🤖 AI Health System
            </h3>

            <p>
              Research-oriented
              intelligent healthcare platform.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
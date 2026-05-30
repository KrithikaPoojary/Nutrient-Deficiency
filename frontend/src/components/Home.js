import React from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Home({ user }) {

  const navigate = useNavigate();

  // ======================================
  // START ASSESSMENT
  // ======================================

  const handleAssessment = () => {

    // ✅ IF LOGGED IN
    if (user) {

      navigate("/dashboard");

    }

    // ❌ NOT LOGGED IN
    else {

      navigate("/");

    }
  };

  // ======================================

  return (

    <div className="home-page">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          🥗 NutriHealth AI
        </div>

        <div className="nav-links">

        <Link to="/">Home</Link>

        <Link to="/">Profile</Link>

        <Link to="/">Assess</Link>

        <Link to="/">Results</Link>

        <Link to="/">Meal Plan</Link>

        <Link to="/">History</Link>

        </div>

      </nav>

      {/* HERO SECTION */}

      <div className="hero-section">

        <h1>
          Intelligent Nutritional
          Health System
        </h1>

        <p>
          Multimodal AI-powered personalized
          nutrition monitoring with adaptive
          recommendations and health analysis.
        </p>

        <div className="hero-buttons">

          {/* START ASSESSMENT */}

          <button
            className="start-btn"
            onClick={handleAssessment}
          >
            Start Assessment
          </button>

          {/* COMPLETE PROFILE */}

          <button
            className="profile-btn"
            onClick={() => navigate("/register")}
          >
            Complete Profile First
          </button>

        </div>

      </div>

      {/* FEATURES */}

      <div className="features-grid">

        <div className="feature-card">

          <h3>
            🧠 ML Prediction
          </h3>

          <p>
            XGBoost severity classification
          </p>

        </div>

        <div className="feature-card">

          <h3>
            🥗 7 Nutrients
          </h3>

          <p>
            Iron, Protein, Vitamin A,
            B12, C, D and Fiber analysis
          </p>

        </div>

        <div className="feature-card">

          <h3>
            📄 PDF Reports
          </h3>

          <p>
            Downloadable clinical
            health reports
          </p>

        </div>

        <div className="feature-card">

          <h3>
            ❤️ Health Profile
          </h3>

          <p>
            Age, BMI, allergies,
            lifestyle tracking
          </p>

        </div>

        <div className="feature-card">

          <h3>
            🍽 Food Assessment
          </h3>

          <p>
            Daily food intake
            monitoring and analysis
          </p>

        </div>

        <div className="feature-card">

          <h3>
            📈 Progress Tracking
          </h3>

          <p>
            Longitudinal nutrient
            trend visualization
          </p>

        </div>

      </div>

    </div>
  );
}

export default Home;
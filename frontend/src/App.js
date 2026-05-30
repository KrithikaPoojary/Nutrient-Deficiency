import React, { useState } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Form from "./components/Form";
import Result from "./components/Result";
import History from "./components/History";
import Home from "./components/Home";

import "./App.css";

function App() {

  // =====================================
  // STATES
  // =====================================

  const [user, setUser] = useState(null);

  const [result, setResult] = useState(null);

  const [recommendations, setRecommendations] =
    useState(null);

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {

    setUser(null);

    setResult(null);

    setRecommendations(null);
  };

  // =====================================
  // APP
  // =====================================

  return (

    <Router>

      <Routes>

        {/* ===================================== */}
        {/* PUBLIC HOME PAGE */}
        {/* ===================================== */}

        <Route
          path="/"
          element={
            <Home user={user} />
          }
        />

        {/* ===================================== */}
        {/* LOGIN */}
        {/* ===================================== */}

        <Route
          path="/login"
          element={
            <Login setUser={setUser} />
          }
        />

        {/* ===================================== */}
        {/* REGISTER */}
        {/* ===================================== */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ===================================== */}
        {/* DASHBOARD */}
        {/* ===================================== */}

        <Route

          path="/dashboard"

          element={

            user ? (

              <div className="dashboard-page">

                {/* ===================================== */}
                {/* NAVBAR */}
                {/* ===================================== */}

                <div className="top-navbar">

                  <div className="brand">

                    🥗 NutriHealth AI

                  </div>

                  <div className="nav-right">

                    <span>
                      Welcome,
                      {" "}
                      {user.username}
                      👋
                    </span>

                    <button
                      className="logout-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>

                  </div>

                </div>

                {/* ===================================== */}
                {/* HERO */}
                {/* ===================================== */}

                <div className="hero-banner">

                  <h1>
                    Intelligent Nutritional
                    Health System
                  </h1>

                  <p>

                    AI-powered nutritional
                    deficiency prediction,
                    personalized meal planning,
                    and longitudinal health
                    tracking system.

                  </p>

                </div>

                {/* ===================================== */}
                {/* MAIN CONTENT */}
                {/* ===================================== */}

                <div className="main-layout">

                  {/* FORM */}

                  <div className="left-panel">

                    <Form

                      setResult={setResult}

                      setRecommendations={
                        setRecommendations
                      }

                      user={user}

                    />

                  </div>

                  {/* RESULTS */}

                  <div className="right-panel">

                    {result &&
                      Object.keys(result).length > 0 && (

                      <Result

                        result={result}

                        recommendations={
                          recommendations
                        }

                      />

                    )}

                  </div>

                </div>

                {/* ===================================== */}
                {/* HISTORY */}
                {/* ===================================== */}

                <div className="history-section">

                  <History user={user} />

                </div>

              </div>

            ) : (

              <Navigate to="/login" />

            )

          }

        />

      </Routes>

    </Router>

  );
}

export default App;
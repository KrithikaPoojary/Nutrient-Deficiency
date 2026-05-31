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
import FullReport from "./components/FullReport";
import MealPlan from "./components/MealPlan";

import "./App.css";

function App() {

  // =====================================
  // STATES
  // =====================================

  const [user, setUser] =
    useState(null);

  const [result, setResult] =
    useState(null);

  const [
    recommendations,
    setRecommendations
  ] = useState(null);

  const [
    fullResult,
    setFullResult
  ] = useState(null);

  // =====================================
  // LOGOUT
  // =====================================

  const handleLogout = () => {

    setUser(null);

    setResult(null);

    setRecommendations(null);

    setFullResult(null);

  };

  // =====================================
  // APP
  // =====================================

  return (

    <Router>

      <Routes>

        {/* ===================================== */}
        {/* HOME */}
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

          element={
            <Register />
          }

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
                {/* FORM */}
                {/* ===================================== */}

                <div className="main-layout">

                  <div className="left-panel">

                    <Form

                      setResult={setResult}

                      setRecommendations={
                        setRecommendations
                      }

                      setFullResult={
                        setFullResult
                      }

                      user={user}

                    />

                  </div>

                </div>

              </div>

            ) : (

              <Navigate to="/login" />

            )

          }

        />

        {/* ===================================== */}
        {/* RESULT PAGE */}
        {/* ===================================== */}

        <Route

          path="/result"

          element={

            user ? (

              result ? (

                <Result

                  result={result}

                  recommendations={
                    recommendations
                  }

                  fullResult={
                    fullResult
                  }

                />

              ) : (

                <Navigate to="/dashboard" />

              )

            ) : (

              <Navigate to="/login" />

            )

          }

        />

        {/* ===================================== */}
        {/* FULL REPORT */}
        {/* ===================================== */}

        <Route

          path="/full-report"

          element={

            user ? (

              <FullReport />

            ) : (

              <Navigate to="/login" />

            )

          }

        />

        {/* ===================================== */}
        {/* MEAL PLAN */}
        {/* ===================================== */}

        <Route

          path="/meal-plan"

          element={

            user ? (

              <MealPlan

                recommendations={
                  recommendations
                }

              />

            ) : (

              <Navigate to="/login" />

            )

          }

        />

        {/* ===================================== */}
        {/* HISTORY */}
        {/* ===================================== */}

        <Route

          path="/history"

          element={

            user ? (

              <History user={user} />

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
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Form from "./components/Form";
import Result from "./components/Result";
import History from "./components/History";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  // 🔥 Logout handler (clean reset)
  const handleLogout = () => {
    setUser(null);
    setResult(null);
    setRecommendations(null);
  };

  return (
    <Router>
      <Routes>

        {/* 🔐 Login */}
        <Route path="/" element={<Login setUser={setUser} />} />

        {/* 📝 Register */}
        <Route path="/register" element={<Register />} />

        {/* 🏠 Home */}
        <Route
          path="/home"
          element={
            user ? (
              <div className="App">

                {/* 🔥 HEADER */}
                <div className="header">
                  <h1>🍎 Nutrition Deficiency Predictor</h1>
                  <h3>Welcome, {user.username} 👋</h3>

                  <button
                    className="logout-btn"
                    onClick={handleLogout}
                  >
                    Logout 🔐
                  </button>
                </div>

                {/* 🔥 MAIN CONTENT */}
                <div className="main-content">

                  {/* FORM */}
                  <Form
                    setResult={setResult}
                    setRecommendations={setRecommendations}
                    user={user}
                  />

                  {/* RESULTS */}
                  {result && (
                    <Result
                      result={result}
                      recommendations={recommendations}
                    />
                  )}

                  {/* HISTORY */}
                  {user && <History user={user} />}

                </div>

              </div>
            ) : (
              <Navigate to="/" />
            )
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
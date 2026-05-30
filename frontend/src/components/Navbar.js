import React from "react";

import { useNavigate } from "react-router-dom";

import "./Navbar.css";

function Navbar({ user }) {

  const navigate = useNavigate();

  return (

    <div className="navbar">

      {/* ================================= */}
      {/* LOGO */}
      {/* ================================= */}

      <div
        className="navbar-logo"
        onClick={() => navigate("/")}
      >

        🥗 NutriHealth AI

      </div>

      {/* ================================= */}
      {/* LINKS */}
      {/* ================================= */}

      <div className="navbar-links">

        <button
          onClick={() => navigate("/")}
        >
          Home
        </button>

        {user && (

          <>
            <button
              onClick={() =>
                navigate("/dashboard")
              }
            >
              Dashboard
            </button>

            <button
              onClick={() =>
                navigate("/assessment")
              }
            >
              Assessment
            </button>

            <button
              onClick={() =>
                navigate("/history")
              }
            >
              History
            </button>
          </>

        )}

      </div>

      {/* ================================= */}
      {/* RIGHT SIDE */}
      {/* ================================= */}

      <div className="navbar-right">

        {user ? (

          <div className="user-box">

            <span>
              👤 {user.username}
            </span>

            <button
              className="logout-btn-nav"
              onClick={() =>
                navigate("/")
              }
            >
              Logout
            </button>

          </div>

        ) : (

          <div className="auth-buttons">

            <button
              className="login-nav-btn"
              onClick={() =>
                navigate("/login")
              }
            >
              Login
            </button>

            <button
              className="register-nav-btn"
              onClick={() =>
                navigate("/register")
              }
            >
              Register
            </button>

          </div>

        )}

      </div>

    </div>
  );
}

export default Navbar;
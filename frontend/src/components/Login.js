 import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login({ setUser }) {

  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");

  // =====================================
  // LOGIN
  // =====================================

  const handleLogin = async () => {

    try {

      setError("");

      const res = await axios.post(
        "http://localhost:5000/login",
        data
      );

      setUser(res.data);

      navigate("/dashboard");

    }

    catch (err) {

      console.error("LOGIN ERROR:", err);

      if (err.response) {

        setError(
          err.response.data.message ||
          "Login failed"
        );

      }

      else {

        setError(
          "Server not responding"
        );

      }

    }

  };

  // =====================================

  return (

    <div className="login-container">

      <div className="login-card">

        <h1 className="logo">
          NutriHealth AI
        </h1>

        <p className="subtitle">
          Intelligent Nutritional Health System
        </p>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        <div className="input-group">

          <input
            type="text"
            placeholder="Username"
            autoComplete="off"
            value={data.username}
            onChange={(e) =>
              setData({
                ...data,
                username: e.target.value
              })
            }
          />

          <input
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            value={data.password}
            onChange={(e) =>
              setData({
                ...data,
                password: e.target.value
              })
            }
          />

        </div>

        <button
          className="login-btn"
          onClick={handleLogin}
        >
          Login
        </button>

        <p className="register-text">

          Don't have an account?

          <span
            className="login-link"
            onClick={() =>
              navigate("/register")
            }
          >
            Register
          </span>

        </p>

      </div>

    </div>

  );

}

export default Login;


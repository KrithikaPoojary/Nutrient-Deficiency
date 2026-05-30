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

      // SAVE USER

      setUser(res.data);

      // GO TO DASHBOARD

      navigate("/dashboard");

    }

    catch (err) {

      setError(

        "Invalid username or password"

      );
    }
  };

  // =====================================

  return (

    <div className="login-container">

      <div className="login-card">

        {/* TITLE */}

        <h1 className="logo">

          NutriHealth AI

        </h1>

        {/* SUBTITLE */}

        <p className="subtitle">

          Intelligent Nutritional
          Health System

        </p>

        {/* ERROR */}

        {error && (

          <p className="error">

            {error}

          </p>

        )}

        {/* INPUTS */}

        <div className="input-group">

          {/* USERNAME */}

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

          {/* PASSWORD */}

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

        {/* LOGIN BUTTON */}

        <button

          className="login-btn"

          onClick={handleLogin}

        >

          Login

        </button>

        {/* REGISTER LINK */}

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
import React, { useState } from "react";

import axios from "axios";

import { useNavigate } from "react-router-dom";

import "./Register.css";

function Register() {

  const navigate = useNavigate();

  // =====================================
  // STATE
  // =====================================

  const [data, setData] = useState({

    username: "",
    password: "",
    age: "",
    gender: 1

  });

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  // =====================================
  // REGISTER
  // =====================================

  const handleRegister = async () => {

    try {

      await axios.post(

        "http://localhost:5000/register",

        data

      );

      setMessage(
        "Registered Successfully"
      );

      setError("");

      setTimeout(() => {

        navigate("/login");

      }, 1500);

    }

    catch (err) {

      setError(
        "User already exists"
      );
    }
  };

  // =====================================

  return (

    <div className="register-container">

      <div className="register-card">

        {/* TITLE */}

        <h1 className="register-logo">

          NutriHealth AI

        </h1>

        {/* SUCCESS */}

        {message && (

          <p className="success">

            {message}

          </p>

        )}

        {/* ERROR */}

        {error && (

          <p className="error">

            {error}

          </p>

        )}

        {/* FORM */}

        <div className="register-group">

          {/* USERNAME */}

          <input

            type="text"

            placeholder="Username"

            autoComplete="off"

            value={data.username}

            onChange={(e) =>

              setData({

                ...data,

                username:
                e.target.value

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

                password:
                e.target.value

              })

            }

          />

          {/* AGE */}

          <input

            type="number"

            placeholder="Age"

            autoComplete="off"

            value={data.age}

            onChange={(e) =>

              setData({

                ...data,

                age:
                e.target.value

              })

            }

          />

          {/* GENDER */}

          <select

            value={data.gender}

            onChange={(e) =>

              setData({

                ...data,

                gender:
                Number(e.target.value)

              })

            }

          >

            <option value={1}>

              Male

            </option>

            <option value={2}>

              Female

            </option>

          </select>

        </div>

        {/* REGISTER BUTTON */}

        <button

          className="register-btn"

          onClick={handleRegister}

        >

          Create Account

        </button>

        {/* LOGIN TEXT */}

        <p className="register-text">

          Already have an account?

          <span

            className="login-link"

            onClick={() =>
              navigate("/login")
            }

          >

            Login

          </span>

        </p>

      </div>

    </div>

  );
}

export default Register;
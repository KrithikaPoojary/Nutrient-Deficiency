import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    password: "",
    age: "",
    conditions: ""
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/register", data);

      setMessage("Registered successfully ✅");
      setError("");

      setTimeout(() => {
        navigate("/");
      }, 1500);

    } catch (err) {
      setError("User already exists ❌");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2>Register</h2>

        {message && <p style={{ color: "green" }}>{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="input-group">
          <input
            placeholder="Username"
            onChange={(e) =>
              setData({ ...data, username: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            onChange={(e) =>
              setData({ ...data, password: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Age"
            onChange={(e) =>
              setData({ ...data, age: e.target.value })
            }
          />

          <input
            placeholder="Conditions (optional)"
            onChange={(e) =>
              setData({ ...data, conditions: e.target.value })
            }
          />
        </div>

        <button onClick={handleRegister}>
          Register
        </button>

        <p>Already have an account?</p>

        <button onClick={() => navigate("/")}>
          Back to Login
        </button>

      </div>
    </div>
  );
}

export default Register;
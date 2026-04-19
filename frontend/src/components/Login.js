import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setUser }) {
  const navigate = useNavigate();

  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", data);

      setUser(res.data);
      navigate("/home");

    } catch (err) {
      setError("Invalid username or password ❌");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h2>Member Login</h2>

        {error && <p className="error">{error}</p>}

        <div className="input-group">
          <input
            placeholder="Username"
            value={data.username}
            onChange={(e) =>
              setData({ ...data, username: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            value={data.password}
            onChange={(e) =>
              setData({ ...data, password: e.target.value })
            }
          />
        </div>

        <button onClick={handleLogin}>Login</button>

        <p className="register-text">
          Don't have an account?
        </p>

        <button onClick={() => navigate("/register")}>
          Register
        </button>

      </div>
    </div>
  );
}

export default Login;
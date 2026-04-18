import React, { useState } from "react";
import axios from "axios";

function Login({ setUser }) {
  const [data, setData] = useState({
    username: "",
    password: ""
  });

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/login", data);
      setUser(res.data.username);
      alert("Login successful 🔥");
    } catch (err) {
      alert("Invalid credentials ❌");
    }
  };

  const handleRegister = async () => {
    try {
      await axios.post("http://localhost:5000/register", data);
      alert("Registered successfully ✅");
    } catch (err) {
      alert("User already exists ❌");
    }
  };

return (
  <div className="login-card">
    <h2>Member Login</h2>

    <input
      placeholder="Username"
      onChange={(e) => setData({ ...data, username: e.target.value })}
    />

    <input
      type="password"
      placeholder="Password"
      onChange={(e) => setData({ ...data, password: e.target.value })}
    />

    <button onClick={handleLogin}>Login</button>

    <p className="register-text">
      Don't have an account?
    </p>

    <button className="register-btn" onClick={handleRegister}>
      Register
    </button>
  </div>
);
}

export default Login;
import React, { useState } from "react";
import Form from "./components/Form";
import Result from "./components/Result";
import Login from "./components/Login";
import History from "./components/History";
import "./App.css";

function App() {
  const [result, setResult] = useState(null);
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      <h1>🍎 Nutrition Deficiency Predictor</h1>

      {/* 🔐 LOGIN */}
      {!user ? (
        <Login setUser={setUser} />
      ) : (
        <div>

          {/* 🔥 TOP BAR (UPDATED) */}
          <div className="top-bar">
            <h3>Welcome, {user} 👋</h3>

            <button
              className="logout-btn"
              onClick={() => {
                setUser(null);
                setResult(null); // 🔥 reset
              }}
            >
              Logout 🔐
            </button>
          </div>

          {/* 🔥 MAIN CONTENT */}
          <Form setResult={setResult} user={user} />
          <Result result={result} />

          {/* 🔥 SHOW HISTORY ONLY AFTER RESULT */}
          {result && <History user={user} />}

        </div>
      )}
    </div>
  );
}

export default App;
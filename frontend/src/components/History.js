import React, { useEffect, useState } from "react";
import { getTrend } from "../api";

function History({ user }) {

  const [trend, setTrend] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTrend();

      // 🔥 AUTO REFRESH every 2 sec (VERY IMPORTANT)
      const interval = setInterval(fetchTrend, 2000);

      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchTrend = async () => {
    try {
      const data = await getTrend(user.username);
      setTrend(data);
      setLoading(false);
    } catch (err) {
      console.error("Trend fetch error:", err);
      setLoading(false);
    }
  };

  // 🔥 convert status to number (for bar)
  const statusScore = (status) => {
    switch (status) {
      case "Severe": return 100;
      case "Moderate": return 70;
      case "Mild": return 40;
      default: return 10;
    }
  };

  return (
    <div className="card">
      <h2>📈 Nutrient Trend</h2>

      {loading ? (
        <p>Loading...</p>
      ) : Object.keys(trend).length === 0 ? (
        <p>No history yet</p>
      ) : (
        Object.entries(trend)
          .reverse()   // 🔥 show latest first
          .map(([date, nutrients], index) => (
            <div key={index} className="trend-block">

              <h4>{new Date(date).toLocaleString()}</h4>

              {Object.entries(nutrients).map(([nutrient, status]) => (
                <div key={nutrient} className="trend-row">

                  <span>{nutrient}</span>

                  <div className="bar">
                    <div
                      className="fill"
                      style={{
                        width: `${statusScore(status)}%`,
                        background:
                          status === "Severe" ? "#e74c3c" :
                          status === "Moderate" ? "#f39c12" :
                          status === "Mild" ? "#f1c40f" :
                          "#2ecc71"
                      }}
                    ></div>
                  </div>

                  <span>{status}</span>

                </div>
              ))}

            </div>
          ))
      )}
    </div>
  );
}

export default History;
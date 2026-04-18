import React, { useEffect, useState } from "react";
import { getHistory } from "../api";

function History({ user }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      const res = await getHistory(user);
      setHistory(res);
    } catch (err) {
      console.error(err);
    }
  };

  if (!history || history.length <= 1) return null;

  const previousHistory = history.slice(1);

  // 🔥 FORMAT DATE
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // 🔥 COLOR CLASS
  const getClass = (status) => {
    if (status === "Normal") return "normal";
    if (status === "Moderate") return "moderate";
    return "severe";
  };

  return (
    <div className="card">
      <h2>📊 Previous Records</h2>

      {previousHistory.map((item, index) => (
        <div key={index} className="history-card">

          <p className="history-date">
            📅 {formatDate(item.date)}
          </p>

          <p><strong>BMI:</strong> {item.bmi}</p>

          <h4>🧪 Deficiency</h4>

          {item.results.map((res, i) => (
            <div key={i} className="history-item">

              <p className={getClass(res.status)}>
                ● {res.nutrient}: {res.status}
              </p>

              {res.status !== "Normal" && res.recommendations && (
                <ul className="rec-list">
                  {res.recommendations.split(",").map((food, j) => (
                    <li key={j}>→ {food.trim()}</li>
                  ))}
                </ul>
              )}

            </div>
          ))}

        </div>
      ))}
    </div>
  );
}

export default History;
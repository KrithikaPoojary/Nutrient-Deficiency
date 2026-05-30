import React, {

  useEffect,
  useState

} from "react";

import { getTrend } from "../api";

import "./History.css";

function History({ user }) {

  const [trend, setTrend] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  // =========================================
  // FETCH HISTORY
  // =========================================

  useEffect(() => {

    if (user) {

      fetchTrend();

      const interval =
        setInterval(

          fetchTrend,

          2000

        );

      return () =>
        clearInterval(interval);
    }

  }, [user]);

  // =========================================
  // API
  // =========================================

  const fetchTrend = async () => {

    try {

      const data =
        await getTrend(
          user.username
        );

      setTrend(data);

      setLoading(false);

    } catch (err) {

      console.error(
        "Trend fetch error:",
        err
      );

      setLoading(false);
    }
  };

  // =========================================
  // SCORE
  // =========================================

  const statusScore = (status) => {

    switch (status) {

      case "Severe":
        return 100;

      case "Moderate":
        return 70;

      case "Mild":
        return 40;

      default:
        return 10;
    }
  };

  // =========================================
  // COLOR
  // =========================================

  const getColor = (status) => {

    switch (status) {

      case "Severe":
        return "#ef4444";

      case "Moderate":
        return "#f59e0b";

      case "Mild":
        return "#3b82f6";

      default:
        return "#10b981";
    }
  };

  // =========================================
  // UI
  // =========================================

  return (

    <div className="history-page">

      <div className="history-container">

        <div className="history-header">

          <h1>
            📈 Nutrient Trend Analysis
          </h1>

          <p>
            Longitudinal Nutritional
            Monitoring Dashboard
          </p>

        </div>

        {loading ? (

          <div className="loading-box">
            Loading History...
          </div>

        ) : Object.keys(trend).length === 0 ? (

          <div className="empty-history">
            No History Available
          </div>

        ) : (

          <div className="history-grid">

            {Object.entries(trend)

              .reverse()

              .map(

                ([date, nutrients], index) => (

                  <div
                    key={index}
                    className="history-card"
                  >

                    {/* ========================================= */}
                    {/* DATE */}
                    {/* ========================================= */}

                    <div className="history-date">

                      {new Date(date)
                        .toLocaleString()}

                    </div>

                    {/* ========================================= */}
                    {/* NUTRIENTS */}
                    {/* ========================================= */}

                    {Object.entries(
                      nutrients
                    ).map(

                      ([nutrient, status]) => (

                        <div
                          key={nutrient}
                          className="trend-item"
                        >

                          <div className="trend-top">

                            <span className="nutrient-name">
                              {nutrient}
                            </span>

                            <span
                              className="status-text"
                              style={{
                                color:
                                  getColor(status)
                              }}
                            >
                              {status}
                            </span>

                          </div>

                          <div className="trend-bar">

                            <div
                              className="trend-fill"
                              style={{

                                width:
                                  `${statusScore(status)}%`,

                                background:
                                  getColor(status)

                              }}
                            ></div>

                          </div>

                        </div>

                      )

                    )}

                  </div>

                )

              )}

          </div>

        )}

      </div>

    </div>

  );
}

export default History;
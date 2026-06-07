import React, {

  useEffect,
  useState

} from "react";

import { getTrend } from "../api";

import "./History.css";

import {

  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer

} from "recharts";

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

          5000

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
  // SCORE (for nutrient bar width)
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
  // RISK LEVEL COLOR
  // =========================================

  const getRiskLevelColor = (level) => {

    switch (level) {

      case "High":
        return "#ef4444";

      case "Moderate":
        return "#f59e0b";

      default:
        return "#10b981";
    }
  };

  // =========================================
  // TREND MESSAGE (fallback if not in data)
  // =========================================

  const computeTrendMessage = (

    current,
    previous

  ) => {

    if (!previous)
      return "First Analysis";

    if (current < previous)
      return "✅ Health Improving";

    if (current > previous)
      return "⚠ Risk Increasing";

    return "➖ Stable";
  };

  // =========================================
  // SORTED DATES
  // =========================================

  const sortedEntries =
    Object.entries(trend)
    .reverse();

  // =========================================
  // CHART DATA
  // =========================================

  const chartData = sortedEntries.map(

    ([date, nutrients]) => ({

      date:
      new Date(date)
      .toLocaleDateString(),

      risk_score:
      nutrients.risk_score

    })

  );

  // =========================================
  // UI
  // =========================================

  return (

    <div className="history-page">

      <div className="history-container">

        {/* ========================================= */}
        {/* HEADER */}
        {/* ========================================= */}

        <div className="history-header">

          <h1>

            📈 Nutritional Trend Monitoring

          </h1>

          <p>

            Continuous AI-Based
            Longitudinal Health Tracking

          </p>

        </div>

        {/* ========================================= */}
        {/* LOADING */}
        {/* ========================================= */}

        {loading ? (

          <div className="loading-box">

            Loading History...

          </div>

        ) : Object.keys(trend).length === 0 ? (

          <div className="empty-history">

            No History Available

          </div>

        ) : (

          <>

            {/* ========================================= */}
            {/* ADVANCED RISK CHART */}
            {/* ========================================= */}

            <div className="chart-container">

              <h2>

                📊 Longitudinal Risk Analytics

              </h2>

              <ResponsiveContainer
                width="100%"
                height={350}
              >

                <LineChart data={chartData}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis dataKey="date" />

                  <YAxis />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="risk_score"
                    stroke="#06b6d4"
                    strokeWidth={4}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

            {/* ========================================= */}
            {/* OVERVIEW */}
            {/* ========================================= */}

            <div className="overview-grid">

              <div className="overview-card">

                <h3>Total Reports</h3>

                <p>{sortedEntries.length}</p>

              </div>

              <div className="overview-card">

                <h3>Latest Risk</h3>

                <p>

                  {

                    sortedEntries[0][1]
                    ?.risk_level ||

                    "Low Risk"

                  }

                </p>

              </div>

              <div className="overview-card">

                <h3>Monitoring Status</h3>

                <p>Active</p>

              </div>

            </div>

            {/* ========================================= */}
            {/* HISTORY GRID */}
            {/* ========================================= */}

            <div className="history-grid">

              {sortedEntries.map(

                (
                  [date, nutrients],
                  index
                ) => {

                  const currentScore =
                    nutrients.risk_score;

                  const previousScore =
                    sortedEntries[
                      index + 1
                    ]?.[1]
                    ?.risk_score;

                  // Use backend trend_message if present,
                  // otherwise compute from scores
                  const trendMsg =
                    nutrients.trend_message ||
                    computeTrendMessage(
                      currentScore,
                      previousScore
                    );

                  return (

                    <div
                      key={index}
                      className="history-card"
                    >

                      {/* ========================================= */}
                      {/* RISK SUMMARY — top of card */}
                      {/* ========================================= */}

                      <div className="risk-summary">

                        <div className="risk-summary-item">

                          <span className="risk-summary-label">
                            Risk Score
                          </span>

                          <span className="risk-summary-value">
                            {currentScore ?? "—"}
                          </span>

                        </div>

                        <div className="risk-summary-divider" />

                        <div className="risk-summary-item">

                          <span className="risk-summary-label">
                            Risk Level
                          </span>

                          <span
                            className="risk-summary-value"
                            style={{
                              color: getRiskLevelColor(
                                nutrients.risk_level
                              )
                            }}
                          >
                            {nutrients.risk_level ?? "—"}
                          </span>

                        </div>

                      </div>

                      {/* ========================================= */}
                      {/* DATE */}
                      {/* ========================================= */}

                      <div className="history-date">

                        {new Date(date)
                          .toLocaleString()}

                      </div>

                      {/* ========================================= */}
                      {/* TREND STATUS */}
                      {/* ========================================= */}

                      <div className="trend-message">

                        {trendMsg}

                      </div>

                      {/* ========================================= */}
                      {/* NUTRIENTS */}
                      {/* ========================================= */}

                      {Object.entries(nutrients)

                      .filter(([key]) =>
                        key !== "risk_score" &&
                        key !== "risk_level" &&
                        key !== "trend_message"
                      )

                      .map(([nutrient, status]) => (

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
                                  color: getColor(status)
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

                        ))

                      }

                    </div>

                  );
                }

              )}

            </div>
          </>

        )}

      </div>

    </div>

  );
}

export default History;
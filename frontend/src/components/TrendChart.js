import React from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function TrendChart({ data }) {

  if (!data || data.length === 0) {

    return (

      <div
        style={{
          textAlign: "center",
          padding: "20px"
        }}
      >
        No Trend Data Available
      </div>

    );

  }

  return (

    <div
      style={{
        width: "100%",
        height: "350px",
        marginTop: "20px"
      }}
    >

      <ResponsiveContainer>

        <LineChart data={data}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="date" />

          <YAxis domain={[0, 100]} />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="risk_score"
            stroke="#14b8a6"
            strokeWidth={3}
          />

        </LineChart>

      </ResponsiveContainer>

    </div>

  );

}

export default TrendChart;
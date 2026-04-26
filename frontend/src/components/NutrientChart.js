import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from "chart.js";
import { Bar } from "react-chartjs-2";

// 🔥 Register chart components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const NutrientChart = ({ nutrients, rda }) => {

  // ❌ Safety check
  if (!nutrients || !rda) return null;

  // 🔥 Labels
  const labels = Object.keys(nutrients);

  // 🔥 Data calculation (SAFE + CLEAN)
  const percentages = labels.map((key) => {
    const value = nutrients[key] || 0;
    const required = rda[key] || 1;

    return Math.min((value / required) * 100, 100);
  });

  // 🔥 Chart Data
  const data = {
    labels: labels,
    datasets: [
      {
        label: "Daily Intake (%)",
        data: percentages,

        // 🎨 Better colors (optional but nice)
        backgroundColor: [
          "#3498db",
          "#2ecc71",
          "#f39c12",
          "#e74c3c",
          "#9b59b6"
        ],
        borderRadius: 6
      }
    ]
  };

  // 🔥 Options
  const options = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: true,
        position: "top"
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.raw.toFixed(1)}%`;
          }
        }
      }
    },

    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => value + "%"
        }
      }
    }
  };

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "15px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 3px 10px rgba(0,0,0,0.05)"
      }}
    >
      <h3 style={{ marginBottom: "10px" }}>
        📊 Nutrient Intake (vs RDA)
      </h3>

      {/* 🔥 FIX HEIGHT */}
      <div style={{ height: "300px" }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default NutrientChart;
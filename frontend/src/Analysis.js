import React, { useState } from "react";

function Analysis() {
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState(null);

  const analyze = async () => {
  if (!userId || userId <= 0) {
    alert("Please enter a valid User ID (>= 1)");
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:5000/analysis/${userId}`
    );
    const data = await response.json();
    setResult(data);
  } catch (error) {
    console.error("Error:", error);
  }
};


  return (
    <div>
      <h2>Deficiency Analysis</h2>

      <input
        type="number"
        placeholder="Enter User ID"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />

      <button onClick={analyze}>Analyze</button>

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>Results</h3>

          <p><b>Predicted Severity:</b> {result.predicted_severity}</p>

          <h4>Nutrient Intake</h4>
          <pre>{JSON.stringify(result.nutrient_intake, null, 2)}</pre>

          <h4>Deficiency Status</h4>
          <pre>{JSON.stringify(result.deficiency_status, null, 2)}</pre>

          <h4>Personalized Recommendations</h4>
          <ul>
            {Object.values(result.personalized_recommendations).map(
              (rec, index) => (
                <li key={index}>{rec}</li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Analysis;

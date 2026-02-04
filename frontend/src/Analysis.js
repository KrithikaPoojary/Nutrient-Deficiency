import { useState } from "react";

function Analysis() {
  const [userId, setUserId] = useState("");
  const [result, setResult] = useState(null);

  const analyze = async () => {
    const res = await fetch(`http://127.0.0.1:5000/deficiency/${userId}`);
    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <h2>Deficiency Analysis</h2>

      <input
        placeholder="User ID"
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={analyze}>Analyze</button>

      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

export default Analysis;

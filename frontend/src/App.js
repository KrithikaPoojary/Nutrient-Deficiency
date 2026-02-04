import "./styles.css";
import Register from "./Register";
import FoodLog from "./FoodLog";
import Analysis from "./Analysis";

function App() {
  return (
    <div className="container">
      <h1>Nutrient Deficiency Monitoring System</h1>

      <div className="card">
        <Register />
      </div>

      <div className="card">
        <FoodLog />
      </div>

      <div className="card">
        <Analysis />
      </div>
    </div>
  );
}

export default App;

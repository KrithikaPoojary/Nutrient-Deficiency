import React, { useState, useEffect } from "react";
import { predict, getSuggestions } from "../api";

function Form({ setResult, setRecommendations, user }) {

  const [data, setData] = useState({
    height_cm: "",
    weight: "",
    bmi: "",
    conditions: ""
  });

  const [meals, setMeals] = useState({
    morning: [""],
    afternoon: [""],
    evening: [""],
    night: [""]
  });

  const [suggestions, setSuggestions] = useState({});
  const [activeField, setActiveField] = useState(null);

  // ==============================
  // AUTO BMI
  // ==============================

  useEffect(() => {
    if (data.height_cm && data.weight) {
      const h = Number(data.height_cm);
      const w = Number(data.weight);

      if (h > 0 && w > 0) {
        const bmi = (w / ((h / 100) ** 2)).toFixed(2);
        setData(prev => ({ ...prev, bmi }));
      }
    }
  }, [data.height_cm, data.weight]);

  // ==============================
  // HANDLE INPUT + SUGGESTIONS
  // ==============================

  const handleMealChange = async (mealType, index, value) => {
    const updated = { ...meals };
    updated[mealType][index] = value;
    setMeals(updated);

    const key = `${mealType}-${index}`;
    setActiveField(key);

    // 🔥 call suggestion API
    if (value.length > 1) {
      const res = await getSuggestions(value);
      setSuggestions(prev => ({ ...prev, [key]: res }));
    } else {
      setSuggestions(prev => ({ ...prev, [key]: [] }));
    }
  };

  const selectSuggestion = (mealType, index, value) => {
    const updated = { ...meals };
    updated[mealType][index] = value;
    setMeals(updated);

    const key = `${mealType}-${index}`;
    setSuggestions(prev => ({ ...prev, [key]: [] }));
  };

  const addMealField = (mealType) => {
    setMeals({
      ...meals,
      [mealType]: [...meals[mealType], ""]
    });
  };

  const removeMealField = (mealType, index) => {
    const updated = meals[mealType].filter((_, i) => i !== index);
    setMeals({ ...meals, [mealType]: updated });
  };

  // ==============================
  // PARSE FOOD
  // ==============================

  const parseFood = (input) => {
    if (!input) return [];

    return input
      .toLowerCase()
      .replace(/\(.*?\)/g, "")
      .replace(/[^a-z0-9,\- ]/g, "")
      .split(",")
      .map(item => {
        const parts = item.trim().split("-");
        return {
          name: parts[0]?.trim(),
          qty: Number(parts[1]) || 1
        };
      })
      .filter(f => f.name);
  };

  // ==============================
  // SUBMIT
  // ==============================

  const handleSubmit = async () => {

    if (!user) return alert("Login required ❌");
    if (!data.weight || !data.height_cm)
      return alert("Enter weight & height ❌");

    const allFoods = [
      ...meals.morning.flatMap(parseFood),
      ...meals.afternoon.flatMap(parseFood),
      ...meals.evening.flatMap(parseFood),
      ...meals.night.flatMap(parseFood)
    ];

    if (allFoods.length === 0)
      return alert("Enter valid food ❌");

    const payload = {
      user_id: user.id,
      age: user.age,
      gender: user.gender || 1,
      bmi: Number(data.bmi) || 22,
      conditions: data.conditions
        ? data.conditions.split(",").map(c => c.trim().toLowerCase())
        : [],
      foods: allFoods
    };

    try {
      const res = await predict(payload);
      setResult(res.results);
      setRecommendations(res.recommendations);
    } catch (err) {
      console.error(err);
      alert("Prediction failed ❌");
    }
  };

  // ==============================
  // UI
  // ==============================

  return (
    <div className="card">
      <h2>Enter Details</h2>

      <div className="form-grid">
        <input
          placeholder="Weight (kg)"
          value={data.weight}
          onChange={(e) => setData({ ...data, weight: e.target.value })}
        />

        <input
          placeholder="Height (cm)"
          value={data.height_cm}
          onChange={(e) => setData({ ...data, height_cm: e.target.value })}
        />

        <input
          placeholder="Health Conditions"
          value={data.conditions}
          onChange={(e) => setData({ ...data, conditions: e.target.value })}
        />

        <div className="bmi-box">
          BMI: {data.bmi || "Calculating..."}
        </div>
      </div>

      <h3>Food Intake</h3>

      {["morning", "afternoon", "evening", "night"].map((mealType) => (
        <div key={mealType}>
          <h4>{mealType}</h4>

          {meals[mealType].map((item, index) => {
            const key = `${mealType}-${index}`;

            return (
              <div key={index} className="row" style={{ position: "relative" }}>
                <input
                  value={item}
                  placeholder="rice-2,egg-1"
                  onChange={(e) =>
                    handleMealChange(mealType, index, e.target.value)
                  }
                />

                <button onClick={() => removeMealField(mealType, index)}>❌</button>

                {/* 🔥 DROPDOWN */}
                {suggestions[key]?.length > 0 && activeField === key && (
                  <div className="dropdown">
                    {suggestions[key].map((s, i) => (
                      <div
                        key={i}
                        className="dropdown-item"
                        onClick={() => selectSuggestion(mealType, index, s)}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button onClick={() => addMealField(mealType)}>➕ Add</button>
        </div>
      ))}

      <button onClick={handleSubmit}>Predict</button>
    </div>
  );
}

export default Form;
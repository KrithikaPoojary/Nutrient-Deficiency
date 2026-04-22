import React, { useState, useEffect } from "react";
import { predict } from "../api";

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

  // ✅ Auto-fill conditions
  useEffect(() => {
    if (user) {
      setData((prev) => ({
        ...prev,
        conditions: user.conditions || ""
      }));
    }
  }, [user]);

  // ✅ BMI calculation
  useEffect(() => {
    if (data.height_cm && data.weight) {
      const height = Number(data.height_cm);
      const weight = Number(data.weight);

      if (height > 0 && weight > 0) {
        const bmi = (
          weight / ((height / 100) * (height / 100))
        ).toFixed(2);

        setData((prev) => ({ ...prev, bmi }));
      }
    }
  }, [data.height_cm, data.weight]);

  // ==============================
  // MEAL HANDLERS
  // ==============================

  const handleMealChange = (mealType, index, value) => {
    const updated = { ...meals };
    updated[mealType][index] = value;
    setMeals(updated);
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
  // 🔥 STRONG PARSE FOOD FIX
  // ==============================

  const parseFood = (input) => {
    if (!input) return [];

    return input
      .toLowerCase()
      .replace(/\(.*?\)/g, "") // remove brackets
      .replace(/[^a-z0-9,\- ]/g, "") // clean text
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

    if (!user) {
      alert("Please login first ❌");
      return;
    }

    if (!data.weight || !data.height_cm) {
      alert("Enter weight and height ❌");
      return;
    }

    const allFoods = [
      ...meals.morning.flatMap(parseFood),
      ...meals.afternoon.flatMap(parseFood),
      ...meals.evening.flatMap(parseFood),
      ...meals.night.flatMap(parseFood)
    ];

    if (allFoods.length === 0) {
      alert("Enter valid food ❌");
      return;
    }

    const formattedData = {
      user_id: user.id,
      age: user.age,
      gender: user.gender || 1,
      bmi: Number(data.bmi) || 22,
      conditions: data.conditions
        ? data.conditions.split(",").map(c => c.trim().toLowerCase())
        : [],
      foods: allFoods
    };

    console.log("✅ Sending:", formattedData);

    try {
      const res = await predict(formattedData);

      setResult(res.results);
      setRecommendations(res.recommendations);

    } catch (err) {
      console.error("❌ ERROR:", err);
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
          onChange={(e) =>
            setData({ ...data, weight: e.target.value })
          }
        />

        <input
          placeholder="Height (cm)"
          value={data.height_cm}
          onChange={(e) =>
            setData({ ...data, height_cm: e.target.value })
          }
        />

        <input
          placeholder="Health Conditions"
          value={data.conditions}
          onChange={(e) =>
            setData({ ...data, conditions: e.target.value })
          }
        />

        <div className="bmi-box">
          BMI: {data.bmi || "Calculating..."}
        </div>

      </div>

      <h3>Food Intake</h3>

      {["morning", "afternoon", "evening", "night"].map((mealType) => (
        <div key={mealType}>
          <h4>{mealType}</h4>

          {meals[mealType].map((item, index) => (
            <div key={index} className="row">
              <input
                placeholder="rice-2,egg-1"
                value={item}
                onChange={(e) =>
                  handleMealChange(mealType, index, e.target.value)
                }
              />
              <button onClick={() => removeMealField(mealType, index)}>❌</button>
            </div>
          ))}

          <button onClick={() => addMealField(mealType)}>➕ Add</button>
        </div>
      ))}

      <button onClick={handleSubmit}>Predict</button>
    </div>
  );
}

export default Form;
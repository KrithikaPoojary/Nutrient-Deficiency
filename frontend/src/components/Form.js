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

  // 🔥 Auto-fill user conditions
  useEffect(() => {
    if (user) {
      setData((prev) => ({
        ...prev,
        conditions: user.conditions || ""
      }));
    }
  }, [user]);

  // 🔥 BMI calculation
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

  // 🔥 Meal handlers
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

  // 🔥 Parse food
  const parseFood = (input) =>
    input
      ? input.split(",").map(item => {
          const [name, qty] = item.split("-");
          return {
            name: name.trim().toLowerCase(),
            qty: Number(qty) || 1
          };
        })
      : [];

  // 🔥 SUBMIT
  const handleSubmit = async () => {

    if (!user) {
      alert("Please login first ❌");
      return;
    }

    if (!user.age) {
      alert("User profile missing age ❌");
      return;
    }

    if (!data.weight || !data.height_cm) {
      alert("Enter weight and height ❌");
      return;
    }

    // 🔥 Format meals
    const formattedMeals = {
      morning: meals.morning.flatMap(parseFood),
      afternoon: meals.afternoon.flatMap(parseFood),
      evening: meals.evening.flatMap(parseFood),
      night: meals.night.flatMap(parseFood)
    };

    const allFoods = [
      ...formattedMeals.morning,
      ...formattedMeals.afternoon,
      ...formattedMeals.evening,
      ...formattedMeals.night
    ];

    if (allFoods.length === 0) {
      alert("Enter at least one food ❌");
      return;
    }

    // 🔥 Conditions
    const conditionsArray = data.conditions
      ? data.conditions.split(",").map(c => c.trim().toLowerCase())
      : [];

    // ✅ FINAL PAYLOAD (FIXED)
    const formattedData = {
      user_id: user.id,   // 🔥 IMPORTANT FIX

      age: user.age,
      gender: user.gender || 1,
      bmi: Number(data.bmi),

      conditions: [
        ...(user.conditions
          ? user.conditions.split(",").map(c => c.trim().toLowerCase())
          : []),
        ...conditionsArray
      ],

      foods: allFoods
    };

    console.log("Sending:", formattedData);

    try {
      const res = await predict(formattedData);

      console.log("Response:", res);

      setResult(res.results);
      setRecommendations(res.recommendations);

      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
      });

    } catch (err) {
      console.error(err);
      alert("Prediction failed ❌");
    }
  };

  return (
    <div className="card">
      <h2>Enter Details</h2>

      {/* 🔥 ONE ROW */}
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
          placeholder="Health Conditions (optional)"
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
          <h4 style={{ textTransform: "capitalize" }}>{mealType}</h4>

          {meals[mealType].map((item, index) => (
            <div key={index} className="row">
              <input
                placeholder={`${mealType} food (rice-2,egg-1)`}
                value={item}
                onChange={(e) =>
                  handleMealChange(mealType, index, e.target.value)
                }
              />

              <button onClick={() => removeMealField(mealType, index)}>
                ❌
              </button>
            </div>
          ))}

          <button
            className="add-btn"
            onClick={() => addMealField(mealType)}
          >
            ➕ Add More
          </button>
        </div>
      ))}

      <button onClick={handleSubmit}>Predict</button>
    </div>
  );
}

export default Form;
import React, { useState, useEffect } from "react";
import { predict } from "../api";

function Form({ setResult, user }) {

  const [data, setData] = useState({
    age: "",
    gender: 1,
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

  // 🔥 BMI CALCULATION (ONLY CM)
  useEffect(() => {
    if (data.height_cm && data.weight) {
      const height = Number(data.height_cm);
      const weight = Number(data.weight);

      if (height > 0 && weight > 0) {
        const heightInMeters = height / 100;

        const bmi = (
          weight / (heightInMeters * heightInMeters)
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

  // 🔥 Convert food format
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

  const handleSubmit = async () => {

    if (!user) {
      alert("Please login first ❌");
      return;
    }

    if (!data.age || !data.weight || !data.height_cm) {
      alert("Enter Age, Weight and Height ❌");
      return;
    }

    // 🔥 VALIDATION
    if (data.height_cm < 100 || data.height_cm > 250) {
      alert("Enter valid height (100–250 cm) ❌");
      return;
    }

    if (data.weight < 20 || data.weight > 200) {
      alert("Enter valid weight ❌");
      return;
    }

    // 🔥 Convert meals → foods
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

    const formattedData = {
      username: user,
      age: Number(data.age),
      gender: data.gender,
      bmi: Number(data.bmi),
      conditions: data.conditions
        ? data.conditions.split(",").map(c => c.trim())
        : [],
      foods: allFoods
    };

    try {
      const res = await predict(formattedData);

      setResult(res);

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

      {/* AGE + WEIGHT */}
      <div className="row">
        <input
          placeholder="Age"
          type="number"
          onChange={(e) => setData({ ...data, age: e.target.value })}
        />

        <input
          placeholder="Weight (kg)"
          type="number"
          onChange={(e) => setData({ ...data, weight: e.target.value })}
        />
      </div>

      {/* HEIGHT */}
      <h3>Height</h3>
      <input
        placeholder="Height (cm)"
        type="number"
        onChange={(e) => setData({ ...data, height_cm: e.target.value })}
      />

      {/* BMI */}
      <p><strong>BMI:</strong> {data.bmi || "Calculating..."}</p>

      <input
        placeholder="Conditions (optional)"
        onChange={(e) => setData({ ...data, conditions: e.target.value })}
      />

      {/* FOOD */}
      <h3>Food Intake</h3>

      {["morning", "afternoon", "evening", "night"].map((mealType) => (
        <div key={mealType}>
          <h4 style={{ textTransform: "capitalize" }}>{mealType}</h4>

          {meals[mealType].map((item, index) => (
            <div key={index} className="row">
              <input
                placeholder={`${mealType} food (rice-2)`}
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
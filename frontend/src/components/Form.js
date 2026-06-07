import React, {
  useState,
  useEffect
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  predict,
  getSuggestions
} from "../api";

import "./Form.css";

function Form({
  setResult,
  setRecommendations,
  setFullResult,
  user
}) {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [data, setData] = useState({
    height_cm: "",
    weight: "",
    bmi: "",
    conditions: ""
  });

  const [symptoms, setSymptoms] = useState([]);
  const [otherSymptoms, setOtherSymptoms] = useState("");
  const [activity, setActivity] = useState("");
  const [sleepHours, setSleepHours] = useState("");
  const [waterIntake, setWaterIntake] = useState("");
  const [dietType, setDietType] = useState("");

  const [sunlightExposure, setSunlightExposure] = useState("");
  const [fruitIntake, setFruitIntake] = useState("");
  const [vegetableIntake, setVegetableIntake] = useState("");
  const [mealsPerDay, setMealsPerDay] = useState("");

  const [images, setImages] = useState({
    eye: null,
    nail: null,
    tongue: null
  });

  const defaultFood = {
    name: "",
    qty: "",
    unit: ""
  };

  const [meals, setMeals] = useState({
    morning: [{ ...defaultFood }],
    afternoon: [{ ...defaultFood }],
    evening: [{ ...defaultFood }],
    night: [{ ...defaultFood }]
  });

  const [suggestions, setSuggestions] = useState({});

  const foodUnits = [
    { value: "piece", label: "Piece" },
    { value: "bowl", label: "Bowl" },
    { value: "cup", label: "Cup" },
    { value: "glass", label: "Glass" },
    { value: "slice", label: "Slice" },
    { value: "plate", label: "Plate" },
    { value: "ml", label: "ML" },
    { value: "gram", label: "Gram" },
    { value: "packet", label: "Packet" },
    { value: "can", label: "Can" }
  ];

  // ── Symptom definitions ─────────────────────────────────────────────────────
  const SYMPTOM_OPTIONS = [
    { key: "fatigue",       label: "Fatigue" },
    { key: "hair_fall",     label: "Hair Fall" },
    { key: "weak_nails",    label: "Weak Nails" },
    { key: "dry_skin",      label: "Dry Skin" },
    { key: "mouth_ulcers",  label: "Mouth Ulcers" },
    { key: "muscle_pain",   label: "Muscle Pain" },
    { key: "brittle_bones", label: "Brittle Bones" },
    { key: "poor_vision",   label: "Poor Night Vision" },
    { key: "bleeding_gums", label: "Bleeding Gums" },
    { key: "numbness",      label: "Numbness / Tingling" },
    { key: "mood_swings",   label: "Mood Swings" },
    { key: "slow_healing",  label: "Slow Wound Healing" },
  ];

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

  const handleSymptomChange = (symptom) => {
    setSymptoms(prev =>
      prev.includes(symptom)
        ? prev.filter(item => item !== symptom)
        : [...prev, symptom]
    );
  };

  const handleFoodChange = async (mealType, index, field, value) => {
    const updated = { ...meals };
    updated[mealType][index][field] = value;
    setMeals(updated);

    if (field === "name") {
      const key = `${mealType}-${index}`;
      if (value.length > 1) {
        try {
          const res = await getSuggestions(value);
          setSuggestions(prev => ({
            ...prev,
            [key]: Array.isArray(res) ? res : []
          }));
        } catch (err) {
          console.error(err);
        }
      } else {
        setSuggestions(prev => ({ ...prev, [key]: [] }));
      }
    }
  };

  const selectSuggestion = (mealType, index, selected) => {
    const key = `${mealType}-${index}`;
    const updated = { ...meals };
    updated[mealType][index].name = selected;
    setMeals(updated);
    setSuggestions(prev => ({ ...prev, [key]: [] }));
  };

  const addMealField = (mealType) => {
    setMeals({
      ...meals,
      [mealType]: [...meals[mealType], { ...defaultFood }]
    });
  };

  const removeMealField = (mealType, index) => {
    const updated = meals[mealType].filter((_, i) => i !== index);
    setMeals({ ...meals, [mealType]: updated });
  };

  const parseFood = (food) => {
    if (!food.name || !food.qty || !food.unit) return null;
    return {
      name: food.name.trim().toLowerCase(),
      qty: Number(food.qty),
      unit: food.unit
    };
  };

  const handleImageUpload = (type, file) => {
    setImages({ ...images, [type]: file });
  };

  const handleSubmit = async () => {
    if (!user) return alert("Login required");

    const allFoods = [
      ...meals.morning.map(parseFood),
      ...meals.afternoon.map(parseFood),
      ...meals.evening.map(parseFood),
      ...meals.night.map(parseFood)
    ].filter(Boolean);

    const allSymptoms = [
      ...symptoms,
      ...otherSymptoms.split(",").map(s => s.trim()).filter(Boolean)
    ];

    const formData = new FormData();
    formData.append("user_id", user.id);
    formData.append("age", user.age);
    formData.append("gender", user.gender || 1);
    formData.append("bmi", Number(data.bmi) || 22);
    formData.append("height", data.height_cm);
    formData.append("weight", data.weight);
    formData.append("activity", activity);
    formData.append("sleep_hours", sleepHours);
    formData.append("water_intake", waterIntake);
    formData.append("diet_type", dietType);
    formData.append("sunlight_exposure", sunlightExposure);
    formData.append("fruit_intake", fruitIntake);
    formData.append("vegetable_intake", vegetableIntake);
    formData.append("meals_per_day", mealsPerDay);
    formData.append("foods", JSON.stringify(allFoods));
    formData.append(
      "conditions",
      JSON.stringify(
        data.conditions
          ? data.conditions.split(",").map(c => c.trim().toLowerCase())
          : []
      )
    );
    formData.append("symptoms", JSON.stringify(allSymptoms));

    if (images.eye) formData.append("eye", images.eye);
    if (images.nail) formData.append("nail", images.nail);
    if (images.tongue) formData.append("tongue", images.tongue);

    try {
      const res = await predict(formData);
      setResult(res.results);
      setRecommendations(res.recommendations);
      setFullResult(res);
      navigate("/result");
    } catch (err) {
      console.error(err);
      alert("Prediction failed");
    }
  };

  return (
    <div className="card">

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <>
          <div className="step-title">Step 1 of 3</div>
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
              placeholder="Health Conditions (comma-separated)"
              value={data.conditions}
              onChange={(e) => setData({ ...data, conditions: e.target.value })}
            />
            <div className="bmi-box">
              BMI: {data.bmi || "Calculating..."}
            </div>
          </div>

          {/* LIFESTYLE GRID */}
          <div className="lifestyle-grid">
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="">Physical Activity</option>
              <option value="Sedentary">Sedentary</option>
              <option value="Moderate">Moderate</option>
              <option value="Active">Active</option>
            </select>

            <input
              placeholder="Sleep Hours"
              type="number"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
            />

            <input
              placeholder="Water Intake (Liters)"
              type="number"
              step="0.5"
              value={waterIntake}
              onChange={(e) => setWaterIntake(e.target.value)}
            />

            <select value={dietType} onChange={(e) => setDietType(e.target.value)}>
              <option value="">Diet Type</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
            </select>

            <select value={sunlightExposure} onChange={(e) => setSunlightExposure(e.target.value)}>
              <option value="">Sunlight Exposure</option>
              <option value="None">None</option>
              <option value="Low">Low (less than 15 min)</option>
              <option value="Moderate">Moderate (15–30 min)</option>
              <option value="High">High (more than 30 min)</option>
            </select>

            <select value={fruitIntake} onChange={(e) => setFruitIntake(e.target.value)}>
              <option value="">Fruit Intake (per day)</option>
              <option value="None">None</option>
              <option value="Low">Low (1 serving)</option>
              <option value="Moderate">Moderate (2–3 servings)</option>
              <option value="High">High (4+ servings)</option>
            </select>

            <select value={vegetableIntake} onChange={(e) => setVegetableIntake(e.target.value)}>
              <option value="">Vegetable Intake (per day)</option>
              <option value="None">None</option>
              <option value="Low">Low (1 serving)</option>
              <option value="Moderate">Moderate (2–3 servings)</option>
              <option value="High">High (4+ servings)</option>
            </select>

            <input
              placeholder="Meals Per Day"
              type="number"
              min="1"
              max="10"
              value={mealsPerDay}
              onChange={(e) => setMealsPerDay(e.target.value)}
            />
          </div>

          {/* ── SYMPTOMS ── */}
          <h3 className="section-label">Symptoms</h3>
          <p className="section-hint">Select all that apply</p>

          <div className="symptom-grid">
            {SYMPTOM_OPTIONS.map(({ key, label }) => (
              <label
                key={key}
                className={`symptom-chip ${symptoms.includes(key) ? "selected" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={symptoms.includes(key)}
                  onChange={() => handleSymptomChange(key)}
                />
                {label}
              </label>
            ))}
          </div>

          <input
            className="other-symptoms-input"
            placeholder="Other symptoms (comma-separated, e.g. joint pain, dizziness)"
            value={otherSymptoms}
            onChange={(e) => setOtherSymptoms(e.target.value)}
          />

          <button className="next-btn" onClick={() => setStep(2)}>
            Next
          </button>
        </>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <>
          <div className="step-title">Step 2 of 3</div>
          <h2>Upload Images</h2>

          <div className="image-upload-grid">
            {["eye", "nail", "tongue"].map((type) => (
              <div key={type} className="upload-box">
                <label>
                  {type.charAt(0).toUpperCase() + type.slice(1)} Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(type, e.target.files[0])}
                />
              </div>
            ))}
          </div>

          <div className="step-buttons">
            <button className="back-btn" onClick={() => setStep(1)}>Back</button>
            <button className="next-btn" onClick={() => setStep(3)}>Next</button>
          </div>
        </>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <>
          <div className="step-title">Step 3 of 3</div>
          <h2>Food Intake Tracking</h2>

          {["morning", "afternoon", "evening", "night"].map((mealType) => (
            <div key={mealType} className="meal-card">
              <h4>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h4>

              {meals[mealType].map((item, index) => {
                const key = `${mealType}-${index}`;
                return (
                  <div key={index} className="food-row">

                    <div className="food-input-box">
                      <input
                        value={item.name}
                        placeholder="Search Food"
                        onChange={(e) =>
                          handleFoodChange(mealType, index, "name", e.target.value)
                        }
                      />
                      {suggestions[key]?.length > 0 && (
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

                    <input
                      type="number"
                      className="qty-input"
                      min="1"
                      placeholder="Qty"
                      value={item.qty}
                      onChange={(e) =>
                        handleFoodChange(mealType, index, "qty", e.target.value)
                      }
                    />

                    <div className="unit-box">
                      <select
                        className="unit-select"
                        value={item.unit}
                        onChange={(e) =>
                          handleFoodChange(mealType, index, "unit", e.target.value)
                        }
                      >
                        <option value="">Unit</option>
                        {foodUnits.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {unit.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => removeMealField(mealType, index)}
                    >
                      Remove
                    </button>

                  </div>
                );
              })}

              <button
                type="button"
                className="add-btn"
                onClick={() => addMealField(mealType)}
              >
                Add Food
              </button>
            </div>
          ))}

          <div className="step-buttons">
            <button className="back-btn" onClick={() => setStep(2)}>Back</button>
            <button
              type="button"
              className="predict-btn"
              onClick={handleSubmit}
            >
              Predict Nutritional Risk
            </button>
          </div>
        </>
      )}

    </div>
  );
}

export default Form;
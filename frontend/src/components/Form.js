import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import {
  predict,
  getSuggestions
} from "../api";

function Form({

  setResult,
  setRecommendations,
  setFullResult,
  user

}) {

  const navigate = useNavigate();

  // =====================================
  // USER DETAILS
  // =====================================

  const [data, setData] = useState({

    height_cm: "",
    weight: "",
    bmi: "",
    conditions: ""

  });

  // =====================================
  // IMAGE UPLOADS
  // =====================================

  const [images, setImages] = useState({

    eye: null,
    nail: null,
    tongue: null

  });

  // =====================================
  // FOOD MEALS
  // =====================================

  const [meals, setMeals] = useState({

    morning: [""],
    afternoon: [""],
    evening: [""],
    night: [""]

  });

  // =====================================
  // SUGGESTIONS
  // =====================================

  const [suggestions, setSuggestions] =
    useState({});

  // =====================================
  // BMI AUTO CALCULATION
  // =====================================

  useEffect(() => {

    if (
      data.height_cm &&
      data.weight
    ) {

      const h =
        Number(data.height_cm);

      const w =
        Number(data.weight);

      if (h > 0 && w > 0) {

        const bmi = (

          w /
          ((h / 100) ** 2)

        ).toFixed(2);

        setData(prev => ({

          ...prev,

          bmi

        }));

      }

    }

  }, [

    data.height_cm,
    data.weight

  ]);

  // =====================================
  // GET LAST WORD
  // =====================================

  const getLastWord = (value) => {

    const parts =
      value.split(",");

    return parts[
      parts.length - 1
    ].trim();

  };

  // =====================================
  // FOOD INPUT
  // =====================================

  const handleMealChange = async (

    mealType,
    index,
    value

  ) => {

    const updated = {

      ...meals

    };

    updated[
      mealType
    ][index] = value;

    setMeals(updated);

    const key =
      `${mealType}-${index}`;

    const lastWord =
      getLastWord(value);

    if (lastWord.length > 1) {

      try {

        const res =
          await getSuggestions(
            lastWord
          );

        setSuggestions(prev => ({

          ...prev,

          [key]:

            Array.isArray(res)
              ? res
              : []

        }));

      }

      catch (err) {

        console.error(err);

      }

    }

    else {

      setSuggestions(prev => ({

        ...prev,

        [key]: []

      }));

    }

  };

  // =====================================
  // SELECT SUGGESTION
  // =====================================

  const selectSuggestion = (

    mealType,
    index,
    selected

  ) => {

    const key =
      `${mealType}-${index}`;

    const current =
      meals[mealType][index];

    const parts =
      current.split(",");

    parts[
      parts.length - 1
    ] = " " + selected;

    const updatedValue =
      parts.join(",");

    const updated = {

      ...meals

    };

    updated[
      mealType
    ][index] = updatedValue;

    setMeals(updated);

    setSuggestions(prev => ({

      ...prev,

      [key]: []

    }));

  };

  // =====================================
  // ADD FOOD FIELD
  // =====================================

  const addMealField = (

    mealType

  ) => {

    setMeals({

      ...meals,

      [mealType]: [

        ...meals[mealType],
        ""

      ]

    });

  };

  // =====================================
  // REMOVE FOOD FIELD
  // =====================================

  const removeMealField = (

    mealType,
    index

  ) => {

    const updated =

      meals[mealType].filter(

        (_, i) => i !== index

      );

    setMeals({

      ...meals,

      [mealType]: updated

    });

  };

  // =====================================
  // PARSE FOOD
  // =====================================

  const parseFood = (input) => {

    if (!input) return [];

    return input

      .toLowerCase()

      .replace(/\(.*?\)/g, "")

      .replace(

        /[^a-z0-9,\- ]/g,
        ""

      )

      .split(",")

      .map(item => {

        const parts =

          item.trim().split("-");

        return {

          name:
            parts[0]?.trim(),

          qty:
            Number(parts[1]) || 1

        };

      })

      .filter(f => f.name);

  };

  // =====================================
  // IMAGE CHANGE
  // =====================================

  const handleImageUpload = (

    type,
    file

  ) => {

    setImages({

      ...images,

      [type]: file

    });

  };

  // =====================================
  // SUBMIT
  // =====================================

  const handleSubmit = async () => {

    if (!user) {

      return alert(
        "Login required ❌"
      );

    }

    if (

      !data.weight ||
      !data.height_cm

    ) {

      return alert(
        "Enter weight & height ❌"
      );

    }

    // =====================================
    // PARSE ALL FOODS
    // =====================================

    const allFoods = [

      ...meals.morning.flatMap(
        parseFood
      ),

      ...meals.afternoon.flatMap(
        parseFood
      ),

      ...meals.evening.flatMap(
        parseFood
      ),

      ...meals.night.flatMap(
        parseFood
      )

    ];

    if (allFoods.length === 0) {

      return alert(
        "Enter valid food ❌"
      );

    }

    // =====================================
    // CREATE FORMDATA
    // =====================================

    const formData = new FormData();

    formData.append(
      "user_id",
      user.id
    );

    formData.append(
      "age",
      user.age
    );

    formData.append(
      "gender",
      user.gender || 1
    );

    formData.append(
      "bmi",
      Number(data.bmi) || 22
    );

    formData.append(

      "foods",

      JSON.stringify(allFoods)

    );

    formData.append(

      "conditions",

      JSON.stringify(

        data.conditions

          ? data.conditions

              .split(",")

              .map(c =>

                c.trim()
                 .toLowerCase()

              )

          : []

      )

    );

    // =====================================
    // IMAGE FILES
    // =====================================

    if (images.eye) {

      formData.append(
        "eye",
        images.eye
      );

    }

    if (images.nail) {

      formData.append(
        "nail",
        images.nail
      );

    }

    if (images.tongue) {

      formData.append(
        "tongue",
        images.tongue
      );

    }

    try {

      const res =
        await predict(formData);

      // =====================================
      // SAVE RESULT
      // =====================================

      setResult(
        res.results
      );

      setRecommendations(
        res.recommendations
      );

      setFullResult(res);

      // =====================================
      // NAVIGATE
      // =====================================

      navigate("/result");

    }

    catch (err) {

      console.error(err);

      alert(
        "Prediction failed ❌"
      );

    }

  };

  // =====================================
  // UI
  // =====================================

  return (

    <div className="card">

      {/* TITLE */}

      <h2>

        Enter Details

      </h2>

      {/* ===================================== */}
      {/* USER DETAILS */}
      {/* ===================================== */}

      <div className="form-grid">

        <input

          placeholder="Weight (kg)"

          value={data.weight}

          onChange={(e) =>

            setData({

              ...data,

              weight:
                e.target.value

            })

          }

        />

        <input

          placeholder="Height (cm)"

          value={data.height_cm}

          onChange={(e) =>

            setData({

              ...data,

              height_cm:
                e.target.value

            })

          }

        />

        <input

          placeholder="Health Conditions"

          value={data.conditions}

          onChange={(e) =>

            setData({

              ...data,

              conditions:
                e.target.value

            })

          }

        />

        <div className="bmi-box">

          BMI:
          {" "}

          {
            data.bmi ||
            "Calculating..."
          }

        </div>

      </div>

      {/* ===================================== */}
      {/* IMAGE SECTION */}
      {/* ===================================== */}

      <div className="image-section">

        <h3>

          Medical Image Analysis

        </h3>

        <div className="image-upload-grid">

          {/* EYE */}

          <div className="upload-box">

            <label>

              Upload Eye Image

            </label>

            <input

              type="file"

              accept="image/*"

              onChange={(e) =>

                handleImageUpload(

                  "eye",

                  e.target.files[0]

                )

              }

            />

          </div>

          {/* NAIL */}

          <div className="upload-box">

            <label>

              Upload Nail Image

            </label>

            <input

              type="file"

              accept="image/*"

              onChange={(e) =>

                handleImageUpload(

                  "nail",

                  e.target.files[0]

                )

              }

            />

          </div>

          {/* TONGUE */}

          <div className="upload-box">

            <label>

              Upload Tongue Image

            </label>

            <input

              type="file"

              accept="image/*"

              onChange={(e) =>

                handleImageUpload(

                  "tongue",

                  e.target.files[0]

                )

              }

            />

          </div>

        </div>

      </div>

      {/* ===================================== */}
      {/* FOOD SECTION */}
      {/* ===================================== */}

      <h3 className="food-title">

        Food Intake Tracking

      </h3>

      {

        [

          "morning",
          "afternoon",
          "evening",
          "night"

        ].map((mealType) => (

          <div

            key={mealType}

            className="meal-card"

          >

            <h4>

              {

                mealType.charAt(0)
                .toUpperCase()

                +

                mealType.slice(1)

              }

            </h4>

            {

              meals[mealType].map(

                (item, index) => {

                  const key =

                    `${mealType}-${index}`;

                  return (

                    <div

                      key={index}

                      className="row"

                      style={{
                        position:
                        "relative"
                      }}

                    >

                      <input

                        value={item}

                        placeholder="rice-2,egg-1"

                        onChange={(e) =>

                          handleMealChange(

                            mealType,
                            index,
                            e.target.value

                          )

                        }

                      />

                      <button

                        type="button"

                        className="remove-btn"

                        onClick={() =>

                          removeMealField(

                            mealType,
                            index

                          )

                        }

                      >

                        ❌

                      </button>

                      {

                        suggestions[key]
                        ?.length > 0 && (

                          <div className="dropdown">

                            {

                              suggestions[key]
                              .map((s, i) => (

                                <div

                                  key={i}

                                  className="dropdown-item"

                                  onClick={() =>

                                    selectSuggestion(

                                      mealType,
                                      index,
                                      s

                                    )

                                  }

                                >

                                  {s}

                                </div>

                              ))

                            }

                          </div>

                        )

                      }

                    </div>

                  );

                }

              )

            }

            <button

              type="button"

              className="add-btn"

              onClick={() =>

                addMealField(
                  mealType
                )

              }

            >

              ➕ Add Food

            </button>

          </div>

        ))

      }

      {/* ===================================== */}
      {/* PREDICT */}
      {/* ===================================== */}

      <button

        type="button"

        className="predict-btn"

        onClick={handleSubmit}

      >

        Predict Nutritional Risk

      </button>

    </div>

  );

}

export default Form;
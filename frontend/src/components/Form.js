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

  // =====================================
  // STEP
  // =====================================

  const [step, setStep] =
    useState(1);

  // =====================================
  // USER DETAILS
  // =====================================

  const [data, setData] =
    useState({

      height_cm: "",
      weight: "",
      bmi: "",
      conditions: ""

    });

  // =====================================
  // SYMPTOMS
  // =====================================

  const [symptoms, setSymptoms] =
    useState([]);

  const [otherSymptoms,
    setOtherSymptoms] =
    useState("");

  // =====================================
  // IMAGES
  // =====================================

  const [images, setImages] =
    useState({

      eye: null,
      nail: null,
      tongue: null

    });

  // =====================================
  // FOOD
  // =====================================

  const defaultFood = {

    name: "",
    qty: "",
    unit: ""

  };

  const [meals, setMeals] =
    useState({

      morning: [{ ...defaultFood }],
      afternoon: [{ ...defaultFood }],
      evening: [{ ...defaultFood }],
      night: [{ ...defaultFood }]

    });

  // =====================================
  // SUGGESTIONS
  // =====================================

  const [suggestions,
    setSuggestions] =
    useState({});

  // =====================================
  // FOOD UNITS
  // =====================================

  const foodUnits = [

    {
      value: "piece",
      label: "Piece"
    },

    {
      value: "bowl",
      label: "Bowl"
    },

    {
      value: "cup",
      label: "Cup"
    },

    {
      value: "glass",
      label: "Glass"
    },

    {
      value: "slice",
      label: "Slice"
    },

    {
      value: "plate",
      label: "Plate"
    },

    {
      value: "ml",
      label: "ML"
    },

    {
      value: "gram",
      label: "Gram"
    },

    {
      value: "packet",
      label: "Packet"
    },

    {
      value: "can",
      label: "Can"
    }

  ];

  // =====================================
  // BMI
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
  // SYMPTOMS
  // =====================================

  const handleSymptomChange =
    (symptom) => {

      if (
        symptoms.includes(symptom)
      ) {

        setSymptoms(

          symptoms.filter(

            item =>
              item !== symptom

          )

        );

      }

      else {

        setSymptoms([

          ...symptoms,
          symptom

        ]);

      }

    };

  // =====================================
  // FOOD CHANGE
  // =====================================

  const handleFoodChange =
    async (

      mealType,
      index,
      field,
      value

    ) => {

      const updated = {
        ...meals
      };

      updated[
        mealType
      ][index][field] = value;

      setMeals(updated);

      // SUGGESTIONS

      if (field === "name") {

        const key =
          `${mealType}-${index}`;

        if (value.length > 1) {

          try {

            const res =
              await getSuggestions(
                value
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

      }

    };

  // =====================================
  // SELECT FOOD
  // =====================================

  const selectSuggestion = (

    mealType,
    index,
    selected

  ) => {

    const key =
      `${mealType}-${index}`;

    const updated = {
      ...meals
    };

    updated[
      mealType
    ][index].name = selected;

    setMeals(updated);

    setSuggestions(prev => ({

      ...prev,

      [key]: []

    }));

  };

  // =====================================
  // ADD FOOD
  // =====================================

  const addMealField =
    (mealType) => {

      setMeals({

        ...meals,

        [mealType]: [

          ...meals[mealType],

          {
            ...defaultFood
          }

        ]

      });

    };

  // =====================================
  // REMOVE FOOD
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

  const parseFood = (food) => {

    if (

      !food.name ||
      !food.qty ||
      !food.unit

    ) {

      return null;

    }

    return {

      name:
        food.name
          .trim()
          .toLowerCase(),

      qty:
        Number(food.qty),

      unit:
        food.unit

    };

  };

  // =====================================
  // IMAGE
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

  const handleSubmit =
    async () => {

      if (!user) {

        return alert(
          "Login required"
        );

      }

      const allFoods = [

        ...meals.morning
          .map(parseFood),

        ...meals.afternoon
          .map(parseFood),

        ...meals.evening
          .map(parseFood),

        ...meals.night
          .map(parseFood)

      ].filter(Boolean);

      const allSymptoms = [

        ...symptoms,

        ...otherSymptoms
          .split(",")
          .map(s => s.trim())
          .filter(Boolean)

      ];

      const formData =
        new FormData();

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

      formData.append(

        "symptoms",

        JSON.stringify(
          allSymptoms
        )

      );

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

        setResult(
          res.results
        );

        setRecommendations(
          res.recommendations
        );

        setFullResult(res);

        navigate("/result");

      }

      catch (err) {

        console.error(err);

        alert(
          "Prediction failed"
        );

      }

    };

  return (

    <div className="card">

      {/* STEP 1 */}

      {

        step === 1 && (

          <>

            <div className="step-title">

              Step 1 of 3

            </div>

            <h2>

              Enter Details

            </h2>

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

            <button

              className="next-btn"

              onClick={() =>
                setStep(2)
              }

            >

              Next

            </button>

          </>

        )

      }

      {/* STEP 2 */}

      {

        step === 2 && (

          <>

            <div className="step-title">

              Step 2 of 3

            </div>

            <h2>

              Upload Images

            </h2>

            <div className="image-upload-grid">

              {

                [

                  "eye",
                  "nail",
                  "tongue"

                ].map((type) => (

                  <div
                    key={type}
                    className="upload-box"
                  >

                    <label>

                      {

                        type.charAt(0)
                        .toUpperCase()

                        +

                        type.slice(1)

                      }

                      {" "}
                      Image

                    </label>

                    <input

                      type="file"

                      accept="image/*"

                      onChange={(e) =>

                        handleImageUpload(

                          type,

                          e.target.files[0]

                        )

                      }

                    />

                  </div>

                ))

              }

            </div>

            <div className="step-buttons">

              <button

                className="back-btn"

                onClick={() =>
                  setStep(1)
                }

              >

                Back

              </button>

              <button

                className="next-btn"

                onClick={() =>
                  setStep(3)
                }

              >

                Next

              </button>

            </div>

          </>

        )

      }

      {/* STEP 3 */}

      {

        step === 3 && (

          <>

            <div className="step-title">

              Step 3 of 3

            </div>

            <h2>

              Food Intake Tracking

            </h2>

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

                      (
                        item,
                        index
                      ) => {

                        const key =

                          `${mealType}-${index}`;

                        return (

                          <div
                            key={index}
                            className="food-row"
                          >

                            {/* FOOD */}

                            <div className="food-input-box">

                              <input

                                value={item.name}

                                placeholder="Search Food"

                                onChange={(e) =>

                                  handleFoodChange(

                                    mealType,
                                    index,
                                    "name",
                                    e.target.value

                                  )

                                }

                              />

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

                            {/* QTY */}

                            <input

                              type="number"

                              className="qty-input"

                              min="1"

                              placeholder="Qty"

                              value={item.qty}

                              onChange={(e) =>

                                handleFoodChange(

                                  mealType,
                                  index,
                                  "qty",
                                  e.target.value

                                )

                              }

                            />

                            {/* UNIT */}

                            <div className="unit-box">

                              <select

                                className="unit-select"

                                value={item.unit}

                                onChange={(e) =>

                                  handleFoodChange(

                                    mealType,
                                    index,
                                    "unit",
                                    e.target.value

                                  )

                                }

                              >

                                <option value="">

                                  Unit

                                </option>

                                {

                                  foodUnits.map(

                                    (unit) => (

                                      <option
                                        key={unit.value}
                                        value={unit.value}
                                      >

                                        {unit.label}

                                      </option>

                                    )

                                  )

                                }

                              </select>

                            </div>

                            {/* REMOVE */}

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

                              Remove

                            </button>

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

                    Add Food

                  </button>

                </div>

              ))

            }

            <div className="step-buttons">

              <button

                className="back-btn"

                onClick={() =>
                  setStep(2)
                }

              >

                Back

              </button>

              <button

                type="button"

                className="predict-btn"

                onClick={handleSubmit}

              >

                Predict Nutritional Risk

              </button>

            </div>

          </>

        )

      }

    </div>

  );

}

export default Form;